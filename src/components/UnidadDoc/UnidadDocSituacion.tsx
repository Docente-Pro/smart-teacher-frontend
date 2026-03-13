import type { IEvidencias } from "@/interfaces/IUnidadIA";
import { parseMarkdown } from "@/utils/parseMarkdown";

interface Props {
  situacionSignificativa: string;
  evidencias?: IEvidencias;
  grado?: string;
  imagenSituacionUrl?: string;
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

      <div className="situacion-box">
        {/* ─── Imagen ilustrativa (si existe) ─── */}
        {imagenSituacionUrl && (
          <div style={{ textAlign: "center", marginBottom: "0.4rem" }}>
            <img
              src={imagenSituacionUrl}
              alt="Ilustración de la situación significativa"
              style={{
                maxWidth: "100%",
                maxHeight: "350px",
                objectFit: "contain",
                borderRadius: "4px",
              }}
            />
          </div>
        )}

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

      {/* ─── Evidencias de aprendizaje ─── */}
      {evidencias && (
        <>
          <h3 className="section-subtitle" style={{ marginTop: "0.3rem" }}>
            EVIDENCIA DE APRENDIZAJE
          </h3>
          <table>
            <thead>
              <tr>
                <th style={{ width: "100%", textAlign: "center" }}>PROPÓSITO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontSize: "9pt" }}>{parseMarkdown(evidencias.proposito)}</td>
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
