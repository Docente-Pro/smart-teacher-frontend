import { instance } from "@/services/instance";

export function getNiveles() {
  return instance.get("/nivel");
}
