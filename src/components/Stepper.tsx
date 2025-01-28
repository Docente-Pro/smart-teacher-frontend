interface StepperProps {
  totalSteps: number;
  currentStep: number;
}

function Stepper({ totalSteps, currentStep }: StepperProps) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-12">
      <div
        className="bg-[#00D9FC] dark:bg-yellow-500 h-2.5 rounded-full transition-all duration-300 ease-in-out"
        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
      ></div>
    </div>
  );
}

export default Stepper;
