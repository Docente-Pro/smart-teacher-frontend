import { useState, RefObject, useEffect } from "react";
import { generateAndDownloadPDF } from "@/services/htmldocs.service";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { solicitarUploadPDF, subirPDFaS3, confirmarUploadPDF } from "@/services/sesiones.service";
import { useSesionStore } from "@/store/sesion.store";

export function usePDFGeneration(documentRef: RefObject<HTMLDivElement>, area?: string) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { sesion } = useSesionStore();

  // Guardar automáticamente en la nube al cargar la página (solo una vez)
  useEffect(() => {
    const guardarAutomaticamente = async () => {
      if (!documentRef.current || !sesion || isSaved) return;

      try {
        // Esperar un momento para que el documento se renderice completamente
        await new Promise(resolve => setTimeout(resolve, 2000));

        const { generatePDFBlob } = await import("@/services/htmldocs.service");
        const pdfBlob = await generatePDFBlob(documentRef.current, {
          size: "A4",
          orientation: "portrait",
        });

        const { data } = await solicitarUploadPDF({
          area: sesion.datosGenerales.area,
          titulo: sesion.titulo || "Sesión de Aprendizaje",
          grado: sesion.datosGenerales.grado,
          nivel: sesion.datosGenerales.nivel,
        });

        await subirPDFaS3(data.uploadUrl, pdfBlob);
        
        // Polling para confirmar
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        let intentos = 0;
        const maxIntentos = 5;
        
        while (intentos < maxIntentos) {
          try {
            await confirmarUploadPDF(data.sesionId);
            setIsSaved(true);
            console.log("✅ Sesión guardada automáticamente en la nube");
            return;
          } catch (error) {
            intentos++;
            if (intentos >= maxIntentos) {
              console.error("No se pudo verificar la subida");
              return;
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      } catch (error) {
        console.error("Error al guardar automáticamente:", error);
      }
    };

    guardarAutomaticamente();
  }, [documentRef, sesion, isSaved]);

  const handleDownloadPDF = async () => {
    if (!documentRef.current) {
      handleToaster("No se pudo acceder al documento", "error");
      return;
    }

    const timestamp = Date.now().toString().slice(-8);
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
      handleToaster("PDF descargado exitosamente", "success");
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
