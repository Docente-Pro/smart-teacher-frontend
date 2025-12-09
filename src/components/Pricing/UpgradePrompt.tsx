import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Crown } from "lucide-react";

interface UpgradePromptProps {
  message: string;
  sessionsUsed?: number;
  sessionsLimit?: number;
  onUpgrade: () => void;
  variant?: 'banner' | 'card' | 'modal';
}

export const UpgradePrompt = ({ 
  message, 
  sessionsUsed, 
  sessionsLimit,
  onUpgrade,
  variant = 'card'
}: UpgradePromptProps) => {
  
  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-dp-orange-50 to-dp-blue-50 border-l-4 border-dp-orange-500 p-4 rounded-md">
        <div className="flex items-center justify-between">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-dp-orange-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-dp-text-title">
                {message}
              </h4>
              {sessionsUsed !== undefined && sessionsLimit !== undefined && (
                <p className="text-xs text-dp-text-secondary mt-1">
                  Has usado {sessionsUsed} de {sessionsLimit} sesiones gratuitas
                </p>
              )}
            </div>
          </div>
          <Button 
            onClick={onUpgrade}
            className="bg-dp-orange-500 hover:bg-dp-orange-600 text-white ml-4"
            size="sm"
          >
            <Crown className="w-4 h-4 mr-2" />
            Actualizar a Premium
          </Button>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card className="p-6 text-center border-2 border-dp-orange-200 bg-gradient-to-br from-white to-dp-orange-50">
        <div className="w-16 h-16 bg-dp-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Crown className="w-8 h-8 text-dp-orange-500" />
        </div>
        
        <h3 className="text-xl font-bold text-dp-text-title mb-2">
          Actualiza a Premium
        </h3>
        
        <p className="text-dp-text-secondary mb-4">
          {message}
        </p>

        {sessionsUsed !== undefined && sessionsLimit !== undefined && (
          <div className="bg-white border border-dp-border-light rounded-md p-3 mb-4">
            <p className="text-sm text-dp-text-body">
              <span className="font-semibold text-dp-orange-500">{sessionsUsed}</span>
              {' '}de{' '}
              <span className="font-semibold">{sessionsLimit}</span>
              {' '}sesiones gratuitas usadas
            </p>
          </div>
        )}

        <Button 
          onClick={onUpgrade}
          className="w-full bg-dp-orange-500 hover:bg-dp-orange-600 text-white font-semibold"
          size="lg"
        >
          <Crown className="w-5 h-5 mr-2" />
          Ver Planes Premium
        </Button>

        <p className="text-xs text-dp-text-tertiary mt-3">
          Desbloquea sesiones ilimitadas y todas las funciones premium
        </p>
      </Card>
    );
  }

  return null;
};
