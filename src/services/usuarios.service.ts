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
}

function guardarUsuarioGradosAreas(id: string, data: { asignaciones: IAsignacionGradoArea[] }) {
  return instance.post(`/usuario/${id}/grados-areas`, data);
}

function configurarUsuarioGrados(
  id: string,
  data: { asignaciones: IAsignacionGradoArea[]; aulas?: Array<{ gradoId: number; nombre?: string }> },
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
  configurarUsuarioGrados,
};
