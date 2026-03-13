import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  BookOpen,
  Calendar,
  Type,
  Clock,
  Search,
  X,
  AlertTriangle,
  Wand2,
  Loader2,
} from "lucide-react";
import SelectProblematicaModal from "./SelectProblematicaModal";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { useUnidadStore } from "@/store/unidad.store";
import { useAuthStore } from "@/store/auth.store";
import { crearUnidadBatch } from "@/services/unidad.service";
import { generarTituloUnidad } from "@/services/ia-unidad.service";
import type { IUsuario } from "@/interfaces/IUsuario";
import type { IGrado } from "@/interfaces/IGrado";

interface Props {
  pagina: number;
  setPagina: (pagina: number) => void;
  usuario: IUsuario;
  gradosDisponibles: IGrado[];
  nivelId: number;
  nivelNombre: string;
}

const duracionesUnidad = [
  { semanas: 2, label: "2 semanas", desc: "Unidad corta", gradient: "from-emerald-500 to-teal-500" },
  { semanas: 4, label: "4 semanas", desc: "Unidad estándar", gradient: "from-blue-500 to-cyan-500" },
  { semanas: 5, label: "5 semanas", desc: "Unidad extendida", gradient: "from-purple-500 to-pink-500" },
];

function Step1DatosUnidadBatch({
  pagina,
  setPagina,
  usuario,
  gradosDisponibles,
  nivelId,
  nivelNombre,
}: Props) {
  const { setUnidadId, setUnidadBatch, setDatosBase } = useUnidadStore();
  const updateAuthUser = useAuthStore((s) => s.updateUser);
  const { showLoading, hideLoading } = useGlobalLoading();

  const [titulo, setTitulo] = useState("");
  const [duracion, setDuracion] = useState(0);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [gradoIdsSeleccionados, setGradoIdsSeleccionados] = useState<Set<number>>(
    new Set(gradosDisponibles.map((g) => g.id))
  );
  const [sesionesSemanales] = useState(6);

  const [problematica, setProblematica] = useState<{
    id: number;
    nombre: string;
    descripcion: string;
  } | null>(
    usuario.problematica
      ? {
          id: usuario.problematica.id,
          nombre: usuario.problematica.nombre,
          descripcion: usuario.problematica.descripcion,
        }
      : null
  );
  const [showProblematicaModal, setShowProblematicaModal] = useState(false);

  const [generandoTitulo, setGenerandoTitulo] = useState(false);
  const [sugerenciasTitulo, setSugerenciasTitulo] = useState<string[]>([]);

  const handleGenerarTitulo = async () => {
    if (!problematica) {
      handleToaster("Primero selecciona una problemática", "error");
      return;
    }
    const primerGradoId = Array.from(gradoIdsSeleccionados)[0];
    const primerGrado = gradosDisponibles.find((g) => g.id === primerGradoId);
    const gradoNombre = primerGrado?.nombre ?? gradosDisponibles[0]?.nombre ?? "Secundaria";
    try {
      setGenerandoTitulo(true);
      setSugerenciasTitulo([]);
      const res = await generarTituloUnidad({
        nivel: nivelNombre,
        grado: gradoNombre,
        problematica: {
          nombre: problematica.nombre,
          descripcion: problematica.descripcion,
        },
        areas: [],
        numeroUnidad: 1,
      });
      if (res?.sugerencias?.length) {
        setSugerenciasTitulo(res.sugerencias);
        handleToaster("Elige una de las sugerencias de la IA", "success");
      }
    } catch {
      handleToaster("No se pudo generar sugerencias", "error");
    } finally {
      setGenerandoTitulo(false);
    }
  };

  const esPremium =
    usuario.suscripcion?.activa &&
    (usuario.suscripcion.plan === "premium_mensual" || usuario.suscripcion.plan === "premium_anual");

  const fechaFinCalculada =
    fechaInicio && duracion > 0
      ? (() => {
          const inicio = new Date(fechaInicio);
          const fin = new Date(inicio);
          fin.setDate(fin.getDate() + duracion * 7);
          return fin.toISOString().split("T")[0];
        })()
      : "";

  useEffect(() => {
    if (fechaFinCalculada && !esPremium) setFechaFin(fechaFinCalculada);
    if (fechaFinCalculada && esPremium && !fechaFin) setFechaFin(fechaFinCalculada);
  }, [fechaFinCalculada]);

  function toggleGrado(gradoId: number) {
    setGradoIdsSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(gradoId)) {
        next.delete(gradoId);
      } else {
        next.add(gradoId);
      }
      return next;
    });
  }

  async function handleContinuar() {
    if (!titulo.trim()) return handleToaster("Ingresa el título de la unidad", "error");
    if (duracion <= 0) return handleToaster("Selecciona la duración", "error");
    if (!fechaInicio) return handleToaster("Selecciona la fecha de inicio", "error");
    if (!problematica) return handleToaster("Selecciona una problemática", "error");
    if (gradoIdsSeleccionados.size === 0)
      return handleToaster("Selecciona al menos un grado", "error");

    showLoading("Creando unidades de aprendizaje...");

    try {
      const gradoIds = Array.from(gradoIdsSeleccionados);
      const fechaFinFinal = esPremium ? fechaFin : (fechaFinCalculada || fechaFin);
      const unidades = await crearUnidadBatch({
        titulo,
        usuarioId: usuario.id,
        nivelId,
        problematicaId: problematica.id,
        duracion,
        fechaInicio,
        fechaFin: fechaFinFinal,
        gradoIds,
        sesionesSemanales,
      });

      if (unidades.length === 0) {
        handleToaster("No se crearon unidades. Revisa los datos.", "error");
        return;
      }

      const batchItems = unidades
        .map((u) => ({
          id: u.id,
          gradoId: u.gradoId,
          gradoNombre: u.grado?.nombre || `Grado ${u.gradoId}`,
        }))
        .sort((a, b) => a.gradoId - b.gradoId);

      setUnidadBatch(batchItems);
      setUnidadId(batchItems[0].id);

      setDatosBase({
        nivel: nivelNombre,
        grado: batchItems[0].gradoNombre,
        titulo,
        numeroUnidad: 1,
        duracion,
        fechaInicio,
        fechaFin: fechaFinFinal,
        problematicaNombre: problematica.nombre,
        problematicaDescripcion: problematica.descripcion,
        areas: [],
        tipo: "PERSONAL",
        sesionesSemanales,
      });

      updateAuthUser({ problematicaCompleta: true });

      handleToaster(
        `Se crearon ${unidades.length} unidad${unidades.length > 1 ? "es" : ""} exitosamente`,
        "success"
      );
      setPagina(pagina + 1);
    } catch (error: any) {
      console.error("Error al crear unidades batch:", error);
      const msg =
        error?.response?.data?.message || "Error al crear las unidades. Intenta nuevamente.";
      handleToaster(msg, "error");
    } finally {
      hideLoading();
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg mb-4 sm:mb-6 shadow-lg">
            <Sparkles className="h-4 w-4" />
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-violet-600 text-xs font-bold">
              1
            </div>
            <span className="text-sm font-semibold tracking-wide">PASO 1 DE 4</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4 tracking-tight">
            Crear Unidades por Grado
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Hola <span className="font-bold text-slate-900 dark:text-white">{usuario.nombre}</span>,
            configura los datos compartidos. Se creará una unidad por cada grado seleccionado.
          </p>
        </div>

        <Card className="mb-8 border-2 border-violet-200 dark:border-violet-800 shadow-xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/40">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/80 dark:bg-slate-800/80">
                <GraduationCap className="h-4 w-4 text-violet-600" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nivel: {nivelNombre}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Problemática */}
        <Card className="mb-8 border-2 border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <div className="h-10 w-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              Problemática
            </CardTitle>
            <CardDescription className="text-base">
              Selecciona la problemática que abordarán estas unidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            {problematica ? (
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-4 rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20">
                <div className="flex-shrink-0 mt-1 hidden sm:block">
                  <CheckCircle2 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                    {problematica.nombre}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {problematica.descripcion}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowProblematicaModal(true)}
                    className="border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900/40"
                  >
                    <Search className="h-4 w-4 mr-1.5" />
                    Cambiar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setProblematica(null)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowProblematicaModal(true)}
                className="w-full flex flex-col items-center gap-3 py-10 rounded-xl border-2 border-dashed border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors cursor-pointer group"
              >
                <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/50 group-hover:scale-110 transition-transform">
                  <Search className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-center">
                  <p className="text-base font-semibold text-amber-700 dark:text-amber-400">
                    Seleccionar Problemática
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Haz clic para elegir o crear una problemática
                  </p>
                </div>
              </button>
            )}
          </CardContent>
        </Card>

        <SelectProblematicaModal
          isOpen={showProblematicaModal}
          onClose={() => setShowProblematicaModal(false)}
          selectedId={problematica?.id ?? null}
          onSelect={(p) => {
            setProblematica(p);
            setShowProblematicaModal(false);
          }}
        />

        {/* Grados a incluir */}
        <Card className="mb-8 border-2 border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <div className="h-10 w-10 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              Grados a incluir
            </CardTitle>
            <CardDescription className="text-base">
              Selecciona los grados para los que crearás una unidad (se creará una por cada uno)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {gradosDisponibles.map((grado) => {
                const isSelected = gradoIdsSeleccionados.has(grado.id);
                return (
                  <button
                    key={grado.id}
                    type="button"
                    onClick={() => toggleGrado(grado.id)}
                    className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                      isSelected
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {grado.nombre}
                    {isSelected && (
                      <CheckCircle2 className="inline-block ml-2 h-4 w-4 text-violet-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Título */}
        <Card className="mb-8 border-2 border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <div className="h-10 w-10 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Type className="h-6 w-6 text-white" />
              </div>
              Título de la Unidad
            </CardTitle>
            <CardDescription className="text-base">
              Título compartido para todas las unidades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Input
                placeholder="Ej: Aprendemos a resolver problemas"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="h-12 text-base flex-1 min-w-[200px]"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerarTitulo}
                disabled={generandoTitulo || !problematica}
                className="h-12 px-4 border-violet-300 dark:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/30 text-violet-700 dark:text-violet-300 shrink-0"
                title={!problematica ? "Selecciona una problemática primero" : "Generar título con IA"}
              >
                {generandoTitulo ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Wand2 className="h-5 w-5" />
                )}
                <span className="ml-2 hidden sm:inline">
                  {generandoTitulo ? "Generando..." : "Sugerir con IA"}
                </span>
              </Button>
            </div>

            {generandoTitulo && (
              <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">Generando sugerencias...</span>
              </div>
            )}

            {sugerenciasTitulo.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  Sugerencias de la IA — haz clic para elegir:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {sugerenciasTitulo.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setTitulo(s);
                        setSugerenciasTitulo([]);
                        handleToaster("Título seleccionado", "success");
                      }}
                      className="text-left p-3 rounded-lg border-2 border-violet-200 dark:border-violet-800 hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all text-sm text-slate-700 dark:text-slate-300"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Duración y Fechas */}
        <Card className="mb-8 border-2 border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <div className="h-10 w-10 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              Duración y Fechas
            </CardTitle>
            <CardDescription className="text-base">
              Configura la duración y el período de la unidad
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-2 block">Duración</Label>
              <div className="grid grid-cols-3 gap-3">
                {duracionesUnidad.map((d) => (
                  <button
                    key={d.semanas}
                    type="button"
                    onClick={() => setDuracion(d.semanas)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      duracion === d.semanas
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-950/40"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <span className="font-bold text-slate-900 dark:text-white">{d.label}</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{d.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fechaInicio" className="text-sm font-medium mb-1.5 block">
                  Fecha de inicio
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="fechaFin" className="text-sm font-medium mb-1.5 block">
                  Fecha de fin
                </Label>
                {esPremium ? (
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="fechaFin"
                      type="date"
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                ) : (
                  <Input
                    id="fechaFin"
                    type="date"
                    value={fechaFin}
                    readOnly
                    className="h-12 bg-slate-100 dark:bg-slate-800"
                  />
                )}
                <p className="text-xs text-slate-500 mt-1">
                  {esPremium
                    ? "Puedes ajustar la fecha de fin manualmente"
                    : "Calculada automáticamente según la duración"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Continuar */}
        <div className="flex justify-end">
          <Button
            onClick={handleContinuar}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-6 text-base font-semibold rounded-xl shadow-lg"
          >
            Crear {gradoIdsSeleccionados.size} unidad{gradoIdsSeleccionados.size !== 1 ? "es" : ""}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Step1DatosUnidadBatch;
