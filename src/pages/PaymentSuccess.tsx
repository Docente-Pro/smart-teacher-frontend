import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function PaymentSuccess() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Recargar para obtener el nuevo token con el rol actualizado
    window.location.reload();

    // Contador regresivo
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-3xl font-bold text-green-700 dark:text-green-400">
            ¡Pago Exitoso!
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Tu cuenta premium está activada
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
              Ahora tienes acceso a:
            </h3>
            <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
              <li>✓ 5 sesiones por semana</li>
              <li>✓ Evaluaciones con IA</li>
              <li>✓ Exportar en PDF/Word</li>
              <li>✓ Plantillas personalizadas</li>
            </ul>
          </div>

          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Redirigiendo al dashboard en {countdown} segundos...</span>
            </div>

            <Button
              onClick={() => navigate("/dashboard")}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Ir al Dashboard Ahora
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PaymentSuccess;
