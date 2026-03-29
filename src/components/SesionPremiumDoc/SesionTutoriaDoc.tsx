import { DocumentHeader } from "@/components/DocTest/DocumentHeader";
import { DocumentStyles, HtmldocsDocument, HtmldocsFooter } from "@/components/DocTest";
import {
  CompetenciasCriteriosSesionSection,
  splitCriteriosEnDosBloques,
} from "@/components/DocTest/CompetenciasCriteriosSesionSection";
import { formatDateOnlyEsPE } from "@/utils/dateOnlyPeru";
import { parseMarkdown } from "@/utils/parseMarkdown";
import type { IFasePremium, ISesionPremiumResponse } from "@/interfaces/ISesionPremium";

interface SesionTutoriaDocProps {
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
  if (procesos.length === 0) {
    return <span style={{ color: "#666" }}>—</span>;
  }

  return (
    <div style={{ fontSize: "9pt", lineHeight: 1.35 }}>
      {procesos.map((p, idx) => {
        const estrategias = getTextList(p.estrategias);
        return (
          <div key={idx} style={{ marginBottom: "0.35rem" }}>
            {p.proceso && (
              <p style={{ margin: 0, fontWeight: "bold" }}>{p.proceso}</p>
            )}
            {estrategias.length > 0 ? (
              <ul style={{ margin: "0.15rem 0 0 0.9rem" }}>
                {estrategias.map((e, i) => (
                  <li key={i} style={{ marginBottom: "0.12rem" }}>
                    {parseMarkdown(e)}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: 0, color: "#666" }}>—</p>
            )}
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

export function SesionTutoriaDoc({ data, insigniaUrl }: SesionTutoriaDocProps) {
  const { sesion, docente, institucion, seccion, nombreDirectivo } = data;
  const formatoTutoria = (sesion as any).formatoFrontTutoria;
  const datosInfo = formatoTutoria?.datosInformativos;
  const momentos = formatoTutoria?.momentos;

  const gradoTextLegacy = seccion ? `${toLabel(sesion.grado)} ${seccion}` : toLabel(sesion.grado);
  const gradoText = datosInfo?.gradoSeccion || gradoTextLegacy;
  const fecha = formatDateOnlyEsPE(
    datosInfo?.fecha || (sesion as any).fechaInicio || (sesion as any).createdAt,
  );

  const dimension =
    datosInfo?.dimension ||
    (sesion as any).dimension ||
    (sesion.enfoquesTransversales?.[0]?.enfoque as string | undefined) ||
    (sesion.enfoquesTransversales?.[0]?.valor as string | undefined) ||
    "";

  const materiales: string[] = datosInfo?.materiales ?? sesion.preparacion?.recursosMateriales ?? [];
  const queBuscamos = datosInfo?.queBuscamos || sesion.propositoSesion || "";
  const despuesTutoria =
    momentos?.despuesDeLaHoraTutoria?.descripcion ||
    [sesion.reflexiones?.sobreAprendizajes, sesion.reflexiones?.sobreEnsenanza]
      .filter(Boolean)
      .join("\n\n");

  const tiempoPresentacion = momentos?.presentacion?.tiempo || getTiempoLabel(sesion.inicio, "10 min");
  const tiempoDesarrollo = momentos?.desarrollo?.tiempo || getTiempoLabel(sesion.desarrollo, "70 min");
  const tiempoCierre = momentos?.cierre?.tiempo || getTiempoLabel(sesion.cierre, "10 min");

  const descPresentacion = momentos?.presentacion?.descripcion || "";
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
    <HtmldocsDocument size="A4" orientation="portrait" margin="0.35in">
      <DocumentStyles thBgColor="#dbeafe" />
      <style>{`
        .tutoria-compact table {
          margin-bottom: 0.3rem !important;
          table-layout: fixed;
        }
        .tutoria-compact th,
        .tutoria-compact td {
          padding: 0.22rem 0.32rem !important;
          font-size: 8.7pt !important;
          line-height: 1.2 !important;
          word-break: break-word;
        }
        .tutoria-compact p,
        .tutoria-compact li {
          margin-bottom: 0.08rem !important;
          font-size: 8.5pt !important;
          line-height: 1.2 !important;
        }
        .tutoria-compact ul {
          margin: 0 0 0 0.7rem !important;
        }
      `}</style>

      <DocumentHeader
        institucion={institucion}
        titulo={sesion.titulo || "Sesión de Tutoría"}
        accentColor="#1d4ed8"
        insigniaUrl={insigniaUrl}
      />

      <div className="tutoria-compact">
      <table style={{ marginBottom: "0.28rem" }}>
        <tbody>
          <tr>
            <td style={{ width: "20%", fontWeight: "bold", backgroundColor: "#dbeafe" }}>Área:</td>
            <td style={{ width: "35%", backgroundColor: "#eff6ff" }}>{datosInfo?.area || "Tutoría"}</td>
            <td style={{ width: "15%", fontWeight: "bold", backgroundColor: "#dbeafe" }}>Nivel</td>
            <td style={{ width: "30%", backgroundColor: "#eff6ff" }}>{datosInfo?.nivel || toLabel(sesion.nivel)}</td>
          </tr>
          <tr>
            <td colSpan={4} style={{ fontWeight: "bold", backgroundColor: "#dbeafe" }}>
              I DATOS INFORMATIVOS:
            </td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold", backgroundColor: "#dbeafe" }}>Tutor (a)</td>
            <td colSpan={3}>{datosInfo?.tutor || docente}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold", backgroundColor: "#dbeafe" }}>Grado y sección:</td>
            <td>{gradoText}</td>
            <td style={{ fontWeight: "bold", backgroundColor: "#dbeafe" }}>Fecha:</td>
            <td>{fecha || "—"}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold", backgroundColor: "#dbeafe" }}>Dimensión</td>
            <td colSpan={3}>{dimension || "—"}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold", backgroundColor: "#dbeafe" }}>¿Qué buscamos?</td>
            <td colSpan={3} style={{ whiteSpace: "pre-wrap" }}>
              {parseMarkdown(queBuscamos || "—")}
            </td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold", backgroundColor: "#dbeafe" }}>Materiales</td>
            <td colSpan={3}>
              {materiales.length > 0 ? (
                <ul style={{ margin: "0 0 0 0.9rem" }}>
                  {materiales.map((m, i) => (
                    <li key={i} style={{ marginBottom: "0.12rem" }}>
                      {parseMarkdown(m)}
                    </li>
                  ))}
                </ul>
              ) : (
                "—"
              )}
            </td>
          </tr>
        </tbody>
      </table>

      <table
        style={{
          marginBottom: "0.28rem",
          breakInside: "auto",
          pageBreakInside: "auto",
        }}
      >
        <tbody>
          <tr>
            <th style={{ width: "28%", backgroundColor: "#dbeafe", textAlign: "center" }}>MOMENTOS</th>
            <th style={{ width: "72%", backgroundColor: "#dbeafe", textAlign: "center" }}>DESCRIPCIÓN</th>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold", verticalAlign: "top" }}>
              1. PRESENTACIÓN
              <br />
              ({tiempoPresentacion})
            </td>
            <td>
              {descPresentacion ? (
                <div style={{ fontSize: "9pt", lineHeight: 1.35, whiteSpace: "pre-wrap" }}>
                  {parseMarkdown(descPresentacion)}
                </div>
              ) : (
                renderFaseDescripcion(sesion.inicio)
              )}
            </td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold", verticalAlign: "top" }}>
              2. DESARROLLO
              <br />
              ({tiempoDesarrollo})
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
            <td style={{ fontWeight: "bold", verticalAlign: "top" }}>
              3. CIERRE
              <br />
              ({tiempoCierre})
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

      <CompetenciasCriteriosSesionSection
        sectionColor="#dbeafe"
        criteriosPorCompetencia={criteriosPorCompetencia}
      />

      <table
        style={{
          marginBottom: "0.45rem",
          breakInside: "auto",
          pageBreakInside: "auto",
        }}
      >
        <tbody>
          <tr>
            <td style={{ width: "28%", fontWeight: "bold", backgroundColor: "#f8fafc" }}>
              4. DESPUÉS DE LA HORA DE TUTORÍA
              {momentos?.despuesDeLaHoraTutoria?.tiempo ? (
                <>
                  <br />
                  <span style={{ fontWeight: "normal" }}>({momentos.despuesDeLaHoraTutoria.tiempo})</span>
                </>
              ) : null}
            </td>
            <td style={{ width: "72%", whiteSpace: "pre-wrap" }}>
              {parseMarkdown(despuesTutoria || "—")}
            </td>
          </tr>
        </tbody>
      </table>

      <table style={{ marginTop: "0.9rem" }}>
        <tbody>
          <tr>
            <td style={{ width: "50%", textAlign: "center", border: "none", paddingTop: "1.2rem", fontSize: "8.5pt" }}>
              TUTOR RESPONSABLE
            </td>
            <td style={{ width: "50%", textAlign: "center", border: "none", paddingTop: "1.2rem", fontSize: "8.5pt" }}>
              {nombreDirectivo ? "DIRECTIVO" : "DIRECTIVO"}
            </td>
          </tr>
        </tbody>
      </table>
      </div>

      <HtmldocsFooter position="bottom-center">
        {() => (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              fontSize: "9pt",
              borderTop: "1px solid #1d4ed8",
              paddingTop: "0.2rem",
              color: "#1d4ed8",
            }}
          >
            <span>Sesión de Tutoría</span>
          </div>
        )}
      </HtmldocsFooter>
    </HtmldocsDocument>
  );
}

export default SesionTutoriaDoc;
