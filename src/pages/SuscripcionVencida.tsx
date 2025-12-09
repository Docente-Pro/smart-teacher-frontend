import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, CreditCard } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

/**
 * Página que se muestra cuando la suscripción Premium ha vencido
 */
export default function SuscripcionVencidaPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const userData = user as any;

  const planName = userData?.plan === 'premium_mensual' ? 'Premium Mensual' : 'Premium Anual';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8 text-center shadow-2xl border-2 border-orange-200">
        {/* Icono de advertencia */}
        <div className="mb-6">
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-16 h-16 text-orange-500" strokeWidth={2.5} />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
          Suscripción Vencida
        </h1>

        {/* Mensaje */}
        <p className="text-lg text-gray-700 mb-2">
          Tu plan <span className="font-semibold text-orange-600">{planName}</span> ha vencido
        </p>

        <p className="text-sm text-gray-600 mb-8">
          Renueva tu suscripción para seguir disfrutando de todas las funciones premium
        </p>

        {/* Funcionalidades perdidas */}
        <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">
            Sin suscripción activa no puedes:
          </h3>
          <ul className="space-y-2 text-xs text-gray-700">
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">✕</span>
              Crear sesiones ilimitadas
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">✕</span>
              Usar asistente IA avanzado
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">✕</span>
              Exportar a PDF
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">✕</span>
              Acceder a plantillas premium
            </li>
          </ul>
        </div>

        {/* Botones */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate('/planes')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
            size="lg"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Renovar Suscripción
          </Button>

          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="w-full border-gray-300 hover:bg-gray-50"
            size="lg"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Ir al Dashboard (Modo Limitado)
          </Button>
        </div>

        {/* Ayuda */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            ¿Problemas con tu suscripción?{' '}
            <a 
              href="mailto:soporte@docentepro.com" 
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Contáctanos
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
