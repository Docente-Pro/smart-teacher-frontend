import { useState, useEffect, useMemo, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { Building2, ChevronLeft, ChevronRight, GraduationCap, MapPin, User, type LucideIcon } from "lucide-react";
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
import { readPendingLandingPlan } from "@/utils/landingPlan";

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

const ONBOARDING_STEPS = ["Datos personales", "Perfil docente", "Ubicación"] as const;

const STEP_HINTS: Record<number, string> = {
  0: "Estos datos aparecerán en tus sesiones, unidades y fichas.",
  1: "Cuéntanos qué enseñas para adaptar el currículo a tu aula.",
  2: "Ubicación de tu colegio para contextualizar contenidos.",
};

const inputClassName =
  "h-12 border-[#E6EBF2] bg-white pl-10 text-base font-semibold text-[#1F2937] placeholder:text-[#9CA3AF] focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)] focus-visible:ring-offset-2";

const selectTriggerClassName =
  "h-12 border-[#E6EBF2] bg-white text-base font-semibold text-[#1F2937] focus:ring-4 focus:ring-[rgba(255,139,92,0.32)] focus:ring-offset-2";

function choiceChipClass(selected: boolean, disabled = false): string {
  const base =
    "min-h-[52px] rounded-[16px] border px-4 py-2 text-sm font-bold transition-[border-color,background-color,box-shadow,transform] duration-200 dp-press";
  if (disabled) {
    return `${base} cursor-not-allowed border-[#E6EBF2] bg-[#F5F7FA] text-[#9CA3AF]`;
  }
  if (selected) {
    return `${base} border-[#6B9FE8] bg-[#6B9FE8] text-white shadow-[0_8px_20px_rgba(107,159,232,0.22)]`;
  }
  return `${base} border-[#E6EBF2] bg-white text-[#1F2937] hover:border-[#6B9FE8]/50`;
}

function tutoriaChipClass(selected: boolean, disabled: boolean): string {
  const base =
    "min-h-[48px] rounded-[16px] border-2 px-4 py-2 text-sm font-bold transition-[border-color,background-color] duration-200 dp-press";
  if (disabled) {
    return `${base} cursor-not-allowed border-[#E6EBF2] bg-[#F5F7FA] text-[#9CA3AF]`;
  }
  if (selected) {
    return `${base} border-[#BE185D] bg-[#FCE7F3] text-[#BE185D]`;
  }
  return `${base} border-[#E6EBF2] bg-white text-[#1F2937] hover:border-[#BE185D]/40 hover:bg-[#FCE7F3]/40`;
}

function planLectorChipClass(selected: boolean, disabled: boolean): string {
  const base =
    "min-h-[48px] rounded-[16px] border-2 px-4 py-2 text-sm font-bold transition-[border-color,background-color] duration-200 dp-press";
  if (disabled) {
    return `${base} cursor-not-allowed border-[#E6EBF2] bg-[#F5F7FA] text-[#9CA3AF]`;
  }
  if (selected) {
    return `${base} border-[#15803D] bg-[#E3F8EC] text-[#15803D]`;
  }
  return `${base} border-[#E6EBF2] bg-white text-[#1F2937] hover:border-[#15803D]/40 hover:bg-[#E3F8EC]/50`;
}

function sectionChipClass(selected: boolean): string {
  const base =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] text-xs font-extrabold border-2 transition-colors duration-200 dp-press";
  if (selected) {
    return `${base} border-[#6B9FE8] bg-[#6B9FE8] text-white`;
  }
  return `${base} border-[#E6EBF2] bg-white text-[#6B7280] hover:border-[#6B9FE8]/50`;
}

function OnboardingSectionTitle({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-[16px] bg-[#EAF2FC] text-[#3B6CB5]">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h2 className="text-xl font-extrabold tracking-[-0.02em] text-[#1F2937]">{title}</h2>
    </div>
  );
}

function OnboardingSubsection({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="rounded-[20px] border border-[#E6EBF2] bg-[#F5F7FA]/40 p-4 sm:p-5">
      <p className="text-base font-extrabold text-[#1F2937]">{title}</p>
      {hint ? <p className="mt-1 text-sm font-semibold leading-6 text-[#6B7280]">{hint}</p> : null}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function OnboardingStepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <nav aria-label="Progreso del perfil" className="mb-6">
      <ol className="flex items-center gap-0">
        {ONBOARDING_STEPS.map((label, index) => {
          const isComplete = index < currentStep;
          const isActive = index === currentStep;
          return (
            <li key={label} className="flex flex-1 items-center">
              <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-extrabold transition-colors duration-200 ${
                    isComplete
                      ? "bg-[#6B9FE8] text-white"
                      : isActive
                        ? "bg-[#FF8B5C] text-white shadow-[0_8px_20px_rgba(255,139,92,0.28)]"
                        : "border-2 border-[#E6EBF2] bg-white text-[#9CA3AF]"
                  }`}
                >
                  {isComplete ? "✓" : index + 1}
                </span>
                <span
                  className={`hidden max-w-[9rem] truncate text-center text-xs font-bold sm:block ${
                    isActive ? "text-[#1F2937]" : "text-[#9CA3AF]"
                  }`}
                >
                  {label}
                </span>
              </div>
              {index < ONBOARDING_STEPS.length - 1 ? (
                <div
                  className={`mx-1 h-0.5 flex-1 rounded-full sm:mx-2 ${
                    index < currentStep ? "bg-[#6B9FE8]" : "bg-[#E6EBF2]"
                  }`}
                  aria-hidden="true"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
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
  const [currentStep, setCurrentStep] = useState(0);

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

        const nivelesFiltrados = nivelesResponse.data.data.filter(
          (nivel: INivel) => isNivelSoportado(nivel.nombre)
        );
        setNiveles(nivelesFiltrados);
        setTodosLosGrados(gradosResponse.data.data);
        setAreas((areasResponse.data.data || areasResponse.data) as AreaItem[]);

        const pendingPlan = readPendingLandingPlan();
        if (pendingPlan && nivelesFiltrados.length > 0) {
          const wantsSecundaria =
            pendingPlan === "premium_personal_secundaria";
          const nivelMatch = nivelesFiltrados.find((nivel: INivel) => {
            const name = (nivel.nombre || "").toLowerCase();
            return wantsSecundaria
              ? name.includes("secundaria")
              : name.includes("primaria");
          });
          if (nivelMatch) {
            setFormData((prev) => ({ ...prev, nivelId: nivelMatch.id }));
          }
        }
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

  function notifySecundariaErrors(): boolean {
    if (tutoriaGradoIds.length > 0 && !tutoriaAreaId) {
      handleToaster("No se encontró el área Tutoría en el catálogo. Revisa /api/area.", "error");
      return true;
    }
    if (planLectorGradoIds.length > 0 && !planLectorAreaId) {
      handleToaster("No se encontró el área Plan Lector en el catálogo. Revisa /api/area.", "error");
      return true;
    }
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
      handleToaster(
        `Selecciona secciones para: ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? "..." : ""}`,
        "error",
      );
      return true;
    }
    return false;
  }

  function validateStep(step: number): boolean {
    const hasAreasFromChecks =
      areasSeleccionadasIds.length > 0 ||
      Boolean(tutoriaGradoIds.length > 0 && tutoriaAreaId) ||
      Boolean(planLectorGradoIds.length > 0 && planLectorAreaId);

    if (step === 0) {
      return (
        formData.nombre.trim().length >= 2 &&
        formData.nombreInstitucion.trim().length >= 3
      );
    }

    if (step === 1) {
      if (!formData.genero || !formData.nivelId || !formData.gradoId) return false;
      if (isSecundariaSeleccionada && secundariaGradosIds.length === 0) return false;
      if (isSecundariaSeleccionada && !hasAreasFromChecks) return false;
      if (isSecundariaSeleccionada && tutoriaGradoIds.length > 0 && !tutoriaAreaId) return false;
      if (isSecundariaSeleccionada && planLectorGradoIds.length > 0 && !planLectorAreaId) return false;
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
        return !pairs.some((p) => !(seccionesPorAreaGrado[`${p.areaId}-${p.gradoId}`]?.length > 0));
      }
      return true;
    }

    if (step === 2) {
      return Boolean(formData.departamento && formData.provincia && formData.distrito);
    }

    return false;
  }

  function notifyStepErrors(step: number) {
    if (step === 0) {
      if (formData.nombre.trim().length < 2) {
        handleToaster("Escribe tu nombre completo", "error");
        return;
      }
      if (formData.nombreInstitucion.trim().length < 3) {
        handleToaster("Escribe el nombre de tu institución", "error");
        return;
      }
    }
    if (step === 1) {
      if (!formData.genero) {
        handleToaster("Selecciona tu género", "error");
        return;
      }
      if (!formData.nivelId) {
        handleToaster("Selecciona tu nivel educativo", "error");
        return;
      }
      if (!formData.gradoId) {
        handleToaster("Selecciona el grado que enseñas", "error");
        return;
      }
      if (isSecundariaSeleccionada && secundariaGradosIds.length === 0) {
        handleToaster("Selecciona al menos un año", "error");
        return;
      }
      if (isSecundariaSeleccionada && !areasSeleccionadasIds.length && !tutoriaGradoIds.length && !planLectorGradoIds.length) {
        handleToaster("Selecciona al menos un área curricular", "error");
        return;
      }
      if (notifySecundariaErrors()) return;
    }
    if (step === 2) {
      handleToaster("Completa departamento, provincia y distrito", "error");
    }
  }

  function goToNextStep() {
    if (!validateStep(currentStep)) {
      notifyStepErrors(currentStep);
      return;
    }
    setCurrentStep((s) => Math.min(s + 1, ONBOARDING_STEPS.length - 1));
  }

  function goToPrevStep() {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }

  function validateForm(): boolean {
    return ONBOARDING_STEPS.every((_, index) => validateStep(index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      const firstInvalidStep = ONBOARDING_STEPS.findIndex((_, index) => !validateStep(index));
      if (firstInvalidStep >= 0) {
        setCurrentStep(firstInvalidStep);
        notifyStepErrors(firstInvalidStep);
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

  const primerNombre =
    formData.nombre.trim().split(/\s+/)[0] ||
    auth0User?.name?.trim().split(/\s+/)[0] ||
    "docente";
  const saludoGenero =
    formData.genero === "Femenino"
      ? "Bienvenida"
      : formData.genero === "Masculino"
        ? "Bienvenido"
        : "Bienvenido/a";
  const welcomeImageSrc =
    formData.genero === "Femenino"
      ? "/dashboard/welcome-female.png?v=onboarding1"
      : "/dashboard/welcome-male.png?v=onboarding1";

  return (
    <div
      className="dp-canvas-dots min-h-[100dvh] text-[#1F2937]"
      style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}
    >
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-8 sm:py-10">
        <section className="dp-banner-notebook dp-enter relative mb-6 overflow-hidden rounded-[32px] bg-[#6B9FE8] px-6 py-8 sm:px-10 sm:py-9">
          <div className="relative z-10 max-w-[58%] pr-2">
            <p className="text-sm font-bold text-white/90">
              Configura tu perfil · Paso {currentStep + 1} de {ONBOARDING_STEPS.length}
            </p>
            <h1 className="mt-2 text-balance text-2xl font-extrabold tracking-[-0.02em] text-white sm:text-3xl">
              {saludoGenero}, {primerNombre}
            </h1>
            <p className="mt-2 max-w-[36ch] text-base font-semibold leading-7 text-white/95">
              {STEP_HINTS[currentStep]}
            </p>
          </div>
          <img
            src={welcomeImageSrc}
            alt=""
            className="dp-banner-art pointer-events-none absolute bottom-0 right-0 z-[1] h-[88%] w-auto max-w-[42%] object-contain object-bottom sm:max-w-[38%]"
            loading="eager"
            decoding="async"
          />
        </section>

        <OnboardingStepIndicator currentStep={currentStep} />

        <div className="dp-enter dp-enter-delay-1 rounded-[28px] border border-[#E6EBF2] bg-white p-5 shadow-[0_8px_28px_rgba(31,41,55,0.05)] sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {currentStep === 0 && (
              <section className="space-y-4">
                <OnboardingSectionTitle icon={User} title="Datos personales" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="nombre" className="text-sm font-bold text-[#1F2937]">
                      Nombre completo
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" aria-hidden="true" />
                      <Input
                        id="nombre"
                        type="text"
                        placeholder="Juan Pérez"
                        className={inputClassName}
                        value={formData.nombre}
                        onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="institucion" className="text-sm font-bold text-[#1F2937]">
                      Institución educativa
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" aria-hidden="true" />
                      <Input
                        id="institucion"
                        type="text"
                        placeholder="I.E. María Parado de Bellido"
                        className={inputClassName}
                        value={formData.nombreInstitucion}
                        onChange={(e) => setFormData((prev) => ({ ...prev, nombreInstitucion: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-sm font-semibold text-[#9CA3AF]">
                  El nombre de la institución aparecerá en tus documentos generados.
                </p>

                <div className="space-y-1.5">
                  <Label htmlFor="directivo" className="text-sm font-bold text-[#1F2937]">
                    Directivo(a) de la I.E.
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" aria-hidden="true" />
                    <Input
                      id="directivo"
                      type="text"
                      placeholder="Ej: Carmen López Torres"
                      className={inputClassName}
                      value={formData.nombreDirectivo}
                      onChange={(e) => setFormData((prev) => ({ ...prev, nombreDirectivo: e.target.value }))}
                    />
                  </div>
                  <p className="text-sm font-semibold text-[#9CA3AF]">Opcional. Aparece en los documentos de la unidad.</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="subdirectora" className="text-sm font-bold text-[#1F2937]">
                    Subdirector(a) de la I.E.
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" aria-hidden="true" />
                    <Input
                      id="subdirectora"
                      type="text"
                      placeholder="Ej: María García"
                      className={inputClassName}
                      value={formData.nombreSubdirectora}
                      onChange={(e) => setFormData((prev) => ({ ...prev, nombreSubdirectora: e.target.value }))}
                    />
                  </div>
                  <p className="text-sm font-semibold text-[#9CA3AF]">Opcional. Aparece en los documentos de la unidad.</p>
                </div>
              </section>
            )}

            {currentStep === 1 && (
              <section className="space-y-5">
            <OnboardingSectionTitle icon={GraduationCap} title="Perfil docente" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="genero" className="text-sm font-bold text-[#1F2937]">
                  Género
                </Label>
                <Select
                  value={formData.genero}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, genero: value }))}
                >
                  <SelectTrigger className={selectTriggerClassName}>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Femenino">Femenino</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm font-semibold text-[#9CA3AF]">Para personalizar textos en tus documentos.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nivel" className="text-sm font-bold text-[#1F2937]">
                  Nivel educativo
                </Label>
                <Select
                  value={formData.nivelId ? formData.nivelId.toString() : ""}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, nivelId: parseInt(value) }))}
                >
                  <SelectTrigger className={selectTriggerClassName}>
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

            {!isSecundariaSeleccionada && (
              <OnboardingSubsection title="Grado que enseñas">
                <div className="space-y-1.5">
                  <Label htmlFor="grado" className="text-sm font-bold text-[#1F2937]">
                    Grado
                  </Label>
                  <Select
                    value={formData.gradoId ? formData.gradoId.toString() : ""}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, gradoId: parseInt(value) }))}
                    disabled={!formData.nivelId}
                  >
                    <SelectTrigger className={selectTriggerClassName}>
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
              </OnboardingSubsection>
            )}

            {isSecundariaSeleccionada && (
              <div className="space-y-4">
                <OnboardingSubsection
                  title="1) Años que enseñas"
                  hint="Marca todos los grados en los que dictas clases este año."
                >
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {gradosFiltrados.map((grado) => {
                      const selected = secundariaGradosIds.includes(grado.id);
                      return (
                        <button
                          type="button"
                          key={grado.id}
                          onClick={() => toggleSecondaryGrade(grado.id)}
                          className={choiceChipClass(selected)}
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
                        className="rounded-full bg-[#EAF2FC] px-2.5 py-1 text-xs font-bold text-[#3B6CB5]"
                      >
                        {anio}
                      </span>
                    ))}
                    {secundariaAniosSeleccionados.length === 0 && (
                      <span className="text-sm font-semibold text-[#6B7280]">
                        Aún no seleccionaste años.
                      </span>
                    )}
                  </div>
                </OnboardingSubsection>

                <OnboardingSubsection
                  title="2) Grados de tutoría (opcional)"
                  hint={`Hasta ${MAX_GRADOS_TUTORIA} grados. Déjalo vacío si no llevas tutoría.`}
                >
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {gradosFiltrados.map((grado) => {
                      const selected = tutoriaGradoIds.includes(grado.id);
                      const reachedMax = tutoriaGradoIds.length >= MAX_GRADOS_TUTORIA;
                      return (
                        <button
                          type="button"
                          key={`tutoria-${grado.id}`}
                          onClick={() => toggleTutoriaGrado(grado.id)}
                          disabled={!selected && reachedMax}
                          className={tutoriaChipClass(selected, !selected && reachedMax)}
                        >
                          {grado.nombre}
                        </button>
                      );
                    })}
                  </div>
                </OnboardingSubsection>

                <OnboardingSubsection
                  title="2b) Grados de plan lector (opcional)"
                  hint={`Hasta ${MAX_GRADOS_PLAN_LECTOR} grados. Déjalo vacío si no llevas plan lector.`}
                >
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {gradosFiltrados.map((grado) => {
                      const selected = planLectorGradoIds.includes(grado.id);
                      const reachedMax = planLectorGradoIds.length >= MAX_GRADOS_PLAN_LECTOR;
                      return (
                        <button
                          type="button"
                          key={`plan-lector-${grado.id}`}
                          onClick={() => togglePlanLectorGrado(grado.id)}
                          disabled={!selected && reachedMax}
                          className={planLectorChipClass(selected, !selected && reachedMax)}
                        >
                          {grado.nombre}
                        </button>
                      );
                    })}
                  </div>
                </OnboardingSubsection>

                <OnboardingSubsection
                  title="3) Áreas curriculares"
                  hint="Selecciona las áreas que enseñas este año."
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {areasCurriculares.map((area) => {
                      const selected = areasSeleccionadasIds.includes(area.id);
                      return (
                        <button
                          type="button"
                          key={`area-sec-${area.id}`}
                          onClick={() => toggleAreaSecundaria(area.id)}
                          className={`${choiceChipClass(selected)} text-center`}
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
                        className="rounded-full bg-[#E3F8EC] px-2.5 py-1 text-xs font-bold text-[#15803D]"
                      >
                        {nombre}
                      </span>
                    ))}
                    {areasSeleccionadasNombres.length === 0 && (
                      <span className="text-sm font-semibold text-[#6B7280]">
                        Aún no seleccionaste áreas.
                      </span>
                    )}
                  </div>
                </OnboardingSubsection>

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
                    <OnboardingSubsection
                      title="4) Secciones por área y grado"
                      hint="Indica las secciones que enseñas en cada combinación."
                    >
                      <div className="space-y-5">
                        {entries.map((entry) => (
                          <div key={`area-sec-block-${entry.areaId}`}>
                            <p className="mb-2 text-sm font-extrabold text-[#1F2937]">
                              {entry.areaNombre}
                            </p>
                            <div className="space-y-2 pl-1">
                              {gradosFiltrados
                                .filter((g) => entry.gradoIds.includes(g.id))
                                .map((grado) => {
                                  const key = `${entry.areaId}-${grado.id}`;
                                  const selected = seccionesPorAreaGrado[key] || [];
                                  return (
                                    <div key={key} className="flex flex-wrap items-center gap-2">
                                      <span className="w-28 shrink-0 text-sm font-semibold text-[#6B7280]">
                                        {grado.nombre}:
                                      </span>
                                      {SECCIONES_DISPONIBLES.map((sec) => {
                                        const isActive = selected.includes(sec);
                                        return (
                                          <button
                                            type="button"
                                            key={`${key}-${sec}`}
                                            onClick={() => toggleSeccion(entry.areaId, grado.id, sec)}
                                            className={sectionChipClass(isActive)}
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
                    </OnboardingSubsection>
                  );
                })()}
              </div>
            )}
              </section>
            )}

            {currentStep === 2 && (
              <section className="space-y-4">
                <OnboardingSectionTitle icon={MapPin} title="Ubicación" />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="departamento" className="text-sm font-bold text-[#1F2937]">
                      Departamento
                    </Label>
                    <Select
                      value={formData.departamento}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, departamento: value, provincia: "", distrito: "" }))
                      }
                    >
                      <SelectTrigger className={selectTriggerClassName}>
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
                    <Label htmlFor="provincia" className="text-sm font-bold text-[#1F2937]">
                      Provincia
                    </Label>
                    <Select
                      value={formData.provincia}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, provincia: value, distrito: "" }))
                      }
                      disabled={!formData.departamento}
                    >
                      <SelectTrigger className={selectTriggerClassName}>
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
                    <Label htmlFor="distrito" className="text-sm font-bold text-[#1F2937]">
                      Distrito
                    </Label>
                    <Select
                      value={formData.distrito}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, distrito: value }))
                      }
                      disabled={!formData.provincia}
                    >
                      <SelectTrigger className={selectTriggerClassName}>
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
              </section>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-[#E6EBF2] pt-6 sm:flex-row sm:items-center sm:justify-between">
              {currentStep > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToPrevStep}
                  className="dp-press min-h-[52px] rounded-[18px] border-[#E6EBF2] bg-white px-5 text-base font-bold text-[#1F2937] hover:bg-[#F5F7FA]"
                >
                  <ChevronLeft className="mr-1 h-5 w-5" aria-hidden="true" />
                  Atrás
                </Button>
              ) : (
                <span className="hidden text-sm font-semibold text-[#9CA3AF] sm:inline">
                  Docente Pro
                </span>
              )}

              {currentStep < ONBOARDING_STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={goToNextStep}
                  className="dp-press dp-lift min-h-[52px] rounded-[18px] bg-[#6B9FE8] px-6 text-base font-extrabold text-white shadow-[0_10px_24px_rgba(107,159,232,0.28)] hover:bg-[#5A8FD6]"
                >
                  Siguiente
                  <ChevronRight className="ml-1 h-5 w-5" aria-hidden="true" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="dp-press dp-lift min-h-[56px] rounded-[20px] bg-[#FF8B5C] px-6 text-base font-extrabold text-white shadow-[0_16px_40px_rgba(255,139,92,0.28)] hover:bg-[#F97316] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)] focus-visible:ring-offset-2"
                >
                  Completar perfil
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OnboardingPage;
