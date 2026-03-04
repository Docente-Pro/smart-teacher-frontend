import { Document, Footer } from "@htmldocs/react";
import { Button } from "@/components/ui/button";
import {
  FileDown,
  Printer,
  Cloud,
  CloudOff,
  Loader2,
  ArrowLeft,
  Home,
} from "lucide-react";
import { useRef, useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import {
  solicitarUploadUrlUnidad,
  confirmarUploadUnidad,
  getUnidadDetalleSuscriptor,
} from "@/services/unidad.service";
import type { IUnidadListItem } from "@/interfaces/IUnidadList";
import {
  UnidadDocStyles,
  UnidadDocHeader,
  UnidadDocDatosGenerales,
  UnidadDocSituacion,
  UnidadDocPropositos,
  UnidadDocEnfoques,
  UnidadDocSecuencia,
  UnidadDocMaterialesReflexiones,
} from "@/components/UnidadDoc";

/**
 * Página de vista previa de la Unidad de Aprendizaje para **suscriptores**.
 *
 * El suscriptor recibe su unidad con `contenido` personalizado (JSON con su
 * nombre e institución) pero `pdfUrl: null`. Esta página:
 *   1. Renderiza el documento HTML desde el JSON personalizado
 *   2. Genera automáticamente el PDF (blob)
 *   3. Lo sube a S3 via presigned URL
 *   4. Confirma el upload → el backend guarda `UnidadMiembro.pdfUrl`
 *
 * Recibe la unidad completa via `location.state.unidad`.
 */
function UnidadSuscriptorResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const documentRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const { user: usuario } = useUserStore();

  // ── Obtener unidadId del state de navegación ──
  const stateData = location.state as { unidad?: IUnidadListItem } | null;
  const unidadIdFromState = stateData?.unidad?.id ?? null;

  // ── Estado: unidad cargada del backend (detalle completo) ──
  const [unidad, setUnidad] = useState<IUnidadListItem | null>(null);
  const [loadingUnidad, setLoadingUnidad] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── Estado de generación/subida PDF ──
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const guardadoIniciado = useRef(false);

  // ── Fetch detalle completo del suscriptor ──
  useEffect(() => {
    if (!unidadIdFromState || !user?.id) {
      setLoadingUnidad(false);
      return;
    }

    let cancelled = false;

    async function fetchDetalle() {
      setLoadingUnidad(true);
      setLoadError(null);
      try {
        const data = await getUnidadDetalleSuscriptor(unidadIdFromState!, user!.id!);
        if (!cancelled) {
          setUnidad(data);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("❌ Error al cargar detalle de unidad:", err);
          setLoadError(err?.response?.data?.message || err?.message || "Error al cargar la unidad");
        }
      } finally {
        if (!cancelled) setLoadingUnidad(false);
      }
    }

    fetchDetalle();
    return () => { cancelled = true; };
  }, [unidadIdFromState, user?.id]);

  // ── Subir PDF a S3 ──
  const subirPDFaS3 = useCallback(
    async (uploadUrl: string, pdfBlob: Blob): Promise<void> => {
      const response = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/pdf" },
        body: pdfBlob,
        mode: "cors",
      });
      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        console.error("❌ Error S3:", response.status, errorText);
        throw new Error(
          `Error al subir archivo a S3: ${response.status} ${response.statusText}`,
        );
      }
      console.log("✅ PDF subido a S3 exitosamente");
    },
    [],
  );

  // ── Flujo completo: generar blob → upload → confirmar ──
  const guardarEnNube = useCallback(async () => {
    if (!documentRef.current || !unidad?.id || !user?.id) return;
    if (guardadoIniciado.current) return;
    guardadoIniciado.current = true;

    setIsSaving(true);
    try {
      const { generatePDFBlob } = await import("@/services/htmldocs.service");
      const pdfBlob = await generatePDFBlob(documentRef.current, {
        size: "A4",
        orientation: "landscape",
      });

      const usuarioId = user.id;
      const unidadId = unidad.id;

      // Paso 1 — URL presigned
      console.log("📤 Paso 1: Solicitando URL de subida (suscriptor)...", {
        unidadId,
        usuarioId,
      });
      const respuestaUpload = await solicitarUploadUrlUnidad({
        unidadId,
        usuarioId,
      });
      const uploadData =
        (respuestaUpload as any)?.data ?? respuestaUpload;

      // Paso 2 — Subir PDF a S3
      console.log("📤 Paso 2: Subiendo PDF a S3...");
      await subirPDFaS3(uploadData.uploadUrl, pdfBlob);

      // Paso 3 — Confirmar subida
      console.log("📤 Paso 3: Confirmando subida...");
      await confirmarUploadUnidad({
        unidadId,
        usuarioId,
        key: uploadData.key,
      });

      setIsSaved(true);
      console.log("✅ PDF de unidad (suscriptor) guardado en la nube");
    } catch (error) {
      console.error("❌ Error al guardar PDF del suscriptor:", error);
      guardadoIniciado.current = false;
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [unidad?.id, user?.id, subirPDFaS3]);

  // ── Auto-guardado cuando la unidad está cargada ──
  useEffect(() => {
    if (
      loadingUnidad ||
      !documentRef.current ||
      !unidad?.id ||
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
  }, [loadingUnidad]);

  // ── Descargar PDF local ──
  const handleDownloadPDF = async () => {
    if (!documentRef.current) {
      handleToaster("No se pudo acceder al documento", "error");
      return;
    }

    const timestamp = Date.now().toString().slice(-8);
    const tituloLimpio = unidad?.titulo
      ? unidad.titulo
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .slice(0, 40)
      : "unidad";
    const nombreArchivo = `unidad-${tituloLimpio}-${timestamp}.pdf`;

    setIsGenerating(true);
    try {
      const { generateAndDownloadPDF } = await import(
        "@/services/htmldocs.service"
      );
      await generateAndDownloadPDF(documentRef.current, nombreArchivo, {
        size: "A4",
        orientation: "landscape",
      });
      handleToaster("PDF descargado exitosamente", "success");

      // Guardar en nube si aún no se guardó
      if (!isSaved && user?.id && unidad?.id) {
        try {
          await guardarEnNube();
          handleToaster("Unidad guardada en la nube", "success");
        } catch {
          console.warn(
            "No se pudo guardar en la nube, pero el PDF fue descargado",
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

  const handlePrint = () => window.print();

  // ── Print styles ──
  const printStyles = `
    @media print {
      @page { margin: 0; size: A4 landscape; }
      body { margin: 0; padding: 0; }
      body * { visibility: hidden; }
      #print-content, #print-content * { visibility: visible; }
      #print-content { position: absolute; left: 0; top: 0; width: 100%; }
      .no-print { display: none !important; }
    }
  `;

  // ── Cargando detalle ──
  if (loadingUnidad) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-amber-600" />
        <p className="text-slate-600 dark:text-slate-400">Cargando unidad personalizada…</p>
      </div>
    );
  }

  // ── Error al cargar ──
  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Error al cargar la unidad
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{loadError}</p>
          <Button onClick={() => navigate("/mis-unidades")}>
            Ir a Mis Unidades
          </Button>
        </div>
      </div>
    );
  }

  // ── Sin datos → fallback ──
  if (!unidad) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4">
            No hay unidad disponible
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Accede a esta página desde "Mis Unidades".
          </p>
          <Button onClick={() => navigate("/mis-unidades")}>
            Ir a Mis Unidades
          </Button>
        </div>
      </div>
    );
  }

  // ── Extraer datos del contenido personalizado de la unidad ──
  // El backend puede devolver contenido como string JSON o como objeto.
  // Además, cada campo puede venir "envuelto" en su tipo de respuesta IA:
  //   ej. contenido.enfoques = {enfoques: [...]} en vez de [...]
  const rawContenido = unidad.contenido;
  const contenido: Record<string, any> = (() => {
    if (!rawContenido) return {};

    let parsed = rawContenido;
    if (typeof parsed === "string") {
      try { parsed = JSON.parse(parsed); } catch { return {}; }
    }

    // Doble anidamiento: { contenido: { ... } }
    if (
      parsed &&
      typeof parsed === "object" &&
      !parsed.situacionSignificativa &&
      parsed.contenido &&
      typeof parsed.contenido === "object"
    ) {
      parsed = parsed.contenido;
      if (typeof parsed === "string") {
        try { parsed = JSON.parse(parsed); } catch { return {}; }
      }
    }

    return parsed ?? {};
  })();

  // ── Desenvolver cada campo: el backend puede almacenar cada paso
  //    en su formato de respuesta IA (ej. {situacionSignificativa: "..."})
  //    o ya desenvuelto (ej. "..."). Aceptamos ambos formatos. ──

  const situacionSignificativa: string = (() => {
    const raw = contenido.situacionSignificativa;
    if (typeof raw === "string") return raw;
    if (raw && typeof raw === "object" && typeof raw.situacionSignificativa === "string")
      return raw.situacionSignificativa;
    return "";
  })();

  const evidencias = (() => {
    const raw = contenido.evidencias;
    if (!raw) return undefined;
    if (raw.proposito !== undefined || raw.reto !== undefined) return raw;
    if (raw.evidencias) return raw.evidencias;
    return raw;
  })();

  const propositos = (() => {
    const raw = contenido.propositos;
    if (!raw) return undefined;
    if (raw.areasPropositos) return raw;
    if (raw.propositos?.areasPropositos) return raw.propositos;
    return raw;
  })();

  const areasComplementarias = (() => {
    const raw = contenido.areasComplementarias;
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === "object" && Array.isArray(raw.areasComplementarias))
      return raw.areasComplementarias;
    return undefined;
  })();

  const enfoques = (() => {
    const raw = contenido.enfoques;
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === "object" && Array.isArray(raw.enfoques))
      return raw.enfoques;
    return [];
  })();

  const secuencia = (() => {
    const raw = contenido.secuencia;
    if (!raw) return undefined;
    if (raw.semanas) return raw;
    if (raw.secuencia?.semanas) return raw.secuencia;
    return raw;
  })();

  const materiales = (() => {
    const raw = contenido.materiales;
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === "object" && Array.isArray(raw.materiales))
      return raw.materiales;
    return undefined;
  })();

  const reflexiones = (() => {
    const raw = contenido.reflexiones;
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === "object" && Array.isArray(raw.reflexiones))
      return raw.reflexiones;
    return undefined;
  })();

  const imagenSituacionUrl: string | undefined = (() => {
    // 1. Nivel top del contenido (formato store propietario)
    if (typeof contenido.imagenSituacionUrl === "string") return contenido.imagenSituacionUrl;
    // 2. Dentro del objeto situacionSignificativa (formato backend: imagenUrl)
    const rawSit = contenido.situacionSignificativa;
    if (rawSit && typeof rawSit === "object") {
      if (typeof rawSit.imagenUrl === "string") return rawSit.imagenUrl;
      if (typeof rawSit.imagenSituacionUrl === "string") return rawSit.imagenSituacionUrl;
    }
    // 3. Dentro de situacionBase
    if (typeof contenido.situacionBase?.imagenUrl === "string")
      return contenido.situacionBase.imagenUrl;
    if (typeof contenido.situacionBase?.imagenSituacionUrl === "string")
      return contenido.situacionBase.imagenSituacionUrl;
    return undefined;
  })();

  // Nombres de áreas desde los propósitos desenvueltos
  const areasNombres = (propositos?.areasPropositos ?? []).map(
    (a: any) => a.area ?? a.nombre ?? "",
  );
  const gradoLabel = unidad.grado?.nombre ?? "";
  const docenteNombre = usuario?.nombre || user?.name || "";
  const institucion = usuario?.nombreInstitucion || "";

  const fechaInicio = unidad.fechaInicio?.split("T")[0] ?? "";
  const fechaFin = unidad.fechaFin?.split("T")[0] ?? "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-8">
      <style>{printStyles}</style>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="no-print flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              onClick={() => navigate("/mis-unidades")}
              variant="ghost"
              className="h-10 px-3 flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg sm:text-[1.875rem] font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Vista Previa - Unidad de Aprendizaje
            </h1>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              size="sm"
              className="gap-1.5"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Inicio</span>
            </Button>
            {/* Indicador de guardado */}
            <div
              className="flex items-center gap-1 text-xs"
              style={{
                color: isSaved
                  ? "#16a34a"
                  : isSaving
                    ? "#d97706"
                    : "#94a3b8",
              }}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : isSaved ? (
                <>
                  <Cloud className="h-4 w-4" />
                  <span>Guardado</span>
                </>
              ) : (
                <>
                  <CloudOff className="h-4 w-4" />
                  <span>Sin guardar</span>
                </>
              )}
            </div>
            <Button
              onClick={handlePrint}
              disabled={isGenerating}
              variant="outline"
              size="sm"
              className="gap-1.5"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </Button>
            <Button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              size="sm"
              className="gap-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
            >
              <FileDown className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isGenerating ? "Generando PDF..." : "Descargar PDF"}
              </span>
              <span className="sm:hidden">
                {isGenerating ? "..." : "PDF"}
              </span>
            </Button>
          </div>
        </div>

        {/* Documento */}
        <div id="print-content" ref={documentRef}>
          <Document size="A4" orientation="landscape" margin="0.5in">
            <UnidadDocStyles />

            <UnidadDocHeader
              titulo={unidad.titulo}
              numeroUnidad={unidad.numeroUnidad}
              grado={gradoLabel}
            />

            <UnidadDocDatosGenerales
              institucion={institucion}
              directivo=""
              docente={docenteNombre}
              grado={gradoLabel}
              nivel={unidad.nivel?.nombre ?? ""}
              fechaInicio={fechaInicio}
              fechaFin={fechaFin}
              areas={areasNombres}
            />

            {/* PLANTEAMIENTO DE LA SITUACIÓN + EVIDENCIAS */}
            <UnidadDocSituacion
              situacionSignificativa={situacionSignificativa}
              evidencias={evidencias}
              grado={gradoLabel}
              imagenSituacionUrl={imagenSituacionUrl}
            />

            {/* II. PROPÓSITO DE APRENDIZAJE */}
            {propositos && (
              <UnidadDocPropositos
                propositos={propositos}
                areasComplementarias={areasComplementarias}
              />
            )}

            {/* III. ENFOQUES TRANSVERSALES */}
            <UnidadDocEnfoques enfoques={enfoques} />

            {/* IV. SECUENCIA DE ACTIVIDADES */}
            {secuencia && (
              <UnidadDocSecuencia secuencia={secuencia} />
            )}

            {/* V. MATERIALES + VI. REFLEXIONES */}
            <UnidadDocMaterialesReflexiones
              materiales={materiales}
              reflexiones={reflexiones}
            />

            <Footer position="bottom-center">
              {() => (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                    fontSize: "8pt",
                    borderTop: "1px solid #000",
                    paddingTop: "0.2rem",
                  }}
                >
                  <span>
                    Unidad de Aprendizaje N° {unidad.numeroUnidad} —{" "}
                    {unidad.titulo}
                  </span>
                </div>
              )}
            </Footer>
          </Document>
        </div>
      </div>
    </div>
  );
}

export default UnidadSuscriptorResult;
