export interface ISesion {
  id: string;
  titulo: string;
  usuarioId: string;
  nivelId: number;
  gradoId: number;
  problematicaId: number;
  duracion: number;
  fechaInicio?: string;
  fechaFin?: string;
  respondioCuestionario: boolean;
  createdAt: string;
  updatedAt: string;
  usuario?: {
    id: string;
    nombre: string;
    email: string;
    nombreInstitucion: string;
  };
  nivel?: {
    id: number;
    nombre: string;
    descripcion: string;
    imagen: string;
  };
  grado?: {
    id: number;
    nombre: string;
    nivelId: number;
  };
  problematica?: {
    id: number;
    nombre: string;
    descripcion: string;
  };
}
