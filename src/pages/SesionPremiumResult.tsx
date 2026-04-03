import { useEffect, useRef, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileDown, FileText, Printer, Cloud, CloudOff, Loader2, ArrowLeft, ClipboardList, Sparkles, Eye, Pencil, Calendar } from "lucide-react";
import { SesionPremiumDoc } from "@/components/SesionPremiumDoc";
import { useSesionPremiumPDF } from "@/hooks/useSesionPremiumPDF";
import { useAuthStore } from "@/store/auth.store";
import { getInsigniaDataUrl } from "@/utils/insigniaCache";
import { generarFichaAplicacion, obtenerFichasPorSesion } from "@/services/fichaAplicacion.service";
import { editarContenidoSesion } from "@/services/sesiones.service";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { dateOnlyToInputValue } from "@/utils/dateOnlyPeru";
import { buildInstrumentoLocal } from "@/utils/buildInstrumentoFromSesion";
import type { ISesionPremiumResponse } from "@/interfaces/ISesionPremium";
import type { IInstrumentoEvaluacion } from "@/interfaces/IInstrumentoEvaluacion";
import type { IFichaAlmacenada } from "@/interfaces/IFichaAplicacion";

/**
 * SesionPremiumResult
 *
 * Página de resultado para sesiones PREMIUM. Recibe la respuesta completa
 * del backend (ISesionPremiumResponse) a través de `location.state.premiumData`.
 *
 * El hook `useSesionPremiumPDF` genera automáticamente el PDF y lo sube a S3.
 * El usuario puede también descargar o imprimir manualmente.
 */
function SesionPremiumResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const documentRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  // Obtener data del state de navegación
  const stateData = location.state as {
    premiumData?: ISesionPremiumResponse;
    instrumento?: IInstrumentoEvaluacion | null;
  } | null;
  const premiumData = stateData?.premiumData ?? null;
  const instrumento = stateData?.instrumento ?? null;

  const { isGenerating, isSaving, isSaved, handleDownloadPDF, handlePrint, handleGenerateWord, handleVerWord, isGeneratingWord, wordUrl } = useSesionPremiumPDF(documentRef, premiumData);

  // ── Fecha de la sesión (editable, alineada a Perú) ───────────────────
  const sesionDateRaw = premiumData?.sesion
    ? (premiumData.sesion as any).fechaInicio ?? (premiumData.sesion as any).createdAt
    : "";
  const [fechaSesion, setFechaSesion] = useState("");
  const [savingFecha, setSavingFecha] = useState(false);

  useEffect(() => {
    if (premiumData?.sesion) {
      setFechaSesion(dateOnlyToInputValue(sesionDateRaw));
    }
  }, [premiumData?.sesion, sesionDateRaw]);

  const displayData = useMemo(() => {
    if (!premiumData) return null;
    return {
      ...premiumData,
      sesion: {
        ...premiumData.sesion,
        fechaInicio: fechaSesion || ((premiumData.sesion as any).fechaInicio ?? (premiumData.sesion as any).createdAt),
      },
    };
  }, [premiumData, fechaSesion]);

  // Fallback robusto: si el instrumento no llega por navigation state,
  // construirlo desde propositoAprendizaje (instrumento/instrumentoEvaluacion).
  const instrumentoFinal = useMemo((): IInstrumentoEvaluacion | null => {
    if (instrumento) return instrumento;
    if (!premiumData?.sesion) return null;

    const sesion = premiumData.sesion as any;
    const contenido = sesion.contenido;
    let parsedContenido: Record<string, any> = {};
    try {
      const c = typeof contenido === "string" ? JSON.parse(contenido) : contenido;
      if (c && typeof c === "object") parsedContenido = c;
    } catch {
      /* ignore */
    }

    const toLabel = (v: unknown) =>
      !v ? "" : typeof v === "string" ? v : (v as any)?.nombre ?? (v as any)?.name ?? String(v);
    const area = toLabel(sesion.area) || "—";
    const grado = toLabel(sesion.grado) || "—";
    const propositos = sesion.propositoAprendizaje ?? [];
    const esPlanLectorOTutoria =
      /plan\s*lector|tutor[ií]a/i.test(area) ||
      !!(sesion.recursoNarrativo || parsedContenido?.recursoNarrativo);

    if (Array.isArray(propositos) && propositos.length > 0) {
      const first =
        propositos.find(
          (p: any) =>
            (p.instrumento?.trim() || p.instrumentoEvaluacion?.trim() || p.evidencia?.trim() || p.competencia?.trim()),
        ) ?? propositos[0];
      const criteriosRaw = first.criteriosEvaluacion ?? first.criterios;
      const criteriosList = Array.isArray(criteriosRaw)
        ? criteriosRaw.map((c: any) => (typeof c === "string" ? c : c?.criterioCompleto ?? "")).filter(Boolean)
        : (typeof first.criterios === "string" ? first.criterios.split("\n").map((s: string) => s.trim()).filter(Boolean) : []);
      return buildInstrumentoLocal({
        area,
        grado,
        competencia: first.competencia ?? "—",
        evidencia: first.evidencia ?? first.evidenciaAprendizaje ?? "—",
        criterios: criteriosList.length > 0 ? criteriosList : ["—"],
        instrumento: first.instrumento?.trim() || first.instrumentoEvaluacion?.trim() || "Lista de cotejo",
      });
    }

    if (esPlanLectorOTutoria) {
      const propositoSesion = sesion.propositoSesion ?? parsedContenido?.propositoSesion ?? "";
      return buildInstrumentoLocal({
        area,
        grado,
        competencia: propositoSesion || "—",
        evidencia: "—",
        criterios: ["—"],
        instrumento: "Lista de cotejo",
      });
    }

    return null;
  }, [instrumento, premiumData]);

  const handleGuardarFecha = async () => {
    const id = premiumData?.sesion?.id;
    if (!id) return;
    setSavingFecha(true);
    try {
      const sesionAny = premiumData?.sesion as any;
      await editarContenidoSesion(id, {
        contenido: { fechaSesion: fechaSesion || undefined },
        ...(sesionAny?.unidadId ? { unidadId: sesionAny.unidadId } : {}),
        ...(sesionAny?.areaId ? { areaId: sesionAny.areaId } : {}),
      });
      handleToaster("Fecha guardada", "success");
    } catch {
      handleToaster("Error al guardar la fecha", "error");
    } finally {
      setSavingFecha(false);
    }
  };

  // ── Ficha de Aplicación — buscar existente + generar ─────────────────
  const [fichaExistente, setFichaExistente] = useState<IFichaAlmacenada | null>(null);
  const [isGeneratingFicha, setIsGeneratingFicha] = useState(false);

  // Buscar ficha existente cada vez que se monta / se regresa a la página
  useEffect(() => {
    const sesionId = premiumData?.sesion?.id;
    if (!sesionId) return;
    let cancelled = false;

    (async () => {
      try {
        const fichas = await obtenerFichasPorSesion(sesionId);
        if (!cancelled && fichas && fichas.length > 0) {
          setFichaExistente(fichas[0]);
        }
      } catch {
        // No hay ficha aún — está bien
      }
    })();

    return () => { cancelled = true; };
  }, [premiumData?.sesion?.id, location.key]);

  const handleFichaAplicacion = async () => {
    const sesionId = premiumData?.sesion?.id;
    if (!sesionId) return;

    // Si ya existe una ficha → navegar al result con el JSON (live render)
    if (fichaExistente) {
      navigate("/ficha-aplicacion-result", {
        state: {
          ficha: fichaExistente.fichaJSON,
          fichaId: fichaExistente.id,
          docente: premiumData?.docente ?? "",
          institucion: premiumData?.institucion ?? "",
          sesionId,
          presignedUrl: null,
          s3Key: null,
        },
      });
      return;
    }

    // No existe → generar nueva ficha
    setIsGeneratingFicha(true);
    try {
      const resp = await generarFichaAplicacion(sesionId, {
        incluirRespuestas: true,
        dificultad: "media",
      });

      handleToaster("¡Ficha generada! Abriendo vista previa...", "success");

      navigate("/ficha-aplicacion-result", {
        state: {
          ficha: resp.ficha,
          fichaId: resp.fichaId,
          docente: premiumData?.docente ?? "",
          institucion: premiumData?.institucion ?? "",
          sesionId,
          presignedUrl: resp.presignedUrl,
          s3Key: resp.s3Key,
        },
      });
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Error al generar la ficha";
      handleToaster(msg, "error");
    } finally {
      setIsGeneratingFicha(false);
    }
  };

  // Print styles (ocultar botones al imprimir)
  const printStyles = `
    @media print {
      @page { margin: 0; size: A4; }
      body { margin: 0; padding: 0; }
      body * { visibility: hidden; }
      #print-content, #print-content * { visibility: visible; }
      #print-content { position: absolute; left: 0; top: 0; width: 100%; }
      .no-print { display: none !important; }
    }
  `;

  // ── Sin datos → fallback ──────────────────────────────────────────────
  if (!premiumData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4">No hay sesión Premium disponible</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Genera una sesión desde el calendario de tu unidad.</p>
          <Button onClick={() => navigate("/generar-sesion")}>Ir al Calendario</Button>
        </div>
      </div>
    );
  }

  // ── Página con documento ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-8">
      <style>{printStyles}</style>
      <div className="max-w-6xl mx-auto">
        {/* Header con botones */}
        <div className="no-print flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/generar-sesion")} className="flex-shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg sm:text-[1.875rem] font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Vista Previa – Sesión Premium
            </h1>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
            {/* Fecha de la sesión (editable) */}
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-slate-500" />
              <Input
                type="date"
                value={fechaSesion}
                onChange={(e) => setFechaSesion(e.target.value)}
                className="h-8 text-sm w-[140px]"
              />
              <Button
                onClick={handleGuardarFecha}
                disabled={savingFecha || !premiumData?.sesion?.id}
                variant="outline"
                size="sm"
                className="h-8"
              >
                {savingFecha ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar fecha"}
              </Button>
            </div>
            {/* Indicador de guardado */}
            <div className="flex items-center gap-1 text-xs" style={{ color: isSaved ? "#16a34a" : isSaving ? "#2563eb" : "#94a3b8" }}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : isSaved ? (
                <>
                  <Cloud className="h-4 w-4" />
                  <span>Guardado</span>
                </>
              ) : (
                <>
                  <CloudOff className="h-4 w-4" />
                  <span>Sin guardar</span>
                </>
              )}
            </div>

            <Button onClick={handlePrint} disabled={isGenerating} variant="outline" size="sm" className="gap-1.5">
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </Button>
            <Button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              size="sm"
              className="gap-1.5 bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              <FileDown className="h-4 w-4" />
              <span className="hidden sm:inline">{isGenerating ? "Generando PDF..." : "Descargar PDF"}</span>
              <span className="sm:hidden">{isGenerating ? "..." : "PDF"}</span>
            </Button>
            {wordUrl ? (
              <Button
                onClick={handleVerWord}
                size="sm"
                variant="outline"
                className="gap-1.5 border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-950"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Ver Word</span>
                <span className="sm:hidden">Word</span>
              </Button>
            ) : (
              <Button
                onClick={handleGenerateWord}
                disabled={isGeneratingWord}
                size="sm"
                variant="outline"
                className="gap-1.5 border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-950"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">{isGeneratingWord ? "Generando Word..." : "Descargar Word"}</span>
                <span className="sm:hidden">{isGeneratingWord ? "..." : "Word"}</span>
              </Button>
            )}
            {premiumData?.sesion?.id && (
              <Button
                onClick={() => navigate(`/editar-sesion/${premiumData.sesion.id}`)}
                size="sm"
                variant="outline"
                className="gap-1.5 border-violet-300 text-violet-700 hover:bg-violet-50 dark:border-violet-600 dark:text-violet-400 dark:hover:bg-violet-950"
              >
                <Pencil className="h-4 w-4" />
                <span className="hidden sm:inline">Editar contenido</span>
                <span className="sm:hidden">Editar</span>
              </Button>
            )}
            <Button
              onClick={handleFichaAplicacion}
              disabled={isGeneratingFicha || !premiumData?.sesion?.id}
              size="sm"
              variant="outline"
              className={`gap-1.5 ${
                fichaExistente
                  ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-400 dark:hover:bg-emerald-950"
                  : "border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-950"
              }`}
            >
              {isGeneratingFicha
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : fichaExistente
                  ? <Eye className="h-4 w-4" />
                  : <ClipboardList className="h-4 w-4" />
              }
              <span className="hidden sm:inline">
                {isGeneratingFicha ? "Generando Ficha..." : fichaExistente ? "Ver Ficha" : "Ficha de Aplicación"}
              </span>
              <span className="sm:hidden">
                {isGeneratingFicha ? "..." : fichaExistente ? "Ver" : "Ficha"}
              </span>
            </Button>
          </div>
        </div>

        {/* Documento para captura PDF */}
        <div id="print-content" ref={documentRef}>
          <SesionPremiumDoc data={displayData ?? premiumData} instrumento={instrumentoFinal} insigniaUrl={getInsigniaDataUrl(user?.insigniaUrl)} />
        </div>
      </div>
    </div>
  );
}

export default SesionPremiumResult;
