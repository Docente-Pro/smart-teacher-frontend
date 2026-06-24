import { hasImagenIAUrl } from "@/types/visuales-ia";

/**
 * Soporte para recursos visuales generados por IA (sistema AI_VISUALS).
 *
 * El backend (con AI_VISUALS_ENABLED=1) limpia `grafico`, `graficoOperacion` y
 * `descripcionGrafico`, y entrega un contrato general por proceso:
 *
 * {
 *   "imagen": {
 *     "url": "...",
 *     "tipo": "infografia_ia",      // grafico_ia | infografia_ia | diagrama_ia |
 *                                   // ilustracion_ia | vocabulario_ia | evidencia_ia
 *     "modo": "concepto",           // problema | solucion | concepto | ...
 *     "descripcion": "...",
 *     "posicion": "junto",
 *     "requiereTexto": true,
 *     "mimeType": "image/png"
 *   }
 * }
 *
 * Aplica a TODAS las áreas. Regla de prioridad:
 *  1. Si existe `proceso.imagen` con `tipo` `*_ia` → mostrar la imagen.
 *  2. Si no existe → usar el fallback legacy (`grafico` / `graficoOperacion`).
 */

type ImagenLike = {
  url?: string;
  tipo?: string;
  modo?: string;
  descripcion?: string;
  posicion?: string;
  requiereTexto?: boolean;
  mimeType?: string;
} | null | undefined;

type ImagenIAResuelta = Exclude<ImagenLike, null | undefined>;

/** ¿La imagen es un recurso visual IA válido (tipo `*_ia` con URL utilizable)? */
export function esImagenIA(imagen: ImagenLike): boolean {
  return hasImagenIAUrl(imagen);
}

/** Atajo específico para el gráfico matemático generado por IA. */
export function esGraficoIA(imagen: ImagenLike): boolean {
  return esImagenIA(imagen) && imagen!.tipo === "grafico_ia";
}

/** Devuelve la imagen IA del proceso (si existe). */
export function getImagenIA(
  proceso: { imagen?: ImagenLike } | null | undefined
): ImagenIAResuelta | null {
  const img = proceso?.imagen;
  return esImagenIA(img) ? (img as ImagenIAResuelta) : null;
}

/** ¿El proceso tiene un recurso visual IA? */
export function tieneImagenIA(proceso: { imagen?: ImagenLike } | null | undefined): boolean {
  return getImagenIA(proceso) !== null;
}

/**
 * Imagen IA para el slot principal del proceso (problema, concepto, etc.).
 * Excluye `modo: "solucion"`, que tiene slot propio tras el texto de solución.
 */
export function getImagenIAPrincipal(
  proceso: { imagen?: ImagenLike } | null | undefined
): ImagenIAResuelta | null {
  const img = getImagenIA(proceso);
  return img && img.modo !== "solucion" ? img : null;
}

/** Imagen IA de la solución — solo cuando `modo === "solucion"`. */
export function getImagenIASolucion(
  proceso: { imagen?: ImagenLike } | null | undefined
): ImagenIAResuelta | null {
  const img = getImagenIA(proceso);
  return img?.modo === "solucion" ? img : null;
}

// ─── Alias retrocompatibles (uso previo solo-Matemática) ─────────────────────
/** @deprecated Usar getImagenIA + filtrar por `.modo` */
export function getGraficoIA(
  proceso: { imagen?: ImagenLike } | null | undefined,
  modo?: "problema" | "solucion"
): ImagenIAResuelta | null {
  const img = getImagenIA(proceso);
  if (!img) return null;
  if (!modo) return img;
  return (img.modo ?? "problema") === modo ? img : null;
}

interface ImagenIAProps {
  imagen: { url?: string; descripcion?: string; requiereTexto?: boolean };
  /** Variante de estilo: "solucion" (verde) o cualquier otro (azul). */
  modo?: string;
  /** Activar crossOrigin para captura PDF (html2canvas). Default: true. */
  crossOrigin?: boolean;
}

/**
 * Render de un recurso visual IA como imagen prominente (ancho completo,
 * object-contain, dentro de una caja con borde). Sirve para todas las áreas.
 */
export function ImagenIA({ imagen, modo, crossOrigin = true }: ImagenIAProps) {
  if (!imagen?.url) return null;

  const colores =
    modo === "solucion"
      ? { bg: "#f0fdf4", border: "#bbf7d0" }
      : { bg: "#f0f9ff", border: "#bae6fd" };

  return (
    <div
      className="no-break"
      style={{
        marginTop: "0.6rem",
        marginBottom: "0.6rem",
        padding: "0.6rem 0.8rem",
        backgroundColor: colores.bg,
        borderRadius: "8px",
        border: `1px solid ${colores.border}`,
        textAlign: "center",
        overflow: "visible",
      }}
    >
      <img
        src={imagen.url}
        alt={imagen.descripcion ?? "Recurso visual"}
        {...(crossOrigin ? { crossOrigin: "anonymous" as const } : {})}
        style={{
          width: "100%",
          maxWidth: 480,
          height: "auto",
          margin: "0 auto",
          borderRadius: "8px",
          objectFit: "contain",
        }}
      />
      {imagen.descripcion && imagen.requiereTexto !== false && (
        <div style={{ fontSize: "7pt", color: "#64748b", marginTop: "0.2rem" }}>
          {imagen.descripcion}
        </div>
      )}
    </div>
  );
}

/** @deprecated Alias de ImagenIA (uso previo solo-Matemática). */
export const GraficoIAImagen = ImagenIA;
