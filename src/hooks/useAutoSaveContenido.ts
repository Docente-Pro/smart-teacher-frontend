import { useCallback, useEffect, useRef, useState } from "react";
import { useUnidadStore } from "@/store/unidad.store";
import { editarContenidoUnidad } from "@/services/unidad.service";

export type ContenidoSaveStatus = "idle" | "saving" | "saved" | "error";

export interface ManualSaveContenido {
  status: ContenidoSaveStatus;
  isDirty: boolean;
  save: () => Promise<void>;
}

/**
 * Tracks whether the unit content has unsaved changes and exposes a manual
 * `save()` function. The teacher must click "Guardar" to persist — there is
 * no automatic debounce timer.
 */
export function useManualSaveContenido(unidadId: string | null): ManualSaveContenido {
  const contenido = useUnidadStore((s) => s.contenido);
  const [status, setStatus] = useState<ContenidoSaveStatus>("idle");
  const [isDirty, setIsDirty] = useState(false);
  const isFirstRunRef = useRef(true);

  useEffect(() => {
    if (!unidadId) return;
    if (isFirstRunRef.current) {
      isFirstRunRef.current = false;
      return;
    }
    const keys = contenido && typeof contenido === "object" ? Object.keys(contenido) : [];
    if (keys.length === 0) return;
    setIsDirty(true);
  }, [unidadId, contenido]);

  const save = useCallback(async () => {
    if (!unidadId) return;
    const keys = contenido && typeof contenido === "object" ? Object.keys(contenido) : [];
    if (keys.length === 0) return;

    setStatus("saving");
    try {
      await editarContenidoUnidad(unidadId, { contenido: contenido as Record<string, unknown> });
      setStatus("saved");
      setIsDirty(false);
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
    }
  }, [unidadId, contenido]);

  return { status, isDirty, save };
}
