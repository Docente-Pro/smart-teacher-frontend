import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  FileText,
  FolderOpen,
  LogOut,
  User,
  Users,
  ChevronRight,
  Sparkles,
  Crown,
  FolderPlus,
  Lock,
  KeyRound,
  ClipboardList,
  FilePlus2,
  Shield,
  GraduationCap,
  CalendarDays,
  Layers,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuthStore } from "@/store/auth.store";
import ProblematicaModal from "@/components/Shared/Modal/ProblematicaModal";
import UpgradePremiumModal from "@/components/Shared/Modal/UpgradePremiumModal";
import SubirAlumnosModal from "@/components/Shared/Modal/SubirAlumnosModal";
import SubirInsigniaModal from "@/components/Shared/Modal/SubirInsigniaModal";
import WelcomeGuideModal, { hasSeenWelcomeGuide } from "@/components/Shared/Modal/WelcomeGuideModal";
import { usePermissions } from "@/hooks/usePermissions";
import { clearUserStorage } from "@/utils/clearUserStorage";
import { hasUploadedAlumnos } from "@/utils/alumnosStorage";
import { listarUnidadesByUsuario } from "@/services/unidad.service";
import { getUsuarioById } from "@/services/usuarios.service";
import { getInsigniaDataUrl } from "@/utils/insigniaCache";
import { useUserStore } from "@/store/user.store";

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
    } catch { /* CORS tainted canvas — ignore */ }
  };
  img.onerror = () => { /* CORS blocked load — ignore */ };
  img.src = url;
}

/** Ilustración flat estilo dashboard: docente con libro (tonos indigo/violeta) */
function WelcomeIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Cabeza */}
      <circle cx="100" cy="42" r="24" fill="#C7D2FE" />
      <circle cx="100" cy="40" r="14" fill="#E0E7FF" />
      {/* Torso */}
      <path d="M68 62 L68 108 Q68 118 100 118 Q132 118 132 108 L132 62 Z" fill="#818CF8" />
      <path d="M72 66 L72 104 Q72 112 100 112 Q128 112 128 104 L128 66 Z" fill="#6366F1" />
      {/* Libro */}
      <rect x="82" y="78" width="36" height="28" rx="3" fill="#C7D2FE" stroke="#A5B4FC" strokeWidth="1.5" />
      <line x1="100" y1="78" x2="100" y2="106" stroke="#A5B4FC" strokeWidth="1.2" />
      <circle cx="94" cy="90" r="2" fill="#818CF8" />
      <circle cx="94" cy="98" r="2" fill="#818CF8" />
      {/* Bombilla (idea) */}
      <circle cx="148" cy="38" r="16" fill="#FDE68A" />
      <path d="M142 38 L148 32 L154 38 L148 44 Z" fill="#FCD34D" />
      <path d="M148 50 L148 54 M144 52 L152 52" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
      {/* Formas decorativas */}
      <circle cx="42" cy="85" r="12" fill="#A5B4FC" opacity="0.6" />
      <circle cx="158" cy="75" r="10" fill="#C7D2FE" opacity="0.6" />
    </svg>
  );
}

/** Ilustración pequeña para bloque premium: escudo y estrellas */
function PremiumBlockIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M60 18 L75 28 L75 48 L60 58 L45 48 L45 28 Z"
        fill="#FDE68A"
        stroke="#F59E0B"
        strokeWidth="2"
      />
      <path d="M60 35 L63 42 L70 43 L64 48 L66 55 L60 51 L54 55 L56 48 L50 43 L57 42 Z" fill="#F59E0B" />
      <circle cx="25" cy="70" r="8" fill="#FBCFE8" opacity="0.9" />
      <circle cx="95" cy="75" r="6" fill="#C4B5FD" opacity="0.9" />
      <circle cx="60" cy="88" r="5" fill="#A5B4FC" opacity="0.7" />
    </svg>
  );
}

function Dashboard() {
  const { logout } = useAuth0();
  const { user } = useAuthStore();
  const permissions = usePermissions();
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useGlobalLoading();
  const [showProblematicaModal, setShowProblematicaModal] = useState(false);
  const [showProblematicaIndividual, setShowProblematicaIndividual] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAlumnosModal, setShowAlumnosModal] = useState(false);
  const [alumnosSubidos, setAlumnosSubidos] = useState(() => hasUploadedAlumnos());
  const [showInsigniaModal, setShowInsigniaModal] = useState(false);
  const [insigniaUrl, setInsigniaUrl] = useState<string | null>(null);
  const [hasSuscripcionUnidad, setHasSuscripcionUnidad] = useState(false);
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(false);
  const [totalUnidades, setTotalUnidades] = useState(0);
  const [totalSesiones, setTotalSesiones] = useState(0);
  const [gradoNombre, setGradoNombre] = useState<string | null>(null);
  const [nivelNombre, setNivelNombre] = useState<string | null>(null);
  const [unidadActiva, setUnidadActiva] = useState<{ titulo: string; numero: number } | null>(null);

  useEffect(() => {
    async function cargarDashboard() {
      if (!user) return;
      showLoading("Cargando dashboard...");
      try {
        // Refrescar datos del usuario desde el backend (sesionesUsadas, sesionesRestantes, etc.)
        if (user.id) {
          const res = await getUsuarioById(user.id);
          const freshUser = res.data?.data || res.data;
          if (freshUser) {
            // El endpoint GET /usuario/:id puede devolver los campos en la raíz
            // O anidados dentro de "suscripcion". Intentamos ambos.
            const updatePayload: Partial<Record<string, unknown>> = {};

            const sesUsadas = freshUser.sesionesUsadas ?? freshUser.cantidadSesionesUsadas;
            const sesRestantes = freshUser.sesionesRestantes ?? freshUser.cantidadSesionesRestantes;
            const plan = freshUser.plan ?? freshUser.suscripcion?.plan;
            const suscActiva = freshUser.suscripcionActiva ?? freshUser.suscripcion?.activa;
            const genero = freshUser.genero;
            const nivelId = freshUser.nivelId;
            const gradoId = freshUser.gradoId;

            if (sesUsadas !== undefined) updatePayload.sesionesUsadas = sesUsadas;
            if (sesRestantes !== undefined) updatePayload.sesionesRestantes = sesRestantes;
            if (plan !== undefined) updatePayload.plan = plan;
            if (suscActiva !== undefined) updatePayload.suscripcionActiva = suscActiva;
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
        if (user.id) {
          try {
            const items = await listarUnidadesByUsuario(user.id);
            setTotalUnidades(items.length);
            const tieneSuscripcion = items.some((u) => {
              const miembro = u.miembros?.find((m) => m.usuarioId === user.id);
              return miembro?.rol === "SUSCRIPTOR" && miembro?.estadoPago === "CONFIRMADO";
            });
            setHasSuscripcionUnidad(tieneSuscripcion);
            const sesTotal = items.reduce((sum, u) => sum + (u.sesiones?.length ?? 0), 0);
            setTotalSesiones(sesTotal);
            if (items.length > 0) {
              const sorted = [...items].sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
              setUnidadActiva({ titulo: sorted[0].titulo, numero: sorted[0].numeroUnidad });
              if (!gradoNombre && sorted[0].grado?.nombre) setGradoNombre(sorted[0].grado.nombre);
              if (!nivelNombre && sorted[0].nivel?.nombre) setNivelNombre(sorted[0].nivel.nombre);
            }
          } catch {
            // No se pudieron cargar unidades
          }
        }
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
    cargarDashboard();
  }, [user?.id]);

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
      setShowProblematicaModal(true);
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

  // ─── Cards de funcionalidades ───

  const features = [
    {
      icon: FolderPlus,
      title: "Crear Unidad",
      description: "Crea una Unidad de Aprendizaje con IA",
      color: "from-violet-500 to-purple-600",
      bgLight: "bg-violet-50 dark:bg-violet-500/10",
      iconColor: "text-violet-600 dark:text-violet-400",
      action: handleCrearUnidad,
      premium: true,
    },
    {
      icon: BookOpen,
      title: "Crear Sesión",
      description: "Genera una nueva sesión de aprendizaje con IA",
      color: "from-blue-500 to-indigo-600",
      bgLight: "bg-blue-50 dark:bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
      action: handleCrearSesion,
      premium: false,
    },
    // Sesión Individual — solo premium
    ...(permissions.isPremium
      ? [
          {
            icon: FilePlus2,
            title: "Sesión Individual",
            description: "Crea una sesión suelta, sin necesidad de una unidad",
            color: "from-rose-500 to-pink-600",
            bgLight: "bg-rose-50 dark:bg-rose-500/10",
            iconColor: "text-rose-600 dark:text-rose-400",
            action: () => {
              setShowProblematicaIndividual(true);
            },
            premium: false,
          },
        ]
      : []),
    {
      icon: FileText,
      title: "Mis Sesiones",
      description: "Ver y gestionar tus sesiones creadas",
      color: "from-emerald-500 to-teal-600",
      bgLight: "bg-emerald-50 dark:bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      action: () => {
        showLoading("Cargando sesiones...");
        navigate("/mis-sesiones");
      },
      premium: false,
    },
    {
      icon: FolderOpen,
      title: "Mis Unidades",
      description: "Ver y gestionar tus unidades creadas",
      color: "from-amber-500 to-orange-600",
      bgLight: "bg-amber-50 dark:bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
      action: () => {
        showLoading("Cargando unidades...");
        navigate("/mis-unidades");
      },
      premium: false,
    },
    {
      icon: KeyRound,
      title: "Unirse a Unidad",
      description: "Ingresa un código para unirte a una unidad compartida",
      color: "from-sky-500 to-cyan-600",
      bgLight: "bg-sky-50 dark:bg-sky-500/10",
      iconColor: "text-sky-600 dark:text-sky-400",
      action: () => {
        showLoading("Preparando...");
        navigate("/unirse-unidad");
      },
      premium: false,
    },
    // Fichas de Aplicación — solo premium
    ...(permissions.isPremium
      ? [
          {
            icon: ClipboardList,
            title: "Mis Fichas",
            description: "Ver tus fichas de aplicación generadas",
            color: "from-amber-500 to-orange-600",
            bgLight: "bg-amber-50 dark:bg-amber-500/10",
            iconColor: "text-amber-600 dark:text-amber-400",
            action: () => {
              showLoading("Cargando fichas...");
              navigate("/mis-fichas");
            },
            premium: false,
          },
        ]
      : []),
  ];

  const firstName = user?.name?.split(" ")[0] || "Docente";
  const saludo = user?.genero === "Femenino" ? "Bienvenida" : "Bienvenido";
  const { isPremium, planLabel } = permissions;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">DocentePro</h1>
            <span className={`text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2.5 py-0.5 rounded-full flex-shrink-0 ${
              isPremium
                ? "bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-500/20 dark:to-yellow-500/20 text-amber-700 dark:text-amber-300"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            }`}>
              {planLabel}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                {firstName.charAt(0)}
              </div>
              <span className="font-medium text-slate-700 dark:text-slate-300">{user?.name}</span>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-all"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col">
        {/* Welcome Hero — compact on mobile, full on desktop */}
        <div className="order-1 relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-purple-50/80 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/30 border border-indigo-100/80 dark:border-indigo-800/40 shadow-lg shadow-indigo-100/50 dark:shadow-indigo-950/30 mb-4 sm:mb-8">
          <div className="flex items-center justify-between gap-3 p-4 sm:p-8 md:p-10">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-3xl md:text-4xl font-bold mb-0.5 sm:mb-1.5">
                <span className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800 dark:from-white dark:via-indigo-100 dark:to-slate-300 bg-clip-text text-transparent">
                  ¡{saludo}, {firstName}!
                </span>{" "}
                <span className="inline-block animate-[wave_1.5s_ease-in-out_1]">👋</span>
              </h2>
              <p className="text-xs sm:text-base text-slate-600 dark:text-slate-400">¿Qué te gustaría hacer hoy?</p>
              {unidadActiva && (
                <p className="text-xs sm:text-sm text-indigo-500/80 dark:text-indigo-400/60 mt-1 sm:mt-2 font-medium">
                  Trabajando en: <span className="text-indigo-700 dark:text-indigo-300">Unidad {unidadActiva.numero} — {unidadActiva.titulo}</span>
                </p>
              )}
            </div>
            <div className="hidden sm:block flex-shrink-0 w-44 md:w-52 h-32 md:h-36">
              <WelcomeIllustration className="w-full h-full text-indigo-200 dark:text-indigo-900/50" />
            </div>
          </div>
        </div>

        {/* Features Grid — main actions, first on mobile */}
        <div className="order-2 sm:order-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-5 sm:mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isLocked = feature.premium && !permissions.canCreateUnidad;
            return (
              <button
                key={index}
                onClick={feature.action}
                className="group relative flex items-center sm:flex-col sm:items-start gap-4 sm:gap-0 p-4 sm:p-6 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm hover:shadow-lg transition-all duration-300 text-left overflow-hidden"
              >
                {/* Top accent bar (desktop) */}
                <div className={`hidden sm:block absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                {/* Premium badge */}
                {feature.premium && (
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                    {isLocked ? (
                      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300">
                        <Lock className="w-2.5 h-2.5" />
                        Premium
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                        <Crown className="w-2.5 h-2.5" />
                        Activo
                      </span>
                    )}
                  </div>
                )}

                <div className={`p-3 sm:p-3.5 rounded-xl ${feature.bgLight} flex-shrink-0 sm:mb-4 group-hover:scale-105 transition-transform duration-300`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${feature.iconColor}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
                    {feature.description}
                  </p>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all sm:hidden flex-shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Summary Cards — below actions on mobile, above on desktop */}
        <div className="order-3 sm:order-2 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-8">
          <div className={`flex items-center gap-2 px-3 py-2 sm:py-2.5 rounded-xl border shadow-sm ${
            isPremium
              ? "bg-gradient-to-r from-amber-50 to-orange-50/80 dark:from-amber-950/40 dark:to-orange-950/20 border-amber-200/80 dark:border-amber-600/30"
              : "bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50"
          }`}>
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isPremium ? "bg-gradient-to-br from-amber-400 to-orange-500" : "bg-amber-50 dark:bg-amber-500/10"
            }`}>
              {isPremium ? <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" /> : <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400" />}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium leading-none mb-0.5">Plan</p>
              <p className={`text-xs sm:text-sm font-bold leading-tight truncate ${
                isPremium ? "text-amber-700 dark:text-amber-300" : "text-slate-900 dark:text-white"
              }`}>{planLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 sm:py-2.5 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 shadow-sm">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium leading-none mb-0.5">Grado</p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">{gradoNombre || "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 sm:py-2.5 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 shadow-sm">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium leading-none mb-0.5">Unidades</p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">{totalUnidades}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 sm:py-2.5 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 shadow-sm">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium leading-none mb-0.5">
                {isPremium ? "Sesiones" : "Restantes"}
              </p>
              <p className={`text-xs sm:text-sm font-bold leading-tight ${isPremium ? "text-slate-900 dark:text-white" : "text-emerald-600 dark:text-emerald-400"}`}>
                {isPremium ? totalSesiones : (user?.sesionesRestantes ?? 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Premium Tools — below actions on mobile, above on desktop */}
        {isPremium && (
          <div className="order-4 sm:order-3 relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-amber-50/90 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-amber-950/30 border border-amber-200/80 dark:border-amber-700/40 shadow-lg shadow-amber-200/30 dark:shadow-amber-950/30 mb-5 sm:mb-8">
            <div className="absolute top-0 right-0 w-28 sm:w-36 h-24 sm:h-28 opacity-90 pointer-events-none">
              <PremiumBlockIllustration className="w-full h-full" />
            </div>
            <div className="relative p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">
                  <Crown className="w-3.5 h-3.5" />
                  Herramientas premium
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <button
                  onClick={() => setShowAlumnosModal(true)}
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-slate-800/50 border border-blue-200/80 dark:border-blue-600/30 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-200 text-left group"
                >
                  <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25 flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                      {alumnosSubidos ? "Modificar lista de alumnos" : "Subir lista de alumnos"}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 hidden sm:block">
                      {alumnosSubidos
                        ? "Actualiza o reemplaza tu nómina"
                        : "Sube tu nómina para los instrumentos de evaluación"}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-blue-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </button>

                <button
                  onClick={() => setShowInsigniaModal(true)}
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-slate-800/50 border border-purple-200/80 dark:border-purple-600/30 shadow-sm hover:shadow-md hover:border-purple-300 dark:hover:border-purple-500/50 transition-all duration-200 text-left group"
                >
                  <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/25 flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                    {insigniaUrl ? (
                      <img src={insigniaUrl} alt="Insignia" className="w-4 h-4 sm:w-5 sm:h-5 object-contain rounded" />
                    ) : (
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                      {insigniaUrl ? "Cambiar insignia" : "Subir insignia del colegio"}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 hidden sm:block">
                      {insigniaUrl
                        ? "Actualiza la insignia de tu institución"
                        : "Se mostrará en tus documentos generados"}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-purple-400 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TODO: Actividad Reciente — descomentar cuando haya servicio de actividad */}
        {/* <div className="rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-700/50">
            <h3 className="font-semibold text-slate-900 dark:text-white">Actividad Reciente</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Tus últimas sesiones y actividades</p>
          </div>
          <div className="px-4 sm:px-6 py-10 sm:py-12 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Aún no has creado ninguna sesión</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Comienza creando tu primera sesión de aprendizaje</p>
          </div>
        </div> */}
      </main>

      {/* Modal de Problemática */}
      <ProblematicaModal
        isOpen={showProblematicaModal}
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
          setAlumnosSubidos(hasUploadedAlumnos());
        }}
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
      />
    </div>
  );
}

export default Dashboard;
