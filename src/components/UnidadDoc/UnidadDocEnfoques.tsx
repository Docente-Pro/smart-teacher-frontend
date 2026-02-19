import type { IEnfoqueUnidad } from "@/interfaces/IUnidadIA";

interface Props {
  enfoques?: IEnfoqueUnidad[];
}

/**
 * III. ENFOQUES TRANSVERSALES VALORES Y ACTITUDES
 */
export function UnidadDocEnfoques({ enfoques }: Props) {
  if (!enfoques || enfoques.length === 0) return null;

  return (
    <div style={{ marginBottom: "0.4rem" }}>
      <h3 style={{ fontSize: "10pt", fontWeight: "bold", marginBottom: "0.15rem" }}>
        III. &nbsp;&nbsp;ENFOQUES TRANSVERSALES VALORES Y ACTITUDES
      </h3>
      <table>
        <thead>
          <tr>
            <th style={{ width: "25%", textAlign: "center" }}>ENFOQUES TRANSVERSALES</th>
            <th style={{ width: "20%", textAlign: "center" }}>VALOR</th>
            <th style={{ width: "55%", textAlign: "center" }}>ACTITUDES O ACCIONES OBSERVABLES</th>
          </tr>
        </thead>
        <tbody>
          {enfoques.map((enfoque, idx) => (
            <tr key={idx}>
              <td style={{ fontWeight: "bold", fontSize: "9pt", textAlign: "center" }}>
                {enfoque.enfoque.toUpperCase()}
              </td>
              <td style={{ fontSize: "9pt", textAlign: "center", fontWeight: "bold" }}>
                {enfoque.valor}
              </td>
              <td style={{ fontSize: "9pt" }}>
                {enfoque.actitudes}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
