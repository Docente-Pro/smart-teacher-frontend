import { DocumentHeader } from "@/components/DocTest/DocumentHeader";
import { DocumentStyles, HtmldocsDocument, HtmldocsFooter } from "@/components/DocTest";
import {
  CompetenciasCriteriosSesionSection,
  splitCriteriosEnDosBloques,
} from "@/components/DocTest/CompetenciasCriteriosSesionSection";
import { formatDateOnlyEsPE } from "@/utils/dateOnlyPeru";
import { parseMarkdown } from "@/utils/parseMarkdown";
import type { IFasePremium, ISesionPremiumResponse } from "@/interfaces/ISesionPremium";

interface SesionPlanLectorDocProps {
  data: ISesionPremiumResponse;
  insigniaUrl?: string | null;
}

function toLabel(val: unknown): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object" && val !== null && "nombre" in val) {
    return String((val as Record<string, unknown>).nombre);
  }
  return String(val);
}

function getTextList(input: string | string[] | undefined): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.map((x) => String(x).trim()).filter(Boolean);
  return String(input)
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

function renderFaseDescripcion(fase: IFasePremium | undefined) {
  const procesos = fase?.procesos ?? [];
  if (procesos.length === 0) return "—";

  return (
    <div style={{ fontSize: "9pt", lineHeight: 1.35 }}>
      {procesos.map((p, idx) => {
        const estrategias = getTextList(p.estrategias);
        return (
          <div key={idx} style={{ marginBottom: "0.35rem" }}>
            {p.proceso ? (
              <p style={{ margin: 0, fontWeight: "bold" }}>{p.proceso}</p>
            ) : null}
            {estrategias.length > 0 ? (
              <ul style={{ margin: "0.15rem 0 0 0.9rem" }}>
                {estrategias.map((e, i) => (
                  <li key={i} style={{ marginBottom: "0.12rem" }}>
                    {parseMarkdown(e)}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function getTiempoLabel(fase: IFasePremium | undefined, fallback: string) {
  const t = fase?.tiempo?.trim();
  return t || fallback;
}

export function SesionPlanLectorDoc({ data, insigniaUrl }: SesionPlanLectorDocProps) {
  const { sesion, docente, institucion, seccion } = data;
  const formatoPlanLector = (sesion as any).formatoFrontPlanLector;
  const datosInfo = formatoPlanLector?.datosInformativos;
  const momentos = formatoPlanLector?.momentos;

  const fecha = formatDateOnlyEsPE(
    datosInfo?.fecha || (sesion as any).fechaInicio || (sesion as any).createdAt,
  );
  const gradoTextLegacy = seccion ? `${toLabel(sesion.grado)} ${seccion}` : toLabel(sesion.grado);
  const gradoText = datosInfo?.gradoSeccion || gradoTextLegacy;

  const tiempoInicio = momentos?.inicio?.tiempo || getTiempoLabel(sesion.inicio, "5 min");
  const tiempoDesarrollo = momentos?.desarrollo?.tiempo || getTiempoLabel(sesion.desarrollo, "35 min");
  const tiempoCierre = momentos?.cierre?.tiempo || getTiempoLabel(sesion.cierre, "5 min");

  const descInicio = momentos?.inicio?.descripcion || "";
  const descDesarrollo = momentos?.desarrollo?.descripcion || "";
  const descCierre = momentos?.cierre?.descripcion || "";

  const criteriosPorCompetencia = (() => {
    const propositos = Array.isArray((sesion as any).propositoAprendizaje)
      ? ((sesion as any).propositoAprendizaje as Array<{ criteriosEvaluacion?: string[] }>)
      : [];

    const primerBloque = (propositos[0]?.criteriosEvaluacion ?? []).filter(Boolean);
    const segundoBloque = (propositos[1]?.criteriosEvaluacion ?? []).filter(Boolean);

    if (primerBloque.length || segundoBloque.length) {
      return [primerBloque, segundoBloque];
    }

    return splitCriteriosEnDosBloques(primerBloque);
  })();

  return (
    <HtmldocsDocument size="A4" orientation="portrait" margin="0.5in">
      <DocumentStyles thBgColor="#e5e7eb" />

      <DocumentHeader
        institucion={institucion}
        titulo={sesion.titulo || "Experiencia de Lectura"}
        accentColor="#111827"
        insigniaUrl={insigniaUrl}
      />

      <h2
        style={{
          textAlign: "center",
          fontSize: "14pt",
          marginBottom: "0.35rem",
          letterSpacing: "0.2px",
        }}
      >
        EXPERIENCIA DE LECTURA
      </h2>

      <table style={{ marginBottom: "0.45rem" }}>
        <tbody>
          <tr>
            <td style={{ width: "35%", fontWeight: "bold", backgroundColor: "#f3f4f6" }}>Área</td>
            <td style={{ width: "65%" }}>
              {datosInfo?.area || toLabel(sesion.area) || "Plan lector - Comunicación"}
            </td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold", backgroundColor: "#f3f4f6" }}>Docente</td>
            <td>{datosInfo?.docente || docente || "—"}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold", backgroundColor: "#f3f4f6" }}>Fecha</td>
            <td>{fecha || "—"}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold", backgroundColor: "#f3f4f6" }}>Grado y sección</td>
            <td>{gradoText || "—"}</td>
          </tr>
        </tbody>
      </table>

      <CompetenciasCriteriosSesionSection
        sectionColor="#f3f4f6"
        criteriosPorCompetencia={criteriosPorCompetencia}
      />

      <table style={{ marginBottom: "2rem" }}>
        <tbody>
          <tr>
            <td style={{ width: "22%", fontWeight: "bold", backgroundColor: "#f3f4f6", verticalAlign: "top" }}>
              Inicio
              <br />
              {tiempoInicio}
            </td>
            <td style={{ width: "78%", minHeight: "120px" }}>
              {descInicio ? (
                <div style={{ fontSize: "9pt", lineHeight: 1.35, whiteSpace: "pre-wrap" }}>
                  {parseMarkdown(descInicio)}
                </div>
              ) : (
                renderFaseDescripcion(sesion.inicio)
              )}
            </td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold", backgroundColor: "#f3f4f6", verticalAlign: "top" }}>
              Desarrollo
              <br />
              {tiempoDesarrollo}
            </td>
            <td>
              {descDesarrollo ? (
                <div style={{ fontSize: "9pt", lineHeight: 1.35, whiteSpace: "pre-wrap" }}>
                  {parseMarkdown(descDesarrollo)}
                </div>
              ) : (
                renderFaseDescripcion(sesion.desarrollo)
              )}
            </td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold", backgroundColor: "#f3f4f6", verticalAlign: "top" }}>
              Cierre
              <br />
              {tiempoCierre}
            </td>
            <td>
              {descCierre ? (
                <div style={{ fontSize: "9pt", lineHeight: 1.35, whiteSpace: "pre-wrap" }}>
                  {parseMarkdown(descCierre)}
                </div>
              ) : (
                renderFaseDescripcion(sesion.cierre)
              )}
            </td>
          </tr>
        </tbody>
      </table>

      <table style={{ marginTop: "2.2rem" }}>
        <tbody>
          <tr>
            <td style={{ width: "50%", textAlign: "center", border: "none", paddingTop: "2.2rem" }}>
              <div style={{ borderTop: "1px solid #000", width: "70%", margin: "0 auto 0.4rem auto" }} />
              Docente
            </td>
            <td style={{ width: "50%", textAlign: "center", border: "none", paddingTop: "2.2rem" }}>
              <div style={{ borderTop: "1px solid #000", width: "70%", margin: "0 auto 0.4rem auto" }} />
              Directivo
            </td>
          </tr>
        </tbody>
      </table>

      <HtmldocsFooter position="bottom-center">
        {() => (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              fontSize: "9pt",
              borderTop: "1px solid #111827",
              paddingTop: "0.2rem",
              color: "#111827",
            }}
          >
            <span>Experiencia de Lectura</span>
          </div>
        )}
      </HtmldocsFooter>
    </HtmldocsDocument>
  );
}

export default SesionPlanLectorDoc;
