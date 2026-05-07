# Front: arreglar actividades de unidad (4 fases)

Endpoint que **audita y repara** una unidad existente: corrige nombres de competencias, regenera actividades/criterios, actualiza estándares y rehace la secuencia semanal. Diseñado para usar desde el **panel de admin** (proceso largo, ~2-4 min).

**Referencia técnica completa:** [CONTRATO_ARREGLAR_ACTIVIDADES.md](./CONTRATO_ARREGLAR_ACTIVIDADES.md).

---

## 1. Endpoints disponibles

| Quién | URL | Notas |
|-------|-----|-------|
| **Admin** (recomendado) | `POST /api/admin/unidad/arreglar-actividades` | Solo rol Admin; acepta `{ unidadId }` o body directo |
| **Cualquier usuario premium** | `POST /api/unidades/arreglar-actividades` | Misma lógica; acepta `{ unidadId }` o body directo |

Ambas rutas comparten el mismo handler. Autenticación Bearer (Auth0).

---

## 2. Body

### Variante A — por `unidadId` (recomendada para admin)

Node carga la unidad desde BD, llama a Python, **guarda automáticamente** los cambios y limpia el PDF/Word viejo si hubo correcciones.

```json
{
  "unidadId": "550e8400-e29b-41d4-a716-446655440000",
  "turno": "mañana"
}
```

| Campo | Tipo | Obligatorio | Notas |
|-------|------|-------------|-------|
| `unidadId` | string | Sí (en esta variante) | UUID de la unidad en BD |
| `turno` | string | No | `"mañana"` (default) o `"tarde"` — afecta la secuencia |

### Variante B — body directo (sin persistir)

Si el front ya tiene el JSON de la unidad y solo quiere ver el resultado sin guardar.

```json
{
  "unidad": { "...": "JSON completo de la unidad tal como viene de BD" },
  "nivel": "Primaria",
  "grado": "4to Grado",
  "turno": "mañana"
}
```

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| `unidad` | object | Sí |
| `nivel` | string | Sí (`"Primaria"`, `"Secundaria"`, etc.) |
| `grado` | string | Sí (`"1er Grado"`, `"4to Grado"`, `"1er Año"`, etc.) |
| `turno` | string | No |

---

## 3. Respuesta 200

```json
{
  "success": true,
  "unidadId": "...",
  "guardadoEnBD": true,
  "pdfInvalidado": true,
  "wordInvalidado": true,
  "advertencia": "El PDF y Word anteriores fueron eliminados porque el contenido cambió. El docente debe generar y subir un nuevo PDF.",
  "duracion": 187.4,
  "resumen": {
    "competenciasVerificadas": 6,
    "competenciasCorregidas": 1,
    "capacidadesCorregidas": 0,
    "areasConActividadesRegeneradas": 6,
    "estandaresCorregidos": 2,
    "secuenciaRegenerada": true,
    "feriadosDetectados": 2
  },
  "correcciones": [
    {
      "fase": "competencias",
      "area": "Comunicación",
      "tipo": "nombre_corregido",
      "descripcion": "'Comprende textos escritos' → 'Lee diversos tipos de textos escritos en su lengua materna'"
    },
    {
      "fase": "actividades",
      "area": "Matemática",
      "tipo": "actividades_regeneradas",
      "descripcion": "Competencia 'Resuelve problemas de cantidad': 5 actividades nuevas"
    },
    {
      "fase": "feriados",
      "tipo": "feriados_reprogramados",
      "descripcion": "2 día(s) feriado(s) nacionales detectados y reprogramados en la secuencia"
    }
  ],
  "unidad": { "...": "JSON de la unidad ya corregida (si se usó variante B o siempre)" }
}
```

- `unidadId`, `guardadoEnBD`, `pdfInvalidado` y `wordInvalidado` solo aparecen en la variante A.
- `guardadoEnBD: true` → Node ya actualizó la BD; el front puede refrescar `GET /api/unidades/:id`.
- `pdfInvalidado: true` → el PDF anterior fue eliminado de S3 (`pdfUrl = null` en BD). El front debe re-generarlo y subirlo con el flujo habitual.
- `wordInvalidado: true` → el Word anterior fue eliminado de S3 (`wordUrl = null` en BD). Se puede regenerar una vez que haya PDF nuevo.
- `advertencia`: string descriptivo que podés mostrar en el panel de admin cuando `pdfInvalidado` es `true`.
- `resumen.feriadosDetectados`: días feriados detectados y reprogramados en la secuencia.

### Flujo post-arreglo cuando `pdfInvalidado: true`

> **El contenido corregido ya está guardado en BD** al momento de recibir la respuesta. El front solo necesita refrescar la unidad y re-subir el PDF — el mismo flujo que usa la primera vez que el docente genera y sube el PDF.

Este patrón es idéntico al de **rehacer sesión** (`POST /api/admin/rehacer-sesion/:sesionId`): Node corrige y guarda, el front detecta `pdfUrl = null` al renderizar y dispara la re-subida automáticamente.

**Pasos:**

1. **Refrescar unidad** — `GET /api/unidades/:id` (o `/api/admin/unidad/:id`) → devuelve el `contenido` ya corregido y `pdfUrl: null`.
2. **Generar el PDF** — construirlo en el cliente con el `contenido` actualizado (igual que en el flujo normal).
3. **Solicitar presigned URL** — `POST /api/unidades/upload-url` con `{ unidadId, usuarioId }`.
4. **Subir el PDF a S3** — PUT directo a la URL firmada con el PDF generado.
5. **Confirmar upload** — `POST /api/unidades/confirmar-upload` con `{ unidadId, usuarioId, key }` → guarda `pdfUrl` en BD.
6. **Regenerar Word** (admin, un click) — `POST /api/admin/unidad/:unidadId/generar-word` — disponible una vez que `pdfUrl` esté presente.

---

## 4. Errores habituales

| HTTP | Caso |
|------|------|
| 400 | Falta `unidadId` o `{ unidad, nivel, grado }` / la unidad no tiene contenido generado |
| 404 | Unidad no encontrada (variante A) |
| 403 | Token sin rol Admin (en la ruta `/api/admin/...`) |
| 422 | Cuerpo inválido según Pydantic (Python) — el body del error viene de Python directamente |
| 500 | Error interno de Python — ver campo `message` |
| 504 | Timeout (proceso excedió ~5 min) — reintentar o revisar logs Python |

---

## 5. UX recomendada (panel admin)

1. **Botón** "Arreglar actividades" en el detalle de la unidad.
2. **Mostrar spinner** con texto: _"Auditando y reparando la unidad… puede tardar hasta 4 minutos."_
3. **Timeout del cliente:** `≥ 300 000 ms` (5 min).
4. Tras éxito, mostrar el **resumen** de correcciones (tabla o lista).
5. Si `guardadoEnBD: true`, recargar el detalle de la unidad (`GET /api/admin/unidad/:unidadId`).
6. Si `correcciones` está vacío, mostrar: _"La unidad ya está correcta; no se aplicaron cambios."_

---

## 6. TypeScript (referencia)

```ts
type ResumenArreglo = {
  competenciasVerificadas: number;
  competenciasCorregidas: number;
  capacidadesCorregidas: number;
  areasConActividadesRegeneradas: number;
  estandaresCorregidos: number;
  secuenciaRegenerada: boolean;
  feriadosDetectados: number; // días feriados nacionales detectados y reprogramados en la secuencia
};

type CorreccionDetalle = {
  fase: "competencias" | "capacidades" | "actividades" | "estandares" | "secuencia" | "feriados";
  area?: string;
  tipo: string;
  descripcion: string;
};

type ArreglarActividadesResponse = {
  success: boolean;
  unidadId?: string;
  guardadoEnBD?: boolean;
  /** true si el PDF fue eliminado de S3 (el docente debe subir uno nuevo) */
  pdfInvalidado?: boolean;
  /** true si el Word fue eliminado de S3 (regenerar con /generar-word una vez haya PDF) */
  wordInvalidado?: boolean;
  /** Mensaje descriptivo para mostrar en UI cuando pdfInvalidado es true */
  advertencia?: string;
  duracion: number | null;
  resumen: ResumenArreglo;
  correcciones: CorreccionDetalle[];
  unidad: Record<string, unknown> | null;
};
```

---

## 7. Ejemplo `fetch` (admin)

```ts
const res = await fetch(`${API}/api/admin/unidad/arreglar-actividades`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${adminToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ unidadId, turno: "mañana" }),
  // Asegurarse de que el cliente HTTP soporte timeouts largos
  // (fetch nativo no tiene timeout; usar AbortController o axios)
});

const json: ArreglarActividadesResponse = await res.json();

if (!res.ok || !json.success) {
  throw new Error(json.message ?? "Error al arreglar actividades");
}

console.log("Correcciones:", json.correcciones.length);
console.log("Resumen:", json.resumen);
```

> Con `fetch` nativo no hay timeout integrado. Usar `AbortController` con 310 000 ms o usar **axios** con `timeout: 300_000`.
