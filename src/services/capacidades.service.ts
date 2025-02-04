import { instance } from "./instance";

function getAllCapacidades() {
  return instance.get("/capacidad");
}

function getCapacidadByCompentenciaId(id: number) {
  return instance.get(`/capacidad/competencia/${id}`);
}

export { getAllCapacidades, getCapacidadByCompentenciaId };
