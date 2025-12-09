import { IEnfoqueTransversal } from "@/interfaces/ISesionAprendizaje";

interface EnfoquesTransversalesSectionProps {
  enfoques: IEnfoqueTransversal[];
}

/**
 * Componente: EnfoquesTransversalesSection
 * 
 * Renderiza la tabla de Enfoques Transversales estilo MINEDU.
 * 
 * @param enfoques - Array de enfoques transversales con sus actitudes
 */
export function EnfoquesTransversalesSection({ enfoques }: EnfoquesTransversalesSectionProps) {
  return (
    <table style={{marginBottom: "0.5rem"}}>
      <tbody>
        <tr>
          <th style={{width: "30%"}}>ENFOQUES TRANSVERSALES</th>
          <th style={{width: "70%"}}>ACTITUDES O ACCIONES OBSERVABLES</th>
        </tr>
        {enfoques.map((enfoque, idx) => (
          <tr key={idx}>
            <td style={{fontSize: "9pt", fontWeight: "bold"}}>{enfoque.nombre}</td>
            <td style={{fontSize: "9pt"}}>{enfoque.actitudesObservables}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
