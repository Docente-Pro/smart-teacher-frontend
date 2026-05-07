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
import { FichaAplicacionDoc } from "@/components/FichaAplicacionDoc/FichaAplicacionDoc";
import { subirFichaPDFaS3 } from "@/services/fichaAplicacion.service";
import { adminConfirmUploadFicha } from "@/services/admin.service";
import type { IFichaAplicacionData } from "@/interfaces/IFichaAplicacion";

interface AdminFichaState {
  ficha: IFichaAplicacionData;
  fichaId: string;
  presignedUrl: string;
  s3Key: string;
  docente: string;
  institucion: string;
  usuarioId: string;
}

/**
 * Página admin para renderizar la Ficha de Aplicación, generar el PDF,
 * subirlo a S3 y confirmar el upload.
 *
 * Flujo:
 *  1. Recibe datos via `location.state` (desde AdminUsuarioDetalle).
 *  2. Renderiza `<FichaAplicacionDoc />` visible en el DOM.
 *  3. Genera el PDF blob con htmldocs.
 *  4. PUT a la presignedUrl (S3).
 *  5. POST /api/admin/ficha/:fichaId/confirm-upload.
 *  6. Navega de vuelta al detalle del usuario.
 */
export default function AdminFichaPdf() {
  const navigate = useNavigate();
  const location = useLocation();
  const documentRef = useRef<HTMLDivElement>(null);
  const guardadoIniciado = useRef(false);

  const [estado, setEstado] = useState("Preparando ficha…");
  const [error, setError] = useState<string | null>(null);
  const [completado, setCompletado] = useState(false);

  const navState = location.state as AdminFichaState | undefined;

  useEffect(() => {
    if (!navState?.ficha) {
      navigate("/admin/usuarios", { replace: true });
    }
  }, [navState, navigate]);

  const generarYSubir = useCallback(async () => {
    if (!documentRef.current || !navState) return;
    if (guardadoIniciado.current) return;
    guardadoIniciado.current = true;

    try {
      setEstado("Generando PDF…");
      const { generatePDFBlob } = await import("@/services/htmldocs.service");
      const pdfBlob = await generatePDFBlob(documentRef.current, {
        size: "A4",
        orientation: "portrait",
        preserveGraphicSize: true,
      });

      setEstado("Subiendo PDF a S3…");
      await subirFichaPDFaS3(navState.presignedUrl, pdfBlob);

      setEstado("Confirmando subida…");
      await adminConfirmUploadFicha(navState.fichaId, {
        s3Key: navState.s3Key,
      });

      setCompletado(true);
      setEstado("¡Ficha generada y subida exitosamente!");
      toast.success("Ficha de aplicación generada y guardada");

      setTimeout(() => {
        navigate(`/admin/usuarios/${navState.usuarioId}`, { replace: true });
      }, 2000);
    } catch (err: any) {
      console.error("❌ [AdminFichaPdf] Error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Error al generar o subir la ficha",
      );
      guardadoIniciado.current = false;
    }
  }, [navState, navigate]);

  useEffect(() => {
    if (!navState?.ficha || completado || guardadoIniciado.current) return;

    const timer = setTimeout(async () => {
      try {
        if (!documentRef.current) return;
        const images = documentRef.current.querySelectorAll("img");
        const pending = Array.from(images).filter((img) => !img.complete);
        if (pending.length > 0) {
          await Promise.all(
            pending.map(
              (img) =>
                new Promise<void>((resolve) => {
                  img.onload = () => resolve();
                  img.onerror = () => resolve();
                }),
            ),
          );
        }
        await new Promise((r) => setTimeout(r, 500));
        await generarYSubir();
      } catch (err) {
        console.error("❌ [AdminFichaPdf] Error en auto-generación:", err);
      }
    }, 3000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navState?.ficha]);

  if (!navState?.ficha) return null;

  if (!navState.ficha) {
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
              Admin – Ficha de Aplicación
            </h1>
          </div>

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

        <div ref={documentRef}>
          <FichaAplicacionDoc
            ficha={navState.ficha}
            docente={navState.docente}
            institucion={navState.institucion}
          />
        </div>
      </div>
    </div>
  );
}
