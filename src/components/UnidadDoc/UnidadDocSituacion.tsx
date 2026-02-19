import type { IEvidencias } from "@/interfaces/IUnidadIA";

interface Props {
  situacionSignificativa: string;
  evidencias?: IEvidencias;
  grado?: string;
}

/**
 * PLANTEAMIENTO DE LA SITUACIÓN + EVIDENCIA DE APRENDIZAJE
 */
export function UnidadDocSituacion({ situacionSignificativa, evidencias }: Props) {
  return (
    <div style={{ marginBottom: "0.4rem" }}>
      {/* ─── Situación significativa ─── */}
      <h3 style={{ fontSize: "10pt", fontWeight: "bold", marginBottom: "0.15rem" }}>
        PLANTEAMIENTO DE LA SITUACIÓN.
      </h3>

      <div className="situacion-box">
        {situacionSignificativa.split("\n").map((paragraph, i) => (
          <p key={i} style={{ fontSize: "9pt", marginBottom: "0.25rem", textAlign: "justify" }}>
            {paragraph}
          </p>
        ))}
      </div>

      {/* ─── Reto ─── */}
      {evidencias?.proposito && (
        <div style={{ marginBottom: "0.3rem" }}>
          <p style={{ fontWeight: "bold", fontSize: "9pt", marginBottom: "0.15rem" }}>
            Ante esta situación nos planteamos el siguiente reto:{" "}
            <span style={{ fontWeight: "normal" }}>{evidencias.proposito}</span>
          </p>
        </div>
      )}

      {/* ─── Evidencias de aprendizaje ─── */}
      {evidencias && (
        <>
          <h3 className="section-subtitle" style={{ marginTop: "0.3rem" }}>
            EVIDENCIA DE APRENDIZAJE
          </h3>
          <table>
            <thead>
              <tr>
                <th style={{ width: "34%", textAlign: "center" }}>PROPÓSITO</th>
                <th style={{ width: "33%", textAlign: "center" }}>PRODUCTO INTEGRADOR</th>
                <th style={{ width: "33%", textAlign: "center" }}>INSTRUMENTO DE EVALUACIÓN</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontSize: "9pt" }}>{evidencias.proposito}</td>
                <td style={{ fontSize: "9pt" }}>{evidencias.productoIntegrador}</td>
                <td style={{ fontSize: "9pt" }}>{evidencias.instrumentoEvaluacion}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
