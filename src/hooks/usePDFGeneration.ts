import { useState, RefObject, useEffect, useCallback, useRef } from "react";
import { generateAndDownloadPDF } from "@/services/htmldocs.service";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { crearSesion, solicitarUploadPDF, subirPDFaS3, confirmarUploadPDF } from "@/services/sesiones.service";
import { useSesionStore } from "@/store/sesion.store";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";

export function usePDFGeneration(documentRef: RefObject<HTMLDivElement>, area?: string) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedSesionId, setSavedSesionId] = useState<string | null>(null);
  const guardadoIniciado = useRef(false); // Evitar doble envío
  const { sesion } = useSesionStore();
  const { user } = useAuthStore();
  const { user: usuario } = useUserStore();

  /**
   * Flujo completo de guardado en la nube (4 pasos):
   * 0. Crear la sesión en la BD (POST /api/sesion) → obtener id
   * 1. Pedir URL pre-firmada al backend (POST /api/sesion/upload-url)
   * 2. Subir PDF directo a S3
   * 3. Confirmar subida y guardar JSON de la sesión
   */
  const guardarEnNube = useCallback(async () => {
    if (!documentRef.current || !sesion || !user?.id) return;
    if (guardadoIniciado.current) return; // Ya se inició un guardado
    guardadoIniciado.current = true;

    setIsSaving(true);
    try {
      // Generar el PDF como Blob
      const { generatePDFBlob } = await import("@/services/htmldocs.service");
      const pdfBlob = await generatePDFBlob(documentRef.current, {
        size: "A4",
        orientation: "portrait",
      });

      const usuarioId = user.id;

      // Parsear duración (string "90 minutos" → number 90)
      const duracionStr = sesion.datosGenerales?.duracion || "90";
      const duracionNum = parseInt(duracionStr, 10) || 90;

      // PASO 0 — Crear la sesión en la BD
      // Preferir gradoId de la sesión (seleccionado en Step1 para secundaria)
      const gradoIdFinal = sesion.gradoId ?? usuario.gradoId ?? 1;
      const respuestaCrear = await crearSesion({
        titulo: sesion.titulo || "Sesión de aprendizaje",
        usuarioId,
        nivelId: usuario.nivelId ?? 1,
        gradoId: gradoIdFinal,
        problematicaId: usuario.problematicaId ?? 1,
        duracion: duracionNum,
        ...(sesion.areaId ? { areaId: sesion.areaId } : {}),
      });

      // El backend puede devolver { id } o { data: { id } } o { success, data: { id } }
      const sesionId = (respuestaCrear as any)?.data?.id 
        ?? (respuestaCrear as any)?.id 
        ?? respuestaCrear?.id;

      if (!sesionId) {
        throw new Error("No se obtuvo el ID de la sesión creada. Respuesta: " + JSON.stringify(respuestaCrear));
      }
      // PASO 1 — Pedir URL de subida
      const respuestaUpload = await solicitarUploadPDF({
        sesionId,
        usuarioId,
      });

      // El backend puede devolver { data: { uploadUrl } } o { uploadUrl } directamente
      const uploadData = (respuestaUpload as any)?.data ?? respuestaUpload;

      // PASO 2 — Subir PDF directo a S3
      await subirPDFaS3(uploadData.uploadUrl, pdfBlob);

      // PASO 3 — Confirmar subida y guardar JSON
      const respuestaConfirm = await confirmarUploadPDF({
        sesionId,
        usuarioId,
        key: uploadData.key,
        contenido: sesion,
        ...(sesion.areaId ? { areaId: sesion.areaId } : {}),
      });

      const confirmData = (respuestaConfirm as any)?.data ?? respuestaConfirm;

      setSavedSesionId(sesionId);
      setIsSaved(true);
      return confirmData;
    } catch (error) {
      console.error("❌ Error al guardar en la nube:", error);
      guardadoIniciado.current = false; // Permitir reintentar si falla
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [documentRef, sesion, user?.id, usuario]);

  // Guardar automáticamente en la nube al cargar la página (solo una vez)
  useEffect(() => {
    if (!documentRef.current || !sesion || !user?.id || isSaved || guardadoIniciado.current) return;

    // Esperar a que todas las imágenes del documento estén cargadas antes de generar el PDF
    const waitForImages = (): Promise<void> => {
      const images = Array.from(documentRef.current?.querySelectorAll("img") || []);
      
      // Forzar carga inmediata de imágenes lazy
      images.forEach((img) => {
        if (img.loading === "lazy") {
          img.loading = "eager";
        }
      });

      const pending = images.filter((img) => img.src && !img.complete);
      if (pending.length === 0) return Promise.resolve();
      
      return Promise.all(
        pending.map(
          (img) =>
            new Promise<void>((resolve) => {
              img.onload = () => resolve();
              img.onerror = () => resolve(); // No bloquear por imágenes rotas
              // Timeout de 10s por imagen
              setTimeout(resolve, 10_000);
            })
        )
      ).then(() => {});
    };

    const timer = setTimeout(async () => {
      try {
        await waitForImages();
        // Dar un pequeño margen extra para renderizado
        await new Promise((r) => setTimeout(r, 500));
        await guardarEnNube();
      } catch (error) {
        console.error("Error al guardar automáticamente:", error);
      }
    }, 3000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo al montar — el ref evita doble ejecución

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

      // Guardar también en la nube si aún no se ha guardado
      if (!isSaved && user?.id) {
        try {
          await guardarEnNube();
          handleToaster("Sesión guardada en la nube", "success");
        } catch {
          // No bloquear la descarga si falla el guardado
          // No se pudo guardar en la nube
        }
      }
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
    isSaving,
    isSaved,
    savedSesionId,
    handleDownloadPDF,
    handlePrint,
    guardarEnNube,
  };
}
