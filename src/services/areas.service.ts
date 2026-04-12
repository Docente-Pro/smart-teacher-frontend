import { instance } from "./instance";

function getAllAreas() {
    return instance.get("/area");
}

function getAreaById(id: number) {
    return instance.get(`/area/${id}`);
}

/**
 * Areas that do NOT belong to primary level (Primaria).
 * Psicomotriz → Inicial only
 * Ciencias Sociales, Desarrollo Personal/Ciudadanía/Cívica, Educación para el Trabajo → Secundaria only
 * Plan Lector, Tutoría → Secundaria only
 */
const NON_PRIMARY_AREA_KEYWORDS = [
    "psicomotriz",
    "ciencias sociales",
    "desarrollo personal",
    "ciudadan",
    "educación para el trabajo",
    "plan lector",
    "tutoría",
];

function isAreaPrimaria(nombre: string): boolean {
    const lower = nombre.toLowerCase();
    return !NON_PRIMARY_AREA_KEYWORDS.some((kw) => lower.includes(kw));
}

export { getAllAreas, getAreaById, isAreaPrimaria };
