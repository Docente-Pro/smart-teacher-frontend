import { ConfiguracionGrafico } from '../../domain/types';

/**
 * Caso de uso: Validar Gráfico
 * Valida que un gráfico tenga la estructura mínima requerida
 */
export class ValidarGraficoUseCase {
  /**
   * Ejecuta la validación del gráfico
   */
  execute(grafico: ConfiguracionGrafico | null | undefined): {
    esValido: boolean;
    errores: string[];
  } {
    const errores: string[] = [];

    if (!grafico) {
      errores.push('El gráfico es nulo o indefinido');
      return { esValido: false, errores };
    }

    if (!grafico.tipoGrafico || grafico.tipoGrafico.trim() === '') {
      errores.push('El gráfico no tiene un tipo definido');
    }

    // Validación especial para bloques_agrupados con estructura alternativa
    const graficoBloques = grafico as any;
    const esBloqueAgrupados = grafico.tipoGrafico === 'bloques_agrupados';
    const tieneCantidadGrupos = graficoBloques.cantidadGrupos !== undefined && graficoBloques.elementosPorGrupo !== undefined;

    // Si es bloques_agrupados con cantidadGrupos/elementosPorGrupo, no requerir elementos
    if (esBloqueAgrupados && tieneCantidadGrupos) {
      // Asegurar que elementos sea un array (aunque esté vacío)
      if (!grafico.elementos) {
        graficoBloques.elementos = [];
      }
      // Validación exitosa para este caso
      return { esValido: true, errores: [] };
    }

    // Validación especial para balanza_equilibrio
    const esBalanzaEquilibrio = grafico.tipoGrafico === 'balanza_equilibrio';
    if (esBalanzaEquilibrio) {
      const graficoBalanza = grafico as any;
      // Verificar que tenga las propiedades específicas de balanza
      if (graficoBalanza.ladoIzquierdo && graficoBalanza.ladoDerecho && graficoBalanza.estado) {
        // Asegurar que elementos sea un array (aunque esté vacío)
        if (!grafico.elementos) {
          graficoBalanza.elementos = [];
        }
        return { esValido: true, errores: [] };
      }
    }

    // Validación normal para otros casos
    if (!grafico.elementos || !Array.isArray(grafico.elementos)) {
      errores.push('Los elementos del gráfico no son válidos');
    } else if (grafico.elementos.length === 0) {
      errores.push('El gráfico no tiene elementos para mostrar');
    }

    return {
      esValido: errores.length === 0,
      errores
    };
  }
}
