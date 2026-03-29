import { useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import { Document } from "@htmldocs/react";
import { ArrowLeft, FileDown, Home, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UnidadSecundariaFormatoDoc } from "@/components/UnidadDoc/UnidadSecundariaFormatoDoc";
import { unidadSecundariaFormatoRealMock } from "@/mocks/unidadSecundariaFormatoReal.mock";

function UnidadResultPrueba() {
  const documentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const formato = useMemo(() => unidadSecundariaFormatoRealMock, []);

  const formatoParaRender = useMemo(
    () => formato.formato,
    [formato],
  );

  const handleDownload = async () => {
    if (!documentRef.current) return;
    const { generateAndDownloadPDF } = await import("@/services/htmldocs.service");
    await generateAndDownloadPDF(documentRef.current, "unidad-result-prueba.pdf", {
      size: "A4",
      orientation: "landscape",
      preserveGraphicSize: true,
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-3 mb-6">
          <Button onClick={() => navigate(-1)} variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <Button onClick={() => navigate("/dashboard")} variant="outline" className="gap-2">
            <Home className="h-4 w-4" />
            Inicio
          </Button>
          <Button onClick={() => window.print()} variant="outline" className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
          <Button onClick={handleDownload} className="gap-2 bg-slate-800 text-white hover:bg-slate-900">
            <FileDown className="h-4 w-4" />
            Descargar PDF (Prueba)
          </Button>
        </div>

        <div id="print-content" ref={documentRef}>
          <Document size="A4" orientation="landscape" margin="0.45in">
            <UnidadSecundariaFormatoDoc formato={formatoParaRender} />
          </Document>
        </div>
      </div>
    </div>
  );
}

export default UnidadResultPrueba;

