import { useNavigate } from "react-router";
import { XCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PagoFallidoPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-dp-error-50 via-white to-dp-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8 text-center shadow-2xl border-2 border-dp-error-200">
        {/* Icono de error */}
        <div className="mb-6">
          <div className="w-24 h-24 bg-dp-error-100 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-16 h-16 text-dp-error-500" strokeWidth={2.5} />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-4xl font-extrabold text-dp-text-title mb-3">
          Pago Rechazado
        </h1>

        {/* Mensaje */}
        <p className="text-lg text-dp-text-body mb-2">
          No pudimos procesar tu pago
        </p>

        <p className="text-sm text-dp-text-secondary mb-8">
          Por favor verifica los datos de tu tarjeta e intenta nuevamente
        </p>

        {/* Razones comunes */}
        <div className="bg-dp-bg-secondary rounded-lg p-4 mb-8 text-left">
          <h3 className="font-semibold text-dp-text-title mb-3 text-sm">
            Razones comunes del rechazo:
          </h3>
          <ul className="space-y-2 text-xs text-dp-text-secondary">
            <li className="flex items-start">
              <span className="text-dp-error-500 mr-2">•</span>
              Fondos insuficientes en la tarjeta
            </li>
            <li className="flex items-start">
              <span className="text-dp-error-500 mr-2">•</span>
              Datos de la tarjeta incorrectos
            </li>
            <li className="flex items-start">
              <span className="text-dp-error-500 mr-2">•</span>
              La tarjeta está vencida o bloqueada
            </li>
            <li className="flex items-start">
              <span className="text-dp-error-500 mr-2">•</span>
              Límite de compras online excedido
            </li>
          </ul>
        </div>

        {/* Botones */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate('/planes')}
            className="w-full bg-dp-orange-500 hover:bg-dp-orange-600 text-white font-semibold"
            size="lg"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Reintentar Pago
          </Button>

          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="w-full border-dp-border-medium hover:bg-dp-bg-hover"
            size="lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Volver al Dashboard
          </Button>
        </div>

        {/* Ayuda */}
        <div className="mt-6 pt-6 border-t border-dp-border-light">
          <p className="text-xs text-dp-text-tertiary">
            ¿Necesitas ayuda?{' '}
            <a 
              href="mailto:soporte@docentepro.com" 
              className="text-dp-blue-500 hover:text-dp-blue-600 underline"
            >
              Contáctanos
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
