interface Props {
  titulo: string;
  numeroUnidad: number;
  grado: string;
  seccion?: string;
  insigniaUrl?: string | null;
}

/**
 * Encabezado del documento de Unidad de Aprendizaje.
 * Muestra el número de unidad, título y badge de grado + sección.
 * Si se provee insigniaUrl, la insignia aparece a la izquierda.
 */
export function UnidadDocHeader({ titulo, numeroUnidad, grado, seccion, insigniaUrl }: Props) {
  const badgeText = seccion ? `${grado} "${seccion}"` : grado;
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        marginBottom: "0.3rem",
        paddingBottom: "0.3rem",
        borderBottom: "2px solid #000",
        gap: "0.6rem",
      }}
    >
      {insigniaUrl && (
        <img
          src={insigniaUrl}
          alt="Insignia"
          style={{
            width: "165px",
            height: "165px",
            objectFit: "contain",
            flexShrink: 0,
          }}
        />
      )}
      <div style={{ flex: 1, textAlign: "center" }}>
        <div className="grado-badge">{badgeText}</div>
        <h1 style={{ fontSize: "13pt", fontWeight: "bold", marginBottom: "0.15rem" }}>
          UNIDAD N° {String(numeroUnidad).padStart(2, "0")}
        </h1>
        <h2 style={{ fontSize: "12pt", fontWeight: "bold", fontStyle: "italic" }}>
          {titulo}
        </h2>
      </div>
      {insigniaUrl && <div style={{ width: "165px", flexShrink: 0 }} />}
    </div>
  );
}
