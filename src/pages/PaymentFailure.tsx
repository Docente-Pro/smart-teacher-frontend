import { useNavigate } from "react-router";
import { XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function PaymentFailure() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-3xl font-bold text-red-700 dark:text-red-400">
            Pago No Completado
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Hubo un problema con tu pago
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
              ¿Qué pasó?
            </h3>
            <ul className="space-y-2 text-sm text-red-800 dark:text-red-200">
              <li>• El pago pudo haber sido cancelado</li>
              <li>• Hubo un error en la transacción</li>
              <li>• Los fondos no fueron suficientes</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate("/")}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Reintentar Pago
            </Button>

            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              className="w-full"
            >
              Volver al Inicio
            </Button>
          </div>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            ¿Necesitas ayuda? Contáctanos a{" "}
            <a href="mailto:soporte@docentepro.com" className="text-blue-600 hover:underline">
              soporte@docentepro.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default PaymentFailure;
