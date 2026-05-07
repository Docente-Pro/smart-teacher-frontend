# Front: criterios por actividad (unidad, paso 3 — propósitos)

Guía para integrar la generación de **2 criterios de evaluación** cuando el docente **agrega una actividad manual** que **no** viene de `POST /api/ia-unidad/.../propositos` (IA ya no rellena `actividadCriterios` para esa fila).

**Autenticación:** todas las rutas van con **Bearer** (Auth0), igual que el resto de `/api/unidades`.

**Contrato detallado (Python / payload):** [CONTRATO_BACKEND_CRITERIOS_POR_ACTIVIDAD.md](./CONTRATO_BACKEND_CRITERIOS_POR_ACTIVIDAD.md).

**Sesiones:** si guardáis `actividadCriterios` en la unidad, al generar sesión el título de la actividad debe coincidir con lo que enviéis como `actividadTitulo`; ver [CONTRATO_BACKEND_GENERAR_SESION_UNIDAD.md](./CONTRATO_BACKEND_GENERAR_SESION_UNIDAD.md).

---

## 1. Dos formas de integrar (elegid una)

| Enfoque | Cuándo usarlo |
|--------|----------------|
| **A — Todo en un PATCH** | Queréis que el backend llame a la IA, persista `actividadCriterios` y fusione `criterios` en un solo paso al guardar actividades. |
| **B — POST + PATCH** | Queréis mostrar criterios en UI **antes** de persistir, o armar el merge vosotros en el cliente. |

---

## 2. Opción A — `PATCH` con `nuevasActividades` (recomendado si solo guardáis al confirmar)

**Método y URL**

- `PATCH /api/unidades/:unidadId/propositos/actividades`  
- Alias válido: `PATCH /api/unidad/:unidadId/propositos/actividades`

**Headers**

- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body (JSON)**

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `area` | string | Sí | Nombre del área tal como está en `contenido.propositos.areasPropositos[].area` (Node normaliza “Área de …”). |
| `competencia` | string | Sí | Nombre de la competencia del bloque (`nombre` o `competencia` en el JSON de propósitos). |
| `actividades` | string[] | Sí | Lista **completa** de actividades de esa competencia **después** del cambio (incluidas las nuevas). |
| `nuevasActividades` | string[] | No | Subconjunto de textos que deben recibir criterios por IA **en esta petición**. Cada string debe estar presente en `actividades` (mismo texto, salvo espacios en blanco extra; el backend compara normalizado). |

**Comportamiento del backend**

1. Actualiza `competencia.actividades` con el array enviado.
2. Si `nuevasActividades` tiene ítems, por cada uno llama al servicio de IA (Flash, sin RAG), actualiza en memoria:
   - `competencia.actividadCriterios` (array de `{ actividad, criterios }`; si ya existía la misma actividad, la reemplaza),
   - `competencia.criterios` (lista plana, **sin duplicados**).
3. Si **falla** cualquier llamada a IA, **no** se guarda la unidad (error 4xx/5xx según el caso).

**Respuesta 200 (éxito)**

```json
{
  "success": true,
  "message": "Actividades y criterios por actividad actualizados en los propósitos",
  "data": { "...": "unidad completa con contenido actualizado" },
  "criteriosGeneradosParaActividades": 1
}
```

- `criteriosGeneradosParaActividades` solo aparece cuando enviaste `nuevasActividades` con al menos un elemento.
- Si no enviaste `nuevasActividades`, el `message` indica solo actualización de actividades.

**Errores frecuentes (cliente)**

| HTTP | Situación |
|------|-----------|
| 400 | Falta `area` / `competencia` / `actividades`, `nuevasActividades` con strings vacíos, actividad listada en `nuevasActividades` que no está en `actividades`, o competencia sin `capacidades` en propósitos. |
| 404 | Unidad inexistente o no encuentra el par área + competencia en `areasPropositos`. |
| 422 / 502 | Problema de validación o IA (el body suele venir del backend/Python; mostrar mensaje genérico + detalle si existe). |

**Timeout recomendado del cliente:** **≥ 120 s** (ideal **180 s**), igual que otras llamadas largas a IA; el servidor puede tardar varios segundos por actividad.

**Ejemplo**

```http
PATCH /api/unidades/550e8400-e29b-41d4-a716-446655440000/propositos/actividades
```

```json
{
  "area": "Matemática",
  "competencia": "Resuelve problemas de cantidad",
  "actividades": [
    "Actividad que ya existía",
    "Nueva: resuelven problemas de fracciones con material concreto"
  ],
  "nuevasActividades": [
    "Nueva: resuelven problemas de fracciones con material concreto"
  ]
}
```

---

## 3. Opción B — `POST` criterios-por-actividad (preview o merge manual)

**Método y URL**

- `POST /api/unidades/criterios-por-actividad`  
- Alias: `POST /api/unidad/criterios-por-actividad`

No lleva `unidadId` en la URL: el contexto (grado, problemática, situación, institución) lo enviáis en el body si lo necesita el prompt.

**Body mínimo** (igual que el contrato backend ↔ Python)

```json
{
  "actividad": "Resuelven problemas de fracciones equivalentes con material concreto",
  "area": "Matemática",
  "grado": "Cuarto Grado",
  "competencia": "Resuelve problemas de cantidad",
  "capacidades": [
    "Traduce cantidades a expresiones numéricas",
    "Comunica su comprensión sobre los números"
  ]
}
```

**Opcionales:** `problematica`, `situacionSignificativa` (se trunca en servidor ~1200 caracteres), `institucion`.

**Respuesta exitosa**

El backend **reenvía** el JSON de Python. Campos habituales (referencia):

- `success`, `actividad`, `criterios` (2 strings), `actividadCriterios` (objeto listo para hacer `push` en la competencia), `evidenciaSugerida`, `instrumentoSugerido`, `items`.

**Errores:** 400 validación Node; 422/500/502 según Python (un **reintento** ante 502 es razonable en el cliente; el servidor ya reintenta una vez en algunos casos).

**Después del POST**, si queréis persistir sin `nuevasActividades`:

1. Haced `PATCH .../propositos/actividades` con `actividades` actualizado.
2. Fusionad en estado local (o en el siguiente `PATCH` de contenido) según [CONTRATO_BACKEND_CRITERIOS_POR_ACTIVIDAD.md §4](./CONTRATO_BACKEND_CRITERIOS_POR_ACTIVIDAD.md):
   - `push` de `response.actividadCriterios` en `competencia.actividadCriterios`,
   - añadir los dos `criterios` a `competencia.criterios` sin duplicados.

Si usáis solo la **opción A**, no necesitáis este POST salvo para previsualizar sin guardar.

---

## 4. Checklist rápido (front)

- [ ] Tras “Agregar actividad” manual, o bien `PATCH` con `nuevasActividades`, o bien `POST` + merge + `PATCH` sin `nuevasActividades`.
- [ ] El string de la actividad es el **mismo** que usaréis en el planificador / `actividadTitulo` al generar sesión.
- [ ] Timeout largo en el cliente para PATCH con IA.
- [ ] Manejo de error: si falla el PATCH con `nuevasActividades`, la unidad en BD **no** cambió; podéis reintentar o degradar la UI.

---

## 5. TypeScript (referencia rápida)

```ts
type PatchActividadesBody = {
  area: string;
  competencia: string;
  actividades: string[];
  nuevasActividades?: string[];
};

type CriteriosPorActividadBody = {
  actividad: string;
  area: string;
  grado: string;
  competencia: string;
  capacidades: string[];
  problematica?: { nombre: string; descripcion: string };
  situacionSignificativa?: string;
  institucion?: Partial<{
    nombre: string;
    departamento: string;
    provincia: string;
    distrito: string;
  }>;
};

type ActividadCriteriosItem = {
  actividad: string;
  criterios: string[];
};
```

Los propósitos en `contenido.propositos.areasPropositos[].competencias[]` pueden incluir `actividadCriterios?: ActividadCriteriosItem[]` además de `actividades`, `criterios`, `capacidades`, etc.
