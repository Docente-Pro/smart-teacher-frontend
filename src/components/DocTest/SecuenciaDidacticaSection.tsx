import { ISecuenciaDidactica } from "@/interfaces/ISesionAprendizaje";
import { GraficoRenderer } from "@/features/graficos-educativos/presentation/components/GraficoRenderer";

interface SecuenciaDidacticaSectionProps {
  secuencia: ISecuenciaDidactica;
  /** Color de fondo para cabeceras de sección. Default: #E8F5E9 */
  sectionColor?: string;
}

/**
 * Renderiza las imágenes SVG de un proceso según su posición
 */
function renderImagenesProceso(proceso: any, posicion: 'antes' | 'despues' | 'junto') {
  const imagenes = proceso.imagenes?.filter((img: any) => img.posicion === posicion);
  if (!imagenes || imagenes.length === 0) return null;

  return (
    <div style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "0.75rem",
      ...(posicion === 'antes' ? { marginBottom: "0.8rem" } : {}),
      ...(posicion === 'despues' ? { marginTop: "0.8rem" } : {}),
    }}>
      {imagenes.map((img: any) => (
        <div key={img.id} style={{
          textAlign: "center",
          padding: "0.4rem",
          backgroundColor: "#f0f9ff",
          border: "1px solid #bae6fd",
          borderRadius: "8px",
        }}>
          <img
            src={img.url}
            alt={img.descripcion}
            crossOrigin="anonymous"
            style={{ maxHeight: "120px", borderRadius: "4px" }}
          />
          <p style={{ fontSize: "7pt", color: "#0284c7", margin: "0.25rem 0 0" }}>
            {img.descripcion}
          </p>
        </div>
      ))}
    </div>
  );
}

/**
 * Renderiza una fila de proceso (reutilizado para Inicio, Desarrollo y Cierre)
 */
function renderProcesoRow(proceso: any, idx: number) {
  const tieneImagenesJunto = proceso.imagenes?.some((img: any) => img.posicion === 'junto');

  return (
    <tr key={idx}>
      <td style={{ fontSize: "9pt", padding: "0.8rem", lineHeight: "1.6" }}>
        {/* Título del proceso */}
        {proceso.proceso && (
          <div style={{
            fontSize: "10pt",
            fontWeight: "bold",
            marginBottom: "0.8rem",
            color: "#1e293b"
          }}>
            {proceso.proceso}
          </div>
        )}

        {/* 🖼️ Imágenes posición "antes" */}
        {renderImagenesProceso(proceso, 'antes')}

        {/* Estrategias — con o sin imágenes "junto" */}
        {tieneImagenesJunto ? (
          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", marginBottom: "0.8rem" }}>
            <div style={{ flex: 1 }}>
              {proceso.estrategias && (
                <div>
                  <strong>Estrategias:</strong> {proceso.estrategias}
                </div>
              )}
            </div>
            <div style={{ flexShrink: 0, maxWidth: "40%", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {proceso.imagenes
                ?.filter((img: any) => img.posicion === 'junto')
                .map((img: any) => (
                  <div key={img.id} style={{
                    textAlign: "center",
                    padding: "0.4rem",
                    backgroundColor: "#f0f9ff",
                    border: "1px solid #bae6fd",
                    borderRadius: "8px",
                  }}>
                    <img
                      src={img.url}
                      alt={img.descripcion}
                      crossOrigin="anonymous"
                      style={{ maxHeight: "100px", borderRadius: "4px" }}
                    />
                    <p style={{ fontSize: "7pt", color: "#0284c7", margin: "0.25rem 0 0" }}>
                      {img.descripcion}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          proceso.estrategias && (
            <div style={{ marginBottom: "0.8rem" }}>
              <strong>Estrategias:</strong> {proceso.estrategias}
            </div>
          )
        )}

        {/* 🖼️ Imágenes posición "despues" */}
        {renderImagenesProceso(proceso, 'despues')}

        {/* Gráfico del problema (Rough.js) - solo si existe */}
        {proceso.problemaMatematico && (proceso.grafico || proceso.graficoProblema) && (
          <div style={{ marginBottom: "1rem", marginTop: "1rem" }}>
            <div style={{
              padding: "0.5rem",
              backgroundColor: "#f0f9ff",
              borderRadius: "4px",
              marginBottom: "0.5rem",
              fontWeight: "bold"
            }}>
              📝 Problema Matemático:
            </div>
            <div style={{ textAlign: "center", marginBottom: "0.8rem" }}>
              <GraficoRenderer grafico={proceso.grafico || proceso.graficoProblema} />
            </div>
            <div style={{
              padding: "1rem",
              backgroundColor: "#f0f9ff",
              borderRadius: "8px",
              borderLeft: "4px solid #0284c7",
              marginBottom: "1rem"
            }}>
              <p style={{ margin: 0, fontSize: "10pt", lineHeight: "1.6" }}>
                {proceso.problemaMatematico}
              </p>
            </div>

            {/* Gráfico de la operación */}
            {proceso.graficoOperacion && (
              <div style={{
                marginTop: "1rem",
                backgroundColor: "#faf5ff",
                padding: "1rem",
                borderRadius: "8px",
                border: "2px solid #d8b4fe",
                overflowX: "auto"
              }}>
                <p style={{
                  fontSize: "9pt",
                  fontWeight: "bold",
                  color: "#7c3aed",
                  marginBottom: "0.5rem",
                  margin: 0
                }}>
                  🔢 Operación Matemática:
                </p>
                <div style={{ display: "flex", justifyContent: "center", marginTop: "0.5rem" }}>
                  <GraficoRenderer grafico={proceso.graficoOperacion} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fallback: Imagen del problema (legacy) */}
        {proceso.problemaMatematico && !proceso.grafico && !proceso.graficoProblema && proceso.imagenProblema && proceso.imagenProblema !== "GENERATE_IMAGE" && (
          <div style={{ marginBottom: "1rem", marginTop: "1rem" }}>
            <div style={{ textAlign: "center", marginBottom: "0.8rem" }}>
              <img
                src={proceso.imagenProblema}
                alt="Problema matemático"
                crossOrigin="anonymous"
                style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }}
              />
            </div>
            <div style={{
              padding: "1rem",
              backgroundColor: "#f0f9ff",
              borderRadius: "8px",
              borderLeft: "4px solid #0284c7",
              marginBottom: "1rem"
            }}>
              <p style={{ margin: 0, fontSize: "10pt", lineHeight: "1.6" }}>
                {proceso.problemaMatematico}
              </p>
            </div>
          </div>
        )}

        {/* Gráfico de la solución (Rough.js) */}
        {proceso.solucionProblema && proceso.graficoSolucion && (
          <div style={{ marginBottom: "1rem" }}>
            <div style={{
              padding: "0.5rem",
              backgroundColor: "#f0fdf4",
              borderRadius: "4px",
              marginBottom: "0.5rem",
              fontWeight: "bold"
            }}>
              ✅ Solución:
            </div>
            <div style={{ textAlign: "center", marginBottom: "0.8rem" }}>
              <GraficoRenderer grafico={proceso.graficoSolucion} />
            </div>
          </div>
        )}

        {/* Fallback: Imagen de la solución (legacy) */}
        {proceso.solucionProblema && !proceso.graficoSolucion && proceso.imagenSolucion && proceso.imagenSolucion !== "GENERATE_IMAGE" && (
          <div style={{ textAlign: "center", marginBottom: "0.8rem" }}>
            <img
              src={proceso.imagenSolucion}
              alt="Solución del problema"
              crossOrigin="anonymous"
              style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }}
            />
          </div>
        )}

        {/* Texto de la solución */}
        {proceso.solucionProblema && (
          <div style={{
            padding: "1rem",
            backgroundColor: "#f0fdf4",
            borderRadius: "8px",
            borderLeft: "4px solid #16a34a",
            marginBottom: "0.8rem"
          }}>
            <div style={{ whiteSpace: "pre-wrap", fontSize: "9pt", lineHeight: "1.6" }}>
              {proceso.solucionProblema}
            </div>
          </div>
        )}

        {/* Recursos didácticos y tiempo */}
        <div style={{ display: "flex", gap: "1rem", fontSize: "8pt", color: "#64748b" }}>
          {proceso.recursosDidacticos && (
            <div><strong>Recursos:</strong> {proceso.recursosDidacticos}</div>
          )}
          {proceso.tiempo && (
            <div><strong>Tiempo:</strong> {proceso.tiempo}</div>
          )}
        </div>
      </td>
    </tr>
  );
}

/**
 * Componente: SecuenciaDidacticaSection
 *
 * Renderiza la tabla de Momentos y Tiempos de la Sesión estilo MINEDU.
 *
 * @param secuencia - Objeto completo con todas las fases de la secuencia didáctica
 */
export function SecuenciaDidacticaSection({ secuencia, sectionColor = "#E8F5E9" }: SecuenciaDidacticaSectionProps) {
  return (
    <>
      {/* Momentos y Tiempos de la Sesión */}
      <table style={{ marginBottom: "0.5rem" }}>
        <tbody>
          <tr>
            <td colSpan={2} style={{ backgroundColor: sectionColor, fontWeight: "bold", textAlign: "center" }}>
              MOMENTOS Y TIEMPOS DE LA SESIÓN
            </td>
          </tr>

          {/* INICIO */}
          <tr>
            <td colSpan={2} style={{ backgroundColor: sectionColor, fontWeight: "bold" }}>
              INICIO - Tiempo aproximado: {secuencia.inicio.tiempo || "15 minutos"}
            </td>
          </tr>
          {secuencia.inicio.procesos?.map((proceso: any, idx) => renderProcesoRow(proceso, idx))}

          {/* DESARROLLO */}
          <tr>
            <td colSpan={2} style={{ backgroundColor: sectionColor, fontWeight: "bold" }}>
              DESARROLLO - Tiempo aproximado: {secuencia.desarrollo.tiempo || "60 minutos"}
            </td>
          </tr>
          {secuencia.desarrollo.procesos?.map((proceso: any, idx) => renderProcesoRow(proceso, idx))}

          {/* CIERRE */}
          <tr>
            <td colSpan={2} style={{ backgroundColor: sectionColor, fontWeight: "bold" }}>
              CIERRE - Tiempo aproximado: {secuencia.cierre.tiempo || "15 minutos"}
            </td>
          </tr>
          {secuencia.cierre.procesos?.map((proceso: any, idx) => renderProcesoRow(proceso, idx))}
        </tbody>
      </table>
    </>
  );
}
