import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { UpgradePrompt } from "@/components/Pricing/UpgradePrompt";
import { SessionCounter } from "@/components/Pricing/SessionCounter";
import { SubscriptionBadge } from "@/components/Pricing/SubscriptionBadge";
import { useAuth0 } from "@/hooks/useAuth0";
import { useSubscription } from "@/hooks/useSubscription";
import { PlusCircle, Lock } from "lucide-react";

/**
 * Componente de ejemplo que muestra cómo integrar el contador de sesiones
 * y protección Premium en el botón de crear sesión.
 * 
 * Integra este componente en tu Dashboard o página de sesiones.
 */
export const CreateSessionButton = () => {
  const navigate = useNavigate();
  const { user } = useAuth0();
  const userId = (user as any)?.sub || null;
  
  const { 
    canCreateSession, 
    sessionsUsed, 
    sessionsLimit, 
    isPremium,
    plan,
    isLoading 
  } = useSubscription(userId);

  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const handleCreateSession = () => {
    if (!canCreateSession) {
      // Mostrar prompt de upgrade si no puede crear más sesiones
      setShowUpgradePrompt(true);
      return;
    }

    // Navegar al cuestionario de creación de sesión
    navigate('/crear-sesion');
  };

  if (isLoading) {
    return (
      <Button disabled className="w-full md:w-auto">
        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
        Cargando...
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Badge de plan actual */}
      <div className="flex items-center justify-between">
        <SubscriptionBadge plan={plan} />
        <Button
          variant="link"
          size="sm"
          onClick={() => navigate('/planes')}
          className="text-dp-blue-500 hover:text-dp-blue-600"
        >
          Ver planes
        </Button>
      </div>

      {/* Contador de sesiones (solo para usuarios Free) */}
      {!isPremium && (
        <SessionCounter
          sessionsUsed={sessionsUsed}
          sessionsLimit={sessionsLimit}
          isPremium={isPremium}
        />
      )}

      {/* Botón de crear sesión */}
      {canCreateSession ? (
        <Button
          onClick={handleCreateSession}
          className="w-full bg-dp-orange-500 hover:bg-dp-orange-600 text-white font-semibold"
          size="lg"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Nueva Sesión
        </Button>
      ) : (
        <Button
          onClick={() => setShowUpgradePrompt(true)}
          variant="outline"
          className="w-full border-dp-orange-300 text-dp-orange-600 hover:bg-dp-orange-50"
          size="lg"
        >
          <Lock className="w-5 h-5 mr-2" />
          Crear Sesión (Premium)
        </Button>
      )}

      {/* Upgrade Prompt (modal/card) */}
      {showUpgradePrompt && !canCreateSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full">
            <UpgradePrompt
              message={`Has usado tus ${sessionsLimit} sesiones gratuitas`}
              sessionsUsed={sessionsUsed}
              sessionsLimit={sessionsLimit}
              onUpgrade={() => navigate('/planes')}
              variant="card"
            />
            <Button
              onClick={() => setShowUpgradePrompt(false)}
              variant="ghost"
              className="w-full mt-4 text-white hover:text-white hover:bg-white/10"
            >
              Cerrar
            </Button>
          </div>
        </div>
      )}

      {/* Banner de advertencia (cuando le queda 1 sesión) */}
      {!isPremium && canCreateSession && sessionsUsed === sessionsLimit - 1 && (
        <div className="mt-4">
          <UpgradePrompt
            message="Esta es tu última sesión gratuita"
            sessionsUsed={sessionsUsed}
            sessionsLimit={sessionsLimit}
            onUpgrade={() => navigate('/planes')}
            variant="banner"
          />
        </div>
      )}
    </div>
  );
};
