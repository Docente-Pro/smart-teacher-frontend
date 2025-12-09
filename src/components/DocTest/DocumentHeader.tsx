interface DocumentHeaderProps {
  institucion: string;
  titulo: string;
}

/**
 * Componente: DocumentHeader
 * 
 * Renderiza el encabezado institucional del documento estilo MINEDU.
 * 
 * @param institucion - Nombre de la institución educativa
 * @param titulo - Título de la sesión de aprendizaje
 */
export function DocumentHeader({ institucion, titulo }: DocumentHeaderProps) {
  return (
    <div style={{textAlign: "center", marginBottom: "0.5rem", borderBottom: "2px solid #000", paddingBottom: "0.5rem"}}>
      <h1 style={{fontSize: "12pt", fontWeight: "bold", marginBottom: "0.2rem"}}>
        {institucion}
      </h1>
      <h2 style={{fontSize: "16pt", fontWeight: "bold", marginBottom: "0.2rem"}}>
        {titulo}
      </h2>
    </div>
  );
}
