export type TipoRecursoSesion =
  | "youtube"
  | "pagina_web"
  | "cuaderno_minedu"
  | "recomendacion";

export interface RecursoSesion {
  tipo: TipoRecursoSesion;
  titulo: string;
  descripcion: string;
  url?: string | null;
  referencia?: string | null;
}

export interface RecursosSesionResponse {
  recursos: RecursoSesion[];
}

export interface RecursosSesionBody {
  sesionId: string;
}

export const TIPOS_RECURSO_SESION: TipoRecursoSesion[] = [
  "youtube",
  "pagina_web",
  "cuaderno_minedu",
  "recomendacion",
];

export function recursoTieneUrl(r: RecursoSesion): boolean {
  return !!r.url;
}
