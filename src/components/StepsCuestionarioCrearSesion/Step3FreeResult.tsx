import { IUsuario } from "@/interfaces/IUsuario";
import { useState, useEffect } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  FileText,
  Edit3,
  Check,
  X,
  Sparkles,
  Target,
  Heart,
  BookOpen,
  Clock,
  Layers,
  Award,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Eye,
  Save,
} from "lucide-react";
import { useSesionStore } from "@/store/sesion.store";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import type { IProcesoSecuencia, ICriterioIA } from "@/interfaces/ISesionAprendizaje";
import { GraficoRenderer } from "@/features/graficos-educativos/presentation/components/GraficoRenderer";

/* ───── helpers ───── */
function criterioTexto(c: string | ICriterioIA): string {
  return typeof c === "string" ? c : c.criterioCompleto || JSON.stringify(c);
}

/* ───── tiny inline editor ───── */
function InlineEdit({
  value,
  onSave,
  multiline = false,
  className = "",
}: {
  value: string;
  onSave: (v: string) => void;
  multiline?: boolean;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  if (!editing) {
    return (
      <div
        className={`group relative cursor-pointer rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 p-2 -m-2 ${className}`}
        onClick={() => setEditing(true)}
      >
        <span>{value || "(vacío)"}</span>
        <Edit3 className="absolute top-2 right-2 h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  }

  const Comp = multiline ? Textarea : Input;
  return (
    <div className="flex flex-col gap-2">
      <Comp
        value={draft}
        onChange={(e: any) => setDraft(e.target.value)}
        className="min-h-[60px]"
        autoFocus
      />
      <div className="flex gap-2 justify-end">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setDraft(value);
            setEditing(false);
          }}
        >
          <X className="h-3 w-3 mr-1" /> Cancelar
        </Button>
        <Button
          size="sm"
          onClick={() => {
            onSave(draft);
            setEditing(false);
            handleToaster("Guardado", "success");
          }}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
        >
          <Check className="h-3 w-3 mr-1" /> Guardar
        </Button>
      </div>
    </div>
  );
}

/* ───── collapsible section ───── */
function CollapsibleSection({
  title,
  icon: Icon,
  gradient,
  badge,
  defaultOpen = true,
  children,
}: {
  title: string;
  icon: any;
  gradient: string;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
      <CardHeader
        className={`${gradient} cursor-pointer select-none`}
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center">
              <Icon className="h-5 w-5 text-white drop-shadow" />
            </div>
            <span className="text-slate-800 dark:text-white">{title}</span>
            {badge && (
              <span className="ml-2 text-xs font-bold bg-white/30 dark:bg-white/10 text-slate-700 dark:text-white rounded-full px-2 py-0.5">
                {badge}
              </span>
            )}
          </CardTitle>
          {open ? (
            <ChevronUp className="h-5 w-5 text-slate-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-500" />
          )}
        </div>
      </CardHeader>
      {open && <CardContent className="pt-5">{children}</CardContent>}
    </Card>
  );
}

/* ───── proceso card ───── */
function ProcesoCard({
  proceso,
  index,
  onUpdate,
}: {
  proceso: IProcesoSecuencia;
  index: number;
  onUpdate: (updated: Partial<IProcesoSecuencia>) => void;
}) {
  const recursos = proceso.recursos || proceso.recursosDidacticos || "";

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4 sm:p-5 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="flex items-center justify-center h-7 w-7 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold shadow">
          {index + 1}
        </span>
        <InlineEdit
          value={proceso.proceso}
          onSave={(v) => onUpdate({ proceso: v })}
          className="font-semibold text-slate-800 dark:text-white"
        />
      </div>

      {/* Estrategias */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
          Estrategias
        </p>
        <InlineEdit
          value={proceso.estrategias}
          onSave={(v) => onUpdate({ estrategias: v })}
          multiline
          className="text-sm text-slate-700 dark:text-slate-300"
        />
      </div>

      {/* Recursos */}
      {recursos && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Recursos
          </p>
          <InlineEdit
            value={recursos}
            onSave={(v) => onUpdate({ recursos: v })}
            className="text-sm text-slate-700 dark:text-slate-300"
          />
        </div>
      )}

      {/* Tiempo */}
      <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
        <Clock className="h-3.5 w-3.5" />
        <InlineEdit
          value={proceso.tiempo}
          onSave={(v) => onUpdate({ tiempo: v })}
          className="text-xs"
        />
      </div>

      {/* Imagen */}
      {proceso.imagen && proceso.imagen.url && proceso.imagen.url !== "GENERATE_IMAGE" && (
        <img
          src={proceso.imagen.url}
          alt={proceso.imagen.descripcion || "Imagen del proceso"}
          className="rounded-lg shadow-md max-h-56 object-contain mt-2"
        />
      )}

      {/* ─── Gráficos y Problema Matemático ─── */}
      {proceso.problemaMatematico && (
        <div className="mt-2 space-y-3">
          {/* Gráfico del problema (Rough.js) */}
          {((proceso as any).grafico || (proceso as any).graficoProblema) && (
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg overflow-x-auto max-w-full">
              <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-2">📝 Problema Matemático:</p>
              <div className="flex justify-center">
                <GraficoRenderer grafico={(proceso as any).grafico || (proceso as any).graficoProblema} />
              </div>
            </div>
          )}

          {/* Fallback: Imagen del problema (legacy) */}
          {!(proceso as any).grafico &&
            !(proceso as any).graficoProblema &&
            proceso.imagenProblema &&
            proceso.imagenProblema !== "GENERATE_IMAGE" && (
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-2">📝 Problema Matemático:</p>
                <img
                  src={proceso.imagenProblema}
                  alt="Problema matemático"
                  className="w-full max-w-md rounded-lg shadow-md"
                />
              </div>
            )}

          {/* Texto del problema */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border-l-4 border-blue-500">
            <InlineEdit
              value={proceso.problemaMatematico}
              onSave={(v) => onUpdate({ problemaMatematico: v })}
              multiline
              className="text-sm text-blue-800 dark:text-blue-200"
            />
          </div>

          {/* Gráfico de la solución */}
          {(proceso as any).graficoSolucion && (
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
              <p className="text-xs font-bold text-green-700 dark:text-green-400 mb-2">✅ Solución:</p>
              <div className="flex justify-center">
                <GraficoRenderer grafico={(proceso as any).graficoSolucion} />
              </div>
            </div>
          )}

          {/* Fallback: Imagen de la solución (legacy) */}
          {!(proceso as any).graficoSolucion &&
            (proceso as any).imagenSolucion &&
            (proceso as any).imagenSolucion !== "GENERATE_IMAGE" && (
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                <p className="text-xs font-bold text-green-700 dark:text-green-400 mb-2">✅ Solución:</p>
                <img
                  src={(proceso as any).imagenSolucion}
                  alt="Solución"
                  className="w-full max-w-md rounded-lg shadow-md"
                />
              </div>
            )}

          {/* Texto de la solución */}
          {(proceso as any).solucionProblema && (
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border-l-4 border-green-500">
              <pre className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans text-sm">
                {(proceso as any).solucionProblema}
              </pre>
            </div>
          )}

          {/* Gráfico de la operación matemática */}
          {(proceso as any).graficoOperacion && (
            <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-700 overflow-x-auto max-w-full">
              <p className="text-xs font-bold text-purple-700 dark:text-purple-400 mb-2">🔢 Operación Matemática:</p>
              <div className="flex justify-center">
                <GraficoRenderer grafico={(proceso as any).graficoOperacion} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gráfico standalone (sin problemaMatematico) — áreas no-Math */}
      {!proceso.problemaMatematico && (proceso as any).grafico && (
        <div className="mt-2 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto max-w-full">
          <div className="flex justify-center">
            <GraficoRenderer grafico={(proceso as any).grafico} />
          </div>
        </div>
      )}

      {/* Respuestas Docente */}
      {proceso.respuestasDocente && proceso.respuestasDocente.length > 0 && (
        <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border-l-4 border-amber-500">
          <p className="text-xs font-bold text-amber-800 dark:text-amber-400 mb-2">
            Respuestas para el docente
          </p>
          {proceso.respuestasDocente.map((r, rIdx) => (
            <div key={rIdx} className="mt-1.5">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                {rIdx + 1}. {r.pregunta}
              </p>
              <p className="text-sm text-emerald-700 dark:text-emerald-400 ml-4 italic">
                → {r.respuestaEsperada}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════ MAIN COMPONENT ═══════════════ */
interface Props {
  pagina: number;
  setPagina: (p: number) => void;
  usuarioFromState: IUsuario;
}

function Step3FreeResult({ pagina, setPagina }: Props) {
  const { sesion, updateSesion } = useSesionStore();

  if (!sesion) return null;

  const { secuenciaDidactica, propositoAprendizaje, enfoquesTransversales } = sesion;

  /* ─── helpers to update nested proceso ─── */
  function updateProceso(
    fase: "inicio" | "desarrollo" | "cierre",
    idx: number,
    partial: Partial<IProcesoSecuencia>
  ) {
    const sec = { ...sesion!.secuenciaDidactica };
    const procesos = [...sec[fase].procesos];
    procesos[idx] = { ...procesos[idx], ...partial };
    sec[fase] = { ...sec[fase], procesos };
    updateSesion({ secuenciaDidactica: sec });
  }

  function updateCriterioAt(idx: number, text: string) {
    const criterios = [...propositoAprendizaje.criteriosEvaluacion];
    const old = criterios[idx];
    if (typeof old === "string") {
      criterios[idx] = text;
    } else {
      criterios[idx] = { ...old, criterioCompleto: text };
    }
    updateSesion({
      propositoAprendizaje: { ...propositoAprendizaje, criteriosEvaluacion: criterios },
    });
  }

  function handleGenerarPDF() {
    window.location.href = "/result";
  }


  /* ═══════════════ RENDER ═══════════════ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-3 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* ─── Header ─── */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg mb-6 shadow-lg">
            <Sparkles className="h-4 w-4" />
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-green-600 text-xs font-bold">
              3
            </div>
            <span className="text-sm font-semibold tracking-wide">PASO 3 DE 3</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3 tracking-tight">
            Tu Sesión está Lista
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Revisa y edita cada sección haciendo clic en el texto. Cuando estés conforme, genera el PDF.
          </p>
        </div>

        <div className="space-y-6">
          {/* ═══ TÍTULO ═══ */}
          {sesion.titulo && (
            <Card className="border-2 border-emerald-200 dark:border-emerald-800 shadow-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
              <CardContent className="py-6 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
                  Título de la Sesión
                </p>
                <InlineEdit
                  value={sesion.titulo}
                  onSave={(v) => updateSesion({ titulo: v })}
                  className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white"
                />
              </CardContent>
            </Card>
          )}

          {/* ═══ PROPÓSITO DE LA SESIÓN ═══ */}
          <CollapsibleSection
            title="Propósito de la Sesión"
            icon={Target}
            gradient="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950"
          >
            <InlineEdit
              value={
                typeof sesion.propositoSesion === "string"
                  ? sesion.propositoSesion
                  : JSON.stringify(sesion.propositoSesion)
              }
              onSave={(v) => updateSesion({ propositoSesion: v })}
              multiline
              className="text-base text-slate-700 dark:text-slate-300 leading-relaxed"
            />
          </CollapsibleSection>

          {/* ═══ COMPETENCIA Y CAPACIDADES ═══ */}
          <CollapsibleSection
            title="Competencia y Capacidades"
            icon={GraduationCap}
            gradient="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950"
            badge={`${propositoAprendizaje.capacidades.length} cap.`}
          >
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Competencia
                </p>
                <p className="text-base font-semibold text-slate-800 dark:text-white">
                  {propositoAprendizaje.competencia}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {propositoAprendizaje.capacidades.map((cap, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800"
                  >
                    <Award className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                    <span className="text-sm text-blue-800 dark:text-blue-200">{cap.nombre}</span>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleSection>

          {/* ═══ CRITERIOS DE EVALUACIÓN ═══ */}
          <CollapsibleSection
            title="Criterios de Evaluación"
            icon={Eye}
            gradient="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950"
            badge={`${propositoAprendizaje.criteriosEvaluacion?.length || 0}`}
          >
            <div className="space-y-3">
              {propositoAprendizaje.criteriosEvaluacion?.map((criterio, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/50"
                >
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-amber-500 text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <InlineEdit
                    value={criterioTexto(criterio)}
                    onSave={(v) => updateCriterioAt(idx, v)}
                    multiline
                    className="text-sm text-slate-700 dark:text-slate-300 flex-1"
                  />
                </div>
              ))}
            </div>

            {/* Evidencia */}
            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Evidencia de Aprendizaje
              </p>
              <InlineEdit
                value={propositoAprendizaje.evidenciaAprendizaje}
                onSave={(v) =>
                  updateSesion({
                    propositoAprendizaje: { ...propositoAprendizaje, evidenciaAprendizaje: v },
                  })
                }
                multiline
                className="text-sm text-slate-700 dark:text-slate-300"
              />
            </div>

            {/* Instrumento */}
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Instrumento de Evaluación
              </p>
              <InlineEdit
                value={propositoAprendizaje.instrumentoEvaluacion}
                onSave={(v) =>
                  updateSesion({
                    propositoAprendizaje: {
                      ...propositoAprendizaje,
                      instrumentoEvaluacion: v,
                    },
                  })
                }
                className="text-sm text-slate-700 dark:text-slate-300"
              />
            </div>
          </CollapsibleSection>

          {/* ═══ ENFOQUES TRANSVERSALES ═══ */}
          <CollapsibleSection
            title="Enfoques Transversales"
            icon={Heart}
            gradient="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950 dark:to-pink-950"
            badge={`${enfoquesTransversales.length}`}
          >
            <div className="space-y-3">
              {enfoquesTransversales.map((enf, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                >
                  <p className="font-semibold text-sm text-rose-700 dark:text-rose-300 mb-1">
                    {enf.nombre}
                  </p>
                  {enf.valor && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic mb-2">
                      Valor: {enf.valor}
                    </p>
                  )}
                  <InlineEdit
                    value={enf.actitudesObservables}
                    onSave={(v) => {
                      const updated = [...enfoquesTransversales];
                      updated[idx] = { ...enf, actitudesObservables: v };
                      updateSesion({ enfoquesTransversales: updated });
                    }}
                    multiline
                    className="text-sm text-slate-700 dark:text-slate-300"
                  />
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* ═══ SECUENCIA DIDÁCTICA ═══ */}
          {/* ── INICIO ── */}
          <CollapsibleSection
            title="Inicio"
            icon={BookOpen}
            gradient="bg-gradient-to-r from-sky-50 to-cyan-50 dark:from-sky-950 dark:to-cyan-950"
            badge={`${secuenciaDidactica.inicio.tiempo}`}
          >
            <div className="space-y-4">
              {secuenciaDidactica.inicio.procesos.map((proc, idx) => (
                <ProcesoCard
                  key={idx}
                  proceso={proc}
                  index={idx}
                  onUpdate={(partial) => updateProceso("inicio", idx, partial)}
                />
              ))}
            </div>
          </CollapsibleSection>

          {/* ── DESARROLLO ── */}
          <CollapsibleSection
            title="Desarrollo"
            icon={Layers}
            gradient="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950 dark:to-violet-950"
            badge={`${secuenciaDidactica.desarrollo.tiempo}`}
          >
            <div className="space-y-4">
              {secuenciaDidactica.desarrollo.procesos.map((proc, idx) => (
                <ProcesoCard
                  key={idx}
                  proceso={proc}
                  index={idx}
                  onUpdate={(partial) => updateProceso("desarrollo", idx, partial)}
                />
              ))}
            </div>
          </CollapsibleSection>

          {/* ── CIERRE ── */}
          <CollapsibleSection
            title="Cierre"
            icon={Target}
            gradient="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950"
            badge={`${secuenciaDidactica.cierre.tiempo}`}
          >
            <div className="space-y-4">
              {secuenciaDidactica.cierre.procesos.map((proc, idx) => (
                <ProcesoCard
                  key={idx}
                  proceso={proc}
                  index={idx}
                  onUpdate={(partial) => updateProceso("cierre", idx, partial)}
                />
              ))}
            </div>
          </CollapsibleSection>

          {/* ═══ PREPARACIÓN ═══ */}
          {(sesion.preparacion.quehacerAntes.length > 0 ||
            sesion.preparacion.recursosMateriales.length > 0) && (
            <CollapsibleSection
              title="Preparación"
              icon={Save}
              gradient="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950"
              defaultOpen={false}
            >
              {sesion.preparacion.quehacerAntes.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    ¿Qué hacer antes?
                  </p>
                  <ul className="space-y-1.5">
                    {sesion.preparacion.quehacerAntes.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                      >
                        <Check className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {sesion.preparacion.recursosMateriales.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Recursos y materiales
                  </p>
                  <ul className="space-y-1.5">
                    {sesion.preparacion.recursosMateriales.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                      >
                        <BookOpen className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CollapsibleSection>
          )}
        </div>

        {/* ─── Botones de navegación ─── */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 mb-8">
          <Button
            onClick={() => setPagina(pagina - 1)}
            variant="outline"
            className="h-14 px-8 text-lg font-semibold border-2"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Anterior
          </Button>
          <div className="flex gap-3">
            <Button
              onClick={handleGenerarPDF}
              className="h-14 px-10 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <FileText className="mr-2 h-5 w-5" />
              Generar PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Step3FreeResult;
