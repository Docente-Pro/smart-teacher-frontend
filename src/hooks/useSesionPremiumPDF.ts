import { useState, RefObject, useEffect, useCallback, useRef } from "react";
import { generateAndDownloadPDF } from "@/services/htmldocs.service";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import {
  solicitarUploadPDF,
  subirPDFaS3,
  confirmarUploadPDF,
} from "@/services/sesiones.service";
import { useAuthStore } from "@/store/auth.store";
import { getSavedAlumnos } from "@/utils/alumnosStorage";
import type { ISesionPremiumResponse } from "@/interfaces/ISesionPremium";

/**
 * Estado del formato propio de la docente para esta sesión.
 *
 *  verificando → preguntando si hay plantilla activa
 *  generando   → el sidecar está rellenando su Word y pasándolo a PDF
 *  listo       → `pdfUrl` es la sesión dentro de su propio formato
 *  ninguno     → no hay plantilla aprobada, va el formato estándar
 *  error       → hubo plantilla pero no se pudo aplicar
 */
export type FormatoPropio = {
  estado: "verificando" | "generando" | "listo" | "ninguno" | "error";
  nombre: string | null;
  pdfUrl: string | null;
  /** Lo que se agregó al final porque su formato no lo contempla. */
  anexos: string[];
};

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
 * Si la docente tiene un formato propio aprobado, ese flujo HTML se salta:
 * `aplicar-a-sesion` escribe el mismo key de S3 con su formato, así que
 * subir además la captura del HTML sobreescribiría lo que ella aprobó.
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
  const [isGeneratingWord, setIsGeneratingWord] = useState(false);
  const [wordUrl, setWordUrl] = useState<string | null>(
    (premiumData?.sesion as any)?.wordUrl ?? null,
  );
  const [formatoPropio, setFormatoPropio] = useState<FormatoPropio>({
    estado: sesionId ? "verificando" : "ninguno",
    nombre: null,
    pdfUrl: null,
    anexos: [],
  });

  // La lista del aula está en este navegador; el backend la necesita para
  // llenar la lista de cotejo que se anexa al final del formato propio.
  const sesion = premiumData?.sesion as Record<string, any> | undefined;
  const gradoId =
    sesion?.gradoId ??
    (typeof sesion?.grado === "object" && sesion?.grado ? sesion.grado.id : undefined);
  const alumnosDelAula = () => getSavedAlumnos(gradoId);
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
      const sesionAny = premiumData.sesion as any;
      const unidadId: string | undefined = sesionAny?.unidadId ?? undefined;
      const areaId: number | undefined = sesionAny?.areaId ?? undefined;

      // PASO 1 — Pedir URL de subida
      const respuestaUpload = await solicitarUploadPDF({
        sesionId,
        usuarioId,
      });

      const uploadData =
        (respuestaUpload as any)?.data ?? respuestaUpload;

      // PASO 2 — Subir PDF directo a S3
      await subirPDFaS3(uploadData.uploadUrl, pdfBlob);

      // PASO 3 — Confirmar subida y guardar JSON
      const respuestaConfirm = await confirmarUploadPDF({
        sesionId,
        usuarioId,
        key: uploadData.key,
        contenido: premiumData.sesion as any,
        ...(unidadId ? { unidadId } : {}),
        ...(areaId ? { areaId } : {}),
      });

      const confirmData =
        (respuestaConfirm as any)?.data ?? respuestaConfirm;

      setIsSaved(true);
      if (storageKey) sessionStorage.setItem(storageKey, "1");
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
  // Formato propio: si la docente ya aprobó su plantilla, la sesión se
  // arma dentro de ese Word y el PDF resultante es lo que ve en pantalla.
  // ────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sesionId) {
      setFormatoPropio({ estado: "ninguno", nombre: null, pdfUrl: null, anexos: [] });
      return;
    }

    let cancelado = false;

    (async () => {
      try {
        const { getMiPlantillaActiva, esMapeoV2, aplicarPlantillaASesion } =
          await import("@/services/plantillaFormato.service");

        const plantilla = (await getMiPlantillaActiva())?.data ?? null;
        const utilizable =
          !!plantilla && plantilla.activa && esMapeoV2(plantilla.mapeo ?? null);

        if (!utilizable) {
          if (!cancelado) {
            setFormatoPropio({
              estado: "ninguno",
              nombre: null,
              pdfUrl: null,
              anexos: [],
            });
          }
          return;
        }
        if (cancelado) return;

        setFormatoPropio({
          estado: "generando",
          nombre: plantilla!.nombre,
          pdfUrl: null,
          anexos: [],
        });

        const aplicado = await aplicarPlantillaASesion(sesionId, alumnosDelAula());
        if (cancelado) return;

        if (aplicado.success && aplicado.data?.pdfDownloadUrl) {
          setFormatoPropio({
            estado: "listo",
            nombre: plantilla!.nombre,
            pdfUrl: aplicado.data.pdfDownloadUrl,
            anexos: aplicado.data.anexos ?? [],
          });
          if (aplicado.data.wordUrl) setWordUrl(aplicado.data.wordUrl);
          // `aplicar-a-sesion` ya dejó el PDF y el Word en S3.
          guardadoIniciado.current = true;
          setIsSaved(true);
          if (storageKey) sessionStorage.setItem(storageKey, "1");
          return;
        }

        setFormatoPropio({
          estado: "error",
          nombre: plantilla!.nombre,
          pdfUrl: null,
          anexos: [],
        });
      } catch (error: any) {
        if (cancelado) return;
        const code = error?.response?.data?.code;
        if (code === "NO_PLANTILLA") {
          setFormatoPropio({
            estado: "ninguno",
            nombre: null,
            pdfUrl: null,
            anexos: [],
          });
          return;
        }
        console.warn("No se pudo aplicar el formato propio:", error);
        setFormatoPropio((prev) => ({ ...prev, estado: "error", pdfUrl: null }));
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [sesionId, storageKey]);

  // ────────────────────────────────────────────────────────────────────────
  // Auto-guardar al montar (igual que el flujo FREE)
  // ────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Con formato propio el PDF ya lo escribe el backend en el mismo key.
    if (formatoPropio.estado !== "ninguno") return;

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
  }, [formatoPropio.estado]);

  // ────────────────────────────────────────────────────────────────────────
  // Descargar PDF manualmente
  // ────────────────────────────────────────────────────────────────────────
  const descargarUrl = (url: string, nombreArchivo: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = nombreArchivo;
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleDownloadPDF = async () => {
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

    // El PDF con su formato ya está armado por la vista previa.
    if (formatoPropio.estado === "listo" && formatoPropio.pdfUrl) {
      descargarUrl(formatoPropio.pdfUrl, nombreArchivo);
      handleToaster("PDF con tu formato", "success");
      return;
    }

    setIsGenerating(true);
    try {
      // Si hay plantilla activa: fill + convert en sidecar (formato personal)
      if (sesionId && formatoPropio.estado !== "ninguno") {
        try {
          const { aplicarPlantillaASesion } = await import(
            "@/services/plantillaFormato.service"
          );
          const res = await aplicarPlantillaASesion(sesionId, alumnosDelAula());
          if (res.success && res.data?.pdfDownloadUrl) {
            descargarUrl(res.data.pdfDownloadUrl, nombreArchivo);
            if (res.data.wordUrl) setWordUrl(res.data.wordUrl);
            handleToaster("PDF con tu formato personal", "success");
            setIsSaved(true);
            if (storageKey) sessionStorage.setItem(storageKey, "1");
            return;
          }
        } catch (plantillaErr: any) {
          const code = plantillaErr?.response?.data?.code;
          // Sin plantilla → formato HTML/MINEDU estándar
          if (code !== "NO_PLANTILLA") {
            console.warn("Plantilla personal no disponible, usando estándar:", plantillaErr);
          }
        }
      }

      if (!documentRef.current) {
        handleToaster("No se pudo acceder al documento", "error");
        return;
      }

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
          // PDF descargado pero no se pudo guardar en la nube
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
    // El formato propio vive en un PDF de S3: el visor del navegador lo imprime.
    if (formatoPropio.estado === "listo" && formatoPropio.pdfUrl) {
      window.open(formatoPropio.pdfUrl, "_blank", "noopener");
      return;
    }
    window.print();
  };

  // ────────────────────────────────────────────────────────────────────────
  // Word: generar → S3 / ver desde S3
  // ────────────────────────────────────────────────────────────────────────
  const handleGenerateWord = async () => {
    if (!sesionId) {
      handleToaster("No se pudo acceder al documento", "error");
      return;
    }

    setIsGeneratingWord(true);
    try {
      // Preferir plantilla personal si existe
      if (formatoPropio.estado !== "ninguno") {
        try {
          const { aplicarPlantillaASesion } = await import(
            "@/services/plantillaFormato.service"
          );
          const res = await aplicarPlantillaASesion(sesionId, alumnosDelAula());
          if (res.success && res.data?.wordUrl) {
            setWordUrl(res.data.wordUrl);
            if (res.data.wordDownloadUrl) {
              window.open(res.data.wordDownloadUrl, "_blank");
            }
            handleToaster("Word con tu formato personal", "success");
            return;
          }
        } catch (plantillaErr: any) {
          if (plantillaErr?.response?.data?.code !== "NO_PLANTILLA") {
            console.warn("Plantilla Word omitida:", plantillaErr);
          }
        }
      }

      // Prefer server-side conversion from existing S3 PDF (avoids upload size issues)
      const pdfUrl = (premiumData?.sesion as any)?.pdfUrl;
      if (pdfUrl) {
        const { generarWordDesdePDFExistente } = await import("@/services/pdfToWord.service");
        const url = await generarWordDesdePDFExistente(sesionId);
        setWordUrl(url);
        handleToaster("Word generado y guardado", "success");
        return;
      }

      // Fallback: generate PDF locally and upload for conversion
      if (!documentRef.current) {
        handleToaster("No se pudo acceder al documento", "error");
        return;
      }
      // First ensure PDF is saved to S3 so we can use from-session next time
      if (!isSaved && user?.id) {
        try { await guardarEnNube(); } catch { /* continue anyway */ }
      }
      const { generateAndUploadWord } = await import("@/services/htmldocs.service");
      const url = await generateAndUploadWord(documentRef.current, sesionId);
      setWordUrl(url);
      handleToaster("Word generado y guardado", "success");
    } catch (error: any) {
      handleToaster(error?.message || "Error al generar el Word", "error");
      console.error(error);
    } finally {
      setIsGeneratingWord(false);
    }
  };

  const handleVerWord = async () => {
    if (!sesionId) return;
    try {
      const { obtenerDownloadUrlWord } = await import("@/services/pdfToWord.service");
      const downloadUrl = await obtenerDownloadUrlWord(sesionId);
      window.open(downloadUrl, "_blank");
    } catch {
      handleToaster("Error al obtener el Word", "error");
    }
  };

  return {
    isGenerating,
    isSaving,
    isSaved,
    handleDownloadPDF,
    handlePrint,
    handleGenerateWord,
    handleVerWord,
    isGeneratingWord,
    wordUrl,
    guardarEnNube,
    formatoPropio,
  };
}
