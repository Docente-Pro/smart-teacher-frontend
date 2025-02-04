import { ICriterioToGenerate } from "@/interfaces/ICriterio";
import { instance } from "./instance";

function generarCriteriosIA(data: ICriterioToGenerate) {
  return instance.post("/criterio/generar", data);
}

export { generarCriteriosIA };
