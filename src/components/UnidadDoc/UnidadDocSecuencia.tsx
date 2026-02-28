import type { ISecuencia } from "@/interfaces/IUnidadIA";
import { getAreaColor } from "@/constants/areaColors";
import { parseMarkdown } from "@/utils/parseMarkdown";

interface Props {
  secuencia?: ISecuencia;
}

/**
 * IV. SECUENCIA DE ACTIVIDADES
 *
 * Calendario semanal — cada semana es una tabla con:
 * - Fila DIAS: lunes a viernes con número
 * - Fila AREAS (primer bloque): las áreas del primer bloque
 * - Fila ACTIVIDAD (primer bloque)
 * - Fila AREA (segundo bloque)
 * - Fila ACTIVIDAD (segundo bloque)
 */
export function UnidadDocSecuencia({ secuencia }: Props) {
  if (!secuencia) return null;

  return (
    <div style={{ marginBottom: "1rem" }}>
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
                {semana.dias.map((dia, i) => {
                  const dayLabel = dia.dia?.toUpperCase() || "";
                  const dayNum = extractDayNumber(dia.fecha);
                  return (
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
                      {dayLabel}{dayNum ? ` ${dayNum}` : ""}
                    </td>
                  );
                })}
              </tr>

              {/* Fila: AREAS (primer bloque) */}
              <tr>
                <td style={{ fontWeight: "bold", backgroundColor: "#FDE68A", textAlign: "center", fontSize: "8pt" }}>
                  AREAS
                </td>
                {semana.dias.map((dia, i) => {
                  const areaHex = dia.turnoManana?.area ? getAreaColor(dia.turnoManana.area).hex : null;
                  return (
                    <td key={i} style={{
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: "8pt",
                      backgroundColor: areaHex?.light || "transparent",
                    }}>
                      {dia.turnoManana?.area?.toUpperCase() || ""}
                    </td>
                  );
                })}
              </tr>

              {/* Fila: ACTIVIDAD (primer bloque) */}
              <tr>
                <td style={{ fontWeight: "bold", backgroundColor: "#FDE68A", textAlign: "center", fontSize: "8pt" }}>
                  ACTIVIDAD
                </td>
                {semana.dias.map((dia, i) => (
                  <td key={i} style={{ fontSize: "8pt", textAlign: "center" }}>
                    {parseMarkdown(dia.turnoManana?.actividad || "")}
                  </td>
                ))}
              </tr>

              {/* Fila: AREA (segundo bloque) */}
              <tr>
                <td style={{ fontWeight: "bold", backgroundColor: "#FDE68A", textAlign: "center", fontSize: "8pt" }}>
                  AREA
                </td>
                {semana.dias.map((dia, i) => {
                  const areaHex = dia.turnoTarde?.area ? getAreaColor(dia.turnoTarde.area).hex : null;
                  return (
                    <td key={i} style={{
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: "8pt",
                      backgroundColor: areaHex?.light || "transparent",
                    }}>
                      {dia.turnoTarde?.area?.toUpperCase() || ""}
                    </td>
                  );
                })}
              </tr>

              {/* Fila: ACTIVIDAD (segundo bloque) */}
              <tr>
                <td style={{ fontWeight: "bold", backgroundColor: "#FDE68A", textAlign: "center", fontSize: "8pt" }}>
                  ACTIVIDAD
                </td>
                {semana.dias.map((dia, i) => (
                  <td key={i} style={{ fontSize: "8pt", textAlign: "center" }}>
                    {parseMarkdown(dia.turnoTarde?.actividad || "")}
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

  // Si viene en formato YYYY-MM-DD, extraer el día directamente
  if (/^\d{4}-\d{2}-\d{2}/.test(fecha)) {
    const day = fecha.split("-")[2]?.substring(0, 2);
    return day || "";
  }

  // Parsear como fecha local (sin timezone conversion)
  const [year, month, day] = fecha.split("-").map(Number);
  if (year && month && day) {
    return String(day).padStart(2, "0");
  }

  // Fallback: extraer el último grupo de 1-2 dígitos (día) del string
  // Soporta formatos como "03/15", "15-03-2024", "15 de marzo", etc.
  const match = fecha.match(/(\d{1,2})/);
  return match ? match[1].padStart(2, "0") : "";
}
