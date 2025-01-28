import { instance } from "./instance";

function getAllGrados() {
  return instance.get("/grado");
}

export { getAllGrados };