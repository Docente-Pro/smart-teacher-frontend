import { IUsuario } from "./IUsuario";

export interface IUnidad {
  id: number;
  nombre: string;
  descripcion: string;
  user: IUsuario;
}
