/**
 * "Mi formato de sesión" — la docente sube su formato una vez, ve una sesión
 * completa dentro de él y lo aprueba. Aprobado = se usa en todas sus sesiones.
 *
 * Estados de la pantalla: sin formato → procesando → falta ubicar algo →
 * en revisión → aprobado. La docente nunca ve un marcador ni una dirección de
 * celda: cuando algo no se resuelve solo, elige entre celdas descritas en
 * lenguaje humano ("Al lado de «GRADO Y SECCIÓN»").
 */
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  FileUp,
  Loader2,
  Maximize2,
  Minimize2,
  PencilLine,
  RefreshCw,
  Save,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import {
  contentTypeForPlantillaFile,
  getMiPlantillaActiva,
  solicitarPlantillaUploadUrl,
  subirPlantillaAS3,
  confirmarPlantilla,
  downloadUrlPlantilla,
  analizarPlantilla,
  asignarSlotsPlantilla,
  previewPlantilla,
  activarPlantilla,
  desactivarPlantilla,
  saveDocxPlantilla,
  esMapeoV2,
  type IMapeoFormato,
  type IOpcionSlot,
  type IPendienteMapeo,
  type IPlantillaFormato,
} from "@/services/plantillaFormato.service";
import type { FormatoDocxEditorHandle } from "@/components/FormatoDocxEditor/FormatoDocxEditor";

// Syncfusion pesa varios MB: solo se descarga si la docente abre el editor.
const FormatoDocxEditor = lazy(
  () => import("@/components/FormatoDocxEditor/FormatoDocxEditor"),
);

/** Nombres de campo en el idioma de la docente, no del sistema. */
const NOMBRES_CAMPO: Record<string, string> = {
  titulo: "el título de la sesión",
  proposito: "el propósito de aprendizaje",
  area: "el área curricular",
  grado: "el grado y sección",
  docente: "tu nombre",
  institucion: "la institución educativa",
  fecha: "la fecha",
  duracion: "la duración",
  competencias: "las competencias y capacidades",
  desempenos: "los desempeños",
  criterios: "los criterios de evaluación",
  evidencia: "la evidencia de aprendizaje",
  instrumento: "el instrumento de evaluación",
  enfoques: "los enfoques transversales",
  recursos: "los recursos y materiales",
  inicio: "las actividades de inicio",
  desarrollo: "las actividades de desarrollo",
  cierre: "las actividades de cierre",
};

function nombreCampo(campo: string): string {
  return NOMBRES_CAMPO[campo] || campo;
}

type Fase =
  | "idle"
  | "subiendo"
  | "convirtiendo"
  | "detectando"
  | "previsualizando";

const FASES: Record<Exclude<Fase, "idle">, string> = {
  subiendo: "Subiendo tu archivo",
  convirtiendo: "Convirtiendo el PDF a Word",
  detectando: "Leyendo las tablas de tu formato",
  previsualizando: "Armando la vista previa",
};

function mapeoDe(plantilla: IPlantillaFormato | null): IMapeoFormato | null {
  return plantilla && esMapeoV2(plantilla.mapeo) ? plantilla.mapeo : null;
}

/** Alto del editor en píxeles: Syncfusion necesita un valor concreto. */
function useEditorHeight(fullscreen: boolean): string {
  const [alto, setAlto] = useState(() =>
    fullscreen
      ? Math.max(520, window.innerHeight - 104)
      : Math.max(560, Math.round(window.innerHeight * 0.72)),
  );

  useEffect(() => {
    const calcular = () =>
      setAlto(
        fullscreen
          ? Math.max(520, window.innerHeight - 104)
          : Math.max(560, Math.round(window.innerHeight * 0.72)),
      );
    calcular();
    window.addEventListener("resize", calcular);
    return () => window.removeEventListener("resize", calcular);
  }, [fullscreen]);

  return `${alto}px`;
}

export default function MiFormatoPage() {
  const navigate = useNavigate();
  const [plantilla, setPlantilla] = useState<IPlantillaFormato | null>(null);
  const [cargando, setCargando] = useState(true);
  const [fase, setFase] = useState<Fase>("idle");
  const [aprobando, setAprobando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [generandoPreview, setGenerandoPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewEsEjemplo, setPreviewEsEjemplo] = useState(true);
  const [anexos, setAnexos] = useState<string[]>([]);
  const [docxUrl, setDocxUrl] = useState<string | null>(null);
  const [editorAbierto, setEditorAbierto] = useState(false);
  const [pantallaCompleta, setPantallaCompleta] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const [reanalizando, setReanalizando] = useState(false);
  const editorRef = useRef<FormatoDocxEditorHandle>(null);
  const alturaEditor = useEditorHeight(pantallaCompleta);

  const trabajando = fase !== "idle";
  const mapeo = useMemo(() => mapeoDe(plantilla), [plantilla]);
  const pendientes = mapeo?.validacion?.pendientes ?? [];
  const necesitaAsignacion = pendientes.length > 0;

  const generarPreview = useCallback(async (id: string) => {
    setGenerandoPreview(true);
    try {
      const res = await previewPlantilla(id);
      setPreviewUrl(res.data.previewUrl);
      setPreviewEsEjemplo(res.data.usoEjemplo);
      setAnexos(res.data.anexos ?? []);
      return true;
    } catch (e: any) {
      console.error(e);
      handleToaster(
        e?.response?.data?.message || "No se pudo generar la vista previa",
        "error",
      );
      return false;
    } finally {
      setGenerandoPreview(false);
    }
  }, []);

  const cargar = useCallback(
    async (opts?: { conPreview?: boolean }) => {
      setCargando(true);
      try {
        const res = await getMiPlantillaActiva();
        let actual = res.data;
        setPlantilla(actual);

        if (!actual?.id) {
          setDocxUrl(null);
          setPreviewUrl(null);
          return;
        }

        try {
          const dl = await downloadUrlPlantilla(actual.id);
          setDocxUrl(dl.data.downloadUrl);
        } catch {
          setDocxUrl(null);
        }

        // Formatos aprobados antes del mapeo v2 no tienen contrato:
        // se analizan solos, la docente no tiene que hacer nada.
        if (actual.docxKey && !mapeoDe(actual)) {
          try {
            const analisis = await analizarPlantilla(actual.id);
            actual = analisis.data;
            setPlantilla(actual);
          } catch (e) {
            console.warn("No se pudo analizar el formato existente:", e);
          }
        }

        // La vista previa ES la pantalla, pero deformada no sirve de nada:
        // si falta ubicar algo, primero se resuelve eso.
        const mapeoActual = mapeoDe(actual);
        const listo = mapeoActual && !mapeoActual.validacion?.pendientes?.length;
        if (opts?.conPreview !== false && actual.docxKey && listo) {
          await generarPreview(actual.id);
        }
      } catch (e) {
        console.error(e);
        handleToaster("No se pudo cargar tu formato", "error");
      } finally {
        setCargando(false);
      }
    },
    [generarPreview],
  );

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Escape cierra la pantalla completa del editor.
  useEffect(() => {
    if (!pantallaCompleta) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPantallaCompleta(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [pantallaCompleta]);

  const subirArchivo = async (file: File | null) => {
    if (!file) return;
    const nombre = file.name.toLowerCase();
    const esDocx = nombre.endsWith(".docx");
    const esPdf = nombre.endsWith(".pdf");
    if (!esDocx && !esPdf) {
      handleToaster("El archivo debe ser Word (.docx) o PDF", "error");
      return;
    }

    setPreviewUrl(null);
    setEditorAbierto(false);
    setFase("subiendo");
    try {
      const contentType = contentTypeForPlantillaFile(file);
      const up = await solicitarPlantillaUploadUrl(
        contentType,
        file.name.replace(/\.(docx|pdf)$/i, ""),
      );
      await subirPlantillaAS3(up.data.uploadUrl, file, up.data.contentType);

      if (esPdf) setFase("convirtiendo");
      const confirmada = await confirmarPlantilla(
        up.data.plantillaId,
        up.data.key,
        false,
      );

      if (confirmada.data?.docxKey) {
        setFase("detectando");
        const analisis = await analizarPlantilla(up.data.plantillaId);

        if (!analisis.requiereAsignacion) {
          setFase("previsualizando");
          await generarPreview(up.data.plantillaId);
        }
      }

      await cargar({ conPreview: false });
    } catch (e: any) {
      console.error(e);
      handleToaster(
        e?.response?.data?.message ||
          (e as Error).message ||
          "No se pudo subir el formato",
        "error",
      );
      await cargar({ conPreview: false });
    } finally {
      setFase("idle");
    }
  };

  const reanalizar = async () => {
    if (!plantilla?.id) return;
    setReanalizando(true);
    try {
      const analisis = await analizarPlantilla(plantilla.id);
      if (!analisis.requiereAsignacion) {
        await generarPreview(plantilla.id);
      }
      await cargar({ conPreview: false });
    } catch (e: any) {
      handleToaster(
        e?.response?.data?.message || "No pudimos volver a leer tu formato",
        "error",
      );
    } finally {
      setReanalizando(false);
    }
  };

  const guardarAsignacion = async (asignaciones: Record<string, string>) => {
    if (!plantilla?.id) return;
    const res = await asignarSlotsPlantilla(plantilla.id, asignaciones);
    if (!res.requiereAsignacion) {
      await generarPreview(plantilla.id);
      handleToaster("Listo, ya sabemos dónde va cada parte", "success");
    } else {
      handleToaster(res.message, "info");
    }
    await cargar({ conPreview: false });
  };

  const aprobar = async () => {
    if (!plantilla?.id) return;
    setAprobando(true);
    try {
      await activarPlantilla(plantilla.id);
      handleToaster("Listo. Tus sesiones usarán este formato", "success");
      await cargar({ conPreview: false });
    } catch {
      handleToaster("No se pudo aprobar el formato", "error");
    } finally {
      setAprobando(false);
    }
  };

  const volverAlEstandar = async () => {
    if (!plantilla?.id) return;
    try {
      await desactivarPlantilla(plantilla.id);
      handleToaster("Volvimos al formato estándar", "success");
      await cargar({ conPreview: false });
    } catch {
      handleToaster("No se pudo desactivar", "error");
    }
  };

  const guardarEdicion = async () => {
    if (!plantilla?.id || !editorRef.current) return;
    setGuardando(true);
    try {
      const blob = await editorRef.current.exportDocxBlob();
      await saveDocxPlantilla(plantilla.id, blob);
      // El documento cambió: las direcciones de celda hay que releerlas.
      await analizarPlantilla(plantilla.id);
      handleToaster("Cambios guardados", "success");
      const ok = await generarPreview(plantilla.id);
      if (ok) {
        setPantallaCompleta(false);
        setEditorAbierto(false);
      }
      await cargar({ conPreview: false });
    } catch (e) {
      console.error(e);
      handleToaster(
        (e as Error).message || "No se pudieron guardar los cambios",
        "error",
      );
    } finally {
      setGuardando(false);
    }
  };

  const inputArchivo = (
    <input
      type="file"
      accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      className="hidden"
      disabled={trabajando}
      onChange={(e) => {
        subirArchivo(e.target.files?.[0] ?? null);
        e.target.value = "";
      }}
    />
  );

  const aprobado = Boolean(plantilla?.activa);
  // Sin Word normalizado no hay nada que rellenar: la subida falló.
  const fallo = Boolean(plantilla && !plantilla.docxKey);
  const enRevision = Boolean(
    plantilla && !plantilla.activa && !fallo && !necesitaAsignacion,
  );

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 rounded-lg text-sm text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al dashboard
        </button>

        <header className="mt-4 max-w-[70ch]">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Mi formato de sesión
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
            {aprobado
              ? "Este es el formato con el que se descargan todas tus sesiones. Puedes cambiarlo o volver al formato estándar cuando quieras."
              : "Hoy tus sesiones se descargan con el formato estándar. Sube el que te pide tu colegio una sola vez y lo usaremos en todas las sesiones que generes."}
          </p>
        </header>

        {/* Estado del formato + acciones principales */}
        {cargando ? (
          <SkeletonCabecera />
        ) : (
          plantilla && (
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  {aprobado ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-500" />
                  ) : (
                    <TriangleAlert
                      className={`mt-0.5 h-5 w-5 shrink-0 ${
                        fallo
                          ? "text-red-600 dark:text-red-500"
                          : "text-amber-600 dark:text-amber-500"
                      }`}
                    />
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {aprobado
                        ? "Tu formato está activo"
                        : fallo
                          ? "No pudimos leer tu archivo"
                          : necesitaAsignacion
                            ? "Falta ubicar algunas partes"
                            : "Pendiente de tu aprobación"}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-slate-600 dark:text-slate-400">
                      {plantilla.nombre}
                      {plantilla.version > 1 && ` (versión ${plantilla.version})`}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
                    <FileUp className="h-4 w-4" />
                    Cambiar de formato
                    {inputArchivo}
                  </label>
                  {aprobado && (
                    <button
                      type="button"
                      onClick={volverAlEstandar}
                      className="inline-flex h-10 items-center rounded-xl px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                      Volver al estándar
                    </button>
                  )}
                </div>
              </div>
            </section>
          )
        )}

        {/* Trabajo en curso */}
        {trabajando && <ProgresoFases fase={fase} />}

        {/* Sin formato todavía */}
        {!cargando && !plantilla && !trabajando && (
          <section
            onDragOver={(e) => {
              e.preventDefault();
              setArrastrando(true);
            }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={(e) => {
              e.preventDefault();
              setArrastrando(false);
              subirArchivo(e.dataTransfer.files?.[0] ?? null);
            }}
            className={`mt-6 rounded-2xl border-2 border-dashed p-8 text-center transition-colors sm:p-12 ${
              arrastrando
                ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/30"
                : "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"
            }`}
          >
            <FileUp className="mx-auto h-8 w-8 text-slate-400" />
            <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
              Arrastra aquí el formato que te pide tu colegio
            </h2>
            <p className="mx-auto mt-1.5 max-w-[54ch] text-sm text-slate-600 dark:text-slate-400">
              Lo mejor es el <strong className="font-semibold">Word (.docx)</strong>{" "}
              original, aunque esté lleno con una sesión anterior. También
              aceptamos PDF, pero al convertirlo se pierden detalles del diseño.
            </p>
            <label className="mt-6 inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 active:translate-y-px">
              <FileUp className="h-4 w-4" />
              Elegir archivo
              {inputArchivo}
            </label>

            <ol className="mx-auto mt-8 max-w-md space-y-3 text-left">
              {[
                "Leemos las tablas y ubicamos cada dato de la sesión.",
                "Te mostramos una sesión completa dentro de tu formato.",
                "Si falta una casilla, te pedimos que la toques una sola vez.",
                "Si lo apruebas, se usa en todas tus sesiones.",
              ].map((paso, i) => (
                <li key={paso} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {i + 1}
                  </span>
                  {paso}
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* La conversión no dejó un Word usable */}
        {plantilla && fallo && !trabajando && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              No pudimos preparar este formato
            </h2>
            <p className="mt-2 max-w-[65ch] text-sm text-slate-600 dark:text-slate-400">
              {plantilla.mensajeError ||
                "El archivo no se pudo convertir a Word. Si subiste un PDF escaneado o una foto, prueba con el archivo original en Word."}{" "}
              Mientras tanto tus sesiones siguen saliendo en el formato estándar.
            </p>
            <label className="mt-5 inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 active:translate-y-px">
              <FileUp className="h-4 w-4" />
              Subir otro archivo
              {inputArchivo}
            </label>
          </section>
        )}

        {/* Falta ubicar partes: unos pocos clics, una sola vez */}
        {plantilla && !trabajando && !fallo && necesitaAsignacion && (
          <PasoAsignacion
            pendientes={pendientes}
            opciones={mapeo?.opciones ?? []}
            onGuardar={guardarAsignacion}
            onReanalizar={reanalizar}
            reanalizando={reanalizando}
          />
        )}

        {/* Vista previa: la prueba de que el formato funciona */}
        {plantilla && !trabajando && !fallo && !necesitaAsignacion && (
          <section className="mt-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="max-w-[70ch]">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {aprobado ? "Así se ven tus sesiones" : "Este es tu formato"}
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {previewEsEjemplo
                    ? "Llenamos una sesión de ejemplo dentro de tu formato para que veas el resultado real."
                    : "Llenamos tu última sesión dentro de tu formato para que veas el resultado real."}
                </p>
                {anexos.length > 0 && (
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Al final del documento también va{" "}
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {anexos.join(", ").toLowerCase()}
                    </span>
                    .
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => plantilla.id && generarPreview(plantilla.id)}
                disabled={generandoPreview}
                className="inline-flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                {generandoPreview ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Actualizar vista previa
              </button>
            </div>

            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
              {generandoPreview && !previewUrl ? (
                <div className="flex h-[70dvh] min-h-[420px] flex-col items-center justify-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Armando la vista previa
                  </p>
                </div>
              ) : previewUrl ? (
                <iframe
                  src={`${previewUrl}#view=FitH`}
                  title="Vista previa de tu formato con una sesión"
                  className="h-[70dvh] min-h-[420px] w-full border-0 bg-white"
                />
              ) : (
                <div className="flex h-[42dvh] min-h-[240px] flex-col items-center justify-center gap-3 px-6 text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Todavía no hay vista previa de este formato.
                  </p>
                  <button
                    type="button"
                    onClick={() => plantilla.id && generarPreview(plantilla.id)}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Generar vista previa
                  </button>
                </div>
              )}
            </div>

            {enRevision && (
              <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-900">
                <p className="max-w-[60ch] text-sm text-slate-600 dark:text-slate-400">
                  Si el documento de arriba es como quieres tus sesiones,
                  apruébalo. Lo usaremos cada vez que generes una.
                </p>
                <button
                  type="button"
                  onClick={aprobar}
                  disabled={aprobando || !previewUrl}
                  className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 active:translate-y-px disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  {aprobando ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Usar este formato siempre
                </button>
              </div>
            )}
          </section>
        )}

        {/* Opción avanzada: retocar el Word. Casi nadie debería necesitarla. */}
        {plantilla && !trabajando && !fallo && docxUrl && (
          <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setEditorAbierto((v) => !v)}
              aria-expanded={editorAbierto}
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 dark:hover:bg-slate-800/60"
            >
              <span className="flex items-center gap-3">
                <PencilLine className="h-4 w-4 shrink-0 text-slate-500" />
                <span>
                  <span className="block text-sm font-medium text-slate-900 dark:text-white">
                    Retocar mi formato
                  </span>
                  <span className="block text-sm text-slate-500 dark:text-slate-400">
                    Cambia títulos, colores o filas del documento. Opcional.
                  </span>
                </span>
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                  editorAbierto ? "rotate-180" : ""
                }`}
              />
            </button>

            {editorAbierto && !pantallaCompleta && (
              <div className="border-t border-slate-200 p-4 dark:border-slate-700">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="max-w-[60ch] text-sm text-slate-600 dark:text-slate-400">
                    Al guardar volvemos a leer tu formato, así que puedes mover
                    filas o renombrar secciones sin romper nada.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPantallaCompleta(true)}
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <Maximize2 className="h-4 w-4" />
                      Pantalla completa
                    </button>
                    <button
                      type="button"
                      onClick={guardarEdicion}
                      disabled={guardando}
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 active:translate-y-px disabled:opacity-50"
                    >
                      {guardando ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Guardar cambios
                    </button>
                  </div>
                </div>

                <Suspense fallback={<CargandoEditor alto={alturaEditor} />}>
                  <FormatoDocxEditor
                    ref={editorRef}
                    downloadUrl={docxUrl}
                    height={alturaEditor}
                  />
                </Suspense>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Editor a pantalla completa */}
      {pantallaCompleta && docxUrl && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900 dark:text-white">
                Retocar mi formato
              </p>
              <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                {plantilla?.nombre}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={guardarEdicion}
                disabled={guardando}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {guardando ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Guardar cambios
              </button>
              <button
                type="button"
                onClick={() => setPantallaCompleta(false)}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Minimize2 className="h-4 w-4" />
                Salir
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1 p-3">
            <Suspense fallback={<CargandoEditor alto={alturaEditor} />}>
              <FormatoDocxEditor
                ref={editorRef}
                downloadUrl={docxUrl}
                height={alturaEditor}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Paso de asignación: solo aparece si falta algo imprescindible.
 * La docente toca un botón grande con el nombre de la casilla de su formato
 * (ej. "Junto a Grado"). Nunca ve direcciones, centímetros ni desplegables.
 */
function PasoAsignacion({
  pendientes,
  opciones,
  onGuardar,
  onReanalizar,
  reanalizando,
}: {
  pendientes: IPendienteMapeo[];
  opciones: IOpcionSlot[];
  onGuardar: (asignaciones: Record<string, string>) => Promise<void>;
  onReanalizar: () => void;
  reanalizando: boolean;
}) {
  const [pendienteIdx, setPendienteIdx] = useState(0);
  const [seleccion, setSeleccion] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);

  const pendiente = pendientes[Math.min(pendienteIdx, pendientes.length - 1)];
  const elegidas = Object.values(seleccion).filter(Boolean);
  const completo = pendientes.every((p) => seleccion[p.campo]);

  const elegir = (addr: string) => {
    if (!pendiente) return;
    const siguiente = { ...seleccion, [pendiente.campo]: addr };
    setSeleccion(siguiente);

    if (pendienteIdx < pendientes.length - 1) {
      setPendienteIdx(pendienteIdx + 1);
      return;
    }

    // Última pregunta: guardar de una.
    void (async () => {
      setGuardando(true);
      try {
        await onGuardar(
          Object.fromEntries(
            Object.entries(siguiente).filter(([, a]) => a),
          ),
        );
      } finally {
        setGuardando(false);
      }
    })();
  };

  const guardar = async () => {
    setGuardando(true);
    try {
      await onGuardar(
        Object.fromEntries(
          Object.entries(seleccion).filter(([, addr]) => addr),
        ),
      );
    } finally {
      setGuardando(false);
    }
  };

  if (opciones.length === 0) {
    return (
      <section className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-6 dark:border-amber-800/60 dark:bg-amber-950/30">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          No pudimos reconocer la estructura de tu formato
        </h2>
        <p className="mt-2 max-w-[65ch] text-sm text-slate-700 dark:text-slate-300">
          Suele pasar con PDF escaneados o fotos. Si tienes el Word original
          (.docx) que te pide el colegio, súbelo: con ese archivo sí
          reconocemos las tablas.
        </p>
        <button
          type="button"
          onClick={onReanalizar}
          disabled={reanalizando}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
        >
          {reanalizando ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Intentar de nuevo
        </button>
      </section>
    );
  }

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start gap-3">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-500" />
        <div className="max-w-[65ch]">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Toca dónde va {nombreCampo(pendiente.campo)}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {pendientes.length > 1
              ? `Paso ${pendienteIdx + 1} de ${pendientes.length}. `
              : ""}
            {pendiente.motivo
              ? `${pendiente.motivo.charAt(0).toUpperCase()}${pendiente.motivo.slice(1)}.`
              : "Elige el espacio vacío junto a esa etiqueta. Solo esta vez."}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {opciones.map((opcion) => {
          const activa = seleccion[pendiente.campo] === opcion.addr;
          const ocupada =
            elegidas.includes(opcion.addr) &&
            seleccion[pendiente.campo] !== opcion.addr;
          return (
            <button
              key={opcion.addr}
              type="button"
              disabled={ocupada || guardando}
              onClick={() => elegir(opcion.addr)}
              className={`flex min-h-[4.5rem] flex-col items-start justify-center rounded-2xl border-2 px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40 ${
                activa
                  ? "border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/40"
                  : "border-dashed border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/60 dark:border-slate-600 dark:bg-slate-950 dark:hover:border-blue-500 dark:hover:bg-blue-950/30"
              }`}
            >
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Espacio vacío junto a
              </span>
              <span className="mt-0.5 text-base font-semibold text-slate-900 dark:text-white">
                {opcion.rotulo || opcion.descripcion}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-5 dark:border-slate-700">
        {completo && (
          <button
            type="button"
            onClick={guardar}
            disabled={guardando}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 active:translate-y-px disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            {guardando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Ver mi formato
          </button>
        )}
        <button
          type="button"
          onClick={onReanalizar}
          disabled={reanalizando}
          className="inline-flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          {reanalizando ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Intentar de nuevo
        </button>
      </div>
    </section>
  );
}

function CargandoEditor({ alto }: { alto: string }) {
  return (
    <div
      style={{ height: alto }}
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Cargando el editor
      </p>
    </div>
  );
}

function ProgresoFases({ fase }: { fase: Fase }) {
  if (fase === "idle") return null;
  const orden: Exclude<Fase, "idle">[] = [
    "subiendo",
    "convirtiendo",
    "detectando",
    "previsualizando",
  ];
  const actual = orden.indexOf(fase as Exclude<Fase, "idle">);

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <ol className="space-y-3">
        {orden.map((f, i) => {
          const hecho = i < actual;
          const activa = i === actual;
          return (
            <li
              key={f}
              className={`flex items-center gap-3 text-sm ${
                activa
                  ? "font-medium text-slate-900 dark:text-white"
                  : hecho
                    ? "text-slate-500 dark:text-slate-400"
                    : "text-slate-400 dark:text-slate-500"
              }`}
            >
              {hecho ? (
                <Check className="h-4 w-4 shrink-0 text-green-600 dark:text-green-500" />
              ) : activa ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-blue-600" />
              ) : (
                <span className="h-4 w-4 shrink-0 rounded-full border border-slate-300 dark:border-slate-600" />
              )}
              {FASES[f]}
            </li>
          );
        })}
      </ol>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
      </div>
    </section>
  );
}

function SkeletonCabecera() {
  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-4">
        <div className="w-full space-y-2">
          <div className="h-4 w-48 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
          <div className="h-3 w-64 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="h-10 w-32 shrink-0 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
      </div>
    </section>
  );
}
