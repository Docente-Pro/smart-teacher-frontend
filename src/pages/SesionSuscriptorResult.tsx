import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  ClipboardList,
  Cloud,
  CloudOff,
  FileDown,
  Home,
  Loader2,
  Pencil,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import {
  obtenerSesionPorId,
  solicitarUploadPDF,
  subirPDFaS3,
  confirmarUploadPDF,
} from "@/services/sesiones.service";
import { SesionPremiumDoc } from "@/components/SesionPremiumDoc/SesionPremiumDoc";
import { generarFichaAplicacion } from "@/services/fichaAplicacion.service";
import type { ISesionPremiumResponse } from "@/interfaces/ISesionPremium";
import type { IInstrumentoEvaluacion } from "@/interfaces/IInstrumentoEvaluacion";
import { buildInstrumentoLocal } from "@/utils/buildInstrumentoFromSesion";

/**
 * Página de vista previa de una Sesión de Aprendizaje para **suscriptores**.
 *
 * El suscriptor recibe sesiones clonadas con contenido personalizado (su nombre
 * e institución) pero `pdfUrl: null`. Esta página:
 *   1. Carga la sesión por ID (GET /api/sesion/:id)
 *   2. Renderiza el documento HTML con SesionPremiumDoc
 *   3. Genera automáticamente el PDF (blob)
 *   4. Lo sube a S3 via presigned URL (POST /api/sesion/upload-url → PUT S3)
 *   5. Confirma el upload (POST /api/sesion/confirmar-upload)
 *
 * Ruta: /sesion-suscriptor-result/:id
 */
function SesionSuscriptorResult() {
  const { id: sesionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const documentRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const { user: usuario } = useUserStore();

  // ── Estado de carga de la sesión ──
  const [premiumData, setPremiumData] = useState<ISesionPremiumResponse | null>(
    null,
  );
  const [loadingSesion, setLoadingSesion] = useState(true);
  const [errorSesion, setErrorSesion] = useState<string | null>(null);

  // ── Estado de generación/subida PDF ──
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const guardadoIniciado = useRef(false);

  // ── Estado de generación de Ficha de Aplicación ──
  const [isGeneratingFicha, setIsGeneratingFicha] = useState(false);

  // ═══════════════════════════════════════════════════════════════════════════
  // Cargar sesión completa del backend
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!sesionId) return;
    let cancelled = false;

    async function load() {
      setLoadingSesion(true);
      setErrorSesion(null);
      try {
        const data = await obtenerSesionPorId(sesionId!);

        if (cancelled) return;

        // Extraer nombre del docente e institución
        const sesionUsuario = data.usuario as
          | { nombre?: string; nombreInstitucion?: string; seccion?: string }
          | undefined;
        const docente =
          sesionUsuario?.nombre ||
          usuario?.nombre ||
          user?.name ||
          "";
        const institucion =
          sesionUsuario?.nombreInstitucion ||
          usuario?.nombreInstitucion ||
          "";
        const seccion =
          sesionUsuario?.seccion ||
          usuario?.seccion ||
          "";

        // ─── Extraer contenido pedagógico ───────────────────────────────
        // El backend almacena la secuencia didáctica dentro de `contenido`
        // (puede ser un JSON object o un JSON string que hay que parsear).
        // Campos con datos reales (procesos, imágenes) pueden estar:
        //   a) directamente en la sesión (top-level) — ej. cuando viene de
        //      /unidades/:id/sesion/generar
        //   b) únicamente dentro de `contenido` — ej. cuando viene de
        //      GET /sesion/:id (la columna JSON de la BD)
        //
        // Usamos una función pick() que devuelve el primer valor "con datos"
        // (no null, no undefined, no objeto vacío, no array vacío).
        const raw = data as any;

        // Parsear contenido si es string
        let contenido: Record<string, any> = {};
        try {
          const c = raw.contenido;
          if (typeof c === "string") {
            contenido = JSON.parse(c);
          } else if (c && typeof c === "object") {
            contenido = c;
          }
        } catch {
          console.warn("⚠️ No se pudo parsear contenido:", raw.contenido);
        }

        console.log("🔍 [SesionSuscriptorResult] raw keys:", Object.keys(raw));
        console.log("🔍 [SesionSuscriptorResult] contenido keys:", Object.keys(contenido));
        console.log("🔍 [SesionSuscriptorResult] raw.inicio?", !!raw.inicio, "contenido.inicio?", !!contenido.inicio);
        console.log("🔍 [SesionSuscriptorResult] raw.area:", raw.area);

        // Devuelve el primer valor "con datos reales" — ignora null, undefined,
        // objetos vacíos ({}) y arrays vacíos ([]).
        function pick<T>(...candidates: unknown[]): T {
          for (const v of candidates) {
            if (v == null) continue;
            if (Array.isArray(v) && v.length === 0) continue;
            if (typeof v === "object" && !Array.isArray(v) && Object.keys(v as object).length === 0) continue;
            return v as T;
          }
          return candidates[candidates.length - 1] as T;
        }

        const sesionForDoc = {
          // ── Identificadores y metadatos ──
          id: raw.id,
          titulo: pick<string>(raw.titulo, contenido.titulo, "Sesión de Aprendizaje"),
          area: pick(raw.area, contenido.area),
          nivel: pick(raw.nivel, contenido.nivel),
          grado: pick(raw.grado, contenido.grado),
          duracion: raw.duracion ?? contenido.duracion,
          usuario: raw.usuario,
          fechaInicio: contenido.fechaSesion || raw.fechaInicio || raw.createdAt,

          // ── Propósitos ──
          propositoSesion: pick<string>(
            raw.propositoSesion, contenido.propositoSesion, "",
          ),
          propositoAprendizaje: pick<any[]>(
            raw.propositoAprendizaje, contenido.propositoAprendizaje, [],
          ),
          enfoquesTransversales: pick<any[]>(
            raw.enfoquesTransversales, contenido.enfoquesTransversales, [],
          ),

          // ── Preparación ──
          preparacion: pick(
            raw.preparacion, contenido.preparacion,
            { quehacerAntes: [], recursosMateriales: [] },
          ),

          // ── Fases (inicio / desarrollo / cierre) ──
          // El nivel raíz puede tener procesos con `imagen`; contenido no.
          inicio: pick(
            raw.inicio, contenido.inicio,
            { tiempo: "", procesos: [] },
          ),
          desarrollo: pick(
            raw.desarrollo, contenido.desarrollo,
            { tiempo: "", procesos: [] },
          ),
          cierre: pick(
            raw.cierre, contenido.cierre,
            { tiempo: "", procesos: [] },
          ),

          // ── Reflexiones / resumen / fuentes ──
          reflexiones: pick(
            raw.reflexiones, contenido.reflexiones,
            { sobreAprendizajes: "", sobreEnsenanza: "" },
          ),
          resumen: pick<string>(raw.resumen, contenido.resumen, ""),
          fuentesMinedu: pick<any[]>(
            raw.fuentesMinedu, contenido.fuentesMinedu, [],
          ),
          imagenesDisponibles: pick<any[]>(
            raw.imagenesDisponibles, contenido.imagenesDisponibles, [],
          ),

          // ── Sesiones complementarias (Tutoría / Plan Lector) ──
          ...(raw.recursoNarrativo || contenido.recursoNarrativo
            ? { recursoNarrativo: raw.recursoNarrativo || contenido.recursoNarrativo }
            : {}),
        };

        console.log("🔍 [SesionSuscriptorResult] sesionForDoc.inicio:", sesionForDoc.inicio);
        console.log("🔍 [SesionSuscriptorResult] sesionForDoc.area:", sesionForDoc.area);

        const nombreDirectivo =
          (raw.usuario as any)?.nombreDirectivo ||
          (usuario?.nombreDirectivo ?? "");

        const response: ISesionPremiumResponse = {
          success: true,
          docente,
          institucion,
          seccion,
          nombreDirectivo: nombreDirectivo || undefined,
          sesion: sesionForDoc as any,
        };

        setPremiumData(response);
      } catch (err: any) {
        if (!cancelled) {
          console.error("Error al cargar sesión:", err);
          setErrorSesion(
            err?.response?.data?.message ||
              err?.message ||
              "Error al cargar la sesión",
          );
        }
      } finally {
        if (!cancelled) setLoadingSesion(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [sesionId, usuario, user]);

  // Lista de cotejo / instrumento de evaluación para el PDF (suscriptor ve lo mismo que el propietario)
  const instrumento = useMemo((): IInstrumentoEvaluacion | null => {
    if (!premiumData?.sesion) return null;
    const sesion = premiumData.sesion as any;
    const propósitos = sesion.propositoAprendizaje ?? [];
    if (!Array.isArray(propósitos) || propósitos.length === 0) return null;
    const toLabel = (v: unknown) =>
      !v ? "" : typeof v === "string" ? v : (v as any)?.nombre ?? (v as any)?.name ?? String(v);
    const area = toLabel(sesion.area) || "—";
    const grado = toLabel(sesion.grado) || "—";
    const first =
      propósitos.find(
        (p: any) =>
          (p.instrumento?.trim() || p.evidencia?.trim() || p.competencia?.trim()),
      ) ?? propósitos[0];
    const criteriosRaw = first.criteriosEvaluacion ?? first.criterios;
    const criteriosList = Array.isArray(criteriosRaw)
      ? criteriosRaw.map((c: any) => (typeof c === "string" ? c : c?.criterioCompleto ?? "")).filter(Boolean)
      : (typeof first.criterios === "string" ? first.criterios.split("\n").map((s: string) => s.trim()).filter(Boolean) : []);
    return buildInstrumentoLocal({
      area,
      grado,
      competencia: first.competencia ?? "—",
      evidencia: first.evidencia ?? first.evidenciaAprendizaje ?? "—",
      criterios: criteriosList.length > 0 ? criteriosList : ["—"],
      instrumento: first.instrumento?.trim() || first.instrumentoEvaluacion?.trim() || "Lista de cotejo",
    });
  }, [premiumData]);

  // ═══════════════════════════════════════════════════════════════════════════
  // Flujo de subida a S3: generar blob → upload → confirmar
  // ═══════════════════════════════════════════════════════════════════════════
  const guardarEnNube = useCallback(async () => {
    if (!documentRef.current || !premiumData?.sesion?.id || !user?.id) return;
    if (guardadoIniciado.current) return;
    guardadoIniciado.current = true;

    setIsSaving(true);
    try {
      const { generatePDFBlob } = await import("@/services/htmldocs.service");
      const pdfBlob = await generatePDFBlob(documentRef.current, {
        size: "A4",
        orientation: "portrait",
      });

      const idSesion = premiumData.sesion.id;
      const usuarioId = user.id;

      // Paso 1 — URL presigned
      console.log("📤 Paso 1 (suscriptor): Solicitando URL de subida...", {
        sesionId: idSesion,
        usuarioId,
      });
      const respuestaUpload = await solicitarUploadPDF({
        sesionId: idSesion,
        usuarioId,
      });

      const uploadData =
        (respuestaUpload as any)?.data ?? respuestaUpload;

      // Paso 2 — Subir PDF a S3
      console.log("📤 Paso 2 (suscriptor): Subiendo PDF a S3...");
      await subirPDFaS3(uploadData.uploadUrl, pdfBlob);

      // Paso 3 — Confirmar subida
      console.log("📤 Paso 3 (suscriptor): Confirmando subida...");
      await confirmarUploadPDF({
        sesionId: idSesion,
        usuarioId,
        key: uploadData.key,
        contenido: premiumData.sesion as any,
      });

      setIsSaved(true);
      console.log("✅ PDF de sesión (suscriptor) guardado en la nube");
    } catch (error) {
      console.error("❌ Error al guardar PDF del suscriptor:", error);
      guardadoIniciado.current = false; // Permitir reintentar
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [premiumData?.sesion, user?.id]);

  // ═══════════════════════════════════════════════════════════════════════════
  // Auto-guardado cuando la sesión ya se cargó y se renderizó
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (
      !premiumData?.sesion?.id ||
      !user?.id ||
      isSaved ||
      guardadoIniciado.current ||
      loadingSesion
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
        if (!documentRef.current) return;
        await waitForImages();
        await new Promise((r) => setTimeout(r, 500));
        await guardarEnNube();
      } catch (error) {
        console.error("Error al guardar automáticamente:", error);
      }
    }, 3000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [premiumData, loadingSesion]);

  // ═══════════════════════════════════════════════════════════════════════════
  // Descargar PDF manualmente
  // ═══════════════════════════════════════════════════════════════════════════
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
          : "sesion";
    const areaLimpia = area.toLowerCase().replace(/\s+/g, "-");
    const timestamp = Date.now().toString().slice(-8);
    const nombreArchivo = `sesion-${areaLimpia}-${timestamp}.pdf`;

    setIsGenerating(true);
    try {
      const { generateAndDownloadPDF } = await import(
        "@/services/htmldocs.service"
      );
      await generateAndDownloadPDF(documentRef.current, nombreArchivo, {
        size: "A4",
        orientation: "portrait",
      });
      handleToaster("PDF descargado exitosamente", "success");

      if (!isSaved && user?.id) {
        try {
          await guardarEnNube();
          handleToaster("Sesión guardada en la nube", "success");
        } catch {
          console.warn("PDF descargado, pero no se pudo guardar en la nube");
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

  // ── Generar Ficha de Aplicación ───────────────────────────────────────
  const handleGenerarFicha = async () => {
    if (!sesionId) return;

    setIsGeneratingFicha(true);
    try {
      const resp = await generarFichaAplicacion(sesionId, {
        incluirRespuestas: true,
        dificultad: "media",
      });

      handleToaster("¡Ficha generada! Abriendo vista previa...", "success");

      navigate("/ficha-aplicacion-result", {
        state: {
          ficha: resp.ficha,
          fichaId: resp.fichaId,
          docente: premiumData?.docente ?? "",
          institucion: premiumData?.institucion ?? "",
          sesionId,
          presignedUrl: resp.presignedUrl,
          s3Key: resp.s3Key,
        },
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "Error al generar la ficha";
      handleToaster(msg, "error");
    } finally {
      setIsGeneratingFicha(false);
    }
  };

  // ── Print styles ──
  const printStyles = `
    @media print {
      @page { margin: 0; size: A4; }
      body { margin: 0; padding: 0; }
      body * { visibility: hidden; }
      #print-content, #print-content * { visibility: visible; }
      #print-content { position: absolute; left: 0; top: 0; width: 100%; }
      .no-print { display: none !important; }
    }
  `;

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER — Loading
  // ═══════════════════════════════════════════════════════════════════════════
  if (loadingSesion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-[600px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER — Error
  // ═══════════════════════════════════════════════════════════════════════════
  if (errorSesion || !premiumData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4">
            {errorSesion || "No se pudo cargar la sesión"}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Intenta acceder desde el calendario de tu unidad.
          </p>
          <Button onClick={() => navigate("/generar-sesion")}>
            Ir al Calendario
          </Button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER — Documento
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-8">
      <style>{printStyles}</style>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="no-print flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/generar-sesion")}
              className="flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg sm:text-[1.875rem] font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Vista Previa – Sesión
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
                    ? "#2563eb"
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
              className="gap-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
            >
              <FileDown className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isGenerating ? "Generando PDF..." : "Descargar PDF"}
              </span>
              <span className="sm:hidden">
                {isGenerating ? "..." : "PDF"}
              </span>
            </Button>
            {sesionId && (
              <Button
                onClick={() => navigate(`/editar-sesion/${sesionId}`)}
                size="sm"
                variant="outline"
                className="gap-1.5 border-violet-300 text-violet-700 hover:bg-violet-50 dark:border-violet-600 dark:text-violet-400 dark:hover:bg-violet-950"
              >
                <Pencil className="h-4 w-4" />
                <span className="hidden sm:inline">Editar contenido</span>
                <span className="sm:hidden">Editar</span>
              </Button>
            )}
            <Button
              onClick={handleGenerarFicha}
              disabled={isGeneratingFicha || !sesionId}
              size="sm"
              variant="outline"
              className="gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-950"
            >
              {isGeneratingFicha ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ClipboardList className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {isGeneratingFicha ? "Generando Ficha..." : "Ficha de Aplicación"}
              </span>
              <span className="sm:hidden">
                {isGeneratingFicha ? "..." : "Ficha"}
              </span>
            </Button>
          </div>
        </div>

        {/* Documento para captura PDF */}
        <div id="print-content" ref={documentRef}>
          <SesionPremiumDoc data={premiumData} instrumento={instrumento ?? undefined} />
        </div>
      </div>
    </div>
  );
}

export default SesionSuscriptorResult;
