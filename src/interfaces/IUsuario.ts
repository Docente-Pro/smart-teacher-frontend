export interface IUsuario {
  id: string;
  nombre: string;
  unidadId: number;
  fechaInicio: Date;
  fechaFin: Date;
  problematicaId: number;
  createdAt?: Date;
  gradoId: number;
  educacionId: number;
  respondioCuestionario: boolean;
  nombreInstitucion: string;
}

export interface IUsuarioToSave {
  nombre: string;
  unidadId: number;
  problematicaId: number;
  gradoId: number;
  educacionId: number;
  respondioCuestionario: boolean;
  nombreInstitucion: string;
  email: string
}
