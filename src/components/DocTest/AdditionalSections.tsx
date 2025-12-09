import { IPropositoSesion } from "@/interfaces/ISesionAprendizaje";

interface PropositoSesionSectionProps {
  proposito: IPropositoSesion;
}

/**
 * Componente: PropositoSesionSection
 * 
 * Renderiza la tabla del propósito de la sesión estilo MINEDU.
 * 
 * @param proposito - Objeto con el propósito de la sesión
 */
export function PropositoSesionSection({ proposito }: PropositoSesionSectionProps) {
  return (
    <table style={{marginBottom: "0.5rem"}}>
      <tbody>
        <tr>
          <td colSpan={2} style={{backgroundColor: "#E8F5E9", fontWeight: "bold"}}>
            PROPÓSITO DE LA SESIÓN
          </td>
        </tr>
        <tr>
          <td colSpan={2} style={{fontSize: "10pt", padding: "0.5rem"}}>
            "{proposito.queAprenderan}"
          </td>
        </tr>
      </tbody>
    </table>
  );
}
