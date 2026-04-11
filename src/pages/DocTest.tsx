import { Document, Footer } from "@htmldocs/react";
import { Button } from "@/components/ui/button";
import { FileDown, Printer, Cloud, CloudOff, Loader2, Home, ClipboardList, Pencil, CheckCircle2 } from "lucide-react";
import { useRef, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { usePDFGeneration } from "@/hooks/usePDFGeneration";
import { usePermissions } from "@/hooks/usePermissions";
import { DocumentStyles } from "@/components/DocTest";
import { DocumentHeader } from "@/components/DocTest/DocumentHeader";
import { DatosGeneralesSection } from "@/components/DocTest/DatosGeneralesSection";
import { PropositoAprendizajeSection } from "@/components/DocTest/PropositoAprendizajeSection";
import {
  CompetenciasCriteriosSesionSection,
  splitCriteriosEnDosBloques,
} from "@/components/DocTest/CompetenciasCriteriosSesionSection";
import { PropositoSesionSection } from "@/components/DocTest/AdditionalSections";
import { EnfoquesTransversalesSection } from "@/components/DocTest/EnfoquesTransversalesSection";
import { PreparacionSesionSection } from "@/components/DocTest/PreparacionSesionSection";
import { InstrumentoEvaluacionSection } from "@/components/SesionPremiumDoc/InstrumentoEvaluacionSection";
import { buildInstrumentoLocal } from "@/utils/buildInstrumentoFromSesion";
import { getSavedAlumnos } from "@/utils/alumnosStorage";
import { generarFichaAplicacion } from "@/services/fichaAplicacion.service";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import type { ICriterioIA } from "@/interfaces/ISesionAprendizaje";

import { useSesionStore } from "@/store/sesion.store";
import { useUserStore } from "@/store/user.store";
import { SecuenciaDidacticaSection } from "@/components/DocTest/SecuenciaDidacticaSection";
import { getAreaColor } from "@/constants/areaColors";

function DocTest() {
  const documentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { sesion } = useSesionStore();
  const { user: usuario } = useUserStore();
  const { isPremium } = usePermissions();
  const { isGenerating, isSaving, isSaved, savedSesionId, handleDownloadPDF, handlePrint } = usePDFGeneration(documentRef, sesion?.datosGenerales.area);
  const [isGeneratingFicha, setIsGeneratingFicha] = useState(false);

  // ── Derivar colores del área ────────────────────────────────────
  const areaHex = sesion ? getAreaColor(sesion.datosGenerales.area).hex : null;
  // ── Alumnos guardados en localStorage ──────────────────────────────
  const alumnos = useMemo(() => getSavedAlumnos(sesion?.gradoId), [sesion?.gradoId]);

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

  const criteriosSesionPorBloque = useMemo(() => {
    if (!sesion) return [[], []] as [string[], string[]];
    const criterios = (sesion.propositoAprendizaje.criteriosEvaluacion ?? [])
      .map((c) => (typeof c === "string" ? c : (c as ICriterioIA).criterioCompleto ?? ""))
      .filter(Boolean);
    return splitCriteriosEnDosBloques(criterios);
  }, [sesion]);
  
  const handleFichaAplicacion = async () => {
    if (!savedSesionId || !isSaved) {
      handleToaster("Espera a que la sesión se guarde primero", "info");
      return;
    }

    setIsGeneratingFicha(true);
    try {
      const resp = await generarFichaAplicacion(savedSesionId, {
        incluirRespuestas: true,
        dificultad: "media",
      });

      handleToaster("¡Ficha generada! Abriendo vista previa...", "success");

      navigate("/ficha-aplicacion-result", {
        state: {
          ficha: resp.ficha,
          fichaId: resp.fichaId,
          docente: usuario.nombre || "",
          institucion: usuario.nombreInstitucion || "",
          sesionId: savedSesionId,
          presignedUrl: resp.presignedUrl,
          s3Key: resp.s3Key,
        },
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "Error al generar la ficha de aplicación";
      handleToaster(msg, "error");
    } finally {
      setIsGeneratingFicha(false);
    }
  };

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
        <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Vista Previa - Sesión de Aprendizaje
          </h1>
          <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
            <div className="flex items-center gap-1.5 text-sm font-medium mr-1" style={{color: isSaved ? "#16a34a" : isSaving ? "#2563eb" : "#94a3b8"}}>
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
              className="gap-1.5 h-9"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Inicio</span>
            </Button>
            <Button
              onClick={handlePrint}
              disabled={isGenerating}
              variant="outline"
              size="sm"
              className="gap-1.5 h-9"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </Button>
            {isPremium && (
              <Button
                onClick={handleFichaAplicacion}
                disabled={isGeneratingFicha || !isSaved}
                size="sm"
                variant="outline"
                className="gap-1.5 h-9 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-950"
              >
                {isGeneratingFicha ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ClipboardList className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {isGeneratingFicha ? "Generando Ficha..." : "Ficha de Aplicación"}
                </span>
                <span className="sm:hidden">
                  {isGeneratingFicha ? "..." : "Ficha"}
                </span>
              </Button>
            )}
            <Button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              size="sm"
              className="gap-1.5 h-9 bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              <FileDown className="h-4 w-4" />
              <span className="hidden sm:inline">{isGenerating ? "Generando PDF..." : "Descargar PDF"}</span>
              <span className="sm:hidden">{isGenerating ? "..." : "PDF"}</span>
            </Button>
          </div>
        </div>

        {/* Banner de éxito con acciones claras */}
        {isSaved && savedSesionId && (
          <div className="no-print mb-6 rounded-xl border border-green-200 dark:border-green-800/40 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-500/5 dark:to-emerald-500/5 p-4 sm:p-5">
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-base font-semibold text-green-800 dark:text-green-300">
                  ¡Tu sesión se guardó correctamente!
                </p>
                <p className="text-sm text-green-700/80 dark:text-green-400/70 mt-0.5">
                  Ya puedes editar el contenido, descargar el PDF o volver al inicio.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => navigate(`/editar-sesion/${savedSesionId}`)}
                size="lg"
                className="gap-2 h-12 px-6 text-base font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all"
              >
                <Pencil className="h-5 w-5" />
                Editar contenido
              </Button>
              <Button
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                variant="outline"
                size="lg"
                className="gap-2 h-12 px-6 text-base font-semibold border-2"
              >
                <FileDown className="h-5 w-5" />
                {isGenerating ? "Generando PDF..." : "Descargar PDF"}
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                size="lg"
                className="gap-2 h-12 px-6 text-base font-semibold border-2"
              >
                <Home className="h-5 w-5" />
                Volver al Inicio
              </Button>
            </div>
          </div>
        )}

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

            {/* COMPETENCIAS/CAPACIDADES + CRITERIOS (previo a momentos y tiempos) */}
            <CompetenciasCriteriosSesionSection
              sectionColor={areaHex!.light}
              criteriosPorCompetencia={criteriosSesionPorBloque}
            />

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
