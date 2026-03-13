import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth0 } from "@/hooks/useAuth0";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import { useUnidadStore } from "@/store/unidad.store";
import { usePermissions } from "@/hooks/usePermissions";
import { instance } from "@/services/instance";
import {
  deleteUnidad,
  getUnidadesByUsuario,
  resetUnidadContenido,
  getUnidadById,
} from "@/services/unidad.service";
import { getGradosAreas } from "@/services/usuarios.service";
import { getAllGrados } from "@/services/grado.service";
import { getAllAreas } from "@/services/areas.service";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { StepIndicator } from "@/components/StepsCuestionarioCrearSesion/StepIndicator";
import { UnidadDrawer } from "@/components/StepsCrearUnidad/UnidadDrawer";
import { UnidadRecoveryDialog } from "@/components/StepsCrearUnidad/UnidadRecoveryDialog";
import Step0TipoUnidad from "@/components/StepsCrearUnidad/Step0TipoUnidad";
import Step1DatosUnidad from "@/components/StepsCrearUnidad/Step1DatosUnidad";
import Step1DatosUnidadBatch from "@/components/StepsCrearUnidad/Step1DatosUnidadBatch";
import Step2SituacionPropositos from "@/components/StepsCrearUnidad/Step2SituacionPropositos";
import Step3EnfoquesComplementos from "@/components/StepsCrearUnidad/Step3EnfoquesComplementos";
import Step4SecuenciaFinal from "@/components/StepsCrearUnidad/Step4SecuenciaFinal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { X, RotateCcw, Loader2, Check, AlertCircle } from "lucide-react";
import type { IUsuario } from "@/interfaces/IUsuario";
import type { TipoUnidad } from "@/interfaces/IUnidad";
import { useScrollTopOnStep } from "@/hooks/useScrollTopOnStep";
import { useAutoSaveContenido } from "@/hooks/useAutoSaveContenido";
import { nivelRequiereHorario } from "@/utils/nivelRequiereHorario";
import { horarioTieneAlMenosUnArea } from "@/interfaces/IHorario";
import { HorarioPanel } from "@/components/StepsCrearUnidad/HorarioPanel";
import { useHorario } from "@/hooks/useHorario";

const STEPS = [
  { number: 1, title: "Datos Generales", description: "Configuración" },
  { number: 2, title: "Situación y Propósitos", description: "IA genera" },
  { number: 3, title: "Enfoques", description: "Complementos" },
  { number: 4, title: "Secuencia", description: "Sesiones" },
];

/**
 * Wizard de 4 pasos para crear Unidades de Aprendizaje con IA.
 * Paso 1: Datos generales (nivel, grado, áreas, duración, fechas, problemática)
 * Paso 2: Situación Significativa + Evidencias + Propósitos (IA pasos 1-3)
 * Paso 3: Áreas Complementarias + Enfoques Transversales (IA pasos 4-5)
 * Paso 4: Secuencia de Actividades + Materiales + Reflexiones (IA pasos 6-8)
 */
function CrearUnidad() {
  const navigate = useNavigate();
  const { user } = useAuth0();
  const { showLoading, hideLoading } = useGlobalLoading();
  const { isPremium, isSuscripcionActiva } = usePermissions();

  // ── Store con persistencia ──
  const {
    currentStep,
    maxStepReached,
    wizardPhase,
    tipoUnidad,
    maxMiembros,
    unidadId,
    unidadBatch,
    datosBase,
    hasUnfinishedUnidad,
    setCurrentStep,
    advanceStep,
    setWizardPhase,
    setTipoUnidad,
    resetUnidad,
    softResetUnidad,
    selectUnidad,
    setDatosBase,
    setContenido,
    horario: horarioStore,
    setHorario: setHorarioStore,
    incluyeTutoria,
    incluyePlanLector,
    setIncluyeTutoria,
    setIncluyePlanLector,
    opcionesHorario: opcionesHorarioStore,
    setOpcionesHorario: setOpcionesHorarioStore,
  } = useUnidadStore();

  const {
    horario: horarioLocal,
    scanning: horarioScanning,
    confianza: horarioConfianza,
    notas: horarioNotas,
    error: horarioError,
    escanearDesdeArchivo,
    actualizarSlot,
    limpiarHorario,
    setHorario: setHorarioLocal,
    iniciarManual,
  } = useHorario(horarioStore);

  useEffect(() => {
    setHorarioStore(horarioLocal);
  }, [horarioLocal, setHorarioStore]);

  const contenidoSaveStatus = useAutoSaveContenido(unidadId ?? null);

  const [usuarioData, setUsuarioData] = useState<IUsuario | null>(null);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSecundaria, setIsSecundaria] = useState(false);
  const [gradosSecundaria, setGradosSecundaria] = useState<{ id: number; nombre: string; nivelId: number }[]>([]);
  const [nivelSecundaria, setNivelSecundaria] = useState<{ id: number; nombre: string } | null>(null);
  const [areasDelDocente, setAreasDelDocente] = useState<string[]>([]);
  /** Opciones para el horario: "Área - Grado" (ej. Matemática - Segundo Año) cuando el docente tiene asignaciones por grado. */
  const [opcionesHorario, setOpcionesHorario] = useState<string[]>([]);
  /** Cuando el horario ya tiene al menos un área, el usuario debe confirmar para pasar al Paso 1 (evita salto brusco). */
  const [gateHorarioConfirmado, setGateHorarioConfirmado] = useState(false);

  const requiereHorario =
    isSecundaria ||
    nivelRequiereHorario(usuarioData?.nivel?.nombre) ||
    nivelRequiereHorario(datosBase?.nivel);
  const horarioValido = horarioTieneAlMenosUnArea(horarioLocal);
  const horarioBloqueado = requiereHorario && (!horarioValido || !gateHorarioConfirmado);

  // Scroll al tope cada vez que cambia el paso
  useScrollTopOnStep(currentStep);

  // Si limpian el horario, quitar confirmación
  useEffect(() => {
    if (!horarioValido) setGateHorarioConfirmado(false);
  }, [horarioValido]);

  // ── Manejador de paso ──
  const handleSetStep = (step: number) => {
    if (horarioBloqueado && step >= 1) return;
    advanceStep(step);
  };

  const handleTipoContinue = (tipo: TipoUnidad, miembros: number) => {
    setTipoUnidad(tipo, miembros);
  };

  // ── Recuperación: continuar donde se quedó ──
  const handleContinueUnfinished = () => {
    setShowRecoveryDialog(false);
    // El estado ya está en el store, solo cerramos el diálogo
  };

  /**
   * Obtiene el ID de la unidad activa:
   * 1. Desde el store local (más rápido).
   * 2. Fallback: consulta unidades del usuario en el backend.
   */
  const obtenerUnidadActivaId = async (): Promise<string | null> => {
    const idLocal = useUnidadStore.getState().unidadId;
    if (idLocal) return idLocal;

    if (user?.id) {
      const res = await getUnidadesByUsuario(user.id);
      const unidades = res.data;
      if (Array.isArray(unidades) && unidades.length > 0) {
        return unidades[0].id;
      }
    }
    return null;
  };

  // ── Recovery dialog: empezar de nuevo (elimina la unidad completa del backend) ──
  const handleStartNew = async () => {
    setShowRecoveryDialog(false);
    try {
      const batch = useUnidadStore.getState().unidadBatch;
      if (batch.length > 0) {
        await Promise.allSettled(batch.map((u) => deleteUnidad(u.id)));
      } else {
        const id = await obtenerUnidadActivaId();
        if (id) await deleteUnidad(id);
      }
      resetUnidad();
    } catch (err: any) {
      console.error("No se pudo eliminar la unidad del backend:", err);
      const msg =
        err?.response?.data?.message || "No se pudo eliminar la unidad del servidor. Intenta de nuevo.";
      handleToaster(msg, "error");
    }
  };

  // ── Wizard: empezar de cero (resetea contenido IA, conserva la unidad) ──
  const handleEmpezarDeCero = async () => {
    setShowResetConfirm(false);
    try {
      const id = await obtenerUnidadActivaId();
      if (id) {
        await resetUnidadContenido(id);
        softResetUnidad();
      } else {
        // No hay unidad en backend, reset local completo
        resetUnidad();
      }
      handleToaster("Se reinició la unidad correctamente", "success");
    } catch (err: any) {
      console.error("No se pudo reiniciar la unidad:", err);
      const msg =
        err?.response?.data?.message || "No se pudo reiniciar la unidad. Intenta de nuevo.";
      handleToaster(msg, "error");
    }
  };

  // ── Cargar usuario y verificar unidad pendiente ──
  useEffect(() => {
    // Si el wizard ya estaba completado, resetear para empezar de nuevo
    if (useUnidadStore.getState().wizardPhase === "completed") {
      resetUnidad();
    }

    async function cargarUsuario() {
      if (!user?.id) {
        handleToaster("Error: Usuario no encontrado", "error");
        navigate("/dashboard");
        return;
      }

      showLoading("Cargando información del usuario...");
      try {
        const [userRes, gradosAreasRes, gradosRes, areasRes] = await Promise.all([
          instance.get(`/usuario/${user.id}`),
          getGradosAreas(user.id).catch(() => ({ data: { data: [] } })),
          getAllGrados(),
          getAllAreas().catch(() => ({ data: { data: [] } })),
        ]);
        const data = userRes.data.data || userRes.data;
        setUsuarioData(data);

        const asignaciones = gradosAreasRes?.data?.data ?? gradosAreasRes?.data ?? [];
        const todosGrados = gradosRes?.data?.data ?? gradosRes?.data ?? [];
        const areasList = areasRes?.data?.data ?? areasRes?.data ?? [];
        if (Array.isArray(asignaciones) && asignaciones.length > 0) {
          const gradoIds = [...new Set(asignaciones.map((a: { gradoId: number }) => a.gradoId))];
          const gradosFiltrados = todosGrados
            .filter((g: { id: number }) => gradoIds.includes(g.id))
            .sort((a: { id: number }, b: { id: number }) => a.id - b.id);
          setGradosSecundaria(gradosFiltrados);
          if (gradosFiltrados.length > 0) {
            const nivelId = gradosFiltrados[0].nivelId;
            const nivel = data?.nivel || gradosFiltrados[0].nivel;
            setNivelSecundaria(
              nivel ? { id: nivel.id ?? nivelId, nombre: nivel.nombre } : { id: nivelId, nombre: "Secundaria" }
            );
          }
          setIsSecundaria(true);
          const areaIds = [...new Set(asignaciones.map((a: { areaId: number }) => a.areaId))];
          const nombres = areaIds
            .map((id: number) => areasList.find((ar: { id: number }) => ar.id === id)?.nombre)
            .filter(Boolean) as string[];
          setAreasDelDocente(nombres);
          const opciones: string[] = [];
          asignaciones.forEach((a: { gradoId: number; areaId: number }) => {
            const grado = gradosFiltrados.find((g: { id: number }) => g.id === a.gradoId);
            const area = areasList.find((ar: { id: number }) => ar.id === a.areaId);
            if (grado?.nombre && area?.nombre) {
              const label = `${area.nombre} - ${grado.nombre}`;
              if (!opciones.includes(label)) opciones.push(label);
            }
          });
          setOpcionesHorario(opciones);
          setOpcionesHorarioStore(opciones);
        }

        if (hasUnfinishedUnidad()) {
          setShowRecoveryDialog(true);
        }
        setIsInitialized(true);
      } catch (error) {
        console.error("Error al cargar usuario:", error);
        handleToaster("Error al cargar información del usuario", "error");
        navigate("/dashboard");
      } finally {
        hideLoading();
      }
    }

    cargarUsuario();
  }, [user?.id]);

  // No renderizar hasta que esté inicializado
  if (!isInitialized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* ── Diálogo de recuperación ── */}
      <UnidadRecoveryDialog
        open={showRecoveryDialog}
        onContinue={handleContinueUnfinished}
        onStartNew={handleStartNew}
      />

      {/* ── Pre-paso: elegir tipo de unidad ── */}
      {wizardPhase === "select-type" && (
        <Step0TipoUnidad
          onContinue={handleTipoContinue}
          isPremium={isPremium && isSuscripcionActiva}
          onBack={() => navigate("/dashboard")}
        />
      )}

      {/* ── Wizard de 4 pasos ── */}
      {wizardPhase === "wizard" && (
        <>
          {/* Step Indicator */}
          <StepIndicator
            steps={STEPS}
            currentStep={currentStep}
            maxStepReached={horarioBloqueado ? 0 : maxStepReached}
            onStepClick={handleSetStep}
            onBack={() => navigate("/dashboard")}
          />

          {/* ── Barra fija: pestañas de grado (izq) + Cerrar y Empezar de cero (der) ── */}
          <div className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-3 flex-wrap">
              {/* Izquierda: pestañas por grado (años del docente a cargo) */}
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                {unidadBatch.length > 1 ? (
                  unidadBatch.map((u) => (
                    <button
                      key={u.id}
                      onClick={async () => {
                        if (u.id === unidadId) return;
                        // Fijar de inmediato la unidad activa para que todas las peticiones usen este id
                        selectUnidad(u.id);
                        try {
                          const res = await getUnidadById(u.id);
                          const unit = (res as any).data?.data ?? (res as any).data;
                          let cont = unit?.contenido ?? {};
                          if (typeof cont === "string") {
                            try { cont = JSON.parse(cont); } catch { cont = {}; }
                          }
                          setContenido(cont);
                          const base = useUnidadStore.getState().datosBase;
                          if (base) {
                            setDatosBase({ ...base, grado: u.gradoNombre });
                          }
                        } catch (err) {
                          console.error("Error al cargar unidad:", err);
                          handleToaster("Error al cambiar de grado", "error");
                        }
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${
                        u.id === unidadId
                          ? "bg-violet-600 text-white shadow-md"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {u.gradoNombre}
                    </button>
                  ))
                ) : unidadId && datosBase?.grado ? (
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400 px-2">
                    {datosBase.grado}
                  </span>
                ) : null}
              </div>

              {/* Derecha: Cerrar, estado de guardado, Empezar de cero */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800 transition-all"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Cerrar</span>
                </button>
                {unidadId && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    {contenidoSaveStatus === "saving" && (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Guardando...
                      </>
                    )}
                    {contenidoSaveStatus === "saved" && (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-600" />
                        Guardado
                      </>
                    )}
                    {contenidoSaveStatus === "error" && (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        Error al guardar
                      </>
                    )}
                  </span>
                )}
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-sm sm:text-base font-semibold text-white bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 shadow-md shadow-amber-500/25 hover:shadow-lg hover:shadow-amber-500/30 transition-all active:scale-95"
                >
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                  Empezar de cero
                </button>
              </div>
            </div>
          </div>

          {/* ── Diálogo de confirmación: Empezar de cero ── */}
          <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
            <AlertDialogContent className="max-w-sm sm:max-w-md mx-4 sm:mx-auto rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-lg">
                  <RotateCcw className="w-5 h-5 text-amber-500" />
                  ¿Empezar de cero?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-slate-600 dark:text-slate-400">
                  Se eliminará todo el progreso actual de la unidad (datos, contenido generado por IA, etc.). Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                <AlertDialogCancel className="rounded-xl">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleEmpezarDeCero}
                  className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Sí, empezar de cero
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Resumen lateral */}
          <UnidadDrawer />

          {/* Contenido principal */}
          <div className="mx-auto">
            {/* Gate: Horario obligatorio para Inicial, Secundaria, Educación Física (Primaria NO se toca) */}
            {horarioBloqueado && usuarioData && (
              <div className="max-w-6xl mx-auto px-4 py-6">
                {!horarioValido ? (
                  <div className="mb-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Para tu nivel, el horario escolar es obligatorio. Sube una foto de tu horario para continuar con los siguientes pasos.
                    </p>
                  </div>
                ) : (
                  <div className="mb-4 p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      Horario listo. Revisa si quieres y luego continúa al Paso 1.
                    </p>
                    <Button
                      onClick={() => setGateHorarioConfirmado(true)}
                      className="bg-green-600 hover:bg-green-700 text-white gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Continuar al Paso 1: Datos Generales
                    </Button>
                  </div>
                )}
                <HorarioPanel
                  horario={horarioLocal}
                  scanning={horarioScanning}
                  confianza={horarioConfianza}
                  notas={horarioNotas}
                  error={horarioError}
                  onScan={escanearDesdeArchivo}
                  onSlotChange={actualizarSlot}
                  onClear={limpiarHorario}
                  onStartManual={() => iniciarManual(6)}
                  areasDelDocente={areasDelDocente.length > 0 ? areasDelDocente : undefined}
                  opcionesHorario={(opcionesHorario.length > 0 ? opcionesHorario : opcionesHorarioStore?.length ? opcionesHorarioStore : undefined)}
                  gradosParaHorario={gradosSecundaria}
                  incluyeTutoria={incluyeTutoria}
                  incluyePlanLector={incluyePlanLector}
                  onIncluyeTutoriaChange={setIncluyeTutoria}
                  onIncluyePlanLectorChange={setIncluyePlanLector}
                  disabled={false}
                  obligatorio
                />
              </div>
            )}

            {!horarioBloqueado && currentStep === 1 && usuarioData && (
              isSecundaria && nivelSecundaria && gradosSecundaria.length > 0 ? (
                <Step1DatosUnidadBatch
                  pagina={currentStep}
                  setPagina={handleSetStep}
                  usuario={usuarioData}
                  gradosDisponibles={gradosSecundaria}
                  nivelId={nivelSecundaria.id}
                  nivelNombre={nivelSecundaria.nombre}
                />
              ) : (
                <Step1DatosUnidad
                  pagina={currentStep}
                  setPagina={handleSetStep}
                  usuario={usuarioData}
                  tipoUnidad={tipoUnidad}
                  maxMiembros={maxMiembros}
                />
              )
            )}

            {!horarioBloqueado && currentStep === 2 && usuarioData && (
              <Step2SituacionPropositos
                pagina={currentStep}
                setPagina={handleSetStep}
                usuario={usuarioData}
              />
            )}

            {!horarioBloqueado && currentStep === 3 && usuarioData && (
              <Step3EnfoquesComplementos
                pagina={currentStep}
                setPagina={handleSetStep}
                usuario={usuarioData}
              />
            )}

            {!horarioBloqueado && currentStep === 4 && usuarioData && (
              <Step4SecuenciaFinal
                pagina={currentStep}
                setPagina={handleSetStep}
                usuario={usuarioData}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default CrearUnidad;
