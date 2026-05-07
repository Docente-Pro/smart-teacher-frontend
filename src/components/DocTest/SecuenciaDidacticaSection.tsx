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
      <td colSpan={2} style={{ verticalAlign: "top", padding: "0.7rem 1rem", fontSize: "9pt", lineHeight: "1.6" }}>
        {/* ═══ Layout condicional: con o sin problemaMatematico (alineado con Premium) ═══ */}
        {proceso.problemaMatematico ? (
          <>
            {/* Título + Problema + Estrategias integrados en un solo bloque de texto */}
            {tieneImagenesJunto ? (
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", marginBottom: "0.8rem" }}>
                <div style={{ flex: 1, whiteSpace: "pre-wrap" }}>
                  {proceso.proceso && <strong>{proceso.proceso}: </strong>}
                  <div style={{ marginTop: "0.4rem" }}>
                    <strong>Planteamiento del problema: </strong>
                    <span>{parseMarkdown(proceso.problemaMatematico)}</span>
                  </div>
                  {proceso.estrategias && (
                    <div style={{ marginTop: "0.6rem" }}>
                      {parseMarkdown(proceso.estrategias)}
                    </div>
                  )}
                </div>
                <div style={{ flexShrink: 0, maxWidth: "40%", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {imgJunto.map((img: any, imgIdx: number) => (
                    <div key={img.id ?? imgIdx} style={{ textAlign: "center" }}>
                      <img src={img.url} alt={img.descripcion || ""} style={{ maxHeight: "300px", borderRadius: "8px" }} />
                      {img.texto_overlay && (
                        <div style={{ fontSize: "8pt", color: "#1e293b", marginTop: "0.3rem", padding: "0.4rem 0.6rem", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "4px", textAlign: "left", whiteSpace: "pre-wrap" }}>
                          {img.texto_overlay}
                        </div>
                      )}
                      {img.descripcion && (
                        <div style={{ fontSize: "7pt", color: "#64748b", marginTop: "0.2rem" }}>{img.descripcion}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: "0.8rem", whiteSpace: "pre-wrap" }}>
                {proceso.proceso && <strong>{proceso.proceso}: </strong>}
                <div style={{ marginTop: "0.4rem" }}>
                  <strong>Planteamiento del problema: </strong>
                  <span>{parseMarkdown(proceso.problemaMatematico)}</span>
                </div>
                {proceso.estrategias && (
                  <div style={{ marginTop: "0.6rem" }}>
                    {parseMarkdown(proceso.estrategias)}
                  </div>
                )}
              </div>
            )}

            {/* Imágenes */}
            {renderImagenesProceso(proceso, 'antes')}
            {renderImagenesProceso(proceso, 'despues')}

            {/* Gráfico del problema (debajo del texto) */}
            {(() => {
              const esOtrosProblemas = /otros\s+problemas/i.test(proceso.proceso || "");
              const esSocializacion = /socializaci[oó]n/i.test(proceso.proceso || "");
              const ocultarGrafico = esOtrosProblemas || esSocializacion;
              return !ocultarGrafico && (proceso.grafico || proceso.graficoProblema) ? (
                <div className="no-break" style={{
                  marginTop: "0.6rem", marginBottom: "0.6rem", padding: "0.6rem 0.8rem",
                  backgroundColor: "#f0f9ff", borderRadius: "8px", border: "1px solid #bae6fd",
                  textAlign: "center", overflow: "visible",
                }}>
                  <div style={{
                    maxWidth: esGraficoAnchoCompleto(proceso.grafico || proceso.graficoProblema) ? "100%" : 340,
                    width: "100%", margin: "0 auto", minWidth: 0,
                  }}>
                    <GraficoRenderer grafico={proceso.grafico || proceso.graficoProblema} />
                  </div>
                </div>
              ) : null;
            })()}

            {/* Fallback: Imagen del problema (legacy) */}
            {!proceso.grafico && !proceso.graficoProblema && proceso.imagenProblema && proceso.imagenProblema !== "GENERATE_IMAGE" && (
              <div style={{ textAlign: "center", marginBottom: "0.6rem" }}>
                <img src={proceso.imagenProblema} alt="Problema matemático" style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }} />
              </div>
            )}

            {/* Solución del problema */}
            {proceso.solucionProblema && (
              <div style={{
                marginTop: "0.6rem", marginBottom: "0.6rem", padding: "0.7rem 1rem",
                backgroundColor: "#f0fdf4", borderRadius: "8px", borderLeft: "4px solid #22c55e",
              }}>
                <p style={{ fontSize: "8pt", fontWeight: "bold", color: "#15803d", margin: "0 0 0.3rem 0" }}>✅ Solución:</p>
                <div style={{ whiteSpace: "pre-wrap", fontSize: "9pt", lineHeight: "1.6" }}>
                  {parseMarkdown(proceso.solucionProblema)}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* ═══ Layout sin problemaMatematico: orden original ═══ */}
            {renderImagenesProceso(proceso, 'antes')}

            {tieneImagenesJunto ? (
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", marginBottom: "0.8rem" }}>
                <div style={{ flex: 1 }}>
                  {proceso.estrategias ? (
                    <div style={{ whiteSpace: "pre-wrap" }}>
                      {proceso.proceso && <strong>{proceso.proceso}: </strong>}
                      {parseMarkdown(proceso.estrategias)}
                    </div>
                  ) : proceso.proceso ? (
                    <div><strong>{proceso.proceso}</strong></div>
                  ) : null}
                </div>
                <div style={{ flexShrink: 0, maxWidth: "40%", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {imgJunto.map((img: any, imgIdx: number) => (
                    <div key={img.id ?? imgIdx} style={{ textAlign: "center" }}>
                      <img src={img.url} alt={img.descripcion || ""} style={{ maxHeight: "300px", borderRadius: "8px" }} />
                      {img.texto_overlay && (
                        <div style={{ fontSize: "8pt", color: "#1e293b", marginTop: "0.3rem", padding: "0.4rem 0.6rem", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "4px", textAlign: "left", whiteSpace: "pre-wrap" }}>
                          {img.texto_overlay}
                        </div>
                      )}
                      {img.descripcion && (
                        <div style={{ fontSize: "7pt", color: "#64748b", marginTop: "0.2rem" }}>{img.descripcion}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              (proceso.estrategias || proceso.proceso) && (
                <div style={{ marginBottom: "0.8rem" }}>
                  {proceso.estrategias ? (
                    <>
                      {proceso.proceso && <strong>{proceso.proceso}: </strong>}
                      {parseMarkdown(proceso.estrategias)}
                    </>
                  ) : (
                    <strong>{proceso.proceso}</strong>
                  )}
                </div>
              )
            )}

            {renderImagenesProceso(proceso, 'despues')}

            {/* Gráfico standalone — oculto en socialización */}
            {proceso.grafico && !/socializaci[oó]n/i.test(proceso.proceso || "") && (
              <div className="no-break" style={{
                marginTop: "0.6rem", marginBottom: "0.6rem", padding: "0.6rem 0.8rem",
                background: "linear-gradient(to bottom, #f8fafc 0%, #f1f5f9 100%)",
                borderRadius: "8px", border: "1px solid #e2e8f0", textAlign: "center", overflow: "visible",
              }}>
                <div style={{
                  maxWidth: esGraficoAnchoCompleto(proceso.grafico) ? "100%" : 340,
                  width: "100%", margin: "0 auto", minWidth: 0,
                }}>
                  <GraficoRenderer grafico={proceso.grafico} />
                </div>
              </div>
            )}

            {/* Solución del problema */}
            {proceso.solucionProblema && (
              <div style={{
                marginTop: "0.6rem", marginBottom: "0.6rem", padding: "0.7rem 1rem",
                backgroundColor: "#f0fdf4", borderRadius: "8px", borderLeft: "4px solid #22c55e",
              }}>
                <p style={{ fontSize: "8pt", fontWeight: "bold", color: "#15803d", margin: "0 0 0.3rem 0" }}>✅ Solución:</p>
                <div style={{ whiteSpace: "pre-wrap", fontSize: "9pt", lineHeight: "1.6" }}>
                  {parseMarkdown(proceso.solucionProblema)}
                </div>
              </div>
            )}
          </>
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

        {/* Tiempo */}
        <div style={{ display: "flex", gap: "1rem", fontSize: "8pt", color: "#64748b" }}>
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
