import { Document, Footer } from "@htmldocs/react";
import { Button } from "@/components/ui/button";
import { FileDown, Printer, Cloud, CloudOff, Loader2, ArrowLeft } from "lucide-react";
import { useRef } from "react";
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

  // Estilos para ocultar elementos al imprimir
  const printStyles = `
    @media print {
      @page {
        margin: 0;
        size: A4;
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

        {/* Documento */}
        <div id="print-content" ref={documentRef}>
          <Document size="A4" orientation="portrait" margin="0.5in">
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
