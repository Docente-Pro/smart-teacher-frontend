import { useState } from "react";
import { useNavigate } from "react-router";
import { PricingCard } from "@/components/Pricing/PricingCard";
import { SubscriptionBadge } from "@/components/Pricing/SubscriptionBadge";
import { useAuth0 } from "@/hooks/useAuth0";
import { useSubscription } from "@/hooks/useSubscription";
import { crearPreferenciaPago } from "@/services/pago.service";
import { IPlan } from "@/interfaces/ISuscripcion";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const PLANES: IPlan[] = [
  {
    id: 'free',
    name: 'Plan Gratuito',
    price: 0,
    period: 'Prueba',
    badge: 'Actual',
    badgeColor: 'primary',
    isFree: true,
    features: [
      { text: '2 sesiones de prueba (únicas, por vida)', included: true },
      { text: 'Acceso a funcionalidades básicas', included: true },
      { text: 'Asistente IA avanzado', included: false },
      { text: 'Exportar a PDF', included: false },
      { text: 'Soporte prioritario', included: false },
    ],
  },
  {
    id: 'premium_mensual',
    name: 'Premium Mensual',
    price: 29.90,
    period: 'mes',
    badge: 'Más Popular',
    badgeColor: 'warning',
    isPopular: true,
    features: [
      { text: 'Sesiones ilimitadas', included: true },
      { text: 'Programaciones ilimitadas', included: true },
      { text: 'Asistente IA avanzado', included: true },
      { text: 'Exportar a PDF', included: true },
      { text: 'Plantillas premium', included: true },
      { text: 'Soporte prioritario', included: true },
    ],
  },
  {
    id: 'premium_anual',
    name: 'Premium Anual',
    price: 299.00,
    period: 'año',
    badge: 'Mejor Valor',
    badgeColor: 'success',
    savings: '¡Ahorra S/ 60! (2 meses gratis)',
    features: [
      { text: 'Todo de Premium Mensual', included: true },
      { text: '2 meses gratis incluidos', included: true },
      { text: 'Acceso anticipado a nuevas funciones', included: true },
      { text: 'Descuentos exclusivos', included: true },
    ],
  },
];

export default function PlanesPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth0();
  const userId = (user as any)?.sub || null;
  
  const { plan: currentPlan, isLoading: loadingSubscription } = useSubscription(userId);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    // Validar autenticación
    if (!isAuthenticated || !userId) {
      toast.error('Debes iniciar sesión para suscribirte');
      navigate('/login');
      return;
    }

    // No permitir seleccionar plan gratuito
    if (planId === 'free') {
      return;
    }

    // No permitir seleccionar el plan actual
    if (planId === currentPlan) {
      toast.info('Ya tienes este plan activo');
      return;
    }

    try {
      setLoadingPlanId(planId);

      // Crear preferencia de pago
      const response = await crearPreferenciaPago({
        usuarioId: userId,
        planId: planId as 'premium_mensual' | 'premium_anual',
      });

      // Determinar URL de checkout (desarrollo vs producción)
      const isDevelopment = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
      
      const checkoutUrl = isDevelopment && response.data.sandboxCheckoutUrl
        ? response.data.sandboxCheckoutUrl
        : response.data.checkoutUrl;

      // Redirigir a Mercado Pago
      window.location.href = checkoutUrl;

    } catch (error: any) {
      console.error('Error al procesar pago:', error);
      toast.error(error.message || 'Error al procesar el pago. Intenta nuevamente.');
      setLoadingPlanId(null);
    }
  };

  if (loadingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dp-bg-secondary">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-dp-blue-500 mx-auto mb-4" />
          <p className="text-dp-text-secondary">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dp-bg-secondary via-white to-dp-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-dp-text-title mb-4">
            Elige tu Plan Perfecto
          </h1>
          <p className="text-lg text-dp-text-secondary max-w-2xl mx-auto">
            Desbloquea todo el potencial de DocentePro con nuestros planes premium
          </p>
          
          {isAuthenticated && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <span className="text-sm text-dp-text-secondary">Plan actual:</span>
              <SubscriptionBadge plan={currentPlan} />
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PLANES.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              currentPlan={currentPlan}
              onSelectPlan={handleSelectPlan}
              isLoading={loadingPlanId === plan.id}
            />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-dp-text-title text-center mb-8">
            Preguntas Frecuentes
          </h2>
          
          <div className="space-y-4">
            <details className="bg-white rounded-lg p-4 border border-dp-border-light">
              <summary className="font-semibold text-dp-text-title cursor-pointer">
                ¿Puedo cancelar mi suscripción en cualquier momento?
              </summary>
              <p className="text-dp-text-secondary mt-2 text-sm">
                Sí, puedes cancelar tu suscripción cuando quieras. Seguirás teniendo acceso 
                hasta el final de tu período de facturación.
              </p>
            </details>

            <details className="bg-white rounded-lg p-4 border border-dp-border-light">
              <summary className="font-semibold text-dp-text-title cursor-pointer">
                ¿Qué pasa después de usar mis 2 sesiones gratuitas?
              </summary>
              <p className="text-dp-text-secondary mt-2 text-sm">
                Las 2 sesiones gratuitas son únicas por vida. Después de usarlas, necesitarás 
                actualizar a un plan Premium para continuar creando sesiones.
              </p>
            </details>

            <details className="bg-white rounded-lg p-4 border border-dp-border-light">
              <summary className="font-semibold text-dp-text-title cursor-pointer">
                ¿El plan anual se renueva automáticamente?
              </summary>
              <p className="text-dp-text-secondary mt-2 text-sm">
                Sí, tanto el plan mensual como el anual se renuevan automáticamente. 
                Puedes cancelar en cualquier momento desde tu perfil.
              </p>
            </details>

            <details className="bg-white rounded-lg p-4 border border-dp-border-light">
              <summary className="font-semibold text-dp-text-title cursor-pointer">
                ¿Qué métodos de pago aceptan?
              </summary>
              <p className="text-dp-text-secondary mt-2 text-sm">
                Aceptamos tarjetas de crédito, débito, y otros métodos de pago disponibles 
                en Mercado Pago (Yape, transferencias bancarias, etc.).
              </p>
            </details>
          </div>
        </div>

        {/* CTA Bottom */}
        <div className="mt-16 text-center">
          <p className="text-dp-text-secondary mb-4">
            ¿Necesitas ayuda para elegir el plan adecuado?
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-dp-blue-500 hover:text-dp-blue-600 font-medium underline"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
