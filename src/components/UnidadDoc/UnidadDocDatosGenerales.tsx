interface Props {
  institucion: string;
  docente: string;
  grado: string;
  nivel: string;
  fechaInicio: string;
  fechaFin: string;
  areas: string[];
}

/**
 * I. DATOS GENERALES — Tabla con información institucional y académica.
 */
export function UnidadDocDatosGenerales({
  institucion,
  docente,
  grado,
  nivel,
  fechaInicio,
  fechaFin,
  areas,
}: Props) {
  const periodoTexto =
    fechaInicio && fechaFin
      ? `Del ${formatDate(fechaInicio)} al ${formatDate(fechaFin)}`
      : "";

  /* Determinar ciclo en base al grado */
  const ciclo = getCiclo(nivel, grado);

  return (
    <div style={{ marginBottom: "0.4rem" }}>
      <h3 style={{ fontSize: "10pt", fontWeight: "bold", marginBottom: "0.15rem" }}>
        I. &nbsp;&nbsp;DATOS GENERALES
      </h3>
      <table>
        <tbody>
          <tr>
            <td style={{ width: "22%", fontWeight: "bold", backgroundColor: "#FEF3C7" }}>I. E. N°</td>
            <td colSpan={3}>{institucion}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold", backgroundColor: "#FEF3C7" }}>Director de la I. E.</td>
            <td colSpan={3}></td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold", backgroundColor: "#FEF3C7" }}>Docente</td>
            <td colSpan={3}>{docente}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold", backgroundColor: "#FEF3C7" }}>Fecha:</td>
            <td colSpan={3}></td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold", backgroundColor: "#FEF3C7" }}>Periodo de ejecución:</td>
            <td colSpan={3}>{periodoTexto}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold", backgroundColor: "#FEF3C7" }}>Ciclo y grado:</td>
            <td colSpan={3}>{ciclo}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold", backgroundColor: "#FEF3C7" }}>ÁREAS</td>
            <td colSpan={3}>{areas.join(", ")}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* ─── Helpers ─── */

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-PE", { day: "numeric", month: "long" });
  } catch {
    return dateStr;
  }
}

function getCiclo(nivel: string, grado: string): string {
  const nivelLower = nivel.toLowerCase();
  const gradoLower = grado.toLowerCase();

  if (nivelLower.includes("inicial")) {
    if (gradoLower.includes("3") || gradoLower.includes("4") || gradoLower.includes("5")) return `II ciclo (${grado} de ${nivel})`;
    return `I ciclo (${grado} de ${nivel})`;
  }

  if (nivelLower.includes("primaria")) {
    if (gradoLower.includes("1") || gradoLower.includes("2")) return `III ciclo (${grado} de ${nivel})`;
    if (gradoLower.includes("3") || gradoLower.includes("4")) return `IV ciclo (${grado} de ${nivel})`;
    if (gradoLower.includes("5") || gradoLower.includes("6")) return `V ciclo (${grado} de ${nivel})`;
  }

  if (nivelLower.includes("secundaria")) {
    if (gradoLower.includes("1") || gradoLower.includes("2")) return `VI ciclo (${grado} de ${nivel})`;
    if (gradoLower.includes("3") || gradoLower.includes("4") || gradoLower.includes("5")) return `VII ciclo (${grado} de ${nivel})`;
  }

  return `${grado} de ${nivel}`;
}
