# Estado actual en este repo — Paso 2 y Paso 4 (Crear Unidad)

Documento de referencia para comparar con otras conversaciones o ramas. Última verificación según el código en la rama con los cambios (feat/paso2-paso4-agregar-actividades-sortable / main local).

---

## Paso 2 (`Step2SituacionPropositos.tsx`)

- **Edición de actividades in-place:** Input por actividad, botón **Trash2** por fila para eliminar.
- **Botón "Agregar actividad":** Debajo de la lista de actividades de cada competencia (Plus + texto "Agregar actividad"), `variant="ghost"`, clase `mt-2 ml-2`.
- **`normalizePropositosActividades`:** Asegura que cada competencia tenga `actividades` como array (por persistencia antigua o API).
- **useEffect de sincronización:** Solo lee del store → estado local cuando el estado local está vacío (`!situacionTexto`, `!evidencias`, `!propositos`) para evitar bucle infinito. **No escribe al store** en ese effect.
- **Flush al backend:** Tras generar situación se hace `editarContenidoUnidad` con situación; tras evidencias, PATCH con evidencias; luego se llama a generar propósitos. Al regenerar solo propósitos, si hay `situacionTexto` y `evidencias` en estado local, se hace PATCH con ambos antes de llamar a `regenerarPasoUnidad(unidadId, "propositos")`.
- **Al hacer "Continuar":** Se llama `flushSaveBeforeContinuar` (saveNow del auto-guardado) y se espera antes de pasar al paso 3.

---

## Paso 4 (`Step4SecuenciaFinal.tsx`)

- **Lista reordenable:** **SortableSlotsList** (componente en `SortableSlotsList.tsx` que usa `@formkit/drag-and-drop/react`).
- **Handle de arrastre:** Elemento con clase `.secuencia-drag-handle` e icono **GripVertical** (lucide-react). Cada slot muestra H{número}, inicio–fin, área y actividad.
- **No hay** en este repo un botón global "Agregar actividad" en el paso 4; las horas/slots vienen de la secuencia generada por día.

---

## Archivos tocados

- `Step2SituacionPropositos.tsx`
- `Step4SecuenciaFinal.tsx`
- `SortableSlotsList.tsx`
- `CrearUnidad.tsx`
- `useAutoSaveContenido.ts`
- `unidad.service.ts` (editarContenidoUnidad)
- `ia-unidad.service.ts`

---

## Especificación de diseño (referencia)

### Paso 2 — Situación y Propósitos

- Lista de actividades por competencia: Input por actividad, ordinal 1. 2. …
- Placeholder `"Describe la actividad..."`, Input `h-7` `text-xs`, borde purple en focus.
- Trash2 por fila: visible al hover (`opacity-0 group-hover:opacity-100`), título "Eliminar actividad".
- Botón "Agregar actividad" **debajo** de la lista: `Button variant="ghost" size="sm"`, `mt-2 ml-2 h-7 px-2 text-xs`, purple, icono Plus.
- Propósitos: áreas en cards purple, competencias `border-l-2 border-purple-200`, label "Actividades:" `text-xs text-slate-500 font-medium`. Competencias Transversales: bloque pink.

### Paso 4 — Secuencia

- Lista reordenable por día con **SortableSlotsList** (`@formkit/drag-and-drop`), handle `.secuencia-drag-handle`.
- Handle: **GripVertical**, `w-10`, `cursor-grab`/`active:cursor-grabbing`, "Arrastrar para reordenar"; debajo "H{número}" y "inicio–fin".
- Card por hora: `rounded-lg p-3 border border-slate-100 bg-white dark:bg-slate-900/50`; área `text-indigo-700`, actividad `text-slate-700` con `parseMarkdown`. Semanas expandibles, días con `divide-y`, badge fecha `rounded-full bg-slate-100`, horas `space-y-2`.

### Barra del wizard (CrearUnidad)

- Indicador: "Guardando..." (Loader2 spin), "Guardado" (CheckCircle2 verde), "Error al guardar" (AlertCircle rojo).
- Botón Continuar (Step 2): durante flush muestra "Guardando..." con Loader2 y está deshabilitado.
