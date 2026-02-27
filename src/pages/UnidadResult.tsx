import { Document, Footer } from "@htmldocs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileDown,
  Printer,
  Cloud,
  CloudOff,
  Loader2,
  ArrowLeft,
  PartyPopper,
  Check,
  Copy,
  Share2,
  MessageCircle,
  Home,
} from "lucide-react";
import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useUnidadPDFGeneration } from "@/hooks/useUnidadPDFGeneration";
import { useUnidadStore } from "@/store/unidad.store";

import {
  UnidadDocStyles,
  UnidadDocHeader,
  UnidadDocDatosGenerales,
  UnidadDocSituacion,
  UnidadDocPropositos,
  UnidadDocEnfoques,
  UnidadDocSecuencia,
  UnidadDocMaterialesReflexiones,
} from "@/components/UnidadDoc";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";

/**
 * Página de resultado / vista previa del documento de Unidad de Aprendizaje.
 * Lee los datos del store Zustand y renderiza el documento HTML estilo MINEDU.
 * Auto-guarda el PDF en S3 al montar.
 */
function UnidadResult() {
  const documentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { datosBase, contenido, unidadId } = useUnidadStore();
  const { user } = useAuthStore();
  const { user: usuario } = useUserStore();
  const { isGenerating, isSaving, isSaved, handleDownloadPDF, handlePrint } =
    useUnidadPDFGeneration(documentRef);

  // ── Código compartido (viene del store, establecido durante pre-solicitar en Step0) ──
  const codigoCompartido = datosBase?.codigoCompartido || null;
  const [copied, setCopied] = useState(false);

  /** Copiar código al portapapeles */
  const handleCopiarCodigo = () => {
    if (codigoCompartido) {
      navigator.clipboard.writeText(codigoCompartido);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /** Compartir por WhatsApp */
  const handleCompartirWhatsApp = () => {
    if (!codigoCompartido) return;
    const titulo = datosBase?.titulo || "Unidad de Aprendizaje";
    const mensaje = [
      `\u00a1Hola! \ud83d\udc4b Te invito a unirte a mi unidad de aprendizaje *"${titulo}"* en Docente Pro.`,
      ``,
      `\ud83d\udccb Usa este c\u00f3digo para unirte:`,
      `\ud83d\udd11 *${codigoCompartido}*`,
      ``,
      `Ingresa a \ud83d\udc49 https://www.docente-pro.com y busca la opci\u00f3n "Unirse a unidad compartida".`,
    ].join("\n");
    const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Estilos para ocultar elementos al imprimir
  const printStyles = `
    @media print {
      @page {
        margin: 0;
        size: A4 landscape;
      }
      body {
        margin: 0;
        padding: 0;
      }
      body * {
        visibility: hidden;
      }
      #print-content, #print-content * {
        visibility: visible;
      }
      #print-content {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
      .no-print {
        display: none !important;
      }
    }
  `;

  if (!datosBase || !unidadId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4">
            No hay unidad creada
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Debes crear una unidad primero en el wizard
          </p>
          <a
            href="/crear-unidad"
            className="inline-block px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Ir a Crear Unidad
          </a>
        </div>
      </div>
    );
  }

  const areasNombres = datosBase.areas.map((a) => a.nombre);
  const gradoLabel = datosBase.grado || "";
  const docenteNombre = usuario?.nombre || user?.name || "";
  const institucion = usuario?.nombreInstitucion || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 p-8">
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
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Button
              onClick={() => navigate("/crear-unidad")}
              variant="ghost"
              className="h-10 px-3"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1
              style={{
                fontSize: "1.875rem",
                fontWeight: "700",
                background: "linear-gradient(to right, #d97706, #ea580c)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Vista Previa - Unidad de Aprendizaje
            </h1>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            {/* Botón Ir al inicio */}
            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              style={{ gap: "0.5rem" }}
            >
              <Home className="h-4 w-4" />
              Inicio
            </Button>
            {/* Indicador de guardado */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                fontSize: "0.75rem",
                color: isSaved ? "#16a34a" : isSaving ? "#d97706" : "#94a3b8",
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
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
            >
              <FileDown className="h-4 w-4" />
              {isGenerating ? "Generando PDF..." : "Descargar PDF"}
            </Button>
          </div>
        </div>

        {/* ═══ CÓDIGO COMPARTIDO (unidad COMPARTIDA) ═══ */}
        {codigoCompartido && datosBase?.tipo === "COMPARTIDA" && (
          <div className="no-print mb-6">
            <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 shadow-xl">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/30">
                    <PartyPopper className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                      ¡Unidad activada!
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      Comparte este código con los docentes que quieran unirse:
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg px-4 py-2 border-2 border-emerald-300 dark:border-emerald-700">
                        <Share2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-2xl font-mono font-bold tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
                          {codigoCompartido}
                        </span>
                      </div>
                      <Button
                        onClick={handleCopiarCodigo}
                        variant="outline"
                        size="sm"
                        className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-1" />
                            Copiar
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleCompartirWhatsApp}
                        size="sm"
                        className="bg-[#25D366] hover:bg-[#1DA851] text-white shadow-md shadow-green-500/20"
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        WhatsApp
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Documento */}
        <div id="print-content" ref={documentRef}>
          <Document size="A4" orientation="landscape" margin="0.5in">
            <UnidadDocStyles />

            {/* HEADER */}
            <UnidadDocHeader
              titulo={datosBase.titulo}
              numeroUnidad={datosBase.numeroUnidad}
              grado={gradoLabel}
            />

            {/* I. DATOS GENERALES */}
            <UnidadDocDatosGenerales
              institucion={institucion}
              docente={docenteNombre}
              grado={datosBase.grado}
              nivel={datosBase.nivel}
              fechaInicio={datosBase.fechaInicio}
              fechaFin={datosBase.fechaFin}
              areas={areasNombres}
            />

            {/* PLANTEAMIENTO DE LA SITUACIÓN + EVIDENCIAS */}
            <UnidadDocSituacion
              situacionSignificativa={contenido.situacionSignificativa || ""}
              evidencias={contenido.evidencias}
              grado={gradoLabel}
              imagenSituacionUrl={contenido.imagenSituacionUrl}
            />

            {/* II. PROPÓSITO DE APRENDIZAJE */}
            <UnidadDocPropositos
              propositos={contenido.propositos}
              areasComplementarias={contenido.areasComplementarias}
            />

            {/* III. ENFOQUES TRANSVERSALES */}
            <UnidadDocEnfoques enfoques={contenido.enfoques} />

            {/* IV. SECUENCIA DE ACTIVIDADES */}
            <UnidadDocSecuencia secuencia={contenido.secuencia} />

            {/* V. MATERIALES + VI. REFLEXIONES + FIRMAS */}
            <UnidadDocMaterialesReflexiones
              materiales={contenido.materiales}
              reflexiones={contenido.reflexiones}
            />

            {/* Footer */}
            <Footer position="bottom-center">
              {() => (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                    fontSize: "8pt",
                    borderTop: "1px solid #000",
                    paddingTop: "0.2rem",
                  }}
                >
                  <span>
                    Unidad de Aprendizaje N° {datosBase.numeroUnidad} — {datosBase.titulo}
                  </span>
                </div>
              )}
            </Footer>
          </Document>
        </div>
      </div>
    </div>
  );
}

export default UnidadResult;
