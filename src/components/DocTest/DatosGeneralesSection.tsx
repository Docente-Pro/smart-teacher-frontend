import { IDatosGenerales } from "@/interfaces/ISesionAprendizaje";

interface DatosGeneralesSectionProps {
  datos: IDatosGenerales;
}

/**
 * Componente: DatosGeneralesSection
 * 
 * Renderiza las tablas de Área y Datos Informativos estilo MINEDU.
 * 
 * @param datos - Objeto con todos los datos generales de la sesión
 */
export function DatosGeneralesSection({ datos }: DatosGeneralesSectionProps) {
  return (
    <>
      {/* Área */}
      <table style={{marginBottom: "0.5rem"}}>
        <tbody>
          <tr>
            <td style={{width: "15%", fontWeight: "bold"}}>Área:</td>
            <td style={{width: "85%"}}>{datos.area}</td>
          </tr>
        </tbody>
      </table>

      {/* Datos Informativos */}
      <table style={{marginBottom: "0.5rem"}}>
        <tbody>
          <tr>
            <td colSpan={4} style={{backgroundColor: "#E8F5E9", fontWeight: "bold"}}>
              DATOS INFORMATIVOS:
            </td>
          </tr>
          <tr>
            <td style={{width: "15%", fontWeight: "bold"}}>Docente:</td>
            <td colSpan={3}>{datos.docente}</td>
          </tr>
          <tr>
            <td style={{fontWeight: "bold"}}>Grado:</td>
            <td style={{width: "35%"}}>{datos.grado}</td>
            <td style={{width: "10%", fontWeight: "bold"}}>Fecha:</td>
            <td style={{width: "40%"}}></td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
