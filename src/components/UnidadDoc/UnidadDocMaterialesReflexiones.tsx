import type { IReflexionPregunta } from "@/interfaces/IUnidadIA";

interface Props {
  materiales?: string[];
  reflexiones?: IReflexionPregunta[];
}

/**
 * V. MATERIALES Y RECURSOS A UTILIZAR
 * VI. REFLEXIONES SOBRE EL APRENDIZAJE
 * + Líneas de firma (DIRECTOR / PROFESOR)
 */
export function UnidadDocMaterialesReflexiones({ materiales, reflexiones }: Props) {
  return (
    <div>
      {/* ─── V. Materiales ─── */}
      {materiales && materiales.length > 0 && (
        <div style={{ marginBottom: "0.5rem" }} className="keep-together">
          <h3 style={{ fontSize: "10pt", fontWeight: "bold", marginBottom: "0.15rem" }}>
            V. &nbsp;&nbsp;MATERIALES Y RECURSOS A UTILIZAR:
          </h3>
          <ul style={{ marginLeft: "1.2rem" }}>
            {materiales.map((mat, i) => (
              <li key={i} style={{ fontSize: "9pt", marginBottom: "0.1rem" }}>
                {mat}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ─── VI. Reflexiones ─── */}
      <div style={{ marginBottom: "0.5rem" }} className="keep-together">
        <h3 style={{ fontSize: "10pt", fontWeight: "bold", marginBottom: "0.15rem" }}>
          VI. &nbsp;&nbsp;REFLEXIONES SOBRE EL APRENDIZAJE:
        </h3>

        {reflexiones && reflexiones.length > 0 ? (
          reflexiones.map((ref, i) => (
            <div key={i} style={{ marginBottom: "0.5rem" }}>
              <p style={{ fontSize: "9pt", fontWeight: "bold" }}>{ref.pregunta}</p>
              <div className="reflexion-line" />
              <div className="reflexion-line" />
            </div>
          ))
        ) : (
          <>
            <p style={{ fontSize: "9pt" }}>¿Qué avances tuvieron los estudiantes?</p>
            <div className="reflexion-line" />
            <div className="reflexion-line" />

            <p style={{ fontSize: "9pt", marginTop: "0.3rem" }}>¿Qué dificultades tuvieron los estudiantes?</p>
            <div className="reflexion-line" />
            <div className="reflexion-line" />

            <p style={{ fontSize: "9pt", marginTop: "0.3rem" }}>¿Qué aprendizajes debo reforzar o complementar en la siguiente experiencia?</p>
            <div className="reflexion-line" />
            <div className="reflexion-line" />

            <p style={{ fontSize: "9pt", marginTop: "0.3rem" }}>¿Qué actividades, estrategias y materiales funcionaron y cuáles no?</p>
            <div className="reflexion-line" />
            <div className="reflexion-line" />

            <p style={{ fontSize: "9pt", marginTop: "0.3rem" }}>Otras observaciones</p>
            <div className="reflexion-line" />
            <div className="reflexion-line" />
          </>
        )}
      </div>

      {/* ─── Firmas ─── */}
      <div style={{ marginTop: "2rem" }} className="grid-2 keep-together">
        <div style={{ textAlign: "center" }}>
          <div className="firma-line" />
          <p className="firma-label">DIRECTOR</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <div className="firma-line" />
          <p className="firma-label">PROFESOR(A)</p>
        </div>
      </div>
    </div>
  );
}
