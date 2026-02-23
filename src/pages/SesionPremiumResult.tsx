import { useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  FileDown,
  Printer,
  Cloud,
  CloudOff,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { SesionPremiumDoc } from "@/components/SesionPremiumDoc";
import { useSesionPremiumPDF } from "@/hooks/useSesionPremiumPDF";
import type { ISesionPremiumResponse } from "@/interfaces/ISesionPremium";

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

  // Obtener data del state de navegación
  const premiumData =
    (location.state as { premiumData?: ISesionPremiumResponse })
      ?.premiumData ?? null;

  const { isGenerating, isSaving, isSaved, handleDownloadPDF, handlePrint } =
    useSesionPremiumPDF(documentRef, premiumData);

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
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4">
            No hay sesión Premium disponible
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Genera una sesión desde el calendario de tu unidad.
          </p>
          <Button onClick={() => navigate("/generar-sesion")}>
            Ir al Calendario
          </Button>
        </div>
      </div>
    );
  }

  // ── Página con documento ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <style>{printStyles}</style>
      <div className="max-w-6xl mx-auto">
        {/* Header con botones */}
        <div
          className="no-print"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/generar-sesion")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1
              style={{
                fontSize: "1.875rem",
                fontWeight: "700",
                background:
                  "linear-gradient(to right, #2563eb, #0891b2)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Vista Previa – Sesión Premium
            </h1>
          </div>
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              alignItems: "center",
            }}
          >
            {/* Indicador de guardado */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                fontSize: "0.75rem",
                color: isSaved
                  ? "#16a34a"
                  : isSaving
                    ? "#2563eb"
                    : "#94a3b8",
              }}
            >
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

            <Button
              onClick={handlePrint}
              disabled={isGenerating}
              variant="outline"
              style={{ gap: "0.5rem" }}
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
            <Button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              style={{ gap: "0.5rem" }}
              className="bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              <FileDown className="h-4 w-4" />
              {isGenerating ? "Generando PDF..." : "Descargar PDF"}
            </Button>
          </div>
        </div>

        {/* Documento para captura PDF */}
        <div id="print-content" ref={documentRef}>
          <SesionPremiumDoc data={premiumData} />
        </div>
      </div>
    </div>
  );
}

export default SesionPremiumResult;
