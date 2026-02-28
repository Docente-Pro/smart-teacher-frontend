import type { IPropositos, IAreaComplementaria } from "@/interfaces/IUnidadIA";
import React, { Fragment } from "react";
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

/**
 * II. PROPÓSITO DE APRENDIZAJE
 *
 * Gran tabla con columnas: AREA, COMPETENCIAS Y CAPACIDADES, ESTÁNDAR DE APRENDIZAJE,
 * CRITERIOS, ACTIVIDADES, INSTRUMENTOS.
 *
 * Incluye también Competencias Transversales y Áreas Complementarias.
 */
export function UnidadDocPropositos({ propositos, areasComplementarias }: Props) {
  if (!propositos) return null;

  return (
    <div style={{ marginBottom: "1rem" }}>
      <h3 style={{ fontSize: "10pt", fontWeight: "bold", marginBottom: "0.15rem" }}>
        II. &nbsp;&nbsp;PROPÓSITO DE APRENDIZAJE.
      </h3>

      {/* ─── Tabla principal por áreas ─── */}
      <table>
        <thead>
          <tr>
            <th style={{ width: "6%", textAlign: "center" }}>ÁREA</th>
            <th style={{ width: "18%", textAlign: "center" }}>COMPETENCIAS Y CAPACIDADES</th>
            <th style={{ width: "20%", textAlign: "center" }}>ESTÁNDAR DE APRENDIZAJE</th>
            <th style={{ width: "20%", textAlign: "center" }}>CRITERIOS DE EVALUACIÓN</th>
            <th style={{ width: "18%", textAlign: "center" }}>ACTIVIDADES</th>
            <th style={{ width: "18%", textAlign: "center" }}>INSTRUMENTOS</th>
          </tr>
        </thead>
        <tbody>
          {propositos.areasPropositos.map((areaProp, aIdx) => {
            const totalCompetencias = areaProp.competencias.length;
            const areaHex = getAreaColor(areaProp.area).hex;

            return areaProp.competencias.map((comp, cIdx) => {
              const isFirst = cIdx === 0;
              const isLast = cIdx === totalCompetencias - 1;

              // Bordes de la celda del área: ocultar top/bottom intermedios
              const areaCellBorder: React.CSSProperties = {
                borderTop: isFirst ? "1px solid #000" : "none",
                borderBottom: isLast ? "1px solid #000" : "none",
                borderLeft: "1px solid #000",
                borderRight: "1px solid #000",
              };

              return (
              <tr key={`${aIdx}-${cIdx}`}>
                {/* Celda de AREA — en cada fila, texto solo en la primera */}
                <td
                  style={{
                    textAlign: "center",
                    verticalAlign: "middle",
                    width: "24px",
                    maxWidth: "24px",
                    fontWeight: "bold",
                    fontSize: "7pt",
                    padding: "0.15rem 0.05rem",
                    backgroundColor: areaHex.light,
                    lineHeight: 1.1,
                    letterSpacing: "0px",
                    ...areaCellBorder,
                  }}
                >
                  {isFirst && <VerticalText text={areaProp.area.toUpperCase()} />}
                </td>

                {/* Competencia + Capacidades */}
                <td style={{ fontSize: "8pt" }}>
                  <p style={{ fontWeight: "bold", fontSize: "8pt", marginBottom: "0.15rem" }}>
                    {comp.nombre}
                  </p>
                  {comp.capacidades.map((cap, i) => (
                    <p key={i} style={{ fontSize: "8pt", marginBottom: "0.1rem" }}>
                      • {cap}
                    </p>
                  ))}
                </td>

                {/* Estándar */}
                <td style={{ fontSize: "8pt" }}>{comp.estandar}</td>

                {/* Criterios */}
                <td style={{ fontSize: "8pt" }}>
                  {comp.criterios.map((crit, i) => (
                    <p key={i} style={{ fontSize: "8pt", marginBottom: "0.12rem", display: "flex", gap: "0.2rem" }}>
                      <span style={{ flexShrink: 0 }}>•</span>
                      <span>{parseMarkdown(crit)}</span>
                    </p>
                  ))}
                </td>

                {/* Actividades */}
                <td style={{ fontSize: "8pt" }}>
                  {comp.actividades.map((act, i) => (
                    <p key={i} style={{ fontSize: "8pt", marginBottom: "0.1rem", display: "flex", gap: "0.2rem" }}>
                      <span style={{ flexShrink: 0 }}>•</span>
                      <span>{parseMarkdown(act)}</span>
                    </p>
                  ))}
                </td>

                {/* Instrumento */}
                <td style={{ fontSize: "8pt", verticalAlign: "middle", textAlign: "center" }}>
                  {comp.instrumento}
                </td>
              </tr>
              );
            });
          })}

          {/* ─── Competencias Transversales ─── (se renderizan en tabla aparte) */}
        </tbody>
      </table>

      {/* ─── Competencias Transversales (tabla separada) ─── */}
      {propositos.competenciasTransversales.length > 0 && (
        <table style={{ marginTop: "0.3rem" }}>
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
              <th style={{ width: "30%", textAlign: "center" }}>COMPETENCIAS Y CAPACIDADES</th>
              <th style={{ width: "30%", textAlign: "center" }}>ESTÁNDAR DE APRENDIZAJE</th>
              <th style={{ width: "40%", textAlign: "center" }}>CRITERIOS DE EVALUACIÓN</th>
            </tr>
          </thead>
          <tbody>
            {propositos.competenciasTransversales.map((ct, i) => (
              <tr key={`trans-${i}`}>
                <td style={{ fontSize: "8pt" }}>
                  <p style={{ fontWeight: "bold", fontSize: "8pt", marginBottom: "0.15rem" }}>
                    {ct.nombre}
                  </p>
                  {ct.capacidades.map((cap, j) => (
                    <p key={j} style={{ fontSize: "8pt", marginBottom: "0.05rem" }}>
                      • {cap}
                    </p>
                  ))}
                </td>
                <td style={{ fontSize: "8pt" }}>{ct.estandar || ""}</td>
                <td style={{ fontSize: "8pt" }}>
                  {ct.criterios.map((crit, j) => (
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
          <table>
            <thead>
              <tr>
                <th style={{ width: "20%", textAlign: "center" }}>ÁREA COMPLEMENTARIA</th>
                <th style={{ width: "25%", textAlign: "center" }}>COMPETENCIA RELACIONADA</th>
                <th style={{ width: "15%", textAlign: "center" }}>DIMENSIÓN</th>
                <th style={{ width: "40%", textAlign: "center" }}>ACTIVIDADES</th>
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
                    {ac.actividades.map((act, j) => (
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

