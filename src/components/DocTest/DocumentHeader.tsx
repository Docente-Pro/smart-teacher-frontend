interface DocumentHeaderProps {
  institucion: string;
  titulo: string;
  /** Optional subtitle above the institution (e.g. "Sesión de Aprendizaje - Área de Comunicación") */
  areaSubtitle?: string;
  /** Accent color for the subtitle text and bottom border */
  accentColor?: string;
}

/**
 * Componente: DocumentHeader
 * 
 * Renderiza el encabezado institucional del documento estilo MINEDU.
 * Opcionalmente muestra un subtítulo de área con color de acento.
 * 
 * @param institucion - Nombre de la institución educativa
 * @param titulo - Título de la sesión de aprendizaje
 * @param areaSubtitle - Texto de subtítulo con el área
 * @param accentColor - Color hex para el acento del header
 */
export function DocumentHeader({ institucion, titulo, areaSubtitle, accentColor }: DocumentHeaderProps) {
  return (
    <div style={{textAlign: "center", marginBottom: "0.5rem", borderBottom: `2px solid ${accentColor || "#000"}`, paddingBottom: "0.5rem"}}>
      {areaSubtitle && (
        <p style={{fontSize: "10pt", marginBottom: "0.2rem", color: accentColor || "#333"}}>
          {areaSubtitle}
        </p>
      )}
      <h1 style={{fontSize: "12pt", fontWeight: "bold", marginBottom: "0.2rem"}}>
        {institucion}
      </h1>
      <h2 style={{fontSize: "16pt", fontWeight: "bold", marginBottom: "0.2rem"}}>
        {titulo}
      </h2>
    </div>
  );
}
