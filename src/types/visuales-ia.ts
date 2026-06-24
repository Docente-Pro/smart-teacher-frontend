export type TipoImagenIA =
  | "infografia_ia"
  | "diagrama_ia"
  | "ilustracion_ia"
  | "vocabulario_ia"
  | "evidencia_ia"
  | "grafico_ia";

export type ModoImagenIA =
  | "problema"
  | "solucion"
  | "concepto"
  | "proceso"
  | "producto"
  | "contexto"
  | (string & {});

export type PosicionImagenIA = "antes" | "junto";

export interface ImagenIA {
  url: string;
  tipo: TipoImagenIA | (string & {});
  modo: ModoImagenIA;
  descripcion: string;
  posicion: PosicionImagenIA;
  /** Solo metadata: no usar para ocultar la imagen. */
  requiereTexto: boolean;
  mimeType: string;
}

export type VisualKind = "imagen_ia" | "grafico" | "graficoOperacion" | "legacy_url";

export interface ResolvedVisual {
  kind: VisualKind;
  imagen?: ImagenIA;
  grafico?: Record<string, unknown>;
  graficoOperacion?: Record<string, unknown>;
  legacyUrl?: string;
}

export function hasImagenIAUrl(imagen: unknown): imagen is ImagenIA {
  if (!imagen || typeof imagen !== "object") return false;
  const url = (imagen as { url?: unknown }).url;
  return typeof url === "string" && url.trim().length > 0 && /^https?:\/\//i.test(url.trim());
}

function hasGrafico(grafico: unknown): grafico is Record<string, unknown> {
  return !!grafico && typeof grafico === "object" && !Array.isArray(grafico);
}

function isLegacyUrl(url: unknown): url is string {
  return typeof url === "string" && /^https?:\/\//i.test(url.trim());
}

/** Sesión: inicio | desarrollo | cierre -> procesos[]. */
export function resolveProcesoVisual(
  proceso: Record<string, unknown> | null | undefined
): ResolvedVisual | null {
  if (!proceso) return null;
  if (hasImagenIAUrl(proceso.imagen)) return { kind: "imagen_ia", imagen: proceso.imagen };
  if (hasGrafico(proceso.grafico)) return { kind: "grafico", grafico: proceso.grafico };
  if (hasGrafico(proceso.graficoOperacion)) {
    return { kind: "graficoOperacion", graficoOperacion: proceso.graficoOperacion };
  }
  if (isLegacyUrl(proceso.imagenProblema)) {
    return { kind: "legacy_url", legacyUrl: proceso.imagenProblema };
  }
  if (isLegacyUrl(proceso.imagenSolucion)) {
    return { kind: "legacy_url", legacyUrl: proceso.imagenSolucion };
  }
  if (hasGrafico(proceso.graficoProblema)) return { kind: "grafico", grafico: proceso.graficoProblema };
  if (hasGrafico(proceso.graficoSolucion)) return { kind: "grafico", grafico: proceso.graficoSolucion };
  return null;
}

/** Ficha: secciones[]. */
export function resolveSeccionVisual(
  seccion: Record<string, unknown> | null | undefined
): ResolvedVisual | null {
  if (!seccion) return null;
  if (hasImagenIAUrl(seccion.imagen)) return { kind: "imagen_ia", imagen: seccion.imagen };

  const contenidoRaw = seccion.contenido;
  if (contenidoRaw && typeof contenidoRaw === "object" && !Array.isArray(contenidoRaw)) {
    const contenido = contenidoRaw as Record<string, unknown>;
    if (hasGrafico(contenido.grafico)) return { kind: "grafico", grafico: contenido.grafico };
    if (hasGrafico(contenido.graficoOperacion)) {
      return { kind: "graficoOperacion", graficoOperacion: contenido.graficoOperacion };
    }
  }

  return null;
}

export function imagenIAPosicion(imagen?: ImagenIA): PosicionImagenIA {
  return imagen?.posicion === "antes" ? "antes" : "junto";
}
