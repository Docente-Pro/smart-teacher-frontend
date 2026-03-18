import { useEffect, useRef, useId, useState } from "react";

declare global {
  interface Window {
    AdobeDC?: {
      View: new (config: { clientId: string; divId: string }) => {
        previewFile: (
          fileConfig: {
            content: { location: { url: string } };
            metaData?: { fileName?: string };
          },
          viewerConfig?: Record<string, unknown>,
        ) => void;
      };
    };
  }
}

const ADOBE_VIEW_SDK_URL = "https://acrobatservices.adobe.com/view-sdk/viewer.js";

export type AdobeEmbedMode = "SIZED_CONTAINER" | "FULL_WINDOW" | "IN_LINE" | "LIGHT_BOX";

interface AdobePdfEmbedProps {
  /** Public URL of the PDF (must be CORS-accessible for the viewer to load it). */
  pdfUrl: string;
  /** Display name for the document in the viewer. */
  fileName?: string;
  /** SIZED_CONTAINER = in a box with our size; FULL_WINDOW = full view; IN_LINE = inline; LIGHT_BOX = modal. */
  embedMode?: AdobeEmbedMode;
  /** Optional CSS class for the wrapper div. */
  className?: string;
  /** Show fullscreen button in the viewer toolbar (SIZED_CONTAINER). */
  showFullScreen?: boolean;
  /** Show download button. */
  showDownloadPDF?: boolean;
  /** Show print button. */
  showPrintPDF?: boolean;
  /** Default view: FIT_PAGE, FIT_WIDTH, TWO_COLUMN, etc. */
  defaultViewMode?: "FIT_PAGE" | "FIT_WIDTH" | "TWO_COLUMN" | "TWO_COLUMN_FIT_PAGE";
}

let scriptLoaded = false;
let readyPromise: Promise<void> | null = null;

function ensureScriptAndReady(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  if (readyPromise) return readyPromise;

  const existing = document.querySelector(`script[src="${ADOBE_VIEW_SDK_URL}"]`);
  if (existing) {
    readyPromise =
      (window as any).__adobe_dc_view_sdk_ready__
        ? Promise.resolve()
        : new Promise((resolve) => {
            document.addEventListener("adobe_dc_view_sdk.ready", () => resolve(), { once: true });
          });
    return readyPromise;
  }

  readyPromise = new Promise((resolve, reject) => {
    document.addEventListener("adobe_dc_view_sdk.ready", () => {
      scriptLoaded = true;
      resolve();
    }, { once: true });
    const script = document.createElement("script");
    script.src = ADOBE_VIEW_SDK_URL;
    script.async = true;
    script.onerror = () => reject(new Error("Failed to load Adobe View SDK"));
    document.head.appendChild(script);
  });
  return readyPromise;
}

export function AdobePdfEmbed({
  pdfUrl,
  fileName = "documento.pdf",
  embedMode = "SIZED_CONTAINER",
  className = "",
  showFullScreen = true,
  showDownloadPDF = true,
  showPrintPDF = true,
  defaultViewMode = "FIT_PAGE",
}: AdobePdfEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<{ previewFile: (fileConfig: unknown, viewerConfig?: Record<string, unknown>) => void } | null>(null);
  const divId = useId().replace(/:/g, "-");
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const isLocalhost = typeof window !== "undefined" && /^localhost$|^127\.0\.0\.1$/i.test(window.location.hostname);
  const clientIdLocal = import.meta.env.VITE_ADOBE_CLIENT_LOCAL as string | undefined;
  const clientIdProd = import.meta.env.VITE_ADOBE_CLIENT_ID as string | undefined;
  const clientId = (isLocalhost && clientIdLocal) ? clientIdLocal : clientIdProd;

  useEffect(() => {
    if (!pdfUrl || !clientId) {
      if (!clientId) setError("Adobe PDF Embed no configurado (VITE_ADOBE_CLIENT_ID o, en localhost, VITE_ADOBE_CLIENT_LOCAL).");
      return;
    }

    setError(null);
    setReady(false);

    const container = containerRef.current;
    if (!container) return;

    ensureScriptAndReady()
      .then(() => {
        if (!container.isConnected) return;
        const AdobeDC = window.AdobeDC;
        if (!AdobeDC) {
          setError("Adobe View SDK no disponible.");
          return;
        }

        try {
          const adobeDCView = new AdobeDC.View({ clientId, divId });
          viewRef.current = adobeDCView as any;

          adobeDCView.previewFile(
            {
              content: { location: { url: pdfUrl } },
              metaData: { fileName },
            },
            {
              embedMode,
              showFullScreen,
              showDownloadPDF,
              showPrintPDF,
              defaultViewMode,
            },
          );
          setReady(true);
        } catch (e: any) {
          setError(e?.message || "Error al cargar el visor PDF.");
        }
      })
      .catch((e) => setError(e?.message || "Error al cargar Adobe View SDK."));

    return () => {
      viewRef.current = null;
    };
  }, [pdfUrl, clientId, divId, embedMode, showFullScreen, showDownloadPDF, showPrintPDF, defaultViewMode, fileName]);

  if (!clientId) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg min-h-[400px] ${className}`}>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Configura VITE_ADOBE_CLIENT_ID (producción) y, en local, VITE_ADOBE_CLIENT_LOCAL en .env.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg min-h-[400px] ${className}`}>
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full min-h-[400px] ${className}`}>
      <div
        id={divId}
        ref={containerRef}
        className="w-full h-full min-h-[400px]"
        style={{ visibility: ready ? "visible" : "hidden" }}
      />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <div className="animate-pulse text-slate-400 dark:text-slate-500 text-sm">Cargando visor PDF…</div>
        </div>
      )}
    </div>
  );
}
