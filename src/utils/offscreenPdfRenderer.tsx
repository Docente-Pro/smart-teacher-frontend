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
import { useAuthStore } from "@/store/auth.store";
import { getInsigniaDataUrl } from "@/utils/insigniaCache";

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
    /* no se pudo parsear */
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
    ...(contenido.tipo ? { tipo: contenido.tipo } : {}),
    ...(contenido.formatoFrontTutoria
      ? { formatoFrontTutoria: contenido.formatoFrontTutoria }
      : {}),
    ...(contenido.formatoFrontPlanLector
      ? { formatoFrontPlanLector: contenido.formatoFrontPlanLector }
      : {}),
    ...(contenido.dimension ? { dimension: contenido.dimension } : {}),
  };

  return {
    success: true,
    docente,
    institucion,
    seccion,
    sesion: sesionForDoc as any,
  };
}

// ─── Offscreen Render ────────────────────────────────────────────────────────

/**
 * Renderiza SesionPremiumDoc en un contenedor oculto del DOM,
 * espera imágenes y devuelve el PDF como Blob.
 *
 * Estrategia:
 *   - position:absolute + left:0 + top:0 → en el viewport (html2canvas lo necesita).
 *   - z-index:-1 → detrás del contenido visible de la app.
 *   - Las imágenes se montan sin crossOrigin para que siempre se muestren;
 *     generatePDFBlob las re-descarga con CORS y las inlinea como data URLs
 *     antes de rasterizar.
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
    const insigniaUrl = getInsigniaDataUrl(useAuthStore.getState().user?.insigniaUrl);
    flushSync(() => {
      root.render(<SesionPremiumDoc data={data} insigniaUrl={insigniaUrl} />);
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

    const innerH = container.scrollHeight;
    if (innerH < 10) {
      console.error(
        "[offscreen] El contenedor tiene altura ~0 — el componente no renderizó contenido",
      );
    }

    // 4. Capturar PDF (generatePDFBlob convierte las imágenes externas a
    //    data URLs re-descargándolas con CORS antes de rasterizar)
    const blob = await generatePDFBlob(container, {
      size: "A4",
      orientation: "portrait",
    });

    return blob;
  } finally {
    // 5. Limpiar
    root.unmount();
    document.body.removeChild(container);
  }
}
