import { useState, RefObject, useEffect, useCallback, useRef } from "react";
import { generateAndDownloadPDF } from "@/services/htmldocs.service";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import {
  solicitarUploadUrlUnidad,
  confirmarUploadUnidad,
} from "@/services/unidad.service";
import { useUnidadStore } from "@/store/unidad.store";
import { useAuthStore } from "@/store/auth.store";

/**
 * Hook para generación y guardado de PDF de Unidades de Aprendizaje.
 *
 * Flujo de guardado en nube (3 pasos — la unidad ya existe en BD):
 * 1. Pedir URL pre-firmada: POST /api/unidad/upload-url
 * 2. Subir PDF directo a S3 (PUT presigned)
 * 3. Confirmar subida: POST /api/unidad/confirmar-upload
 */
export function useUnidadPDFGeneration(documentRef: RefObject<HTMLDivElement>) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const guardadoIniciado = useRef(false);
  const { unidadId, datosBase } = useUnidadStore();
  const { user } = useAuthStore();

  /* ─── Subir PDF a S3 usando fetch (misma lógica que sesiones) ─── */
  const subirPDFaS3 = useCallback(async (uploadUrl: string, pdfBlob: Blob): Promise<void> => {
    console.log("📤 PUT a S3:", uploadUrl.substring(0, 120) + "...");
    console.log("📦 Tamaño del PDF:", pdfBlob.size, "bytes");

    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/pdf",
      },
      body: pdfBlob,
      mode: "cors",
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("❌ Error S3:", response.status, errorText);
      throw new Error(`Error al subir archivo a S3: ${response.status} ${response.statusText}`);
    }

    console.log("✅ PDF subido a S3 exitosamente");
  }, []);

  /* ─── Guardar en la nube ─── */
  const guardarEnNube = useCallback(async () => {
    if (!documentRef.current || !unidadId || !user?.id) return;
    if (guardadoIniciado.current) return;
    guardadoIniciado.current = true;

    setIsSaving(true);
    try {
      // Generar PDF como Blob
      const { generatePDFBlob } = await import("@/services/htmldocs.service");
      const pdfBlob = await generatePDFBlob(documentRef.current, {
        size: "A4",
        orientation: "landscape",
      });

      const usuarioId = user.id;

      // PASO 1 — Pedir URL de subida
      console.log("📤 Paso 1: Solicitando URL de subida para unidad...", { unidadId, usuarioId });
      const respuestaUpload = await solicitarUploadUrlUnidad({ unidadId, usuarioId });

      console.log("📦 Respuesta upload-url:", JSON.stringify(respuestaUpload));

      // El backend puede devolver { data: { uploadUrl } } o { uploadUrl } directamente
      const uploadData = (respuestaUpload as any)?.data ?? respuestaUpload;

      // PASO 2 — Subir PDF directo a S3
      console.log("📤 Paso 2: Subiendo PDF a S3...");
      await subirPDFaS3(uploadData.uploadUrl, pdfBlob);

      // PASO 3 — Confirmar subida
      console.log("📤 Paso 3: Confirmando subida...");
      const respuestaConfirm = await confirmarUploadUnidad({
        unidadId,
        usuarioId,
        key: uploadData.key,
      });

      const confirmData = (respuestaConfirm as any)?.data ?? respuestaConfirm;

      setIsSaved(true);
      console.log("✅ Unidad guardada en la nube:", confirmData);
      return confirmData;
    } catch (error) {
      console.error("❌ Error al guardar unidad en la nube:", error);
      guardadoIniciado.current = false; // Permitir reintento
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [documentRef, unidadId, user?.id, subirPDFaS3]);

  /* ─── Auto-guardado al montar ─── */
  useEffect(() => {
    if (!documentRef.current || !unidadId || !user?.id || isSaved || guardadoIniciado.current) return;

    const waitForImages = (): Promise<void> => {
      const images = documentRef.current?.querySelectorAll("img") || [];
      const pending = Array.from(images).filter((img) => !img.complete);
      if (pending.length === 0) return Promise.resolve();

      return Promise.all(
        pending.map(
          (img) =>
            new Promise<void>((resolve) => {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            })
        )
      ).then(() => {});
    };

    const timer = setTimeout(async () => {
      try {
        await waitForImages();
        await new Promise((r) => setTimeout(r, 500));
        await guardarEnNube();
      } catch (error) {
        console.error("Error al guardar automáticamente:", error);
      }
    }, 3000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── Descargar PDF local ─── */
  const handleDownloadPDF = async () => {
    if (!documentRef.current) {
      handleToaster("No se pudo acceder al documento", "error");
      return;
    }

    const timestamp = Date.now().toString().slice(-8);
    const tituloLimpio = datosBase?.titulo
      ? datosBase.titulo.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)
      : "unidad";
    const nombreArchivo = `unidad-${tituloLimpio}-${timestamp}.pdf`;

    setIsGenerating(true);
    try {
      await generateAndDownloadPDF(documentRef.current, nombreArchivo, {
        size: "A4",
        orientation: "landscape",
      });
      handleToaster("PDF descargado exitosamente", "success");

      // Guardar también en la nube si aún no se ha guardado
      if (!isSaved && user?.id && unidadId) {
        try {
          await guardarEnNube();
          handleToaster("Unidad guardada en la nube", "success");
        } catch {
          console.warn("No se pudo guardar en la nube, pero el PDF fue descargado");
        }
      }
    } catch (error) {
      handleToaster("Error al generar el PDF", "error");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  /* ─── Imprimir ─── */
  const handlePrint = () => {
    window.print();
  };

  return {
    isGenerating,
    isSaving,
    isSaved,
    handleDownloadPDF,
    handlePrint,
    guardarEnNube,
  };
}
