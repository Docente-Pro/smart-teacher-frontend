interface Props {
  institucion: string;
  directivo: string;
  docente: string;
  grado: string;
  seccion?: string;
  nivel: string;
  fechaInicio: string;
  fechaFin: string;
  areas: string[];
  onEditDirectivo?: () => void;
}

/**
 * I. DATOS GENERALES — Tabla con información institucional y académica.
 */
export function UnidadDocDatosGenerales({
  institucion,
  directivo,
  docente,
  grado,
  seccion,
  nivel,
  fechaInicio,
  fechaFin,
  areas,
  onEditDirectivo,
}: Props) {
  const periodoTexto =
    fechaInicio && fechaFin
      ? `Del ${formatDate(fechaInicio)} al ${formatDate(fechaFin)}`
      : "";

  /* Texto de grado y sección */
  const gradoSeccionTexto = seccion
    ? `${grado} de ${nivel} - Sección "${seccion}"`
    : `${grado} de ${nivel}`;

  return (
    <div style={{ marginBottom: "0.4rem" }}>
      <h3 style={{ fontSize: "10pt", fontWeight: "bold", marginBottom: "0.15rem" }}>
        I. &nbsp;&nbsp;DATOS GENERALES
      </h3>
      <table>
        <tbody>
          <tr>
            <td style={{ width: "22%", fontWeight: "bold", backgroundColor: "#FEF3C7" }}>I. E.</td>
            <td colSpan={3}>{institucion}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold", backgroundColor: "#FEF3C7" }}>Directivo(a) de la I. E.</td>
            <td colSpan={3}>
              {directivo || (
                onEditDirectivo && (
                  <button
                    className="no-print"
                    onClick={onEditDirectivo}
                    style={{
                      background: "none",
                      border: "1px dashed #d97706",
                      borderRadius: "4px",
                      padding: "2px 8px",
                      color: "#d97706",
                      cursor: "pointer",
                      fontSize: "8pt",
                    }}
                  >
                    Coloca el nombre de tu Directivo(a) de la I.E.
                  </button>
                )
              )}
            </td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold", backgroundColor: "#FEF3C7" }}>Docente</td>
            <td colSpan={3}>{docente}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold", backgroundColor: "#FEF3C7" }}>Periodo de ejecución:</td>
            <td colSpan={3}>{periodoTexto}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold", backgroundColor: "#FEF3C7" }}>Grado y Sección:</td>
            <td colSpan={3}>{gradoSeccionTexto}</td>
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
  // Parsear como fecha local (sin timezone conversion)
  // dateStr viene en formato "YYYY-MM-DD"
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return dateStr;
  const d = new Date(year, month - 1, day); // month es 0-indexed
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString("es-PE", { day: "numeric", month: "long" });
  }
  // Si no es una fecha válida, devolver el string original
  return dateStr;
}


