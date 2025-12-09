import { useNavigate } from "react-router";
import { useAuth0 } from "@/hooks/useAuth0";
import { useSubscription } from "@/hooks/useSubscription";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

/**
 * Guard que protege rutas/componentes que requieren suscripción Premium
 * 
 * Ejemplo de uso:
 * 
 * <PremiumGuard feature="Exportar a PDF">
 *   <ExportPDFButton />
 * </PremiumGuard>
 */
interface PremiumGuardProps {
  children: React.ReactNode;
  feature?: string;
  fallback?: React.ReactNode;
}

export const PremiumGuard = ({ 
  children, 
  feature = "esta función",
  fallback 
}: PremiumGuardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth0();
  const userId = (user as any)?.sub || null;
  const { isPremium, isLoading } = useSubscription(userId);

  if (isLoading) {
    return (
      <div className="animate-pulse bg-dp-gray-200 rounded-md h-10 w-full" />
    );
  }

  // Si el usuario es Premium, mostrar el contenido protegido
  if (isPremium) {
    return <>{children}</>;
  }

  // Si no es Premium, mostrar fallback o mensaje de upgrade
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card className="p-4 border-2 border-dp-orange-200 bg-gradient-to-br from-white to-dp-orange-50">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-dp-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-dp-orange-500" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-dp-text-title mb-1">
            Función Premium
          </h4>
          <p className="text-sm text-dp-text-secondary mb-3">
            {feature} está disponible solo para usuarios Premium
          </p>
          <Button
            onClick={() => navigate('/planes')}
            className="bg-dp-orange-500 hover:bg-dp-orange-600 text-white"
            size="sm"
          >
            Actualizar a Premium
          </Button>
        </div>
      </div>
    </Card>
  );
};

/**
 * Hook para verificar si una función requiere Premium
 * 
 * Ejemplo de uso:
 * 
 * const { canUseFeature, showUpgradePrompt } = usePremiumFeature();
 * 
 * if (!canUseFeature) {
 *   showUpgradePrompt('Exportar PDF');
 *   return;
 * }
 */
export const usePremiumFeature = () => {
  const navigate = useNavigate();
  const { user } = useAuth0();
  const userId = (user as any)?.sub || null;
  const { isPremium } = useSubscription(userId);

  const showUpgradePrompt = (feature: string) => {
    // Puedes mostrar un toast o redirigir a /planes
    navigate('/planes', { 
      state: { 
        message: `${feature} requiere suscripción Premium` 
      } 
    });
  };

  return {
    canUseFeature: isPremium,
    isPremium,
    showUpgradePrompt,
  };
};
