/**
 * Editor Syncfusion DOCX.
 * serviceUrl apunta al sidecar .NET /api/documenteditor/
 * License: VITE_SYNCFUSION_LICENSE_KEY (nunca subir al git).
 */
import {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  DocumentEditorContainerComponent,
  Toolbar,
} from "@syncfusion/ej2-react-documenteditor";
import { L10n } from "@syncfusion/ej2-base";
import syncfusionSpanishLocale from "@syncfusion/ej2-locale/src/es.json";
import "@syncfusion/ej2-base/styles/material.css";
import "@syncfusion/ej2-buttons/styles/material.css";
import "@syncfusion/ej2-inputs/styles/material.css";
import "@syncfusion/ej2-popups/styles/material.css";
import "@syncfusion/ej2-lists/styles/material.css";
import "@syncfusion/ej2-navigations/styles/material.css";
import "@syncfusion/ej2-splitbuttons/styles/material.css";
import "@syncfusion/ej2-dropdowns/styles/material.css";
import "@syncfusion/ej2-documenteditor/styles/material.css";

L10n.load({
  es: syncfusionSpanishLocale.es,
});

DocumentEditorContainerComponent.Inject(Toolbar);

const DOCS_SERVICE =
  (import.meta.env.VITE_DOCS_SERVICE_URL as string | undefined)?.replace(
    /\/$/,
    "",
  ) || "http://127.0.0.1:5088";

export type FormatoDocxEditorHandle = {
  exportDocxBlob: () => Promise<Blob>;
  /** Recalcula el layout cuando el contenedor cambia de tamaño. */
  resize: () => void;
};

type Props = {
  /** URL prefirmada del DOCX a abrir */
  downloadUrl: string | null;
  height?: string;
};

const FormatoDocxEditor = forwardRef<FormatoDocxEditorHandle, Props>(
  function FormatoDocxEditor({ downloadUrl, height = "640px" }, ref) {
    const containerRef = useRef<DocumentEditorContainerComponent | null>(null);
    const [status, setStatus] = useState<"cargando" | "listo" | "error">(
      "cargando",
    );
    const [errorMsg, setErrorMsg] = useState<string>("");

    useImperativeHandle(ref, () => ({
      exportDocxBlob: async () => {
        const editor = containerRef.current?.documentEditor;
        if (!editor) throw new Error("El editor todavía no está listo");
        return editor.saveAsBlob("Docx");
      },
      resize: () => containerRef.current?.resize(),
    }));

    // Syncfusion mide el contenedor al montar; tras cambiar de alto hay que avisarle.
    useEffect(() => {
      const id = window.setTimeout(() => containerRef.current?.resize(), 120);
      return () => window.clearTimeout(id);
    }, [height]);

    useEffect(() => {
      if (!downloadUrl || !containerRef.current) return;
      let cancelled = false;

      (async () => {
        try {
          setStatus("cargando");
          const resp = await fetch(downloadUrl);
          if (!resp.ok) throw new Error(`No se pudo descargar (${resp.status})`);
          const blob = await resp.blob();
          const file = new File([blob], "plantilla.docx", {
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          });

          const form = new FormData();
          form.append("files", file);
          const importResp = await fetch(
            `${DOCS_SERVICE}/api/documenteditor/Import`,
            { method: "POST", body: form },
          );
          if (!importResp.ok) {
            throw new Error(
              `El servicio de documentos respondió ${importResp.status}`,
            );
          }
          const sfdt = await importResp.text();
          if (cancelled) return;
          containerRef.current?.documentEditor.open(sfdt);
          containerRef.current?.resize();
          setStatus("listo");
        } catch (e) {
          if (cancelled) return;
          console.error(e);
          setErrorMsg((e as Error).message);
          setStatus("error");
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [downloadUrl]);

    return (
      <div className="relative h-full w-full overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        {status === "error" && (
          <div className="absolute inset-x-0 top-0 z-10 border-b border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            No se pudo abrir el documento en el editor. {errorMsg}
          </div>
        )}
        {status === "cargando" && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/90 dark:bg-slate-900/90">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Abriendo tu documento
            </p>
          </div>
        )}
        <DocumentEditorContainerComponent
          id="mi-formato-editor"
          ref={(r: DocumentEditorContainerComponent | null) => {
            containerRef.current = r;
          }}
          height={height}
          enableToolbar
          locale="es"
          serviceUrl={`${DOCS_SERVICE}/api/documenteditor/`}
        />
      </div>
    );
  },
);

export default FormatoDocxEditor;
