/**
 * Ejemplo de integración del feature de Gráficos Educativos
 * en un componente de proceso pedagógico
 */

import React from 'react';
import { GraficoRenderer, useGraficosEducativos } from '@/features/graficos-educativos';

interface ProcesoPedagogico {
  proceso: string;
  estrategias: string;
  problemaMatematico?: string;
  graficoProblema?: any;
  solucionProblema?: string;
  graficoSolucion?: any;
  recursosDidacticos: string;
  tiempo: string;
}

interface Props {
  proceso: ProcesoPedagogico;
}

/**
 * Componente que muestra un proceso pedagógico con gráficos educativos
 */
export const ProcesoPedagogicoConGraficos: React.FC<Props> = ({ proceso }) => {
  const { transformarDesdeBackend, validarGrafico, error } = useGraficosEducativos();

  // Transformar gráficos del backend
  const graficoProblema = proceso.graficoProblema 
    ? transformarDesdeBackend(proceso.graficoProblema)
    : null;
  
  const graficoSolucion = proceso.graficoSolucion
    ? transformarDesdeBackend(proceso.graficoSolucion)
    : null;

  // Validar gráficos
  const validacionProblema = graficoProblema ? validarGrafico(graficoProblema) : null;
  const validacionSolucion = graficoSolucion ? validarGrafico(graficoSolucion) : null;

  return (
    <div className="proceso-pedagogico">
      <h3 className="proceso-titulo">{proceso.proceso}</h3>
      
      <div className="proceso-estrategias">
        <h4>📚 Estrategias:</h4>
        <p>{proceso.estrategias}</p>
      </div>

      {/* Sección del Problema */}
      {proceso.problemaMatematico && (
        <div className="problema-matematico">
          <h4>📝 Problema:</h4>
          <p className="texto-problema">{proceso.problemaMatematico}</p>
          
          {/* Renderizar gráfico del problema */}
          {graficoProblema && validacionProblema?.esValido && (
            <GraficoRenderer 
              grafico={graficoProblema}
              className="grafico-problema"
            />
          )}
          
          {/* Mostrar error si el gráfico no es válido */}
          {graficoProblema && !validacionProblema?.esValido && (
            <div className="alerta-error">
              ⚠️ No se pudo cargar el gráfico del problema
            </div>
          )}
        </div>
      )}

      {/* Sección de la Solución (Colapsible) */}
      {proceso.solucionProblema && (
        <details className="solucion-collapsible">
          <summary className="solucion-trigger">
            👁️ Ver solución
          </summary>
          
          <div className="solucion-contenido">
            <pre className="texto-solucion">{proceso.solucionProblema}</pre>
            
            {/* Renderizar gráfico de la solución */}
            {graficoSolucion && validacionSolucion?.esValido && (
              <GraficoRenderer 
                grafico={graficoSolucion}
                className="grafico-solucion"
              />
            )}
          </div>
        </details>
      )}

      {/* Recursos y Tiempo */}
      <div className="proceso-footer">
        <div className="recursos">
          <strong>🎨 Recursos:</strong> {proceso.recursosDidacticos}
        </div>
        <div className="tiempo">
          <strong>⏱️ Tiempo:</strong> {proceso.tiempo}
        </div>
      </div>

      {/* Mostrar errores generales */}
      {error && (
        <div className="error-general">
          ⚠️ Error: {error}
        </div>
      )}
    </div>
  );
};

/**
 * Ejemplo de uso con múltiples procesos
 */
interface SesionAprendizajeProps {
  procesos: ProcesoPedagogico[];
}

export const SesionAprendizajeConGraficos: React.FC<SesionAprendizajeProps> = ({ procesos }) => {
  return (
    <div className="sesion-aprendizaje">
      <h2>Sesión de Aprendizaje</h2>
      
      <div className="procesos-lista">
        {procesos.map((proceso, idx) => (
          <ProcesoPedagogicoConGraficos 
            key={idx} 
            proceso={proceso} 
          />
        ))}
      </div>
    </div>
  );
};
