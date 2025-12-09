import { useState, RefObject } from "react";
import { generateAndDownloadPDF } from "@/services/htmldocs.service";
import { handleToaster } from "@/utils/Toasters/handleToasters";

export function usePDFGeneration(documentRef: RefObject<HTMLDivElement>, area?: string) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    if (!documentRef.current) {
      handleToaster("No se pudo acceder al documento", "error");
      return;
    }

    // Generar nombre de archivo dinámico con timestamp único
    const timestamp = Date.now().toString().slice(-8); // Últimos 8 dígitos del timestamp
    const areaLimpia = area ? area.toLowerCase().replace(/\s+/g, '-') : 'sesion';
    const nombreArchivo = `sesion-${areaLimpia}-${timestamp}.pdf`;

    setIsGenerating(true);
    try {
      await generateAndDownloadPDF(
        documentRef.current,
        nombreArchivo,
        {
          size: "A4",
          orientation: "portrait",
        }
      );
      handleToaster("PDF generado exitosamente", "success");
    } catch (error) {
      handleToaster("Error al generar el PDF", "error");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return {
    isGenerating,
    handleDownloadPDF,
    handlePrint,
  };
}
