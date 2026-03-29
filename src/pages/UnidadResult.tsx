import { Document, Footer } from "@htmldocs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileDown,
  FileText,
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
  Pencil,
} from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
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
import { UnidadSecundariaFormatoDoc } from "@/components/UnidadDoc/UnidadSecundariaFormatoDoc";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";
import { getInsigniaDataUrl } from "@/utils/insigniaCache";
import { updateUsuario } from "@/services/usuarios.service";
import { handleToaster } from "@/utils/Toasters/handleToasters";

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
  const { user: usuario, updateUsuario: updateUsuarioStore, fetchUsuario } = useUserStore();

  const { isGenerating, isSaving, isSaved, handleDownloadPDF, handlePrint, guardarEnNube } =
    useUnidadPDFGeneration(documentRef);

  // ── Auto-cargar perfil completo del usuario si el userStore está vacío ──
  useEffect(() => {
    const authId = user?.id;
    if (authId && !usuario?.id) {
      fetchUsuario(authId);
    }
  }, [user?.id, usuario?.id, fetchUsuario]);

  // ── Directivo (editable inline) ──
  const [showDirectivoInput, setShowDirectivoInput] = useState(false);
  const [directivoInput, setDirectivoInput] = useState("");
  const [savingDirectivo, setSavingDirectivo] = useState(false);

  const handleEditDirectivo = useCallback(() => {
    setDirectivoInput(usuario?.nombreDirectivo || "");
    setShowDirectivoInput(true);
  }, [usuario?.nombreDirectivo]);

  const handleSaveDirectivo = useCallback(async () => {
    const nombre = directivoInput.trim();
    if (!nombre) {
      handleToaster("Ingresa el nombre del directivo", "error");
      return;
    }
    const userId = usuario?.id || user?.id;
    if (!userId) return;

    try {
      setSavingDirectivo(true);
      await updateUsuario(userId, { nombreDirectivo: nombre });
      updateUsuarioStore({ nombreDirectivo: nombre });
      setShowDirectivoInput(false);
      handleToaster("Directivo guardado correctamente", "success");

      // Re-generar PDF con el dato actualizado
      setTimeout(() => guardarEnNube(true).catch(() => {}), 1500);
    } catch {
      handleToaster("Error al guardar el directivo", "error");
    } finally {
      setSavingDirectivo(false);
    }
  }, [directivoInput, usuario?.id, user?.id, updateUsuarioStore, guardarEnNube]);

  // ── Word generation ──
  const [isGeneratingWord, setIsGeneratingWord] = useState(false);
  const [wordUrl, setWordUrl] = useState<string | null>(null);

  const handleGenerateWord = async () => {
    if (!unidadId || !isSaved) {
      handleToaster("Espera a que el PDF se guarde primero", "info");
      return;
    }
    setIsGeneratingWord(true);
    try {
      const { generarWordDesdeUnidad } = await import("@/services/pdfToWord.service");
      const url = await generarWordDesdeUnidad(unidadId);
      setWordUrl(url);
      handleToaster("Word generado correctamente", "success");
    } catch (err: any) {
      handleToaster(err?.message || "Error al generar Word", "error");
    } finally {
      setIsGeneratingWord(false);
    }
  };

  const handleVerWord = async () => {
    if (wordUrl) {
      window.open(wordUrl, "_blank");
      return;
    }
    if (!unidadId) return;
    try {
      const { obtenerDownloadUrlWordUnidad } = await import("@/services/pdfToWord.service");
      const url = await obtenerDownloadUrlWordUnidad(unidadId);
      window.open(url, "_blank");
    } catch {
      handleToaster("Error al obtener el Word", "error");
    }
  };

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
  const seccion = usuario?.seccion || "";
  const isSecundariaResult =
    Boolean((datosBase as any)?.esSecundariaWizard) ||
    /secundaria/i.test(datosBase.nivel || "") ||
    Array.isArray((contenido as any)?.propositosPorGrado);

  const formatoSecundaria = (() => {
    const propositosPorGrado = ((contenido as any)?.propositosPorGrado || []) as Array<any>;
    const secuenciaPorGrado = ((contenido as any)?.secuenciaPorGrado || []) as Array<any>;
    const gradosList =
      propositosPorGrado.map((g) => g?.grado).filter(Boolean) ||
      secuenciaPorGrado.map((g) => g?.grado).filter(Boolean);
    const gradoTexto = Array.from(new Set(gradosList)).join(", ") || datosBase.grado || "—";
    const totalSemanas = Number(datosBase.duracion || 0) || 1;
    const secuenciaGradosRecord: Record<string, Record<string, string[]>> = {};

    secuenciaPorGrado.forEach((g) => {
      const nombreGrado = g?.grado || `Grado ${g?.gradoId ?? ""}`.trim();
      const semanas = (g?.secuencia?.semanasPorSesiones || []) as Array<any>;
      const bySemana: Record<string, string[]> = {};
      semanas.forEach((s) => {
        bySemana[String(s?.semana ?? "")] = (s?.sesiones || [])
          .map((ses: any) => ses?.actividad)
          .filter(Boolean);
      });
      secuenciaGradosRecord[nombreGrado] = bySemana;
    });

    return {
      datosInformativos: {
        numeroUnidad: Number(datosBase.numeroUnidad || 1),
        titulo: datosBase.titulo || "",
        institucionEducativa: institucion || "—",
        director: usuario?.nombreDirectivo || "—",
        subdirector: usuario?.nombreSubdirectora || "—",
        nivel: datosBase.nivel || "—",
        area: areasNombres[0] || "—",
        grado: gradoTexto,
        secciones: seccion || "—",
        docente: docenteNombre || "—",
        duracion: Number(datosBase.duracion || 0) || 1,
      },
      componentes: {
        planteamientoSituacionSignificativa: contenido.situacionSignificativa || "—",
        productoUnidadAprendizajePorGrado:
          propositosPorGrado.length > 0
            ? propositosPorGrado.map((pg: any) => ({
                grado: pg?.grado || "—",
                producto: contenido?.evidencias?.productoIntegrador || "—",
              }))
            : [{ grado: datosBase.grado || "—", producto: contenido?.evidencias?.productoIntegrador || "—" }],
        enfoquesTransversales: (contenido.enfoques || []).map((e: any) => ({
          enfoque: e?.enfoque || "—",
          valor: e?.valor || "—",
          actitudes: e?.actitudes || "—",
        })),
        instrumentoEvaluacion:
          contenido?.evidencias?.instrumentoEvaluacion ||
          propositosPorGrado?.[0]?.propositos?.areasPropositos?.[0]?.competencias?.[0]?.instrumento ||
          "Lista de cotejo",
        propositosAprendizajePorGrado: propositosPorGrado.map((pg: any) => ({
          grado: pg?.grado || "—",
          area: pg?.propositos?.areasPropositos?.[0]?.area || areasNombres[0] || "—",
          competencias: (pg?.propositos?.areasPropositos || [])
            .flatMap((a: any) => a?.competencias || [])
            .map((c: any) => ({
              competenciaCapacidades: {
                competencia: c?.nombre || c?.competencia || "—",
                capacidades: c?.capacidades || [],
              },
              estandar: c?.estandar || "—",
              actividades: c?.actividades || [],
              campoTematico: c?.campoTematico || "—",
              criteriosEvaluacion: c?.criterios || [],
              instrumentoEvaluacion: c?.instrumento || "Lista de cotejo",
            })),
        })),
        competenciasTransversalesPorGrado: propositosPorGrado.map((pg: any) => ({
          grado: pg?.grado || "—",
          competencias: (pg?.propositos?.competenciasTransversales || []).map((ct: any) => ({
            competenciaCapacidades: {
              competencia: ct?.nombre || "—",
              capacidades: ct?.capacidades || [],
            },
            estandarCiclo: ct?.estandar || "—",
            criterios: ct?.criterios || [],
          })),
        })),
        secuenciaSesionesPorGrado: {
          totalSemanas,
          grados: secuenciaGradosRecord,
        },
        recursosMaterialesDidacticos: contenido.materiales || [],
        bibliografia: (contenido as any)?.bibliografia || [],
      },
    };
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-8">
      <style>{printStyles}</style>
      <div className="max-w-6xl mx-auto">
        {/* Header con botones */}
        <div className="no-print flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              onClick={() => navigate("/crear-unidad")}
              variant="ghost"
              className="h-10 px-3 flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg sm:text-[1.875rem] font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Vista Previa - Unidad de Aprendizaje
            </h1>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
            {/* Botón Ir al inicio */}
            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              size="sm"
              className="gap-1.5"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Inicio</span>
            </Button>
            {/* Indicador de guardado */}
            <div className="flex items-center gap-1 text-xs" style={{color: isSaved ? "#16a34a" : isSaving ? "#d97706" : "#94a3b8"}}>
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
              className="gap-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
            >
              <FileDown className="h-4 w-4" />
              <span className="hidden sm:inline">{isGenerating ? "Generando PDF..." : "Descargar PDF"}</span>
              <span className="sm:hidden">{isGenerating ? "..." : "PDF"}</span>
            </Button>
            {wordUrl ? (
              <Button
                onClick={handleVerWord}
                variant="outline"
                size="sm"
                className="gap-1.5 border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-950"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Ver Word</span>
                <span className="sm:hidden">Word</span>
              </Button>
            ) : (
              <Button
                onClick={handleGenerateWord}
                disabled={isGeneratingWord || !isSaved}
                variant="outline"
                size="sm"
                className="gap-1.5 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-950"
              >
                {isGeneratingWord ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">Generando Word...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Generar Word</span>
                    <span className="sm:hidden">Word</span>
                  </>
                )}
              </Button>
            )}
            {unidadId && (
              <Button
                onClick={() => navigate(`/editar-unidad/${unidadId}`)}
                size="sm"
                variant="outline"
                className="gap-1.5 border-violet-300 text-violet-700 hover:bg-violet-50 dark:border-violet-600 dark:text-violet-400 dark:hover:bg-violet-950"
              >
                <Pencil className="h-4 w-4" />
                <span className="hidden sm:inline">Editar contenido</span>
                <span className="sm:hidden">Editar</span>
              </Button>
            )}
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
          <Document size="A4" orientation="landscape" margin={isSecundariaResult ? "0.45in" : "0.5in"}>
            {isSecundariaResult ? (
              <UnidadSecundariaFormatoDoc formato={formatoSecundaria as any} />
            ) : (
              <>
                <UnidadDocStyles />

                {/* HEADER */}
                <UnidadDocHeader
                  titulo={datosBase.titulo}
                  numeroUnidad={datosBase.numeroUnidad}
                  grado={gradoLabel}
                  seccion={seccion}
                  insigniaUrl={getInsigniaDataUrl(user?.insigniaUrl)}
                />

                {/* I. DATOS GENERALES */}
                <UnidadDocDatosGenerales
                  institucion={institucion}
                  directivo={usuario?.nombreDirectivo || ""}
                  subdirectora={usuario?.nombreSubdirectora || ""}
                  docente={docenteNombre}
                  grado={datosBase.grado}
                  seccion={seccion}
                  nivel={datosBase.nivel}
                  fechaInicio={datosBase.fechaInicio}
                  fechaFin={datosBase.fechaFin}
                  areas={areasNombres}
                  onEditDirectivo={handleEditDirectivo}
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
              </>
            )}
          </Document>
        </div>
      </div>

      {/* ═══ MODAL EDITAR DIRECTIVO ═══ */}
      {showDirectivoInput && (
        <div
          className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowDirectivoInput(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
              Directivo(a) de la I.E.
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Ingresa el nombre completo del directivo de tu institución educativa.
            </p>
            <input
              type="text"
              value={directivoInput}
              onChange={(e) => setDirectivoInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveDirectivo()}
              placeholder="Ej: Juan Pérez López"
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDirectivoInput(false)}
                disabled={savingDirectivo}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSaveDirectivo}
                disabled={savingDirectivo}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
              >
                {savingDirectivo ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    Guardando...
                  </>
                ) : (
                  "Guardar"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UnidadResult;
