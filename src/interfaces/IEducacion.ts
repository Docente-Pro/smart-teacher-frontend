import { IArea } from "./IArea";
import { IGrado } from "./IGrado";
import { IUsuario } from "./IUsuario";

export interface IEducacion {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  areas: IArea[];
  grados: IGrado[];
  user: IUsuario;
}
