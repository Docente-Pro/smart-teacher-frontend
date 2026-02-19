import type { ISecuencia } from "@/interfaces/IUnidadIA";

interface Props {
  secuencia?: ISecuencia;
}

/**
 * IV. SECUENCIA DE ACTIVIDADES
 *
 * Calendario semanal — cada semana es una tabla con:
 * - Fila DIAS: lunes a viernes con número
 * - Fila AREAS (turno mañana): las áreas del turno de mañana
 * - Fila ACTIVIDAD (turno mañana)
 * - Fila AREA (turno tarde)
 * - Fila ACTIVIDAD (turno tarde)
 */
export function UnidadDocSecuencia({ secuencia }: Props) {
  if (!secuencia) return null;

  return (
    <div style={{ marginBottom: "0.4rem" }}>
      <h3 style={{ fontSize: "10pt", fontWeight: "bold", marginBottom: "0.15rem" }}>
        IV. &nbsp;&nbsp;SECUENCIA DE ACTIVIDADES
      </h3>

      {/* Hilo conductor (si existe) */}
      {secuencia.hiloConductor && (
        <p style={{ fontSize: "9pt", fontStyle: "italic", marginBottom: "0.3rem" }}>
          <strong>Hilo conductor:</strong> {secuencia.hiloConductor}
        </p>
      )}

      {secuencia.semanas.map((semana) => (
        <div key={semana.semana} style={{ marginBottom: "0.5rem" }} className="no-break">
          {/* Header de semana */}
          <div className="semana-header">{semana.semana}</div>

          <table>
            <tbody>
              {/* Fila: DIAS */}
              <tr>
                <td style={{ fontWeight: "bold", width: "10%", backgroundColor: "#FDE68A", textAlign: "center" }}>
                  DIAS
                </td>
                {semana.dias.map((dia, i) => (
                  <td
                    key={i}
                    style={{
                      fontWeight: "bold",
                      backgroundColor: "#FEF3C7",
                      textAlign: "center",
                      fontSize: "8pt",
                      width: `${90 / Math.max(semana.dias.length, 1)}%`,
                    }}
                  >
                    {dia.dia.toUpperCase()} {extractDayNumber(dia.fecha)}
                  </td>
                ))}
              </tr>

              {/* Fila: AREAS (turno mañana) */}
              <tr>
                <td style={{ fontWeight: "bold", backgroundColor: "#FDE68A", textAlign: "center", fontSize: "8pt" }}>
                  AREAS
                </td>
                {semana.dias.map((dia, i) => (
                  <td key={i} style={{ textAlign: "center", fontWeight: "bold", fontSize: "8pt" }}>
                    {dia.turnoManana?.area?.toUpperCase() || ""}
                  </td>
                ))}
              </tr>

              {/* Fila: ACTIVIDAD (turno mañana) */}
              <tr>
                <td style={{ fontWeight: "bold", backgroundColor: "#FDE68A", textAlign: "center", fontSize: "8pt" }}>
                  ACTIVIDAD
                </td>
                {semana.dias.map((dia, i) => (
                  <td key={i} style={{ fontSize: "8pt", textAlign: "center" }}>
                    {dia.turnoManana?.actividad || ""}
                  </td>
                ))}
              </tr>

              {/* Fila: AREA (turno tarde) */}
              <tr>
                <td style={{ fontWeight: "bold", backgroundColor: "#FDE68A", textAlign: "center", fontSize: "8pt" }}>
                  AREA
                </td>
                {semana.dias.map((dia, i) => (
                  <td key={i} style={{ textAlign: "center", fontWeight: "bold", fontSize: "8pt" }}>
                    {dia.turnoTarde?.area?.toUpperCase() || ""}
                  </td>
                ))}
              </tr>

              {/* Fila: ACTIVIDAD (turno tarde) */}
              <tr>
                <td style={{ fontWeight: "bold", backgroundColor: "#FDE68A", textAlign: "center", fontSize: "8pt" }}>
                  ACTIVIDAD
                </td>
                {semana.dias.map((dia, i) => (
                  <td key={i} style={{ fontSize: "8pt", textAlign: "center" }}>
                    {dia.turnoTarde?.actividad || ""}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

/* ─── Helper: extraer número de día de una fecha ─── */
function extractDayNumber(fecha: string): string {
  if (!fecha) return "";
  try {
    const d = new Date(fecha);
    return String(d.getDate()).padStart(2, "0");
  } catch {
    // Intentar extraer del string directamente
    const match = fecha.match(/(\d{1,2})/);
    return match ? match[1] : "";
  }
}
