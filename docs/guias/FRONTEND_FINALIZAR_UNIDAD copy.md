# Front: finalizar unidad

Cuando el docente **terminó** su unidad (por ejemplo generó/usó todas las sesiones que necesita), puede pulsar **“Finalizar unidad”**. El backend pone **`fechaFin`** en la fecha/hora actual. Así la unidad **deja de contar como activa** y, si el usuario es **premium**, puede **crear otra unidad** (la regla de “solo una unidad activa como propietario” se basa en `fechaFin`).

**Definición de “unidad activa” (backend):** `fechaFin == null` **o** `fechaFin > ahora`.

### Resumen de endpoints

| Quién | URL | ¿Ya existe en backend? |
|-------|-----|-------------------------|
| **Docente** (propietario) | `POST /api/unidades/:id/finalizar` | Sí |
| **Admin** (cualquier unidad de cualquier usuario) | `POST /api/admin/unidad/:unidadId/finalizar` | Sí |

El **admin no usa `usuarioId` en la URL**: usa el **`unidadId`** (UUID de la fila `Unidad`). En panel admin, obtén ese id desde el detalle del usuario, listado de unidades, o `GET /api/unidades/usuario/:usuarioId` si lo exponéis en el front.

---

## 1. Docente — `POST /api/unidades/:id/finalizar`

| | |
|---|---|
| **Método** | `POST` |
| **URL** | `/api/unidades/:id/finalizar` |
| **Alias** | `/api/unidad/:id/finalizar` (misma app, mismo handler) |
| **Auth** | Bearer (Auth0), usuario estándar |

### Quién puede llamar

Solo el **propietario** de la unidad (debe existir fila `UnidadMiembro` con `rol: "PROPIETARIO"` para ese usuario y esa unidad).

### Reglas

- La unidad debe existir.
- `estadoPago` de la unidad debe ser **`CONFIRMADO`**.
- Si `fechaFin` ya está en el pasado → **400** (“ya está finalizada”).

### Body

No requiere cuerpo (`{}` está bien).

### Respuesta 200

```json
{
  "success": true,
  "message": "Unidad finalizada exitosamente. Ya puedes crear una nueva unidad.",
  "data": {
    "id": "...",
    "titulo": "...",
    "fechaFin": "2025-03-26T12:34:56.789Z",
    "usuario": { ... },
    "nivel": { ... },
    "grado": { ... },
    "problematica": { ... },
    "sesiones": [ { "id": "...", "titulo": "...", "areaId": 1 } ],
    "miembros": [ ... ]
  }
}
```

### Errores habituales

| HTTP | Mensaje / caso |
|------|----------------|
| 401 | Usuario no encontrado (token sin match en BD) |
| 403 | No es propietario |
| 400 | Pago no confirmado / unidad ya finalizada |
| 404 | Unidad no encontrada |

### Después de finalizar (UX)

- Redirigir o habilitar flujo **“Crear nueva unidad”** si `getPlanUsuario` no es free.
- La unidad sigue existiendo (sesiones, PDFs, contenido); solo cambia el “cierre” temporal para reglas de negocio.

---

## 2. Admin — finalizar la unidad de un usuario

**Sí: el administrador puede finalizar la unidad de cualquier docente** usando el UUID de esa unidad. El propietario queda liberado para crear otra unidad activa (si su plan lo permite), igual que si hubiera pulsado "Finalizar" él mismo.

| | |
|---|---|
| **Método** | `POST` |
| **URL** | `/api/admin/unidad/:unidadId/finalizar` |
| **Parámetro** | `unidadId` — id de la tabla `Unidad` (no es `usuarioId`) |
| **Auth** | Bearer + rol **Admin** (mismo middleware que el resto de `/api/admin`) |

### Diferencias respecto al docente

- **No** comprueba que quien llame sea el propietario de esa unidad.
- **No** exige `estadoPago === "CONFIRMADO"` (útil en soporte o datos inconsistentes).
- Si `fechaFin` ya está en el pasado → **400** ("La unidad ya está finalizada").

### Body

Vacío `{}` o sin body.

### Respuesta 200

```json
{
  "success": true,
  "message": "Unidad finalizada por administración. El docente puede crear una nueva unidad si su plan lo permite.",
  "data": {
    "id": "uuid-unidad",
    "titulo": "...",
    "fechaFin": "2026-03-29T18:00:00.000Z",
    "usuarioId": "uuid-propietario",
    "usuario": { "id": "...", "nombre": "...", "email": "..." },
    "nivel": { },
    "grado": { },
    "problematica": { },
    "sesiones": [ { "id": "...", "titulo": "...", "areaId": 1 } ],
    "miembros": [ ]
  }
}
```

`data` es la unidad actualizada (misma forma rica que en el flujo docente, con relaciones incluidas por Prisma).

### Errores

| HTTP | Caso |
|------|------|
| 401 | Sin token o inválido |
| 403 | Token sin rol Admin |
| 400 | Ya finalizada |
| 404 | Unidad no encontrada |
| 500 | Error interno |

---

## 3. Relación con crear unidad

`POST /api/unidades` (`createNewUnidad`) rechaza si el usuario ya tiene **otra unidad activa** como **PROPIETARIO** (`fechaFin` null o futuro). Tras finalizar, esa condición deja de cumplirse y puede crear otra (sigue aplicando: plan no free, no ser suscriptor activo en otra unidad compartida, etc.).

---

## 4. TypeScript (referencia)

```ts
type FinalizarUnidadResponse = {
  success: boolean;
  message: string;
  data?: unknown; // Unidad Prisma + relaciones incluidas en la respuesta
};
```

---

## 5. Ejemplo `fetch` (docente)

```ts
const res = await fetch(`${API}/api/unidades/${unidadId}/finalizar`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({}),
});
const json = await res.json();
if (!res.ok) throw new Error(json.message ?? res.statusText);
```

---

## 6. Ejemplo `fetch` (admin — unidad de otro usuario)

Mismo contrato de respuesta; solo cambia la URL y que el token tenga rol **Admin**.

```ts
/** unidadId = UUID de la unidad a cerrar (la del docente), no el usuarioId */
async function finalizarUnidadComoAdmin(
  apiBase: string,
  adminAccessToken: string,
  unidadId: string
) {
  const res = await fetch(`${apiBase}/api/admin/unidad/${unidadId}/finalizar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${adminAccessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? res.statusText);
  return json as { success: boolean; message: string; data: unknown };
}
```

**UX panel admin:** botón “Finalizar unidad” junto a la unidad activa del usuario; confirmación; llamada con el `id` de esa unidad.
