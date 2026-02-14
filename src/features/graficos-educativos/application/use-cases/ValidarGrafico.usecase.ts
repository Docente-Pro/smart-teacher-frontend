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

    // Validación especial para operacion_vertical
    const esOperacionVertical = grafico.tipoGrafico === 'operacion_vertical';
    if (esOperacionVertical) {
      const graficoOperacion = grafico as any;
      // Verificar que tenga las propiedades específicas de operación vertical
      if (graficoOperacion.operacion && graficoOperacion.operandos && Array.isArray(graficoOperacion.operandos) && graficoOperacion.operandos.length > 0) {
        // Asegurar que elementos sea un array (aunque esté vacío)
        if (!grafico.elementos) {
          graficoOperacion.elementos = [];
        }
        return { esValido: true, errores: [] };
      }
      // Si no tiene la estructura correcta, seguir con validación normal
    }

    // Validación especial para recta_numerica
    const esRectaNumerica = grafico.tipoGrafico === 'recta_numerica';
    if (esRectaNumerica) {
      const graficoRecta = grafico as any;
      // Verificar que tenga las propiedades específicas de recta numérica
      if (graficoRecta.inicio !== undefined && graficoRecta.fin !== undefined) {
        // Asegurar que elementos sea un array (aunque esté vacío)
        if (!grafico.elementos) {
          graficoRecta.elementos = [];
        }
        return { esValido: true, errores: [] };
      }
      // Si no tiene la estructura correcta, seguir con validación normal
    }

    // Validación especial para patron_geometrico
    const esPatronGeometrico = grafico.tipoGrafico === 'patron_geometrico';
    if (esPatronGeometrico) {
      const graficoPatron = grafico as any;
      // Verificar que tenga las propiedades específicas de patrón geométrico
      // Acepta tanto 'secuencia' como 'marcas' (estructura alternativa del backend)
      if ((graficoPatron.secuencia && Array.isArray(graficoPatron.secuencia) && graficoPatron.secuencia.length > 0) ||
          (graficoPatron.marcas && Array.isArray(graficoPatron.marcas) && graficoPatron.marcas.length > 0)) {
        // Asegurar que elementos sea un array (aunque esté vacío)
        if (!grafico.elementos) {
          graficoPatron.elementos = [];
        }
        return { esValido: true, errores: [] };
      }
      // Si no tiene la estructura correcta, seguir con validación normal
    }

    // Validación especial para coordenadas_ejercicios
    const esCoordenadasEjercicios = grafico.tipoGrafico === 'coordenadas_ejercicios';
    if (esCoordenadasEjercicios) {
      const graficoCoordenadas = grafico as any;
      // Verificar que tenga planos, ejercicios o tablas
      if ((graficoCoordenadas.planos && Array.isArray(graficoCoordenadas.planos)) ||
          (graficoCoordenadas.ejercicios && Array.isArray(graficoCoordenadas.ejercicios)) ||
          (graficoCoordenadas.tablas && Array.isArray(graficoCoordenadas.tablas))) {
        if (!grafico.elementos) {
          graficoCoordenadas.elementos = [];
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
