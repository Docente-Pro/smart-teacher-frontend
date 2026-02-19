import { useEffect, useState } from "react";
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
  Hash,
  Type,
  Clock,
  AlertTriangle,
  Users,
  Activity,
  Palette,
  MessageCircle,
  Globe,
  Calculator,
  Microscope,
  Church,
  Search,
  X,
  Loader2,
  Wand2,
} from "lucide-react";
import SelectProblematicaModal from "./SelectProblematicaModal";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { useUnidadStore } from "@/store/unidad.store";
import { createUnidad, seleccionarAreas } from "@/services/unidad.service";
import { getAllAreas } from "@/services/areas.service";
import { generarTituloUnidad } from "@/services/ia-unidad.service";
import type { IUsuario } from "@/interfaces/IUsuario";
import type { IArea } from "@/interfaces/IArea";

interface Props {
  pagina: number;
  setPagina: (pagina: number) => void;
  usuario: IUsuario;
}

/* ─── Mapas de iconos y gradientes por área ─── */

const areaIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Personal Social": Users,
  "Educación Física": Activity,
  "Arte y Cultura": Palette,
  Comunicación: MessageCircle,
  Inglés: Globe,
  Matemática: Calculator,
  "Ciencia y Tecnología": Microscope,
  "Educación Religiosa": Church,
};

const areaGradients: Record<string, string> = {
  "Personal Social": "from-blue-500 to-cyan-500",
  "Educación Física": "from-green-500 to-emerald-500",
  "Arte y Cultura": "from-purple-500 to-pink-500",
  Comunicación: "from-orange-500 to-red-500",
  Inglés: "from-indigo-500 to-blue-500",
  Matemática: "from-yellow-500 to-orange-500",
  "Ciencia y Tecnología": "from-teal-500 to-green-500",
  "Educación Religiosa": "from-amber-500 to-yellow-500",
};

const duracionesUnidad = [
  { semanas: 2, label: "2 semanas", desc: "Unidad corta", gradient: "from-emerald-500 to-teal-500" },
  { semanas: 3, label: "3 semanas", desc: "Unidad estándar", gradient: "from-blue-500 to-cyan-500" },
  { semanas: 4, label: "4 semanas", desc: "Unidad completa", gradient: "from-purple-500 to-pink-500" },
  { semanas: 6, label: "6 semanas", desc: "Unidad extendida", gradient: "from-orange-500 to-red-500" },
];

function Step1DatosUnidad({ pagina, setPagina, usuario }: Props) {
  const { setUnidadId, setDatosBase } = useUnidadStore();
  const { showLoading, hideLoading } = useGlobalLoading();

  // Catálogos
  const [areas, setAreas] = useState<IArea[]>([]);

  // Campos del formulario
  const [titulo, setTitulo] = useState("");
  const [numeroUnidad, setNumeroUnidad] = useState(1);
  const [duracion, setDuracion] = useState(0);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [areasSeleccionadas, setAreasSeleccionadas] = useState<string[]>([]);

  // Problemática (seleccionada desde modal)
  const [problematica, setProblematica] = useState<{ id: number; nombre: string; descripcion: string } | null>(
    usuario.problematica
      ? { id: usuario.problematica.id, nombre: usuario.problematica.nombre, descripcion: usuario.problematica.descripcion }
      : null
  );
  const [showProblematicaModal, setShowProblematicaModal] = useState(false);

  // IA — generar título
  const [generandoTitulo, setGenerandoTitulo] = useState(false);
  const [sugerenciasTitulo, setSugerenciasTitulo] = useState<string[]>([]);

  const handleGenerarTitulo = async () => {
    if (!problematica) {
      handleToaster("Primero selecciona una problemática", "error");
      return;
    }
    if (areasSeleccionadas.length === 0) {
      handleToaster("Selecciona al menos un área", "error");
      return;
    }
    try {
      setGenerandoTitulo(true);
      setSugerenciasTitulo([]);
      const res = await generarTituloUnidad({
        nivel,
        grado,
        problematica: {
          nombre: problematica.nombre,
          descripcion: problematica.descripcion,
        },
        areas: areasSeleccionadas,
        numeroUnidad,
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

  // Datos del usuario (pre-llenados)
  const nivel = usuario.nivel?.nombre || "";
  const grado = usuario.grado?.nombre || "";

  // Cargar áreas al montar
  useEffect(() => {
    async function cargar() {
      try {
        const response = await getAllAreas();
        setAreas(response.data.data || response.data);
      } catch {
        handleToaster("Error al cargar las áreas", "error");
      }
    }
    cargar();
  }, []);

  // Calcular fecha fin automáticamente
  useEffect(() => {
    if (fechaInicio && duracion > 0) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(inicio);
      fin.setDate(fin.getDate() + duracion * 7); // semanas → días
      setFechaFin(fin.toISOString().split("T")[0]);
    }
  }, [fechaInicio, duracion]);

  function toggleArea(nombre: string) {
    setAreasSeleccionadas((prev) =>
      prev.includes(nombre) ? prev.filter((a) => a !== nombre) : [...prev, nombre]
    );
  }

  function getIcon(nombre: string) {
    const key = Object.keys(areaIcons).find((k) => nombre.includes(k));
    return key ? areaIcons[key] : BookOpen;
  }

  function getGradient(nombre: string) {
    const key = Object.keys(areaGradients).find((k) => nombre.includes(k));
    return key ? areaGradients[key] : "from-violet-500 to-purple-500";
  }

  /* ─── Validar y crear unidad en backend ─── */
  async function handleContinuar() {
    // Validaciones
    if (!titulo.trim()) return handleToaster("Ingresa el título de la unidad", "error");
    if (duracion <= 0) return handleToaster("Selecciona la duración", "error");
    if (!fechaInicio) return handleToaster("Selecciona la fecha de inicio", "error");
    if (areasSeleccionadas.length === 0) return handleToaster("Selecciona al menos un área", "error");
    if (!problematica) return handleToaster("Selecciona una problemática", "error");

    showLoading("Creando unidad de aprendizaje...");

    try {
      // 1. Crear la unidad (sin áreas — se asignan después)
      const payload = {
        usuarioId: usuario.id,
        titulo,
        tipo: "INDIVIDUAL" as const,
        nivelId: usuario.nivelId!,
        gradoId: usuario.gradoId!,
        numeroUnidad,
        duracion,
        fechaInicio,
        fechaFin,
        problematicaId: problematica.id,
      };

      const response = await createUnidad(payload);
      const unidad = response.data.data ?? response.data;

      // 2. Asignar áreas al miembro
      const areaIds = areas
        .filter((a) => areasSeleccionadas.includes(a.nombre))
        .map((a) => a.id);
      await seleccionarAreas(unidad.id, { areaIds });

      // Guardar en store
      setUnidadId(unidad.id);
      setDatosBase({
        nivel,
        grado,
        titulo,
        numeroUnidad,
        duracion,
        fechaInicio,
        fechaFin,
        problematicaNombre: problematica.nombre,
        problematicaDescripcion: problematica.descripcion,
        areas: areasSeleccionadas.map((n) => ({ nombre: n })),
      });

      handleToaster("Unidad creada exitosamente", "success");
      setPagina(pagina + 1);
    } catch (error: any) {
      console.error("Error al crear unidad:", error);
      const msg = error?.response?.data?.message || "Error al crear la unidad";
      handleToaster(msg, "error");
    } finally {
      hideLoading();
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* ── Header ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg mb-6 shadow-lg">
            <Sparkles className="h-4 w-4" />
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-violet-600 text-xs font-bold">
              1
            </div>
            <span className="text-sm font-semibold tracking-wide">PASO 1 DE 4</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-4 tracking-tight">
            Crear Unidad de Aprendizaje
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Hola{" "}
            <span className="font-bold text-slate-900 dark:text-white">{usuario.nombre}</span>,
            configura los datos generales de tu unidad
          </p>
        </div>

        {/* ── Info pre-llenada ── */}
        <Card className="mb-8 border-2 border-violet-200 dark:border-violet-800 shadow-xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/40">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 justify-center">
              <InfoBadge icon={<GraduationCap className="h-4 w-4" />} label="Nivel" value={nivel || "—"} />
              <InfoBadge icon={<BookOpen className="h-4 w-4" />} label="Grado" value={grado || "—"} />
            </div>
          </CardContent>
        </Card>

        {/* ── Problemática ── */}
        <Card className="mb-8 border-2 border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <div className="h-10 w-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              Problemática
            </CardTitle>
            <CardDescription className="text-base">
              Selecciona o crea la problemática que abordará esta unidad
            </CardDescription>
          </CardHeader>
          <CardContent>
            {problematica ? (
              <div className="flex items-start gap-4 p-4 rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle2 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">{problematica.nombre}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{problematica.descripcion}</p>
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

        {/* Modal de selección de problemática */}
        <SelectProblematicaModal
          isOpen={showProblematicaModal}
          onClose={() => setShowProblematicaModal(false)}
          selectedId={problematica?.id ?? null}
          onSelect={(p) => {
            setProblematica(p);
            setShowProblematicaModal(false);
          }}
        />

                {/* ── Selección de Áreas (multi) ── */}
        <Card className="mb-8 border-2 border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <div className="h-10 w-10 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              Áreas Curriculares
            </CardTitle>
            <CardDescription className="text-base">
              Selecciona una o más áreas para integrar en la unidad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {areas.map((area) => {
                const IconComp = getIcon(area.nombre);
                const gradient = getGradient(area.nombre);
                const isSelected = areasSeleccionadas.includes(area.nombre);

                return (
                  <div
                    key={area.id}
                    onClick={() => toggleArea(area.nombre)}
                    className={`
                      group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300
                      ${
                        isSelected
                          ? "ring-4 ring-violet-500 ring-offset-2 dark:ring-offset-slate-900 scale-105 shadow-2xl"
                          : "hover:scale-105 hover:shadow-xl border-2 border-slate-200 dark:border-slate-700"
                      }
                    `}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-opacity duration-300 ${
                        isSelected ? "opacity-100" : "opacity-80 group-hover:opacity-90"
                      }`}
                    />
                    <div className="relative p-5 flex flex-col items-center gap-3 text-white">
                      <div
                        className={`p-3 bg-white/20 backdrop-blur-sm rounded-lg transition-transform duration-300 ${
                          isSelected ? "scale-110" : "group-hover:scale-110"
                        }`}
                      >
                        <IconComp className="h-7 w-7" />
                      </div>
                      <p className="text-sm font-bold text-center leading-tight">
                        {area.nombre.replace("Área de ", "")}
                      </p>
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-lg">
                          <CheckCircle2 className="h-5 w-5 text-violet-600" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {areasSeleccionadas.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {areasSeleccionadas.map((a) => (
                  <span
                    key={a}
                    className="px-3 py-1 bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 rounded-full text-sm font-medium"
                  >
                    {a}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Título y Número ── */}
        <Card className="mb-8 border-2 border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <div className="h-10 w-10 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Type className="h-6 w-6 text-white" />
              </div>
              Título y Número de Unidad
            </CardTitle>
            <CardDescription className="text-base">
              Dale un nombre significativo a tu unidad
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="titulo" className="text-sm font-medium mb-1.5 block">
                  Título de la Unidad
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="titulo"
                    placeholder="Ej: Cuidamos nuestro medio ambiente"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="h-12 text-base flex-1"
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
              </div>
              <div>
                <Label htmlFor="numero" className="text-sm font-medium mb-1.5 block">
                  N° de Unidad
                </Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="numero"
                    type="number"
                    min={1}
                    max={12}
                    value={numeroUnidad}
                    onChange={(e) => setNumeroUnidad(Number(e.target.value))}
                    className="h-12 text-base pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Sugerencias de la IA */}
            {generandoTitulo && (
              <div className="flex items-center gap-2 mt-4 text-violet-600 dark:text-violet-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">Generando sugerencias...</span>
              </div>
            )}

            {sugerenciasTitulo.length > 0 && (
              <div className="mt-4 space-y-2">
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
                      className={`
                        w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200
                        ${titulo === s
                          ? "border-violet-500 bg-violet-50 dark:bg-violet-900/30 shadow-md"
                          : "border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600 hover:bg-violet-50/50 dark:hover:bg-violet-900/10"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                          ${titulo === s
                            ? "bg-violet-500 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                          }
                        `}>
                          {i + 1}
                        </div>
                        <span className={`text-sm font-medium ${
                          titulo === s
                            ? "text-violet-700 dark:text-violet-300"
                            : "text-slate-700 dark:text-slate-200"
                        }`}>
                          {s}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>



        {/* ── Duración ── */}
        <Card className="mb-8 border-2 border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              Duración de la Unidad
            </CardTitle>
            <CardDescription className="text-base">
              ¿Cuántas semanas durará esta unidad?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {duracionesUnidad.map((d) => {
                const isSelected = duracion === d.semanas;
                return (
                  <div
                    key={d.semanas}
                    onClick={() => setDuracion(d.semanas)}
                    className={`
                      group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300
                      ${
                        isSelected
                          ? "ring-4 ring-purple-500 ring-offset-2 dark:ring-offset-slate-900 scale-105 shadow-2xl"
                          : "hover:scale-105 hover:shadow-xl border-2 border-slate-200 dark:border-slate-700"
                      }
                    `}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${d.gradient} transition-opacity duration-300 ${
                        isSelected ? "opacity-100" : "opacity-10 group-hover:opacity-20"
                      }`}
                    />
                    <div className="relative p-6 flex flex-col items-center gap-2">
                      <Clock
                        className={`h-8 w-8 transition-colors ${
                          isSelected ? "text-white" : "text-slate-600 dark:text-slate-400"
                        }`}
                      />
                      <p
                        className={`text-2xl font-extrabold ${
                          isSelected ? "text-white" : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {d.label}
                      </p>
                      <p
                        className={`text-sm ${
                          isSelected ? "text-white/90" : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {d.desc}
                      </p>
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-lg">
                          <CheckCircle2 className="h-5 w-5 text-purple-600" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ── Fechas ── */}
        <Card className="mb-8 border-2 border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              Fechas de la Unidad
            </CardTitle>
            <CardDescription className="text-base">
              La fecha de fin se calcula automáticamente según la duración
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="fechaInicio" className="text-sm font-medium mb-1.5 block">
                  Fecha de Inicio
                </Label>
                <Input
                  id="fechaInicio"
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="h-12 text-base"
                />
              </div>
              <div>
                <Label htmlFor="fechaFin" className="text-sm font-medium mb-1.5 block">
                  Fecha de Fin{" "}
                  <span className="text-xs text-slate-400">(auto-calculada)</span>
                </Label>
                <Input
                  id="fechaFin"
                  type="date"
                  value={fechaFin}
                  readOnly
                  className="h-12 text-base bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Botón continuar ── */}
        <div className="flex justify-end pb-10">
          <Button
            onClick={handleContinuar}
            disabled={!titulo || duracion <= 0 || !fechaInicio || areasSeleccionadas.length === 0 || !problematica}
            className="h-14 px-10 text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuar
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Badge informativo ─── */

function InfoBadge({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-violet-100 dark:border-violet-800">
      <div className="text-violet-600 dark:text-violet-400">{icon}</div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

export default Step1DatosUnidad;
