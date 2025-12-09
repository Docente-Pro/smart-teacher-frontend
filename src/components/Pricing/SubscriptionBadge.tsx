import { PlanType } from "@/interfaces/ISuscripcion";
import { Crown, Sparkles } from "lucide-react";

interface SubscriptionBadgeProps {
  plan: PlanType;
  className?: string;
}

export const SubscriptionBadge = ({ plan, className = "" }: SubscriptionBadgeProps) => {
  if (plan === 'free') {
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-dp-gray-200 text-dp-text-secondary ${className}`}>
        <Sparkles className="w-3 h-3 mr-1" />
        Plan Gratuito
      </span>
    );
  }

  if (plan === 'premium_mensual') {
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-dp-blue-500 text-white ${className}`}>
        <Crown className="w-3 h-3 mr-1" />
        Premium Mensual
      </span>
    );
  }

  if (plan === 'premium_anual') {
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-dp-orange-500 text-white ${className}`}>
        <Crown className="w-3 h-3 mr-1" />
        Premium Anual
      </span>
    );
  }

  return null;
};
