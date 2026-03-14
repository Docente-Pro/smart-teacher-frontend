import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Cloud,
  Loader2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { SesionPremiumDoc } from "@/components/SesionPremiumDoc/SesionPremiumDoc";
import { buildSesionPremiumData } from "@/utils/offscreenPdfRenderer";
import { subirPDFaS3 } from "@/services/sesiones.service";
import { adminConfirmarUploadPDF } from "@/services/admin.service";
import type { IRehacerSesionResponse } from "@/services/admin.service";
import type { ISesionPremiumResponse } from "@/interfaces/ISesionPremium";

/**
 * Datos que AdminUsuarioDetalle pasa vía `navigate(state)`.
 */
interface AdminRehacerState {
  rehacerResponse: IRehacerSesionResponse;
  docente: string;
  institucion: string;
  seccion?: string;
  usuarioId: string;
}

/**
 * Página dedicada para que el admin genere el PDF de una sesión "rehecha".
 *
 * Flujo:
 *  1. Recibe `IRehacerSesionResponse` + metadatos via `location.state`.
 *  2. Construye `ISesionPremiumResponse` con `buildSesionPremiumData`.
 *  3. Renderiza `<SesionPremiumDoc />` **visible** en el DOM (esto
 *     es lo que permite que html2canvas funcione correctamente).
 *  4. Espera a que las imágenes carguen, genera el PDF blob.
 *  5. Sube el PDF a S3 (sesión original + clones) con URLs presignadas.
 *  6. Confirma las subidas.
 *  7. Navega de vuelta al detalle del usuario.
 */
export default function AdminRehacerPdf() {
  const navigate = useNavigate();
  const location = useLocation();
  const documentRef = useRef<HTMLDivElement>(null);
  const guardadoIniciado = useRef(false);

  // ── State ──
  const [premiumData, setPremiumData] = useState<ISesionPremiumResponse | null>(
    null,
  );
  const [estado, setEstado] = useState("Preparando documento…");
  const [error, setError] = useState<string | null>(null);
  const [completado, setCompletado] = useState(false);

  // ── Extraer datos de navegación ──
  const navState = location.state as AdminRehacerState | undefined;

  // Si no hay state, volver al panel
  useEffect(() => {
    if (!navState?.rehacerResponse) {
      navigate("/admin/usuarios", { replace: true });
    }
  }, [navState, navigate]);

  // ── Construir premiumData al montar ──
  useEffect(() => {
    if (!navState?.rehacerResponse) return;

    const { rehacerResponse, docente, institucion, seccion } = navState;
    const data = buildSesionPremiumData(
      rehacerResponse.contenido,
      {
        id: rehacerResponse.sesion.id,
        titulo: rehacerResponse.sesion.titulo,
        area: rehacerResponse.sesion.area,
        grado: rehacerResponse.sesion.grado,
        nivel: rehacerResponse.sesion.nivel,
      },
      docente,
      institucion,
      seccion,
    );

    setPremiumData(data);
    setEstado("Renderizando documento…");
  }, [navState]);

  // ═══════════════════════════════════════════════════════════════════════════
  // Generar PDF + subir a S3
  // ═══════════════════════════════════════════════════════════════════════════
  const generarYSubir = useCallback(async () => {
    if (!documentRef.current || !navState?.rehacerResponse || !premiumData) return;
    if (guardadoIniciado.current) return;
    guardadoIniciado.current = true;

    const { rehacerResponse, usuarioId } = navState;

    try {
      // ── Generar PDF blob ──
      setEstado("Generando PDF…");
      const { generatePDFBlob } = await import("@/services/htmldocs.service");
      const pdfBlob = await generatePDFBlob(documentRef.current, {
        size: "A4",
        orientation: "portrait",
      });

      // ── Subir PDF original ──
      setEstado("Subiendo PDF…");
      await subirPDFaS3(rehacerResponse.upload.presignedUrl, pdfBlob);

      // ── Confirmar subida original ──
      setEstado("Confirmando subida…");
      await adminConfirmarUploadPDF({
        sesionId: rehacerResponse.sesion.id,
        usuarioId,
        key: rehacerResponse.upload.s3Key,
        contenido:
          typeof rehacerResponse.contenido === "string"
            ? JSON.parse(rehacerResponse.contenido)
            : rehacerResponse.contenido,
      });

      // ── Subir + confirmar cada clon ──
      if (rehacerResponse.clonesUpload?.length) {
        setEstado(
          `Subiendo ${rehacerResponse.clonesUpload.length} clon(es)…`,
        );
        for (const clon of rehacerResponse.clonesUpload) {
          try {
            await subirPDFaS3(clon.presignedUrl, pdfBlob);
            await adminConfirmarUploadPDF({
              sesionId: clon.sesionId,
              usuarioId: clon.usuarioId,
              key: clon.s3Key,
              contenido:
                typeof rehacerResponse.contenido === "string"
                  ? JSON.parse(rehacerResponse.contenido)
                  : rehacerResponse.contenido,
            });
          } catch (clonErr) {
            console.error(
              `❌ [AdminRehacerPdf] Error subiendo clon ${clon.sesionId}:`,
              clonErr,
            );
          }
        }
      }

      // ── Éxito ──
      setCompletado(true);
      setEstado("¡PDF regenerado y subido exitosamente!");
      toast.success(
        rehacerResponse.message ||
          "Sesión rehecha y PDF regenerado exitosamente",
      );

      // Esperar un momento y navegar de vuelta
      setTimeout(() => {
        navigate(`/admin/usuarios/${usuarioId}`, { replace: true });
      }, 2000);
    } catch (err: any) {
      console.error("❌ [AdminRehacerPdf] Error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Error al generar o subir el PDF",
      );
      guardadoIniciado.current = false; // Permitir reintentar
    }
  }, [navState, premiumData, navigate]);

  // ═══════════════════════════════════════════════════════════════════════════
  // Auto-generación: esperar a que el documento se renderice, imágenes carguen
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!premiumData || completado || guardadoIniciado.current) return;

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
        // Pequeña espera extra para que el render termine completamente
        await new Promise((r) => setTimeout(r, 500));
        await generarYSubir();
      } catch (err) {
        console.error("❌ [AdminRehacerPdf] Error en auto-generación:", err);
      }
    }, 3000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [premiumData]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  // Sin datos de navegación
  if (!navState?.rehacerResponse) {
    return null; // El useEffect redirige a /admin/usuarios
  }

  // Cargando premiumData
  if (!premiumData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-[600px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* ── Header con estado ── */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                navigate(`/admin/usuarios/${navState.usuarioId}`, {
                  replace: true,
                })
              }
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Admin – Regenerar PDF
            </h1>
          </div>

          {/* ── Indicador de progreso ── */}
          <div className="flex items-center gap-3 rounded-lg border p-4 bg-white dark:bg-slate-800">
            {error ? (
              <>
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-600">
                    Error al procesar
                  </p>
                  <p className="text-xs text-red-500">{error}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto"
                  onClick={() => {
                    setError(null);
                    generarYSubir();
                  }}
                >
                  Reintentar
                </Button>
              </>
            ) : completado ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-600">
                    {estado}
                  </p>
                  <p className="text-xs text-slate-500">
                    Regresando al detalle del usuario…
                  </p>
                </div>
                <Cloud className="h-5 w-5 text-green-400 ml-auto" />
              </>
            ) : (
              <>
                <Loader2 className="h-5 w-5 text-amber-500 animate-spin flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {estado}
                  </p>
                  <p className="text-xs text-slate-400">
                    No cierres esta pestaña hasta que finalice.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Documento para captura PDF ── */}
        <div ref={documentRef}>
          <SesionPremiumDoc data={premiumData} instrumento={null} />
        </div>
      </div>
    </div>
  );
}
