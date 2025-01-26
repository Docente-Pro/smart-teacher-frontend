import { instance } from "./instance";
function getAllAreas() {
    return instance.get("/area");
}
function getAreaById(id) {
    return instance.get(`/area/${id}`);
}
export { getAllAreas, getAreaById };
