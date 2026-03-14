/**
 * FichaAplicacionResult.tsx
 *
 * Página de resultado para Fichas de Aplicación.
 * Muestra vista previa del PDF, opciones de descarga, impresión y
 * toggle de solucionario.
 *
 * Recibe datos vía `location.state`:
 *   - ficha: IFichaAplicacionData
 *   - fichaId: string
 *   - docente: string
 *   - institucion: string
 *   - sesionId: string
 *   - presignedUrl / s3Key (para upload automático)
 */

import { useRef, useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  FileDown,
  Printer,
  ArrowLeft,
  Cloud,
  CloudOff,
  Loader2,
  Eye,
  EyeOff,
  BookOpen,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { FichaAplicacionDoc } from "@/components/FichaAplicacionDoc";
import { useAuthStore } from "@/store/auth.store";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import {
  subirFichaPDFaS3,
  confirmarUploadFicha,
} from "@/services/fichaAplicacion.service";
import type { IFichaAplicacionData } from "@/interfaces/IFichaAplicacion";

// ─── State shape (pasado desde la página de sesión) ─────────────────────────

interface FichaResultState {
  ficha: IFichaAplicacionData;
  fichaId: string;
  docente: string;
  institucion: string;
  sesionId: string;
  presignedUrl: string;
  s3Key: string;
}

function FichaAplicacionResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const documentRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  const stateData = location.state as FichaResultState | null;

  // ── Estados locales ──
  const [mostrarSolucionario, setMostrarSolucionario] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const uploadStarted = useRef(false);

  // ── Upload automático a S3 ──
  const subirAutomatico = useCallback(async () => {
    if (!stateData || !documentRef.current || uploadStarted.current) return;
    uploadStarted.current = true;

    setIsUploading(true);
    try {
      // Esperar un poco para que el DOM renderice completamente
      await new Promise((r) => setTimeout(r, 1500));

      const { generatePDFBlob } = await import("@/services/htmldocs.service");
      const pdfBlob = await generatePDFBlob(documentRef.current, {
        size: "A4",
        orientation: "portrait",
        preserveGraphicSize: true,
      });

      await subirFichaPDFaS3(stateData.presignedUrl, pdfBlob);
      await confirmarUploadFicha(stateData.fichaId, { s3Key: stateData.s3Key });

      setIsUploaded(true);
    } catch (err) {
      console.error("❌ Error al subir ficha PDF:", err);
      uploadStarted.current = false; // permitir reintento
    } finally {
      setIsUploading(false);
    }
  }, [stateData]);

  useEffect(() => {
    if (stateData?.presignedUrl) {
      subirAutomatico();
    }
  }, [subirAutomatico, stateData?.presignedUrl]);

  // ── Descarga manual ──
  const handleDownload = async () => {
    if (!documentRef.current) return;
    setIsGenerating(true);
    try {
      const { generateAndDownloadPDF } = await import("@/services/htmldocs.service");
      const filename = `Ficha_${stateData?.ficha.area ?? "Aplicacion"}_${Date.now()}.pdf`;
      await generateAndDownloadPDF(documentRef.current, {
        size: "A4",
        orientation: "portrait",
        filename,
        preserveGraphicSize: true,
      });
      handleToaster("PDF descargado", "success");
    } catch (err) {
      console.error("Error descargando PDF:", err);
      handleToaster("Error al descargar PDF", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Imprimir ──
  const handlePrint = () => {
    window.print();
  };

  // ── Print styles ──
  const printStyles = `
    @media print {
      @page { margin: 0; size: A4; }
      body { margin: 0; padding: 0; }
      body * { visibility: hidden; }
      #ficha-print-content, #ficha-print-content * { visibility: visible; }
      #ficha-print-content { position: absolute; left: 0; top: 0; width: 100%; }
      .no-print { display: none !important; }
    }
  `;

  // ── Sin datos → fallback ──
  if (!stateData?.ficha) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center max-w-md px-4">
          <BookOpen className="h-16 w-16 mx-auto text-slate-300 mb-4" />
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-2">
            No hay ficha disponible
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Genera una ficha de aplicación desde la vista de tu sesión.
          </p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  const { ficha, docente, institucion } = stateData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/60 via-white to-orange-50/60 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <style>{printStyles}</style>

      {/* ══════════════════════════════════════════════════════════════════
          Barra superior
          ══════════════════════════════════════════════════════════════════ */}
      <div className="no-print sticky top-0 z-20 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="max-w-6xl mx-auto px-4 py-3">
          {/* Fila 1: Navegación + Título */}
          <div className="flex items-center gap-3 mb-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="flex-shrink-0 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent truncate">
                  Ficha de Aplicación
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {ficha.area} — {ficha.grado}
              </p>
            </div>
          </div>

          {/* Fila 2: Acciones */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Estado de guardado */}
            <div
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: isUploaded
                  ? "#dcfce7"
                  : isUploading
                    ? "#dbeafe"
                    : "#f1f5f9",
                color: isUploaded
                  ? "#166534"
                  : isUploading
                    ? "#1e40af"
                    : "#64748b",
              }}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : isUploaded ? (
                <>
                  <Cloud className="h-3.5 w-3.5" />
                  <span>Guardado</span>
                </>
              ) : (
                <>
                  <CloudOff className="h-3.5 w-3.5" />
                  <span>Sin guardar</span>
                </>
              )}
            </div>

            {/* Toggle solucionario */}
            <div className="flex items-center gap-1.5 text-xs mr-auto">
              <Switch
                checked={mostrarSolucionario}
                onCheckedChange={setMostrarSolucionario}
                className="scale-75"
              />
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                {mostrarSolucionario ? (
                  <Eye className="h-3.5 w-3.5" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5" />
                )}
                Solucionario
              </span>
            </div>

            {/* Botones */}
            <Button
              onClick={handlePrint}
              disabled={isGenerating}
              variant="outline"
              size="sm"
              className="gap-1.5"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </Button>
            <Button
              onClick={handleDownload}
              disabled={isGenerating}
              size="sm"
              className="gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {isGenerating ? "Generando..." : "Descargar PDF"}
              </span>
              <span className="sm:hidden">
                {isGenerating ? "..." : "PDF"}
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          Resumen rápido (cards)
          ══════════════════════════════════════════════════════════════════ */}
      <div className="no-print max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SummaryCard
            label="Tipo de Ficha"
            value={TIPO_FICHA_LABELS[ficha.tipoFicha] ?? ficha.tipoFicha}
            icon="📝"
          />
          <SummaryCard
            label="Secciones"
            value={`${ficha.secciones.length} bloques`}
            icon="📋"
          />
          <SummaryCard
            label="Área"
            value={ficha.area}
            icon="📚"
          />
          <SummaryCard
            label="Dificultad"
            value={ficha.secciones.length > 6 ? "Media-Alta" : "Media"}
            icon="📊"
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          Documento PDF
          ══════════════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <div
          id="ficha-print-content"
          ref={documentRef}
          className="shadow-xl rounded-lg overflow-hidden"
        >
          <FichaAplicacionDoc
            ficha={ficha}
            docente={docente}
            institucion={institucion}
            mostrarSolucionario={mostrarSolucionario}
            insigniaUrl={user?.insigniaUrl}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Helpers UI ─────────────────────────────────────────────────────────────

const TIPO_FICHA_LABELS: Record<string, string> = {
  problemas: "Problemas",
  comprension_lectora: "Comprensión Lectora",
  indagacion: "Indagación",
  reflexion: "Reflexión",
  apreciacion: "Apreciación",
  worksheet: "Worksheet",
  registro_actividad: "Registro de Actividad",
};

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700/60 p-3 flex items-start gap-2.5 shadow-sm">
      <span className="text-xl leading-none mt-0.5">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500 font-medium">
          {label}
        </p>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

export default FichaAplicacionResult;
