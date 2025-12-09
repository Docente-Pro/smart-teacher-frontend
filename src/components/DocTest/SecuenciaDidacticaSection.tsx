import { ISecuenciaDidactica } from "@/interfaces/ISesionAprendizaje";

interface SecuenciaDidacticaSectionProps {
  secuencia: ISecuenciaDidactica;
}

/**
 * Componente: SecuenciaDidacticaSection
 *
 * Renderiza la tabla de Momentos y Tiempos de la Sesión estilo MINEDU.
 *
 * @param secuencia - Objeto completo con todas las fases de la secuencia didáctica
 */
export function SecuenciaDidacticaSection({ secuencia }: SecuenciaDidacticaSectionProps) {
  // Función para formatear texto con numeración/bullets
  const formatearTexto = (texto: string): string => {
    if (!texto) return "";
    
    // Detectar patrones de numeración: 1) 2) 3) o 1. 2. 3.
    let textoFormateado = texto.replace(/(\d+\))/g, '\n$1');
    textoFormateado = textoFormateado.replace(/(\d+\.)/g, '\n$1');
    
    // Detectar bullets: • - *
    textoFormateado = textoFormateado.replace(/(•)/g, '\n$1');
    textoFormateado = textoFormateado.replace(/(-\s)/g, '\n$1');
    
    // Limpiar el primer salto de línea si existe
    return textoFormateado.trim();
  };

  return (
    <>
      {/* Momentos y Tiempos de la Sesión */}
      <table style={{ marginBottom: "0.5rem" }}>
        <tbody>
          <tr>
            <td colSpan={2} style={{ backgroundColor: "#E8F5E9", fontWeight: "bold", textAlign: "center" }}>
              MOMENTOS Y TIEMPOS DE LA SESIÓN
            </td>
          </tr>

          {/* INICIO */}
          <tr>
            <td colSpan={2} style={{ backgroundColor: "#E8F5E9", fontWeight: "bold" }}>
              INICIO - Tiempo aproximado: {secuencia.inicio.tiempo || "15 minutos"}
            </td>
          </tr>
          {secuencia.inicio.procesos?.map((proceso, idx) => (
            <tr key={idx}>
              <td colSpan={2} style={{ fontSize: "9pt", padding: "0.8rem", lineHeight: "1.6" }}>
                <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>{proceso.proceso}</p>
                <div style={{ marginBottom: "0.5rem", marginLeft: "0.5rem" }}>
                  <strong>Estrategias:</strong>
                  <div style={{ whiteSpace: "pre-wrap", marginTop: "0.2rem" }}>{formatearTexto(proceso.estrategias)}</div>
                </div>
                {proceso.recursosDidacticos && (
                  <div style={{ marginBottom: "0.5rem", marginLeft: "0.5rem" }}>
                    <strong>Recursos:</strong>
                    <div style={{ whiteSpace: "pre-wrap", marginTop: "0.2rem" }}>{formatearTexto(proceso.recursosDidacticos)}</div>
                  </div>
                )}
                {proceso.tiempo && (
                  <p style={{ marginLeft: "0.5rem" }}>
                    <strong>Tiempo:</strong> {proceso.tiempo}
                  </p>
                )}
              </td>
            </tr>
          ))}

          {/* DESARROLLO */}
          <tr>
            <td colSpan={2} style={{ backgroundColor: "#E8F5E9", fontWeight: "bold" }}>
              DESARROLLO - Tiempo aproximado: {secuencia.desarrollo.tiempo || "60 minutos"}
            </td>
          </tr>
          {secuencia.desarrollo.procesos?.map((proceso, idx) => (
            <tr key={idx}>
              <td colSpan={2} style={{ fontSize: "9pt", padding: "0.8rem", lineHeight: "1.6" }}>
                <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>{proceso.proceso}</p>
                <div style={{ marginBottom: "0.5rem", marginLeft: "0.5rem" }}>
                  <strong>Estrategias:</strong>
                  <div style={{ whiteSpace: "pre-wrap", marginTop: "0.2rem" }}>{formatearTexto(proceso.estrategias)}</div>
                </div>
                {proceso.recursosDidacticos && (
                  <div style={{ marginBottom: "0.5rem", marginLeft: "0.5rem" }}>
                    <strong>Recursos:</strong>
                    <div style={{ whiteSpace: "pre-wrap", marginTop: "0.2rem" }}>{formatearTexto(proceso.recursosDidacticos)}</div>
                  </div>
                )}
                {proceso.tiempo && (
                  <p style={{ marginLeft: "0.5rem" }}>
                    <strong>Tiempo:</strong> {proceso.tiempo}
                  </p>
                )}
              </td>
            </tr>
          ))}

          {/* CIERRE */}
          <tr>
            <td colSpan={2} style={{ backgroundColor: "#E8F5E9", fontWeight: "bold" }}>
              CIERRE - Tiempo aproximado: {secuencia.cierre.tiempo || "15 minutos"}
            </td>
          </tr>
          {secuencia.cierre.procesos?.map((proceso, idx) => (
            <tr key={idx}>
              <td colSpan={2} style={{ fontSize: "9pt", padding: "0.8rem", lineHeight: "1.6" }}>
                <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>{proceso.proceso}</p>
                <div style={{ marginBottom: "0.5rem", marginLeft: "0.5rem" }}>
                  <strong>Estrategias:</strong>
                  <div style={{ whiteSpace: "pre-wrap", marginTop: "0.2rem" }}>{formatearTexto(proceso.estrategias)}</div>
                </div>
                {proceso.recursosDidacticos && (
                  <div style={{ marginBottom: "0.5rem", marginLeft: "0.5rem" }}>
                    <strong>Recursos:</strong>
                    <div style={{ whiteSpace: "pre-wrap", marginTop: "0.2rem" }}>{formatearTexto(proceso.recursosDidacticos)}</div>
                  </div>
                )}
                {proceso.tiempo && (
                  <p style={{ marginLeft: "0.5rem" }}>
                    <strong>Tiempo:</strong> {proceso.tiempo}
                  </p>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
