import { useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  FileDown,
  Printer,
  ArrowLeft,
  Heart,
  BookOpen,
  Clock,
  Sparkles,
} from "lucide-react";
import type { ISesionComplementariaResponse } from "@/interfaces/ISesionComplementaria";

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function toArray(val: string | string[] | undefined): string[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * SesionComplementariaResult
 *
 * Renders the generated complementary session (Tutoría / Plan Lector).
 * Receives ISesionComplementariaResponse via location.state.complementariaData.
 */
function SesionComplementariaResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const documentRef = useRef<HTMLDivElement>(null);

  const stateData = location.state as {
    complementariaData?: ISesionComplementariaResponse;
  } | null;

  const data = stateData?.complementariaData ?? null;
  const sesion = data?.sesion;

  const isTutoria = sesion?.tipo === "Tutoría";
  const gradient = isTutoria
    ? "from-pink-500 to-rose-600"
    : "from-amber-500 to-orange-600";
  const accentColor = isTutoria ? "#e11d48" : "#ea580c";

  // ─── Print ───

  const handlePrint = () => window.print();

  const handleDownloadPDF = () => {
    // For now, use the browser's built-in print-to-PDF
    window.print();
  };

  const printStyles = `
    @media print {
      @page { margin: 0.5cm; size: A4; }
      body { margin: 0; padding: 0; }
      body * { visibility: hidden; }
      #print-content, #print-content * { visibility: visible; }
      #print-content { position: absolute; left: 0; top: 0; width: 100%; }
      .no-print { display: none !important; }
    }
  `;

  // ─── Fallback ───

  if (!data || !sesion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4">
            No hay sesión complementaria disponible
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Genera una sesión desde el formulario.
          </p>
          <Button onClick={() => navigate("/generar-sesion-complementaria")}>
            Crear sesión complementaria
          </Button>
        </div>
      </div>
    );
  }

  // ─── Render ───

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-8">
      <style>{printStyles}</style>
      <div className="max-w-4xl mx-auto">
        {/* Header buttons */}
        <div className="no-print flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/generar-sesion-complementaria")}
              className="flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className={`text-lg sm:text-2xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
              Vista Previa — {sesion.tipo}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
            <Button onClick={handlePrint} variant="outline" size="sm" className="gap-1.5">
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </Button>
            <Button
              onClick={handleDownloadPDF}
              size="sm"
              className={`gap-1.5 bg-gradient-to-r ${gradient} text-white`}
            >
              <FileDown className="h-4 w-4" />
              <span className="hidden sm:inline">Descargar PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
          </div>
        </div>

        {/* Document */}
        <div
          id="print-content"
          ref={documentRef}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header bar */}
          <div
            className="p-6 text-white"
            style={{ background: `linear-gradient(135deg, ${accentColor}, ${isTutoria ? "#f43f5e" : "#f97316"})` }}
          >
            <div className="flex items-center gap-3 mb-3">
              {isTutoria ? <Heart className="h-6 w-6" /> : <BookOpen className="h-6 w-6" />}
              <span className="text-sm font-medium uppercase tracking-wider opacity-90">
                Sesión de {sesion.tipo}
              </span>
              <span className="ml-auto flex items-center gap-1 text-sm opacity-80">
                <Clock className="h-4 w-4" />
                {sesion.duracion || 45} min
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
              {sesion.titulo}
            </h2>
            {data.docente && (
              <p className="text-sm mt-2 opacity-80">
                Docente: {data.docente} — {data.institucion}
              </p>
            )}
          </div>

          <div className="p-6 space-y-8">
            {/* Propósito */}
            {sesion.propositoSesion && (
              <Section title="Propósito de la sesión" color={accentColor}>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {sesion.propositoSesion}
                </p>
              </Section>
            )}

            {/* Enfoques transversales */}
            {sesion.enfoquesTransversales?.length > 0 && (
              <Section title="Enfoques transversales" color={accentColor}>
                <div className="space-y-3">
                  {sesion.enfoquesTransversales.map((e, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-slate-200 dark:border-slate-700 p-3"
                    >
                      <div className="font-semibold text-sm" style={{ color: accentColor }}>
                        {e.enfoque}
                      </div>
                      {e.valor && (
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          <strong>Valor:</strong> {e.valor}
                        </div>
                      )}
                      {e.actitud && (
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          <strong>Actitud:</strong> {e.actitud}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Preparación */}
            {sesion.preparacion && (
              <Section title="Preparación" color={accentColor}>
                {sesion.preparacion.quehacerAntes?.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Qué hacer antes:
                    </h4>
                    <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-0.5">
                      {sesion.preparacion.quehacerAntes.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {sesion.preparacion.recursosMateriales?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Recursos y materiales:
                    </h4>
                    <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-0.5">
                      {sesion.preparacion.recursosMateriales.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Section>
            )}

            {/* Secuencia didáctica */}
            {["inicio", "desarrollo", "cierre"].map((fase) => {
              const faseData = sesion[fase as "inicio" | "desarrollo" | "cierre"];
              if (!faseData?.procesos?.length) return null;
              const faseLabel = fase.charAt(0).toUpperCase() + fase.slice(1);
              return (
                <Section
                  key={fase}
                  title={`${faseLabel} (${faseData.tiempo})`}
                  color={accentColor}
                >
                  <div className="space-y-4">
                    {faseData.procesos.map((proc, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 p-4"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-200">
                            {proc.proceso}
                          </h4>
                          <span className="text-xs text-slate-400 whitespace-nowrap">
                            {proc.tiempo}
                          </span>
                        </div>

                        {/* Estrategias */}
                        <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          <strong className="text-slate-700 dark:text-slate-300">Estrategias:</strong>
                          {toArray(proc.estrategias).length > 1 ? (
                            <ul className="list-disc list-inside mt-1 space-y-0.5">
                              {toArray(proc.estrategias).map((s, j) => (
                                <li key={j}>{s}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="ml-1">{toArray(proc.estrategias)[0]}</span>
                          )}
                        </div>

                        {/* Recursos */}
                        {toArray(proc.recursos).length > 0 && (
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            <strong className="text-slate-600 dark:text-slate-300">Recursos:</strong>{" "}
                            {toArray(proc.recursos).join(", ")}
                          </div>
                        )}

                        {/* Respuestas docente */}
                        {proc.respuestasDocente && proc.respuestasDocente.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                              Preguntas orientadoras:
                            </p>
                            {proc.respuestasDocente.map((r, j) => (
                              <div key={j} className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                                <span className="font-medium">P:</span> {r.pregunta}
                                <br />
                                <span className="font-medium">R:</span> {r.respuestaEsperada}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              );
            })}

            {/* Reflexiones */}
            {sesion.reflexiones && (
              <Section title="Reflexiones pedagógicas" color={accentColor}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
                    <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Sobre los aprendizajes
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      {sesion.reflexiones.sobreAprendizajes}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
                    <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Sobre la enseñanza
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      {sesion.reflexiones.sobreEnsenanza}
                    </p>
                  </div>
                </div>
              </Section>
            )}

            {/* Resumen */}
            {sesion.resumen && (
              <Section title="Resumen de la sesión" color={accentColor}>
                <div className="flex items-start gap-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 p-4">
                  <Sparkles className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: accentColor }} />
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {sesion.resumen}
                  </p>
                </div>
              </Section>
            )}
          </div>

          {/* Footer */}
          <div
            className="p-4 text-center text-xs text-white/80"
            style={{ background: accentColor }}
          >
            Sesión de {sesion.tipo} — Generada con IA por Docente Pro — {sesion.duracion || 45} minutos
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Section subcomponent
// ═══════════════════════════════════════════════════════════════════════════════

function Section({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3
        className="text-base font-bold mb-3 pb-2 border-b-2"
        style={{ borderColor: color, color }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

export default SesionComplementariaResult;
