/**
 * SesionPremiumDoc.tsx
 *
 * Documento PDF para sesiones PREMIUM (generadas dentro de una unidad).
 * Reutiliza DocumentStyles y DocumentHeader del flujo FREE, pero adapta
 * las secciones a la forma de datos ISesionPremiumResponse:
 *  - propositoAprendizaje es un array de competencias (no un objeto singular)
 *  - estrategias y recursosDidacticos pueden ser string o string[]
 *  - enfoquesTransversales usa enfoque/valor/actitud
 *  - Cada proceso puede incluir imágenes SVG opcionales
 *  - Incluye resumen de la sesión y fuentes MINEDU consultadas
 *
 * Cada área tiene su propio esquema de color (importado de areaColors.ts),
 * aplicado a cabeceras de sección, th, header y footer.
 */

import { DocumentStyles, HtmldocsDocument, HtmldocsFooter } from "@/components/DocTest";
import { DocumentHeader } from "@/components/DocTest/DocumentHeader";
import {
  CompetenciasCriteriosSesionSection,
  splitCriteriosEnDosBloques,
} from "@/components/DocTest/CompetenciasCriteriosSesionSection";
import { getAreaColor, type AreaColorConfig } from "@/constants/areaColors";
import { InstrumentoEvaluacionSection } from "./InstrumentoEvaluacionSection";
import { SesionTutoriaDoc } from "./SesionTutoriaDoc";
import { SesionPlanLectorDoc } from "./SesionPlanLectorDoc";
import { getSavedAlumnos } from "@/utils/alumnosStorage";
import { GraficoRenderer } from "@/features/graficos-educativos/presentation/components/GraficoRenderer";
import { parseMarkdown } from "@/utils/parseMarkdown";
import { formatDateOnlyEsPE } from "@/utils/dateOnlyPeru";
import type {
  ISesionPremiumResponse,
  IPropositoAprendizajePremium,
  IEnfoqueTransversalPremium,
  IPreparacionPremium,
  IProcesoPremium,
  IFasePremium,
  IReflexionesPremium,
  IFuenteMinedu,
} from "@/interfaces/ISesionPremium";
import type { IInstrumentoEvaluacion } from "@/interfaces/IInstrumentoEvaluacion";
import type { IRecursoNarrativo } from "@/interfaces/ISesionComplementaria";

// ═════════════════════════════════════════════════════════════════════════════
// Helpers
// ═════════════════════════════════════════════════════════════════════════════

/** Hex colors for inline PDF styles (subset of AreaColorConfig) */
type AreaHex = AreaColorConfig["hex"];

/** Tipos de gráficos que son tablas y necesitan ancho completo */
const GRAFICOS_TABLA = [
  'tabla_doble_entrada',
  'tabla_precios',
  'tabla_valores',
  'tabla_observacion',
  'tabla_frecuencias',
  'tabla_habitos',
  'cuadro_comparativo',
  'linea_tiempo',
  'organizador_kvl',
  'planificador_escritura',
  'estructura_narrativa',
  'ficha_autoconocimiento',
  'clasificacion_dicotomica',
];

/** Determina si un gráfico necesita ancho completo (tablas, organizadores, etc.) */
function esGraficoAnchoCompleto(grafico: Record<string, unknown> | null | undefined): boolean {
  if (!grafico || !grafico.tipoGrafico) return false;
  return GRAFICOS_TABLA.includes(grafico.tipoGrafico as string);
}

/** Verifica que un gráfico tenga datos mínimos para renderizar (no solo tipo + título) */
function esGraficoRenderable(grafico: unknown): boolean {
  if (!grafico || typeof grafico !== "object") return false;
  const g = grafico as Record<string, unknown>;
  if (!g.tipoGrafico) return false;
  const keys = Object.keys(g).filter(
    (k) => !["tipoGrafico", "titulo", "descripcion", "leyenda", "subtitulo"].includes(k)
  );
  return keys.some((k) => {
    const v = g[k];
    return Array.isArray(v) ? v.length > 0 : v != null && v !== "";
  });
}

/**
 * El backend puede devolver area/nivel/grado como string O como objeto
 * { id, nombre, ... }. Esta función extrae el nombre en ambos casos.
 */
function toLabel(val: unknown): string {
  if (!val) return "-";
  if (typeof val === "string") return val;
  if (typeof val === "object" && val !== null && "nombre" in val) {
    return String((val as Record<string, unknown>).nombre);
  }
  return String(val);
}

// ═════════════════════════════════════════════════════════════════════════════
// Sub-secciones internas
// ═════════════════════════════════════════════════════════════════════════════

/** Datos Generales */
function DatosGeneralesPremium({
  area,
  docente,
  director,
  grado,
  nivel,
  duracion,
  seccion,
  fecha,
  hex,
}: {
  area?: unknown;
  docente: string;
  director?: string;
  grado?: unknown;
  nivel?: unknown;
  duracion?: number;
  seccion?: string;
  fecha?: string;
  hex: AreaHex;
}) {
  /* Texto de grado + sección */
  const gradoText = seccion
    ? `${toLabel(grado)} "${seccion}"`
    : toLabel(grado);

  /* Formatear fecha (solo día, alineado a Perú para no mostrar 15 en vez de 16) */
  const fechaTexto = formatDateOnlyEsPE(fecha);

  return (
    <>
      <table style={{ marginBottom: "0.5rem" }}>
        <tbody>
          <tr>
            <td style={{ width: "18%", fontWeight: "bold", backgroundColor: hex.light }}>Área:</td>
            <td style={{ width: "82%", backgroundColor: hex.light }}>{toLabel(area)}</td>
          </tr>
        </tbody>
      </table>

      <table style={{ marginBottom: "0.5rem" }}>
        <tbody>
          <tr>
            <td
              colSpan={4}
              style={{ backgroundColor: hex.light, fontWeight: "bold" }}
            >
              DATOS INFORMATIVOS:
            </td>
          </tr>
          <tr>
            <td style={{ width: "18%", fontWeight: "bold" }}>Docente:</td>
            <td colSpan={3} data-word-lock="docente">{docente}</td>
          </tr>
          {director && (
            <tr>
              <td style={{ width: "18%", fontWeight: "bold" }}>Director(a):</td>
              <td colSpan={3}>{director}</td>
            </tr>
          )}
          <tr>
            <td style={{ width: "18%", fontWeight: "bold" }}>Nivel:</td>
            <td style={{ width: "32%" }}>{toLabel(nivel)}</td>
            <td style={{ width: "18%", fontWeight: "bold" }}>Grado:</td>
            <td>{gradoText}</td>
          </tr>
          {duracion && (
            <tr>
              <td style={{ width: "18%", fontWeight: "bold" }}>Duración:</td>
              <td colSpan={3}>{duracion} minutos</td>
            </tr>
          )}
          {fechaTexto && (
            <tr>
              <td style={{ width: "18%", fontWeight: "bold" }}>Fecha:</td>
              <td colSpan={3}>{fechaTexto}</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}

/** Propósito de aprendizaje — múltiples competencias */
function PropositosAprendizajePremium({
  propositos,
  hex,
}: {
  propositos: IPropositoAprendizajePremium[];
  hex: AreaHex;
}) {
  return (
    <table style={{ marginBottom: "0.5rem" }}>
      <tbody>
        <tr>
          <td
            colSpan={4}
            style={{
              backgroundColor: hex.light,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            PROPÓSITOS DE APRENDIZAJE Y EVIDENCIAS DE APRENDIZAJE
          </td>
        </tr>
        <tr>
          <th style={{ width: "30%", backgroundColor: hex.light }}>
            COMPETENCIAS Y CAPACIDADES
          </th>
          <th style={{ width: "29%", backgroundColor: hex.light }}>
            CRITERIOS DE EVALUACIÓN
          </th>
          <th style={{ width: "29%", backgroundColor: hex.light }}>
            PRODUCTO O EVIDENCIA
          </th>
          <th style={{ width: "12%", backgroundColor: hex.light }}>
            INSTRUMENTO DE EVALUACIÓN
          </th>
        </tr>
        {propositos.slice(0, 1).map((p, i) => (
          <tr key={i}>
            <td>
              <p style={{ fontWeight: "bold", marginBottom: "0.3rem" }}>
                {p.competencia || "Sin competencia"}
              </p>
              {p.capacidades?.length > 0 ? (
                p.capacidades.map((cap, ci) => (
                  <p
                    key={ci}
                    style={{ fontSize: "9pt", marginBottom: "0.2rem" }}
                  >
                    • {cap}
                  </p>
                ))
              ) : (
                <p
                  style={{
                    fontSize: "9pt",
                    fontStyle: "italic",
                    color: "#666",
                  }}
                >
                  –
                </p>
              )}
            </td>
            <td>
              {p.criteriosEvaluacion?.length > 0 ? (
                p.criteriosEvaluacion.map((c, ci) => (
                  <p
                    key={ci}
                    style={{ fontSize: "9pt", marginBottom: "0.2rem" }}
                  >
                    • {c}
                  </p>
                ))
              ) : (
                <p
                  style={{
                    fontSize: "9pt",
                    fontStyle: "italic",
                    color: "#666",
                  }}
                >
                  –
                </p>
              )}
            </td>
            <td style={{ fontSize: "9pt" }}>
              {p.evidencia || "–"}
            </td>
            <td style={{ fontSize: "9pt", textAlign: "center" }}>
              {p.instrumento || "–"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Propósito de la sesión */
function PropositoSesionPremium({
  texto,
  hex,
}: {
  texto: string;
  hex: AreaHex;
}) {
  const bullets = texto
    .split(/\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <table style={{ marginBottom: "0.5rem" }}>
      <tbody>
        <tr>
          <td
            colSpan={2}
            style={{
              backgroundColor: hex.light,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            PROPÓSITO DE LA SESIÓN
          </td>
        </tr>
        <tr>
          <td colSpan={2} style={{ fontSize: "10pt", padding: "0.5rem" }}>
            {bullets.length > 1 ? (
              <ul style={{ marginLeft: "1rem", lineHeight: 1.6 }}>
                {bullets.map((b, i) => (
                  <li key={i} style={{ marginBottom: "0.25rem" }}>
                    {b}
                  </li>
                ))}
              </ul>
            ) : (
              <span>{texto}</span>
            )}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/** Enfoques transversales */
function EnfoquesTransversalesPremium({
  enfoques,
  hex,
}: {
  enfoques: IEnfoqueTransversalPremium[];
  hex: AreaHex;
}) {
  return (
    <table style={{ marginBottom: "0.5rem" }}>
      <tbody>
        <tr>
          <th style={{ width: "30%", backgroundColor: hex.light }}>
            ENFOQUES TRANSVERSALES
          </th>
          <th style={{ width: "25%", backgroundColor: hex.light }}>VALOR</th>
          <th style={{ width: "45%", backgroundColor: hex.light }}>
            ACTITUDES O ACCIONES OBSERVABLES
          </th>
        </tr>
        {enfoques.map((e, i) => (
          <tr key={i}>
            <td style={{ fontSize: "9pt", fontWeight: "bold" }}>
              {e.enfoque}
            </td>
            <td style={{ fontSize: "9pt" }}>{e.valor}</td>
            <td style={{ fontSize: "9pt" }}>{e.actitud || e.actitudes || "–"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Preparación: Antes de la sesión */
function PreparacionPremium({
  preparacion,
  hex,
}: {
  preparacion: IPreparacionPremium;
  hex: AreaHex;
}) {
  return (
    <table style={{ marginBottom: "0.5rem" }}>
      <tbody>
        <tr>
          <td
            colSpan={2}
            style={{
              backgroundColor: hex.light,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            ANTES DE LA SESIÓN
          </td>
        </tr>
        <tr>
          <th style={{ width: "50%", backgroundColor: hex.light }}>
            ¿QUÉ NECESITAMOS HACER ANTES DE LA SESIÓN?
          </th>
          <th style={{ width: "50%", backgroundColor: hex.light }}>
            ¿QUÉ RECURSOS O MATERIALES SE UTILIZARÁN EN ESTA SESIÓN?
          </th>
        </tr>
        <tr>
          <td style={{ verticalAlign: "top" }}>
            <ul
              className="custom-list"
              style={{
                marginLeft: "0.8rem",
                fontSize: "9pt",
                lineHeight: "1.6",
              }}
            >
              {preparacion.quehacerAntes?.map((item, i) => (
                <li key={i} style={{ marginBottom: "0.3rem" }}>
                  {item}
                </li>
              ))}
            </ul>
          </td>
          <td style={{ verticalAlign: "top" }}>
            <ul
              className="custom-list"
              style={{
                marginLeft: "0.8rem",
                fontSize: "9pt",
                lineHeight: "1.6",
              }}
            >
              {preparacion.recursosMateriales?.map((r, i) => (
                <li key={i} style={{ marginBottom: "0.3rem" }}>
                  {r}
                </li>
              ))}
            </ul>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/** Fila de un proceso dentro de una fase (Inicio/Desarrollo/Cierre) */
function ProcesoPremiumRow({
  proceso,
  idx,
}: {
  proceso: IProcesoPremium;
  idx: number;
}) {
  const estrategiasTexto =
    Array.isArray(proceso.estrategias)
      ? proceso.estrategias.join("\n")
      : proceso.estrategias || "";

  // Normalizar imágenes: soporta imagen singular (v2), imagenes array (v1)
  // e imagenContenido (contenido didáctico: tabla, gráfico, mapa, etc.)
  const baseImagenes = proceso.imagenes ?? (proceso.imagen ? [proceso.imagen] : []);
  const imagenes = proceso.imagenContenido?.url
    ? [...baseImagenes, { ...proceso.imagenContenido, posicion: proceso.imagenContenido.posicion || "debajo" }]
    : baseImagenes;
  const imgAntes = imagenes.filter((img) => img.posicion === "antes");
  const imgJunto = imagenes.filter((img) => img.posicion === "junto");
  const imgDespues = imagenes.filter((img) => img.posicion === "despues" || img.posicion === "debajo" || (!img.posicion && img.posicion !== "antes" && img.posicion !== "junto"));

  const tituloProc = proceso.proceso || "";

  return (
    <tr key={idx}>
      <td style={{ fontSize: "9pt", padding: "0.8rem", lineHeight: "1.6" }}>
        {/* Imágenes con posicion "antes" */}
        {imgAntes.length > 0 && (
          <div style={{ marginBottom: "0.6rem", textAlign: "center" }}>
            {imgAntes.map((img, imgIdx) => (
              <div key={(img as any).id ?? imgIdx} style={{ display: "inline-block", margin: "0 0.5rem" }}>
                <img
                  src={img.url}
                  alt={img.descripcion || ""}
                  crossOrigin="anonymous"
                  style={{ maxWidth: "260px", maxHeight: "220px" }}
                />
                {(img as any).texto_overlay && (
                  <div style={{ fontSize: "8pt", color: "#1e293b", marginTop: "0.3rem", padding: "0.4rem 0.6rem", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "4px", textAlign: "left", whiteSpace: "pre-wrap" }}>
                    {(img as any).texto_overlay}
                  </div>
                )}
                {img.descripcion && (
                  <div style={{ fontSize: "7pt", color: "#64748b", marginTop: "0.2rem" }}>
                    {img.descripcion}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* "TítuloProceso: estrategias..." — sin label "Estrategias:" */}
        {estrategiasTexto && imgJunto.length > 0 ? (
          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", marginBottom: "0.8rem" }}>
            <div style={{ flex: 1, whiteSpace: "pre-wrap" }}>
              {tituloProc && <strong>{tituloProc}: </strong>}
              {Array.isArray(proceso.estrategias) && proceso.estrategias.length > 1 ? (
                <ul style={{ marginLeft: "1rem", marginTop: "0.3rem", lineHeight: 1.6 }}>
                  {proceso.estrategias.map((e, i) => (
                    <li key={i} style={{ marginBottom: "0.2rem" }}>{parseMarkdown(e)}</li>
                  ))}
                </ul>
              ) : (
                <span>{parseMarkdown(estrategiasTexto)}</span>
              )}
            </div>
            <div style={{ flexShrink: 0, maxWidth: "35%", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {imgJunto.map((img, imgIdx) => (
                <div key={(img as any).id ?? imgIdx} style={{ textAlign: "center" }}>
                  <img
                    src={img.url}
                    alt={img.descripcion || ""}
                    crossOrigin="anonymous"
                    style={{ maxWidth: "260px", maxHeight: "220px" }}
                  />
                  {(img as any).texto_overlay && (
                    <div style={{ fontSize: "8pt", color: "#1e293b", marginTop: "0.3rem", padding: "0.4rem 0.6rem", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "4px", textAlign: "left", whiteSpace: "pre-wrap" }}>
                      {(img as any).texto_overlay}
                    </div>
                  )}
                  {img.descripcion && (
                    <div style={{ fontSize: "7pt", color: "#64748b", marginTop: "0.2rem" }}>
                      {img.descripcion}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : estrategiasTexto ? (
          <div style={{ marginBottom: "0.8rem", whiteSpace: "pre-wrap" }}>
            {tituloProc && <strong>{tituloProc}: </strong>}
            {Array.isArray(proceso.estrategias) &&
            proceso.estrategias.length > 1 ? (
              <ul
                style={{
                  marginLeft: "1rem",
                  marginTop: "0.3rem",
                  lineHeight: 1.6,
                }}
              >
                {proceso.estrategias.map((e, i) => (
                  <li key={i} style={{ marginBottom: "0.2rem" }}>
                    {parseMarkdown(e)}
                  </li>
                ))}
              </ul>
            ) : (
              <span>{parseMarkdown(estrategiasTexto)}</span>
            )}
          </div>
        ) : tituloProc ? (
          <div style={{ marginBottom: "0.8rem" }}>
            <strong>{tituloProc}</strong>
          </div>
        ) : null}

        {/* Imágenes con posicion "despues" o sin posicion */}
        {imgDespues.length > 0 && (
          <div style={{ marginBottom: "0.6rem", textAlign: "center" }}>
            {imgDespues.map((img, imgIdx) => (
              <div key={(img as any).id ?? imgIdx} style={{ display: "inline-block", margin: "0 0.5rem" }}>
                <img
                  src={img.url}
                  alt={img.descripcion || ""}
                  crossOrigin="anonymous"
                  style={{ maxWidth: "260px", maxHeight: "220px" }}
                />
                {(img as any).texto_overlay && (
                  <div style={{ fontSize: "8pt", color: "#1e293b", marginTop: "0.3rem", padding: "0.4rem 0.6rem", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "4px", textAlign: "left", whiteSpace: "pre-wrap" }}>
                    {(img as any).texto_overlay}
                  </div>
                )}
                {img.descripcion && (
                  <div style={{ fontSize: "7pt", color: "#64748b", marginTop: "0.2rem" }}>
                    {img.descripcion}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ─── Gráficos y Problema Matemático ─── */}
        {(proceso as any).problemaMatematico && (() => {
          const esOtrosProblemas = /otros\s+problemas/i.test(proceso.proceso || "");
          return (
            <>
              {/* Gráfico del problema — oculto en "otros problemas" */}
              {!esOtrosProblemas && proceso.grafico && esGraficoRenderable(proceso.grafico) && (
                <div className="no-break" style={{
                  marginTop: "0.6rem",
                  marginBottom: "0.6rem",
                  padding: "0.6rem 0.8rem",
                  backgroundColor: "#f0f9ff",
                  borderRadius: "8px",
                  border: "1px solid #bae6fd",
                  textAlign: "center",
                  overflow: "visible",
                }}>
                  <p style={{ fontSize: "8pt", fontWeight: "bold", color: "#0369a1", margin: "0 0 0.5rem 0" }}>
                    📝 Problema Matemático:
                  </p>
                  <div style={{
                    maxWidth: esGraficoAnchoCompleto(proceso.grafico as Record<string, unknown>) ? "100%" : 340,
                    width: "100%",
                    margin: "0 auto",
                    minWidth: 0,
                  }}>
                    <GraficoRenderer grafico={proceso.grafico as any} mostrarErrores={false} />
                  </div>
                </div>
              )}

              {/* Texto del problema */}
              <div className="no-break" style={{
                marginTop: "0.6rem",
                marginBottom: "0.6rem",
                padding: "0.7rem 1rem",
                backgroundColor: "#f0f9ff",
                borderRadius: "8px",
                borderLeft: "4px solid #0284c7",
              }}>
                {esOtrosProblemas && (
                  <p style={{ fontSize: "8pt", fontWeight: "bold", color: "#0369a1", margin: "0 0 0.3rem 0" }}>
                    📝 Problema Matemático:
                  </p>
                )}
                <p style={{ fontSize: "9pt", lineHeight: "1.6", margin: 0 }}>
                  {(proceso as any).problemaMatematico}
                </p>
              </div>

              {/* Operación matemática — gráfico o texto según sección */}
              {(proceso as any).graficoOperacion && esGraficoRenderable((proceso as any).graficoOperacion) && (
                esOtrosProblemas ? (
                  <div style={{
                    marginTop: "0.5rem",
                    marginBottom: "0.5rem",
                    backgroundColor: "#faf5ff",
                    padding: "0.5rem 0.9rem",
                    borderRadius: "8px",
                    borderLeft: "4px solid #d8b4fe",
                  }}>
                    <span style={{ fontSize: "8pt", fontWeight: "bold", color: "#7c3aed" }}>🔢 Operación Matemática: </span>
                    <span style={{ fontSize: "9.5pt", fontWeight: "600", color: "#1e293b" }}>
                      {(() => {
                        const g = (proceso as any).graficoOperacion as Record<string, unknown>;
                        const t = g.titulo ? String(g.titulo) : "";
                        const d = g.descripcion ? String(g.descripcion) : "";
                        const sym: Record<string, string> = { suma: "+", resta: "−", multiplicacion: "×", division: "÷" };
                        let exp = "";
                        if (g.tipoGrafico === "operacion_vertical" && Array.isArray(g.operandos) && (g.operandos as number[]).length >= 2) {
                          const s = sym[String(g.operacion ?? "suma")] ?? "+";
                          const ops = g.operandos as number[];
                          exp = `${ops[0]} ${s} ${ops.slice(1).join(` ${s} `)} = ${g.resultado != null ? g.resultado : "___"}`;
                        }
                        return [t, exp, d].filter(Boolean).join(" — ");
                      })()}
                    </span>
                  </div>
                ) : (
                  <div className="no-break" style={{
                    marginTop: "0.5rem",
                    marginBottom: "0.5rem",
                    padding: "0.6rem 0.8rem",
                    backgroundColor: "#faf5ff",
                    borderRadius: "8px",
                    border: "2px solid #d8b4fe",
                    textAlign: "center",
                    overflow: "visible",
                  }}>
                    <p style={{ fontSize: "8pt", fontWeight: "bold", color: "#7c3aed", margin: "0 0 0.5rem 0" }}>
                      🔢 Operación Matemática:
                    </p>
                    <div style={{
                      maxWidth: esGraficoAnchoCompleto((proceso as any).graficoOperacion as Record<string, unknown>) ? "100%" : 340,
                      width: "100%",
                      margin: "0 auto",
                      minWidth: 0,
                    }}>
                      <GraficoRenderer grafico={(proceso as any).graficoOperacion as any} mostrarErrores={false} />
                    </div>
                  </div>
                )
              )}
            </>
          );
        })()}

        {/* Gráfico standalone (sin problemaMatematico) */}
        {proceso.grafico && esGraficoRenderable(proceso.grafico) && !(proceso as any).problemaMatematico && (
          <div className="no-break" style={{
            marginTop: "0.6rem",
            marginBottom: "0.6rem",
            padding: "0.6rem 0.8rem",
            background: "linear-gradient(to bottom, #f8fafc 0%, #f1f5f9 100%)",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            textAlign: "center",
            overflow: "visible",
          }}>
            <div style={{
              maxWidth: esGraficoAnchoCompleto(proceso.grafico as Record<string, unknown>) ? "100%" : 340,
              width: "100%",
              margin: "0 auto",
              minWidth: 0,
            }}>
              <GraficoRenderer grafico={proceso.grafico as any} mostrarErrores={false} />
            </div>
          </div>
        )}

        {/* Respuestas del docente (transversal — todas las áreas) */}
        {(proceso as any).respuestasDocente && (proceso as any).respuestasDocente.length > 0 && (
          <div className="no-break" style={{
            marginTop: "0.8rem",
            marginBottom: "0.8rem",
            backgroundColor: "#fffbeb",
            padding: "0.8rem 1rem",
            borderRadius: "8px",
            borderLeft: "4px solid #f59e0b",
          }}>
            <p style={{ fontSize: "9pt", fontWeight: "bold", color: "#92400e", marginBottom: "0.5rem", margin: 0 }}>
              📋 Respuestas para el docente:
            </p>
            {(proceso as any).respuestasDocente.map((r: { pregunta: string; respuestaEsperada: string }, idx: number) => (
              <div key={idx} style={{ marginTop: "0.5rem", fontSize: "8.5pt", lineHeight: "1.5" }}>
                <p style={{ margin: 0, fontWeight: "600", color: "#78350f" }}>
                  {idx + 1}. {r.pregunta}
                </p>
                <p style={{ margin: "0.15rem 0 0 0.8rem", color: "#065f46", fontStyle: "italic" }}>
                  → {r.respuestaEsperada}
                </p>
              </div>
            ))}
          </div>
        )}

      </td>
    </tr>
  );
}

/** Secuencia Didáctica: Inicio / Desarrollo / Cierre */
function SecuenciaDidacticaPremium({
  inicio,
  desarrollo,
  cierre,
  hex,
}: {
  inicio: IFasePremium;
  desarrollo: IFasePremium;
  cierre: IFasePremium;
  hex: AreaHex;
}) {
  return (
    <table style={{ marginBottom: "0.5rem" }}>
      <tbody>
        <tr>
          <td
            colSpan={2}
            style={{
              backgroundColor: hex.light,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            MOMENTOS Y TIEMPOS DE LA SESIÓN
          </td>
        </tr>

        {/* INICIO */}
        <tr>
          <td
            colSpan={2}
            style={{ backgroundColor: hex.light, fontWeight: "bold" }}
          >
            INICIO - Tiempo aproximado: {inicio.tiempo || "15 minutos"}
          </td>
        </tr>
        {inicio.procesos?.map((p, i) => (
          <ProcesoPremiumRow key={`i-${i}`} proceso={p} idx={i} />
        ))}

        {/* DESARROLLO */}
        <tr>
          <td
            colSpan={2}
            style={{ backgroundColor: hex.light, fontWeight: "bold" }}
          >
            DESARROLLO - Tiempo aproximado:{" "}
            {desarrollo.tiempo || "60 minutos"}
          </td>
        </tr>
        {desarrollo.procesos?.map((p, i) => (
          <ProcesoPremiumRow key={`d-${i}`} proceso={p} idx={i} />
        ))}

        {/* CIERRE / DESENLACE */}
        <tr>
          <td
            colSpan={2}
            style={{ backgroundColor: hex.light, fontWeight: "bold" }}
          >
            CIERRE / DESENLACE - Tiempo aproximado: {cierre.tiempo || "15 minutos"}
          </td>
        </tr>
        {cierre.procesos?.map((p, i) => (
          <ProcesoPremiumRow key={`c-${i}`} proceso={p} idx={i} />
        ))}
      </tbody>
    </table>
  );
}

/** Reflexiones sobre el aprendizaje */
function ReflexionesPremium({
  reflexiones,
  hex,
}: {
  reflexiones: IReflexionesPremium;
  hex: AreaHex;
}) {
  if (!reflexiones) return null;
  return (
    <table style={{ marginBottom: "0.5rem" }}>
      <tbody>
        <tr>
          <td
            colSpan={2}
            style={{
              backgroundColor: hex.light,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            REFLEXIONES SOBRE EL APRENDIZAJE
          </td>
        </tr>
        <tr>
          <th style={{ width: "50%", backgroundColor: hex.light }}>
            SOBRE LOS APRENDIZAJES
          </th>
          <th style={{ width: "50%", backgroundColor: hex.light }}>
            SOBRE LA ENSEÑANZA
          </th>
        </tr>
        <tr>
          <td style={{ fontSize: "9pt", verticalAlign: "top" }}>
            {reflexiones.sobreAprendizajes || "–"}
          </td>
          <td style={{ fontSize: "9pt", verticalAlign: "top" }}>
            {reflexiones.sobreEnsenanza || "–"}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Resumen y Fuentes MINEDU
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Recurso narrativo para sesiones complementarias (Plan Lector / Tutoría).
 * Muestra el texto completo listo para fotocopiar: título, contenido y fuente.
 */
function RecursoNarrativoPremium({
  recurso,
  hex,
}: {
  recurso: IRecursoNarrativo;
  hex: AreaHex;
}) {
  if (!recurso?.contenido) return null;

  // Capitalizar tipo: "testimonio" → "Testimonio"
  const tipoLabel = recurso.tipo
    ? recurso.tipo.charAt(0).toUpperCase() + recurso.tipo.slice(1)
    : "Recurso";

  return (
    <table style={{ marginBottom: "0.5rem", width: "100%" }}>
      <tbody>
        <tr>
          <td
            style={{
              backgroundColor: hex.light,
              fontWeight: "bold",
              textAlign: "center",
              padding: "0.3rem",
            }}
          >
            RECURSO NARRATIVO — {tipoLabel.toUpperCase()}
          </td>
        </tr>
        <tr>
          <td style={{ padding: "0.4rem 0.5rem" }}>
            <p
              style={{
                fontWeight: "bold",
                fontSize: "11pt",
                textAlign: "center",
                marginBottom: "0.3rem",
                color: hex.accent,
              }}
            >
              {recurso.titulo}
            </p>
            <div
              style={{
                fontSize: "10pt",
                lineHeight: "1.5",
                textAlign: "justify",
                whiteSpace: "pre-wrap",
              }}
            >
              {recurso.contenido}
            </div>
            {recurso.fuente && (
              <p
                style={{
                  fontSize: "8pt",
                  color: "#666",
                  textAlign: "right",
                  marginTop: "0.3rem",
                  fontStyle: "italic",
                }}
              >
                Fuente: {recurso.fuente}
              </p>
            )}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/** Resumen de la sesión generado por IA */
function ResumenPremium({
  resumen,
  hex,
}: {
  resumen: string;
  hex: AreaHex;
}) {
  return (
    <table style={{ marginBottom: "0.5rem" }}>
      <tbody>
        <tr>
          <td
            style={{
              backgroundColor: hex.light,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            RESUMEN DE LA SESIÓN
          </td>
        </tr>
        <tr>
          <td style={{ fontSize: "9pt", padding: "0.5rem", lineHeight: "1.6" }}>
            {resumen}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/** Fuentes del Currículo Nacional consultadas — siempre se muestra (con lista vacía si no hay fuentes). */
function FuentesMineduPremium({
  fuentes,
  hex,
}: {
  fuentes: IFuenteMinedu[];
  hex: AreaHex;
}) {
  const list = Array.isArray(fuentes) ? fuentes : [];
  return (
    <table style={{ marginBottom: "0.5rem" }}>
      <tbody>
        <tr>
          <td
            colSpan={3}
            style={{
              backgroundColor: hex.light,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            FUENTES DEL CURRÍCULO NACIONAL CONSULTADAS
          </td>
        </tr>
        <tr>
          <th style={{ width: "40%", backgroundColor: hex.light }}>DOCUMENTO</th>
          <th style={{ width: "10%", backgroundColor: hex.light }}>PÁGINA</th>
          <th style={{ width: "50%", backgroundColor: hex.light }}>REFERENCIA</th>
        </tr>
        {list.length > 0 ? (
          list.map((f, i) => (
            <tr key={i}>
              <td style={{ fontSize: "9pt" }}>
                {f.filename}
                {f.nivel && f.area && (
                  <div style={{ fontSize: "7pt", color: "#64748b" }}>
                    {f.nivel} · {f.area}
                  </div>
                )}
              </td>
              <td style={{ fontSize: "9pt", textAlign: "center" }}>
                {f.pagina ?? "–"}
              </td>
              <td style={{ fontSize: "8pt", fontStyle: "italic", color: "#475569" }}>
                {f.preview || "–"}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={3} style={{ fontSize: "9pt", color: "#64748b", fontStyle: "italic", padding: "0.25rem" }}>
              No se especificaron fuentes.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Componente principal: SesionPremiumDoc
// ═════════════════════════════════════════════════════════════════════════════

interface SesionPremiumDocProps {
  data: ISesionPremiumResponse;
  /** Instrumento de evaluación generado (opcional) */
  instrumento?: IInstrumentoEvaluacion | null;
  /** URL de la insignia del colegio (se muestra en el header del documento) */
  insigniaUrl?: string | null;
}

/**
 * Documento PDF listo para captura con html2pdf.js.
 * Debe envolverse en un div con ref para `generatePDFBlob`.
 *
 * El color de las cabeceras se obtiene automáticamente del área
 * de la sesión mediante getAreaColor().
 */
export function SesionPremiumDoc({ data, instrumento, insigniaUrl }: SesionPremiumDocProps) {
  const { sesion, docente, institucion, seccion, nombreDirectivo } = data;

  // ── Derivar colores del área ────────────────────────────────────
  const areaName = toLabel(sesion.area);
  const areaConfig = getAreaColor(areaName);
  const hex = areaConfig.hex;
  const areaNormalized = areaName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const isTutoria = areaNormalized.includes("tutoria");
  const isPlanLector = areaNormalized.includes("plan lector") || areaNormalized.includes("planlector");

  if (isTutoria) {
    return <SesionTutoriaDoc data={data} insigniaUrl={insigniaUrl} />;
  }

  if (isPlanLector) {
    return <SesionPlanLectorDoc data={data} insigniaUrl={insigniaUrl} />;
  }

  const criteriosPorCompetencia = (() => {
    const transversales =
      (sesion as any)?.competenciasTransversalesSesion ??
      (sesion as any)?.contenido?.competenciasTransversalesSesion ??
      (sesion as any)?.contenido?.contenido?.competenciasTransversalesSesion;
    if (Array.isArray(transversales) && transversales.length > 0) {
      const criteriosTransversales = transversales
        .slice(0, 2)
        .map((ct: any) => {
          const raw = ct?.criteriosEvaluacion ?? ct?.criterios;
          return Array.isArray(raw) ? raw.filter(Boolean) : [];
        });
      if (criteriosTransversales.some((bloque: string[]) => bloque.length > 0)) {
        return criteriosTransversales;
      }
    }

    const propositos = Array.isArray(sesion.propositoAprendizaje)
      ? sesion.propositoAprendizaje
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
      <DocumentStyles thBgColor={hex.light} />

      {/* HEADER */}
      <DocumentHeader
        institucion={institucion}
        titulo={sesion.titulo || "Sesión de Aprendizaje"}
        accentColor={hex.accent}
        insigniaUrl={insigniaUrl}
      />

      {/* DATOS GENERALES */}
      <DatosGeneralesPremium
        area={sesion.area}
        docente={docente}
        director={nombreDirectivo}
        grado={sesion.grado}
        nivel={sesion.nivel}
        duracion={sesion.duracion}
        seccion={seccion}
        fecha={(sesion as any).fechaInicio || (sesion as any).createdAt}
        hex={hex}
      />

      {/* PROPÓSITOS DE APRENDIZAJE */}
      {sesion.propositoAprendizaje?.length > 0 && (
        <PropositosAprendizajePremium
          propositos={sesion.propositoAprendizaje}
          hex={hex}
        />
      )}

      {/* PROPÓSITO DE LA SESIÓN */}
      {sesion.propositoSesion && (
        <PropositoSesionPremium texto={sesion.propositoSesion} hex={hex} />
      )}

      {/* ENFOQUES TRANSVERSALES */}
      {sesion.enfoquesTransversales?.length > 0 && (
        <EnfoquesTransversalesPremium
          enfoques={sesion.enfoquesTransversales}
          hex={hex}
        />
      )}

      {/* ANTES DE LA SESIÓN */}
      {sesion.preparacion && (
        <PreparacionPremium preparacion={sesion.preparacion} hex={hex} />
      )}

      {/* COMPETENCIAS/CAPACIDADES + CRITERIOS (previo a momentos y tiempos) */}
      <CompetenciasCriteriosSesionSection
        sectionColor={hex.light}
        criteriosPorCompetencia={criteriosPorCompetencia}
      />

      {/* MOMENTOS Y TIEMPOS — siempre visible para PDF/Word (Inicio, Desarrollo, Cierre/Desenlace) */}
      <SecuenciaDidacticaPremium
        inicio={sesion.inicio || { tiempo: "", procesos: [] }}
        desarrollo={sesion.desarrollo || { tiempo: "", procesos: [] }}
        cierre={sesion.cierre || { tiempo: "", procesos: [] }}
        hex={hex}
      />

      {/* REFLEXIONES */}
      {sesion.reflexiones && (
        <ReflexionesPremium reflexiones={sesion.reflexiones} hex={hex} />
      )}

      {/* RECURSO NARRATIVO (sesiones complementarias: Tutoría / Plan Lector) */}
      {((sesion as any).recursoNarrativo || (sesion as any).contenido?.recursoNarrativo) && (
        <RecursoNarrativoPremium
          recurso={(sesion as any).recursoNarrativo || (sesion as any).contenido?.recursoNarrativo}
          hex={hex}
        />
      )}

      {/* INSTRUMENTO DE EVALUACIÓN — siempre en el PDF (con o sin datos; celdas vacías si no hay estudiantes) */}
      {instrumento ? (
        <InstrumentoEvaluacionSection instrumento={instrumento} hex={hex} alumnos={getSavedAlumnos()} />
      ) : (
        <table style={{ marginBottom: "0.5rem", width: "100%", fontSize: "9pt", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td
                style={{
                  backgroundColor: hex.light,
                  fontWeight: "bold",
                  textAlign: "center",
                  padding: "0.35rem",
                }}
              >
                INSTRUMENTO DE EVALUACIÓN — Lista de cotejo
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: "0.35rem",
                  fontStyle: "italic",
                  color: "#64748b",
                  border: "1px solid #e2e8f0",
                }}
              >
                No se especificó instrumento de evaluación. Completa los propósitos de aprendizaje con criterios e instrumento.
              </td>
            </tr>
          </tbody>
        </table>
      )}

      {/* RESUMEN DE LA SESIÓN */}
      {sesion.resumen && (
        <ResumenPremium resumen={sesion.resumen} hex={hex} />
      )}

      {/* FUENTES MINEDU — deshabilitado, no se renderiza en el PDF */}

      {/* Firmas — Docente y Directivo */}
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

      {/* Footer — con color del área */}
      <HtmldocsFooter position="bottom-center">
        {() => (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              fontSize: "9pt",
              borderTop: `1px solid ${hex.accent}`,
              paddingTop: "0.2rem",
              color: hex.accent,
            }}
          >
            <span>Sesión de Aprendizaje - {areaName || "Premium"}</span>
          </div>
        )}
      </HtmldocsFooter>
    </HtmldocsDocument>
  );
}

export default SesionPremiumDoc;
