import type { IUsuario } from "@/interfaces/IUsuario";
import type { IUnidadListItem } from "@/interfaces/IUnidadList";
import { isUnidadListaActiva } from "@/utils/unidadActiva";

/** Docente de secundaria según perfil (nivel o vínculo grado–área en secundaria). */
export function isUsuarioSecundaria(usuario: IUsuario): boolean {
  const nivel = (usuario.nivel?.nombre || "").toLowerCase();
  if (nivel.includes("secundaria")) return true;
  return (usuario.gradosAreas || []).some((ga) =>
    (ga.grado?.nivel?.nombre || "").toLowerCase().includes("secundaria"),
  );
}

/** Todo usuario de secundaria pasa por el pre-paso de área (las opciones se obtienen vía /usuario/me/grados-areas). */
export function shouldOfferSecundariaAreaStep(usuario: IUsuario): boolean {
  return isUsuarioSecundaria(usuario);
}

export interface AreaDocenteSecundaria {
  areaId: number;
  nombre: string;
}

/**
 * Áreas únicas del docente desde `gradosAreas` (orden estable por primera aparición).
 * Usa `ga.areaId` si `ga.area` no viene poblado (caso frecuente en Tutoría u otras filas del API).
 * El nombre vacío se puede completar en UI con el catálogo de áreas.
 */
export function areasDocenteDesdePerfil(usuario: IUsuario): AreaDocenteSecundaria[] {
  const seen = new Set<number>();
  const out: AreaDocenteSecundaria[] = [];
  for (const ga of usuario.gradosAreas || []) {
    const idRaw = ga.area?.id ?? ga.areaId;
    if (idRaw === undefined || idRaw === null) continue;
    const id = Number(idRaw);
    if (!Number.isFinite(id) || seen.has(id)) continue;
    seen.add(id);
    const nombre = (ga.area?.nombre || "").trim();
    out.push({ areaId: id, nombre });
  }
  return out;
}

/**
 * areaIds del propietario que ya tienen una unidad PERSONAL activa (pago confirmado + fechaFin activa).
 * Se usa para “una unidad activa por área” en secundaria.
 *
 * Nota: depende de que `GET /unidad/usuario/:id` incluya `miembros[].areas` con `areaId`.
 * Si el backend añade `areaPrincipalId` en la unidad, conviene preferirlo aquí.
 */
export function getAreaIdsConUnidadActivaPropietario(
  unidades: IUnidadListItem[],
  userId: string,
): Set<number> {
  const occupied = new Set<number>();
  for (const u of unidades) {
    if (u._rol !== "PROPIETARIO") continue;
    if (u.tipo !== "PERSONAL") continue;
    if (u.estadoPago !== "CONFIRMADO") continue;
    if (!isUnidadListaActiva(u.fechaFin)) continue;
    const miembro = u.miembros?.find((m) => m.usuarioId === userId);
    for (const a of miembro?.areas ?? []) {
      if (typeof a.areaId === "number") occupied.add(a.areaId);
    }
  }
  return occupied;
}
