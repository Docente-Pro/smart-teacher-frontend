import { ICreateUnidad } from "./DataInterfaces";
import { instance } from "./instance";

function getAllUnidades() {
  return instance.get("/unidad");
}

function getUnidadById(id: string) {
  return instance.get(`/unidad/${id}`);
}

function createUnidad(data: ICreateUnidad) {
  return instance.post("/unidad", data);
}

function updateUnidad(id: string, data: ICreateUnidad) {
  return instance.put(`/unidad/${id}`, data);
}

function deleteUnidad(id: string) {
  return instance.delete(`/unidad/${id}`);
}

export { getAllUnidades, getUnidadById, createUnidad, updateUnidad, deleteUnidad };
