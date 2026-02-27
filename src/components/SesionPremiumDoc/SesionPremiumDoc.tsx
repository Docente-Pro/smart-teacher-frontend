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

import { Document, Footer } from "@htmldocs/react";
import { DocumentStyles } from "@/components/DocTest";
import { DocumentHeader } from "@/components/DocTest/DocumentHeader";
import { getAreaColor, type AreaColorConfig } from "@/constants/areaColors";
import { InstrumentoEvaluacionSection } from "./InstrumentoEvaluacionSection";
import { getSavedAlumnos } from "@/utils/alumnosStorage";
import { GraficoRenderer } from "@/features/graficos-educativos/presentation/components/GraficoRenderer";
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

// ═════════════════════════════════════════════════════════════════════════════
// Helpers
// ═════════════════════════════════════════════════════════════════════════════

/** Hex colors for inline PDF styles (subset of AreaColorConfig) */
type AreaHex = AreaColorConfig["hex"];

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
  grado,
  nivel,
  duracion,
  hex,
}: {
  area?: unknown;
  docente: string;
  grado?: unknown;
  nivel?: unknown;
  duracion?: number;
  hex: AreaHex;
}) {
  return (
    <>
      <table style={{ marginBottom: "0.5rem" }}>
        <tbody>
          <tr>
            <td style={{ width: "15%", fontWeight: "bold" }}>Área:</td>
            <td style={{ width: "85%" }}>{toLabel(area)}</td>
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
            <td style={{ width: "15%", fontWeight: "bold" }}>Docente:</td>
            <td colSpan={3}>{docente}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold" }}>Nivel:</td>
            <td style={{ width: "35%" }}>{toLabel(nivel)}</td>
            <td style={{ width: "10%", fontWeight: "bold" }}>Grado:</td>
            <td style={{ width: "40%" }}>{toLabel(grado)}</td>
          </tr>
          {duracion && (
            <tr>
              <td style={{ fontWeight: "bold" }}>Duración:</td>
              <td colSpan={3}>{duracion} minutos</td>
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
          <th style={{ width: "25%", backgroundColor: hex.light }}>
            COMPETENCIAS Y CAPACIDADES
          </th>
          <th style={{ width: "25%", backgroundColor: hex.light }}>
            CRITERIOS DE EVALUACIÓN
          </th>
          <th style={{ width: "25%", backgroundColor: hex.light }}>
            PRODUCTO O EVIDENCIA
          </th>
          <th style={{ width: "25%", backgroundColor: hex.light }}>
            INSTRUMENTO DE EVALUACIÓN
          </th>
        </tr>
        {propositos.map((p, i) => (
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
              {p.estandar && (
                <p
                  style={{
                    fontSize: "8pt",
                    color: "#475569",
                    marginTop: "0.3rem",
                    fontStyle: "italic",
                  }}
                >
                  Estándar: {p.estandar}
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

  // Soporta "recursos" (v2) y "recursosDidacticos" (v1)
  const recursosRaw = proceso.recursos ?? proceso.recursosDidacticos;
  const recursosTexto =
    Array.isArray(recursosRaw)
      ? recursosRaw.join(", ")
      : recursosRaw || "";

  // Normalizar imágenes: soporta imagen singular (v2), imagenes array (v1)
  // e imagenContenido (contenido didáctico: tabla, gráfico, mapa, etc.)
  const baseImagenes = proceso.imagenes ?? (proceso.imagen ? [proceso.imagen] : []);
  const imagenes = proceso.imagenContenido?.url
    ? [...baseImagenes, { ...proceso.imagenContenido, posicion: proceso.imagenContenido.posicion || "debajo" }]
    : baseImagenes;
  const imgAntes = imagenes.filter((img) => img.posicion === "antes");
  const imgJunto = imagenes.filter((img) => img.posicion === "junto");
  const imgDespues = imagenes.filter((img) => img.posicion === "despues" || img.posicion === "debajo" || (!img.posicion && img.posicion !== "antes" && img.posicion !== "junto"));

  return (
    <tr key={idx}>
      <td style={{ fontSize: "9pt", padding: "0.8rem", lineHeight: "1.6" }}>
        {/* Título del proceso */}
        {proceso.proceso && (
          <div
            style={{
              fontSize: "10pt",
              fontWeight: "bold",
              marginBottom: "0.8rem",
              color: "#1e293b",
            }}
          >
            {proceso.proceso}
          </div>
        )}

        {/* Imágenes con posicion "antes" */}
        {imgAntes.length > 0 && (
          <div style={{ marginBottom: "0.6rem", textAlign: "center" }}>
            {imgAntes.map((img, imgIdx) => (
              <div key={(img as any).id ?? imgIdx} style={{ display: "inline-block", margin: "0 0.5rem" }}>
                <img
                  src={img.url}
                  alt={img.descripcion || ""}
                  style={{ maxWidth: "350px", maxHeight: "300px" }}
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

        {/* Estrategias — con o sin imágenes "junto" */}
        {estrategiasTexto && imgJunto.length > 0 ? (
          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", marginBottom: "0.8rem" }}>
            <div style={{ flex: 1, whiteSpace: "pre-wrap" }}>
              <strong>Estrategias:</strong>{" "}
              {Array.isArray(proceso.estrategias) && proceso.estrategias.length > 1 ? (
                <ul style={{ marginLeft: "1rem", marginTop: "0.3rem", lineHeight: 1.6 }}>
                  {proceso.estrategias.map((e, i) => (
                    <li key={i} style={{ marginBottom: "0.2rem" }}>{e}</li>
                  ))}
                </ul>
              ) : (
                <span>{estrategiasTexto}</span>
              )}
            </div>
            <div style={{ flexShrink: 0, maxWidth: "40%", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {imgJunto.map((img, imgIdx) => (
                <div key={(img as any).id ?? imgIdx} style={{ textAlign: "center" }}>
                  <img
                    src={img.url}
                    alt={img.descripcion || ""}
                    style={{ maxWidth: "350px", maxHeight: "300px" }}
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
            <strong>Estrategias:</strong>{" "}
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
                    {e}
                  </li>
                ))}
              </ul>
            ) : (
              <span>{estrategiasTexto}</span>
            )}
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
                  style={{ maxWidth: "350px", maxHeight: "300px" }}
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

        {/* Gráfico educativo (Math o Área) */}
        {proceso.grafico && (
          <div style={{
            marginTop: "0.8rem",
            marginBottom: "0.8rem",
            padding: "0.8rem",
            backgroundColor: "#fafafa",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}>
            <GraficoRenderer grafico={proceso.grafico as any} />
          </div>
        )}

        {/* Gráfico de operación */}
        {(proceso as any).graficoOperacion && (
          <div style={{
            marginTop: "0.8rem",
            marginBottom: "0.8rem",
            backgroundColor: "#faf5ff",
            padding: "1rem",
            borderRadius: "8px",
            border: "2px solid #d8b4fe",
            overflowX: "auto",
          }}>
            <p style={{ fontSize: "9pt", fontWeight: "bold", color: "#7c3aed", marginBottom: "0.5rem", margin: 0 }}>
              🔢 Operación / Recurso:
            </p>
            <div style={{ display: "flex", justifyContent: "center", marginTop: "0.5rem" }}>
              <GraficoRenderer grafico={(proceso as any).graficoOperacion} />
            </div>
          </div>
        )}

        {/* Recursos didácticos y tiempo */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            fontSize: "8pt",
            color: "#64748b",
          }}
        >
          {recursosTexto && (
            <div>
              <strong>Recursos:</strong> {recursosTexto}
            </div>
          )}
          {proceso.tiempo && (
            <div>
              <strong>Tiempo:</strong> {proceso.tiempo}
            </div>
          )}
        </div>
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

        {/* CIERRE */}
        <tr>
          <td
            colSpan={2}
            style={{ backgroundColor: hex.light, fontWeight: "bold" }}
          >
            CIERRE - Tiempo aproximado: {cierre.tiempo || "15 minutos"}
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

/** Fuentes del Currículo Nacional consultadas */
function FuentesMineduPremium({
  fuentes,
  hex,
}: {
  fuentes: IFuenteMinedu[];
  hex: AreaHex;
}) {
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
        {fuentes.map((f, i) => (
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
        ))}
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
}

/**
 * Documento PDF listo para captura con html2pdf.js.
 * Debe envolverse en un div con ref para `generatePDFBlob`.
 *
 * El color de las cabeceras se obtiene automáticamente del área
 * de la sesión mediante getAreaColor().
 */
export function SesionPremiumDoc({ data, instrumento }: SesionPremiumDocProps) {
  const { sesion, docente, institucion } = data;

  // ── Derivar colores del área ────────────────────────────────────
  const areaName = toLabel(sesion.area);
  const areaConfig = getAreaColor(areaName);
  const hex = areaConfig.hex;

  return (
    <Document size="A4" orientation="portrait" margin="0.5in">
      <DocumentStyles thBgColor={hex.light} />

      {/* HEADER — con subtítulo de área coloreado */}
      <DocumentHeader
        institucion={institucion}
        titulo={sesion.titulo || "Sesión de Aprendizaje"}
        areaSubtitle={`Sesión de Aprendizaje - Área de ${areaName}`}
        accentColor={hex.accent}
      />

      {/* DATOS GENERALES */}
      <DatosGeneralesPremium
        area={sesion.area}
        docente={docente}
        grado={sesion.grado}
        nivel={sesion.nivel}
        duracion={sesion.duracion}
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

      {/* MOMENTOS Y TIEMPOS */}
      {(sesion.inicio || sesion.desarrollo || sesion.cierre) && (
        <SecuenciaDidacticaPremium
          inicio={sesion.inicio || { tiempo: "", procesos: [] }}
          desarrollo={sesion.desarrollo || { tiempo: "", procesos: [] }}
          cierre={sesion.cierre || { tiempo: "", procesos: [] }}
          hex={hex}
        />
      )}

      {/* REFLEXIONES */}
      {sesion.reflexiones && (
        <ReflexionesPremium reflexiones={sesion.reflexiones} hex={hex} />
      )}

      {/* INSTRUMENTO DE EVALUACIÓN */}
      {instrumento && (
        <InstrumentoEvaluacionSection instrumento={instrumento} hex={hex} alumnos={getSavedAlumnos()} />
      )}

      {/* RESUMEN DE LA SESIÓN */}
      {sesion.resumen && (
        <ResumenPremium resumen={sesion.resumen} hex={hex} />
      )}

      {/* FUENTES MINEDU */}
      {sesion.fuentesMinedu && sesion.fuentesMinedu.length > 0 && (
        <FuentesMineduPremium fuentes={sesion.fuentesMinedu} hex={hex} />
      )}

      {/* Footer — con color del área */}
      <Footer position="bottom-center">
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
      </Footer>
    </Document>
  );
}

export default SesionPremiumDoc;
