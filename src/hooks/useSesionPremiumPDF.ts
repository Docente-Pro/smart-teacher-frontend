import { useState, RefObject, useEffect, useCallback, useRef } from "react";
import { generateAndDownloadPDF } from "@/services/htmldocs.service";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import {
  solicitarUploadPDF,
  subirPDFaS3,
  confirmarUploadPDF,
} from "@/services/sesiones.service";
import { useAuthStore } from "@/store/auth.store";
import type { ISesionPremiumResponse } from "@/interfaces/ISesionPremium";

/**
 * Hook para generar y subir el PDF de una sesión PREMIUM.
 *
 * Diferencia clave con `usePDFGeneration` (flujo FREE):
 *  - La sesión YA existe en la BD (resp.sesion.id), así que no necesitamos
 *    el paso 0 (crearSesion). Solo hacemos pasos 1–3:
 *      1. solicitarUploadPDF  → obtener URL pre-firmada
 *      2. subirPDFaS3         → PUT directo a S3
 *      3. confirmarUploadPDF  → registrar key/pdfUrl en BD
 *
 * @param documentRef  Ref al div que envuelve el <Document> del PDF
 * @param premiumData  Respuesta completa del backend (ISesionPremiumResponse)
 */
export function useSesionPremiumPDF(
  documentRef: RefObject<HTMLDivElement>,
  premiumData: ISesionPremiumResponse | null,
) {
  // ── Detectar si ya se guardó previamente (evita re-subir al volver) ──
  const sesionId = premiumData?.sesion?.id;
  const storageKey = sesionId ? `pdf-saved-${sesionId}` : "";
  const yaSePersistio = storageKey ? sessionStorage.getItem(storageKey) === "1" : false;

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(yaSePersistio);
  const guardadoIniciado = useRef(yaSePersistio);
  const mountedRef = useRef(true);
  const { user } = useAuthStore();

  // ────────────────────────────────────────────────────────────────────────
  // Flujo de guardado en la nube (pasos 1-3)
  // ────────────────────────────────────────────────────────────────────────
  const guardarEnNube = useCallback(async () => {
    if (!documentRef.current || !premiumData?.sesion?.id || !user?.id) return;
    if (guardadoIniciado.current) return;
    guardadoIniciado.current = true;

    setIsSaving(true);
    try {
      // Generar el PDF como Blob
      const { generatePDFBlob } = await import("@/services/htmldocs.service");
      const pdfBlob = await generatePDFBlob(documentRef.current, {
        size: "A4",
        orientation: "portrait",
        preserveGraphicSize: true,
      });

      const sesionId = premiumData.sesion.id;
      const usuarioId = user.id;

      // PASO 1 — Pedir URL de subida
      console.log("📤 Paso 1: Solicitando URL de subida...", {
        sesionId,
        usuarioId,
      });
      const respuestaUpload = await solicitarUploadPDF({
        sesionId,
        usuarioId,
      });

      console.log(
        "📦 Respuesta upload-url:",
        JSON.stringify(respuestaUpload),
      );

      const uploadData =
        (respuestaUpload as any)?.data ?? respuestaUpload;

      // PASO 2 — Subir PDF directo a S3
      console.log("📤 Paso 2: Subiendo PDF a S3...");
      await subirPDFaS3(uploadData.uploadUrl, pdfBlob);

      // PASO 3 — Confirmar subida y guardar JSON
      console.log("📤 Paso 3: Confirmando subida...");
      const respuestaConfirm = await confirmarUploadPDF({
        sesionId,
        usuarioId,
        key: uploadData.key,
        contenido: premiumData.sesion as any, // Guardar el contenido completo
      });

      const confirmData =
        (respuestaConfirm as any)?.data ?? respuestaConfirm;

      setIsSaved(true);
      if (storageKey) sessionStorage.setItem(storageKey, "1");
      console.log("✅ PDF Premium guardado en la nube:", confirmData.id);
      return confirmData;
    } catch (error) {
      console.error("❌ Error al guardar PDF Premium en la nube:", error);
      guardadoIniciado.current = false; // Permitir reintentar
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [documentRef, premiumData, user?.id]);

  // ────────────────────────────────────────────────────────────────────────
  // Auto-guardar al montar (igual que el flujo FREE)
  // ────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;

    // Limpiar cualquier contenedor huérfano de html2pdf.js (evita "doble render")
    document.querySelectorAll(".html2pdf__container").forEach((el) => {
      el.parentElement?.remove();
    });

    if (
      !documentRef.current ||
      !premiumData?.sesion?.id ||
      !user?.id ||
      isSaved ||
      guardadoIniciado.current
    )
      return;

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
            }),
        ),
      ).then(() => {});
    };

    const timer = setTimeout(async () => {
      if (!mountedRef.current) return;
      try {
        await waitForImages();
        if (!mountedRef.current) return;
        await new Promise((r) => setTimeout(r, 500));
        if (!mountedRef.current) return;
        await guardarEnNube();
      } catch (error) {
        console.error("Error al guardar automáticamente:", error);
      }
    }, 3000);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
      // Limpiar contenedores html2pdf al desmontar
      document.querySelectorAll(".html2pdf__container").forEach((el) => {
        el.parentElement?.remove();
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ────────────────────────────────────────────────────────────────────────
  // Descargar PDF manualmente
  // ────────────────────────────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    if (!documentRef.current) {
      handleToaster("No se pudo acceder al documento", "error");
      return;
    }

    const rawArea = premiumData?.sesion?.area;
    const area =
      typeof rawArea === "string"
        ? rawArea
        : rawArea && typeof rawArea === "object" && "nombre" in (rawArea as any)
          ? String((rawArea as any).nombre)
          : "premium";
    const areaLimpia = area.toLowerCase().replace(/\s+/g, "-");
    const timestamp = Date.now().toString().slice(-8);
    const nombreArchivo = `sesion-${areaLimpia}-${timestamp}.pdf`;

    setIsGenerating(true);
    try {
      await generateAndDownloadPDF(documentRef.current, nombreArchivo, {
        size: "A4",
        orientation: "portrait",
        preserveGraphicSize: true,
      });
      handleToaster("PDF descargado exitosamente", "success");

      if (!isSaved && user?.id) {
        try {
          await guardarEnNube();
          handleToaster("Sesión guardada en la nube", "success");
        } catch {
          console.warn(
            "PDF descargado, pero no se pudo guardar en la nube",
          );
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
    handleDownloadPDF,
    handlePrint,
    guardarEnNube,
  };
}
