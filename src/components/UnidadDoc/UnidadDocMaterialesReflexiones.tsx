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
        <div style={{ marginBottom: "0.5rem", marginTop: "0.5rem" }} className="keep-together">
          <h3 style={{ fontSize: "10pt", fontWeight: "bold", marginBottom: "0.15rem" }}>
            V. &nbsp;&nbsp;MATERIALES Y RECURSOS A UTILIZAR:
          </h3>
          <div
            style={{
              border: "1.5px solid #000",
              borderRadius: "4px",
              padding: "0.35rem 0.5rem",
            }}
          >
            {/* Dos columnas para aprovechar el espacio */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.05rem 1.2rem",
              }}
            >
              {materiales.map((mat, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: "8.5pt",
                    display: "flex",
                    alignItems: "baseline",
                    gap: "0.3rem",
                    lineHeight: 1.4,
                  }}
                >
                  <span style={{ fontSize: "6pt", color: "#B45309", flexShrink: 0 }}>●</span>
                  <span>{mat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── VI. Reflexiones ─── */}
      <div style={{ marginBottom: "0.5rem", marginTop: "0.5rem" }} className="keep-together">
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
