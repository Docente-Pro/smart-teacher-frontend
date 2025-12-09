import { useEffect } from "react";
import { useNavigate } from "react-router";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth0 } from "@/hooks/useAuth0";
import { useSubscription } from "@/hooks/useSubscription";

export default function PagoExitosoPage() {
  const navigate = useNavigate();
  const { user } = useAuth0();
  const userId = (user as any)?.sub || null;
  const { refetch } = useSubscription(userId);

  useEffect(() => {
    // Refrescar estado de suscripción al cargar la página
    // El webhook ya actualizó la DB, solo necesitamos refrescar el estado local
    if (userId) {
      refetch();
    }

    // Opcional: Confetti animation
    // Puedes instalar 'canvas-confetti' con: npm install canvas-confetti
    // import confetti from 'canvas-confetti';
    // confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

  }, [userId, refetch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dp-success-50 via-white to-dp-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8 text-center shadow-2xl border-2 border-dp-success-200">
        {/* Icono de éxito animado */}
        <div className="mb-6 relative">
          <div className="w-24 h-24 bg-dp-success-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle2 className="w-16 h-16 text-dp-success-500" strokeWidth={2.5} />
          </div>
          <div className="absolute -top-4 -right-4">
            <Sparkles className="w-8 h-8 text-dp-orange-500 animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -left-4">
            <Sparkles className="w-6 h-6 text-dp-blue-500 animate-pulse" />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-4xl font-extrabold text-dp-text-title mb-3">
          ¡Pago Exitoso! 🎉
        </h1>

        {/* Mensaje */}
        <p className="text-lg text-dp-text-body mb-2">
          Tu suscripción <span className="font-semibold text-dp-success-600">Premium</span> ha sido activada correctamente
        </p>

        <p className="text-sm text-dp-text-secondary mb-8">
          Ya puedes disfrutar de todas las funciones premium de DocentePro
        </p>

        {/* Beneficios desbloqueados */}
        <div className="bg-dp-bg-secondary rounded-lg p-4 mb-8 text-left">
          <h3 className="font-semibold text-dp-text-title mb-3 text-center">
            Funciones Desbloqueadas:
          </h3>
          <ul className="space-y-2 text-sm text-dp-text-body">
            <li className="flex items-center">
              <CheckCircle2 className="w-4 h-4 text-dp-success-500 mr-2 flex-shrink-0" />
              Sesiones ilimitadas
            </li>
            <li className="flex items-center">
              <CheckCircle2 className="w-4 h-4 text-dp-success-500 mr-2 flex-shrink-0" />
              Asistente IA avanzado
            </li>
            <li className="flex items-center">
              <CheckCircle2 className="w-4 h-4 text-dp-success-500 mr-2 flex-shrink-0" />
              Exportar a PDF
            </li>
            <li className="flex items-center">
              <CheckCircle2 className="w-4 h-4 text-dp-success-500 mr-2 flex-shrink-0" />
              Plantillas premium
            </li>
            <li className="flex items-center">
              <CheckCircle2 className="w-4 h-4 text-dp-success-500 mr-2 flex-shrink-0" />
              Soporte prioritario
            </li>
          </ul>
        </div>

        {/* Botón principal */}
        <Button
          onClick={() => navigate('/dashboard')}
          className="w-full bg-dp-orange-500 hover:bg-dp-orange-600 text-white font-semibold text-lg py-6"
          size="lg"
        >
          Ir al Dashboard
        </Button>

        {/* Email de confirmación */}
        <p className="text-xs text-dp-text-tertiary mt-4">
          Recibirás un email de confirmación con los detalles de tu suscripción
        </p>
      </Card>
    </div>
  );
}
