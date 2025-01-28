import { ICreateProblematica } from "./DataInterfaces";
import { instance } from "./instance";

function getAllProblematicas() {
  return instance.get("/problematica");
}

function getProblematicaById(id: string) {
  return instance.get(`/problematica/${id}`);
}

function createProblematica(data: ICreateProblematica) {
  return instance.post("/problematica", data);
}

function updateProblematica(id: string, data: ICreateProblematica) {
  return instance.put(`/problematica/${id}`, data);
}

function deleteProblematica(id: string) {
  return instance.delete(`/problematica/${id}`);
}

export { getAllProblematicas, getProblematicaById, createProblematica, updateProblematica, deleteProblematica };
