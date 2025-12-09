import { IReflexionAprendizaje } from "@/interfaces/ISesionAprendizaje";

interface ReflexionesSectionProps {
  reflexiones: IReflexionAprendizaje;
}

/**
 * Componente: ReflexionesSection
 * 
 * Renderiza la sección VI: REFLEXIONES SOBRE EL APRENDIZAJE del documento.
 * Muestra una tabla con los aspectos a reflexionar y sus respuestas.
 * 
 * @param reflexiones - Objeto con las reflexiones sobre el proceso de aprendizaje
 */
export function ReflexionesSection({ reflexiones }: ReflexionesSectionProps) {
  return (
    <section className="border-accent section">
      <h2>VI. REFLEXIONES SOBRE EL APRENDIZAJE</h2>
      <div>
        <table style={{width: "100%", borderCollapse: "collapse"}}>
          <thead>
            <tr>
              <th style={{border: "1px solid #1e40af", padding: "0.75rem", textAlign: "left"}}>Aspectos a Reflexionar</th>
              <th style={{border: "1px solid #1e40af", padding: "0.75rem", textAlign: "left"}}>Respuesta</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{border: "1px solid #dbeafe", padding: "0.75rem", fontWeight: "600"}}>
                ¿Qué avances tuvieron los estudiantes en sus aprendizajes?
              </td>
              <td style={{border: "1px solid #dbeafe", padding: "0.75rem"}}>
                {reflexiones.avancesEstudiantes}
              </td>
            </tr>
            <tr>
              <td style={{border: "1px solid #dbeafe", padding: "0.75rem", fontWeight: "600"}}>
                ¿Qué dificultades experimentaron los estudiantes?
              </td>
              <td style={{border: "1px solid #dbeafe", padding: "0.75rem"}}>
                {reflexiones.dificultadesExperimentadas}
              </td>
            </tr>
            <tr>
              <td style={{border: "1px solid #dbeafe", padding: "0.75rem", fontWeight: "600"}}>
                ¿Qué aprendizajes debo reforzar en la siguiente sesión?
              </td>
              <td style={{border: "1px solid #dbeafe", padding: "0.75rem"}}>
                {reflexiones.aprendizajesReforzar}
              </td>
            </tr>
            <tr>
              <td style={{border: "1px solid #dbeafe", padding: "0.75rem", fontWeight: "600"}}>
                ¿Qué actividades, estrategias y materiales funcionaron y cuáles no?
              </td>
              <td style={{border: "1px solid #dbeafe", padding: "0.75rem"}}>
                {reflexiones.actividadesEstrategiasMateriales}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
