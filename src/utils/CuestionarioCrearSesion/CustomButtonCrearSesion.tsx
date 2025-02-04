import { Button } from "@/components/ui/button";

interface Props {
  pagina: number;
  handleNext: () => void;
  setPaginaBefore?: (pagina: number) => void;
  isPaginaBefore: boolean;
}

function CustomButtonCrearSesion({ pagina, handleNext, isPaginaBefore, setPaginaBefore }: Props) {
  return (
    <div className="w-full flex gap-4 justify-center my-4">
      {isPaginaBefore && <Button onClick={() => setPaginaBefore!(pagina)}>Anterior</Button>}

      <Button onClick={() => handleNext()}>Siguiente</Button>
    </div>
  );
}

export default CustomButtonCrearSesion;
