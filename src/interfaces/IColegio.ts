import { IUsuario } from "./IUsuario";

export interface IColegio {
  id: number;
  nombre: string;
  descripcion: string;
  user: IUsuario[];
}
