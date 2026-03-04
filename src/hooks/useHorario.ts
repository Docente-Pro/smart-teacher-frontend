import { useState, useCallback } from "react";
import { escanearHorarioArchivo } from "@/services/horario.service";
import type { HorarioEscolar } from "@/interfaces/IHorario";

// ────────────────────────────────────────────────
// Hook: useHorario
// Gestiona el estado del horario escolar:
// - Escanear desde archivo (imagen)
// - Editar slots (horas individuales)
// - Limpiar horario
// ────────────────────────────────────────────────

export function useHorario(initial?: HorarioEscolar | null) {
  const [horario, setHorario] = useState<HorarioEscolar | null>(initial ?? null);
  const [scanning, setScanning] = useState(false);
  const [confianza, setConfianza] = useState<"alta" | "media" | "baja" | null>(null);
  const [notas, setNotas] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Escanea un archivo de imagen → devuelve horario detectado.
   */
  const escanearDesdeArchivo = useCallback(async (file: File) => {
    setScanning(true);
    setError(null);
    try {
      const result = await escanearHorarioArchivo(file);
      setHorario(result.horario);
      setConfianza(result.confianza);
      setNotas(result.notas);
      return result;
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        err?.message ||
        "Error al escanear el horario";
      setError(msg);
      throw err;
    } finally {
      setScanning(false);
    }
  }, []);

  /**
   * Actualiza un slot individual de la tabla.
   * @param diaIndex – índice del día (0=Lunes, 4=Viernes)
   * @param horaIndex – índice de la hora pedagógica (0-5)
   * @param area – nueva área curricular
   */
  const actualizarSlot = useCallback(
    (diaIndex: number, horaIndex: number, area: string) => {
      setHorario((prev) => {
        if (!prev) return prev;
        const nuevosDias = prev.dias.map((d, i) => {
          if (i !== diaIndex) return d;
          const nuevasHoras = [...d.horas];
          nuevasHoras[horaIndex] = { area };
          return { ...d, horas: nuevasHoras };
        });
        return { dias: nuevosDias };
      });
    },
    []
  );

  /**
   * Limpia todo el estado del horario.
   */
  const limpiarHorario = useCallback(() => {
    setHorario(null);
    setConfianza(null);
    setNotas(null);
    setError(null);
  }, []);

  return {
    horario,
    scanning,
    confianza,
    notas,
    error,
    escanearDesdeArchivo,
    actualizarSlot,
    limpiarHorario,
    setHorario,
  };
}
