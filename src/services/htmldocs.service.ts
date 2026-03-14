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

    // Opción: no hacer fetch (evitar CORS en export Word)
    if (replaceExternalWithoutFetch) {
      img.src = PLACEHOLDER_IMAGE_DATA_URL;
      return;
    }

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
      // Continuar
    }

    // No se pudo inlinear (p. ej. CORS): usar placeholder para no dejar URL externa en el DOM
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

/** Nota editable para Word (compatible con .doc y .docx) */
const EDITABLE_NOTICE_HTML = `
  <div style="margin-bottom:14pt; padding:8pt; background:#E8F4FD; border:1px solid #B6D4E8; font-size:10pt; color:#1a1a1a;">
    <strong>Este documento puede editarse en Word.</strong> Si Word muestra "Protegido", haga clic en <strong>Habilitar edición</strong>.
    Puede cambiar el nombre del director(a) y otros datos en las tablas. La línea <strong>Docente</strong> está bloqueada y no se puede editar.
  </div>`;

/**
 * Genera y descarga un documento Word desde un elemento HTML.
 * Intenta generar .docx con imágenes embebidas usando @turbodocx/html-to-docx;
 * si la librería no está disponible o falla, descarga .doc (HTML) con placeholders de texto.
 *
 * @param element Contenedor HTML a exportar (ej. el div que envuelve SesionPremiumDoc o UnidadDoc)
 * @param filename Nombre del archivo sin extensión o con .doc/.docx (se normaliza)
 */
export async function generateAndDownloadWord(
  element: HTMLElement,
  filename: string = "documento.doc",
): Promise<void> {
  const baseNameNoExt = filename.replace(/\.docx?$/i, "");
  const docxName = baseNameNoExt + ".docx";
  const docName = baseNameNoExt + ".doc";

  await forceLoadAllImages(element);
  // No hacer fetch de imágenes externas (S3 sin CORS): usar placeholder y evitar errores CORS
  const restoreImages = await inlineExternalImages(element, { replaceExternalWithoutFetch: true });
  const restoreAnimations = disableAnimations(element, false);

  try {
    // Convertir SVG/canvas del original a PNG (data URL) para que el DOCX pueda embeder imágenes
    const svgAndCanvas = Array.from(element.querySelectorAll("svg, canvas")) as (SVGElement | HTMLCanvasElement)[];
    const dataUrls: (string | null)[] = [];
    const dimensions: { w: number; h: number }[] = [];
    for (const el of svgAndCanvas) {
      if (el.tagName === "CANVAS") {
        const c = el as HTMLCanvasElement;
        dataUrls.push(canvasToPngDataUrl(c));
        dimensions.push({ w: c.width, h: c.height });
      } else {
        const dataUrl = await svgToPngDataUrl(el as SVGElement);
        dataUrls.push(dataUrl);
        const rect = el.getBoundingClientRect();
        dimensions.push({ w: Math.round(rect.width) || 400, h: Math.round(rect.height) || 300 });
      }
    }

    const clone = element.cloneNode(true) as HTMLElement;
    clone.querySelectorAll(".no-print").forEach((el) => el.remove());

    clone.querySelectorAll<HTMLElement>("[data-word-lock='docente']").forEach((cell) => {
      cell.setAttribute("contenteditable", "false");
      cell.setAttribute("contentEditable", "false");
    });

    // Reemplazar SVG/canvas por <img> con PNG (o placeholder si falló la conversión)
    const cloneSvgCanvas = Array.from(clone.querySelectorAll("svg, canvas"));
    cloneSvgCanvas.forEach((el, idx) => {
      const dataUrl = dataUrls[idx];
      const dim = dimensions[idx];
      const parent = el.parentElement;
      if (!parent || !dim) return;
      if (dataUrl) {
        const img = document.createElement("img");
        img.alt = "Gráfico educativo";
        img.src = dataUrl;
        img.style.maxWidth = "100%";
        img.style.height = "auto";
        const maxW = 450;
        if (dim.w > maxW) {
          img.setAttribute("width", String(maxW));
          img.setAttribute("height", String(Math.round((dim.h * maxW) / dim.w)));
        } else if (dim.w > 0 && dim.h > 0) {
          img.setAttribute("width", String(dim.w));
          img.setAttribute("height", String(dim.h));
        }
        parent.replaceChild(img, el);
      } else {
        parent.replaceChild(createGraphicPlaceholder("[Gráfico — ver PDF]"), el);
      }
    });

    const fullHtml = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><title>Documento</title>
  <style>body{font-family:Arial,Helvetica,sans-serif;margin:1cm;color:#1a1a1a;} table{border-collapse:collapse;width:100%;} th,td{border:1px solid #333;padding:6px 8px;vertical-align:top;} img{max-width:100%;height:auto;} h1,h2,h3{margin-top:12pt;margin-bottom:6pt;} p{margin:4pt 0;} ul,ol{margin:4pt 0;padding-left:24px;}</style></head><body>${EDITABLE_NOTICE_HTML}${clone.innerHTML}</body></html>`;

    // Intentar generar .docx con imágenes usando @turbodocx/html-to-docx
    const docxMime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    let docxBlob: Blob | null = null;
    try {
      const { default: HtmlToDocx } = await import("@turbodocx/html-to-docx");
      if (typeof HtmlToDocx !== "function")
        throw new Error("Función de conversión no disponible");
      const result = await HtmlToDocx(fullHtml, null, {
        title: "DocentePro",
        creator: "DocentePro",
        table: { row: { cantSplit: true } },
        preprocessing: { skipHTMLMinify: true },
      });
      if (result instanceof Blob) docxBlob = result;
      else if (result instanceof ArrayBuffer || result instanceof Uint8Array)
        docxBlob = new Blob([result], { type: docxMime });
      else if (result && typeof (result as ArrayBuffer).byteLength !== "undefined")
        docxBlob = new Blob([result as ArrayBuffer], { type: docxMime });
    } catch (err) {
      console.warn("[Word] No se pudo generar .docx, usando .doc:", err);
    }

    if (docxBlob) {
      const url = window.URL.createObjectURL(docxBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = docxName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return;
    }

    // Fallback: .doc (HTML) sin imágenes embebidas — reemplazar todas las imágenes por texto para evitar icono roto
    clone.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
      const span = createGraphicPlaceholder("[Imagen — ver versión PDF]");
      img.parentElement?.replaceChild(span, img);
    });
    const docHtml = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head><meta charset="UTF-8"/><meta name="ProgId" content="Word.Document"/><title>Documento</title>
<style>body{font-family:Arial,sans-serif;margin:1cm;} table{border-collapse:collapse;} th,td{border:1px solid #333;padding:6px 8px;} img{max-width:100%;}</style></head>
<body>${EDITABLE_NOTICE_HTML}${clone.innerHTML}</body></html>`;
    const blob = new Blob(["\uFEFF" + docHtml], { type: "application/msword" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = docName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } finally {
    restoreAnimations();
    restoreImages();
  }
}
