import html2pdf from "html2pdf.js";

/**
 * Opciones para la generación de PDF local con html2pdf.js
 */
interface LocalPDFOptions {
  size?: string;
  orientation?: "portrait" | "landscape";
  margin?: number | [number, number] | [number, number, number, number];
  filename?: string;
  imageQuality?: number;
  /**
   * Si es `true`, NO fuerza maxWidth:100% en SVGs ni overflow:visible
   * en contenedores gráficos.  Útil para la Ficha de Aplicación donde
   * los gráficos ya tienen el tamaño correcto en pantalla.
   */
  preserveGraphicSize?: boolean;
}

/**
 * Convierte un Blob a data URL (base64)
 */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Convierte un elemento SVG a PNG (data URL) dibujándolo en un canvas.
 * Word no muestra bien SVG en HTML .doc; con PNG sí lo muestra.
 */
function svgToPngDataUrl(svg: SVGElement): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const rect = svg.getBoundingClientRect();
      const w = Math.max(rect.width || 400, 1);
      const h = Math.max(rect.height || 300, 1);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }
      const svgString = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        try {
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/png"));
        } catch {
          resolve(null);
        } finally {
          URL.revokeObjectURL(url);
        };
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    } catch {
      resolve(null);
    }
  });
}

/**
 * Obtiene data URL PNG de un canvas (ya dibujado).
 */
function canvasToPngDataUrl(canvas: HTMLCanvasElement): string | null {
  try {
    if (canvas.width === 0 || canvas.height === 0) return null;
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

/**
 * Intenta convertir una imagen ya cargada en el DOM a data URL usando canvas.
 * Funciona para imágenes que ya se renderizaron exitosamente en el navegador.
 */
function imgToDataUrlViaCanvas(img: HTMLImageElement): string | null {
  if (!img.complete || !img.naturalWidth) return null;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

/**
 * Fuerza la carga inmediata de todas las imágenes lazy y espera a que terminen.
 */
async function forceLoadAllImages(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll("img"));

  // Quitar loading="lazy" para forzar carga inmediata
  images.forEach((img) => {
    if (img.loading === "lazy") {
      img.loading = "eager";
    }
  });

  // Esperar a que todas terminen de cargar
  const pending = images.filter((img) => img.src && !img.complete);
  if (pending.length > 0) {
    await Promise.all(
      pending.map(
        (img) =>
          new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
            // Timeout de seguridad por imagen
            setTimeout(resolve, 10_000);
          })
      )
    );
  }
}

/** Data URL de una imagen 1x1 transparente; evita CORS cuando no se puede inlinear una imagen externa */
const PLACEHOLDER_IMAGE_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

export interface InlineExternalImagesOptions {
  /**
   * Si es true, no se hace fetch de imágenes externas (evita CORS).
   * Se reemplaza el src por un placeholder y se guarda el original para restaurar.
   * Útil para export Word cuando el bucket S3 no permite CORS desde el origen de la app.
   */
  replaceExternalWithoutFetch?: boolean;
}

/**
 * Pre-convierte todas las imágenes externas (<img> con src http/https)
 * a data URLs inline (base64) para evitar problemas de CORS con html2canvas.
 *
 * Retorna una función para restaurar los src originales después de generar el PDF.
 */
async function inlineExternalImages(
  container: HTMLElement,
  options: InlineExternalImagesOptions = {},
): Promise<() => void> {
  const { replaceExternalWithoutFetch = false } = options;

  // Paso 0: forzar carga de imágenes lazy
  await forceLoadAllImages(container);

  const images = container.querySelectorAll("img");
  const originals = new Map<HTMLImageElement, { src: string; crossOrigin: string | null }>();

  const promises = Array.from(images).map(async (img) => {
    const src = img.src;
    if (!src || src.startsWith("data:") || src.startsWith("blob:")) return;

    originals.set(img, { src, crossOrigin: img.getAttribute("crossorigin") });

    if (replaceExternalWithoutFetch) {
      img.src = PLACEHOLDER_IMAGE_DATA_URL;
      return;
    }

    // Intento 1: Si la imagen ya se cargó con crossOrigin, extraer via canvas
    if (img.crossOrigin && img.complete && img.naturalWidth > 0) {
      try {
        const dataUrl = imgToDataUrlViaCanvas(img);
        if (dataUrl) { img.src = dataUrl; return; }
      } catch { /* tainted canvas, continue */ }
    }

    // Intento 2: Recargar con crossOrigin + cache-bust (evita caché sin CORS)
    // Este es el método que funciona consistentemente con S3.
    try {
      const dataUrl = await new Promise<string | null>((resolve) => {
        const tempImg = new Image();
        tempImg.crossOrigin = "anonymous";
        const timeout = setTimeout(() => resolve(null), 15000);
        tempImg.onload = () => {
          clearTimeout(timeout);
          try {
            const canvas = document.createElement("canvas");
            canvas.width = tempImg.naturalWidth;
            canvas.height = tempImg.naturalHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(tempImg, 0, 0);
              resolve(canvas.toDataURL("image/png"));
            } else { resolve(null); }
          } catch { resolve(null); }
        };
        tempImg.onerror = () => { clearTimeout(timeout); resolve(null); };
        tempImg.src = src + (src.includes("?") ? "&" : "?") + "_cors=" + Date.now();
      });
      if (dataUrl) { img.src = dataUrl; return; }
    } catch { /* continue */ }

    // Intento 3: fetch con CORS (funciona si el servidor responde sin cache issues)
    try {
      const response = await fetch(src, { mode: "cors", credentials: "omit" });
      if (response.ok) {
        const blob = await response.blob();
        const dataUrl = await blobToDataUrl(blob);
        img.src = dataUrl;
        return;
      }
    } catch { /* CORS blocked, continue */ }

    // No se pudo inlinear: dejar data URL placeholder
    img.src = PLACEHOLDER_IMAGE_DATA_URL;
  });

  await Promise.allSettled(promises);

  // Retornar función para restaurar src originales
  return () => {
    originals.forEach(({ src: originalSrc, crossOrigin }, img) => {
      img.src = originalSrc;
      if (crossOrigin) {
        img.setAttribute("crossorigin", crossOrigin);
      }
    });
  };
}

/**
 * Desactiva temporalmente TODAS las animaciones y transiciones CSS
 * dentro del contenedor para que html2canvas capture el estado final.
 * También corrige contenedores con overflow-x:auto que impiden captura
 * completa, y fuerza SVGs a escalar al ancho disponible.
 * Retorna una función que restaura los estilos originales.
 */
function disableAnimations(container: HTMLElement, preserveGraphicSize = false): () => void {
  const style = document.createElement("style");
  style.id = "__pdf-no-anim";
  style.textContent = `
    *, *::before, *::after {
      animation: none !important;
      transition: none !important;
    }
  `;
  document.head.appendChild(style);

  // Forzar opacity:1 en .grafico-educativo (previene el bug fadeIn)
  const graficos = container.querySelectorAll<HTMLElement>(".grafico-educativo");
  const originals = new Map<HTMLElement, string>();
  graficos.forEach((el) => {
    originals.set(el, el.style.opacity);
    el.style.opacity = "1";
  });

  // Forzar opacity en SVG paths que usen opacity < 1
  const svgPaths = container.querySelectorAll<SVGElement>("svg path[opacity]");
  const svgOriginals = new Map<SVGElement, string | null>();
  svgPaths.forEach((path) => {
    svgOriginals.set(path, path.getAttribute("opacity"));
    path.setAttribute("opacity", "1");
  });

  // ── Fix overflow y SVG scaling (siempre, incluso con preserveGraphicSize) ──
  const overflowOriginals = new Map<HTMLElement, { ox: string; oy: string }>();
  const svgStyleOriginals = new Map<SVGSVGElement, { maxWidth: string; minWidth: string }>();

  {
    // Fix overflow → forzar contenedores scrollables a visible para que html2canvas
    // capture el contenido completo (sin recorte por overflow-x:auto)
    const overflowContainers = container.querySelectorAll<HTMLElement>(
      ".tabla-doble-entrada-container, .recta-numerica-container, " +
      ".circulos-fraccion-container, .barras-fraccion-container, " +
      ".diagrama-dinero-container, .figuras-geometricas-container, " +
      ".patron-visual-container, .patron-geometrico-container, " +
      ".diagrama-venn-container, .operacion-vertical-container, " +
      ".medidas-comparacion-container, .balanza-equilibrio-container, " +
      ".numeros-ordinales-container, .bloques-agrupados, " +
      ".barras-comparacion, .tabla-valores, .tabla-precios, " +
      ".ecuacion-cajas, .coordenadas-ejercicios-container, " +
      ".tabla-frecuencias-container"
    );
    overflowContainers.forEach((el) => {
      overflowOriginals.set(el, {
        ox: el.style.overflowX,
        oy: el.style.overflowY,
      });
      el.style.overflowX = "visible";
      el.style.overflowY = "visible";
    });

    // Fix SVGs: forzar max-width:100% y min-width:0 para que escalen al contenedor
    const allSvgs = container.querySelectorAll<SVGSVGElement>("svg");
    allSvgs.forEach((svg) => {
      svgStyleOriginals.set(svg, {
        maxWidth: svg.style.maxWidth,
        minWidth: svg.style.minWidth,
      });
      svg.style.maxWidth = "100%";
      svg.style.minWidth = "0";
    });
  }

  return () => {
    style.remove();
    graficos.forEach((el) => {
      el.style.opacity = originals.get(el) ?? "";
    });
    svgPaths.forEach((path) => {
      const orig = svgOriginals.get(path);
      if (orig !== null && orig !== undefined) {
        path.setAttribute("opacity", orig);
      } else {
        path.removeAttribute("opacity");
      }
    });
    overflowOriginals.forEach((orig, el) => {
      el.style.overflowX = orig.ox;
      el.style.overflowY = orig.oy;
    });
    svgStyleOriginals.forEach((orig, svg) => {
      svg.style.maxWidth = orig.maxWidth;
      svg.style.minWidth = orig.minWidth;
    });
  };
}

/**
 * Crea un overlay opaco sobre el elemento para ocultar los cambios de DOM
 * que se realizan antes de la captura (resize de SVGs, overflow, etc.).
 * Retorna una función para eliminar el overlay.
 */
function createCaptureOverlay(element: HTMLElement): () => void {
  const parent = element.parentElement;
  if (!parent) return () => {};

  // Asegurar que el padre tenga position relativa para que el overlay se posicione
  const prevPosition = parent.style.position;
  if (!prevPosition || prevPosition === "static") {
    parent.style.position = "relative";
  }

  const overlay = document.createElement("div");
  overlay.id = "__pdf-capture-overlay";
  Object.assign(overlay.style, {
    position: "absolute",
    inset: "0",
    zIndex: "9999",
    backgroundColor: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "inherit",
    fontSize: "14px",
    color: "#64748b",
    fontFamily: "system-ui, sans-serif",
    gap: "8px",
  });
  overlay.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
         style="animation:spin 1s linear infinite">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
    </svg>
    Preparando PDF…
  `;
  parent.appendChild(overlay);

  return () => {
    overlay.remove();
    if (!prevPosition || prevPosition === "static") {
      parent.style.position = prevPosition;
    }
  };
}

/**
 * Configuración base para html2pdf.js.
 * Best practice: use pagebreak.avoid so elements are not split across pages,
 * reducing white gaps. Tighter margins and avoid list improve fit.
 */
function getHtml2PdfOptions(options: LocalPDFOptions = {}) {
  const {
    size = "a4",
    orientation = "portrait",
    margin = [8, 6, 8, 6], // top, left, bottom, right en mm — tighter to fit more per page
    filename = "documento.pdf",
    imageQuality = 0.98,
  } = options;

  return {
    margin,
    filename,
    image: { type: "jpeg" as const, quality: imageQuality },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false,
    },
    jsPDF: {
      unit: "mm" as const,
      format: size,
      orientation,
    },
    // Reduce white gaps: avoid splitting inside these; whole block moves to next page
    pagebreak: {
      mode: ["css", "legacy"] as const,
      before: [],
      after: [],
      avoid: ["tr", "table", "img", ".no-break", ".keep-together", "svg", ".grafico-educativo"],
    },
  };
}

/**
 * Genera y descarga un PDF desde un elemento HTML del DOM
 * @param element Elemento HTML a convertir
 * @param filenameOrOpts Nombre del archivo PDF (string) o las opciones directamente
 * @param options Opciones adicionales de generación (si el 2do arg es filename)
 */
export async function generateAndDownloadPDF(
  element: HTMLElement,
  filenameOrOpts?: string | Partial<LocalPDFOptions>,
  options?: Partial<LocalPDFOptions>,
): Promise<void> {
  // Normalizar argumentos: soporta (el, opts) y (el, filename, opts)
  const merged: Partial<LocalPDFOptions> =
    typeof filenameOrOpts === "string"
      ? { ...options, filename: filenameOrOpts }
      : { ...filenameOrOpts };

  const { preserveGraphicSize = false, ...rest } = merged;

  // Overlay para ocultar cambios de DOM al usuario
  const removeOverlay = preserveGraphicSize ? createCaptureOverlay(element) : () => {};
  // Pre-convertir imágenes externas a data URLs para evitar problemas de CORS
  const restoreImages = await inlineExternalImages(element);
  // Desactivar animaciones/transiciones para captura limpia
  const restoreAnimations = disableAnimations(element, preserveGraphicSize);
  try {
    const pdfOptions = getHtml2PdfOptions(rest);

    await html2pdf().set(pdfOptions).from(element).save();
  } catch (error) {
    console.error("Error al generar y descargar PDF:", error);
    throw error;
  } finally {
    restoreAnimations();
    restoreImages();
    removeOverlay();
  }
}

/**
 * Genera un PDF Blob desde un elemento HTML (sin descargar)
 * @param element Elemento HTML a convertir
 * @param options Opciones adicionales de generación
 * @returns Blob del PDF generado
 */
export async function generatePDFBlob(
  element: HTMLElement,
  options: Partial<LocalPDFOptions> = {}
): Promise<Blob> {
  const { preserveGraphicSize = false, ...rest } = options;

  const removeOverlay = preserveGraphicSize ? createCaptureOverlay(element) : () => {};
  // Pre-convertir imágenes externas a data URLs para evitar problemas de CORS
  const restoreImages = await inlineExternalImages(element);
  // Desactivar animaciones/transiciones para captura limpia
  const restoreAnimations = disableAnimations(element, preserveGraphicSize);
  try {
    const pdfOptions = getHtml2PdfOptions(rest);

    const blob: Blob = await html2pdf()
      .set(pdfOptions)
      .from(element)
      .outputPdf("blob");

    return blob;
  } catch (error) {
    console.error("Error al generar PDF Blob:", error);
    throw error;
  } finally {
    restoreAnimations();
    restoreImages();
    removeOverlay();
  }
}

/**
 * Descarga un PDF generado desde un blob
 * @param blob Blob del PDF
 * @param filename Nombre del archivo a descargar
 */
export function downloadPDF(blob: Blob, filename: string = "documento.pdf"): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/** Placeholder de texto para gráficos/imágenes cuando no se puede exportar con imagen */
function createGraphicPlaceholder(text: string): HTMLElement {
  const span = document.createElement("span");
  span.style.cssText =
    "display:inline-block; margin:2pt 0; padding:2pt 6pt; background:#f0f0f0; color:#666; font-size:8pt; font-style:italic; line-height:1.2; border:1px solid #ddd;";
  span.textContent = text;
  return span;
}

/**
 * Genera un Word (.docx) vía backend (SayPDF) y lo sube a S3.
 *
 * Flujo: genera el PDF con el mismo motor de siempre (html2canvas + jsPDF)
 * → envía el PDF blob + sesionId al backend → backend convierte con SayPDF
 * → sube .docx a S3 → guarda wordUrl en la sesión → notifica vía Socket.IO.
 *
 * @param element Contenedor HTML a exportar
 * @param sesionId ID de la sesión (para guardar wordUrl en la BD)
 * @param pdfOptions Opciones opcionales para la generación del PDF intermedio
 * @returns La wordUrl guardada en S3
 */
export async function generateAndUploadWord(
  element: HTMLElement,
  sesionId: string,
  pdfOptions: Partial<LocalPDFOptions> = {},
): Promise<string> {
  const { convertPdfToWordViaApi } = await import("@/services/pdfToWord.service");
  const pdfBlob = await generatePDFBlob(element, pdfOptions);
  return convertPdfToWordViaApi(pdfBlob, sesionId);
}
