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
import { configurarUsuarioGrados, getUsuarioById, updateUsuario } from "@/services/usuarios.service";
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

const MAX_GRADOS_TUTORIA = 2;
const MAX_GRADOS_PLAN_LECTOR = 3;
const SECCIONES_DISPONIBLES = ["A", "B", "C", "D", "E", "F"];

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
  const [tutoriaGradoIds, setTutoriaGradoIds] = useState<number[]>([]);
  const [planLectorGradoIds, setPlanLectorGradoIds] = useState<number[]>([]);
  const [seccionesPorAreaGrado, setSeccionesPorAreaGrado] = useState<Record<string, string[]>>({});

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
      setTutoriaGradoIds([]);
      setPlanLectorGradoIds([]);
      setAreasSeleccionadasIds([]);
      setSeccionesPorAreaGrado({});
    }
  }, [isSecundariaSeleccionada]);

  useEffect(() => {
    if (!isSecundariaSeleccionada) return;
    const validIds = new Set(gradosFiltrados.map((g) => g.id));
    setSecundariaGradosIds((prev) => prev.filter((id) => validIds.has(id)));
    setTutoriaGradoIds((prev) => prev.filter((id) => validIds.has(id)));
    setPlanLectorGradoIds((prev) => prev.filter((id) => validIds.has(id)));
  }, [gradosFiltrados, isSecundariaSeleccionada]);

  // Evitar duplicidad visual: Tutoría/Plan Lector se controlan por su selector de grado, no por la grilla de áreas.
  useEffect(() => {
    if (!isSecundariaSeleccionada) return;
    setAreasSeleccionadasIds((prev) =>
      prev.filter((id) => id !== tutoriaAreaId && id !== planLectorAreaId),
    );
  }, [isSecundariaSeleccionada, tutoriaAreaId, planLectorAreaId]);

  function toggleSeccion(areaId: number, gradoId: number, seccion: string) {
    const key = `${areaId}-${gradoId}`;
    setSeccionesPorAreaGrado((prev) => {
      const current = prev[key] || [];
      const next = current.includes(seccion)
        ? current.filter((s) => s !== seccion)
        : [...current, seccion].sort();
      return { ...prev, [key]: next };
    });
  }

  function toggleTutoriaGrado(gradoId: number) {
    setTutoriaGradoIds((prev) => {
      if (prev.includes(gradoId)) {
        if (tutoriaAreaId) {
          const key = `${tutoriaAreaId}-${gradoId}`;
          setSeccionesPorAreaGrado((s) => { const c = { ...s }; delete c[key]; return c; });
        }
        return prev.filter((id) => id !== gradoId);
      }
      if (prev.length >= MAX_GRADOS_TUTORIA) {
        handleToaster(`Tutoría: máximo ${MAX_GRADOS_TUTORIA} grados`, "error");
        return prev;
      }
      return [...prev, gradoId].sort((a, b) => a - b);
    });
  }

  function togglePlanLectorGrado(gradoId: number) {
    setPlanLectorGradoIds((prev) => {
      if (prev.includes(gradoId)) {
        if (planLectorAreaId) {
          const key = `${planLectorAreaId}-${gradoId}`;
          setSeccionesPorAreaGrado((s) => { const c = { ...s }; delete c[key]; return c; });
        }
        return prev.filter((id) => id !== gradoId);
      }
      if (prev.length >= MAX_GRADOS_PLAN_LECTOR) {
        handleToaster(`Plan Lector: máximo ${MAX_GRADOS_PLAN_LECTOR} grados`, "error");
        return prev;
      }
      return [...prev, gradoId].sort((a, b) => a - b);
    });
  }

  function toggleAreaSecundaria(areaId: number) {
    setAreasSeleccionadasIds((prev) => {
      if (prev.includes(areaId)) {
        setSeccionesPorAreaGrado((s) => {
          const copy = { ...s };
          for (const k of Object.keys(copy)) {
            if (k.startsWith(`${areaId}-`)) delete copy[k];
          }
          return copy;
        });
        return prev.filter((id) => id !== areaId);
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
      setTutoriaGradoIds((prev) => prev.filter((id) => sorted.includes(id)));
      setPlanLectorGradoIds((prev) => prev.filter((id) => sorted.includes(id)));
      if (exists) {
        setSeccionesPorAreaGrado((prev) => {
          const copy = { ...prev };
          for (const k of Object.keys(copy)) {
            if (k.endsWith(`-${gradoId}`)) delete copy[k];
          }
          return copy;
        });
      }
      return sorted;
    });
  }

  function validateForm(): boolean {
    const hasAreasFromChecks =
      areasSeleccionadasIds.length > 0 ||
      Boolean(tutoriaGradoIds.length > 0 && tutoriaAreaId) ||
      Boolean(planLectorGradoIds.length > 0 && planLectorAreaId);
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
    if (isSecundariaSeleccionada && tutoriaGradoIds.length > 0 && !tutoriaAreaId) {
      return false;
    }

    if (isSecundariaSeleccionada && planLectorGradoIds.length > 0 && !planLectorAreaId) {
      return false;
    }

    if (isSecundariaSeleccionada) {
      const pairs: { areaId: number; gradoId: number }[] = [];
      for (const aId of areasSeleccionadasIds) {
        for (const gId of secundariaGradosIds) pairs.push({ areaId: aId, gradoId: gId });
      }
      if (tutoriaAreaId && tutoriaGradoIds.length > 0) {
        for (const gId of tutoriaGradoIds) pairs.push({ areaId: tutoriaAreaId, gradoId: gId });
      }
      if (planLectorAreaId && planLectorGradoIds.length > 0) {
        for (const gId of planLectorGradoIds) pairs.push({ areaId: planLectorAreaId, gradoId: gId });
      }
      const sinSeccion = pairs.some((p) => !(seccionesPorAreaGrado[`${p.areaId}-${p.gradoId}`]?.length > 0));
      if (sinSeccion) return false;
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
      if (isSecundariaSeleccionada && tutoriaGradoIds.length > 0 && !tutoriaAreaId) {
        handleToaster("No se encontró el área Tutoría en el catálogo. Revisa /api/area.", "error");
      } else if (isSecundariaSeleccionada && planLectorGradoIds.length > 0 && !planLectorAreaId) {
        handleToaster("No se encontró el área Plan Lector en el catálogo. Revisa /api/area.", "error");
      } else if (isSecundariaSeleccionada) {
        const missing: string[] = [];
        const checkPairs = (areaId: number, areaNombre: string, gIds: number[]) => {
          for (const gId of gIds) {
            if (!(seccionesPorAreaGrado[`${areaId}-${gId}`]?.length > 0)) {
              const gNombre = gradosFiltrados.find((g) => g.id === gId)?.nombre || `Grado ${gId}`;
              missing.push(`${areaNombre} - ${gNombre}`);
            }
          }
        };
        for (const aId of areasSeleccionadasIds) {
          const a = areas.find((x) => x.id === aId);
          if (a) checkPairs(a.id, a.nombre, secundariaGradosIds);
        }
        if (tutoriaAreaId && tutoriaGradoIds.length > 0) {
          const a = areas.find((x) => x.id === tutoriaAreaId);
          if (a) checkPairs(a.id, a.nombre, tutoriaGradoIds);
        }
        if (planLectorAreaId && planLectorGradoIds.length > 0) {
          const a = areas.find((x) => x.id === planLectorAreaId);
          if (a) checkPairs(a.id, a.nombre, planLectorGradoIds);
        }
        if (missing.length > 0) {
          handleToaster(`Selecciona secciones para: ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? "..." : ""}`, "error");
        }
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
        Boolean(tutoriaGradoIds.length > 0 && tutoriaAreaId) ||
        Boolean(planLectorGradoIds.length > 0 && planLectorAreaId);
      if (isSecundariaSeleccionada && hasAreasFromChecks) {
        const areaIdsParaAsignar = new Set<number>(areasSeleccionadasIds);
        if (tutoriaGradoIds.length > 0 && tutoriaAreaId) areaIdsParaAsignar.add(tutoriaAreaId);
        if (planLectorGradoIds.length > 0 && planLectorAreaId) areaIdsParaAsignar.add(planLectorAreaId);

        const asignaciones = Array.from(areaIdsParaAsignar).flatMap((areaId) => {
          const isTutoria = tutoriaAreaId ? areaId === tutoriaAreaId : false;
          const isPlanLector = planLectorAreaId ? areaId === planLectorAreaId : false;
          const gradoIds = isTutoria
            ? tutoriaGradoIds
            : isPlanLector
              ? planLectorGradoIds
              : secundariaGradosIds;
          return gradoIds.map((gradoId) => ({
            gradoId,
            areaId,
            secciones: seccionesPorAreaGrado[`${areaId}-${gradoId}`] || [],
          }));
        });

        const dedupMap = new Map<string, { gradoId: number; areaId: number; secciones?: string[] }>();
        asignaciones.forEach((a) => dedupMap.set(`${a.gradoId}-${a.areaId}`, a));
        const dedupAsignaciones = Array.from(dedupMap.values());

        const allGradoIds = new Set([
          ...secundariaGradosIds,
          ...tutoriaGradoIds,
          ...planLectorGradoIds,
        ]);
        const seccionesPayload = Array.from(allGradoIds).map((gId) => ({
          gradoId: gId,
          nivelId: formData.nivelId,
          secciones: [...new Set(
            Object.entries(seccionesPorAreaGrado)
              .filter(([key]) => key.endsWith(`-${gId}`))
              .flatMap(([, secs]) => secs)
          )].sort(),
        })).filter((s) => s.secciones.length > 0);

        if (import.meta.env.DEV) {
          console.log("[Onboarding] asignaciones secundaria:", dedupAsignaciones);
          console.log("[Onboarding] secciones:", seccionesPayload);
        }

        if (dedupAsignaciones.length > 0) {
          await configurarUsuarioGrados(backendUser.id, {
            asignaciones: dedupAsignaciones,
            ...(seccionesPayload.length > 0 ? { secciones: seccionesPayload } : {}),
          });
        }
      }

      // Refrescar usuario completo desde backend (con gradosAreas, primariaAreaIds, etc.)
      const refreshed = await getUsuarioById(backendUser.id);
      const usuarioActualizado = refreshed.data.data || refreshed.data;
      setUsuario(usuarioActualizado);

      const secundariaGradosNombres = gradosFiltrados
        .filter((g) => secundariaGradosIds.includes(g.id))
        .map((g) => g.nombre);
      const tutoriaGradoNombre = tutoriaGradoIds.length > 0
        ? gradosFiltrados.filter((g) => tutoriaGradoIds.includes(g.id)).map((g) => g.nombre).join(", ")
        : null;
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
                    2) Grados de Tutoría (opcional)
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Selecciona hasta {MAX_GRADOS_TUTORIA} grados. Si no llevas Tutoría, no selecciones ninguno.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {gradosFiltrados.map((grado) => {
                      const selected = tutoriaGradoIds.includes(grado.id);
                      const reachedMax = tutoriaGradoIds.length >= MAX_GRADOS_TUTORIA;
                      return (
                        <button
                          type="button"
                          key={`tutoria-${grado.id}`}
                          onClick={() => toggleTutoriaGrado(grado.id)}
                          disabled={!selected && reachedMax}
                          className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all
                            ${selected
                              ? "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-400 shadow-sm"
                              : reachedMax
                                ? "border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed"
                                : "border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:bg-purple-50/50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-purple-600"
                            }`}
                        >
                          {grado.nombre}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/40 p-4">
                  <p className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-2">
                    2b) Grados de Plan Lector (opcional)
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Selecciona hasta {MAX_GRADOS_PLAN_LECTOR} grados. Si no llevas Plan Lector, no selecciones ninguno.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {gradosFiltrados.map((grado) => {
                      const selected = planLectorGradoIds.includes(grado.id);
                      const reachedMax = planLectorGradoIds.length >= MAX_GRADOS_PLAN_LECTOR;
                      return (
                        <button
                          type="button"
                          key={`plan-lector-${grado.id}`}
                          onClick={() => togglePlanLectorGrado(grado.id)}
                          disabled={!selected && reachedMax}
                          className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all
                            ${selected
                              ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 dark:border-green-400 shadow-sm"
                              : reachedMax
                                ? "border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed"
                                : "border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:bg-green-50/50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-green-600"
                            }`}
                        >
                          {grado.nombre}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/40 p-4">
                  <p className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3">
                    3) Selecciona las áreas curriculares que enseñas
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Selecciona las áreas curriculares que enseñas.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {areasCurriculares.map((area) => {
                      const selected = areasSeleccionadasIds.includes(area.id);
                      let areaButtonClass =
                        "min-h-[52px] px-4 py-2 rounded-xl text-sm font-semibold border text-center transition-all";
                      if (selected) {
                        areaButtonClass += " bg-blue-600 text-white border-blue-600 shadow-md";
                      } else {
                        areaButtonClass +=
                          " bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 hover:border-blue-400";
                      }
                      return (
                        <button
                          type="button"
                          key={`area-sec-${area.id}`}
                          onClick={() => toggleAreaSecundaria(area.id)}
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

                {/* 4) Secciones por área y grado */}
                {(() => {
                  const entries: { areaId: number; areaNombre: string; gradoIds: number[] }[] = [];
                  for (const aId of areasSeleccionadasIds) {
                    const a = areas.find((x) => x.id === aId);
                    if (a) entries.push({ areaId: a.id, areaNombre: a.nombre, gradoIds: secundariaGradosIds });
                  }
                  if (tutoriaAreaId && tutoriaGradoIds.length > 0) {
                    const a = areas.find((x) => x.id === tutoriaAreaId);
                    if (a) entries.push({ areaId: a.id, areaNombre: a.nombre, gradoIds: tutoriaGradoIds });
                  }
                  if (planLectorAreaId && planLectorGradoIds.length > 0) {
                    const a = areas.find((x) => x.id === planLectorAreaId);
                    if (a) entries.push({ areaId: a.id, areaNombre: a.nombre, gradoIds: planLectorGradoIds });
                  }
                  if (entries.length === 0) return null;
                  return (
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/40 p-4">
                      <p className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-1">
                        4) Secciones por área y grado
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Para cada área, selecciona las secciones que enseñas en cada grado.
                      </p>
                      <div className="space-y-5">
                        {entries.map((entry) => (
                          <div key={`area-sec-block-${entry.areaId}`}>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                              {entry.areaNombre}
                            </p>
                            <div className="space-y-2 pl-2">
                              {gradosFiltrados
                                .filter((g) => entry.gradoIds.includes(g.id))
                                .map((grado) => {
                                  const key = `${entry.areaId}-${grado.id}`;
                                  const selected = seccionesPorAreaGrado[key] || [];
                                  return (
                                    <div key={key} className="flex flex-wrap items-center gap-2">
                                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-28 shrink-0">
                                        {grado.nombre}:
                                      </span>
                                      {SECCIONES_DISPONIBLES.map((sec) => {
                                        const isActive = selected.includes(sec);
                                        return (
                                          <button
                                            type="button"
                                            key={`${key}-${sec}`}
                                            onClick={() => toggleSeccion(entry.areaId, grado.id, sec)}
                                            className={`w-9 h-9 rounded-lg text-xs font-bold border-2 transition-all
                                              ${isActive
                                                ? "border-blue-500 bg-blue-500 text-white shadow-sm"
                                                : "border-gray-200 bg-white text-gray-500 hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                              }`}
                                          >
                                            {sec}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
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
