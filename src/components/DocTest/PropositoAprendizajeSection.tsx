import { IPropositoAprendizaje } from "@/interfaces/ISesionAprendizaje";

interface PropositoAprendizajeSectionProps {
  proposito: IPropositoAprendizaje;
}

/**
 * Componente: PropositoAprendizajeSection
 * 
 * Renderiza la tabla de Propósitos de Aprendizaje y Competencias Transversales estilo MINEDU.
 * 
 * @param proposito - Objeto completo con todos los elementos del propósito de aprendizaje
 */
export function PropositoAprendizajeSection({ proposito }: PropositoAprendizajeSectionProps) {
  return (
    <>
      {/* Propósitos de Aprendizaje */}
      <table style={{marginBottom: "0.5rem"}}>
        <tbody>
          <tr>
            <td colSpan={4} style={{backgroundColor: "#E8F5E9", fontWeight: "bold", textAlign: "center"}}>
              PROPÓSITOS DE APRENDIZAJE Y EVIDENCIAS DE APRENDIZAJE
            </td>
          </tr>
          <tr>
            <th style={{width: "25%"}}>COMPETENCIAS Y CAPACIDADES</th>
            <th style={{width: "25%"}}>CRITERIOS DE EVALUACIÓN</th>
            <th style={{width: "25%"}}>PRODUCTO O EVIDENCIA</th>
            <th style={{width: "25%"}}>INSTRUMENTO DE EVALUACIÓN</th>
          </tr>
          <tr>
            <td>
              <p style={{fontWeight: "bold", marginBottom: "0.3rem"}}>
                {proposito.competencia || "No se ha seleccionado competencia"}
              </p>
              {proposito.capacidades && proposito.capacidades.length > 0 ? (
                proposito.capacidades.map((cap, idx) => (
                  <p key={idx} style={{fontSize: "9pt", marginBottom: "0.2rem"}}>
                    • {cap.nombre}
                  </p>
                ))
              ) : (
                <p style={{fontSize: "9pt", fontStyle: "italic", color: "#666"}}>
                  No se han seleccionado capacidades
                </p>
              )}
            </td>
            <td>
              {proposito.criteriosEvaluacion && proposito.criteriosEvaluacion.length > 0 ? (
                proposito.criteriosEvaluacion.map((criterio, idx) => {
                  // Manejar tanto strings como objetos ICriterioIA
                  const texto = typeof criterio === 'string' 
                    ? criterio 
                    : (criterio as any).criterioCompleto || '';
                  return (
                    <p key={idx} style={{fontSize: "9pt", marginBottom: "0.2rem"}}>
                      • {texto}
                    </p>
                  );
                })
              ) : (
                <p style={{fontSize: "9pt", fontStyle: "italic", color: "#666"}}>
                  No se han generado criterios
                </p>
              )}
            </td>
            <td style={{fontSize: "9pt"}}>
              {proposito.evidenciaAprendizaje || "No especificado"}
            </td>
            <td style={{fontSize: "9pt", textAlign: "center"}}>
              {proposito.instrumentoEvaluacion || "No especificado"}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Competencias Transversales - Solo mostrar si hay datos */}
      {proposito.competenciasTransversales && proposito.competenciasTransversales.length > 0 && (
        <table style={{marginBottom: "0.5rem"}}>
          <tbody>
            <tr>
              <th style={{width: "25%"}}>COMPETENCIAS TRANSVERSALES</th>
              <th style={{width: "35%"}}>CAPACIDADES</th>
              <th style={{width: "40%"}}>DESEMPEÑOS POR CICLO</th>
            </tr>
            {proposito.competenciasTransversales.map((comp, idx) => (
              <tr key={idx}>
                <td style={{fontSize: "9pt"}}>{comp}</td>
                <td style={{fontSize: "9pt"}}>-</td>
                <td style={{fontSize: "9pt"}}>-</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
