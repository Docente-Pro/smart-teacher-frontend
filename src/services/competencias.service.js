import { instance } from "./instance";
function getAllCompetencies() {
    return instance.get("/competencia");
}
export { getAllCompetencies };
