import { ICompetencia } from "./ICompetencia";

export interface IArea {
  id: number;
  nombre: string;
  descripcion: string;
  color: string;
  imagen: string;
  competencias: ICompetencia[];
}
