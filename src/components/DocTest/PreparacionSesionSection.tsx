import { IPreparacionSesion } from "@/interfaces/ISesionAprendizaje";

interface PreparacionSesionSectionProps {
  preparacion: IPreparacionSesion;
}

/**
 * Componente: PreparacionSesionSection
 * 
 * Renderiza la tabla de preparación "Antes de la Sesión" estilo MINEDU.
 * 
 * @param preparacion - Objeto con las acciones previas y recursos necesarios
 */
export function PreparacionSesionSection({ preparacion }: PreparacionSesionSectionProps) {
  return (
    <table style={{marginBottom: "0.5rem"}}>
      <tbody>
        <tr>
          <td colSpan={2} style={{backgroundColor: "#E8F5E9", fontWeight: "bold", textAlign: "center"}}>
            ANTES DE LA SESIÓN
          </td>
        </tr>
        <tr>
          <th style={{width: "50%"}}>¿QUÉ NECESITAMOS HACER ANTES DE LA SESIÓN?</th>
          <th style={{width: "50%"}}>¿QUÉ RECURSOS O MATERIALES SE UTILIZARÁN EN ESTA SESIÓN?</th>
        </tr>
        <tr>
          <td style={{verticalAlign: "top"}}>
            <ul style={{marginLeft: "1rem", fontSize: "9pt"}}>
              {preparacion.quehacerAntes.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </td>
          <td style={{verticalAlign: "top"}}>
            <ul style={{marginLeft: "1rem", fontSize: "9pt"}}>
              {preparacion.recursosMateriales.map((recurso, idx) => (
                <li key={idx}>{recurso}</li>
              ))}
            </ul>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
