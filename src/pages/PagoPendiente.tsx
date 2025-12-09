import { useNavigate } from "react-router";
import { Clock, Mail, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PagoPendientePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-dp-warning-50 via-white to-dp-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8 text-center shadow-2xl border-2 border-dp-warning-200">
        {/* Icono de pendiente */}
        <div className="mb-6">
          <div className="w-24 h-24 bg-dp-warning-100 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-16 h-16 text-dp-warning-500 animate-pulse" strokeWidth={2.5} />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-4xl font-extrabold text-dp-text-title mb-3">
          Pago en Proceso ⏳
        </h1>

        {/* Mensaje */}
        <p className="text-lg text-dp-text-body mb-2">
          Tu pago está siendo verificado
        </p>

        <p className="text-sm text-dp-text-secondary mb-8">
          Te notificaremos por email cuando se confirme (puede tardar hasta 48 horas)
        </p>

        {/* Información adicional */}
        <div className="bg-dp-bg-secondary rounded-lg p-4 mb-8 text-left">
          <h3 className="font-semibold text-dp-text-title mb-3 text-sm flex items-center">
            <Mail className="w-4 h-4 mr-2 text-dp-warning-500" />
            ¿Qué sigue?
          </h3>
          <ul className="space-y-2 text-xs text-dp-text-secondary">
            <li className="flex items-start">
              <span className="text-dp-warning-500 mr-2 mt-0.5">1.</span>
              <span>Verificaremos tu pago con el procesador de pagos</span>
            </li>
            <li className="flex items-start">
              <span className="text-dp-warning-500 mr-2 mt-0.5">2.</span>
              <span>Recibirás un email de confirmación cuando se apruebe</span>
            </li>
            <li className="flex items-start">
              <span className="text-dp-warning-500 mr-2 mt-0.5">3.</span>
              <span>Tu suscripción se activará automáticamente</span>
            </li>
          </ul>
        </div>

        {/* Métodos de pago pendientes comunes */}
        <div className="bg-dp-warning-50 border border-dp-warning-200 rounded-lg p-4 mb-8 text-left">
          <p className="text-xs text-dp-warning-700">
            <strong>💡 Métodos con verificación:</strong>
            <br />
            Transferencias bancarias, depósitos en efectivo, y algunos métodos de pago 
            locales requieren verificación manual.
          </p>
        </div>

        {/* Botón */}
        <Button
          onClick={() => navigate('/dashboard')}
          className="w-full bg-dp-blue-500 hover:bg-dp-blue-600 text-white font-semibold"
          size="lg"
        >
          <Home className="w-5 h-5 mr-2" />
          Volver al Dashboard
        </Button>

        {/* Ayuda */}
        <div className="mt-6 pt-6 border-t border-dp-border-light">
          <p className="text-xs text-dp-text-tertiary">
            ¿Necesitas ayuda o actualizar tu pago?{' '}
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
