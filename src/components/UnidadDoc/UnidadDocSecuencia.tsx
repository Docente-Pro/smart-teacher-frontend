import type { ISecuencia } from "@/interfaces/IUnidadIA";
import { getAreaColor } from "@/constants/areaColors";
import { parseMarkdown } from "@/utils/parseMarkdown";

interface Props {
  secuencia?: ISecuencia;
}

/**
 * IV. SECUENCIA DE ACTIVIDADES
 *
 * Calendario semanal — grilla: horas pedagógicas (filas) × días (columnas).
 * Sigue el formato MINEDU con H1-H6, recreo entre H3 y H4.
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

      {secuencia.semanas.map((semana) => {
        // Calcular cuántas horas tiene el día con más horas
        const maxHoras = Math.max(...semana.dias.map((d) => d.horas?.length ?? 0), 0);

        return (
          <div key={semana.semana} style={{ marginBottom: "0.5rem" }} className="no-break">
            {/* Header de semana */}
            <div className="semana-header">{semana.semana}</div>

            <table>
              <tbody>
                {/* Fila: DIAS */}
                <tr>
                  <td style={{ fontWeight: "bold", width: "10%", backgroundColor: "#FDE68A", textAlign: "center" }}>
                    HORA
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

                {/* Filas: una por cada hora pedagógica */}
                {Array.from({ length: maxHoras }).map((_, hIdx) => (
                  <tr key={hIdx}>
                    <td
                      style={{
                        fontWeight: "bold",
                        backgroundColor: "#FDE68A",
                        textAlign: "center",
                        fontSize: "8pt",
                      }}
                    >
                      H{hIdx + 1}
                    </td>
                    {semana.dias.map((dia, dIdx) => {
                      const hora = dia.horas?.[hIdx];
                      if (!hora) {
                        return <td key={dIdx} style={{ fontSize: "8pt", textAlign: "center" }} />;
                      }
                      const areaHex = hora.area ? getAreaColor(hora.area).hex : null;
                      return (
                        <td
                          key={dIdx}
                          style={{
                            fontSize: "8pt",
                            textAlign: "center",
                            backgroundColor: areaHex?.light || "transparent",
                          }}
                        >
                          <div style={{ fontWeight: "bold", fontSize: "7pt" }}>
                            {hora.area?.toUpperCase() || ""}
                          </div>
                          {hora.actividad && (
                            <div style={{ fontSize: "7pt" }}>
                              {parseMarkdown(hora.actividad)}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
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
