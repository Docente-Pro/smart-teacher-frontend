// ═══════════════════════════════════════════════════════
// INTERFACES — Horario Escolar
// ═══════════════════════════════════════════════════════

export interface SlotHorario {
  area: string;
}

export interface DiaHorario {
  dia: "Lunes" | "Martes" | "Miércoles" | "Jueves" | "Viernes";
  horas: SlotHorario[]; // Típicamente 6 horas pedagógicas por día
}

export interface HorarioEscolar {
  dias: DiaHorario[]; // Siempre 5 elementos (Lunes a Viernes)
}

// ─── Respuesta del endpoint de escaneo ───

export interface EscanearHorarioResponse {
  horario: HorarioEscolar;
  confianza: "alta" | "media" | "baja";
  notas: string | null;
}

// ─── Request para escaneo base64 ───

export interface EscanearHorarioBase64Request {
  imagenBase64: string;
  mimeType?: "image/jpeg" | "image/png" | "image/webp";
}

// ─── Request para escaneo por URL ───

export interface EscanearHorarioUrlRequest {
  imageUrl: string;
}

// ─── Áreas curriculares normalizadas MINEDU ───

export const AREAS_CURRICULARES = [
  "Comunicación",
  "Matemática",
  "Personal Social",
  "Ciencia y Tecnología",
  "Educación Religiosa",
  "Arte y Cultura",
  "Educación Física",
  "Tutoría",
  "Plan Lector",
  "Inglés",
] as const;

export type AreaCurricular = (typeof AREAS_CURRICULARES)[number];
