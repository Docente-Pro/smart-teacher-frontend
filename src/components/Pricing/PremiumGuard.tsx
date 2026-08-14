import { useAuth0 } from "@/hooks/useAuth0";
import { useSubscription } from "@/hooks/useSubscription";
import { usePaymentSocket } from "@/hooks/usePaymentSocket";
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { dpCtaPrimary } from "@/styles/dpTokens";

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
  const { user } = useAuth0();
  const userId = (user as any)?.sub || null;
  const { isPremium, isLoading } = useSubscription(userId);
  const { startPaymentFlow } = usePaymentSocket();

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
    <Card className="rounded-[20px] border border-[#E6EBF2] bg-white p-4 shadow-[0_8px_28px_rgba(31,41,55,0.05)]">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[16px] bg-[#FFF7ED] text-[#C2410C]">
          <AlertTriangle className="h-5 w-5" strokeWidth={2} aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-extrabold text-[#1F2937] mb-1">
            Función Premium
          </h4>
          <p className="text-base font-semibold text-[#6B7280] mb-3">
            {feature} está disponible solo para usuarios Premium
          </p>
          <button
            type="button"
            onClick={() => startPaymentFlow()}
            className={`${dpCtaPrimary} text-sm min-h-11 px-4`}
          >
            Actualizar a Premium
          </button>
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
  const { user } = useAuth0();
  const userId = (user as any)?.sub || null;
  const { isPremium } = useSubscription(userId);
  const { startPaymentFlow } = usePaymentSocket();

  const showUpgradePrompt = (_feature: string) => {
    startPaymentFlow();
  };

  return {
    canUseFeature: isPremium,
    isPremium,
    showUpgradePrompt,
  };
};
