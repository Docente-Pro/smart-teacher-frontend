import { ICriterio } from "./ICriterio";
import { INivel } from "./INivel";
import { IUsuario } from "./IUsuario";

export interface IGrado {
  id: number;
  nombre: string;
  nivelId: number; // ID del nivel (primaria/secundaria)
  nivel?: INivel; // Relación con el nivel
  criterios?: ICriterio[];
  criteriosGeneralDescripcion?: string;
  cicloId?: number;
  user?: IUsuario[];
}
