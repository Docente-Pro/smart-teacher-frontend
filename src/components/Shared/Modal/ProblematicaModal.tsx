import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import ReusableModal from "@/components/Shared/Modal/ReusableModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";
import { usePermissions } from "@/hooks/usePermissions";
import { problematicaApiService } from "@/features/problematicas/services/problematica-api.service";
import { useProblematicas } from "@/features/problematicas/hooks/useProblematicas";
import CreateEditProblematicaModal from "@/features/problematicas/components/CreateEditProblematicaModal";
import { Problematica } from "@/features/problematicas/interfaces/problematica.interface";
import { applyProblematicaSelection } from "@/features/problematicas/utils/applyProblematicaSelection";
import { pickQuickStartProblematica } from "@/features/problematicas/utils/pickQuickStartProblematica";
import { updateUsuario } from "@/services/usuarios.service";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  AlertCircle,
  Edit2,
  Plus,
  Crown,
  RotateCcw,
  BookOpen,
  FileText,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  Zap,
  SlidersHorizontal,
} from "lucide-react";

type FirstSessionStep = "choose" | "pick";

interface ProblematicaModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onClose?: () => void;
  /** Flujo guiado para docentes free en su primera sesión */
  variant?: "default" | "firstSession";
  /** Paso inicial cuando variant = firstSession */
  firstSessionInitialStep?: FirstSessionStep;
}

function ProblematicaModal({
  isOpen,
  onComplete,
  onClose,
  variant = "default",
  firstSessionInitialStep = "choose",
}: ProblematicaModalProps) {
  const isFirstSession = variant === "firstSession";
  const { user: authUser, updateUser } = useAuthStore();
  const { user: usuario } = useUserStore();
  const { isPremium } = usePermissions();
  const { showLoading, hideLoading } = useGlobalLoading();
  const { problematicas, loading, loadRecomendadas, searchProblematicas } =
    useProblematicas();

  const [selectedProblematica, setSelectedProblematica] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [quickStarting, setQuickStarting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [problematicaToEdit, setProblematicaToEdit] = useState<Problematica | null>(null);
  const [firstSessionStep, setFirstSessionStep] = useState<FirstSessionStep>("choose");
  const [searchQuery, setSearchQuery] = useState("");

  const [tituloUnidad, setTituloUnidad] = useState("");
  const [situacionSignificativa, setSituacionSignificativa] = useState("");
  const situacionTextareaRef = useRef<HTMLTextAreaElement>(null);

  const prevProblematica = usuario?.problematica;
  const prevProblematicaId = usuario?.problematicaId;
  const prevTitulo = usuario?.tituloUnidadContexto || "";
  const prevSituacion = usuario?.situacionSignificativaContexto || "";
  const hasPreviousConfig = !!(prevProblematicaId || prevTitulo || prevSituacion);

  const selectedObj = useMemo(
    () => problematicas.find((p) => p.id === selectedProblematica) ?? null,
    [problematicas, selectedProblematica],
  );

  const quickStartPreview = useMemo(
    () => pickQuickStartProblematica(problematicas),
    [problematicas],
  );

  useEffect(() => {
    const el = situacionTextareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const minH = 3 * 24;
    el.style.height = `${Math.max(el.scrollHeight, minH)}px`;
  }, [situacionSignificativa, isOpen]);

  useEffect(() => {
    if (isOpen) {
      loadRecomendadas();
      setSelectedProblematica(null);
      setTituloUnidad("");
      setSituacionSignificativa("");
      setSearchQuery("");
      setFirstSessionStep(firstSessionInitialStep);
      setQuickStarting(false);
    }
  }, [isOpen, loadRecomendadas, firstSessionInitialStep]);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (query.trim().length >= 2) {
        searchProblematicas(query.trim());
      } else if (query.trim().length === 0) {
        loadRecomendadas();
      }
    },
    [searchProblematicas, loadRecomendadas],
  );

  function handleRestorePrevious() {
    if (prevProblematicaId) setSelectedProblematica(prevProblematicaId);
    if (prevTitulo) setTituloUnidad(prevTitulo);
    if (prevSituacion) setSituacionSignificativa(prevSituacion);
    if (isFirstSession) setFirstSessionStep("pick");
    handleToaster("Configuración anterior restaurada", "success");
  }

  async function persistSelection(problematica: Problematica) {
    if (!authUser?.id) {
      handleToaster("Error: no se encontró tu usuario", "error");
      return false;
    }

    await applyProblematicaSelection(problematica);

    if (isPremium) {
      const patchBody: Record<string, string> = {};
      if (tituloUnidad.trim()) patchBody.tituloUnidadContexto = tituloUnidad.trim();
      if (situacionSignificativa.trim())
        patchBody.situacionSignificativaContexto = situacionSignificativa.trim();

      if (Object.keys(patchBody).length > 0) {
        await updateUsuario(authUser.id, patchBody);
        useUserStore.getState().updateUsuario(patchBody);
      }
    }

    updateUser({ problematicaCompleta: true });
    return true;
  }

  async function handleGuardar() {
    if (!selectedProblematica) {
      handleToaster("Elige un tema para continuar", "warning");
      return;
    }

    const selected = problematicas.find((p) => p.id === selectedProblematica);
    if (!selected) {
      handleToaster("No se encontró el tema seleccionado", "error");
      return;
    }

    setSaving(true);
    showLoading("Guardando...");

    try {
      const ok = await persistSelection(selected);
      if (!ok) return;
      handleToaster(
        isFirstSession ? "¡Listo! Ahora creamos tu sesión." : "¡Configuración guardada exitosamente!",
        "success",
      );
      onComplete();
    } catch (error: unknown) {
      console.error("Error al guardar:", error);
      handleToaster(getErrorMessage(error), "error");
    } finally {
      setSaving(false);
      hideLoading();
    }
  }

  async function handleInicioRapido() {
    if (quickStarting || saving) return;

    setQuickStarting(true);
    showLoading("Preparando tu sesión...");

    try {
      let list = problematicas;
      if (!list.length) {
        const response = await problematicaApiService.getRecomendadas();
        list = response.data;
      }

      const picked = pickQuickStartProblematica(list);
      if (!picked) {
        handleToaster("No hay temas disponibles. Intenta personalizar.", "error");
        setFirstSessionStep("pick");
        return;
      }

      const ok = await persistSelection(picked);
      if (!ok) return;

      handleToaster(`Usamos "${picked.nombre}". ¡Vamos a tu sesión!`, "success");
      onComplete();
    } catch (error: unknown) {
      console.error("Error en inicio rápido:", error);
      handleToaster(getErrorMessage(error), "error");
    } finally {
      setQuickStarting(false);
      hideLoading();
    }
  }

  function getErrorMessage(error: unknown): string {
    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "data" in error.response &&
      error.response.data &&
      typeof error.response.data === "object" &&
      "message" in error.response.data &&
      typeof error.response.data.message === "string"
    ) {
      return error.response.data.message;
    }
    return "Error al guardar la configuración";
  }

  function renderPreviousConfigBanner() {
    if (!hasPreviousConfig) return null;

    return (
      <div className="rounded-[20px] border border-[#FDE68A] bg-[#FFFBEB] p-4">
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 shrink-0 text-[#B45309]" aria-hidden="true" />
            <span className="text-xs font-extrabold uppercase tracking-wide text-[#B45309]">
              Última configuración usada
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRestorePrevious}
            className="h-8 shrink-0 text-xs font-bold text-[#B45309] hover:bg-[#FEF3C7]"
          >
            Usar de nuevo
          </Button>
        </div>
        {prevProblematica && (
          <p className="text-sm font-bold text-[#1F2937]">{prevProblematica.nombre}</p>
        )}
      </div>
    );
  }

  function renderPremiumContext() {
    if (!isPremium) return null;

    return (
      <div className="rounded-[20px] border border-[#C7D2FE] bg-[#EEF2FF] p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-[#4338CA]" aria-hidden="true" />
          <span className="text-xs font-extrabold uppercase tracking-wide text-[#4338CA]">
            Contexto de la sesión
          </span>
          <span className="ml-auto text-xs font-semibold text-[#6366F1]">Opcional</span>
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-[#1F2937]">
            <BookOpen className="h-3.5 w-3.5 text-[#6366F1]" aria-hidden="true" />
            Título de la unidad
          </label>
          <input
            type="text"
            value={tituloUnidad}
            onChange={(e) => setTituloUnidad(e.target.value)}
            placeholder='Ej: "Unidad 3: Números decimales"'
            className="h-11 w-full rounded-[14px] border border-[#E6EBF2] bg-white px-3 text-base font-semibold text-[#1F2937] placeholder:text-[#9CA3AF] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)]"
          />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-[#1F2937]">
            <FileText className="h-3.5 w-3.5 text-[#6366F1]" aria-hidden="true" />
            Situación significativa / Reto
          </label>
          <textarea
            ref={situacionTextareaRef}
            value={situacionSignificativa}
            onChange={(e) => setSituacionSignificativa(e.target.value)}
            placeholder='Ej: "Los estudiantes identificarán el uso de decimales en situaciones cotidianas..."'
            rows={3}
            className="min-h-[4.5rem] w-full resize-none overflow-hidden rounded-[14px] border border-[#E6EBF2] bg-white px-3 py-2 text-base font-semibold text-[#1F2937] placeholder:text-[#9CA3AF] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)]"
          />
        </div>
      </div>
    );
  }

  function renderProblematicaGrid(compact = false) {
    const gridClass = compact
      ? "grid grid-cols-1 gap-3 sm:grid-cols-2"
      : "grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3";

    return (
      <div className={gridClass}>
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-[20px]" />
            ))}
          </>
        ) : problematicas.length === 0 ? (
          <div className="col-span-full py-10 text-center">
            <p className="text-base font-semibold text-[#6B7280]">
              No encontramos temas con esa búsqueda.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                loadRecomendadas();
              }}
              className="mt-2 text-base font-bold text-[#3B6CB5] hover:underline"
            >
              Ver todos los temas
            </button>
          </div>
        ) : (
          problematicas.map((problematica) => {
            const isSelected = selectedProblematica === problematica.id;

            return (
              <div key={problematica.id} className="relative group">
                <button
                  type="button"
                  onClick={() => setSelectedProblematica(problematica.id)}
                  className={`
                    dp-press h-full w-full rounded-[20px] border-2 p-4 text-left transition-all duration-200
                    ${
                      isSelected
                        ? "border-[#FF8B5C] bg-[#FFEDE5] shadow-[0_8px_24px_rgba(255,139,92,0.18)]"
                        : "border-[#E6EBF2] bg-white hover:border-[#6B9FE8]/60 hover:shadow-[0_4px_16px_rgba(31,41,55,0.06)]"
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`
                        mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2
                        ${isSelected ? "border-[#FF8B5C] bg-[#FF8B5C]" : "border-[#D1D5DB] bg-white"}
                      `}
                      aria-hidden="true"
                    >
                      {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                    </span>
                    <span className="min-w-0">
                      <span
                        className={`block text-base font-extrabold leading-snug ${
                          isSelected ? "text-[#C2410C]" : "text-[#1F2937]"
                        }`}
                      >
                        {problematica.nombre}
                      </span>
                      <span className="mt-1.5 block text-sm font-semibold leading-6 text-[#6B7280] line-clamp-3">
                        {problematica.descripcion}
                      </span>
                    </span>
                  </div>
                </button>

                {!isFirstSession && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProblematicaToEdit(problematica);
                      setShowCreateModal(true);
                    }}
                    className="absolute right-2 top-2 rounded-[12px] border border-[#E6EBF2] bg-white p-2 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:border-[#FF8B5C]/40"
                    title="Personalizar esta problemática"
                  >
                    <Edit2 className="h-4 w-4 text-[#FF8B5C]" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    );
  }

  function renderFirstSessionChoose() {
    return (
      <div
        className="space-y-5"
        style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}
      >
        <p className="text-center text-base font-semibold leading-7 text-[#6B7280]">
          Estás probando Docente Pro. Elige cómo quieres empezar — puedes cambiar el tema después.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleInicioRapido}
            disabled={quickStarting || loading}
            className="dp-press dp-lift group relative overflow-hidden rounded-[24px] border-2 border-[#FF8B5C] bg-[#FFEDE5] p-5 text-left shadow-[0_12px_32px_rgba(255,139,92,0.16)] transition-all hover:bg-[#FFE4D6] disabled:cursor-wait disabled:opacity-80 sm:p-6"
          >
            <span className="absolute right-4 top-4 rounded-full bg-[#FF8B5C] px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white">
              Recomendado
            </span>
            <span className="grid h-12 w-12 place-items-center rounded-[16px] bg-[#FF8B5C] text-white shadow-[0_8px_20px_rgba(255,139,92,0.28)]">
              <Zap className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="mt-4 block text-xl font-extrabold text-[#1F2937]">
              Inicio rápido
            </span>
            <span className="mt-2 block text-base font-semibold leading-7 text-[#9A3412]">
              Ve el resultado ya. Usamos un tema popular y pasas directo a crear tu sesión.
            </span>
            <span className="mt-4 inline-flex items-center text-base font-extrabold text-[#C2410C]">
              {quickStarting ? "Preparando..." : "Probar ahora"}
              {!quickStarting && <ChevronRight className="ml-1 h-5 w-5" aria-hidden="true" />}
            </span>
            {quickStartPreview && !quickStarting && (
              <span className="mt-3 block rounded-[14px] border border-[#FFD6C2] bg-white/70 px-3 py-2 text-sm font-semibold text-[#6B7280]">
                Tema sugerido:{" "}
                <span className="font-extrabold text-[#1F2937]">{quickStartPreview.nombre}</span>
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setFirstSessionStep("pick")}
            className="dp-press rounded-[24px] border-2 border-[#E6EBF2] bg-white p-5 text-left transition-all hover:border-[#6B9FE8]/50 hover:shadow-[0_8px_24px_rgba(31,41,55,0.06)] sm:p-6"
          >
            <span className="grid h-12 w-12 place-items-center rounded-[16px] bg-[#EAF2FC] text-[#3B6CB5]">
              <SlidersHorizontal className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="mt-4 block text-xl font-extrabold text-[#1F2937]">
              Personalizar tema
            </span>
            <span className="mt-2 block text-base font-semibold leading-7 text-[#6B7280]">
              Elige tú el reto de tu aula. Ideal si ya sabes qué problemática trabajas.
            </span>
            <span className="mt-4 inline-flex items-center text-base font-extrabold text-[#3B6CB5]">
              Elegir tema
              <ChevronRight className="ml-1 h-5 w-5" aria-hidden="true" />
            </span>
            <span className="mt-3 block text-sm font-semibold text-[#9CA3AF]">
              ~1 minuto
            </span>
          </button>
        </div>
      </div>
    );
  }

  function renderFirstSessionPick() {
    return (
      <div
        className="space-y-5"
        style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}
      >
        {renderPreviousConfigBanner()}

        <div className="rounded-[20px] border border-[#C5D8F2] bg-[#EAF2FC] px-4 py-3.5">
          <p className="text-base font-extrabold text-[#1F2937]">
            ¿Cuál se parece más a tu aula?
          </p>
          <p className="mt-1 text-sm font-semibold text-[#3B6CB5]">
            Toca una tarjeta. Si no estás seguro/a, elige el que más se acerque.
          </p>
        </div>

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar por nombre, ej. emociones, tecnología..."
            className="h-12 border-[#E6EBF2] bg-white pl-10 text-base font-semibold text-[#1F2937] placeholder:text-[#9CA3AF] focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)]"
          />
        </div>

        {renderProblematicaGrid(true)}

        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-[#E6EBF2] pt-4 text-center">
          <Sparkles className="h-4 w-4 text-[#6B9FE8]" aria-hidden="true" />
          <button
            type="button"
            onClick={() => {
              setProblematicaToEdit(null);
              setShowCreateModal(true);
            }}
            className="text-sm font-bold text-[#3B6CB5] hover:underline"
          >
            Ninguno encaja — quiero describir el mío
          </button>
        </div>
      </div>
    );
  }

  function renderDefaultContent() {
    return (
      <div className="space-y-5">
        {renderPreviousConfigBanner()}
        {renderPremiumContext()}

        <div className="flex items-start gap-3 rounded-lg border-l-4 border-dp-blue-500 bg-blue-50 p-3.5 dark:bg-blue-900/20">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-dp-blue-600" aria-hidden="true" />
          <div>
            <h3 className="mb-0.5 text-sm font-semibold text-slate-900 dark:text-white">
              {isPremium ? "Selecciona la problemática" : "Antes de crear tu sesión"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {isPremium
                ? "Elige la problemática que abordarás en esta sesión individual."
                : "Elige el tema principal que quieres abordar en tus sesiones de aprendizaje."}
            </p>
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
            Selecciona la problemática principal:
          </h4>
          {renderProblematicaGrid(false)}
        </div>

        <p className="border-t border-slate-200 pt-3 text-center text-xs text-slate-500 dark:border-slate-700">
          Podrás cambiar esta configuración más adelante desde tu perfil.
        </p>
      </div>
    );
  }

  const modalTitle = isFirstSession
    ? firstSessionStep === "choose"
      ? "¿Cómo quieres empezar?"
      : "Elige el tema de tu aula"
    : isPremium
      ? "Configurar sesión individual"
      : "Elige el tema de tu aula";

  const canDismissFirstSession = isFirstSession && firstSessionStep === "choose";

  const firstSessionFooter =
    firstSessionStep === "choose" ? (
      onClose ? (
        <div className="flex w-full justify-center">
          <button
            type="button"
            onClick={onClose}
            className="text-base font-bold text-[#6B7280] hover:text-[#3B6CB5] hover:underline"
          >
            Ahora no
          </button>
        </div>
      ) : null
    ) : (
      <div className="flex w-full flex-col gap-3">
        {selectedObj && (
          <div className="rounded-[16px] border border-[#FF8B5C]/30 bg-[#FFEDE5] px-4 py-3 text-left">
            <p className="text-xs font-extrabold uppercase tracking-wide text-[#C2410C]">
              Tu elección
            </p>
            <p className="mt-0.5 text-base font-extrabold text-[#1F2937]">{selectedObj.nombre}</p>
          </div>
        )}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setFirstSessionStep("choose")}
            className="inline-flex min-h-[48px] items-center justify-center text-base font-bold text-[#3B6CB5] hover:underline"
          >
            <ChevronLeft className="mr-1 h-5 w-5" aria-hidden="true" />
            Volver
          </button>
          <button
            type="button"
            onClick={handleGuardar}
            disabled={!selectedProblematica || saving}
            className="dp-press dp-lift inline-flex min-h-[52px] items-center justify-center rounded-[18px] bg-[#FF8B5C] px-6 text-base font-extrabold text-white shadow-[0_12px_28px_rgba(255,139,92,0.24)] hover:bg-[#F97316] disabled:cursor-not-allowed disabled:opacity-50 sm:ml-auto"
          >
            {saving ? "Guardando..." : "Continuar a mi sesión"}
          </button>
        </div>
      </div>
    );

  const defaultFooter = (
    <>
      <Button
        variant="outline"
        onClick={() => setShowCreateModal(true)}
        className="mr-auto"
      >
        <Plus className="mr-2 h-4 w-4" />
        Crear Nueva
      </Button>
      <Button
        onClick={handleGuardar}
        disabled={!selectedProblematica || saving}
        className="bg-gradient-to-r from-dp-blue-500 to-dp-orange-500 px-6 font-semibold text-white hover:from-dp-blue-600 hover:to-dp-orange-600"
      >
        {saving ? "Guardando..." : "Continuar"}
      </Button>
    </>
  );

  return (
    <>
      <ReusableModal
        isOpen={isOpen}
        onClose={() => {
          if (canDismissFirstSession) onClose?.();
        }}
        title={modalTitle}
        size="xl"
        gradient={isFirstSession ? "cyan-blue" : "blue-orange"}
        showCloseButton={isFirstSession ? canDismissFirstSession && !!onClose : !!onClose}
        closeOnOverlayClick={isFirstSession ? canDismissFirstSession : !!onClose}
        footer={isFirstSession ? firstSessionFooter : defaultFooter}
      >
        {isFirstSession
          ? firstSessionStep === "choose"
            ? renderFirstSessionChoose()
            : renderFirstSessionPick()
          : renderDefaultContent()}
      </ReusableModal>

      <CreateEditProblematicaModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setProblematicaToEdit(null);
        }}
        basadaEn={problematicaToEdit}
        onSuccess={async (problematica) => {
          setSelectedProblematica(problematica.id);
          setShowCreateModal(false);
          setProblematicaToEdit(null);

          try {
            showLoading("Guardando...");
            const ok = await persistSelection(problematica);
            if (!ok) return;
            handleToaster(
              isFirstSession ? "¡Listo! Ahora creamos tu sesión." : "¡Configuración guardada!",
              "success",
            );
            onComplete();
          } catch (err: unknown) {
            handleToaster(getErrorMessage(err), "error");
          } finally {
            hideLoading();
          }
        }}
      />
    </>
  );
}

export default ProblematicaModal;
