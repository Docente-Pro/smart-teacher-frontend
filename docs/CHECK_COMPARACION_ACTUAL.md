# Revisión y comparación — estado actual

## ¿Se descartaron cambios?

**Reflog:** No hay ningún `reset --hard` ni `revert` en el reflog reciente. No aparece que “se hayan rulado” cambios en este repo; los commits siguen en la historia.

**Lo que sí pasa:** Parte de los cambios está en **ramas** que no están en `origin/main`:

- **origin/main** (producción): tiene hasta el merge del PR #27 (fix sincronizar propósitos). **No** tiene el commit `b213c07` (agregar/quitar actividades en Step 2, botón abajo, flush backend, fix bucle, Step 4 con SortableSlotsList).
- **Rama `feat/paso2-paso4-agregar-actividades-sortable`** y **main local**: sí tienen `b213c07`. Ese commit está subido en la rama `feat/paso2-paso4-agregar-actividades-sortable`, pero **no está mergeado en main** todavía.

Así que nada se “ruló” por revert; lo que falta en producción es **mergear ese PR** a main.

---

## Comparación rápida

| Qué | En main local / feat branch | En origin/main (producción) |
|-----|-----------------------------|-----------------------------|
| Step 2: editar actividades | Sí | Sí (desde PR #26) |
| Step 2: agregar / quitar actividades, botón abajo | Sí (b213c07) | No |
| Step 2: flush backend antes de propósitos | Sí (b213c07) | No |
| Step 2: fix bucle useEffect | Sí (b213c07) | No |
| Step 2: sync tras recarga, normalizar actividades | Sí (PR #27) | Sí |
| Step 4: SortableSlotsList + GripVertical reordenar | Sí (b213c07) | No |
| useAutoSaveContenido + CrearUnidad | Sí | Sí |

---

## Qué hacer para que “todo esté como debe”

1. **Mergear en main** el PR de la rama `feat/paso2-paso4-agregar-actividades-sortable` (commit `b213c07`). Así producción tendrá Step 2 completo y Step 4 con lista reordenable.
2. **Si en la otra conversación hiciste un diseño distinto** para Step 4 (otro layout, otro flujo, otra librería), usa el **prompt** en `docs/PROMPT_OTRA_CONVERSACION_CAMBIOS_UNIDAD.md` en ese chat y luego aplica aquí lo que te indiquen.

---

## Archivos clave para comparar a mano

- `src/components/StepsCrearUnidad/Step2SituacionPropositos.tsx`
- `src/components/StepsCrearUnidad/Step4SecuenciaFinal.tsx`
- `src/components/StepsCrearUnidad/SortableSlotsList.tsx`
- `src/hooks/useAutoSaveContenido.ts`
- `src/pages/CrearUnidad.tsx`

Si en la otra conversación te pasan un diff o descripción de cómo era el diseño, se puede comparar con estos archivos.
