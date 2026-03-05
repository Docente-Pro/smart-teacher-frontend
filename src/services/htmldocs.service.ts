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

/**
 * Pre-convierte todas las imágenes externas (<img> con src http/https)
 * a data URLs inline (base64) para evitar problemas de CORS con html2canvas.
 *
 * Retorna una función para restaurar los src originales después de generar el PDF.
 */
async function inlineExternalImages(container: HTMLElement): Promise<() => void> {
  // Paso 0: forzar carga de imágenes lazy
  await forceLoadAllImages(container);

  const images = container.querySelectorAll("img");
  const originals = new Map<HTMLImageElement, { src: string; crossOrigin: string | null }>();

  const promises = Array.from(images).map(async (img) => {
    const src = img.src;
    if (!src || src.startsWith("data:") || src.startsWith("blob:")) return;

    originals.set(img, { src, crossOrigin: img.getAttribute("crossorigin") });

    // Intento 1: Si la imagen ya tiene crossOrigin, intentar canvas directo
    if (img.crossOrigin) {
      try {
        const dataUrl = imgToDataUrlViaCanvas(img);
        if (dataUrl) {
          img.src = dataUrl;
          return;
        }
      } catch { /* tainted canvas, continue */ }
    }

    // Intento 2: fetch con CORS → blob → data URL
    try {
      const response = await fetch(src, { mode: "cors", credentials: "omit" });
      if (response.ok) {
        const blob = await response.blob();
        const dataUrl = await blobToDataUrl(blob);
        img.src = dataUrl;
        return;
      }
    } catch {
      // CORS bloqueado, intentar fallback
    }

    // Intento 3: re-cargar con crossOrigin y dibujar en canvas
    try {
      const dataUrl = await new Promise<string | null>((resolve) => {
        const tempImg = new Image();
        tempImg.crossOrigin = "anonymous";
        tempImg.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = tempImg.naturalWidth;
            canvas.height = tempImg.naturalHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(tempImg, 0, 0);
              resolve(canvas.toDataURL("image/png"));
            } else {
              resolve(null);
            }
          } catch {
            resolve(null);
          }
        };
        tempImg.onerror = () => resolve(null);
        // Añadir cache-bust para evitar que el navegador reuse la versión sin CORS
        tempImg.src = src + (src.includes("?") ? "&" : "?") + "_cb=" + Date.now();
      });
      if (dataUrl) {
        img.src = dataUrl;
        return;
      }
    } catch {
      // Continuar al siguiente intento
    }

    // Intento 4: canvas desde la imagen DOM (sin crossOrigin, puede fallar por taint)
    try {
      const dataUrl = imgToDataUrlViaCanvas(img);
      if (dataUrl) {
        img.src = dataUrl;
        return;
      }
    } catch {
      console.warn("No se pudo convertir imagen a data URL:", src);
    }

    console.warn("Todos los intentos de inline fallaron para:", src);
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

  // ── Solo si NO se quiere preservar el tamaño de gráficos ──
  const overflowOriginals = new Map<HTMLElement, { ox: string; oy: string }>();
  const svgStyleOriginals = new Map<SVGSVGElement, string>();

  if (!preserveGraphicSize) {
    // Fix overflow → forzar contenedores scrollables a visible
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

    // Fix SVGs: forzar max-width:100% para que escalen al contenedor
    const allSvgs = container.querySelectorAll<SVGSVGElement>("svg");
    allSvgs.forEach((svg) => {
      svgStyleOriginals.set(svg, svg.style.maxWidth);
      svg.style.maxWidth = "100%";
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
      svg.style.maxWidth = orig;
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
 * Configuración base para html2pdf.js
 */
function getHtml2PdfOptions(options: LocalPDFOptions = {}) {
  const {
    size = "a4",
    orientation = "portrait",
    margin = [10, 8, 10, 8], // top, left, bottom, right en mm
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
    pagebreak: { mode: ["css", "legacy"] as const },
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
