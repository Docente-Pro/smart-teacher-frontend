import React from 'react';
import type { ConfiguracionGraficoArea } from '../../../domain/types/graficos-areas.types';
import { TipoGraficoAreas } from '../../../domain/types/graficos-areas.types';

// Importaciones directas para evitar dependencia circular con ./index
import { EstructuraNarrativa } from './EstructuraNarrativa';
import { OrganizadorKVL } from './OrganizadorKVL';
import { PlanificadorEscritura } from './PlanificadorEscritura';
import { TablaObservacion } from './TablaObservacion';
import { CicloProceso } from './CicloProceso';
import { ClasificacionDicotomica } from './ClasificacionDicotomica';
import { LineaTiempo } from './LineaTiempo';
import { CuadroComparativo } from './CuadroComparativo';
import { RuedaEmociones } from './RuedaEmociones';
import { FichaAutoconocimiento } from './FichaAutoconocimiento';
import { TarjetaReflexion } from './TarjetaReflexion';
import { TarjetaCompromiso } from './TarjetaCompromiso';
import { FichaAnalisisObra } from './FichaAnalisisObra';
import { FichaProcesoCreativo } from './FichaProcesoCreativo';
import { SecuenciaMovimiento } from './SecuenciaMovimiento';
import { TablaHabitos } from './TablaHabitos';

interface Props {
  grafico: ConfiguracionGraficoArea | null | undefined;
  className?: string;
  mostrarErrores?: boolean;
}

/**
 * Mapeo de `tipoGrafico` → componente React.
 * Análogo al `GraficoRenderer` de Matemática, pero para las demás áreas curriculares.
 */
const componentMap: Record<string, React.ComponentType<{ data: any }>> = {
  // Comunicación
  [TipoGraficoAreas.ESTRUCTURA_NARRATIVA]: EstructuraNarrativa,
  [TipoGraficoAreas.ORGANIZADOR_KVL]: OrganizadorKVL,
  [TipoGraficoAreas.PLANIFICADOR_ESCRITURA]: PlanificadorEscritura,
  // Ciencia y Tecnología
  [TipoGraficoAreas.TABLA_OBSERVACION]: TablaObservacion,
  [TipoGraficoAreas.CICLO_PROCESO]: CicloProceso,
  [TipoGraficoAreas.CLASIFICACION_DICOTOMICA]: ClasificacionDicotomica,
  // Personal Social
  [TipoGraficoAreas.LINEA_TIEMPO]: LineaTiempo,
  [TipoGraficoAreas.CUADRO_COMPARATIVO]: CuadroComparativo,
  [TipoGraficoAreas.RUEDA_EMOCIONES]: RuedaEmociones,
  [TipoGraficoAreas.FICHA_AUTOCONOCIMIENTO]: FichaAutoconocimiento,
  // Educación Religiosa
  [TipoGraficoAreas.TARJETA_REFLEXION]: TarjetaReflexion,
  [TipoGraficoAreas.TARJETA_COMPROMISO]: TarjetaCompromiso,
  // Arte y Cultura
  [TipoGraficoAreas.FICHA_ANALISIS_OBRA]: FichaAnalisisObra,
  [TipoGraficoAreas.FICHA_PROCESO_CREATIVO]: FichaProcesoCreativo,
  // Educación Física
  [TipoGraficoAreas.SECUENCIA_MOVIMIENTO]: SecuenciaMovimiento,
  [TipoGraficoAreas.TABLA_HABITOS]: TablaHabitos,
};

/** Lista pública de tipos soportados */
export const tiposGraficoAreaSoportados = Object.keys(componentMap);

/**
 * Renderer principal para gráficos de áreas curriculares (no-Matemática).
 * Selecciona y renderiza el componente adecuado según `tipoGrafico`.
 */
export const GraficoAreaRenderer: React.FC<Props> = ({
  grafico,
  className = '',
  mostrarErrores = true,
}) => {
  if (!grafico || !grafico.tipoGrafico) {
    if (!mostrarErrores) return null;
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-4 text-sm text-red-700 dark:text-red-300">
        ⚠️ No se recibió un gráfico válido.
      </div>
    );
  }

  const Component = componentMap[grafico.tipoGrafico];

  if (!Component) {
    if (!mostrarErrores) return null;
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 text-sm text-yellow-700 dark:text-yellow-300">
        📊 Gráfico "<strong>{grafico.tipoGrafico}</strong>" no implementado aún.
        <p className="text-xs mt-1 opacity-70">
          Tipos soportados: {tiposGraficoAreaSoportados.slice(0, 6).join(', ')}…
        </p>
      </div>
    );
  }

  return (
    <div className={`grafico-area ${className}`}>
      {grafico.titulo && (
        <h4 className="text-base font-bold text-center text-gray-800 dark:text-gray-200 mb-3">
          {grafico.titulo}
        </h4>
      )}
      <Component data={grafico as any} />
    </div>
  );
};
