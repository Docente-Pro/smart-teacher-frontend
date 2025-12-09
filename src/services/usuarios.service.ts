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

export { getAllUsuarios, createNewUsuario, getUsuarioById, getUsuarioByEmail, updateUsuario };
