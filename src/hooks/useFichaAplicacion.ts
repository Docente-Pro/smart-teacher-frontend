/**
 * Hook para el flujo completo de Ficha de Aplicación:
 *  1. Generar ficha (Node → Python → Gemini)
 *  2. Renderizar PDF client-side
 *  3. Subir PDF a S3 (presigned URL)
 *  4. Confirmar upload
 */

import { useState, useCallback, useRef, type RefObject } from "react";
import {
  generarFichaAplicacion,
  subirFichaPDFaS3,
  confirmarUploadFicha,
} from "@/services/fichaAplicacion.service";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import type {
  IFichaAplicacionData,
  IFichaAplicacionRequest,
} from "@/interfaces/IFichaAplicacion";

interface UseFichaAplicacionOptions {
  /** Ref al div que envuelve el componente PDF para captura html2pdf */
  documentRef: RefObject<HTMLDivElement>;
}

interface UseFichaAplicacionReturn {
  /** JSON de la ficha generada (null si aún no se generó) */
  fichaData: IFichaAplicacionData | null;
  /** ID de la ficha en BD */
  fichaId: string | null;
  /** Generando JSON con IA */
  isGenerating: boolean;
  /** Subiendo PDF a S3 */
  isUploading: boolean;
  /** Flujo completo terminado */
  isComplete: boolean;
  /** Error del flujo */
  error: string | null;
  /** Paso 1: Genera la ficha llamando al backend */
  generar: (sesionId: string, options?: IFichaAplicacionRequest) => Promise<IFichaAplicacionData | null>;
  /** Paso 2: Renderiza PDF y lo sube a S3 (llamar después de que el componente PDF esté montado) */
  subirPDF: () => Promise<void>;
  /** Reset para generar otra */
  reset: () => void;
}

export function useFichaAplicacion({
  documentRef,
}: UseFichaAplicacionOptions): UseFichaAplicacionReturn {
  const [fichaData, setFichaData] = useState<IFichaAplicacionData | null>(null);
  const [fichaId, setFichaId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guardar s3Key y presignedUrl entre pasos
  const uploadInfoRef = useRef<{ presignedUrl: string; s3Key: string } | null>(null);

  // ─── Paso 1: Generar ficha ────────────────────────────────────────────
  const generar = useCallback(
    async (sesionId: string, options: IFichaAplicacionRequest = {}) => {
      setIsGenerating(true);
      setError(null);
      try {
        const resp = await generarFichaAplicacion(sesionId, options);

        setFichaData(resp.ficha);
        setFichaId(resp.fichaId);
        uploadInfoRef.current = {
          presignedUrl: resp.presignedUrl,
          s3Key: resp.s3Key,
        };

        handleToaster("¡Ficha de aplicación generada!", "success");
        return resp.ficha;
      } catch (err: any) {
        const msg =
          err?.response?.data?.error ||
          err?.message ||
          "Error al generar la ficha de aplicación";
        setError(msg);
        handleToaster(msg, "error");
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [],
  );

  // ─── Paso 2: Renderizar PDF y subir a S3 ──────────────────────────────
  const subirPDF = useCallback(async () => {
    if (!documentRef.current || !fichaId || !uploadInfoRef.current) {
      console.warn("⚠️ useFichaAplicacion.subirPDF: faltan datos");
      return;
    }

    setIsUploading(true);
    try {
      // Renderizar PDF blob
      const { generatePDFBlob } = await import("@/services/htmldocs.service");
      const pdfBlob = await generatePDFBlob(documentRef.current, {
        size: "A4",
        orientation: "portrait",
      });

      // Subir a S3
      const { presignedUrl, s3Key } = uploadInfoRef.current;
      await subirFichaPDFaS3(presignedUrl, pdfBlob);

      // Confirmar upload
      await confirmarUploadFicha(fichaId, { s3Key });

      setIsComplete(true);
      console.log("✅ Ficha PDF subida y confirmada:", fichaId);
    } catch (err: any) {
      console.error("❌ Error al subir ficha PDF:", err);
      // No bloquear la UI — el usuario puede descargar manualmente
    } finally {
      setIsUploading(false);
    }
  }, [documentRef, fichaId]);

  // ─── Reset ────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setFichaData(null);
    setFichaId(null);
    setIsGenerating(false);
    setIsUploading(false);
    setIsComplete(false);
    setError(null);
    uploadInfoRef.current = null;
  }, []);

  return {
    fichaData,
    fichaId,
    isGenerating,
    isUploading,
    isComplete,
    error,
    generar,
    subirPDF,
    reset,
  };
}
