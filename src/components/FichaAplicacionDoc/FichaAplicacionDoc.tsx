/**
 * FichaAplicacionDoc.tsx
 *
 * Documento PDF para Fichas de Aplicación estilo MINEDU.
 * Renderiza los 10 tipos de bloque definidos en el contrato.
 * Usa @htmldocs/react (Document + Footer) con inline styles para captura pdf.
 *
 * Los colores se derivan del área curricular (mismo sistema que SesionPremiumDoc).
 */

import { Document, Footer } from "@htmldocs/react";
import { DocumentStyles } from "@/components/DocTest";
import { getAreaColor, type AreaColorConfig } from "@/constants/areaColors";
import type {
  IFichaAplicacionData,
  ISeccionFicha,
  ISeccionTexto,
  ISeccionProblema,
  ISeccionPreguntas,
  ISeccionTabla,
  ISeccionCompletar,
  ISeccionUnir,
  ISeccionOrdenar,
  ISeccionVerdaderoFalso,
  ISeccionSeleccionMultiple,
  ISeccionEspacioDibujo,
  ISolucionarioItem,
} from "@/interfaces/IFichaAplicacion";
import { GraficoRenderer } from "@/features/graficos-educativos/presentation/components/GraficoRenderer";

// ═════════════════════════════════════════════════════════════════════════════
// Types
// ═════════════════════════════════════════════════════════════════════════════

type Hex = AreaColorConfig["hex"];

// ═════════════════════════════════════════════════════════════════════════════
// Header del documento
// ═════════════════════════════════════════════════════════════════════════════

function FichaHeader({
  ficha,
  institucion,
  docente,
  hex,
  insigniaUrl,
}: {
  ficha: IFichaAplicacionData;
  institucion: string;
  docente: string;
  hex: Hex;
  insigniaUrl?: string | null;
}) {
  return (
    <>
      {/* Barra superior de color */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: hex.light,
          borderBottom: `3px solid ${hex.accent}`,
          color: "#1a1a1a",
          padding: "0.6rem 0.8rem",
          marginBottom: "0.4rem",
          gap: "0.6rem",
        }}
      >
        {insigniaUrl && (
          <img
            src={insigniaUrl}
            alt="Insignia"
            crossOrigin="anonymous"
            style={{ width: "100px", height: "100px", objectFit: "contain", flexShrink: 0 }}
          />
        )}
        <div style={{ flex: 1, textAlign: "center" }}>
          <p
            style={{
              fontSize: "9pt",
              marginBottom: "0.15rem",
              color: "#444",
            }}
          >
            {institucion}
          </p>
          <h1
            style={{
              fontSize: "15pt",
              fontWeight: 800,
              margin: 0,
              lineHeight: 1.3,
              color: hex.accent,
              letterSpacing: "0.3px",
            }}
          >
            {ficha.titulo}
          </h1>
        </div>
        {insigniaUrl && <div style={{ width: "100px", flexShrink: 0 }} />}
      </div>

      {/* Datos curriculares */}
      <table style={{ marginBottom: "0.5rem", width: "100%" }}>
        <tbody>
          <tr>
            <td
              style={{
                backgroundColor: hex.light,
                fontWeight: "bold",
                fontSize: "9pt",
                width: "18%",
                padding: "0.25rem 0.4rem",
              }}
            >
              Área
            </td>
            <td style={{ fontSize: "9pt", padding: "0.25rem 0.4rem" }}>
              {ficha.area}
            </td>
            <td
              style={{
                backgroundColor: hex.light,
                fontWeight: "bold",
                fontSize: "9pt",
                width: "18%",
                padding: "0.25rem 0.4rem",
              }}
            >
              Grado / Nivel
            </td>
            <td style={{ fontSize: "9pt", padding: "0.25rem 0.4rem" }}>
              {ficha.grado} — {ficha.nivel}
            </td>
          </tr>
          {ficha.competencia && (
            <tr>
              <td
                style={{
                  backgroundColor: hex.light,
                  fontWeight: "bold",
                  fontSize: "9pt",
                  padding: "0.25rem 0.4rem",
                }}
              >
                Competencia
              </td>
              <td
                colSpan={3}
                style={{ fontSize: "9pt", padding: "0.25rem 0.4rem" }}
              >
                {ficha.competencia}
              </td>
            </tr>
          )}
          {ficha.desempeno && (
            <tr>
              <td
                style={{
                  backgroundColor: hex.light,
                  fontWeight: "bold",
                  fontSize: "9pt",
                  padding: "0.25rem 0.4rem",
                }}
              >
                Desempeño
              </td>
              <td
                colSpan={3}
                style={{ fontSize: "9pt", padding: "0.25rem 0.4rem" }}
              >
                {ficha.desempeno}
              </td>
            </tr>
          )}
          <tr>
            <td
              style={{
                backgroundColor: hex.light,
                fontWeight: "bold",
                fontSize: "9pt",
                padding: "0.25rem 0.4rem",
              }}
            >
              Docente
            </td>
            <td
              colSpan={3}
              style={{ fontSize: "9pt", padding: "0.25rem 0.4rem" }}
            >
              {docente}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Datos del estudiante */}
      <table style={{ marginBottom: "0.5rem", width: "100%" }}>
        <tbody>
          <tr>
            <td
              style={{
                backgroundColor: hex.light,
                fontWeight: "bold",
                fontSize: "9pt",
                width: "18%",
                padding: "0.25rem 0.4rem",
              }}
            >
              Nombre
            </td>
            <td
              style={{
                fontSize: "9pt",
                padding: "0.25rem 0.4rem",
                borderBottom: "1px dotted #999",
                width: "52%",
              }}
            >
              &nbsp;
            </td>
            <td
              style={{
                backgroundColor: hex.light,
                fontWeight: "bold",
                fontSize: "9pt",
                width: "10%",
                padding: "0.25rem 0.4rem",
              }}
            >
              Fecha
            </td>
            <td
              style={{
                fontSize: "9pt",
                padding: "0.25rem 0.4rem",
                borderBottom: "1px dotted #999",
                width: "20%",
              }}
            >
              &nbsp;
            </td>
          </tr>
        </tbody>
      </table>

      {/* Instrucción general */}
      {ficha.instruccionGeneral && (
        <div
          style={{
            backgroundColor: hex.light,
            border: `1.5px solid ${hex.accent}`,
            borderRadius: "4px",
            padding: "0.4rem 0.6rem",
            marginBottom: "0.6rem",
            fontSize: "10pt",
            lineHeight: 1.4,
          }}
        >
          <span style={{ fontWeight: "bold" }}>📋 Indicaciones: </span>
          {ficha.instruccionGeneral}
        </div>
      )}
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Sección: titulo con barra coloreada (reutilizable)
// ═════════════════════════════════════════════════════════════════════════════

function SectionTitle({ title, hex, numero }: { title: string; hex: Hex; numero?: number }) {
  return (
    <div
      style={{
        backgroundColor: hex.medium,
        color: "#000",
        fontWeight: "bold",
        fontSize: "10pt",
        padding: "0.3rem 0.5rem",
        marginTop: "0.5rem",
        marginBottom: "0.3rem",
        borderLeft: `4px solid ${hex.accent}`,
      }}
    >
      {numero != null ? `${numero}. ` : ""}
      {title}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// BLOQUE 1: Texto (lectura)
// ═════════════════════════════════════════════════════════════════════════════

function BloqueTexto({ seccion, hex }: { seccion: ISeccionTexto; hex: Hex }) {
  const { contenido } = seccion;
  return (
    <div style={{ marginBottom: "0.5rem" }}>
      <SectionTitle title={seccion.titulo} hex={hex} />
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "0.6rem 0.7rem",
          backgroundColor: "#fafafa",
          fontSize: "10pt",
          lineHeight: 1.6,
          textAlign: "justify",
          whiteSpace: "pre-wrap",
        }}
      >
        {contenido.texto}
      </div>
      {contenido.fuente && (
        <p
          style={{
            fontSize: "8pt",
            color: "#666",
            textAlign: "right",
            marginTop: "0.15rem",
            fontStyle: "italic",
          }}
        >
          {contenido.fuente}
        </p>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// BLOQUE 2: Problema contextualizado
// ═════════════════════════════════════════════════════════════════════════════

function BloqueProblema({
  seccion,
  hex,
  numero,
}: {
  seccion: ISeccionProblema;
  hex: Hex;
  numero: number;
}) {
  const { contenido } = seccion;
  return (
    <div style={{ marginBottom: "0.5rem" }}>
      <SectionTitle title={seccion.titulo} hex={hex} numero={numero} />

      {/* Enunciado */}
      <div
        style={{
          fontSize: "10pt",
          lineHeight: 1.5,
          padding: "0.3rem 0.5rem",
          textAlign: "justify",
        }}
      >
        {contenido.enunciado}
      </div>

      {/* Datos del problema */}
      {contenido.datos && contenido.datos.length > 0 && (
        <div
          style={{
            backgroundColor: hex.light,
            borderRadius: "3px",
            padding: "0.3rem 0.5rem",
            marginBottom: "0.3rem",
            fontSize: "9pt",
          }}
        >
          <span style={{ fontWeight: "bold" }}>Datos: </span>
          {contenido.datos.join(" | ")}
        </div>
      )}

      {/* Pregunta principal */}
      {contenido.pregunta && (
        <p
          style={{
            fontWeight: "bold",
            fontSize: "10pt",
            padding: "0.2rem 0.5rem",
            color: hex.accent,
          }}
        >
          {contenido.pregunta}
        </p>
      )}

      {/* Gráfico descriptivo (ilustración/diagrama) */}
      {contenido.grafico && (
        <div
          style={{
            border: `1.5px solid ${hex.medium}`,
            borderRadius: "6px",
            padding: "0.5rem 0.6rem",
            margin: "0.4rem 0.5rem",
            backgroundColor: hex.light,
          }}
        >
          <GraficoRenderer grafico={contenido.grafico as any} />
        </div>
      )}

      {/* Espacio para resolución */}
      {contenido.espacioResolucion && (
        <div
          style={{
            border: "1.5px dashed #aaa",
            borderRadius: "4px",
            minHeight: "140px",
            padding: "0.4rem 0.5rem",
            margin: "0.4rem 0.5rem",
          }}
        >
          <p
            style={{
              fontSize: "8pt",
              color: "#999",
              fontStyle: "italic",
            }}
          >
            Espacio para tu resolución:
          </p>
        </div>
      )}

      {/* Línea de respuesta (solo si no hay cuadro de resolución) */}
      {!contenido.espacioResolucion && (
        <div style={{ padding: "0.2rem 0.5rem", fontSize: "10pt" }}>
          <span style={{ fontWeight: "bold" }}>Respuesta: </span>
          <span
            style={{
              display: "inline-block",
              width: "200px",
              borderBottom: "1.5px solid #333",
            }}
          >
            &nbsp;
          </span>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// BLOQUE 3: Preguntas de comprensión / reflexión
// ═════════════════════════════════════════════════════════════════════════════
// El texto de `pregunta` suele traer ya la numeración ("1. ..."); no duplicar índice.
// `nivel` (literal / inferencial / crítico) no se muestra en el PDF para no saturar la ficha.

function BloquePreguntas({
  seccion,
  hex,
}: {
  seccion: ISeccionPreguntas;
  hex: Hex;
}) {
  return (
    <div style={{ marginBottom: "0.5rem" }}>
      <SectionTitle title={seccion.titulo} hex={hex} />
      {seccion.contenido.preguntas.map((p, i) => {
        const lineas = p.lineasRespuesta ?? 2;
        return (
          <div key={i} style={{ padding: "0.3rem 0.5rem" }}>
            <p style={{ fontSize: "10pt", lineHeight: 1.4, margin: 0 }}>
              {p.pregunta}
            </p>
            {/* Líneas punteadas para respuesta */}
            {Array.from({ length: lineas }).map((_, li) => (
              <div
                key={li}
                style={{
                  borderBottom: "1px dotted #aaa",
                  height: "22px",
                  marginTop: "2px",
                }}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// BLOQUE 4: Tabla de datos / observación / registro
// ═════════════════════════════════════════════════════════════════════════════

function BloqueTabla({ seccion, hex }: { seccion: ISeccionTabla; hex: Hex }) {
  const { contenido } = seccion;
  const filasMuestra = contenido.filas ?? [];
  // Si es editable y no tiene filas, agregar filas vacías
  const filasRender =
    filasMuestra.length > 0
      ? filasMuestra
      : contenido.esEditable
        ? Array.from({ length: 5 }, () =>
            Array.from({ length: contenido.columnas.length }, () => ""),
          )
        : [];

  return (
    <div style={{ marginBottom: "0.5rem" }}>
      <SectionTitle title={seccion.titulo} hex={hex} />
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {contenido.columnas.map((col, i) => (
              <th
                key={i}
                style={{
                  backgroundColor: hex.light,
                  border: "1px solid #333",
                  padding: "0.3rem 0.4rem",
                  fontSize: "9pt",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filasRender.map((fila, ri) => (
            <tr key={ri}>
              {fila.map((celda, ci) => (
                <td
                  key={ci}
                  style={{
                    border: "1px solid #333",
                    padding: "0.3rem 0.4rem",
                    fontSize: "9pt",
                    minHeight: "24px",
                  }}
                >
                  {celda || "\u00A0"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// BLOQUE 5: Completar espacios en blanco
// ═════════════════════════════════════════════════════════════════════════════

function BloqueCompletar({
  seccion,
  hex,
}: {
  seccion: ISeccionCompletar;
  hex: Hex;
}) {
  const { contenido } = seccion;

  // Reemplazar ___ con recuadros vacíos visualmente
  function renderOracion(texto: string, idx: number) {
    const parts = texto.split(/(_+)/);
    return (
      <div
        key={idx}
        style={{
          fontSize: "10pt",
          lineHeight: 1.6,
          padding: "0.2rem 0.5rem",
        }}
      >
        <span style={{ fontWeight: "bold", marginRight: "0.3rem" }}>
          {idx + 1}.
        </span>
        {parts.map((part, pi) =>
          part.match(/^_+$/) ? (
            <span
              key={pi}
              style={{
                display: "inline-block",
                width: "120px",
                borderBottom: "2px solid #333",
                marginLeft: "2px",
                marginRight: "2px",
              }}
            >
              &nbsp;
            </span>
          ) : (
            <span key={pi}>{part}</span>
          ),
        )}
      </div>
    );
  }

  return (
    <div style={{ marginBottom: "0.5rem" }}>
      <SectionTitle title={seccion.titulo} hex={hex} />
      {contenido.oraciones.map((o, i) => renderOracion(o, i))}

      {/* Banco de respuestas */}
      {contenido.bancoRespuestas && contenido.bancoRespuestas.length > 0 && (
        <div
          style={{
            border: `1.5px dashed ${hex.accent}`,
            borderRadius: "6px",
            padding: "0.4rem 0.6rem",
            marginTop: "0.4rem",
            backgroundColor: hex.light,
          }}
        >
          <p
            style={{
              fontSize: "8pt",
              fontWeight: "bold",
              marginBottom: "0.2rem",
              color: hex.accent,
            }}
          >
            Banco de palabras:
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {contenido.bancoRespuestas.map((r, i) => (
              <span
                key={i}
                style={{
                  backgroundColor: "#fff",
                  border: `1px solid ${hex.accent}`,
                  borderRadius: "4px",
                  padding: "0.15rem 0.5rem",
                  fontSize: "9pt",
                  fontWeight: "bold",
                }}
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// BLOQUE 6: Unir / Relacionar columnas
// ═════════════════════════════════════════════════════════════════════════════

function BloqueUnir({ seccion, hex }: { seccion: ISeccionUnir; hex: Hex }) {
  const { contenido } = seccion;
  const maxRows = Math.max(contenido.columnaA.length, contenido.columnaB.length);

  return (
    <div style={{ marginBottom: "0.5rem" }}>
      <SectionTitle title={seccion.titulo} hex={hex} />
      <table style={{ width: "80%", margin: "0 auto", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th
              style={{
                backgroundColor: hex.light,
                border: "1px solid #333",
                padding: "0.3rem",
                fontSize: "9pt",
                width: "40%",
                textAlign: "center",
              }}
            >
              Columna A
            </th>
            <th
              style={{
                border: "1px solid #333",
                padding: "0.3rem",
                fontSize: "9pt",
                width: "20%",
                textAlign: "center",
                backgroundColor: "#f9f9f9",
              }}
            >
              &nbsp;
            </th>
            <th
              style={{
                backgroundColor: hex.light,
                border: "1px solid #333",
                padding: "0.3rem",
                fontSize: "9pt",
                width: "40%",
                textAlign: "center",
              }}
            >
              Columna B
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: maxRows }).map((_, i) => (
            <tr key={i}>
              <td
                style={{
                  border: "1px solid #333",
                  padding: "0.35rem 0.5rem",
                  fontSize: "10pt",
                }}
              >
                {contenido.columnaA[i] ?? ""}
              </td>
              <td
                style={{
                  border: "1px solid #333",
                  textAlign: "center",
                  fontSize: "14pt",
                  color: "#aaa",
                }}
              >
                ●
              </td>
              <td
                style={{
                  border: "1px solid #333",
                  padding: "0.35rem 0.5rem",
                  fontSize: "10pt",
                }}
              >
                {contenido.columnaB[i] ?? ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// BLOQUE 7: Ordenar secuencia
// ═════════════════════════════════════════════════════════════════════════════

function BloqueOrdenar({
  seccion,
  hex,
}: {
  seccion: ISeccionOrdenar;
  hex: Hex;
}) {
  const getTextoOrdenar = (elemento: ISeccionOrdenar["contenido"]["elementos"][number]): string => {
    if (typeof elemento === "string") return elemento.trim();
    return (elemento?.texto ?? "").trim();
  };

  return (
    <div style={{ marginBottom: "0.5rem" }}>
      <SectionTitle title={seccion.titulo} hex={hex} />
      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", padding: "0.3rem 0.5rem" }}>
        {seccion.contenido.elementos.map((el, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "0.35rem 0.5rem",
              backgroundColor: i % 2 === 0 ? "#fafafa" : "#fff",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "24px",
                height: "24px",
                border: `1.5px solid ${hex.accent}`,
                borderRadius: "50%",
                fontSize: "9pt",
                fontWeight: "bold",
                color: hex.accent,
                flexShrink: 0,
              }}
            >
              &nbsp;
            </span>
            <span style={{ fontSize: "10pt" }}>{getTextoOrdenar(el) || "\u00A0"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// BLOQUE 8: Verdadero / Falso
// ═════════════════════════════════════════════════════════════════════════════

const vfRadioCell: React.CSSProperties = {
  border: "1px solid #333",
  textAlign: "center",
  verticalAlign: "middle",
  padding: "0.35rem 0.25rem",
  width: "2.25rem",
};

function vfRadioCircle(hex: Hex): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "14px",
    height: "14px",
    border: `1.5px solid ${hex.accent}`,
    borderRadius: "50%",
    margin: "0 auto",
    boxSizing: "border-box",
  };
}

function textoAfirmacionVF(a: { texto?: string; afirmacion?: string }): string {
  return (a.texto ?? a.afirmacion ?? "").trim();
}

function BloqueVerdaderoFalso({
  seccion,
  hex,
}: {
  seccion: ISeccionVerdaderoFalso;
  hex: Hex;
}) {
  const thBase: React.CSSProperties = {
    backgroundColor: hex.light,
    border: "1px solid #333",
    fontSize: "9pt",
    fontWeight: "bold",
    padding: "0.3rem 0.4rem",
    textAlign: "center",
  };

  return (
    <div style={{ marginBottom: "0.5rem" }}>
      <SectionTitle title={seccion.titulo} hex={hex} />
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          tableLayout: "fixed",
        }}
      >
        <colgroup>
          <col style={{ width: "2rem" }} />
          <col />
          <col style={{ width: "2.25rem" }} />
          <col style={{ width: "2.25rem" }} />
        </colgroup>
        <thead>
          <tr>
            <th style={{ ...thBase, width: "2rem" }}>N°</th>
            <th style={{ ...thBase, textAlign: "left" }}>Afirmación</th>
            <th style={{ ...thBase, ...vfRadioCell, fontWeight: "bold" }}>V</th>
            <th style={{ ...thBase, ...vfRadioCell, fontWeight: "bold" }}>F</th>
          </tr>
        </thead>
        <tbody>
          {seccion.contenido.afirmaciones.map((a, i) => (
            <tr key={i}>
              <td
                style={{
                  border: "1px solid #333",
                  textAlign: "center",
                  fontSize: "9pt",
                  fontWeight: "bold",
                  padding: "0.3rem 0.25rem",
                  verticalAlign: "middle",
                }}
              >
                {i + 1}
              </td>
              <td
                style={{
                  border: "1px solid #333",
                  fontSize: "10pt",
                  padding: "0.35rem 0.45rem",
                  verticalAlign: "middle",
                  lineHeight: 1.35,
                  wordBreak: "break-word",
                }}
              >
                {textoAfirmacionVF(a)}
              </td>
              <td style={vfRadioCell}>
                <span style={vfRadioCircle(hex)} aria-hidden />
              </td>
              <td style={vfRadioCell}>
                <span style={vfRadioCircle(hex)} aria-hidden />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// BLOQUE 9: Selección múltiple
// ═════════════════════════════════════════════════════════════════════════════

function BloqueSeleccionMultiple({
  seccion,
  hex,
}: {
  seccion: ISeccionSeleccionMultiple;
  hex: Hex;
}) {
  const letras = ["a", "b", "c", "d", "e", "f"];
  return (
    <div style={{ marginBottom: "0.5rem" }}>
      <SectionTitle title={seccion.titulo} hex={hex} />
      {seccion.contenido.preguntas.map((p, qi) => (
        <div key={qi} style={{ padding: "0.3rem 0.5rem" }}>
          <p style={{ fontSize: "10pt", fontWeight: "bold", marginBottom: "0.2rem" }}>
            {qi + 1}. {p.pregunta}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem", paddingLeft: "1.2rem" }}>
            {p.opciones.map((op, oi) => (
              <div key={oi} style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "10pt" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "16px",
                    height: "16px",
                    border: "1.5px solid #555",
                    borderRadius: "50%",
                    fontSize: "8pt",
                    flexShrink: 0,
                  }}
                >
                  {letras[oi] ?? String(oi)}
                </span>
                <span>{op}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// BLOQUE 10: Espacio para dibujar
// ═════════════════════════════════════════════════════════════════════════════

const ALTO_DIBUJO: Record<string, string> = {
  "pequeño": "100px",
  mediano: "200px",
  grande: "300px",
};

function BloqueEspacioDibujo({
  seccion,
  hex,
}: {
  seccion: ISeccionEspacioDibujo;
  hex: Hex;
}) {
  const alto = ALTO_DIBUJO[seccion.contenido.alto ?? "mediano"] ?? "200px";
  return (
    <div style={{ marginBottom: "0.5rem" }}>
      <SectionTitle title={seccion.titulo} hex={hex} />
      <p style={{ fontSize: "10pt", padding: "0.2rem 0.5rem", fontStyle: "italic" }}>
        {seccion.contenido.instruccion}
      </p>
      <div
        style={{
          border: `1.5px solid ${hex.accent}`,
          borderRadius: "4px",
          minHeight: alto,
          margin: "0.3rem 0.5rem",
          backgroundColor: "#fdfdfd",
        }}
      />
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Router de secciones
// ═════════════════════════════════════════════════════════════════════════════

let _problemaCounter = 0;

function SeccionRenderer({ seccion, hex }: { seccion: ISeccionFicha; hex: Hex }) {
  switch (seccion.tipo) {
    case "texto":
      return <BloqueTexto seccion={seccion as ISeccionTexto} hex={hex} />;
    case "problema":
      _problemaCounter += 1;
      return (
        <BloqueProblema
          seccion={seccion as ISeccionProblema}
          hex={hex}
          numero={_problemaCounter}
        />
      );
    case "preguntas":
      return <BloquePreguntas seccion={seccion as ISeccionPreguntas} hex={hex} />;
    case "tabla":
      return <BloqueTabla seccion={seccion as ISeccionTabla} hex={hex} />;
    case "completar":
      return <BloqueCompletar seccion={seccion as ISeccionCompletar} hex={hex} />;
    case "unir":
      return <BloqueUnir seccion={seccion as ISeccionUnir} hex={hex} />;
    case "ordenar":
      return <BloqueOrdenar seccion={seccion as ISeccionOrdenar} hex={hex} />;
    case "verdadero_falso":
      return <BloqueVerdaderoFalso seccion={seccion as ISeccionVerdaderoFalso} hex={hex} />;
    case "seleccion_multiple":
      return <BloqueSeleccionMultiple seccion={seccion as ISeccionSeleccionMultiple} hex={hex} />;
    case "espacio_dibujo":
      return <BloqueEspacioDibujo seccion={seccion as ISeccionEspacioDibujo} hex={hex} />;
    default:
      return null;
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// Solucionario (para el docente)
// ═════════════════════════════════════════════════════════════════════════════

interface GraficoSolucion {
  numero: number;
  titulo: string;
  grafico: Record<string, unknown>;
}

function Solucionario({
  items,
  hex,
  graficos,
}: {
  items: ISolucionarioItem[];
  hex: Hex;
  graficos: GraficoSolucion[];
}) {
  if (!items.length && !graficos.length) return null;
  return (
    <div style={{ marginTop: "0.5rem" }}>
      <div
        style={{
          backgroundColor: hex.light,
          borderBottom: `3px solid ${hex.accent}`,
          color: hex.accent,
          fontWeight: 800,
          fontSize: "11pt",
          padding: "0.45rem 0.5rem",
          textAlign: "center",
          marginBottom: "0.3rem",
          letterSpacing: "1px",
        }}
      >
        SOLUCIONARIO — SOLO PARA EL DOCENTE
      </div>

      {/* Tabla de respuestas */}
      {items.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "0.5rem" }}>
          <thead>
            <tr>
              <th
                style={{
                  backgroundColor: hex.light,
                  border: "1px solid #333",
                  fontSize: "9pt",
                  padding: "0.25rem",
                  width: "8%",
                  textAlign: "center",
                }}
              >
                N°
              </th>
              <th
                style={{
                  backgroundColor: hex.light,
                  border: "1px solid #333",
                  fontSize: "9pt",
                  padding: "0.25rem 0.4rem",
                }}
              >
                Respuesta
              </th>
              <th
                style={{
                  backgroundColor: hex.light,
                  border: "1px solid #333",
                  fontSize: "9pt",
                  padding: "0.25rem 0.4rem",
                }}
              >
                Procedimiento
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.numero}>
                <td
                  style={{
                    border: "1px solid #333",
                    textAlign: "center",
                    fontSize: "9pt",
                    padding: "0.25rem",
                  }}
                >
                  {item.numero}
                </td>
                <td
                  style={{
                    border: "1px solid #333",
                    fontSize: "9pt",
                    padding: "0.25rem 0.4rem",
                  }}
                >
                  {item.respuesta}
                </td>
                <td
                  style={{
                    border: "1px solid #333",
                    fontSize: "9pt",
                    padding: "0.25rem 0.4rem",
                  }}
                >
                  {item.procedimiento ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Gráficos de solución (graficoOperacion de cada problema) */}
      {graficos.map((g) => (
        <div
          key={g.numero}
          style={{
            marginBottom: "0.6rem",
          }}
        >
          <div
            style={{
              backgroundColor: hex.medium,
              color: "#000",
              fontWeight: "bold",
              fontSize: "9pt",
              padding: "0.25rem 0.5rem",
              borderLeft: `4px solid ${hex.accent}`,
            }}
          >
            Solución: {g.titulo}
          </div>
          <div
            style={{
              border: `1.5px solid ${hex.medium}`,
              borderRadius: "0 0 6px 6px",
              padding: "0.5rem 0.6rem",
              backgroundColor: "#FFFBEB",
            }}
          >
            <GraficoRenderer grafico={g.grafico as any} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Componente principal
// ═════════════════════════════════════════════════════════════════════════════

interface FichaAplicacionDocProps {
  ficha: IFichaAplicacionData;
  docente: string;
  institucion: string;
  /** Mostrar solucionario (default: false — es para el docente) */
  mostrarSolucionario?: boolean;
  insigniaUrl?: string | null;
}

export function FichaAplicacionDoc({
  ficha,
  docente,
  institucion,
  mostrarSolucionario = false,
  insigniaUrl,
}: FichaAplicacionDocProps) {
  const areaConfig = getAreaColor(ficha.area);
  const hex = areaConfig.hex;

  // Reset counter de problemas en cada render
  _problemaCounter = 0;

  return (
    <Document size="A4" orientation="portrait" margin="0.5in">
      <DocumentStyles thBgColor={hex.light} />

      <FichaHeader
        ficha={ficha}
        institucion={institucion}
        docente={docente}
        hex={hex}
        insigniaUrl={insigniaUrl}
      />

      {/* Secciones / bloques renderizables */}
      {(ficha.secciones ?? []).map((seccion, i) => (
        <div key={i}>
          <SeccionRenderer seccion={seccion} hex={hex} />
        </div>
      ))}

      {/* Solucionario (solo docente) */}
      {mostrarSolucionario && (() => {
        // Recoger graficoOperacion de cada sección tipo "problema"
        const graficosOp: GraficoSolucion[] = [];
        let pIdx = 0;
        (ficha.secciones ?? []).forEach((sec) => {
          if (sec.tipo === "problema") {
            pIdx++;
            const prob = sec as ISeccionProblema;
            if (prob.contenido.graficoOperacion) {
              graficosOp.push({
                numero: pIdx,
                titulo: prob.titulo,
                grafico: prob.contenido.graficoOperacion,
              });
            }
          }
        });
        const items = ficha.solucionario ?? [];
        if (!items.length && !graficosOp.length) return null;
        return <Solucionario items={items} hex={hex} graficos={graficosOp} />;
      })()}

      <Footer>
        <div
          style={{
            borderTop: `2px solid ${hex.primary}`,
            paddingTop: "0.3rem",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "8pt",
            color: "#666",
          }}
        >
          <span>Ficha de Aplicación — {ficha.area}</span>
          <span>Generado con SmartTeacher IA</span>
        </div>
      </Footer>
    </Document>
  );
}
