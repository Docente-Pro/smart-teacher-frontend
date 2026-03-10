# Resumen: cambios del 10 Mar 2026 y qué está en cada rama

## Commits de hoy relacionados con "cambios unidad" (Step 2 y Step 4)

| Commit     | Rama                          | Qué hizo |
|-----------|---------------------------------|----------|
| `ea5991f` | feat/cambios-unidad             | Solo añadió `.gitattributes`. **No tocó Step 2 ni Step 4.** |
| `6ba3d61` | feat/cambios-unidad-22-relaease | Añadió: `SortableSlotsList.tsx`, `useAutoSaveContenido.ts`, doc `FRONTEND_EDITAR_PASOS_WIZARD.md`, cambios en `instance.ts` y `socket.service.ts`. **No modificó Step2 ni Step4.** |
| `486b9ba` | hotfix/actualizar-cambios-validar-espera | **Step 2 + auto-save:** modificó `Step2SituacionPropositos.tsx`, `useAutoSaveContenido.ts`, `CrearUnidad.tsx` (uso del hook, `flushSaveBeforeContinuar`, indicador Guardando/Guardado). **No tocó Step 4.** |
| `f4b3574` | main (solo local, no en origin)  | Fix: sincronizar propósitos tras recarga y normalizar `actividades`. Solo en tu `main` local; no está en `origin/main`. |

---

## Dónde está cada cosa

- **En `origin/main`** (lo que suele desplegar producción si Vercel usa `main`):
  - Step 2: actividades editables, guardado al editar, integración con `editarContenidoUnidad`.
  - `useAutoSaveContenido` usado en `CrearUnidad` y `flushSaveBeforeContinuar` en Step 2.
  - Step 4: **sin cambios** respecto a antes (no hay uso de `SortableSlotsList` ni reordenar horas).
  - **No** está el fix de recarga (`f4b3574`).

- **En `origin/develop`** (rama por defecto del repo, `HEAD` → develop):
  - **No** tiene el hotfix: no tiene `useAutoSaveContenido` en `CrearUnidad`, ni `flushSaveBeforeContinuar`, ni el indicador Guardando/Guardado.
  - Develop va **por detrás** de main en Step 2 y CrearUnidad (~70 líneas menos).

- **SortableSlotsList**:
  - El archivo existe en el repo (vino en `6ba3d61`).
  - **No se usa en ningún sitio**: no hay ningún `import` de `SortableSlotsList` en el proyecto. Por eso no aparece en la UI.

---

## Por qué es “raro”

1. **Rama por defecto = develop**  
   Si algo (equipo, scripts, otra CI) usa la rama por defecto, ve **develop**, que no tiene los cambios del hotfix (Step 2 + auto-save).

2. **Los “cambios en la unidad” se subieron a `main`, no a develop**  
   El hotfix (PR #26) se mergeó en **main**. Esos cambios **no** se mergearon en **develop**, así que develop sigue sin Step 2 editable ni auto-save.

3. **Step 4**  
   En ningún commit de hoy se modificó `Step4SecuenciaFinal.tsx`. Si se hicieron cambios de Step 4 en otro momento o en otra rama, no están en main ni en develop en el historial de hoy.

---

## Qué hacer para que todo coincida y se vea

1. **Unificar con main**  
   Mergear `main` en `develop` (o hacer que develop reciba los mismos commits que main) para que la rama por defecto tenga Step 2 + auto-save y lo que ya está en main.

2. **Subir el fix de recarga**  
   El commit `f4b3574` (sincronizar propósitos tras recarga) está solo en tu `main` local. Subirlo (por ejemplo con un PR desde una rama que lo contenga) y mergearlo a `main` (y luego a develop si usáis develop).

3. **Confirmar qué despliega producción**  
   Si Vercel (o vuestro deploy) usa **main**, producción ya tiene Step 2 y auto-save. Si usa **develop**, no los tiene hasta que develop tenga el mismo código que main.

4. **Step 4 y SortableSlotsList**  
   Si en algún momento se hizo lógica de Step 4 (p. ej. reordenar con `SortableSlotsList`), no está en el historial de hoy en main/develop. Habría que localizarla en otra rama o rehacer la integración del componente en Step 4.
