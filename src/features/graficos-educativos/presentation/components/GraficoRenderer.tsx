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
import { PatronGeometrico } from './PatronGeometrico';
import { DiagramaVenn } from './DiagramaVenn';
import { TablaDobleEntrada } from './TablaDobleEntrada';
import { OperacionVertical } from './OperacionVertical';
import { MedidasComparacion } from './MedidasComparacion';
import { BalanzaEquilibrio } from './BalanzaEquilibrio';
import { NumerosOrdinales } from './NumerosOrdinales';
import { CoordenadasEjercicios } from './CoordenadasEjercicios';
import { ValorPosicional } from './ValorPosicional';
import { DescomposicionNumero } from './DescomposicionNumero';
import { Abaco } from './Abaco';
import { BaseDiezBloques } from './BaseDiezBloques';
import { Pictograma } from './Pictograma';
import { GraficoCircularComp } from './GraficoCircular';
import { GraficoLinealComp } from './GraficoLineal';
import { TablaFrecuencias } from './TablaFrecuencias';
import { RelojTiempo } from './RelojTiempo';
import { Calendario } from './Calendario';
import { Termometro } from './Termometro';
import { ConversionMedidas } from './ConversionMedidas';
import { ReglaMedicion } from './ReglaMedicion';
import { CajaFuncion } from './CajaFuncion';
import { ArbolFactores } from './ArbolFactores';
import { MultiplosTabla } from './MultiplosTabla';
import { PotenciasRaices } from './PotenciasRaices';
import { CuerposGeometricos } from './CuerposGeometricos';
import { Angulos } from './Angulos';
import { Simetria } from './Simetria';
import { RedesCuerpos } from './RedesCuerpos';
import { CambioMonedas } from './CambioMonedas';
import { RectaFraccion } from './RectaFraccion';
// Áreas curriculares (no-Matemática)
import {
  EstructuraNarrativa,
  OrganizadorKVL,
  PlanificadorEscritura,
  TablaObservacion,
  CicloProceso,
  ClasificacionDicotomica,
  LineaTiempo,
  CuadroComparativo,
  RuedaEmociones,
  FichaAutoconocimiento,
  TarjetaReflexion,
  TarjetaCompromiso,
  FichaAnalisisObra,
  FichaProcesoCreativo,
  SecuenciaMovimiento,
  TablaHabitos,
} from './areas';

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
    'patron_geometrico': PatronGeometrico,
    'diagrama_venn': DiagramaVenn,
    'tabla_doble_entrada': TablaDobleEntrada,
    'operacion_vertical': OperacionVertical,
    'medidas_comparacion': MedidasComparacion,
    'balanza_equilibrio': BalanzaEquilibrio,
    'numeros_ordinales': NumerosOrdinales,
    'coordenadas_ejercicios': CoordenadasEjercicios,
    'valor_posicional': ValorPosicional,
    'descomposicion_numero': DescomposicionNumero,
    'abaco': Abaco,
    'base_diez_bloques': BaseDiezBloques,
    'pictograma': Pictograma,
    'grafico_circular': GraficoCircularComp,
    'grafico_lineal': GraficoLinealComp,
    'tabla_frecuencias': TablaFrecuencias,
    'reloj_tiempo': RelojTiempo,
    'calendario': Calendario,
    'termometro': Termometro,
    'conversion_medidas': ConversionMedidas,
    'regla_medicion': ReglaMedicion,
    'caja_funcion': CajaFuncion,
    'arbol_factores': ArbolFactores,
    'multiplos_tabla': MultiplosTabla,
    'potencias_raices': PotenciasRaices,
    'cuerpos_geometricos': CuerposGeometricos,
    'angulos': Angulos,
    'simetria': Simetria,
    'redes_cuerpos': RedesCuerpos,
    'cambio_monedas': CambioMonedas,
    'recta_fraccion': RectaFraccion,
    // ===== Áreas curriculares (no-Matemática) =====
    'estructura_narrativa': EstructuraNarrativa,
    'organizador_kvl': OrganizadorKVL,
    'planificador_escritura': PlanificadorEscritura,
    'tabla_observacion': TablaObservacion,
    'ciclo_proceso': CicloProceso,
    'clasificacion_dicotomica': ClasificacionDicotomica,
    'linea_tiempo': LineaTiempo,
    'cuadro_comparativo': CuadroComparativo,
    'rueda_emociones': RuedaEmociones,
    'ficha_autoconocimiento': FichaAutoconocimiento,
    'tarjeta_reflexion': TarjetaReflexion,
    'tarjeta_compromiso': TarjetaCompromiso,
    'ficha_analisis_obra': FichaAnalisisObra,
    'ficha_proceso_creativo': FichaProcesoCreativo,
    'secuencia_movimiento': SecuenciaMovimiento,
    'tabla_habitos': TablaHabitos,
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
