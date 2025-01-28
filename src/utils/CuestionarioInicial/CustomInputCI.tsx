import { Button } from "@/components/ui/button";

interface Props {
  handleNextStep: () => void;
  beforeButton?: boolean;
  handleBeforeStep?: () => void;
}

function CustomInputCI({ handleNextStep, beforeButton, handleBeforeStep }: Props) {
  return (
    <div className="flex items-center justify-center w-full gap-4 mt-12">
      {beforeButton && handleBeforeStep && <Button onClick={() => handleBeforeStep()}>Anterior</Button>}
      <Button onClick={() => handleNextStep()}>Siguiente</Button>
    </div>
  );
}

export default CustomInputCI;
