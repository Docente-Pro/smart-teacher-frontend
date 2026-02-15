import html2pdf from "html2pdf.js";

/**
 * Opciones para la generación de PDF local con html2pdf.js
 */
interface LocalPDFOptions {
  size?: string;
  orientation?: "portrait" | "landscape";
  margin?: number | number[];
  filename?: string;
  imageQuality?: number;
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
  try {
    const pdfOptions = getHtml2PdfOptions({
      ...options,
      filename,
    });

    await html2pdf().set(pdfOptions).from(element).save();
  } catch (error) {
    console.error("Error al generar y descargar PDF:", error);
    throw error;
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
