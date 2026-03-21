import { ISesion } from "./ISesion";
import { ISuscripcion } from "./ISuscripcion";

// Interface para crear un nuevo usuario (onboarding)
export interface IUsuarioToCreate {
  nombre: string;
  email: string;
  nombreInstitucion: string;
  seccion?: string;
  nivelId: number;
  gradoId: number;
  problematicaId: number;
  suscripcion?: {
    fechaInicio: string;
    fechaFin?: string;
    plan?: string;
    activa?: boolean;
  };
}

// Interface para actualizar un usuario
export interface IUsuarioToUpdate {
  nombre?: string;
  email?: string;
  nombreInstitucion?: string;
  nombreDirectivo?: string;
  genero?: string;
  seccion?: string;
  nivelId?: number;
  gradoId?: number;
  problematicaId?: number;
  problematicaCompleta?: boolean;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  nombreSubdirectora?: string;
  tituloUnidadContexto?: string;
  situacionSignificativaContexto?: string;
}

// Interface completa del usuario (respuesta del backend)
export interface IUsuario {
  id: string;
  nombre: string;
  email: string;
  nombreInstitucion: string;
  seccion?: string;
  nombreDirectivo?: string;
  nombreSubdirectora?: string;
  genero?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  nivelId?: number;
  gradoId?: number;
  problematicaId?: number;
  createdAt: string;
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
  tituloUnidadContexto?: string | null;
  situacionSignificativaContexto?: string | null;
  insigniaUrl?: string | null;
  suscripcion?: ISuscripcion;
  sesiones?: ISesion[];
}

export interface ISesionToCreate {
  titulo: string;
  usuarioId: string;
  nivelId: number;
  gradoId: number;
  problematicaId: number;
  duracion: number;
  fechaInicio?: string;
  fechaFin?: string;
  unidadId?: string;
  areaId?: number;
}