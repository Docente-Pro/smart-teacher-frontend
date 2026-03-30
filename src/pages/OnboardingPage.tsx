import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { Building2, GraduationCap, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INivel } from "@/interfaces/INivel";
import { IGrado } from "@/interfaces/IGrado";
import { getNiveles } from "@/features/initialForm/services/niveles.service";
import { getAllGrados } from "@/services/grado.service";
import { getAllAreas } from "@/services/areas.service";
import { guardarUsuarioGradosAreas, getUsuarioById, updateUsuario } from "@/services/usuarios.service";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import { GlobalLoading } from "@/components/GlobalLoading";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";

// ── Ubigeo data ──
import departamentosData from "@/utils/peru_ubigeo/1_ubigeo_departamentos.json";
import provinciasData from "@/utils/peru_ubigeo/2_ubigeo_provincias.json";
import distritosData from "@/utils/peru_ubigeo/3_ubigeo_distritos.json";

interface UbigeoDepartamento {
  id: number;
  departamento: string;
  ubigeo: string;
}
interface UbigeoProvincia {
  id: number;
  provincia: string;
  ubigeo: string;
  departamento_id: number;
}
interface UbigeoDistrito {
  id: number;
  distrito: string;
  ubigeo: string;
  provincia_id: number;
  departamento_id: number;
}

const departamentos: UbigeoDepartamento[] = departamentosData.ubigeo_departamentos;
const provincias: UbigeoProvincia[] = provinciasData.ubigeo_provincias;
const distritos: UbigeoDistrito[] = distritosData.ubigeo_distritos;

interface OnboardingData {
  nombre: string;
  nombreInstitucion: string;
  nombreDirectivo: string;
  nombreSubdirectora: string;
  genero: string;
  nivelId: number;
  gradoId: number;
  departamento: string;
  provincia: string;
  distrito: string;
}

interface AreaItem {
  id: number;
  nombre: string;
}

const MAX_AREAS_SECUNDARIA = 2;

function isNivelSoportado(nombre?: string): boolean {
  const normalized = (nombre || "").toLowerCase();
  return normalized.includes("primaria") || normalized.includes("secundaria");
}

function isSecondaryNivel(nombre?: string): boolean {
  return (nombre || "").toLowerCase().includes("secundaria");
}

function normalizeText(value?: string): string {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function isTutoriaAreaName(nombre?: string): boolean {
  return normalizeText(nombre).includes("tutoria");
}

function isPlanLectorAreaName(nombre?: string): boolean {
  return normalizeText(nombre).includes("plan lector");
}

function OnboardingPage() {
  const { user: auth0User, isLoading: authLoading } = useAuth0();
  const { user: backendUser, updateUser } = useAuthStore(); // Usar usuario del backend
  const { setUsuario } = useUserStore();
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useGlobalLoading();

  const [formData, setFormData] = useState<OnboardingData>({
    nombre: "",
    nombreInstitucion: "",
    nombreDirectivo: "",
    nombreSubdirectora: "",
    genero: "",
    nivelId: 0,
    gradoId: 0,
    departamento: "",
    provincia: "",
    distrito: "",
  });
  const [niveles, setNiveles] = useState<INivel[]>([]);
  const [todosLosGrados, setTodosLosGrados] = useState<IGrado[]>([]);
  const [gradosFiltrados, setGradosFiltrados] = useState<IGrado[]>([]);
  const [areas, setAreas] = useState<AreaItem[]>([]);
  const [areasSeleccionadasIds, setAreasSeleccionadasIds] = useState<number[]>([]);
  const [secundariaGradosIds, setSecundariaGradosIds] = useState<number[]>([]);
  const [tutoriaGradoId, setTutoriaGradoId] = useState<number>(0);
  const [planLectorGradoId, setPlanLectorGradoId] = useState<number>(0);

  const nivelSeleccionado = useMemo(
    () => niveles.find((n) => n.id === formData.nivelId),
    [niveles, formData.nivelId],
  );
  const isSecundariaSeleccionada = isSecondaryNivel(nivelSeleccionado?.nombre);
  const tutoriaAreaId = useMemo(
    () => areas.find((a) => isTutoriaAreaName(a.nombre))?.id,
    [areas],
  );
  const planLectorAreaId = useMemo(
    () => areas.find((a) => isPlanLectorAreaName(a.nombre))?.id,
    [areas],
  );
  const secundariaAniosSeleccionados = useMemo(
    () => gradosFiltrados.filter((g) => secundariaGradosIds.includes(g.id)).map((g) => g.nombre),
    [gradosFiltrados, secundariaGradosIds],
  );
  const areasSeleccionadasNombres = useMemo(
    () => areas.filter((a) => areasSeleccionadasIds.includes(a.id)).map((a) => a.nombre),
    [areas, areasSeleccionadasIds],
  );
  const areasCurriculares = useMemo(
    () =>
      areas.filter(
        (a) =>
          a.id !== tutoriaAreaId &&
          a.id !== planLectorAreaId,
      ),
    [areas, tutoriaAreaId, planLectorAreaId],
  );

  // ── Filtrar provincias y distritos en cascada ──
  const provinciasFiltradas = useMemo(() => {
    if (!formData.departamento) return [];
    const dep = departamentos.find((d) => d.departamento === formData.departamento);
    if (!dep) return [];
    return provincias.filter((p) => p.departamento_id === dep.id);
  }, [formData.departamento]);

  const distritosFiltrados = useMemo(() => {
    if (!formData.provincia) return [];
    const prov = provincias.find(
      (p) => p.provincia === formData.provincia && provinciasFiltradas.includes(p)
    );
    if (!prov) return [];
    return distritos.filter((d) => d.provincia_id === prov.id);
  }, [formData.provincia, provinciasFiltradas]);

  // Verificar si ya completó el onboarding
  useEffect(() => {
    if (backendUser?.perfilCompleto) {
      navigate("/dashboard");
    }
  }, [backendUser, navigate]);

  // Debug solo en desarrollo, dentro de useEffect para no loguear en cada render
  useEffect(() => {
    if (import.meta.env.DEV) {
    }
  }, [auth0User?.sub, backendUser?.id]);

  // Cargar niveles y grados
  useEffect(() => {
    async function loadData() {
      try {
        const [nivelesResponse, gradosResponse, areasResponse] = await Promise.all([
          getNiveles(),
          getAllGrados(),
          getAllAreas(),
        ]);

        setNiveles(
          nivelesResponse.data.data.filter(
            (nivel: INivel) => isNivelSoportado(nivel.nombre)
          )
        );
        setTodosLosGrados(gradosResponse.data.data);
        setAreas((areasResponse.data.data || areasResponse.data) as AreaItem[]);
      } catch (error) {
        handleToaster("Error al cargar datos", "error");
      }
    }

    loadData();
  }, []);

  // Filtrar grados cuando cambia el nivel
  useEffect(() => {
    if (formData.nivelId && todosLosGrados.length > 0) {
      const gradosDelNivel = todosLosGrados.filter((grado) => grado.nivelId === formData.nivelId).sort((a, b) => a.id - b.id); // Ordenar por ID ascendente

      setGradosFiltrados(gradosDelNivel);

      // Limpiar grado si no pertenece al nivel seleccionado
      if (formData.gradoId) {
        const gradoValido = gradosDelNivel.find((g) => g.id === formData.gradoId);
        if (!gradoValido) {
          setFormData((prev) => ({ ...prev, gradoId: 0 }));
        }
      }
    } else {
      setGradosFiltrados([]);
    }
  }, [formData.nivelId, formData.gradoId, todosLosGrados]);

  useEffect(() => {
    if (!isSecundariaSeleccionada) {
      setSecundariaGradosIds([]);
      setTutoriaGradoId(0);
      setPlanLectorGradoId(0);
      setAreasSeleccionadasIds([]);
    }
  }, [isSecundariaSeleccionada]);

  useEffect(() => {
    if (!isSecundariaSeleccionada) return;
    const validIds = new Set(gradosFiltrados.map((g) => g.id));
    setSecundariaGradosIds((prev) => prev.filter((id) => validIds.has(id)));
    setTutoriaGradoId((prev) => (prev && validIds.has(prev) ? prev : 0));
    setPlanLectorGradoId((prev) => (prev && validIds.has(prev) ? prev : 0));
  }, [gradosFiltrados, isSecundariaSeleccionada]);

  // Evitar duplicidad visual: Tutoría/Plan Lector se controlan por su selector de grado, no por la grilla de áreas.
  useEffect(() => {
    if (!isSecundariaSeleccionada) return;
    setAreasSeleccionadasIds((prev) =>
      prev.filter((id) => id !== tutoriaAreaId && id !== planLectorAreaId),
    );
  }, [isSecundariaSeleccionada, tutoriaAreaId, planLectorAreaId]);

  function toggleAreaSecundaria(areaId: number) {
    setAreasSeleccionadasIds((prev) => {
      if (prev.includes(areaId)) {
        return prev.filter((id) => id !== areaId);
      }
      if (prev.length >= MAX_AREAS_SECUNDARIA) {
        handleToaster(`Puedes seleccionar máximo ${MAX_AREAS_SECUNDARIA} áreas`, "error");
        return prev;
      }
      return [...prev, areaId];
    });
  }

  function toggleSecondaryGrade(gradoId: number) {
    setSecundariaGradosIds((prev) => {
      const exists = prev.includes(gradoId);
      const next = exists ? prev.filter((id) => id !== gradoId) : [...prev, gradoId];
      const sorted = next.sort((a, b) => a - b);
      setFormData((current) => ({
        ...current,
        // Conservamos un grado base por compatibilidad backend
        gradoId: sorted[0] || 0,
      }));
      if (tutoriaGradoId && !sorted.includes(tutoriaGradoId)) {
        setTutoriaGradoId(0);
      }
      if (planLectorGradoId && !sorted.includes(planLectorGradoId)) {
        setPlanLectorGradoId(0);
      }
      return sorted;
    });
  }

  function validateForm(): boolean {
    const hasAreasFromChecks =
      areasSeleccionadasIds.length > 0 ||
      Boolean(tutoriaGradoId && tutoriaAreaId) ||
      Boolean(planLectorGradoId && planLectorAreaId);
    if (!formData.nombre || formData.nombre.trim().length < 2) {
      return false;
    }

    if (!formData.nombreInstitucion || formData.nombreInstitucion.trim().length < 3) {
      return false;
    }

    if (!formData.genero) {
      return false;
    }

    if (!formData.nivelId || formData.nivelId === 0) {
      return false;
    }

    if (!formData.gradoId || formData.gradoId === 0) {
      return false;
    }

    if (isSecundariaSeleccionada && secundariaGradosIds.length === 0) {
      return false;
    }

    if (isSecundariaSeleccionada && !hasAreasFromChecks) {
      return false;
    }
    if (isSecundariaSeleccionada && areasSeleccionadasIds.length > MAX_AREAS_SECUNDARIA) {
      return false;
    }

    if (
      isSecundariaSeleccionada &&
      tutoriaAreaId &&
      areasSeleccionadasIds.includes(tutoriaAreaId) &&
      !tutoriaGradoId
    ) {
      return false;
    }

    if (isSecundariaSeleccionada && tutoriaGradoId && !tutoriaAreaId) {
      return false;
    }

    if (
      isSecundariaSeleccionada &&
      planLectorAreaId &&
      areasSeleccionadasIds.includes(planLectorAreaId) &&
      !planLectorGradoId
    ) {
      return false;
    }

    if (isSecundariaSeleccionada && planLectorGradoId && !planLectorAreaId) {
      return false;
    }

    if (!formData.departamento) {
      return false;
    }

    if (!formData.provincia) {
      return false;
    }

    if (!formData.distrito) {
      return false;
    }

    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      if (isSecundariaSeleccionada && tutoriaGradoId && !tutoriaAreaId) {
        handleToaster("No se encontró el área Tutoría en el catálogo. Revisa /api/area.", "error");
      } else if (isSecundariaSeleccionada && planLectorGradoId && !planLectorAreaId) {
        handleToaster("No se encontró el área Plan Lector en el catálogo. Revisa /api/area.", "error");
      } else {
        handleToaster("Por favor, completa todos los campos", "error");
      }
      return;
    }

    if (!backendUser?.id) {
      handleToaster("Error: No se encontró el ID del usuario", "error");
      console.error('No hay usuario en el store:', backendUser);
      return;
    }

    showLoading("Guardando tu perfil...");

    try {
      // Paso 1 del contrato: PATCH perfil base
      await updateUsuario(backendUser.id, {
        nombre: formData.nombre,
        nombreInstitucion: formData.nombreInstitucion,
        nombreDirectivo: formData.nombreDirectivo.trim() || undefined,
        nombreSubdirectora: formData.nombreSubdirectora.trim() || undefined,
        genero: formData.genero,
        nivelId: formData.nivelId,
        gradoId: formData.gradoId,
        departamento: formData.departamento,
        provincia: formData.provincia,
        distrito: formData.distrito,
      });

      // Paso 2 del contrato: POST asignaciones grado+area (Secundaria)
      const hasAreasFromChecks =
        areasSeleccionadasIds.length > 0 ||
        Boolean(tutoriaGradoId && tutoriaAreaId) ||
        Boolean(planLectorGradoId && planLectorAreaId);
      if (isSecundariaSeleccionada && hasAreasFromChecks) {
        const areaIdsParaAsignar = new Set<number>(areasSeleccionadasIds);
        // Si el docente eligió año de Tutoría/Plan Lector, asegurar que su areaId también se envíe.
        if (tutoriaGradoId && tutoriaAreaId) areaIdsParaAsignar.add(tutoriaAreaId);
        if (planLectorGradoId && planLectorAreaId) areaIdsParaAsignar.add(planLectorAreaId);

        const asignaciones = Array.from(areaIdsParaAsignar).flatMap((areaId) => {
          const isTutoria = tutoriaAreaId ? areaId === tutoriaAreaId : false;
          const isPlanLector = planLectorAreaId ? areaId === planLectorAreaId : false;
          if (isTutoria) {
            return tutoriaGradoId ? [{ gradoId: tutoriaGradoId, areaId }] : [];
          }
          if (isPlanLector) {
            return planLectorGradoId ? [{ gradoId: planLectorGradoId, areaId }] : [];
          }
          return secundariaGradosIds.map((gradoId) => ({ gradoId, areaId }));
        });

        const dedupMap = new Map<string, { gradoId: number; areaId: number }>();
        asignaciones.forEach((a) => dedupMap.set(`${a.gradoId}-${a.areaId}`, a));
        const dedupAsignaciones = Array.from(dedupMap.values());

        if (import.meta.env.DEV) {
          console.log("[Onboarding] asignaciones secundaria:", dedupAsignaciones);
        }

        if (dedupAsignaciones.length > 0) {
          await guardarUsuarioGradosAreas(backendUser.id, { asignaciones: dedupAsignaciones });
        }
      }

      // Refrescar usuario completo desde backend (con gradosAreas, primariaAreaIds, etc.)
      const refreshed = await getUsuarioById(backendUser.id);
      const usuarioActualizado = refreshed.data.data || refreshed.data;
      setUsuario(usuarioActualizado);

      const secundariaGradosNombres = gradosFiltrados
        .filter((g) => secundariaGradosIds.includes(g.id))
        .map((g) => g.nombre);
      const tutoriaGradoNombre = gradosFiltrados.find((g) => g.id === tutoriaGradoId)?.nombre || null;
      updateUser({
        perfilCompleto: true,
        genero: formData.genero,
        nombreInstitucion: formData.nombreInstitucion,
        nivelId: formData.nivelId,
        gradoId: formData.gradoId,
        ...(isSecundariaSeleccionada
          ? {
              secundariaGradosPerfil: secundariaGradosNombres,
              tutoriaGradoPerfil: tutoriaGradoNombre,
            }
          : {}),
        // Actualizar otros campos si el backend los devuelve
        ...(usuarioActualizado.nombreInstitucion && { name: usuarioActualizado.nombre }),
      });

      handleToaster("¡Perfil completado exitosamente!", "success");

      // Mantener loading mientras redirige
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error: any) {
      hideLoading();
      handleToaster("Error al actualizar perfil. Intenta nuevamente.", "error");
    }
  }

  if (authLoading) {
    return <GlobalLoading message="Cargando perfil..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-25">
        <div className="absolute top-10 -left-20 w-96 h-96 bg-cyan-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 -right-20 w-[500px] h-[500px] bg-sky-400 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-3xl bg-white dark:bg-gray-950 rounded-2xl shadow-2xl p-5 sm:p-8 md:p-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">¡Bienvenido, {auth0User?.name}! 🎉</h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Completa tu perfil para personalizar tu experiencia en DocentePro</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">

          {/* ── Sección: Datos personales ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Datos personales</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="nombre" className="text-gray-700 dark:text-gray-300 text-sm">
                  Nombre completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="nombre"
                    type="text"
                    placeholder="Juan Pérez"
                    className="pl-10 py-5 text-sm"
                    value={formData.nombre}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="institucion" className="text-gray-700 dark:text-gray-300 text-sm">
                  Institución Educativa
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="institucion"
                    type="text"
                    placeholder="I.E. María Parado de Bellido"
                    className="pl-10 py-5 text-sm"
                    value={formData.nombreInstitucion}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nombreInstitucion: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">El nombre de la institución aparecerá en tus documentos generados.</p>

            {/* Directivo(a) */}
            <div className="space-y-1.5">
              <Label htmlFor="directivo" className="text-gray-700 dark:text-gray-300 text-sm">
                Directivo(a) de la I.E.
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="directivo"
                  type="text"
                  placeholder="Ej: Carmen López Torres"
                  className="pl-10 py-5 text-sm"
                  value={formData.nombreDirectivo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nombreDirectivo: e.target.value }))}
                />
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">Nombre del director(a) de tu institución. Aparecerá en los documentos.</p>
            </div>

            {/* Subdirectora */}
            <div className="space-y-1.5">
              <Label htmlFor="subdirectora" className="text-gray-700 dark:text-gray-300 text-sm">
                Subdirector(a) de la I.E.
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="subdirectora"
                  type="text"
                  placeholder="Ej: María García"
                  className="pl-10 py-5 text-sm"
                  value={formData.nombreSubdirectora}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nombreSubdirectora: e.target.value }))}
                />
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">Nombre del subdirector(a). Aparecerá en los documentos.</p>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800" />

          {/* ── Sección: Información académica ── */}
          <div className="space-y-5 rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/10 p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Información académica</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Género */}
              <div className="space-y-1.5">
                <Label htmlFor="genero" className="text-gray-700 dark:text-gray-300 text-base font-medium">
                  Género
                </Label>
                <Select
                  value={formData.genero}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, genero: value }))}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Femenino">Femenino</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400 dark:text-gray-500">Para personalizar: "el/la docente"</p>
              </div>

              {/* Nivel Educativo */}
              <div className="space-y-1.5">
                <Label htmlFor="nivel" className="text-gray-700 dark:text-gray-300 text-base font-medium">
                  Nivel Educativo
                </Label>
                <Select
                  value={formData.nivelId ? formData.nivelId.toString() : ""}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, nivelId: parseInt(value) }))}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {niveles.map((nivel) => (
                      <SelectItem key={nivel.id} value={nivel.id.toString()}>
                        {nivel.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </div>

            {/* Primaria: grado único */}
            {!isSecundariaSeleccionada && (
              <div className="space-y-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/40 p-4">
                <Label htmlFor="grado" className="text-gray-700 dark:text-gray-300 text-base font-medium">
                  Grado
                </Label>
                <Select
                  value={formData.gradoId ? formData.gradoId.toString() : ""}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, gradoId: parseInt(value) }))}
                  disabled={!formData.nivelId}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder={formData.nivelId ? "Selecciona un grado" : "Primero elige nivel"} />
                  </SelectTrigger>
                  <SelectContent>
                    {gradosFiltrados.map((grado) => (
                      <SelectItem key={grado.id} value={grado.id.toString()}>
                        {grado.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Secundaria: años + tutoría + áreas */}
            {isSecundariaSeleccionada && (
              <div className="space-y-4">
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/40 p-4">
                  <p className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3">
                    1) Selecciona los años que enseñas
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {gradosFiltrados.map((grado) => {
                      const selected = secundariaGradosIds.includes(grado.id);
                      return (
                        <button
                          type="button"
                          key={grado.id}
                          onClick={() => toggleSecondaryGrade(grado.id)}
                          className={`min-h-[52px] px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                            selected
                              ? "bg-blue-600 text-white shadow-md"
                              : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 hover:border-blue-400"
                          }`}
                        >
                          {grado.nombre}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {secundariaAniosSeleccionados.map((anio) => (
                      <span
                        key={`anio-selected-${anio}`}
                        className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200"
                      >
                        {anio}
                      </span>
                    ))}
                    {secundariaAniosSeleccionados.length === 0 && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Aún no seleccionaste años.
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/40 p-4">
                  <p className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-2">
                    2) Año de Tutoría (opcional)
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Si no llevas Tutoría, deja “Sin tutoría”.
                  </p>
                  <Select
                    value={tutoriaGradoId ? tutoriaGradoId.toString() : "none"}
                    onValueChange={(value) => setTutoriaGradoId(value === "none" ? 0 : parseInt(value))}
                    disabled={secundariaGradosIds.length === 0}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Selecciona año de tutoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin tutoría</SelectItem>
                      {gradosFiltrados
                        .filter((g) => secundariaGradosIds.includes(g.id))
                        .map((grado) => (
                          <SelectItem key={`tutoria-${grado.id}`} value={grado.id.toString()}>
                            {grado.nombre}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/40 p-4">
                  <p className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-2">
                    2b) Año de Plan Lector (opcional)
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Si no llevas Plan Lector, deja “Sin Plan Lector”.
                  </p>
                  <Select
                    value={planLectorGradoId ? planLectorGradoId.toString() : "none"}
                    onValueChange={(value) => setPlanLectorGradoId(value === "none" ? 0 : parseInt(value))}
                    disabled={secundariaGradosIds.length === 0}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Selecciona año de Plan Lector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin Plan Lector</SelectItem>
                      {gradosFiltrados
                        .filter((g) => secundariaGradosIds.includes(g.id))
                        .map((grado) => (
                          <SelectItem key={`plan-lector-${grado.id}`} value={grado.id.toString()}>
                            {grado.nombre}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/40 p-4">
                  <p className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3">
                    3) Selecciona las áreas curriculares que enseñas
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Puedes elegir hasta {MAX_AREAS_SECUNDARIA} áreas curriculares.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {areasCurriculares.map((area) => {
                      const selected = areasSeleccionadasIds.includes(area.id);
                      const reachedMax = areasSeleccionadasIds.length >= MAX_AREAS_SECUNDARIA;
                      const disabled = !selected && reachedMax;
                      let areaButtonClass =
                        "min-h-[52px] px-4 py-2 rounded-xl text-sm font-semibold border text-center transition-all";
                      if (selected) {
                        areaButtonClass += " bg-blue-600 text-white border-blue-600 shadow-md";
                      } else if (disabled) {
                        areaButtonClass +=
                          " bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700";
                      } else {
                        areaButtonClass +=
                          " bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 hover:border-blue-400";
                      }
                      return (
                        <button
                          type="button"
                          key={`area-sec-${area.id}`}
                          onClick={() => toggleAreaSecundaria(area.id)}
                          disabled={disabled}
                          className={areaButtonClass}
                        >
                          {area.nombre}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {areasSeleccionadasNombres.map((nombre) => (
                      <span
                        key={`area-selected-${nombre}`}
                        className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
                      >
                        {nombre}
                      </span>
                    ))}
                    {areasSeleccionadasNombres.length === 0 && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Aún no seleccionaste áreas.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800" />

          {/* ── Sección: Ubicación ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Ubicación geográfica</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="departamento" className="text-gray-700 dark:text-gray-300 text-sm">
                  Departamento
                </Label>
                <Select
                  value={formData.departamento}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, departamento: value, provincia: "", distrito: "" }))
                  }
                >
                  <SelectTrigger className="py-5">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {departamentos.map((dep) => (
                      <SelectItem key={dep.id} value={dep.departamento}>
                        {dep.departamento}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="provincia" className="text-gray-700 dark:text-gray-300 text-sm">
                  Provincia
                </Label>
                <Select
                  value={formData.provincia}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, provincia: value, distrito: "" }))
                  }
                  disabled={!formData.departamento}
                >
                  <SelectTrigger className="py-5">
                    <SelectValue placeholder={formData.departamento ? "Selecciona" : "Elige depto."} />
                  </SelectTrigger>
                  <SelectContent>
                    {provinciasFiltradas.map((prov) => (
                      <SelectItem key={prov.id} value={prov.provincia}>
                        {prov.provincia}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="distrito" className="text-gray-700 dark:text-gray-300 text-sm">
                  Distrito
                </Label>
                <Select
                  value={formData.distrito}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, distrito: value }))
                  }
                  disabled={!formData.provincia}
                >
                  <SelectTrigger className="py-5">
                    <SelectValue placeholder={formData.provincia ? "Selecciona" : "Elige prov."} />
                  </SelectTrigger>
                  <SelectContent>
                    {distritosFiltrados.map((dist) => (
                      <SelectItem key={dist.id} value={dist.distrito}>
                        {dist.distrito}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 text-base font-semibold mt-4 rounded-xl transition-all duration-200 hover:shadow-lg"
          >
            Completar Perfil
          </Button>
        </form>
      </div>
    </div>
  );
}

export default OnboardingPage;
