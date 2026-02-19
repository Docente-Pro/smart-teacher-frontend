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
 * Pre-convierte todas las imágenes externas (<img> con src http/https)
 * a data URLs inline (base64) para evitar problemas de CORS con html2canvas.
 *
 * Retorna una función para restaurar los src originales después de generar el PDF.
 */
async function inlineExternalImages(container: HTMLElement): Promise<() => void> {
  const images = container.querySelectorAll("img");
  const originals = new Map<HTMLImageElement, string>();

  const promises = Array.from(images).map(async (img) => {
    const src = img.src;
    if (!src || src.startsWith("data:") || src.startsWith("blob:")) return;

    originals.set(img, src);

    // Intento 1: fetch con CORS → blob → data URL
    try {
      const response = await fetch(src, { mode: "cors" });
      if (response.ok) {
        const blob = await response.blob();
        const dataUrl = await blobToDataUrl(blob);
        img.src = dataUrl;
        return;
      }
    } catch {
      // CORS bloqueado, intentar fallback
    }

    // Intento 2: dibujar la imagen ya cargada en un canvas
    try {
      const dataUrl = imgToDataUrlViaCanvas(img);
      if (dataUrl) {
        img.src = dataUrl;
        return;
      }
    } catch {
      console.warn("No se pudo convertir imagen a data URL:", src);
    }

    // Intento 3: re-cargar con crossOrigin y dibujar en canvas
    try {
      const dataUrl = await new Promise<string | null>((resolve) => {
        const tempImg = new Image();
        tempImg.crossOrigin = "anonymous";
        tempImg.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = tempImg.naturalWidth;
          canvas.height = tempImg.naturalHeight;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(tempImg, 0, 0);
            try {
              resolve(canvas.toDataURL("image/png"));
            } catch {
              resolve(null);
            }
          } else {
            resolve(null);
          }
        };
        tempImg.onerror = () => resolve(null);
        tempImg.src = src;
      });
      if (dataUrl) {
        img.src = dataUrl;
      }
    } catch {
      console.warn("Todos los intentos fallaron para:", src);
    }
  });

  await Promise.allSettled(promises);

  // Retornar función para restaurar src originales
  return () => {
    originals.forEach((originalSrc, img) => {
      img.src = originalSrc;
    });
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
    image: { type: "jpeg", quality: imageQuality },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false,
    },
    jsPDF: {
      unit: "mm",
      format: size,
      orientation,
    },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
  };
}

/**
 * Genera y descarga un PDF desde un elemento HTML del DOM
 * @param element Elemento HTML a convertir
 * @param filename Nombre del archivo PDF
 * @param options Opciones adicionales de generación
 */
export async function generateAndDownloadPDF(
  element: HTMLElement,
  filename: string = "documento.pdf",
  options: Partial<LocalPDFOptions> = {}
): Promise<void> {
  // Pre-convertir imágenes externas a data URLs para evitar problemas de CORS
  const restoreImages = await inlineExternalImages(element);
  try {
    const pdfOptions = getHtml2PdfOptions({
      ...options,
      filename,
    });

    await html2pdf().set(pdfOptions).from(element).save();
  } catch (error) {
    console.error("Error al generar y descargar PDF:", error);
    throw error;
  } finally {
    restoreImages();
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
  // Pre-convertir imágenes externas a data URLs para evitar problemas de CORS
  const restoreImages = await inlineExternalImages(element);
  try {
    const pdfOptions = getHtml2PdfOptions(options);

    const blob: Blob = await html2pdf()
      .set(pdfOptions)
      .from(element)
      .outputPdf("blob");

    return blob;
  } catch (error) {
    console.error("Error al generar PDF Blob:", error);
    throw error;
  } finally {
    restoreImages();
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
