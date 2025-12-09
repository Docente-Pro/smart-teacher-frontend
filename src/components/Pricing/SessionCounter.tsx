interface SessionCounterProps {
  sessionsUsed: number;
  sessionsLimit: number;
  isPremium: boolean;
}

export const SessionCounter = ({ 
  sessionsUsed, 
  sessionsLimit, 
  isPremium 
}: SessionCounterProps) => {
  
  if (isPremium) {
    return (
      <div className="inline-flex items-center text-sm text-dp-success-600 font-medium">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
        </svg>
        Sesiones ilimitadas
      </div>
    );
  }

  const remainingSessions = sessionsLimit - sessionsUsed;
  const percentage = (sessionsUsed / sessionsLimit) * 100;
  const isLow = remainingSessions <= 1;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className={`font-medium ${isLow ? 'text-dp-orange-600' : 'text-dp-text-body'}`}>
          {remainingSessions} {remainingSessions === 1 ? 'sesión restante' : 'sesiones restantes'}
        </span>
        <span className="text-dp-text-tertiary text-xs">
          {sessionsUsed} de {sessionsLimit} usadas
        </span>
      </div>
      
      <div className="w-full bg-dp-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-300 ${
            isLow ? 'bg-dp-orange-500' : 'bg-dp-blue-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {isLow && (
        <p className="text-xs text-dp-orange-600 mt-1">
          ⚠️ Te quedan pocas sesiones gratuitas
        </p>
      )}
    </div>
  );
};
