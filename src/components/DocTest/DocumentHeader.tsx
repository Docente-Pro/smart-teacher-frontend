interface DocumentHeaderProps {
  institucion: string;
  titulo: string;
  /** Optional subtitle above the institution (e.g. "Sesión de Aprendizaje - Área de Comunicación") */
  areaSubtitle?: string;
  /** Accent color for the subtitle text and bottom border */
  accentColor?: string;
  /** URL of the school badge — rendered top-left */
  insigniaUrl?: string | null;
}

/**
 * Componente: DocumentHeader
 * 
 * Renderiza el encabezado institucional del documento estilo MINEDU.
 * Opcionalmente muestra un subtítulo de área con color de acento.
 * Si se provee insigniaUrl, la insignia aparece a la izquierda.
 */
export function DocumentHeader({ institucion, titulo, areaSubtitle, accentColor, insigniaUrl }: DocumentHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: "0.5rem",
        borderBottom: `2px solid ${accentColor || "#000"}`,
        paddingBottom: "0.5rem",
        gap: "0.6rem",
      }}
    >
      {insigniaUrl && (
        <img
          src={insigniaUrl}
          alt="Insignia"
          style={{
            width: "100px",
            height: "100px",
            objectFit: "contain",
            flexShrink: 0,
          }}
        />
      )}
      <div style={{ flex: 1, textAlign: "center" }}>
        {areaSubtitle && (
          <p style={{ fontSize: "10pt", marginBottom: "0.2rem", color: accentColor || "#333" }}>
            {areaSubtitle}
          </p>
        )}
        <h1 style={{ fontSize: "12pt", fontWeight: "bold", marginBottom: "0.2rem" }}>
          {institucion}
        </h1>
        <h2 style={{ fontSize: "16pt", fontWeight: "bold", marginBottom: "0.2rem" }}>
          {titulo}
        </h2>
      </div>
      {insigniaUrl && <div style={{ width: "100px", flexShrink: 0 }} />}
    </div>
  );
}
