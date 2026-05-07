import { IUsuarioToCreate, IUsuarioToUpdate } from "@/interfaces/IUsuario";
import { instance } from "./instance";

function getAllUsuarios() {
  return instance.get("/usuario");
}

function createNewUsuario(usuario: IUsuarioToCreate) {
  return instance.post("/usuario", usuario);
}

function getUsuarioById(id: string) {
  return instance.get(`/usuario/${id}`);
}

function getUsuarioByEmail(data: { email: string }) {
  return instance.post(`/usuario/email`, data);
}

function updateUsuario(id: string, data: IUsuarioToUpdate) {
  return instance.patch(`/usuario/${id}`, data);
}

function putUsuario(id: string, data: IUsuarioToUpdate) {
  return instance.put(`/usuario/${id}`, data);
}

interface IAsignacionGradoArea {
  gradoId: number;
  areaId: number;
  secciones?: string[];
}

export interface IResumenUsuarioGradoArea {
  asignacionId?: string;
  gradoId: number;
  gradoNombre?: string;
  nivelNombre?: string;
  areaId: number;
  areaNombre?: string;
}

interface IUsuarioGradosAreasResponse {
  data?: {
    usuarioId?: string;
    data?: Array<unknown>;
    resumenParaUnidad?: IResumenUsuarioGradoArea[];
  };
  usuarioId?: string;
  resumenParaUnidad?: IResumenUsuarioGradoArea[];
}

function guardarUsuarioGradosAreas(id: string, data: { asignaciones: IAsignacionGradoArea[] }) {
  return instance.post(`/usuario/${id}/grados-areas`, data);
}

function getUsuarioMeGradosAreas() {
  return instance.get<IUsuarioGradosAreasResponse>(`/usuario/me/grados-areas`);
}

function configurarUsuarioGrados(
  id: string,
  data: {
    asignaciones: IAsignacionGradoArea[];
    aulas?: Array<{ gradoId: number; nombre?: string }>;
    secciones?: Array<{ gradoId: number; nivelId: number; secciones: string[] }>;
  },
) {
  return instance.post(`/usuario/${id}/configurar-grados`, data);
}

export {
  getAllUsuarios,
  createNewUsuario,
  getUsuarioById,
  getUsuarioByEmail,
  updateUsuario,
  putUsuario,
  guardarUsuarioGradosAreas,
  getUsuarioMeGradosAreas,
  configurarUsuarioGrados,
};
