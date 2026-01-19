import React from 'react';
import { ConfiguracionGrafico } from '../../domain/types';
import { ValidarGraficoUseCase, ObtenerTipoGraficoUseCase } from '../../application/use-cases';
import { EcuacionCajas } from './EcuacionCajas';
import { TablaPrecios } from './TablaPrecios';
import { BarrasComparacion } from './BarrasComparacion';
import { TablaValores } from './TablaValores';
import { BloqueAgrupados } from './BloqueAgrupados';
import { RectaNumerica } from './RectaNumerica';
import { CirculosFraccion } from './CirculosFraccion';
import { BarrasFraccion } from './BarrasFraccion';
import { DiagramaDinero } from './DiagramaDinero';
import { FigurasGeometricas } from './FigurasGeometricas';
import { PatronVisual } from './PatronVisual';
import { DiagramaVenn } from './DiagramaVenn';
import { TablaDobleEntrada } from './TablaDobleEntrada';
import { OperacionVertical } from './OperacionVertical';
import { MedidasComparacion } from './MedidasComparacion';
import { BalanzaEquilibrio } from './BalanzaEquilibrio';

interface Props {
  grafico: ConfiguracionGrafico | null | undefined;
  className?: string;
  mostrarErrores?: boolean;
}

/**
 * Componente principal que renderiza cualquier tipo de gráfico educativo
 * Actúa como selector/dispatcher según el tipo de gráfico
 */
export const GraficoRenderer: React.FC<Props> = ({ 
  grafico, 
  className = '',
  mostrarErrores = true 
}) => {
  const validarGraficoUseCase = new ValidarGraficoUseCase();
  const obtenerTipoGraficoUseCase = new ObtenerTipoGraficoUseCase();

  // Validar gráfico
  const validacion = validarGraficoUseCase.execute(grafico);

  if (!validacion.esValido) {
    if (!mostrarErrores) return null;
    
    return (
      <div className="grafico-educativo-error">
        <div className="error-mensaje">
          ⚠️ Error al cargar el gráfico
        </div>
        {validacion.errores.map((error, idx) => (
          <p key={idx} className="error-detalle">{error}</p>
        ))}
      </div>
    );
  }

  // Mapear tipos a componentes
  const componentMap: Record<string, React.ComponentType<any>> = {
    'ecuacion_cajas': EcuacionCajas,
    'tabla_precios': TablaPrecios,
    'barras_comparacion': BarrasComparacion,
    'tabla_valores': TablaValores,
    'bloques_agrupados': BloqueAgrupados,
    'recta_numerica': RectaNumerica,
    'circulos_fraccion': CirculosFraccion,
    'barras_fraccion': BarrasFraccion,
    'diagrama_dinero': DiagramaDinero,
    'figuras_geometricas': FigurasGeometricas,
    'patron_visual': PatronVisual,
    'diagrama_venn': DiagramaVenn,
    'tabla_doble_entrada': TablaDobleEntrada,
    'operacion_vertical': OperacionVertical,
    'medidas_comparacion': MedidasComparacion,
    'balanza_equilibrio': BalanzaEquilibrio,
  };

  const Component = componentMap[grafico!.tipoGrafico];

  if (!Component) {
    if (!mostrarErrores) return null;
    
    return (
      <div className="grafico-educativo-no-soportado">
        <p className="mensaje-no-soportado">
          📊 Gráfico "{grafico!.tipoGrafico}" no implementado aún
        </p>
        <p className="sugerencia">
          Los tipos soportados son: {obtenerTipoGraficoUseCase.obtenerTiposSoportados().slice(0, 5).join(', ')}...
        </p>
      </div>
    );
  }

  return (
    <div className={`grafico-educativo ${className}`}>
      {grafico!.titulo && (
        <h4 className="grafico-titulo">{grafico!.titulo}</h4>
      )}
      {grafico!.descripcion && (
        <p className="grafico-descripcion">{grafico!.descripcion}</p>
      )}
      <Component data={grafico} />
    </div>
  );
};
