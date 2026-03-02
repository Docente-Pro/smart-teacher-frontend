import { ISecuenciaDidactica } from "@/interfaces/ISesionAprendizaje";
import { GraficoRenderer } from "@/features/graficos-educativos/presentation/components/GraficoRenderer";
import { parseMarkdown } from "@/utils/parseMarkdown";

/** Tipos de gráficos que son tablas y necesitan ancho completo */
const GRAFICOS_TABLA = [
  'tabla_doble_entrada',
  'tabla_precios',
  'tabla_valores',
  'tabla_observacion',
  'tabla_frecuencias',
  'tabla_habitos',
  'cuadro_comparativo',
  'linea_tiempo',
  'organizador_kvl',
  'planificador_escritura',
  'estructura_narrativa',
  'ficha_autoconocimiento',
  'clasificacion_dicotomica',
];

/** Determina si un gráfico necesita ancho completo (tablas, organizadores, etc.) */
function esGraficoAnchoCompleto(grafico: Record<string, unknown> | null | undefined): boolean {
  if (!grafico || !grafico.tipoGrafico) return false;
  return GRAFICOS_TABLA.includes(grafico.tipoGrafico as string);
}

interface SecuenciaDidacticaSectionProps {
  secuencia: ISecuenciaDidactica;
  /** Color de fondo para cabeceras de sección. Default: #E8F5E9 */
  sectionColor?: string;
}

/**
 * Normaliza imágenes: soporta imagen singular (v2), imagenes array (v1)
 * e imagenContenido (contenido didáctico: tabla, gráfico, mapa, etc.).
 * imagenContenido se añade al final con su posicion (default: "debajo").
 */
function normalizarImagenes(proceso: any) {
  const base = proceso.imagenes ?? (proceso.imagen ? [proceso.imagen] : []);
  if (proceso.imagenContenido?.url) {
    return [
      ...base,
      {
        ...proceso.imagenContenido,
        posicion: proceso.imagenContenido.posicion || "debajo",
      },
    ];
  }
  return base;
}

/**
 * Renderiza las imágenes de un proceso según su posición.
 * Usa "despues" como fallback si la imagen no tiene posicion definida.
 */
function renderImagenesProceso(proceso: any, posicion: 'antes' | 'despues' | 'junto') {
  const allImagenes = normalizarImagenes(proceso);
  const imagenes = posicion === 'despues'
    ? allImagenes.filter((img: any) => img.posicion === 'despues' || img.posicion === 'debajo' || (!img.posicion && img.posicion !== 'antes' && img.posicion !== 'junto'))
    : allImagenes.filter((img: any) => img.posicion === posicion);
  if (!imagenes || imagenes.length === 0) return null;

  return (
    <div style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "0.75rem",
      justifyContent: "center",
      ...(posicion === 'antes' ? { marginBottom: "0.8rem" } : {}),
      ...(posicion === 'despues' ? { marginTop: "0.8rem" } : {}),
    }}>
      {imagenes.map((img: any, imgIdx: number) => (
        <div key={img.id ?? imgIdx} style={{ display: "inline-block", textAlign: "center" }}>
          <img
            src={img.url}
            alt={img.descripcion || ""}
            style={{ maxHeight: "300px", borderRadius: "8px" }}
          />
          {img.texto_overlay && (
            <div style={{ fontSize: "8pt", color: "#1e293b", marginTop: "0.3rem", padding: "0.4rem 0.6rem", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "4px", textAlign: "left", whiteSpace: "pre-wrap" }}>
              {img.texto_overlay}
            </div>
          )}
          {img.descripcion && (
            <div style={{ fontSize: "7pt", color: "#64748b", marginTop: "0.2rem" }}>
              {img.descripcion}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Renderiza una fila de proceso (reutilizado para Inicio, Desarrollo y Cierre)
 */
function renderProcesoRow(proceso: any, idx: number) {
  const allImagenes = normalizarImagenes(proceso);
  const imgJunto = allImagenes.filter((img: any) => img.posicion === 'junto');
  const tieneImagenesJunto = imgJunto.length > 0;

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
                  <strong>Estrategias:</strong> {parseMarkdown(proceso.estrategias)}
                </div>
              )}
            </div>
            <div style={{ flexShrink: 0, maxWidth: "40%", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {imgJunto.map((img: any, imgIdx: number) => (
                <div key={img.id ?? imgIdx} style={{ textAlign: "center" }}>
                  <img
                    src={img.url}
                    alt={img.descripcion || ""}
                    style={{ maxHeight: "300px", borderRadius: "8px" }}
                  />
                  {img.texto_overlay && (
                    <div style={{ fontSize: "8pt", color: "#1e293b", marginTop: "0.3rem", padding: "0.4rem 0.6rem", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "4px", textAlign: "left", whiteSpace: "pre-wrap" }}>
                      {img.texto_overlay}
                    </div>
                  )}
                  {img.descripcion && (
                    <div style={{ fontSize: "7pt", color: "#64748b", marginTop: "0.2rem" }}>
                      {img.descripcion}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          proceso.estrategias && (
            <div style={{ marginBottom: "0.8rem" }}>
              <strong>Estrategias:</strong> {parseMarkdown(proceso.estrategias)}
            </div>
          )
        )}

        {/* 🖼️ Imágenes posición "despues" */}
        {renderImagenesProceso(proceso, 'despues')}

        {/* Gráfico del problema (con problemaMatematico) */}
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
            <div style={{ 
              maxWidth: esGraficoAnchoCompleto(proceso.grafico || proceso.graficoProblema) ? "100%" : 420, 
              width: "100%", 
              margin: "0 auto 0.8rem" 
            }}>
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
          </div>
        )}

        {/* Gráfico standalone (sin problemaMatematico) — Math o Área */}
        {proceso.grafico && !proceso.problemaMatematico && (
          <div style={{
            marginTop: "0.8rem",
            marginBottom: "0.8rem",
            padding: "0.8rem",
            backgroundColor: "#fafafa",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}>
            <GraficoRenderer grafico={proceso.grafico} />
          </div>
        )}

        {/* Gráfico de la operación — siempre que exista */}
        {proceso.graficoOperacion && (
          <div style={{
            marginTop: "1rem",
            marginBottom: "1rem",
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
              🔢 Operación / Recurso:
            </p>
            <div style={{ display: "flex", justifyContent: "center", marginTop: "0.5rem" }}>
              <div style={{ 
                maxWidth: esGraficoAnchoCompleto(proceso.graficoOperacion) ? "100%" : 420, 
                width: "100%" 
              }}>
                <GraficoRenderer grafico={proceso.graficoOperacion} />
              </div>
            </div>
          </div>
        )}

        {/* Fallback: Imagen del problema (legacy) */}
        {proceso.problemaMatematico && !proceso.grafico && !proceso.graficoProblema && proceso.imagenProblema && proceso.imagenProblema !== "GENERATE_IMAGE" && (
          <div style={{ marginBottom: "1rem", marginTop: "1rem" }}>
            <div style={{ textAlign: "center", marginBottom: "0.8rem" }}>
              <img
                src={proceso.imagenProblema}
                alt="Problema matemático"
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

        {/* Respuestas del docente (transversal — todas las áreas) */}
        {proceso.respuestasDocente && proceso.respuestasDocente.length > 0 && (
          <div style={{
            marginTop: "0.8rem",
            marginBottom: "0.8rem",
            backgroundColor: "#fffbeb",
            padding: "0.8rem 1rem",
            borderRadius: "8px",
            borderLeft: "4px solid #f59e0b",
          }}>
            <p style={{ fontSize: "9pt", fontWeight: "bold", color: "#92400e", marginBottom: "0.5rem", margin: 0 }}>
              📋 Respuestas para el docente:
            </p>
            {proceso.respuestasDocente.map((r: { pregunta: string; respuestaEsperada: string }, idx: number) => (
              <div key={idx} style={{ marginTop: "0.5rem", fontSize: "8.5pt", lineHeight: "1.5" }}>
                <p style={{ margin: 0, fontWeight: "600", color: "#78350f" }}>
                  {idx + 1}. {r.pregunta}
                </p>
                <p style={{ margin: "0.15rem 0 0 0.8rem", color: "#065f46", fontStyle: "italic" }}>
                  → {r.respuestaEsperada}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Recursos didácticos y tiempo */}
        <div style={{ display: "flex", gap: "1rem", fontSize: "8pt", color: "#64748b" }}>
          {(proceso.recursos || proceso.recursosDidacticos) && (
            <div><strong>Recursos:</strong> {proceso.recursos || proceso.recursosDidacticos}</div>
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
