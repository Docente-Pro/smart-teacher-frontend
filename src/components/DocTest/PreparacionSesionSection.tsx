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
  // Formatea cada item en una lista de líneas/bullets
  const formatearItem = (texto: string): string[] => {
    const t = (texto || "").trim();
    if (!t) return [];

    // 1) Si tiene saltos de línea explícitos
    if (t.includes('\n')) {
      return t.split('\n').map(s => s.trim()).filter(Boolean);
    }

    // 2) Si parece una lista separada por punto y espacio (oraciones)
    const oraciones = t.split(/(?<=\.)\s+/).map(s => s.trim()).filter(Boolean);
    if (oraciones.length > 1) return oraciones;

    // 3) Si contiene punto y coma, o comas que separan elementos, dividir
    const porSeparadores = t.split(/;|，|,|•|\u2022|\n/).map(s => s.trim()).filter(Boolean);
    if (porSeparadores.length > 1) return porSeparadores;

    // 4) Fallback: regresar el texto completo como un solo elemento
    return [t];
  };

  // Procesar arrays (soporta que vengan como string o como array)
  const procesarItems = (items: string[] | string): string[] => {
    if (!items) return [];
    if (typeof items === 'string') return formatearItem(items);
    const resultado: string[] = [];
    items.forEach(item => {
      const partes = formatearItem(item);
      resultado.push(...partes);
    });
    return resultado;
  };

  const quehacerProcesado = procesarItems(preparacion.quehacerAntes);
  const recursosProcesados = procesarItems(preparacion.recursosMateriales);

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
            <ul className="custom-list" style={{marginLeft: "0.8rem", fontSize: "9pt", lineHeight: "1.6"}}>
              {quehacerProcesado.map((item, idx) => (
                <li key={idx} style={{marginBottom: "0.3rem"}}>{item}</li>
              ))}
            </ul>
          </td>
          <td style={{verticalAlign: "top"}}>
            <ul className="custom-list" style={{marginLeft: "0.8rem", fontSize: "9pt", lineHeight: "1.6"}}>
              {recursosProcesados.map((recurso, idx) => (
                <li key={idx} style={{marginBottom: "0.3rem"}}>{recurso}</li>
              ))}
            </ul>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
