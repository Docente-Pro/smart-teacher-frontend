import { Document, Footer } from "@htmldocs/react";
import { Button } from "@/components/ui/button";
import { FileDown, Printer } from "lucide-react";
import { useRef, useEffect } from "react";
import { usePDFGeneration } from "@/hooks/usePDFGeneration";
import { DocumentStyles } from "@/components/DocTest";
import { DocumentHeader } from "@/components/DocTest/DocumentHeader";
import { DatosGeneralesSection } from "@/components/DocTest/DatosGeneralesSection";
import { PropositoAprendizajeSection } from "@/components/DocTest/PropositoAprendizajeSection";
import { PropositoSesionSection } from "@/components/DocTest/AdditionalSections";
import { EnfoquesTransversalesSection } from "@/components/DocTest/EnfoquesTransversalesSection";
import { PreparacionSesionSection } from "@/components/DocTest/PreparacionSesionSection";

import { useSesionStore } from "@/store/sesion.store";
import { SecuenciaDidacticaSection } from "@/components/DocTest/SecuenciaDidacticaSection";

function DocTest() {
  const documentRef = useRef<HTMLDivElement>(null);
  const { sesion } = useSesionStore();
  const { isGenerating, handleDownloadPDF, handlePrint } = usePDFGeneration(documentRef, sesion?.datosGenerales.area);

  console.log(sesion);
  
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <style>{printStyles}</style>
      <div className="max-w-6xl mx-auto">
        {/* Header con botones */}
        <div className="no-print" style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem"}}>
          <h1 style={{fontSize: "1.875rem", fontWeight: "700", background: "linear-gradient(to right, #2563eb, #0891b2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"}}>
            Vista Previa - Sesión de Aprendizaje
          </h1>
          <div style={{display: "flex", gap: "0.75rem"}}>
            <Button 
              onClick={handlePrint} 
              disabled={isGenerating}
              variant="outline" 
              style={{gap: "0.5rem"}}
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
            <Button 
              onClick={handleDownloadPDF} 
              disabled={isGenerating}
              style={{gap: "0.5rem"}}
              className="bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              <FileDown className="h-4 w-4" />
              {isGenerating ? "Generando PDF..." : "Descargar PDF"}
            </Button>
          </div>
        </div>

        {/* Documento */}
        <div id="print-content" ref={documentRef}>
          <Document size="A4" orientation="portrait" margin="0.5in">
            <DocumentStyles />

            {/* HEADER */}
            <DocumentHeader 
              institucion={sesion.datosGenerales.institucion}
              titulo={sesion.titulo}
            />

            {/* DATOS GENERALES */}
            <DatosGeneralesSection datos={sesion.datosGenerales} />

            {/* PROPÓSITOS DE APRENDIZAJE */}
            <PropositoAprendizajeSection proposito={sesion.propositoAprendizaje} />

            {/* PROPÓSITO DE LA SESIÓN */}
            <PropositoSesionSection proposito={sesion.propositoSesion} />

            {/* ENFOQUES TRANSVERSALES */}
            <EnfoquesTransversalesSection enfoques={sesion.enfoquesTransversales} />

            {/* ANTES DE LA SESIÓN */}
            <PreparacionSesionSection preparacion={sesion.preparacion} />

            {/* MOMENTOS Y TIEMPOS */}
            <SecuenciaDidacticaSection secuencia={sesion.secuenciaDidactica} />

            {/* Footer */}
            <Footer position="bottom-center">
              {() => (
                <div style={{display: 'flex', justifyContent: 'center', width: '100%', fontSize: '9pt', borderTop: '1px solid #000', paddingTop: '0.2rem'}}>
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
