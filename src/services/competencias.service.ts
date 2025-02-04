import { instance } from "./instance";
function getAllCompetencies() {
  return instance.get("/competencia");
}

function getCompetencyById(id: number) {
  return instance.get(`/competencia/area/${id}`);
}

export { getAllCompetencies, getCompetencyById };
