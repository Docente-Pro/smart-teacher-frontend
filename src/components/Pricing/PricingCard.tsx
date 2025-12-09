import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Star, TrendingUp } from "lucide-react";
import { IPlan } from "@/interfaces/ISuscripcion";

interface PricingCardProps {
  plan: IPlan;
  currentPlan?: string;
  onSelectPlan: (planId: string) => void;
  isLoading?: boolean;
}

export const PricingCard = ({ 
  plan, 
  currentPlan, 
  onSelectPlan, 
  isLoading = false 
}: PricingCardProps) => {
  const isCurrentPlan = currentPlan === plan.id;
  const isFree = plan.isFree;

  const getBadgeColor = () => {
    if (plan.badgeColor === 'primary') return 'bg-dp-blue-500 text-white';
    if (plan.badgeColor === 'success') return 'bg-dp-success-500 text-white';
    if (plan.badgeColor === 'warning') return 'bg-dp-orange-500 text-white';
    return 'bg-dp-gray-300 text-dp-text-body';
  };

  return (
    <Card 
      className={`relative flex flex-col h-full ${
        plan.isPopular 
          ? 'border-2 border-dp-orange-500 shadow-lg scale-105' 
          : 'border-dp-border-light'
      }`}
    >
      {/* Badge */}
      {plan.badge && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold ${getBadgeColor()}`}>
          {plan.isPopular && <Star className="inline w-3 h-3 mr-1" />}
          {plan.badge}
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <h3 className="text-2xl font-bold text-dp-text-title">{plan.name}</h3>
        
        <div className="mt-4">
          <span className="text-5xl font-extrabold text-dp-blue-500">
            S/ {plan.price.toFixed(2)}
          </span>
          <span className="text-dp-text-secondary ml-2">/ {plan.period}</span>
        </div>

        {plan.savings && (
          <div className="mt-2 flex items-center justify-center text-dp-success-600 text-sm font-medium">
            <TrendingUp className="w-4 h-4 mr-1" />
            {plan.savings}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              {feature.included ? (
                <Check className="w-5 h-5 text-dp-success-500 mr-3 flex-shrink-0 mt-0.5" />
              ) : (
                <X className="w-5 h-5 text-dp-error-500 mr-3 flex-shrink-0 mt-0.5" />
              )}
              <span 
                className={`text-sm ${
                  feature.included 
                    ? 'text-dp-text-body' 
                    : 'text-dp-text-tertiary line-through'
                }`}
              >
                {feature.text}
              </span>
            </li>
          ))}
        </ul>

        {isFree && (
          <div className="mt-4 p-3 bg-dp-warning-50 border border-dp-warning-200 rounded-md">
            <p className="text-xs text-dp-warning-700">
              💡 <strong>Nota:</strong> Después de las 2 sesiones, necesitarás Premium para continuar
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4">
        {isFree ? (
          <Button
            variant="outline"
            className="w-full"
            disabled
          >
            Plan Actual
          </Button>
        ) : isCurrentPlan ? (
          <Button
            variant="secondary"
            className="w-full"
            disabled
          >
            Plan Actual
          </Button>
        ) : (
          <Button
            className="w-full bg-dp-orange-500 hover:bg-dp-orange-600 text-white font-semibold"
            onClick={() => onSelectPlan(plan.id)}
            disabled={isLoading}
          >
            {isLoading ? 'Procesando...' : 'Suscribirme Ahora'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
