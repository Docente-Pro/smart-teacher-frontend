import { useEffect, useRef, useState } from "react";
import { useUnidadStore } from "@/store/unidad.store";
import { editarContenidoUnidad } from "@/services/unidad.service";

const DEBOUNCE_MS = 1500;

export type ContenidoSaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Auto-guarda el contenido de la unidad en BD con debounce (1.5s) cada vez que
 * el docente edita un paso. Muestra estado "Guardando..." / "Guardado".
 * Solo hace PATCH cuando hay unidadId y contenido tiene al menos una clave.
 */
export function useAutoSaveContenido(unidadId: string | null): ContenidoSaveStatus {
  const contenido = useUnidadStore((s) => s.contenido);
  const [status, setStatus] = useState<ContenidoSaveStatus>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedRef = useRef(false);
  const isFirstRunRef = useRef(true);

  useEffect(() => {
    if (!unidadId) return;
    if (isFirstRunRef.current) {
      isFirstRunRef.current = false;
      return;
    }

    const keys = contenido && typeof contenido === "object" ? Object.keys(contenido) : [];
    if (keys.length === 0) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      setStatus("saving");
      editarContenidoUnidad(unidadId, { contenido: contenido as Record<string, unknown> })
        .then(() => {
          setStatus("saved");
          savedRef.current = true;
          setTimeout(() => {
            if (savedRef.current) setStatus("idle");
          }, 2000);
        })
        .catch(() => {
          setStatus("error");
        });
    }, DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [unidadId, contenido]);

  return status;
}
