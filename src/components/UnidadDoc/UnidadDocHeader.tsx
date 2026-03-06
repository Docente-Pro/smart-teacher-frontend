interface Props {
  titulo: string;
  numeroUnidad: number;
  grado: string;
  seccion?: string;
}

/**
 * Encabezado del documento de Unidad de Aprendizaje.
 * Muestra el número de unidad, título y badge de grado + sección.
 */
export function UnidadDocHeader({ titulo, numeroUnidad, grado, seccion }: Props) {
  const badgeText = seccion ? `${grado} "${seccion}"` : grado;
  return (
    <div style={{ position: "relative", textAlign: "center", marginBottom: "0.3rem", paddingBottom: "0.3rem", borderBottom: "2px solid #000" }}>
      {/* Badge de grado */}
      <div className="grado-badge">{badgeText}</div>

      <h1 style={{ fontSize: "13pt", fontWeight: "bold", marginBottom: "0.15rem" }}>
        UNIDAD N° {String(numeroUnidad).padStart(2, "0")}
      </h1>
      <h2 style={{ fontSize: "12pt", fontWeight: "bold", fontStyle: "italic" }}>
        {titulo}
      </h2>
    </div>
  );
}
