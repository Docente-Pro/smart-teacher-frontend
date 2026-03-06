/**
 * Utilidad para renderizar SesionPremiumDoc fuera de pantalla y generar un PDF Blob.
 *
 * Flujo:
 *  1. Construye ISesionPremiumResponse a partir del `contenido` corregido.
 *  2. Crea un contenedor oculto en el DOM.
 *  3. Monta <SesionPremiumDoc /> vía createRoot (React 18).
 *  4. Espera a que todas las imágenes carguen.
 *  5. Captura con generatePDFBlob → Blob.
 *  6. Desmonta y limpia el DOM.
 */
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { SesionPremiumDoc } from "@/components/SesionPremiumDoc/SesionPremiumDoc";
import type { ISesionPremiumResponse } from "@/interfaces/ISesionPremium";
import { generatePDFBlob } from "@/services/htmldocs.service";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Devuelve el primer valor "con datos reales": ignora null, undefined,
 * objetos vacíos ({}) y arrays vacíos ([]).
 */
function pick<T>(...candidates: unknown[]): T {
  for (const v of candidates) {
    if (v == null) continue;
    if (Array.isArray(v) && v.length === 0) continue;
    if (
      typeof v === "object" &&
      !Array.isArray(v) &&
      Object.keys(v as object).length === 0
    )
      continue;
    return v as T;
  }
  return candidates[candidates.length - 1] as T;
}

/**
 * Parsea `contenido` que puede venir como string JSON o como objeto.
 * Replica la misma lógica de SesionSuscriptorResult.
 */
function parseContenido(raw: unknown): Record<string, any> {
  try {
    if (typeof raw === "string") return JSON.parse(raw);
    if (raw && typeof raw === "object") return raw as Record<string, any>;
  } catch {
    console.warn("⚠️ [offscreen] No se pudo parsear contenido:", raw);
  }
  return {};
}

// ─── Builders ────────────────────────────────────────────────────────────────

/**
 * Transforma el `contenido` corregido + metadatos básicos de la sesión
 * en un objeto ISesionPremiumResponse listo para SesionPremiumDoc.
 */
export function buildSesionPremiumData(
  rawContenido: Record<string, any> | string,
  sesionMeta: {
    id: string;
    titulo?: string;
    area?: string;
    grado?: string;
    nivel?: string;
  },
  docente: string,
  institucion: string,
  seccion?: string,
): ISesionPremiumResponse {
  // ⚠️ El backend puede enviar contenido como JSON string — parsearlo
  const contenido = parseContenido(rawContenido);

  console.log("🔍 [buildSesionPremiumData] contenido keys:", Object.keys(contenido));
  console.log("🔍 [buildSesionPremiumData] contenido.inicio?", !!contenido.inicio);
  console.log("🔍 [buildSesionPremiumData] contenido.area:", contenido.area);

  const sesionForDoc = {
    // ── Identificadores / metadatos ──
    id: sesionMeta.id,
    titulo: pick<string>(sesionMeta.titulo, contenido.titulo, "Sesión de Aprendizaje"),
    area: pick(sesionMeta.area, contenido.area),
    nivel: pick(sesionMeta.nivel, contenido.nivel),
    grado: pick(sesionMeta.grado, contenido.grado),
    duracion: contenido.duracion,

    // ── Propósitos ──
    propositoSesion: pick<string>(contenido.propositoSesion, ""),
    propositoAprendizaje: pick<any[]>(contenido.propositoAprendizaje, []),
    enfoquesTransversales: pick<any[]>(contenido.enfoquesTransversales, []),

    // ── Preparación ──
    preparacion: pick(contenido.preparacion, {
      quehacerAntes: [],
      recursosMateriales: [],
    }),

    // ── Fases ──
    inicio: pick(contenido.inicio, { tiempo: "", procesos: [] }),
    desarrollo: pick(contenido.desarrollo, { tiempo: "", procesos: [] }),
    cierre: pick(contenido.cierre, { tiempo: "", procesos: [] }),

    // ── Reflexiones / resumen / fuentes ──
    reflexiones: pick(contenido.reflexiones, {
      sobreAprendizajes: "",
      sobreEnsenanza: "",
    }),
    resumen: pick<string>(contenido.resumen, ""),
    fuentesMinedu: pick<any[]>(contenido.fuentesMinedu, []),
    imagenesDisponibles: pick<any[]>(contenido.imagenesDisponibles, []),

    // ── Sesiones complementarias (Tutoría / Plan Lector) ──
    ...(contenido.recursoNarrativo
      ? { recursoNarrativo: contenido.recursoNarrativo }
      : {}),
  };

  return {
    success: true,
    docente,
    institucion,
    seccion,
    sesion: sesionForDoc as any,
  };
}

// ─── Helpers para imágenes ───────────────────────────────────────────────────

/** GIF transparente de 1×1 px — reemplaza imágenes que no pudieron inlinearse */
const TRANSPARENT_1PX =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

/**
 * Intenta convertir una imagen ya cargada en el DOM a data URL vía canvas.
 * Si el canvas se tainta (CORS), devuelve false y no modifica el img.
 */
function tryInlineImage(img: HTMLImageElement): boolean {
  if (!img.complete || !img.naturalWidth) return false;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    ctx.drawImage(img, 0, 0);
    // toDataURL lanza SecurityError si el canvas está tainted (CORS)
    const dataUrl = canvas.toDataURL("image/png");
    img.src = dataUrl;
    return true;
  } catch {
    return false;
  }
}

/**
 * Pre-procesa todas las imágenes externas para evitar problemas con html2canvas:
 *  - Si se puede convertir a data URL (CORS OK) → usa data URL
 *  - Si no (CORS bloqueado) → reemplaza con pixel transparente
 *
 * Esto evita que html2canvas con useCORS:true intente re-fetchear las imágenes
 * con crossOrigin="anonymous", lo que falla y corrompe el canvas completo.
 */
function neutralizeExternalImages(container: HTMLElement): number {
  const imgs = Array.from(
    container.querySelectorAll<HTMLImageElement>("img"),
  );
  let inlined = 0;
  let stripped = 0;

  for (const img of imgs) {
    if (!img.src || img.src.startsWith("data:") || img.src.startsWith("blob:")) continue;

    if (tryInlineImage(img)) {
      inlined++;
    } else {
      img.src = TRANSPARENT_1PX;
      stripped++;
    }
  }

  if (inlined > 0) {
    console.log(`✅ [offscreen] ${inlined} imagen(es) inlineada(s) como data URL`);
  }
  if (stripped > 0) {
    console.warn(
      `⚠️ [offscreen] ${stripped} imagen(es) neutralizada(s) (CORS bloqueado). ` +
        `Configura CORS en el bucket S3 para incluirlas en el PDF.`,
    );
  }
  return inlined + stripped;
}

// ─── Offscreen Render ────────────────────────────────────────────────────────

/**
 * Renderiza SesionPremiumDoc en un contenedor oculto del DOM,
 * espera imágenes y devuelve el PDF como Blob.
 *
 * Estrategia:
 *   - position:absolute + left:0 + top:0 → en el viewport (html2canvas lo necesita).
 *   - z-index:-1 → detrás del contenido visible de la app.
 *   - Imágenes externas se convierten a data URLs (o se neutralizan si CORS falla)
 *     ANTES de llamar a generatePDFBlob, evitando que html2canvas intente
 *     re-fetchearlas con crossOrigin.
 */
export async function renderPdfOffscreen(
  data: ISesionPremiumResponse,
): Promise<Blob> {
  // 1. Contenedor — en el viewport, detrás de todo
  const container = document.createElement("div");
  Object.assign(container.style, {
    position: "absolute",
    left: "0",
    top: "0",
    width: "210mm",        // ancho A4
    zIndex: "-1",          // detrás del contenido visible
    background: "white",   // fondo explícito para captura limpia
    pointerEvents: "none",
  });
  document.body.appendChild(container);

  const root = createRoot(container);
  try {
    // 2. Montar componente con flushSync para render síncrono inmediato
    flushSync(() => {
      root.render(<SesionPremiumDoc data={data} />);
    });

    // Espera adicional para layout + estilos
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });

    // 3. Esperar carga de imágenes (con timeout de seguridad)
    const images = container.querySelectorAll("img");
    if (images.length > 0) {
      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete && img.naturalWidth > 0) return resolve();
              img.onload = () => resolve();
              img.onerror = () => resolve();
              setTimeout(resolve, 8000);
            }),
        ),
      );
      // Espera extra para repaint tras imágenes
      await new Promise((r) => setTimeout(r, 600));
    } else {
      await new Promise((r) => setTimeout(r, 400));
    }

    // 4. Neutralizar imágenes externas para evitar CORS en html2canvas
    //    Si CORS está configurado (producción) → se convierten a data URL (con imágenes)
    //    Si CORS está bloqueado (localhost) → se usa pixel transparente (solo texto)
    neutralizeExternalImages(container);

    // Log de diagnóstico
    const childCount = container.children.length;
    const innerH = container.scrollHeight;
    const innerText = container.innerText?.substring(0, 200);
    console.log(
      `📄 [offscreen] Contenedor: ${childCount} hijos, ${innerH}px alto, ${images.length} imgs`,
    );
    console.log(`📄 [offscreen] Texto preview: "${innerText}"`);

    if (innerH < 10) {
      console.error(
        "❌ [offscreen] El contenedor tiene altura ~0 — el componente no renderizó contenido",
      );
    }

    // 5. Capturar PDF
    const blob = await generatePDFBlob(container, {
      size: "A4",
      orientation: "portrait",
    });

    console.log(`📄 [offscreen] PDF generado: ${blob.size} bytes`);
    return blob;
  } finally {
    // 6. Limpiar
    root.unmount();
    document.body.removeChild(container);
  }
}
