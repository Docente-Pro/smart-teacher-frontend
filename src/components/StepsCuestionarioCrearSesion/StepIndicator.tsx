import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  steps: {
    number: number;
    title: string;
    description: string;
  }[];
  currentStep: number;
  maxStepReached: number;
  onStepClick: (step: number) => void;
}

export const StepIndicator = ({ steps, currentStep, maxStepReached, onStepClick }: StepIndicatorProps) => {
  return (
    <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = maxStepReached > step.number;
            const isCurrent = currentStep === step.number;
            const isClickable = step.number <= maxStepReached;

            return (
              <div key={step.number} className="flex items-center flex-1">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => isClickable && onStepClick(step.number)}
                    disabled={!isClickable}
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2",
                      {
                        "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-110 focus:ring-blue-500": isCurrent,
                        "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md hover:scale-105 focus:ring-green-500": isCompleted,
                        "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400": !isCurrent && !isCompleted && !isClickable,
                        "bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-400 dark:hover:bg-slate-500 cursor-pointer hover:scale-105": !isCurrent && !isCompleted && isClickable,
                      }
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      step.number
                    )}
                  </button>
                  
                  {/* Step Label */}
                  <div className="mt-2 text-center hidden md:block">
                    <p className={cn(
                      "text-xs font-semibold transition-colors",
                      {
                        "text-blue-600 dark:text-blue-400": isCurrent,
                        "text-green-600 dark:text-green-400": isCompleted,
                        "text-slate-500 dark:text-slate-400": !isCurrent && !isCompleted
                      }
                    )}>
                      {step.title}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={cn(
                    "flex-1 h-1 mx-2 rounded-full transition-all duration-300",
                    {
                      "bg-gradient-to-r from-green-500 to-emerald-500": isCompleted,
                      "bg-gradient-to-r from-blue-600 to-purple-600": isCurrent && index === currentStep - 1,
                      "bg-slate-200 dark:bg-slate-700": !isCompleted && !(isCurrent && index === currentStep - 1)
                    }
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Step Title */}
        <div className="md:hidden mt-4 text-center">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
            {steps[currentStep - 1]?.title}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {steps[currentStep - 1]?.description}
          </p>
        </div>
      </div>
    </div>
  );
};
