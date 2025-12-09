import { Check, Crown } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface PricingProps {
  onUpgradeClick: () => void;
  isLoading?: boolean;
}

function Pricing({ onUpgradeClick, isLoading = false }: PricingProps) {
  const plans = [
    {
      name: "Gratuito",
      price: "0",
      period: "Prueba",
      description: "Perfecto para comenzar",
      features: [
        "2 sesiones de prueba",
        "Acceso a funcionalidades básicas",
        "Explorar la plataforma",
      ],
      featuresDisabled: [
        "Asistente IA avanzado",
        "Exportar a PDF",
        "Soporte prioritario",
      ],
      highlighted: false,
      buttonText: "Plan Actual",
      buttonVariant: "outline" as const,
      badge: "GRATIS",
      isFree: true,
    },
    {
      name: "Mensual",
      price: "29.90",
      period: "mes",
      description: "Ideal para docentes activos",
      features: [
        "Sesiones ilimitadas",
        "Programaciones ilimitadas",
        "Asistente IA avanzado",
        "Exportar a PDF",
        "Plantillas personalizadas",
        "Soporte prioritario",
      ],
      highlighted: true,
      buttonText: "Comenzar Ahora",
      buttonVariant: "default" as const,
      badge: "MÁS POPULAR",
    },
    {
      name: "Anual",
      price: "299",
      period: "año",
      originalPrice: "358.80",
      discount: "17% OFF",
      description: "Ahorra 2 meses gratis",
      features: [
        "Todo lo del plan mensual",
        "Sesiones ilimitadas",
        "Acceso anticipado a nuevas funciones",
        "Asesoría personalizada 1:1",
        "Soporte premium 24/7",
      ],
      highlighted: false,
      buttonText: "Ahorrar Ahora",
      buttonVariant: "default" as const,
    },
  ];

  return (
    <section id="pricing" className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-full mb-4">
            <Crown className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">
              Elige tu plan
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Potencia tu enseñanza
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Selecciona el plan que mejor se adapte a tus necesidades
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative overflow-hidden bg-white transition-all duration-300 hover:scale-105 ${
                plan.highlighted
                  ? "border-2 border-blue-600 shadow-2xl md:scale-105"
                  : "border-2 border-blue-200 shadow-xl"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-bl-2xl shadow-lg">
                  <span className="text-sm font-bold">{plan.badge}</span>
                </div>
              )}

              {/* Discount Badge */}
              {plan.discount && (
                <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full shadow-md">
                  <span className="text-xs font-bold">{plan.discount}</span>
                </div>
              )}

              <CardHeader className={`text-center ${plan.badge ? "pt-16" : "pt-8"} pb-8`}>
                <CardTitle className="text-3xl font-bold mb-2">{plan.name}</CardTitle>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>

                <div className="mt-6">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-xl text-gray-500">S/</span>
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-lg text-gray-500">/ {plan.period}</span>
                  </div>
                  
                  {plan.originalPrice && (
                    <p className="text-sm text-gray-400 line-through mt-1">
                      S/ {plan.originalPrice} / año
                    </p>
                  )}
                  
                  <p className="text-sm text-gray-500 mt-2">
                    Cancela cuando quieras
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.featuresDisabled && plan.featuresDisabled.map((feature, featureIndex) => (
                    <div key={`disabled-${featureIndex}`} className="flex items-start gap-3 opacity-50">
                      <div className="flex-shrink-0 w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-xs text-white">✕</span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 line-through">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={plan.isFree ? undefined : onUpgradeClick}
                  disabled={isLoading || plan.isFree}
                  variant={plan.buttonVariant}
                  className={plan.isFree 
                    ? "w-full py-6 text-base rounded-xl"
                    : "w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-6 text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  }
                >
                  {isLoading ? "Procesando..." : plan.buttonText}
                </Button>

                {!plan.isFree && (
                  <p className="text-center text-xs text-gray-500">
                    Pago seguro con Mercado Pago
                  </p>
                )}
                
                {plan.isFree && (
                  <p className="text-center text-xs text-yellow-600 bg-yellow-50 py-2 px-3 rounded-md">
                    💡 Después de 2 sesiones, necesitarás Premium
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Money back guarantee */}
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-400">
            ✨ <span className="font-semibold">Garantía de satisfacción:</span> Si no estás satisfecho,
            cancela en cualquier momento sin cargos adicionales
          </p>
        </div>
      </div>
    </section>
  );
}

export default Pricing;
