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
} from "lucide-react";
import { useEffect, useState } from "react";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuthStore } from "@/store/auth.store";
import ProblematicaModal from "@/components/Shared/Modal/ProblematicaModal";
import UpgradePremiumModal from "@/components/Shared/Modal/UpgradePremiumModal";
import SubirAlumnosModal from "@/components/Shared/Modal/SubirAlumnosModal";
import WelcomeGuideModal, { hasSeenWelcomeGuide } from "@/components/Shared/Modal/WelcomeGuideModal";
import { usePermissions } from "@/hooks/usePermissions";
import { clearUserStorage } from "@/utils/clearUserStorage";
import { hasUploadedAlumnos } from "@/utils/alumnosStorage";
import { listarUnidadesByUsuario } from "@/services/unidad.service";
import { getUsuarioById } from "@/services/usuarios.service";

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
  const [hasSuscripcionUnidad, setHasSuscripcionUnidad] = useState(false);
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(false);

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

            if (Object.keys(updatePayload).length > 0) {
              useAuthStore.getState().updateUser(updatePayload);
            } else {
            }
          }
        }

        // Verificar si el usuario es suscriptor de alguna unidad con pago confirmado
        if (user.id) {
          try {
            const items = await listarUnidadesByUsuario(user.id);
            const tieneSuscripcion = items.some((u) => {
              const miembro = u.miembros?.find((m) => m.usuarioId === user.id);
              return miembro?.rol === "SUSCRIPTOR" && miembro?.estadoPago === "CONFIRMADO";
            });
            setHasSuscripcionUnidad(tieneSuscripcion);
          } catch (e) {
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
    navigate("/crear-unidad");
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Welcome Section */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-slate-500 dark:text-slate-400">¡Hola de nuevo!</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">
            <span className="bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">¡{saludo}, {firstName}!</span>{" "}
            <span className="inline-block animate-[wave_1.5s_ease-in-out_1]">👋</span>
          </h2>
          <p className="text-sm sm:text-lg text-slate-500 dark:text-slate-400">¿Qué te gustaría hacer hoy?</p>
        </div>

        {/* Stats row (mobile-friendly) */}
        <div className={`grid gap-3 sm:gap-4 mb-8 sm:mb-10 ${isPremium ? 'grid-cols-1 max-w-xs' : 'grid-cols-2 sm:grid-cols-3'}`}>
          {/* Usadas y Restantes solo se muestran para usuarios FREE (premium no tiene límite) */}
          {!isPremium && (
            <>
              <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 shadow-sm">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">Usadas</p>
                  <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{user?.sesionesUsadas ?? 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 shadow-sm">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">Restantes</p>
                  <p className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">{user?.sesionesRestantes ?? 0}</p>
                </div>
              </div>
            </>
          )}
          <div className={`${!isPremium ? 'col-span-2 sm:col-span-1' : ''} flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 shadow-sm`}>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10">
              <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">Plan</p>
              <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{planLabel}</p>
            </div>
          </div>
        </div>

        {/* Banner: Subir / modificar lista de alumnos (premium) */}
        {isPremium && (
          <button
            onClick={() => setShowAlumnosModal(true)}
            className="w-full mb-6 sm:mb-8 flex items-center gap-4 p-4 sm:p-5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 border border-blue-200 dark:border-blue-700/50 hover:border-blue-300 dark:hover:border-blue-600 shadow-sm hover:shadow-md transition-all text-left group"
          >
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 flex-shrink-0 group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
                {alumnosSubidos ? "Modificar lista de alumnos" : "Sube tu lista de alumnos"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {alumnosSubidos
                  ? "Actualiza o reemplaza tu nómina para los instrumentos de evaluación"
                  : "Sube una foto de tu nómina y la extraeremos con IA para tus instrumentos de evaluación"}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </button>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-8 sm:mb-12">
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

      {/* Modal guía de bienvenida (una sola vez para usuarios free) */}
      <WelcomeGuideModal
        isOpen={showWelcomeGuide}
        onClose={() => setShowWelcomeGuide(false)}
      />
    </div>
  );
}

export default Dashboard;
