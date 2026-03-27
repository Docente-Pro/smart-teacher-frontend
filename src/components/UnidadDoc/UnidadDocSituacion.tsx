import type { IEvidencias } from "@/interfaces/IUnidadIA";
import { parseMarkdown } from "@/utils/parseMarkdown";

interface Props {
  situacionSignificativa: string;
  evidencias?: IEvidencias;
  grado?: string;
  imagenSituacionUrl?: string;
}

function resumirProposito(texto?: string): string {
  const limpio = (texto ?? "").replace(/\s+/g, " ").trim();
  if (!limpio) return "";

  // Prioriza las dos primeras oraciones para mantener el propósito breve.
  const oraciones = limpio
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const base = oraciones.slice(0, 2).join(" ");
  const candidato = base || limpio;

  if (candidato.length <= 280) return candidato;
  return `${candidato.slice(0, 277).trimEnd()}...`;
}

/**
 * PLANTEAMIENTO DE LA SITUACIÓN + EVIDENCIA DE APRENDIZAJE
 */
export function UnidadDocSituacion({ situacionSignificativa, evidencias, imagenSituacionUrl }: Props) {
  return (
    <div style={{ marginBottom: "0.4rem" }}>
      {/* ─── Situación significativa ─── */}
      <h3 style={{ fontSize: "10pt", fontWeight: "bold", marginBottom: "0.15rem" }}>
        PLANTEAMIENTO DE LA SITUACIÓN.
      </h3>

      <div className="situacion-box" style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
        {/* Texto a la izquierda */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {situacionSignificativa.split("\n").map((paragraph, i) => (
            <p key={i} style={{ fontSize: "9pt", marginBottom: "0.25rem", textAlign: "justify" }}>
              {parseMarkdown(paragraph)}
            </p>
          ))}

          {/* ─── Reto (dentro del mismo cuadro) ─── */}
          {evidencias?.reto && (
            <p style={{ fontWeight: "bold", fontSize: "9pt", marginTop: "0.3rem", marginBottom: "0" }}>
              Ante esta situación nos planteamos el siguiente reto:{" "}
              <span style={{ fontWeight: "normal" }}>{parseMarkdown(evidencias.reto)}</span>
            </p>
          )}
        </div>

        {/* ─── Imagen 150×150px a la derecha del texto ─── */}
        {imagenSituacionUrl && (
          <img
            src={imagenSituacionUrl}
            alt="Ilustración de la situación significativa"
            crossOrigin="anonymous"
            style={{
              width: "200px",
              height: "200px",
              minWidth: "200px",
              minHeight: "200px",
              objectFit: "cover",
              borderRadius: "4px",
            }}
          />
        )}
      </div>

      {/* ─── Evidencias de aprendizaje ─── */}
      {evidencias && (
        <>
          <table>
            <thead>
              <tr>
                <th style={{ width: "100%", textAlign: "center" }}>PROPÓSITO DE LA UNIDAD</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontSize: "9pt" }}>{parseMarkdown(resumirProposito(evidencias.proposito))}</td>
              </tr>
            </tbody>
          </table>
          <table style={{ marginTop: "0.3rem" }}>
            <thead>
              <tr>
                <th style={{ width: "50%", textAlign: "center" }}>PRODUCTO INTEGRADOR</th>
                <th style={{ width: "50%", textAlign: "center" }}>INSTRUMENTO DE EVALUACIÓN</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontSize: "9pt" }}>{parseMarkdown(evidencias.productoIntegrador)}</td>
                <td style={{ fontSize: "9pt" }}>{parseMarkdown(evidencias.instrumentoEvaluacion)}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
