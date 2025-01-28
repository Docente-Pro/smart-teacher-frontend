import { instance } from "./instance";

function getAllEducaciones() {
  return instance.get("/educacion");
}

export { getAllEducaciones };
