import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  FileText,
  FolderOpen,
  LogOut,
  Users,
  ChevronRight,
  Lock,
  KeyRound,
  ClipboardList,
  FilePlus2,
  Shield,
  Sparkles,
} from "lucide-react";
import "@fontsource/nunito/600.css";
import "@fontsource/nunito/700.css";
import "@fontsource/nunito/800.css";
import { useEffect, useMemo, useState } from "react";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuthStore } from "@/store/auth.store";
import ProblematicaModal from "@/components/Shared/Modal/ProblematicaModal";
import { problematicaApiService } from "@/features/problematicas/services/problematica-api.service";
import { applyProblematicaSelection } from "@/features/problematicas/utils/applyProblematicaSelection";
import { pickQuickStartProblematica } from "@/features/problematicas/utils/pickQuickStartProblematica";
import UpgradePremiumModal from "@/components/Shared/Modal/UpgradePremiumModal";
import SubirAlumnosModal from "@/components/Shared/Modal/SubirAlumnosModal";
import SubirInsigniaModal from "@/components/Shared/Modal/SubirInsigniaModal";
import WelcomeGuideModal, {
  hasSeenWelcomeGuide,
} from "@/components/Shared/Modal/WelcomeGuideModal";
import { usePermissions } from "@/hooks/usePermissions";
import { clearUserStorage } from "@/utils/clearUserStorage";
import { hasUploadedAlumnos } from "@/utils/alumnosStorage";
import { getUsuarioById } from "@/services/usuarios.service";
import { getInsigniaDataUrl } from "@/utils/insigniaCache";
import { useUserStore } from "@/store/user.store";
import { useQuery } from "@tanstack/react-query";
import { useUserUnidades } from "@/hooks/useUserUnidades";
import { isUnidadActiva } from "@/utils/unidadUtils";

/**
 * Tries to load an image URL via img+canvas and cache as base64 in localStorage.
 * Fails silently if CORS blocks the operation.
 */
function convertUrlToBase64(url: string) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      localStorage.setItem("insignia_base64", dataUrl);
    } catch {
      /* CORS tainted canvas — ignore */
    }
  };
  img.onerror = () => {
    /* CORS blocked load — ignore */
  };
  img.src = url;
}

function Dashboard() {
  const { logout } = useAuth0();
  const { user } = useAuthStore();
  const { user: usuarioBD } = useUserStore();
  const permissions = usePermissions();
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useGlobalLoading();
  const [showProblematicaModal, setShowProblematicaModal] = useState(false);
  const [problematicaInitialStep, setProblematicaInitialStep] = useState<
    "choose" | "pick"
  >("choose");
  const [showProblematicaIndividual, setShowProblematicaIndividual] =
    useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAlumnosModal, setShowAlumnosModal] = useState(false);
  const [alumnosSubidos, setAlumnosSubidos] = useState(() =>
    hasUploadedAlumnos(user?.gradoId),
  );
  const [showInsigniaModal, setShowInsigniaModal] = useState(false);
  const [insigniaUrl, setInsigniaUrl] = useState<string | null>(null);
  const [hasSuscripcionUnidad, setHasSuscripcionUnidad] = useState(false);
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(false);
  const [totalUnidades, setTotalUnidades] = useState(0);
  const [totalSesiones, setTotalSesiones] = useState(0);
  const [gradoNombre, setGradoNombre] = useState<string | null>(null);
  const [nivelNombre, setNivelNombre] = useState<string | null>(null);
  const [unidadActiva, setUnidadActiva] = useState<{
    id: string;
    titulo: string;
    numero: number;
    sesionesCount: number;
  } | null>(null);

  const gradosDisponibles = useMemo(() => {
    const esSecundaria = usuarioBD.nivel?.nombre
      ?.toLowerCase()
      .includes("secundaria");
    if (!esSecundaria) return [];
    return (usuarioBD.gradosAreas || [])
      .filter((ga) => ga.grado?.id && ga.grado?.nombre)
      .reduce((acc: Array<{ id: number; nombre: string }>, ga) => {
        if (!acc.some((g) => g.id === ga.grado!.id!)) {
          acc.push({ id: ga.grado!.id!, nombre: ga.grado!.nombre! });
        }
        return acc;
      }, []);
  }, [usuarioBD.gradosAreas, usuarioBD.nivel?.nombre]);

  const { data: freshUserData, isLoading: isLoadingUserData } = useQuery({
    queryKey: ["user", user?.id],
    queryFn: () => getUsuarioById(user!.id!),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const { data: userUnitsData, isLoading: isLoadingUserUnitsData } =
    useUserUnidades();

  useEffect(() => {
    if (!isLoadingUserData) {
      cargarDashboard();
    }
  }, [user?.id, isLoadingUserData]);

  useEffect(() => {
    if (isLoadingUserUnitsData || isLoadingUserData) {
      showLoading("Cargando dashboard...");
    } else {
      hideLoading();
    }
  }, [isLoadingUserUnitsData, isLoadingUserData]);

  async function cargarDashboard() {
    if (!user) return;
    showLoading("Cargando dashboard...");
    try {
      // Refrescar datos del usuario desde el backend (sesionesUsadas, sesionesRestantes, etc.)
      if (user.id) {
        if (freshUserData) {
          const freshUser = freshUserData.data.data;

          // El end|point GET /usuario/:id puede devolver los campos en la raíz
          // O anidados dentro de "suscripcion". Intentamos ambos.
          const updatePayload: Partial<Record<string, unknown>> = {};

          const sesUsadas =
            freshUser.sesionesUsadas ?? freshUser.cantidadSesionesUsadas;
          const sesRestantes =
            freshUser.sesionesRestantes ?? freshUser.cantidadSesionesRestantes;
          const plan = freshUser.plan ?? freshUser.suscripcion?.plan;
          const suscActiva =
            freshUser.suscripcionActiva ?? freshUser.suscripcion?.activa;
          const genero = freshUser.genero;
          const nivelId = freshUser.nivelId;
          const gradoId = freshUser.gradoId;

          if (sesUsadas !== undefined) updatePayload.sesionesUsadas = sesUsadas;
          if (sesRestantes !== undefined)
            updatePayload.sesionesRestantes = sesRestantes;
          if (plan !== undefined) updatePayload.plan = plan;
          if (suscActiva !== undefined)
            updatePayload.suscripcionActiva = suscActiva;
          if (genero) updatePayload.genero = genero;
          if (nivelId !== undefined) updatePayload.nivelId = nivelId;
          if (gradoId !== undefined) updatePayload.gradoId = gradoId;

          if (freshUser.insigniaUrl) {
            const effectiveUrl = getInsigniaDataUrl(freshUser.insigniaUrl);
            setInsigniaUrl(effectiveUrl);
            updatePayload.insigniaUrl = effectiveUrl;

            // If no cached base64 yet, try to convert the S3 URL
            if (!effectiveUrl?.startsWith("data:")) {
              convertUrlToBase64(freshUser.insigniaUrl);
            }
          }
          if (freshUser.grado?.nombre) setGradoNombre(freshUser.grado.nombre);
          if (freshUser.nivel?.nombre) setNivelNombre(freshUser.nivel.nombre);

          if (Object.keys(updatePayload).length > 0) {
            useAuthStore.getState().updateUser(updatePayload);
          }

          // Also populate useUserStore so ProblematicaModal can read context fields
          useUserStore.getState().setUsuario(freshUser);
        }
      }

      // Cargar unidades y datos derivados
      user.id && (await handleUserLearningUnits(user.id));
    } catch (error: any) {
      console.error("Error al cargar dashboard:", error);
      handleToaster("Error al cargar el dashboard", "error");
    } finally {
      hideLoading();

      // Mostrar guía de bienvenida a usuarios free sin sesiones creadas
      // Se ejecuta en finally para garantizar que siempre se evalúe
      const currentUser = useAuthStore.getState().user;
      const totalUsadas = Number(currentUser?.sesionesUsadas ?? 0);
      const esFree = !currentUser?.plan || currentUser.plan === "free";
      if (esFree && totalUsadas === 0 && !hasSeenWelcomeGuide()) {
        setShowWelcomeGuide(true);
      }
    }
  }

  async function handleUserLearningUnits(id: string) {
    if (!user) return;
    if (userUnitsData && user.id) {
      const items = userUnitsData;
      setTotalUnidades(items.length);
      const tieneSuscripcion = items.some((u) => {
        const miembro = u.miembros?.find((m) => m.usuarioId === id);
        return (
          miembro?.rol === "SUSCRIPTOR" && miembro?.estadoPago === "CONFIRMADO"
        );
      });
      setHasSuscripcionUnidad(tieneSuscripcion);
      const sesTotal = items.reduce(
        (sum, u) => sum + (u.sesiones?.length ?? 0),
        0,
      );
      setTotalSesiones(sesTotal);
      if (items.length > 0) {
        const activas = items.filter(isUnidadActiva);
        // Pick the active unit with the highest number; fall back to newest by createdAt
        const candidates = activas.length > 0 ? activas : items;
        const sorted = [...candidates].sort(
          (a, b) => b.numeroUnidad - a.numeroUnidad,
        );
        setUnidadActiva({
          id: sorted[0].id,
          titulo: sorted[0].titulo,
          numero: sorted[0].numeroUnidad,
          sesionesCount: sorted[0].sesiones?.length ?? 0,
        });
        if (!gradoNombre && sorted[0].grado?.nombre)
          setGradoNombre(sorted[0].grado.nombre);
        if (!nivelNombre && sorted[0].nivel?.nombre)
          setNivelNombre(sorted[0].nivel.nombre);
      }
    }
  }

  const handleLogout = () => {
    clearUserStorage();
    useAuthStore.getState().clearAuth();
    logout({ logoutParams: { returnTo: `${window.location.origin}/login` } });
  };

  /**
   * Intenta crear unidad.
   * Siempre navega a /crear-unidad. El chequeo de plan (free/premium)
   * se hace dentro del wizard tras seleccionar tipo PERSONAL/COMPARTIDA.
   */
  const handleCrearUnidad = () => {
    if (!user) return;
    showLoading("Preparando creación de unidad...");
    navigate("/crear-unidad", { state: { iniciarNuevaUnidad: true } });
  };

  function openProblematicaModal(step: "choose" | "pick" = "choose") {
    setProblematicaInitialStep(step);
    setShowProblematicaModal(true);
  }

  async function handleInicioRapidoSesion() {
    if (!user) return;

    if (hasSuscripcionUnidad || permissions.isPremium) {
      handleCrearSesion();
      return;
    }

    if (user.problematicaCompleta !== false) {
      if (!permissions.canCreateSesion) {
        setShowUpgradeModal(true);
        return;
      }
      showLoading("Cargando cuestionario...");
      navigate("/crear-sesion");
      return;
    }

    showLoading("Preparando tu sesión...");
    try {
      const response = await problematicaApiService.getRecomendadas();
      const picked = pickQuickStartProblematica(response.data);
      if (!picked) {
        handleToaster("No hay temas disponibles. Elige uno manualmente.", "error");
        openProblematicaModal("pick");
        return;
      }

      await applyProblematicaSelection(picked);
      useAuthStore.getState().updateUser({ problematicaCompleta: true });
      handleToaster(`Usamos "${picked.nombre}". ¡Vamos a tu sesión!`, "success");
      navigate("/crear-sesion");
    } catch (error) {
      console.error("Error en inicio rápido:", error);
      handleToaster("No pudimos preparar tu sesión. Intenta de nuevo.", "error");
      openProblematicaModal("choose");
    } finally {
      hideLoading();
    }
  }

  /**
   * Intenta crear sesión.
   * - SUSCRIPTOR con pago confirmado → Calendario (como premium)
   * - PREMIUM → Navega al calendario de sesiones por unidad.
   * - FREE    → Valida sesiones restantes y navega al cuestionario clásico.
   */
  const handleCrearSesion = () => {
    if (!user) return;

    // SUSCRIPTOR de unidad compartida → directo al calendario
    if (hasSuscripcionUnidad) {
      showLoading("Cargando calendario de sesiones...");
      navigate("/generar-sesion");
      return;
    }

    // PREMIUM: flujo de calendario por unidad (no requiere problemática)
    if (permissions.isPremium) {
      showLoading("Cargando calendario de sesiones...");
      navigate("/generar-sesion");
      return;
    }

    // FREE: primero debe completar problemática
    if (user.problematicaCompleta === false) {
      openProblematicaModal("choose");
      return;
    }

    // FREE: validar límite de sesiones gratuitas
    if (!permissions.canCreateSesion) {
      setShowUpgradeModal(true);
      return;
    }
    showLoading("Cargando cuestionario...");
    navigate("/crear-sesion");
  };

  const firstName = user?.name?.split(" ")[0] || "Docente";
  const esMujer = user?.genero === "Femenino";
  const saludo = esMujer ? "Bienvenida" : "Bienvenido";
  const bannerDocenteSrc = esMujer
    ? "/dashboard/welcome-female.png"
    : "/dashboard/welcome-male.png";
  const { isPremium, planLabel, sesionesUsadas, sesionesRestantes } =
    permissions;
  const unidadBloqueada = !permissions.canCreateUnidad;
  const needsProblematicaSetup =
    !isPremium && user?.problematicaCompleta === false;
  const showFreeQuotaBanner =
    !isPremium &&
    !needsProblematicaSetup &&
    (sesionesUsadas === 0 || sesionesUsadas === 1);
  const showProblematicaNudge =
    needsProblematicaSetup && Number(sesionesUsadas ?? 0) === 0;

  const navItems = [
    {
      icon: BookOpen,
      label: "Inicio",
      active: true,
      action: () => window.scrollTo({ top: 0, behavior: "smooth" }),
    },
    {
      icon: FileText,
      label: "Sesiones",
      action: () => {
        showLoading("Cargando sesiones...");
        navigate("/mis-sesiones");
      },
    },
    {
      icon: FolderOpen,
      label: "Unidades",
      action: () => {
        showLoading("Cargando unidades...");
        navigate("/mis-unidades");
      },
    },
    ...(permissions.isPremium
      ? [
          {
            icon: ClipboardList,
            label: "Fichas",
            action: () => {
              showLoading("Cargando fichas...");
              navigate("/mis-fichas");
            },
          },
        ]
      : []),
    {
      icon: KeyRound,
      label: "Unirme",
      action: () => {
        showLoading("Preparando...");
        navigate("/unirse-unidad");
      },
    },
  ];

  const documentos = [
    {
      icon: FileText,
      title: "Mis sesiones",
      description: "Abre o descarga lo que ya creaste",
      well: "bg-[#EAF2FC] text-[#3B6CB5]",
      action: () => {
        showLoading("Cargando sesiones...");
        navigate("/mis-sesiones");
      },
    },
    {
      icon: FolderOpen,
      title: "Mis unidades",
      description: "Continúa donde te quedaste",
      well: "bg-[#E3F8EC] text-[#15803D]",
      action: () => {
        showLoading("Cargando unidades...");
        navigate("/mis-unidades");
      },
    },
    ...(permissions.isPremium
      ? [
          {
            icon: ClipboardList,
            title: "Mis fichas",
            description: "Listas para usar en clase",
            well: "bg-[#FCE7F3] text-[#BE185D]",
            action: () => {
              showLoading("Cargando fichas...");
              navigate("/mis-fichas");
            },
          },
        ]
      : []),
  ];

  // DESIGN.md soft UI + Emil motion classes (dp-*)
  const focusRing =
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F7FA]";
  const pressable = "dp-press";
  const liftable = "dp-press dp-lift";
  const cardShadow = "shadow-[0_8px_28px_rgba(31,41,55,0.05)]";

  return (
    <div
      className="dp-canvas-dots relative min-h-[100dvh] overflow-x-hidden text-[#1F2937] dark:bg-slate-950 dark:text-slate-100"
      style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}
    >
      <div className="flex min-h-[100dvh] w-full">
        <aside className="sticky top-0 hidden h-[100dvh] w-[92px] shrink-0 flex-col items-center gap-3 border-r border-[#E6EBF2]/80 bg-white/90 px-3 py-5 backdrop-blur-md lg:flex xl:w-[220px] xl:items-stretch xl:px-4">
          <div className="mb-4 flex items-center gap-3 xl:px-1">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] bg-[#6B9FE8] text-white shadow-[0_10px_24px_rgba(107,159,232,0.28)]">
              <BookOpen className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="hidden min-w-0 xl:block">
              <p className="truncate text-lg font-extrabold text-[#1F2937]">
                Docente Pro
              </p>
              <p className="truncate text-sm font-semibold text-[#6B7280]">
                {planLabel}
              </p>
            </div>
          </div>

          <nav aria-label="Navegación principal" className="flex flex-1 flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.action}
                  className={`${focusRing} ${pressable} flex items-center justify-center gap-3 rounded-[20px] px-3 py-3 text-left xl:justify-start ${
                    item.active
                      ? "bg-[#EAF2FC] text-[#3B6CB5]"
                      : "text-[#6B7280] hover:bg-[#EAF2FC]"
                  }`}
                  aria-current={item.active ? "page" : undefined}
                >
                  <span
                    className={`grid h-11 w-11 place-items-center rounded-full ${
                      item.active
                        ? "bg-[#6B9FE8] text-white shadow-[0_8px_18px_rgba(107,159,232,0.28)]"
                        : "bg-[#EAF2FC] text-[#6B7280]"
                    }`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="hidden text-base font-bold xl:inline">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {!isPremium && (
            <>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className={`${focusRing} ${liftable} dp-cta-soft-pattern grid h-12 w-12 place-items-center rounded-[18px] bg-[#FF8B5C] text-white shadow-[0_12px_28px_rgba(255,139,92,0.28)] hover:bg-[#F97316] xl:hidden`}
                aria-label="Pasa a Premium"
                title="Pasa a Premium"
              >
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className={`${focusRing} ${liftable} dp-cta-soft-pattern hidden rounded-[22px] bg-[#FF8B5C] p-4 text-left text-white shadow-[0_14px_32px_rgba(255,139,92,0.28)] hover:bg-[#F97316] xl:block`}
              >
                <p className="text-base font-extrabold">Pasa a Premium</p>
                <p className="mt-1 text-sm font-semibold text-white/90">
                  Unidades ilimitadas y más herramientas.
                </p>
              </button>
            </>
          )}

          <Button
            onClick={handleLogout}
            variant="outline"
            className={`${focusRing} ${pressable} mt-2 h-12 rounded-[16px] border-[#E6EBF2] bg-white px-3 text-base font-bold text-[#1F2937] hover:bg-[#EAF2FC]`}
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-5 w-5 xl:mr-2" aria-hidden="true" />
            <span className="hidden xl:inline">Salir</span>
          </Button>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-[#E6EBF2]/70 bg-[#F5F7FA]/85 backdrop-blur-md">
            <div className="flex h-[72px] items-center justify-between gap-3 px-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3 lg:hidden">
                <div className="grid h-11 w-11 place-items-center rounded-[16px] bg-[#6B9FE8] text-white">
                  <BookOpen className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-extrabold">Docente Pro</p>
                  <p className="truncate text-sm font-semibold text-[#6B7280]">
                    {planLabel}
                    {gradoNombre ? ` · ${gradoNombre}` : ""}
                  </p>
                </div>
              </div>

              <div className="hidden min-w-0 lg:block">
                <p className="text-sm font-bold text-[#6B7280]">
                  {gradoNombre || "Tu aula"}
                  {nivelNombre ? ` · ${nivelNombre}` : ""}
                </p>
                <p className="text-xl font-extrabold text-[#1F2937]">
                  Panel del docente
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-[0_6px_18px_rgba(31,41,55,0.05)] sm:flex">
                  <div
                    className="grid h-10 w-10 place-items-center rounded-full bg-[#EAF2FC] text-base font-extrabold text-[#3B6CB5]"
                    aria-hidden="true"
                  >
                    {firstName.charAt(0)}
                  </div>
                  <span className="max-w-[16ch] truncate text-base font-bold">
                    {user?.name}
                  </span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className={`${focusRing} ${pressable} h-11 rounded-full border-[#E6EBF2] bg-white px-4 text-base font-bold lg:hidden`}
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="h-5 w-5" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            {/* Welcome — cuaderno del docente + personaje contenido */}
            <section
              className={`dp-enter dp-banner-notebook relative mb-6 min-h-[210px] overflow-hidden rounded-[32px] bg-[#6B9FE8] sm:min-h-[240px] ${cardShadow}`}
            >
              <img
                src={`${bannerDocenteSrc}?v=pattern6`}
                alt=""
                aria-hidden="true"
                className="dp-banner-art pointer-events-none absolute bottom-0 right-0 z-[1] hidden h-[118%] w-auto max-w-[46%] object-contain object-bottom sm:block lg:max-w-[40%]"
                loading="eager"
                decoding="async"
              />
              <div className="relative z-10 flex min-h-[210px] max-w-[min(100%,34rem)] flex-col justify-center p-6 text-white sm:min-h-[240px] sm:p-8 lg:max-w-[52%]">
                <p className="text-sm font-bold text-white/90">
                  Tu espacio de planificación
                </p>
                <h1 className="mt-2 text-balance text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl sm:leading-tight">
                  {saludo}, {firstName}
                </h1>
                <p className="mt-2 max-w-[38ch] text-base font-semibold leading-7 text-white/95 sm:text-lg">
                  Empieza creando, o abre lo que ya tienes listo.
                </p>
              </div>
            </section>

            {showProblematicaNudge && (
              <section
                aria-label="Configurar tema del aula"
                className="dp-enter mb-6 rounded-[24px] border border-[#FFD6C2] bg-[#FFEDE5] p-5 sm:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold uppercase tracking-wide text-[#C2410C]">
                      Paso 1 de 2
                    </p>
                    <p className="mt-1 text-xl font-extrabold text-[#1F2937]">
                      Prueba tu primera sesión gratis
                    </p>
                    <p className="mt-1 text-base font-semibold text-[#9A3412]">
                      Inicio rápido si quieres ver el resultado ya, o elige el tema de tu aula.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:shrink-0 sm:items-stretch">
                    <button
                      type="button"
                      onClick={handleInicioRapidoSesion}
                      className={`${focusRing} ${liftable} dp-cta-soft-pattern inline-flex min-h-12 items-center justify-center rounded-[18px] bg-[#FF8B5C] px-5 text-base font-extrabold text-white shadow-[0_12px_28px_rgba(255,139,92,0.24)] hover:bg-[#F97316]`}
                    >
                      Probar ahora
                    </button>
                    <button
                      type="button"
                      onClick={() => openProblematicaModal("pick")}
                      className={`${focusRing} ${pressable} inline-flex min-h-11 items-center justify-center rounded-[18px] border border-[#FFD6C2] bg-white px-5 text-base font-bold text-[#C2410C] hover:bg-[#FFF7ED]`}
                    >
                      Elegir mi tema
                    </button>
                  </div>
                </div>
              </section>
            )}

            {showFreeQuotaBanner && (
              <section
                aria-label="Sesiones gratis disponibles"
                className="dp-enter mb-6 rounded-[24px] border border-[#C5D8F2] bg-[#EAF2FC] p-5 sm:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xl font-extrabold text-[#1F2937]">
                      {sesionesUsadas === 0
                        ? "Aún no usaste tus 2 sesiones gratis"
                        : "Te queda 1 sesión gratis"}
                    </p>
                    <p className="mt-1 text-base font-semibold text-[#3B6CB5]">
                      {sesionesUsadas === 0
                        ? "Créala ahora y llévala a clase en Word o PDF."
                        : "Aprovecha tu última sesión gratuita."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCrearSesion}
                    className={`${focusRing} ${liftable} dp-cta-soft-pattern inline-flex min-h-12 shrink-0 items-center justify-center rounded-[18px] bg-[#FF8B5C] px-5 text-base font-extrabold text-white shadow-[0_12px_28px_rgba(255,139,92,0.24)] hover:bg-[#F97316]`}
                  >
                    {sesionesUsadas === 0
                      ? "Crear mi primera sesión"
                      : "Crear mi sesión"}
                  </button>
                </div>
              </section>
            )}

            {/* 1. Crear */}
            <section
              aria-labelledby="acciones-principales"
              className="mb-6 dp-enter dp-enter-delay-1"
            >
              <h2
                id="acciones-principales"
                className="text-xl font-extrabold text-[#1F2937]"
              >
                ¿Qué quieres crear?
              </h2>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={handleCrearSesion}
                  className={`${focusRing} ${liftable} dp-cta-soft-pattern relative flex min-h-[156px] items-center gap-4 overflow-hidden rounded-[28px] bg-[#FF8B5C] p-5 text-left text-white shadow-[0_16px_40px_rgba(255,139,92,0.28)] hover:bg-[#F97316] sm:gap-5 sm:p-6`}
                >
                  <span className="grid h-[72px] w-[72px] shrink-0 place-items-center overflow-hidden rounded-[22px] bg-white/95 sm:h-20 sm:w-20">
                    <img
                      src="/dashboard/sesion.png"
                      alt=""
                      className="h-[85%] w-[85%] object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-2xl font-extrabold sm:text-3xl">
                      Crear sesión
                    </span>
                    <span className="mt-2 block text-base font-semibold leading-7 text-orange-50 sm:text-lg">
                      {needsProblematicaSetup
                        ? "Inicio rápido o elige el tema de tu aula."
                        : !isPremium && sesionesRestantes > 0
                          ? sesionesRestantes === 1
                            ? "Te queda 1 sesión gratis."
                            : `Te quedan ${sesionesRestantes} sesiones gratis.`
                          : "Para la clase de hoy o mañana."}
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleCrearUnidad}
                  className={`${focusRing} ${liftable} relative flex min-h-[156px] items-center gap-4 rounded-[28px] border border-[#E6EBF2] bg-white p-5 text-left ${cardShadow} hover:border-[#FF8B5C]/30 sm:gap-5 sm:p-6`}
                >
                  {unidadBloqueada && (
                    <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-[#FFF7ED] px-3 py-1 text-sm font-extrabold text-[#9A3412]">
                      <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                      Premium
                    </span>
                  )}
                  <span className="grid h-[72px] w-[72px] shrink-0 place-items-center overflow-hidden rounded-[22px] bg-[#EAF2FC] sm:h-20 sm:w-20">
                    <img
                      src="/dashboard/unidad.png"
                      alt=""
                      className="h-[85%] w-[85%] object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-2xl font-extrabold text-[#1F2937] sm:text-3xl">
                      Crear unidad
                    </span>
                    <span className="mt-2 block text-base font-semibold leading-7 text-[#6B7280] sm:text-lg">
                      Varias sesiones en un solo plan.
                    </span>
                  </span>
                </button>
              </div>
            </section>

            {/* 2. Sesión individual */}
            {isPremium && (
              <section
                aria-labelledby="sesion-individual"
                className="mb-6 dp-enter dp-enter-delay-2"
              >
                <button
                  type="button"
                  onClick={() => setShowProblematicaIndividual(true)}
                  className={`${focusRing} ${liftable} flex w-full min-h-[96px] items-center gap-4 rounded-[24px] border border-[#E6EBF2] bg-white px-5 py-4 text-left ${cardShadow}`}
                >
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[18px] bg-[#EAF2FC] text-[#6B9FE8]">
                    <FilePlus2 className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      id="sesion-individual"
                      className="block text-xl font-extrabold text-[#1F2937]"
                    >
                      Sesión individual
                    </span>
                    <span className="mt-1 block text-base font-semibold text-[#6B7280]">
                      Sin unidad: solo para la clase de hoy.
                    </span>
                  </span>
                  <ChevronRight
                    className="h-5 w-5 shrink-0 text-[#9CA3AF] transition-colors duration-200 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] group-hover:text-[#FF8B5C]"
                    aria-hidden="true"
                  />
                </button>
              </section>
            )}

            {/* 3. Preparar documentos */}
            {isPremium && (
              <section
                aria-labelledby="preparar-documentos"
                className="mb-8 dp-enter dp-enter-delay-3"
              >
                <h2
                  id="preparar-documentos"
                  className="text-lg font-extrabold text-[#1F2937]"
                >
                  Preparar tus documentos
                </h2>
                <p className="mt-1 text-sm font-semibold text-[#6B7280]">
                  Nómina e insignia para tus PDFs.
                </p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setShowAlumnosModal(true)}
                    className={`${focusRing} ${liftable} flex min-h-[76px] items-center gap-3 rounded-[20px] border border-[#E6EBF2] bg-white px-4 py-3 text-left ${cardShadow}`}
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#E3F8EC] text-[#15803D]">
                      <Users className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-extrabold text-[#1F2937]">
                        {alumnosSubidos
                          ? "Actualizar lista de alumnos"
                          : "Subir lista de alumnos"}
                      </span>
                      <span className="mt-0.5 block text-sm font-semibold text-[#6B7280]">
                        Para instrumentos de evaluación.
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInsigniaModal(true)}
                    className={`${focusRing} ${liftable} flex min-h-[76px] items-center gap-3 rounded-[20px] border border-[#E6EBF2] bg-white px-4 py-3 text-left ${cardShadow}`}
                  >
                    <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-[14px] bg-[#FFEDE5] text-[#F97316]">
                      {insigniaUrl ? (
                        <img
                          src={insigniaUrl}
                          alt=""
                          className="h-7 w-7 object-contain"
                        />
                      ) : (
                        <Shield className="h-5 w-5" aria-hidden="true" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-extrabold text-[#1F2937]">
                        {insigniaUrl
                          ? "Cambiar insignia"
                          : "Subir insignia del colegio"}
                      </span>
                      <span className="mt-0.5 block text-sm font-semibold text-[#6B7280]">
                        Va en el encabezado de tus documentos.
                      </span>
                    </span>
                  </button>
                </div>
              </section>
            )}

            {/* 4. Mis documentos */}
            <section
              aria-labelledby="mis-documentos"
              className="mb-8 dp-enter dp-enter-delay-4"
            >
              <h2
                id="mis-documentos"
                className="text-lg font-extrabold text-[#1F2937]"
              >
                Mis documentos
              </h2>
              <div className="mt-3 flex flex-col gap-2.5">
                {documentos.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.title}
                      type="button"
                      onClick={item.action}
                      className={`${focusRing} ${liftable} flex min-h-[72px] items-center gap-3 rounded-[20px] border border-[#E6EBF2] bg-white px-4 py-3 text-left ${cardShadow}`}
                    >
                      <span
                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-[14px] ${item.well}`}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-base font-extrabold text-[#1F2937]">
                          {item.title}
                        </span>
                        <span className="mt-0.5 block text-sm font-semibold text-[#6B7280]">
                          {item.description}
                        </span>
                      </span>
                      <ChevronRight
                        className="h-5 w-5 shrink-0 text-[#9CA3AF]"
                        aria-hidden="true"
                      />
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Unirme */}
            <section className="mb-8 dp-enter dp-enter-delay-5">
              <button
                type="button"
                onClick={() => {
                  showLoading("Preparando...");
                  navigate("/unirse-unidad");
                }}
                className={`${focusRing} ${pressable} flex w-full min-h-[64px] items-center gap-3 rounded-[18px] border border-dashed border-[#C5D8F2] bg-white/50 px-4 py-3 text-left hover:bg-white`}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#EAF2FC] text-[#6B7280]">
                  <KeyRound className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-extrabold text-[#1F2937]">
                    Unirme a una unidad
                  </span>
                  <span className="mt-0.5 block text-sm font-semibold text-[#6B7280]">
                    Con el código de un colega.
                  </span>
                </span>
                <ChevronRight
                  className="h-5 w-5 shrink-0 text-[#9CA3AF]"
                  aria-hidden="true"
                />
              </button>
            </section>

            {/* 5. Meta compacta */}
            <section
              aria-label="Resumen y unidad en curso"
              className="mb-24 space-y-3 border-t border-[#E6EBF2] pt-6 lg:mb-6"
            >
              <p className="text-sm font-bold uppercase tracking-[0.04em] text-[#9CA3AF]">
                Tu cuenta
              </p>

              <ul className="flex flex-wrap gap-2">
                {[
                  { label: "Plan", value: planLabel },
                  { label: "Unidades", value: String(totalUnidades) },
                  {
                    label: isPremium ? "Sesiones" : "Gratis",
                    value: String(
                      isPremium ? totalSesiones : sesionesRestantes,
                    ),
                  },
                ].map((chip) => (
                  <li
                    key={chip.label}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-[#6B7280] shadow-[0_4px_14px_rgba(31,41,55,0.04)]"
                  >
                    <span>{chip.label}</span>
                    <span className="font-extrabold tabular-nums text-[#1F2937]">
                      {chip.value}
                    </span>
                  </li>
                ))}
              </ul>

              {unidadActiva && (
                <button
                  type="button"
                  onClick={() => {
                    showLoading("Abriendo tu unidad...");
                    navigate(`/unidad/${unidadActiva.id}`);
                  }}
                  className={`${focusRing} ${pressable} flex w-full items-center gap-3 rounded-[18px] border border-[#E6EBF2] bg-white px-4 py-3 text-left ${cardShadow}`}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#E3F8EC] text-[#15803D]">
                    <FolderOpen className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-[#6B7280]">
                      Unidad en curso · N° {unidadActiva.numero}
                    </span>
                    <span className="mt-0.5 line-clamp-1 block text-sm font-semibold text-[#1F2937]">
                      {unidadActiva.titulo}
                    </span>
                  </span>
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-[#9CA3AF]"
                    aria-hidden="true"
                  />
                </button>
              )}
            </section>
          </main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Accesos rápidos"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E6EBF2] bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md lg:hidden"
      >
        <div className="mx-auto flex max-w-lg items-center justify-around gap-1">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.action}
                className={`${focusRing} ${pressable} flex min-w-[64px] flex-col items-center gap-1 rounded-[16px] px-2 py-2 ${
                  item.active ? "text-[#3B6CB5]" : "text-[#6B7280]"
                }`}
              >
                <span
                  className={`grid h-10 w-10 place-items-center rounded-full ${
                    item.active ? "bg-[#EAF2FC]" : "bg-transparent"
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-xs font-bold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>


      {/* Modal de Problemática — primera sesión free */}
      <ProblematicaModal
        isOpen={showProblematicaModal}
        variant="firstSession"
        firstSessionInitialStep={problematicaInitialStep}
        onClose={() => setShowProblematicaModal(false)}
        onComplete={() => {
          setShowProblematicaModal(false);
          showLoading("Cargando cuestionario...");
          navigate("/crear-sesion");
        }}
      />

      {/* Modal de Problemática — Sesión Individual (premium) */}
      <ProblematicaModal
        isOpen={showProblematicaIndividual}
        onClose={() => setShowProblematicaIndividual(false)}
        onComplete={() => {
          setShowProblematicaIndividual(false);
          showLoading("Cargando cuestionario...");
          navigate("/crear-sesion");
        }}
      />

      {/* Modal de Upgrade Premium */}
      <UpgradePremiumModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />

      {/* Modal de Subir Lista de Alumnos */}
      <SubirAlumnosModal
        isOpen={showAlumnosModal}
        onClose={() => {
          setShowAlumnosModal(false);
          setAlumnosSubidos(hasUploadedAlumnos(user?.gradoId));
        }}
        gradoId={user?.gradoId}
        gradosDisponibles={gradosDisponibles}
      />

      {/* Modal de Subir Insignia */}
      <SubirInsigniaModal
        isOpen={showInsigniaModal}
        onClose={() => setShowInsigniaModal(false)}
        currentInsigniaUrl={insigniaUrl}
        onUploaded={(url) => {
          setInsigniaUrl(url);
          useAuthStore.getState().updateUser({ insigniaUrl: url });
        }}
        onRemoved={() => {
          setInsigniaUrl(null);
          useAuthStore.getState().updateUser({ insigniaUrl: null });
        }}
      />

      {/* Modal guía de bienvenida (una sola vez para usuarios free) */}
      <WelcomeGuideModal
        isOpen={showWelcomeGuide}
        onClose={() => setShowWelcomeGuide(false)}
        onQuickStart={handleInicioRapidoSesion}
        onChooseTheme={() => openProblematicaModal("pick")}
      />
    </div>
  );
}

export default Dashboard;
