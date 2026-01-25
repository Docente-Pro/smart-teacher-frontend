// ============================================
// EJEMPLOS DE INTEGRACIÓN - SISTEMA DE PAGOS
// DocentePro - Mercado Pago
// ============================================

// ===========================================
// 1. EJEMPLO: Botón de Crear Sesión con Límite
// ===========================================
import { Route, Routes } from "react-router-dom";
import { CreateSessionButton } from "@/components/Pricing/CreateSessionButton";
import PagoExitoso from "@/pages/PagoExitoso";

function Dashboard() {
  return (
    <div className="p-6">
      <h1>Dashboard</h1>
      
      {/* Botón inteligente que muestra:
          - Contador de sesiones para usuarios Free
          - Botón habilitado si puede crear sesión
          - Prompt de upgrade si agotó sesiones */}
      <CreateSessionButton />
    </div>
  );
}

// ===========================================
// 2. EJEMPLO: Proteger Función Premium (Exportar PDF)
// ===========================================
import { PremiumGuard } from "@/components/Pricing/PremiumGuard";

function ExportButton() {
  const handleExport = () => {
    // Lógica de exportar PDF
  };

  return (
    <PremiumGuard feature="Exportar a PDF">
      <button onClick={handleExport}>
        📄 Exportar PDF
      </button>
    </PremiumGuard>
  );
  
  // Si el usuario NO es Premium, muestra automáticamente:
  // - Mensaje: "Exportar a PDF está disponible solo para usuarios Premium"
  // - Botón: "Actualizar a Premium"
}

// ===========================================
// 3. EJEMPLO: Verificar Plan Antes de Acción
// ===========================================
import { useAuth0 } from "@/hooks/useAuth0";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router";

function AdvancedFeature() {
  const navigate = useNavigate();
  const { user } = useAuth0();
  const userId = (user as any)?.sub;
  
  const { isPremium, canCreateSession, sessionsUsed, sessionsLimit } = useSubscription(userId);

  const handleAction = () => {
    // Verificar si es Premium antes de ejecutar acción
    if (!isPremium) {
      navigate('/planes', { 
        state: { message: 'Esta función requiere Premium' } 
      });
      return;
    }

    // Ejecutar acción
    console.log('Acción ejecutada');
  };

  return (
    <div>
      {isPremium ? (
        <button onClick={handleAction}>Función Avanzada</button>
      ) : (
        <button onClick={() => navigate('/planes')}>
          🔒 Actualizar a Premium
        </button>
      )}
      
      {!isPremium && (
        <p>Has usado {sessionsUsed} de {sessionsLimit} sesiones gratuitas</p>
      )}
    </div>
  );
}

// ===========================================
// 4. EJEMPLO: Mostrar Badge de Plan en Perfil
// ===========================================
import { SubscriptionBadge } from "@/components/Pricing/SubscriptionBadge";

function UserProfile() {
  const { user } = useAuth0();
  const userId = (user as any)?.sub;
  const { plan } = useSubscription(userId);

  return (
    <div>
      <h2>Perfil de Usuario</h2>
      <SubscriptionBadge plan={plan} />
      {/* Muestra: "Plan Gratuito", "Premium Mensual" o "Premium Anual" */}
    </div>
  );
}

// ===========================================
// 5. EJEMPLO: Redirigir a Planes desde Link
// ===========================================
import { useNavigate } from "react-router";

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav>
      <button onClick={() => navigate('/planes')}>
        💎 Ver Planes
      </button>
    </nav>
  );
}

// ===========================================
// 6. EJEMPLO: Mostrar Historial de Pagos
// ===========================================
import { PaymentHistory } from "@/components/Pricing/PaymentHistory";

function ProfilePage() {
  return (
    <div className="space-y-6">
      <h1>Mi Perfil</h1>
      
      {/* Tabs o secciones */}
      <div>
        <h2>Historial de Pagos</h2>
        <PaymentHistory />
      </div>
    </div>
  );
}

// ===========================================
// 7. EJEMPLO: Custom Hook para Features Premium
// ===========================================
import { usePremiumFeature } from "@/components/Pricing/PremiumGuard";

function AIAssistant() {
  const { canUseFeature, showUpgradePrompt } = usePremiumFeature();

  const handleUseAI = () => {
    if (!canUseFeature) {
      showUpgradePrompt('Asistente IA Avanzado');
      return;
    }

    // Usar IA
    console.log('Usando IA...');
  };

  return (
    <button onClick={handleUseAI}>
      🤖 Usar IA
    </button>
  );
}

// ===========================================
// 8. EJEMPLO: Contador de Sesiones Simple
// ===========================================
import { SessionCounter } from "@/components/Pricing/SessionCounter";

function SessionsPage() {
  const { user } = useAuth0();
  const userId = (user as any)?.sub;
  const { sessionsUsed, sessionsLimit, isPremium } = useSubscription(userId);

  return (
    <div>
      <SessionCounter
        sessionsUsed={sessionsUsed}
        sessionsLimit={sessionsLimit}
        isPremium={isPremium}
      />
      {/* Muestra barra de progreso y sesiones restantes */}
    </div>
  );
}

// ===========================================
// 9. EJEMPLO: Verificar Suscripción al Montar Componente
// ===========================================
function ProtectedComponent() {
  const { user } = useAuth0();
  const userId = (user as any)?.sub;
  const { isPremium, isLoading, error, refetch } = useSubscription(userId);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isPremium) {
      // Redirigir si no es Premium
      navigate('/planes');
    }
  }, [isPremium, isLoading, navigate]);

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!isPremium) return null;

  return <div>Contenido Premium</div>;
}

// ===========================================
// 10. EJEMPLO: Re-fetch Suscripción Después de Pago
// ===========================================
function PaymentSuccessHandler() {
  const { user } = useAuth0();
  const userId = (user as any)?.sub;
  const { refetch } = useSubscription(userId);

  useEffect(() => {
    // Cuando el usuario vuelve de Mercado Pago,
    // refrescar la suscripción automáticamente
    refetch();
  }, [refetch]);

  return <div>Verificando suscripción...</div>;
}

// ===========================================
// 11. EJEMPLO: Banner de Upgrade (cuando le queda 1 sesión)
// ===========================================
import { UpgradePrompt } from "@/components/Pricing/UpgradePrompt";

function DashboardWithBanner() {
  const { user } = useAuth0();
  const userId = (user as any)?.sub;
  const navigate = useNavigate();
  const { 
    isPremium, 
    sessionsUsed, 
    sessionsLimit, 
    canCreateSession 
  } = useSubscription(userId);

  const showBanner = !isPremium && 
                     canCreateSession && 
                     sessionsUsed === sessionsLimit - 1;

  return (
    <div>
      {showBanner && (
        <UpgradePrompt
          message="Esta es tu última sesión gratuita"
          sessionsUsed={sessionsUsed}
          sessionsLimit={sessionsLimit}
          onUpgrade={() => navigate('/planes')}
          variant="banner"
        />
      )}

      <div>Dashboard content...</div>
    </div>
  );
}

// ===========================================
// 12. EJEMPLO: Redirect URLs de Mercado Pago
// ===========================================
/*
Configurar en Mercado Pago Dashboard:

Success URL: https://docentepro.com/pago-exitoso
Failure URL: https://docentepro.com/pago-fallido
Pending URL: https://docentepro.com/pago-pendiente

En desarrollo (localhost):
Success URL: http://localhost:5173/pago-exitoso
Failure URL: http://localhost:5173/pago-fallido
Pending URL: http://localhost:5173/pago-pendiente
*/

// ===========================================
// 13. EJEMPLO: Middleware de Verificación en Ruta
// ===========================================
import RouteProtector from "@/auth/RouteProtector";

function App() {
  return (
    <Routes>
      <Route path="/planes" element={
        <RouteProtector>
          <Planes />
        </RouteProtector>
      } />
      
      <Route path="/pago-exitoso" element={
        <RouteProtector>
          <PagoExitoso />
        </RouteProtector>
      } />
    </Routes>
  );
}

export default App;
