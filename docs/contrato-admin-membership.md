****# Contrato de API — Membresía, Usuarios y Unidades

> **Base URL:** `https://<host>/api`
> **Autenticación:** Bearer token Auth0 en el header `Authorization` de todos los endpoints.

---

## 1. Bajar membresía a Free

Revoca la suscripción premium de un usuario y la regresa al plan free.

```
PATCH /api/suscripcion/usuario/:usuarioId/**revocar**
```

**Rol requerido:** `Admin`

**Path params**

| Param | Tipo | Descripción |
|---|---|---|
| `usuarioId` | `string (uuid)` | ID del usuario en la base de datos |

**Body (opcional)**

```json
{
  "motivo": "string"
}
```

| Campo | Tipo | Default | Descripción |
|---|---|---|---|
| `motivo` | `string` | `"Suscripción revocada por el administrador"` | Texto informativo que se emite por WebSocket al usuario |

**Respuesta 200**

```json
{
  "message": "Suscripción de usuario@email.com revocada → plan free",
  "data": {
    "id": "uuid",
    "usuarioId": "uuid",
    "plan": "free",
    "activa": true,
    "fechaInicio": "2026-01-01T00:00:00.000Z",
    "fechaFin": "2026-04-06T00:00:00.000Z",
    "usuario": {
      "nombre": "string",
      "email": "string"
    }
  }
}
```

**Errores**

| Status | Condición |
|---|---|
| `400` | El usuario ya tiene plan free |
| `404` | No existe suscripción para ese usuario |
| `500` | Error interno |

**Efecto colateral:** emite evento WebSocket `suscripcion:revocada` al usuario afectado para que el frontend fuerce el refresco del plan.

---

## 2. Eliminar usuario

Elimina un usuario completamente: todos sus datos en la base de datos y su cuenta en Auth0.

```
DELETE /api/usuario/:id
```

**Rol requerido:** token válido (la ruta está protegida con `verifyToken`). Se recomienda llamar solo desde el panel de admin.

**Path params**

| Param | Tipo | Descripción |
|---|---|---|
| `id` | `string (uuid)` | ID del usuario |

**Body:** ninguno

**Orden de eliminación (transacción atómica)**

1. `FichaAplicacion` del usuario y de sus sesiones
2. `SesionEnfoqueTransversal` de sus sesiones
3. Rompe FK `sesionOrigenId` en clones de otros usuarios
4. Rompe FK `sesionOrigenId` en sesiones propias
5. `Sesion` del usuario
6. Desvincula `unidadId` en sesiones de otros usuarios que apuntan a sus unidades
7. Desvincula `unidadId` en `PagoUnidad` (preserva historial)
8. `Unidad` del usuario (cascade: `UnidadMiembro` → `UnidadMiembroArea`)
9. `UnidadMiembro` en unidades ajenas donde era suscriptor
10. `PagoUnidad` propios
11. `Pago` + `Suscripcion`
12. Desvincula `creadaPorId` en `Problematica` personalizadas
13. `Usuario` (cascade: `Aula` → `Alumno`, `NovedadLeida`, `UsuarioGradoArea`)
14. Elimina usuario de Auth0 *(best-effort — si falla solo se loguea warning, la DB ya quedó limpia)*

**Respuesta 200**

```json
{
  "message": "Usuario eliminado exitosamente",
  "data": {
    "id": "uuid",
    "nombre": "string",
    "email": "string"
  }
}
```

**Errores**

| Status | Condición |
|---|---|
| `404` | Usuario no encontrado |
| `500` | Error interno |

---

## 3. Resetear cuenta de usuario (Admin)

Limpia parcial o totalmente los datos de un usuario para testing o soporte. Cada sección es opcional e independiente.

```
POST /api/admin/reset-usuario/:usuarioId
```

**Rol requerido:** `Admin`

**Path params**

| Param | Tipo | Descripción |
|---|---|---|
| `usuarioId` | `string (uuid)` | ID del usuario |

**Body (todos opcionales, todos `true` por defecto)**

```json
{
  "resetSesiones":    true,
  "resetPdfs":        true,
  "resetSuscripcion": true,
  "resetUnidades":    true,
  "resetPerfil":      true
}
```

| Campo | Tipo | Default | Qué hace |
|---|---|---|---|
| `resetSesiones` | `boolean` | `true` | Elimina todas las sesiones (y sus fichas, enfoques transversales, rompe clones de otros usuarios) |
| `resetPdfs` | `boolean` | `true` | Limpia `pdfUrl` / `pdfGeneradoAt` de todas las unidades del usuario |
| `resetUnidades` | `boolean` | `true` | Elimina todas las unidades del usuario (cascade: miembros, áreas; preserva historial de `PagoUnidad`) |
| `resetSuscripcion` | `boolean` | `true` | Baja el plan a `free` (`activa: true`, `fechaFin: ahora`) |
| `resetPerfil` | `boolean` | `true` | Limpia institución, nivel, grado, problemática, ubicación y flags de perfil completo |

**Respuesta 200**

```json
{
  "success": true,
  "message": "Usuario Nombre reseteado correctamente",
  "data": {
    "usuarioId": "uuid",
    "nombre": "string",
    "sesionesEliminadas": 12,
    "fichasEliminadas": 3,
    "enfoquesEliminados": 5,
    "unidadesPdfLimpiadas": 2,
    "unidadesEliminadas": 2,
    "suscripcionRevocada": true,
    "planAnterior": "premium_mensual",
    "perfilReseteado": true
  }
}
```

**Errores**

| Status | Condición |
|---|---|
| `404` | Usuario no encontrado |
| `500` | Error interno |

**Efecto colateral:** emite evento WebSocket `usuario:reseteado` para que el frontend limpie caché y cierre la sesión del usuario.

---

## 4. Finalizar unidad propia (Docente)

El docente da por concluida una de sus unidades, liberándola del conteo de unidades activas para poder crear una nueva.

```
POST /api/unidades/:id/finalizar
```

**Rol requerido:** token válido del docente propietario

**Path params**

| Param | Tipo | Descripción |
|---|---|---|
| `id` | `string (uuid)` | ID de la unidad |

**Body:** ninguno

**Lógica de autorización**

| Tipo de unidad | Condición para autorizar |
|---|---|
| `PERSONAL` | `unidad.usuarioId === usuario.id` |
| `COMPARTIDA` | El usuario debe tener rol `PROPIETARIO` en `UnidadMiembro` |

No se requiere `estadoPago === "CONFIRMADO"` para poder finalizar.

**Respuesta 200**

```json
{
  "success": true,
  "message": "Unidad finalizada exitosamente. Ya puedes crear una nueva unidad.",
  "data": {
    "id": "uuid",
    "titulo": "string",
    "tipo": "PERSONAL",
    "fechaFin": "2026-04-06T00:00:00.000Z",
    "sesiones": [],
    "miembros": [],
    "usuario": { },
    "nivel": { },
    "grado": { },
    "problematica": { }
  }
}
```

**Errores**

| Status | Condición |
|---|---|
| `400` | La unidad ya está finalizada (`fechaFin` <= ahora) |
| `401` | Token inválido o usuario no encontrado en BD |
| `403` | El usuario no es propietario de la unidad |
| `404` | Unidad no encontrada |
| `500` | Error interno |

**Efecto:** `fechaFin` queda en `ahora`. La consulta de unidades activas excluye registros con `fechaFin <= now`, por lo que la unidad deja de contar como activa de inmediato.

---

## 5. Finalizar unidad (Admin)

Versión admin sin restricciones de propiedad, pago ni plan. Marca la unidad como concluida (`fechaFin = ahora`) para que el docente pueda crear una nueva.

```
POST /api/admin/unidad/:unidadId/finalizar
```

**Rol requerido:** `Admin`

**Headers**

```
Authorization: Bearer <token_admin>
```

**Path params**

| Param | Tipo | Descripción |
|---|---|---|
| `unidadId` | `string (uuid)` | ID de la unidad a finalizar |

**Body:** ninguno (no enviar body)

### Respuesta exitosa (200)

```json
{
  "success": true,
  "message": "Unidad finalizada por administración. El docente puede crear una nueva unidad si su plan lo permite.",
  "data": {
    "id": "uuid",
    "numeroUnidad": 1,
    "titulo": "Exploramos nuestras raíces culturales",
    "usuarioId": "uuid",
    "tipo": "PERSONAL",
    "estadoPago": "PENDIENTE",
    "fechaInicio": "2026-03-15T00:00:00.000Z",
    "fechaFin": "2026-04-06T17:30:00.000Z",
    "duracion": 4,
    "maxMiembros": 1,
    "sesionesSemanales": 10,
    "createdAt": "2026-03-15T00:00:00.000Z",
    "updatedAt": "2026-04-06T17:30:00.000Z",
    "usuario": {
      "id": "uuid",
      "nombre": "María Hinojo",
      "email": "maria@gmail.com"
    },
    "nivel": { "id": 1, "nombre": "Primaria" },
    "grado": { "id": 5, "nombre": "Quinto Grado" },
    "problematica": { "id": 3, "nombre": "..." },
    "sesiones": [
      { "id": "uuid", "titulo": "Sesión 1 - ...", "areaId": 1 }
    ],
    "miembros": []
  }
}
```

### Errores

| Status | `success` | `message` | Cuándo ocurre |
|---|---|---|---|
| `400` | `false` | `"La unidad ya está finalizada"` | `fechaFin` ya pasó |
| `404` | `false` | `"Unidad no encontrada"` | UUID inválido o no existe |
| `500` | `false` | `"Error al finalizar la unidad"` | Error interno |

### Ejemplo con fetch (para Orlando)

```typescript
const finalizarUnidad = async (unidadId: string, token: string) => {
  const res = await fetch(
    `${API_BASE}/api/admin/unidad/${unidadId}/finalizar`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return res.json();
};
```

### Notas para el frontend

- Después de una respuesta exitosa, la unidad aparecerá con `fechaFin` en el pasado.
- El docente podrá crear una nueva unidad de inmediato (el backend ya no la cuenta como activa).
- Se puede usar desde el detalle del usuario o desde el detalle de la unidad en el admin.
- No requiere que la unidad tenga pago confirmado ni que sea de un tipo específico (funciona con PERSONAL y COMPARTIDA).

---

## 6. Reiniciar unidad (Admin)

Limpia el contenido generado por IA de una unidad para que el docente pueda rehacer el wizard desde el paso 1. **No elimina** la unidad, sus pagos ni las sesiones asociadas.

```
POST /api/admin/unidad/:unidadId/reset
```

**Rol requerido:** `Admin`

**Headers**

```
Authorization: Bearer <token_admin>
Content-Type: application/json
```

**Path params**

| Param | Tipo | Descripción |
|---|---|---|
| `unidadId` | `string (uuid)` | ID de la unidad a reiniciar |

**Body (todo opcional — enviar `{}` para un reset limpio)**

| Campo | Tipo | Descripción |
|---|---|---|
| `titulo` | `string` | Nuevo título (si el docente quiere cambiarlo) |
| `numeroUnidad` | `number` | Nuevo número de unidad |
| `nivelId` | `number` | Cambiar nivel |
| `gradoId` | `number` | Cambiar grado |
| `problematicaId` | `number` | Cambiar problemática |
| `duracion` | `number` | Cambiar duración en semanas |
| `fechaInicio` | `string (ISO)` | Cambiar fecha de inicio |
| `fechaFin` | `string (ISO)` | Cambiar fecha de fin |

### Qué se limpia

| Campo | Valor después del reset |
|---|---|
| `contenido` | `null` |
| `pdfUrl` | `null` |
| `pdfGeneradoAt` | `null` |
| `wordUrl` | `null` |
| `wordGeneradoAt` | `null` |
| Miembros: `contenidoPersonalizado` | `null` |
| Miembros: `pdfUrl` | `null` |
| Miembros: `pdfGeneradoAt` | `null` |

### Qué se preserva

- La unidad en sí (id, pagos, tipo, código compartido, miembros)
- Las sesiones ya generadas
- El historial de `PagoUnidad`

### Respuesta exitosa (200)

```json
{
  "success": true,
  "message": "Unidad \"Exploramos nuestras raíces\" reiniciada. El docente puede rehacer el wizard desde el paso 1.",
  "data": {
    "id": "uuid",
    "numeroUnidad": 1,
    "titulo": "Exploramos nuestras raíces culturales",
    "contenido": null,
    "pdfUrl": null,
    "wordUrl": null,
    "tipo": "PERSONAL",
    "estadoPago": "CONFIRMADO",
    "fechaFin": null,
    "usuario": { "id": "uuid", "nombre": "...", "email": "..." },
    "nivel": { "id": 1, "nombre": "Primaria" },
    "grado": { "id": 5, "nombre": "Quinto Grado" },
    "problematica": { "id": 3, "nombre": "..." },
    "sesiones": [],
    "miembros": []
  }
}
```

### Errores

| Status | `success` | `message` | Cuándo ocurre |
|---|---|---|---|
| `404` | `false` | `"Unidad no encontrada"` | UUID inválido o no existe |
| `500` | `false` | `"Error al reiniciar la unidad"` | Error interno |

### Ejemplo con fetch (para Orlando)

```typescript
const resetUnidad = async (unidadId: string, token: string) => {
  const res = await fetch(
    `${API_BASE}/api/admin/unidad/${unidadId}/reset`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    }
  );
  return res.json();
};
```

### Diferencia entre Finalizar y Reiniciar

| Acción | Endpoint | Qué hace | La unidad sigue activa? |
|---|---|---|---|
| **Finalizar** | `POST .../finalizar` | Pone `fechaFin = ahora`, libera slot | No — ya no cuenta como activa |
| **Reiniciar** | `POST .../reset` | Limpia contenido IA, el docente rehace el wizard | Sí — sigue activa |
