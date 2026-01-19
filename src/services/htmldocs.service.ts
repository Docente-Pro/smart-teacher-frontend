import axios from "axios";

const HTMLDOCS_API_URL = import.meta.env.VITE_HTMLDOCS_API_URL;
const HTMLDOCS_API_KEY = import.meta.env.VITE_HTMLDOCS_API_KEY;

interface GeneratePDFOptions {
  html: string;
  url?: string;
  format?: "pdf" | "base64" | "json";
  size?: string; // A3, A4, A5, letter, legal, or custom like '8.5in 11in'
  orientation?: "portrait" | "landscape";
}

interface GeneratePDFResponse {
  data: Blob | string; // Blob for PDF, string for base64 or JSON URL
}

/**
 * Genera un PDF desde contenido HTML usando la API de HTMLDocs
 * @param options Opciones de generación del PDF
 * @returns Promise con el PDF generado
 */
export async function generatePDFFromHTML(
  options: GeneratePDFOptions
): Promise<GeneratePDFResponse> {
  try {
    const {
      html,
      url,
      format = "pdf",
      size = "A4",
      orientation = "portrait",
    } = options;

    const response = await axios.post(
      HTMLDOCS_API_URL,
      {
        html,
        url,
        format,
        size,
        orientation,
      },
      {
        headers: {
          Authorization: `Bearer ${HTMLDOCS_API_KEY}`,
          "Content-Type": "application/json",
        },
        responseType: format === "pdf" ? "blob" : "json",
      }
    );

    return {
      data: response.data,
    };
  } catch (error) {
    console.error("Error al generar PDF con HTMLDocs:", error);
    throw new Error("No se pudo generar el PDF. Por favor, intenta nuevamente.");
  }
}

/**
 * Descarga un PDF generado
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

/**
 * Convierte un elemento HTML DOM a string para enviar a la API
 * @param element Elemento HTML a convertir
 * @returns String con el HTML
 */
export function htmlElementToString(element: HTMLElement): string {
  return element.outerHTML;
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
  options: Partial<GeneratePDFOptions> = {}
): Promise<void> {
  try {
    const html = htmlElementToString(element);
    
    const response = await generatePDFFromHTML({
      html,
      format: "pdf",
      size: "A4",
      orientation: "portrait",
      ...options,
    });

    if (response.data instanceof Blob) {
      downloadPDF(response.data, filename);
    } else {
      throw new Error("Formato de respuesta inválido");
    }
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
  options: Partial<GeneratePDFOptions> = {}
): Promise<Blob> {
  try {
    const html = htmlElementToString(element);
    
    const response = await generatePDFFromHTML({
      html,
      format: "pdf",
      size: "A4",
      orientation: "portrait",
      ...options,
    });

    if (response.data instanceof Blob) {
      return response.data;
    } else {
      throw new Error("Formato de respuesta inválido");
    }
  } catch (error) {
    console.error("Error al generar PDF Blob:", error);
    throw error;
  }
}
