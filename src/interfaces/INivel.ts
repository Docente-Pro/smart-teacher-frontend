import { IArea } from "./IArea";
import { IGrado } from "./IGrado";
import { IUsuario } from "./IUsuario";

export interface INivel {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  areas?: IArea[];
  grados: IGrado[];
  user?: IUsuario;
}

// Alias para compatibilidad con código existente
export type IEducacion = INivel;
