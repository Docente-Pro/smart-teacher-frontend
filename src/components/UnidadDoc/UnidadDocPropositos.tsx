import type { IPropositos, IAreaComplementaria, ICompetenciaProposito } from "@/interfaces/IUnidadIA";
import { Fragment } from "react";
import { getAreaColor } from "@/constants/areaColors";
import { parseMarkdown } from "@/utils/parseMarkdown";

interface Props {
  propositos?: IPropositos;
  areasComplementarias?: IAreaComplementaria[];
}

/** Renderiza texto "vertical" letra por letra usando <br/> — compatible con html2canvas */
function VerticalText({ text }: { text: string }) {
  const chars = text.split("");
  return (
    <>
      {chars.map((ch, i) => (
        <Fragment key={i}>
          {ch === " " ? "\u00A0" : ch}
          {i < chars.length - 1 && <br />}
        </Fragment>
      ))}
    </>
  );
}

function normalizarTexto(value: string): string {
  return value.trim().toLowerCase();
}

function getActividadCriteriosAgrupados(comp: ICompetenciaProposito) {
  const actividades = comp.actividades ?? [];
  const actividadCriterios = comp.actividadCriterios ?? [];
  const usados = new Set<number>();

  const grupos = actividades.map((actividad, idx) => {
    const porNombreIdx = actividadCriterios.findIndex(
      (ac, acIdx) => !usados.has(acIdx) && normalizarTexto(ac.actividad) === normalizarTexto(actividad)
    );
    const mapeadoIdx = porNombreIdx >= 0 ? porNombreIdx : idx;
    const mapeado = actividadCriterios[mapeadoIdx];
    if (mapeado) usados.add(mapeadoIdx);

    return {
      actividad,
      criterios: mapeado?.criterios ?? [],
    };
  });

  if (grupos.length === 0 && actividadCriterios.length > 0) {
    return actividadCriterios.map((ac) => ({
      actividad: ac.actividad,
      criterios: ac.criterios ?? [],
    }));
  }

  return grupos;
}

/**
 * Builds activity-criteria groups for a competency, with fallback distribution
 * when the backend doesn't provide explicit actividadCriterios pairing.
 */
function getGruposConFallback(comp: ICompetenciaProposito): Array<{ actividad: string; criterios: string[] }> {
  const rawGrupos = getActividadCriteriosAgrupados(comp);

  if (rawGrupos.length > 0 && rawGrupos.some((g) => (g.criterios?.length ?? 0) > 0)) {
    return rawGrupos;
  }

  if (rawGrupos.length > 0 && comp.criterios?.length > 0) {
    const criterios = comp.criterios;
    const n = rawGrupos.length;
    const perGroup = Math.ceil(criterios.length / n);
    return rawGrupos.map((g, idx) => ({
      actividad: g.actividad,
      criterios: criterios.slice(idx * perGroup, (idx + 1) * perGroup),
    }));
  }

  if (rawGrupos.length === 0 && comp.actividades?.length > 0 && comp.criterios?.length > 0) {
    const n = comp.actividades.length;
    const perGroup = Math.ceil(comp.criterios.length / n);
    return comp.actividades.map((act, idx) => ({
      actividad: act,
      criterios: comp.criterios.slice(idx * perGroup, (idx + 1) * perGroup),
    }));
  }

  if (rawGrupos.length > 0) return rawGrupos;

  if (comp.criterios?.length > 0) {
    return [{ actividad: "", criterios: comp.criterios }];
  }
  if (comp.actividades?.length > 0) {
    return comp.actividades.map((act) => ({ actividad: act, criterios: [] }));
  }
  return [{ actividad: "", criterios: [] }];
}

/**
 * II. PROPÓSITO DE APRENDIZAJE
 *
 * Gran tabla con columnas: AREA, COMPETENCIAS Y CAPACIDADES, ESTÁNDAR DE APRENDIZAJE,
 * CRITERIOS, ACTIVIDADES, INSTRUMENTOS.
 *
 * Each activity-criteria group gets its own <tr> so criteria and activities
 * are aligned at the same vertical level. rowSpan is used for the other columns.
 */
export function UnidadDocPropositos({ propositos, areasComplementarias }: Props) {
  if (!propositos) return null;

  return (
    <div style={{ marginBottom: "1rem" }}>
      <h3 style={{ fontSize: "10pt", fontWeight: "bold", marginBottom: "0.15rem" }}>
        II. &nbsp;&nbsp;PROPÓSITO DE APRENDIZAJE.
      </h3>

      {/* ─── Tabla principal por áreas ─── */}
      <table style={{ tableLayout: "fixed", width: "100%" }}>
        <colgroup>
          <col style={{ width: "4%" }} />
          <col style={{ width: "16%" }} />
          <col style={{ width: "28%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "14%" }} />
        </colgroup>
        <thead>
          <tr>
            <th style={{ textAlign: "center" }}>ÁREA</th>
            <th style={{ textAlign: "center" }}>COMPETENCIAS Y CAPACIDADES</th>
            <th style={{ textAlign: "center" }}>ESTÁNDAR DE APRENDIZAJE</th>
            <th style={{ textAlign: "center" }}>CRITERIOS DE EVALUACIÓN</th>
            <th style={{ textAlign: "center" }}>ACTIVIDADES</th>
            <th style={{ textAlign: "center" }}>INSTRUMENTOS</th>
          </tr>
        </thead>
        {(propositos.areasPropositos ?? []).map((areaProp, aIdx) => {
          const areaHex = getAreaColor(areaProp.area).hex;

          const compData = (areaProp.competencias ?? []).map((comp) => ({
            comp,
            grupos: getGruposConFallback(comp),
          }));

          if (compData.length === 0) {
            return (
              <tbody key={`${aIdx}-empty`}>
                <tr>
                  <td
                    style={{
                      textAlign: "center",
                      verticalAlign: "middle",
                      fontWeight: "bold",
                      fontSize: "7pt",
                      padding: "0.15rem 0.05rem",
                      backgroundColor: areaHex.light,
                      lineHeight: 1.1,
                    }}
                  >
                    <VerticalText text={areaProp.area.toUpperCase()} />
                  </td>
                  <td colSpan={5} style={{ fontSize: "8pt", color: "#888", fontStyle: "italic" }}>
                    Sin competencias generadas
                  </td>
                </tr>
              </tbody>
            );
          }

          const areaBg = areaHex.light;
          let isFirstAreaRow = true;

          return (
            <tbody
              key={aIdx}
              style={{ pageBreakInside: "avoid", breakInside: "avoid" } as React.CSSProperties}
            >
              {compData.flatMap(({ comp, grupos }, cIdx) => {
                let isFirstCompRow = true;

                return grupos.map((grupo, gIdx) => {
                  const showAreaName = isFirstAreaRow;
                  const showCompContent = isFirstCompRow;
                  if (isFirstAreaRow) isFirstAreaRow = false;
                  if (isFirstCompRow) isFirstCompRow = false;

                  return (
                    <tr key={`${aIdx}-${cIdx}-${gIdx}`}>
                      {/* AREA — every row has this cell; only the first shows the name */}
                      <td
                        style={{
                          textAlign: "center",
                          verticalAlign: "middle",
                          fontWeight: "bold",
                          fontSize: "7pt",
                          padding: "0.15rem 0.05rem",
                          backgroundColor: areaBg,
                          lineHeight: 1.1,
                          ...(!showAreaName ? { borderTop: "hidden" } : {}),
                        } as React.CSSProperties}
                      >
                        {showAreaName && <VerticalText text={areaProp.area.toUpperCase()} />}
                      </td>

                      {/* COMPETENCIA + CAPACIDADES — first grupo shows content */}
                      <td
                        style={{
                          fontSize: "8pt",
                          verticalAlign: "top",
                          ...(!showCompContent ? { borderTop: "hidden" } : {}),
                        } as React.CSSProperties}
                      >
                        {showCompContent && (
                          <>
                            <p style={{ fontWeight: "bold", fontSize: "8pt", marginBottom: "0.15rem" }}>
                              {comp.nombre}
                            </p>
                            {(comp.capacidades ?? []).map((cap, i) => (
                              <p key={i} style={{ fontSize: "8pt", marginBottom: "0.1rem" }}>
                                • {cap}
                              </p>
                            ))}
                          </>
                        )}
                      </td>

                      {/* ESTÁNDAR — first grupo shows content */}
                      <td
                        style={{
                          fontSize: "8pt",
                          verticalAlign: "top",
                          ...(!showCompContent ? { borderTop: "hidden" } : {}),
                        } as React.CSSProperties}
                      >
                        {showCompContent && comp.estandar}
                      </td>

                      {/* CRITERIOS */}
                      <td style={{ fontSize: "8pt", verticalAlign: "top" }}>
                        {(grupo.criterios ?? []).map((crit, j) => (
                          <p
                            key={j}
                            style={{ fontSize: "8pt", marginBottom: "0.12rem", display: "flex", gap: "0.2rem" }}
                          >
                            <span style={{ flexShrink: 0 }}>•</span>
                            <span>{parseMarkdown(crit)}</span>
                          </p>
                        ))}
                      </td>

                      {/* ACTIVIDAD */}
                      <td style={{ fontSize: "8pt", verticalAlign: "top" }}>
                        {grupo.actividad && (
                          <p style={{ fontSize: "8pt", marginBottom: "0.1rem", display: "flex", gap: "0.2rem" }}>
                            <span style={{ flexShrink: 0 }}>•</span>
                            <span>{parseMarkdown(grupo.actividad)}</span>
                          </p>
                        )}
                      </td>

                      {/* INSTRUMENTO — first grupo shows content */}
                      <td
                        style={{
                          fontSize: "8pt",
                          verticalAlign: "middle",
                          textAlign: "center",
                          ...(!showCompContent ? { borderTop: "hidden" } : {}),
                        } as React.CSSProperties}
                      >
                        {showCompContent && comp.instrumento}
                      </td>
                    </tr>
                  );
                });
              })}
            </tbody>
          );
        })}
      </table>

      {/* ─── Competencias Transversales (tabla separada) ─── */}
      {(propositos.competenciasTransversales?.length ?? 0) > 0 && (
        <table style={{ tableLayout: "fixed", width: "100%", marginTop: "0.3rem" }}>
          <colgroup>
            <col style={{ width: "28%" }} />
            <col style={{ width: "36%" }} />
            <col style={{ width: "36%" }} />
          </colgroup>
          <thead>
            <tr>
              <th
                colSpan={3}
                style={{
                  textAlign: "center",
                  backgroundColor: "#FEF3C7",
                  fontWeight: "bold",
                  fontSize: "8pt",
                  padding: "0.2rem",
                }}
              >
                COMPETENCIAS TRANSVERSALES
              </th>
            </tr>
            <tr>
              <th style={{ textAlign: "center" }}>COMPETENCIAS Y CAPACIDADES</th>
              <th style={{ textAlign: "center" }}>ESTÁNDAR DE APRENDIZAJE</th>
              <th style={{ textAlign: "center" }}>CRITERIOS DE EVALUACIÓN</th>
            </tr>
          </thead>
          <tbody>
            {(propositos.competenciasTransversales ?? []).map((ct, i) => (
              <tr key={`trans-${i}`}>
                <td style={{ fontSize: "8pt" }}>
                  <p style={{ fontWeight: "bold", fontSize: "8pt", marginBottom: "0.15rem" }}>
                    {ct.nombre}
                  </p>
                  {(ct.capacidades ?? []).map((cap, j) => (
                    <p key={j} style={{ fontSize: "8pt", marginBottom: "0.05rem" }}>
                      • {cap}
                    </p>
                  ))}
                </td>
                <td style={{ fontSize: "8pt" }}>{ct.estandar || ""}</td>
                <td style={{ fontSize: "8pt" }}>
                  {(ct.criterios ?? []).map((crit, j) => (
                    <p key={j} style={{ fontSize: "8pt", marginBottom: "0.12rem", display: "flex", gap: "0.2rem" }}>
                      <span style={{ flexShrink: 0 }}>•</span>
                      <span>{crit}</span>
                    </p>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ─── Áreas Complementarias ─── */}
      {areasComplementarias && areasComplementarias.length > 0 && (
        <>
          <h3 className="section-subtitle" style={{ marginTop: "0.3rem" }}>
            ÁREA COMPLEMENTARIA
          </h3>
          <table style={{ tableLayout: "fixed", width: "100%" }}>
            <colgroup>
              <col style={{ width: "20%" }} />
              <col style={{ width: "25%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "40%" }} />
            </colgroup>
            <thead>
              <tr>
                <th style={{ textAlign: "center" }}>ÁREA COMPLEMENTARIA</th>
                <th style={{ textAlign: "center" }}>COMPETENCIA RELACIONADA</th>
                <th style={{ textAlign: "center" }}>DIMENSIÓN</th>
                <th style={{ textAlign: "center" }}>ACTIVIDADES</th>
              </tr>
            </thead>
            <tbody>
              {areasComplementarias.map((ac, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: "bold", fontSize: "9pt", textAlign: "center" }}>{ac.area}</td>
                  <td style={{ fontSize: "8pt" }}>
                    <p style={{ fontSize: "8pt" }}>• {ac.competenciaRelacionada}</p>
                  </td>
                  <td style={{ fontSize: "8pt" }}>
                    <p style={{ fontSize: "8pt" }}>• {ac.dimension}</p>
                  </td>
                  <td style={{ fontSize: "8pt" }}>
                    {(ac.actividades ?? []).map((act, j) => (
                      <p key={j} style={{ fontSize: "8pt", marginBottom: "0.12rem", display: "flex", gap: "0.2rem" }}>
                        <span style={{ flexShrink: 0 }}>•</span>
                        <span>{parseMarkdown(act)}</span>
                      </p>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

