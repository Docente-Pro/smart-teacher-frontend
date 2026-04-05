import { useEffect, useMemo, useState } from "react";
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
  Search,
  X,
  Loader2,
  Wand2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { getAreaColor, getAreaIcon } from "@/constants/areaColors";
import SelectProblematicaModal from "./SelectProblematicaModal";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { useUnidadStore } from "@/store/unidad.store";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";
import { createUnidad, updateUnidad, seleccionarAreas } from "@/services/unidad.service";
import { updateUsuario } from "@/services/usuarios.service";
import { getAllAreas, isAreaPrimaria } from "@/services/areas.service";
import { generarTituloUnidad } from "@/services/ia-unidad.service";
import type { IUsuario } from "@/interfaces/IUsuario";
import type { IArea } from "@/interfaces/IArea";
import type { ModoSecundaria, TipoUnidad } from "@/interfaces/IUnidad";

interface Props {
  pagina: number;
  setPagina: (pagina: number) => void;
  usuario: IUsuario;
  tipoUnidad: TipoUnidad;
  maxMiembros: number;
}

const SECONDARY_GRADES = [
  "Primer Año",
  "Segundo Año",
  "Tercer Año",
  "Cuarto Año",
  "Quinto Año",
];
const SECONDARY_GRADE_ID_BY_NAME: Record<string, number> = {
  "Primer Año": 7,
  "Segundo Año": 8,
  "Tercer Año": 9,
  "Cuarto Año": 10,
  "Quinto Año": 11,
};
const DEFAULT_SECONDARY_WEEKS = 4;

function normalizeAreaName(area: string): string {
  return (area || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function isTutoriaArea(area: string): boolean {
  return normalizeAreaName(area).includes("tutoria");
}

function mapUserGradeToSecondaryYear(gradoNombre?: string): string | null {
  const normalized = normalizeAreaName(gradoNombre || "");
  if (normalized.includes("primer")) return "Primer Año";
  if (normalized.includes("segundo")) return "Segundo Año";
  if (normalized.includes("tercer")) return "Tercer Año";
  if (normalized.includes("cuarto")) return "Cuarto Año";
  if (normalized.includes("quinto")) return "Quinto Año";
  return null;
}

function calcularDistribucionAutomatica(totalSemanas: number, totalSesionesUnidad: number): number[] {
  if (totalSemanas <= 0) return [];
  const base = Math.floor(totalSesionesUnidad / totalSemanas);
  const resto = totalSesionesUnidad % totalSemanas;
  return Array.from({ length: totalSemanas }, (_, idx) =>
    idx < resto ? base + 1 : base,
  );
}

/** Helper: formatear fecha sin problemas de timezone */
function formatFechaLocal(fecha: string): string {
  if (!fecha) return "";
  const dateOnly = fecha.split("T")[0];
  const [year, month, day] = dateOnly.split("-").map(Number);
  if (!year || !month || !day) return fecha;
  return new Date(year, month - 1, day).toLocaleDateString("es-PE");
}

const duracionesUnidad = [
  { semanas: 2, label: "2 semanas", desc: "Unidad corta", gradient: "from-emerald-500 to-teal-500" },
  { semanas: 4, label: "4 semanas", desc: "Unidad estándar", gradient: "from-blue-500 to-cyan-500" },
  { semanas: 5, label: "5 semanas", desc: "Unidad extendida", gradient: "from-purple-500 to-pink-500" },
];

function Step1DatosUnidad({ pagina, setPagina, usuario, tipoUnidad, maxMiembros }: Props) {
  const { unidadId: existingUnidadId, setUnidadId, setDatosBase, secundariaAreaElegida } =
    useUnidadStore();
  const updateAuthUser = useAuthStore((s) => s.updateUser);
  const authUser = useAuthStore((s) => s.user as any);
  const { user: userProfile } = useUserStore();
  const { showLoading, hideLoading } = useGlobalLoading();
  const prevTituloUnidad = userProfile?.tituloUnidadContexto || "";

  // Catálogos
  const [areas, setAreas] = useState<IArea[]>([]);

  // Campos del formulario
  const [titulo, setTitulo] = useState("");
  const [numeroUnidad, setNumeroUnidad] = useState(1);
  const [duracion, setDuracion] = useState(0);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [areasSeleccionadas, setAreasSeleccionadas] = useState<string[]>([]);
  const [gradosPorArea, setGradosPorArea] = useState<Record<string, string[]>>({});
  const [modoDistribucionPorArea, setModoDistribucionPorArea] = useState<Record<string, "automatica" | "manual">>({});
  const [sesionesPorArea, setSesionesPorArea] = useState<Record<string, number>>({});
  const [sesionesSemanalesPorArea, setSesionesSemanalesPorArea] = useState<Record<string, number[]>>({});

  // Problemática (seleccionada desde modal)
  const [problematica, setProblematica] = useState<{ id: number; nombre: string; descripcion: string } | null>(
    usuario.problematica
      ? { id: usuario.problematica.id, nombre: usuario.problematica.nombre, descripcion: usuario.problematica.descripcion }
      : null
  );
  const [showProblematicaModal, setShowProblematicaModal] = useState(false);

  // Unidad activa (error 400)
  const [unidadActiva, setUnidadActiva] = useState<{
    id: string;
    titulo: string;
    fechaFin: string;
    tipo: string;
  } | null>(null);

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
  const isSecundaria = nivel.toLowerCase().includes("secundaria");
  const userSecondaryYear = mapUserGradeToSecondaryYear(grado);
  const profileSecondaryYearsFromUsuario = Array.from(
    new Set(
      (usuario.gradosAreas || [])
        .filter((ga) =>
          normalizeAreaName(ga.grado?.nivel?.nombre || "").includes("secundaria") &&
          !isTutoriaArea(ga.area?.nombre || ""),
        )
        .map((ga) => ga.grado?.nombre || "")
        .filter(Boolean),
    ),
  );
  const profileSecondaryYearsFromAuth = Array.isArray(authUser?.secundariaGradosPerfil)
    ? authUser.secundariaGradosPerfil.filter((g: unknown): g is string => typeof g === "string")
    : [];
  const profileSecondaryYears: string[] =
    profileSecondaryYearsFromUsuario.length > 0
      ? profileSecondaryYearsFromUsuario
      : profileSecondaryYearsFromAuth;
  const profileTutoriaYearFromUsuario =
    (usuario.gradosAreas || []).find((ga) => isTutoriaArea(ga.area?.nombre || ""))?.grado?.nombre || null;
  const profileTutoriaYearFromAuth =
    typeof authUser?.tutoriaGradoPerfil === "string" ? authUser.tutoriaGradoPerfil : null;
  const profileTutoriaYear: string | null = profileTutoriaYearFromUsuario || profileTutoriaYearFromAuth;
  const userGradesByArea = useMemo(
    () =>
      (usuario.gradosAreas || []).reduce<Record<string, string[]>>((acc, item) => {
        const areaNombre = item.area?.nombre || "";
        const gradoNombre = item.grado?.nombre || "";
        if (!areaNombre || !gradoNombre) return acc;
        const current = acc[areaNombre] || [];
        if (!current.includes(gradoNombre)) current.push(gradoNombre);
        acc[areaNombre] = current;
        return acc;
      }, {}),
    [usuario.gradosAreas],
  );
  const allowedSecondaryAreaNames = useMemo(
    () =>
      Array.from(
        new Set(
          (usuario.gradosAreas || [])
            .map((ga) => ga.area?.nombre || "")
            .filter(Boolean),
        ),
      ),
    [usuario.gradosAreas],
  );
  const hasConfiguredSecondaryProfile = isSecundaria && allowedSecondaryAreaNames.length > 0;
  const areasToShow = useMemo(() => {
    if (!isSecundaria || !hasConfiguredSecondaryProfile) return areas;
    return areas.filter((a) => allowedSecondaryAreaNames.includes(a.nombre));
  }, [areas, isSecundaria, hasConfiguredSecondaryProfile, allowedSecondaryAreaNames]);

  // Cargar áreas al montar
  useEffect(() => {
    async function cargar() {
      try {
        const response = await getAllAreas();
        const all = response.data.data || response.data;
        setAreas(
          isSecundaria
            ? all
            : all.filter((a: IArea) => isAreaPrimaria(a.nombre)),
        );
      } catch {
        handleToaster("Error al cargar las áreas", "error");
      }
    }
    cargar();
  }, [isSecundaria]);

  // Calcular fecha fin automáticamente
  const fechaFinCalculada = fechaInicio && duracion > 0
    ? (() => {
        const inicio = new Date(fechaInicio);
        const fin = new Date(inicio);
        fin.setDate(fin.getDate() + duracion * 7);
        return fin.toISOString().split("T")[0];
      })()
    : "";

  // Auto-setear fecha fin cuando cambia inicio o duración
  useEffect(() => {
    if (fechaFinCalculada) {
      setFechaFin(fechaFinCalculada);
    }
  }, [fechaFinCalculada]);

  useEffect(() => {
    if (!isSecundaria || duracion > 0) return;
    setDuracion(DEFAULT_SECONDARY_WEEKS);
  }, [isSecundaria, duracion]);

  const maxAreasSecundaria = secundariaAreaElegida ? 1 : 2;

  function toggleArea(nombre: string) {
    if (secundariaAreaElegida) {
      if (nombre !== secundariaAreaElegida.nombre) {
        handleToaster(
          "Esta unidad corresponde solo al área que elegiste al inicio.",
          "error",
        );
      }
      return;
    }
    if (
      isSecundaria &&
      !areasSeleccionadas.includes(nombre) &&
      areasSeleccionadas.length >= maxAreasSecundaria
    ) {
      handleToaster(
        `En secundaria puedes seleccionar máximo ${maxAreasSecundaria} área(s) por unidad`,
        "error",
      );
      return;
    }
    setAreasSeleccionadas((prev) =>
      prev.includes(nombre) ? prev.filter((a) => a !== nombre) : [...prev, nombre]
    );
  }

  useEffect(() => {
    if (!isSecundaria) return;
    setGradosPorArea((prev) => {
      const next: Record<string, string[]> = {};
      areasSeleccionadas.forEach((area) => {
        next[area] = prev[area] || [];
      });
      return next;
    });
    setModoDistribucionPorArea((prev) => {
      const next: Record<string, "automatica" | "manual"> = {};
      areasSeleccionadas.forEach((area) => {
        next[area] = prev[area] || "automatica";
      });
      return next;
    });
    setSesionesPorArea((prev) => {
      const next: Record<string, number> = {};
      areasSeleccionadas.forEach((area) => {
        next[area] = prev[area] || duracion || 0;
      });
      return next;
    });
  }, [areasSeleccionadas, duracion, isSecundaria]);

  useEffect(() => {
    if (!isSecundaria || duracion <= 0) return;
    setSesionesSemanalesPorArea((prev) => {
      const next: Record<string, number[]> = { ...prev };
      areasSeleccionadas.forEach((area) => {
        const totalSesiones = sesionesPorArea[area] || duracion;
        const modo = modoDistribucionPorArea[area] || "automatica";
        if (modo === "automatica" || !next[area] || next[area].length !== duracion) {
          next[area] = calcularDistribucionAutomatica(duracion, totalSesiones);
        }
      });
      return next;
    });
  }, [areasSeleccionadas, sesionesPorArea, modoDistribucionPorArea, duracion, isSecundaria]);

  useEffect(() => {
    if (!isSecundaria || !userSecondaryYear) return;
    const tutoriaArea = areasSeleccionadas.find(isTutoriaArea);
    if (!tutoriaArea) return;
    setGradosPorArea((prev) => {
      const current = prev[tutoriaArea] || [];
      if (current.length > 0) return prev;
      return { ...prev, [tutoriaArea]: [userSecondaryYear] };
    });
  }, [areasSeleccionadas, isSecundaria, userSecondaryYear]);

  useEffect(() => {
    if (!isSecundaria || areasSeleccionadas.length === 0) return;
    setGradosPorArea((prev) => {
      const next = { ...prev };
      areasSeleccionadas.forEach((area) => {
        if ((next[area] || []).length > 0) return;
        if (isTutoriaArea(area)) {
          next[area] = profileTutoriaYear
            ? [profileTutoriaYear]
            : (userSecondaryYear ? [userSecondaryYear] : []);
          return;
        }
        if ((userGradesByArea[area] || []).length > 0) {
          next[area] = userGradesByArea[area];
          return;
        }
        next[area] = profileSecondaryYears.length > 0
          ? profileSecondaryYears
          : (userSecondaryYear ? [userSecondaryYear] : []);
      });
      return next;
    });
  }, [areasSeleccionadas, isSecundaria, profileSecondaryYears, profileTutoriaYear, userSecondaryYear, userGradesByArea]);

  useEffect(() => {
    if (secundariaAreaElegida && isSecundaria) {
      setAreasSeleccionadas([secundariaAreaElegida.nombre]);
      return;
    }
    if (!isSecundaria || areas.length === 0 || areasSeleccionadas.length > 0) return;
    const fromUsuario = Array.from(
      new Set(
        (usuario.gradosAreas || [])
          .map((ga) => ga.area?.nombre || "")
          .filter(Boolean),
      ),
    );
    if (fromUsuario.length === 0) return;
    setAreasSeleccionadas(fromUsuario.slice(0, 2));
  }, [
    isSecundaria,
    areas,
    areasSeleccionadas.length,
    usuario.gradosAreas,
    secundariaAreaElegida,
  ]);

  function toggleGradoArea(area: string, gradoLabel: string) {
    if (hasConfiguredSecondaryProfile && (userGradesByArea[area] || []).length > 0) return;
    setGradosPorArea((prev) => {
      const prevArea = prev[area] || [];
      const nextArea = prevArea.includes(gradoLabel)
        ? prevArea.filter((g) => g !== gradoLabel)
        : [...prevArea, gradoLabel];
      return { ...prev, [area]: nextArea };
    });
  }

  function getIcon(nombre: string) {
    return getAreaIcon(nombre);
  }

  function getGradient(nombre: string) {
    return getAreaColor(nombre).gradient;
  }

  /* ─── Validar y crear unidad en backend ─── */
  async function handleContinuar() {
    // Validaciones
    if (!titulo.trim()) return handleToaster("Ingresa el título de la unidad", "error");
    if (!isSecundaria && duracion <= 0) return handleToaster("Selecciona la duración", "error");
    if (!fechaInicio) return handleToaster("Selecciona la fecha de inicio", "error");
    if (areasSeleccionadas.length === 0) return handleToaster("Selecciona al menos un área", "error");
    if (!problematica) return handleToaster("Selecciona una problemática", "error");
    if (isSecundaria) {
      for (const area of areasSeleccionadas) {
        const grados = gradosPorArea[area] || [];
        if (grados.length === 0) {
          return handleToaster(`Asigna al menos un grado para ${area}`, "error");
        }
        const total = sesionesPorArea[area] || 0;
        if (total <= 0) {
          return handleToaster(`Define el total de sesiones para ${area}`, "error");
        }
      }
    }

    showLoading(existingUnidadId ? "Actualizando unidad de aprendizaje..." : "Creando unidad de aprendizaje...");

    try {
      if (!usuario.nivelId || (!isSecundaria && !usuario.gradoId)) {
        hideLoading();
        return handleToaster("Completa nivel y grado en tu perfil para continuar", "error");
      }

      const gradosSecundariaIds = isSecundaria
        ? Array.from(
            new Set(
              Object.values(gradosPorArea)
                .flat()
                .map((g) => SECONDARY_GRADE_ID_BY_NAME[g])
                .filter((id): id is number => Number.isFinite(id)),
            ),
          ).sort((a, b) => a - b)
        : [];

      if (isSecundaria && gradosSecundariaIds.length === 0) {
        hideLoading();
        return handleToaster("No se encontraron grados de secundaria válidos", "error");
      }

      const hasOnlyTutoriaSeleccionada =
        isSecundaria &&
        areasSeleccionadas.length === 1 &&
        isTutoriaArea(areasSeleccionadas[0] || "");
      const singleGradeSecundaria = isSecundaria && gradosSecundariaIds.length === 1;
      const modoSecundaria: ModoSecundaria | undefined = hasOnlyTutoriaSeleccionada
        ? "tutoria"
        : singleGradeSecundaria
          ? "mono_grado"
          : undefined;
      const gradoIdSecundaria = modoSecundaria ? gradosSecundariaIds[0] : null;

      const payload = {
        usuarioId: usuario.id,
        titulo,
        tipo: tipoUnidad,
        nivelId: usuario.nivelId,
        gradoId: isSecundaria ? gradoIdSecundaria : (usuario.gradoId ?? null),
        ...(isSecundaria && !modoSecundaria ? { gradosSecundaria: gradosSecundariaIds } : {}),
        ...(isSecundaria && modoSecundaria ? { modoSecundaria } : {}),
        numeroUnidad,
        duracion: isSecundaria ? (duracion || DEFAULT_SECONDARY_WEEKS) : duracion,
        fechaInicio,
        fechaFin,
        problematicaId: problematica.id,
        ...(tipoUnidad === "COMPARTIDA" ? { maxMiembros } : {}),
      };

      const unidadIdToUse = existingUnidadId || unidadActiva?.id || null;
      if (unidadIdToUse && unidadIdToUse !== existingUnidadId) {
        setUnidadId(unidadIdToUse);
      }

      let unidadResultId: string;
      let codigoCompartido: string | undefined;

      if (unidadIdToUse) {
        // Ya existe una unidad (soft reset) → actualizar datos base
        await updateUnidad(unidadIdToUse, payload);
        unidadResultId = unidadIdToUse;
      } else {
        // Nueva unidad → crear
        const response = await createUnidad(payload);
        const unidad = response.data.data ?? response.data;
        unidadResultId = unidad.id;
        codigoCompartido = unidad.codigoCompartido;
      }

      // Asignar/reasignar áreas al miembro
      const areaIds = areas
        .filter((a) => areasSeleccionadas.includes(a.nombre))
        .map((a) => a.id);
      await seleccionarAreas(unidadResultId, { areaIds });

      // Guardar en store
      setUnidadId(unidadResultId);
      setDatosBase({
        nivel,
        grado,
        titulo,
        numeroUnidad,
        duracion: isSecundaria ? (duracion || DEFAULT_SECONDARY_WEEKS) : duracion,
        fechaInicio,
        fechaFin,
        problematicaNombre: problematica.nombre,
        problematicaDescripcion: problematica.descripcion,
        areas: areasSeleccionadas.map((n) => ({ nombre: n })),
        tipo: tipoUnidad,
        ...(isSecundaria
          ? {
              esSecundariaWizard: true,
              modoSecundaria,
              gradesPool: SECONDARY_GRADES,
              gradosPorArea,
              gradosSecundariaIds: modoSecundaria ? [] : gradosSecundariaIds,
              tieneTutoria: areasSeleccionadas.some(isTutoriaArea),
              gradosTutoria: (areasSeleccionadas.find(isTutoriaArea) ? gradosPorArea[areasSeleccionadas.find(isTutoriaArea)!] : []) || [],
              planificacionAreas: areasSeleccionadas.map((area) => ({
                area,
                totalSemanas: duracion,
                totalSesionesUnidad: sesionesPorArea[area] || duracion,
                modoDistribucion: modoDistribucionPorArea[area] || "automatica",
                sesionesPorSemana:
                  sesionesSemanalesPorArea[area] ||
                  calcularDistribucionAutomatica(
                    duracion,
                    sesionesPorArea[area] || duracion,
                  ),
                editable: true,
              })),
            }
          : {}),
        ...(tipoUnidad === "COMPARTIDA"
          ? { maxMiembros, codigoCompartido }
          : {}),
      });

      // Sincronizar problematicaCompleta en auth store (localStorage)
      updateAuthUser({ problematicaCompleta: true });

      // Save title as context for next time (non-blocking)
      if (titulo.trim() && usuario.id) {
        updateUsuario(usuario.id, { tituloUnidadContexto: titulo.trim() }).catch(() => {});
        useUserStore.getState().updateUsuario({ tituloUnidadContexto: titulo.trim() });
      }

      handleToaster(
        existingUnidadId ? "Unidad actualizada exitosamente" : "Unidad creada exitosamente",
        "success"
      );
      setUnidadActiva(null);
      setPagina(pagina + 1);
    } catch (error: any) {
      console.error("Error al crear unidad:", error);

      // HTTP 400 — ya tiene una unidad activa
      const resData = error?.response?.data;
      if (error?.response?.status === 400 && resData?.data?.unidadActiva) {
        setUnidadActiva(resData.data.unidadActiva);
        if (resData.data.unidadActiva?.id) {
          // Permite reusar la unidad activa en el siguiente intento (update en vez de create).
          setUnidadId(resData.data.unidadActiva.id);
          handleToaster("Se usará tu unidad activa para continuar.", "success");
        }
        return; // no toast, se muestra la alerta en la UI
      }

      const msg = resData?.message || "Error al crear la unidad";
      handleToaster(msg, "error");
    } finally {
      hideLoading();
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* ── Header ── */}
        <div className="text-center mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg mb-4 sm:mb-6 shadow-lg">
            <Sparkles className="h-4 w-4" />
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-violet-600 text-xs font-bold">
              1
            </div>
            <span className="text-sm font-semibold tracking-wide">PASO 1 DE 4</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4 tracking-tight">
            Crear Unidad de Aprendizaje
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
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
              {!isSecundaria ? (
                <InfoBadge icon={<BookOpen className="h-4 w-4" />} label="Grado" value={grado || "—"} />
              ) : (
                <>
                  <InfoBadge
                    icon={<BookOpen className="h-4 w-4" />}
                    label="Años (Secundaria)"
                    value={profileSecondaryYears.length > 0 ? profileSecondaryYears.join(", ") : (grado || "—")}
                  />
                  <InfoBadge
                    icon={<BookOpen className="h-4 w-4" />}
                    label="Tutoría"
                    value={profileTutoriaYear || "Sin asignar"}
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Alerta: unidad activa ── */}
        {unidadActiva && (
          <Card className="mb-8 border-2 border-red-300 dark:border-red-800 shadow-xl bg-red-50 dark:bg-red-950/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-2 bg-red-100 dark:bg-red-900/50 rounded-full">
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-1">
                    Ya tienes una unidad activa
                  </h3>
                  <p className="text-sm text-red-600 dark:text-red-300 mb-3">
                    Debes esperar a que finalice tu unidad actual antes de crear una nueva.
                  </p>
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 space-y-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {unidadActiva.titulo}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Tipo: <span className="font-medium">{unidadActiva.tipo}</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Finaliza: <span className="font-medium">{formatFechaLocal(unidadActiva.fechaFin)}</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-4 rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20">
                <div className="flex-shrink-0 mt-1 hidden sm:block">
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
              {isSecundaria
                ? secundariaAreaElegida
                  ? "Área de esta unidad (definida al iniciar el asistente)"
                  : "Selecciona hasta 2 áreas para esta unidad"
                : "Selecciona una o más áreas para integrar en la unidad"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {areasToShow.map((area) => {
                const IconComp = getIcon(area.nombre);
                const gradient = getGradient(area.nombre);
                const isSelected = areasSeleccionadas.includes(area.nombre);

                const lockedSingleArea =
                  Boolean(secundariaAreaElegida) &&
                  area.nombre !== secundariaAreaElegida?.nombre;

                return (
                  <div
                    key={area.id}
                    onClick={() => {
                      if (lockedSingleArea) return;
                      toggleArea(area.nombre);
                    }}
                    className={`
                      group relative overflow-hidden rounded-xl transition-all duration-300
                      ${
                        lockedSingleArea
                          ? "opacity-40 cursor-not-allowed border-2 border-slate-200 dark:border-slate-700"
                          : "cursor-pointer"
                      }
                      ${
                        isSelected
                          ? "ring-4 ring-violet-500 ring-offset-2 dark:ring-offset-slate-900 scale-105 shadow-2xl"
                          : lockedSingleArea
                            ? ""
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
            {isSecundaria && hasConfiguredSecondaryProfile && (
              <p className="mt-3 text-xs text-cyan-700 dark:text-cyan-300">
                Usamos las áreas configuradas en tu perfil docente.
              </p>
            )}
          </CardContent>
        </Card>

        {/* ── Secundaria: grados por área ── */}
        {isSecundaria && areasSeleccionadas.length > 0 && (
          <Card className="mb-8 border-2 border-slate-200 dark:border-slate-700 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <div className="h-10 w-10 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                Perfil Académico por Área
              </CardTitle>
              <CardDescription className="text-base">
                Puedes elegir varios años por área. En Tutoría puedes dejar solo un año si corresponde.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {areasSeleccionadas.map((area) => (
                <div key={`grados-${area}`} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <p className="text-sm font-bold">{area}</p>
                    {isTutoriaArea(area) && (
                      <span className="text-[11px] px-2 py-1 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                        Puede ser 1 año
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                    {SECONDARY_GRADES.map((g) => {
                      const checked = (gradosPorArea[area] || []).includes(g);
                      const locked = hasConfiguredSecondaryProfile && (userGradesByArea[area] || []).length > 0;
                      return (
                        <button
                          type="button"
                          key={`${area}-${g}`}
                          onClick={() => toggleGradoArea(area, g)}
                          disabled={locked}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                            checked
                              ? "bg-cyan-600 border-cyan-600"
                              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                          }`}
                          style={{ color: checked ? "#fff" : undefined }}
                        >
                          {g}
                        </button>
                      );
                    })}
                  </div>
                  {hasConfiguredSecondaryProfile && (userGradesByArea[area] || []).length > 0 && (
                    <p className="mt-2 text-[11px] text-cyan-700 dark:text-cyan-300">
                      Configurado previamente en onboarding.
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* ── Secundaria: planificación de sesiones por área ── */}
        {isSecundaria && areasSeleccionadas.length > 0 && (
          <Card className="mb-8 border-2 border-slate-200 dark:border-slate-700 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <div className="h-10 w-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                Configuración de Carga por Área
              </CardTitle>
              <CardDescription className="text-base">
                Define sesiones por área. Las sesiones del área aplican a todos los años seleccionados para esa área.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {areasSeleccionadas.map((area) => {
                const isTutoria = isTutoriaArea(area);
                const total = sesionesPorArea[area] || duracion;
                const dist = sesionesSemanalesPorArea[area] || calcularDistribucionAutomatica(duracion, total);
                return (
                  <div key={`sesiones-${area}`} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold">{area}</p>
                      {isTutoria && <span className="text-[11px] text-slate-500">Tutoría</span>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs mb-1.5 block">Total sesiones de unidad</Label>
                        <Input
                          type="number"
                          min={1}
                          value={total}
                          onChange={(e) => {
                            const v = Math.max(0, Number(e.target.value) || 0);
                            setSesionesPorArea((prev) => ({ ...prev, [area]: v }));
                          }}
                          className="h-10"
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-1.5 block">Modo distribución</Label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            className="cursor-default"
                          >
                            Automática
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs mb-1.5 block">Sesiones por semana</Label>
                      <div className="flex flex-wrap gap-2">
                        {dist.map((n, i) => (
                          <span
                            key={`${area}-${i}`}
                            className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                          >
                            S{i + 1}: {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

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

            {/* Last used title suggestion */}
            {prevTituloUnidad && !titulo && (
              <button
                type="button"
                onClick={() => {
                  setTitulo(prevTituloUnidad);
                  handleToaster("Título anterior restaurado", "success");
                }}
                className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-700/40 bg-amber-50/80 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors text-left w-fit max-w-full"
              >
                <RotateCcw className="h-3 w-3 text-amber-500 flex-shrink-0" />
                <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 flex-shrink-0">Último usado:</span>
                <span className="text-xs text-slate-700 dark:text-slate-300 truncate">{prevTituloUnidad}</span>
              </button>
            )}

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
        {!isSecundaria && (
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
        )}

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
              {isSecundaria
                ? "Selecciona la duración en semanas y la fecha de inicio"
                : "La fecha de fin se calcula automáticamente según la duración"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSecundaria && (
              <div className="mb-6">
                <Label htmlFor="duracionSecundaria" className="text-sm font-medium mb-1.5 block">
                  Duración (semanas)
                </Label>
                <Input
                  id="duracionSecundaria"
                  type="number"
                  min={1}
                  max={12}
                  value={duracion || ""}
                  onChange={(e) => {
                    const v = Math.max(1, Math.min(12, Number(e.target.value) || 1));
                    setDuracion(v);
                  }}
                  className="h-12 text-base max-w-[200px]"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Las sesiones se distribuirán automáticamente en {duracion || DEFAULT_SECONDARY_WEEKS} semana(s)
                </p>
              </div>
            )}
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
                  Fecha de Fin
                </Label>
                <Input
                  id="fechaFin"
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  disabled={!fechaInicio || duracion <= 0}
                  className="h-12 text-base"
                />
                {fechaFin && fechaFinCalculada && fechaFin > fechaFinCalculada && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    +{Math.round((new Date(fechaFin).getTime() - new Date(fechaFinCalculada).getTime()) / 86400000)} día(s) adicionales
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Botón continuar ── */}
        <div className="flex justify-center sm:justify-end pb-10">
          <Button
            onClick={handleContinuar}
            disabled={!titulo || (!isSecundaria && duracion <= 0) || !fechaInicio || areasSeleccionadas.length === 0 || !problematica}
            className="w-full sm:w-auto h-14 px-10 text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
