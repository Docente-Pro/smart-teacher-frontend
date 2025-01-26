import { instance } from "./instance";
function getAllAreas() {
    return instance.get("/area");
}
function getAreaById(id: number) {
    return instance.get(`/area/${id}`);
}
export { getAllAreas, getAreaById };
