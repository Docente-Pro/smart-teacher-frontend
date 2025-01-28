import { ICriterio } from "./ICriterio";
import { IUsuario } from "./IUsuario";

export interface IGrado {
  id: number;
  nombre: string;
  educacionId: number;
  criterios: ICriterio[];
  criteriosGeneralDescripcion: string;
  cicloId: number;
  user: IUsuario[];
}
