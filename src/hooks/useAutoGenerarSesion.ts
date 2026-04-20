import { useState, useCallback } from "react";
import { instance } from "@/services/instance";
import { generarImagenesSesion, getTemaCurricularPayload } from "@/services/ia-sesion.service";
import { useSesionStore } from "@/store/sesion.store";
import { handleToaster } from "@/utils/Toasters/handleToasters";

/**
 * Fases de la auto-generación.
 * Se usan para mostrar progreso al usuario.
 */
export type AutoGenPhase =
  | "idle"
  | "criterios"
  | "proposito"
  | "enfoques"
  | "secuencia"
  | "imagenes"
  | "done"
  | "error";

interface AutoGenState {
  phase: AutoGenPhase;
  isRunning: boolean;
  error: string | null;
}

const PHASE_LABELS: Record<AutoGenPhase, string> = {
  idle: "",
  criterios: "Generando criterios de evaluación...",
  proposito: "Generando propósito de la sesión...",
  enfoques: "Seleccionando enfoques transversales...",
  secuencia: "Creando secuencia didáctica (inicio, desarrollo y cierre)...",
  imagenes: "Generando imágenes educativas...",
  done: "¡Sesión lista!",
  error: "Ocurrió un error",
};

/**
 * Hook que ejecuta toda la pipeline de IA en secuencia:
 *   criterios → propósito → enfoques → secuencia didáctica → imágenes (background)
 *
 * Devuelve el estado del progreso y una función `run()` para iniciar.
 */
export function useAutoGenerarSesion() {
  const { sesion, updateSesion } = useSesionStore();
  const [state, setState] = useState<AutoGenState>({
    phase: "idle",
    isRunning: false,
    error: null,
  });

  const phaseLabel = PHASE_LABELS[state.phase];

  const run = useCallback(async (): Promise<boolean> => {
    if (!sesion) return false;

    setState({ phase: "criterios", isRunning: true, error: null });

    try {
      // ═══════════════ 1. CRITERIOS DE EVALUACIÓN ═══════════════
      const cantidadCapacidades = sesion.propositoAprendizaje.capacidades.length || 2;

      const criteriosRes = await instance.post("/ia/generar-criterios-evaluacion", {
        temaCurricular: getTemaCurricularPayload(sesion),
        area: sesion.datosGenerales.area,
        ...(sesion.areaId ? { areaId: sesion.areaId } : {}),
        competencia: sesion.propositoAprendizaje.competencia,
        capacidades: sesion.propositoAprendizaje.capacidades,
        cantidadCriterios: cantidadCapacidades,
        grado: sesion.datosGenerales.grado || "5to",
        temaId: sesion.temaId,
        situacionTexto: sesion.situacionTexto,
      });

      if (criteriosRes.data.success && criteriosRes.data.data) {
        const { criterios, evidenciaSugerida, instrumentoSugerido } = criteriosRes.data.data;
        updateSesion({
          propositoAprendizaje: {
            ...sesion.propositoAprendizaje,
            criteriosEvaluacion: criterios || [],
            evidenciaAprendizaje: evidenciaSugerida || sesion.propositoAprendizaje.evidenciaAprendizaje,
            instrumentoEvaluacion: instrumentoSugerido || sesion.propositoAprendizaje.instrumentoEvaluacion,
          },
        });
      }

      // ═══════════════ 2. PROPÓSITO DE LA SESIÓN ═══════════════
      setState((s) => ({ ...s, phase: "proposito" }));

      const propositoRes = await instance.post("/ia/generar-proposito-sesion", {
        temaCurricular: getTemaCurricularPayload(sesion),
        area: sesion.datosGenerales.area,
        ...(sesion.areaId ? { areaId: sesion.areaId } : {}),
        grado: sesion.datosGenerales.grado || "5to",
        competencia: sesion.propositoAprendizaje.competencia,
        capacidades: sesion.propositoAprendizaje.capacidades,
        duracion: sesion.datosGenerales.duracion,
        temaId: sesion.temaId,
        situacionTexto: sesion.situacionTexto,
      });

      let propositoText = "";
      if (propositoRes.data.success && propositoRes.data.data) {
        const d = propositoRes.data.data;
        propositoText =
          d.propositoSesion ||
          [d.queAprenderan, d.como, d.paraQue].filter(Boolean).join(" ");
        updateSesion({ propositoSesion: propositoText });
      }

      // ═══════════════ 3. ENFOQUES TRANSVERSALES ═══════════════
      setState((s) => ({ ...s, phase: "enfoques" }));

      const enfoquesRes = await instance.post("/ia/sugerir-enfoques-transversales", {
        temaCurricular: getTemaCurricularPayload(sesion),
        area: sesion.datosGenerales.area,
        ...(sesion.areaId ? { areaId: sesion.areaId } : {}),
        grado: sesion.datosGenerales.grado || "5to",
        competencia: sesion.propositoAprendizaje.competencia,
        propositoSesion: propositoText || sesion.propositoSesion,
        temaId: sesion.temaId,
        situacionTexto: sesion.situacionTexto,
      });

      if (enfoquesRes.data.success && enfoquesRes.data.data?.enfoquesSugeridos) {
        const enfoquesMapeados = enfoquesRes.data.data.enfoquesSugeridos.map((e: any) => ({
          nombre: e.nombre || e.enfoque || "",
          valor: e.valor || undefined,
          actitudesObservables: e.actitudesObservables || e.actitudes || "",
        }));
        updateSesion({ enfoquesTransversales: enfoquesMapeados });
      }

      // ═══════════════ 4. SECUENCIA DIDÁCTICA ═══════════════
      setState((s) => ({ ...s, phase: "secuencia" }));

      // Re-leer sesion actualizada del store
      const sesionActualizada = useSesionStore.getState().sesion;

      const areaIdActual = sesionActualizada?.areaId ?? sesion.areaId;
      const secuenciaRes = await instance.post("/ia/generar-secuencia-didactica", {
        temaCurricular: getTemaCurricularPayload(sesionActualizada ?? sesion),
        area: sesionActualizada?.datosGenerales?.area ?? sesion.datosGenerales.area,
        ...(areaIdActual ? { areaId: areaIdActual } : {}),
        temaId: sesionActualizada?.temaId ?? sesion.temaId,
        datosGenerales: sesionActualizada?.datosGenerales ?? sesion.datosGenerales,
        propositoAprendizaje: sesionActualizada?.propositoAprendizaje ?? sesion.propositoAprendizaje,
        propositoSesion: sesionActualizada?.propositoSesion ?? propositoText,
        situacionTexto: sesionActualizada?.situacionTexto ?? sesion.situacionTexto,
      });

      if (secuenciaRes.data.success && secuenciaRes.data.data) {
        const data = secuenciaRes.data.data;

        // Extraer preparación
        const preparacionRaw = data.preparacion || null;
        let preparacionFinal: { quehacerAntes: string[]; recursosMateriales: string[] } | null = null;

        if (
          preparacionRaw &&
          (preparacionRaw.quehacerAntes?.length > 0 || preparacionRaw.recursosMateriales?.length > 0)
        ) {
          preparacionFinal = {
            quehacerAntes: preparacionRaw.quehacerAntes || [],
            recursosMateriales: preparacionRaw.recursosMateriales || [],
          };
        } else {
          // Auto-extraer de procesos
          const allProcs = [
            ...(data.inicio?.procesos || []),
            ...(data.desarrollo?.procesos || []),
            ...(data.cierre?.procesos || []),
          ];
          const recursosSet = new Set<string>();
          allProcs.forEach((p: any) => {
            const recursosTxt = p.recursos || p.recursosDidacticos;
            if (recursosTxt) {
              recursosTxt
                .split(/,|;/)
                .map((r: string) => r.trim())
                .filter(Boolean)
                .forEach((r: string) => recursosSet.add(r));
            }
          });
          const recursosUnicos = Array.from(recursosSet);
          preparacionFinal = {
            quehacerAntes: recursosUnicos.map(
              (r) => `Preparar ${r.charAt(0).toLowerCase() + r.slice(1)}`
            ),
            recursosMateriales: recursosUnicos,
          };
        }

        // Mapear enfoques del backend si vienen en la secuencia
        const enfoquesRaw = data.enfoquesTransversales;
        const enfoquesMapeados =
          Array.isArray(enfoquesRaw) && enfoquesRaw.length > 0
            ? enfoquesRaw.map((e: any) => ({
                nombre: e.enfoque || e.nombre || "",
                valor: e.valor || undefined,
                actitudesObservables: e.actitudes || e.actitudesObservables || "",
              }))
            : undefined;

        const respAreaId = data.areaId ?? secuenciaRes.data.areaId;
        updateSesion({
          titulo: data.titulo || sesionActualizada?.titulo || "",
          secuenciaDidactica: {
            inicio: data.inicio || { tiempo: "15 min", procesos: [] },
            desarrollo: data.desarrollo || { tiempo: "60 min", procesos: [] },
            cierre: data.cierre || { tiempo: "15 min", procesos: [] },
          },
          preparacion: preparacionFinal,
          ...(enfoquesMapeados && { enfoquesTransversales: enfoquesMapeados }),
          ...(Array.isArray(data.competenciasTransversalesSesion) && {
            competenciasTransversalesSesion: data.competenciasTransversalesSesion,
          }),
          ...(secuenciaRes.data.imagenes_disponibles && {
            imagenes_disponibles: secuenciaRes.data.imagenes_disponibles,
          }),
          ...(respAreaId ? { areaId: Number(respAreaId) } : {}),
        });
      }

      setState({ phase: "done", isRunning: false, error: null });

      // ═══════════════ 5. IMÁGENES (Background, no bloquea) ═══════════════
      const sesionFinal = useSesionStore.getState().sesion;
      if (sesionFinal && secuenciaRes.data.success) {
        generarImagenesSesion({
          sesion: secuenciaRes.data.data,
          area: sesionFinal.datosGenerales?.area || "",
          ...(sesionFinal.areaId ? { areaId: sesionFinal.areaId } : {}),
          grado: sesionFinal.datosGenerales?.grado || "",
          tema: sesionFinal.temaCurricular || "",
        })
          .then((imgRes) => {
            if (imgRes.success && imgRes.data) {
              // Inyectar imágenes en procesos del store
              const sesActual = useSesionStore.getState().sesion;
              if (!sesActual) return;

              const inyectar = (seccion: "inicio" | "desarrollo" | "cierre") => {
                const imgData = (imgRes.data as any)[seccion];
                if (!imgData?.procesos) return null;
                const procesosActualizados = (sesActual.secuenciaDidactica[seccion]?.procesos || []).map(
                  (proc: any, idx: number) => {
                    const imgProc = imgData.procesos[idx];
                    if (imgProc?.imagen) {
                      return { ...proc, imagen: imgProc.imagen };
                    }
                    return proc;
                  }
                );
                return procesosActualizados;
              };

              const inicioProcs = inyectar("inicio");
              const desarrolloProcs = inyectar("desarrollo");
              const cierreProcs = inyectar("cierre");

              updateSesion({
                secuenciaDidactica: {
                  inicio: {
                    ...sesActual.secuenciaDidactica.inicio,
                    ...(inicioProcs && { procesos: inicioProcs }),
                  },
                  desarrollo: {
                    ...sesActual.secuenciaDidactica.desarrollo,
                    ...(desarrolloProcs && { procesos: desarrolloProcs }),
                  },
                  cierre: {
                    ...sesActual.secuenciaDidactica.cierre,
                    ...(cierreProcs && { procesos: cierreProcs }),
                  },
                },
              });
              handleToaster("Imágenes educativas generadas", "success");
            }
          })
          .catch(() => {
            // Las imágenes son opcionales, no bloqueamos si fallan
          });
      }

      return true;
    } catch (error: any) {
      console.error("Error en auto-generación:", error);
      const msg = error.response?.data?.message || "Error al generar la sesión con IA";
      setState({ phase: "error", isRunning: false, error: msg });
      handleToaster(msg, "error");
      return false;
    }
  }, [sesion, updateSesion]);

  return {
    ...state,
    phaseLabel,
    run,
  };
}
