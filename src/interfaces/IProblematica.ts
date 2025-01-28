import { IUsuario } from "./IUsuario";

export interface IProblematica {
  id: number;
  nombre: string;
  descripcion: string;
  user: IUsuario;
}
