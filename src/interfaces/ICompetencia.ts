import { IArea } from "./IArea";

export interface ICompetencia {
  id: number;
  nombre: string;
  descripcion: string;
  area: IArea;
}
