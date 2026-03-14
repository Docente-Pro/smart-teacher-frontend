import { Document, Footer } from "@htmldocs/react";
import { Button } from "@/components/ui/button";
import { FileDown, Printer, Cloud, CloudOff, Loader2, Home } from "lucide-react";
import { useRef, useMemo } from "react";
import { useNavigate } from "react-router";
import { usePDFGeneration } from "@/hooks/usePDFGeneration";
import { DocumentStyles } from "@/components/DocTest";
import { DocumentHeader } from "@/components/DocTest/DocumentHeader";
import { DatosGeneralesSection } from "@/components/DocTest/DatosGeneralesSection";
import { PropositoAprendizajeSection } from "@/components/DocTest/PropositoAprendizajeSection";
import { PropositoSesionSection } from "@/components/DocTest/AdditionalSections";
import { EnfoquesTransversalesSection } from "@/components/DocTest/EnfoquesTransversalesSection";
import { PreparacionSesionSection } from "@/components/DocTest/PreparacionSesionSection";
import { InstrumentoEvaluacionSection } from "@/components/SesionPremiumDoc/InstrumentoEvaluacionSection";
import { buildInstrumentoLocal } from "@/utils/buildInstrumentoFromSesion";
import { getSavedAlumnos } from "@/utils/alumnosStorage";
import type { ICriterioIA } from "@/interfaces/ISesionAprendizaje";

import { useSesionStore } from "@/store/sesion.store";
import { SecuenciaDidacticaSection } from "@/components/DocTest/SecuenciaDidacticaSection";
import { getAreaColor } from "@/constants/areaColors";

function DocTest() {
  const documentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { sesion } = useSesionStore();
  const { isGenerating, isSaving, isSaved, handleDownloadPDF, handlePrint } = usePDFGeneration(documentRef, sesion?.datosGenerales.area);

  // ── Derivar colores del área ────────────────────────────────────
  const areaHex = sesion ? getAreaColor(sesion.datosGenerales.area).hex : null;
  // ── Alumnos guardados en localStorage ──────────────────────────────
  const alumnos = useMemo(() => getSavedAlumnos(), []);

  // ── Construir instrumento de evaluación desde datos de la sesión ────
  const instrumento = useMemo(() => {
    if (!sesion) return null;
    const p = sesion.propositoAprendizaje;
    const criterios = (p.criteriosEvaluacion ?? []).map((c) =>
      typeof c === "string" ? c : (c as ICriterioIA).criterioCompleto ?? "",
    ).filter(Boolean);
    return buildInstrumentoLocal({
      area: sesion.datosGenerales.area,
      grado: sesion.datosGenerales.grado,
      competencia: p.competencia,
      evidencia: p.evidenciaAprendizaje,
      criterios,
      instrumento: p.instrumentoEvaluacion,
    });
  }, [sesion]);
  
  // Estilos para ocultar elementos del navegador al imprimir
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
      
      /* Ocultar todo excepto el documento */
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
      
      /* Ocultar botones y header */
      .no-print {
        display: none !important;
      }
    }
  `;

  if (!sesion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4">
            No hay sesión creada
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Debes crear una sesión primero en el cuestionario
          </p>
          <a
            href="/cuestionario-sesion"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir al Cuestionario
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-8">
      <style>{printStyles}</style>
      <div className="max-w-6xl mx-auto">
        {/* Header con botones */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-xl sm:text-[1.875rem] font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Vista Previa - Sesión de Aprendizaje
          </h1>
          <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
            {/* Indicador de guardado en la nube */}
            <div className="flex items-center gap-1 text-xs" style={{color: isSaved ? "#16a34a" : isSaving ? "#2563eb" : "#94a3b8"}}>
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
              onClick={() => navigate('/dashboard')} 
              variant="outline" 
              size="sm"
              className="gap-1.5"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Inicio</span>
            </Button>
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
              onClick={handleDownloadPDF} 
              disabled={isGenerating}
              size="sm"
              className="gap-1.5 bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              <FileDown className="h-4 w-4" />
              <span className="hidden sm:inline">{isGenerating ? "Generando PDF..." : "Descargar PDF"}</span>
              <span className="sm:hidden">{isGenerating ? "..." : "PDF"}</span>
            </Button>
          </div>
        </div>

        {/* Documento */}
        <div id="print-content" ref={documentRef}>
          <Document size="A4" orientation="portrait" margin="0.5in">
            <DocumentStyles thBgColor={areaHex!.light} />

            {/* HEADER */}
            <DocumentHeader 
              institucion={sesion.datosGenerales.institucion}
              titulo={sesion.titulo}
              accentColor={areaHex!.accent}
            />

            {/* DATOS GENERALES */}
            <DatosGeneralesSection datos={sesion.datosGenerales} sectionColor={areaHex!.light} />

            {/* PROPÓSITOS DE APRENDIZAJE */}
            <PropositoAprendizajeSection proposito={sesion.propositoAprendizaje} sectionColor={areaHex!.light} />

            {/* PROPÓSITO DE LA SESIÓN */}
            <PropositoSesionSection proposito={sesion.propositoSesion} sectionColor={areaHex!.light} />

            {/* ENFOQUES TRANSVERSALES */}
            <EnfoquesTransversalesSection enfoques={sesion.enfoquesTransversales} sectionColor={areaHex!.light} />

            {/* ANTES DE LA SESIÓN */}
            <PreparacionSesionSection preparacion={sesion.preparacion} sectionColor={areaHex!.light} />

            {/* MOMENTOS Y TIEMPOS */}
            <SecuenciaDidacticaSection secuencia={sesion.secuenciaDidactica} sectionColor={areaHex!.light} />

            {/* INSTRUMENTO DE EVALUACIÓN */}
            {instrumento && (
              <InstrumentoEvaluacionSection instrumento={instrumento} hex={areaHex!} alumnos={alumnos} />
            )}

            {/* Footer — con color del área */}
            <Footer position="bottom-center">
              {() => (
                <div style={{display: 'flex', justifyContent: 'center', width: '100%', fontSize: '9pt', borderTop: `1px solid ${areaHex!.accent}`, paddingTop: '0.2rem', color: areaHex!.accent}}>
                  <span>Sesión de Aprendizaje - {sesion.datosGenerales.area}</span>
                </div>
              )}
            </Footer>
          </Document>
        </div>
      </div>
    </div>
  );
}

export default DocTest;
