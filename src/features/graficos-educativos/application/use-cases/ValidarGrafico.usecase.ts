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

    // Validación especial para tabla_doble_entrada
    const esTablaDobleEntrada = grafico.tipoGrafico === 'tabla_doble_entrada';
    if (esTablaDobleEntrada) {
      const graficoTabla = grafico as any;
      if (graficoTabla.datos && Array.isArray(graficoTabla.datos) &&
          graficoTabla.encabezadosColumnas && graficoTabla.encabezadosFilas) {
        if (!grafico.elementos) {
          graficoTabla.elementos = [];
        }
        return { esValido: true, errores: [] };
      }
    }

    // Validación especial para tabla_valores con encabezados
    const esTablaValores = grafico.tipoGrafico === 'tabla_valores';
    if (esTablaValores) {
      const graficoTabla = grafico as any;
      if (graficoTabla.encabezados && Array.isArray(graficoTabla.encabezados)) {
        if (!grafico.elementos) {
          graficoTabla.elementos = [];
        }
        return { esValido: true, errores: [] };
      }
    }

    // Validación especial para diagrama_venn
    const esDiagramaVenn = grafico.tipoGrafico === 'diagrama_venn';
    if (esDiagramaVenn) {
      const graficoVenn = grafico as any;
      if (graficoVenn.elementos && Array.isArray(graficoVenn.elementos) && graficoVenn.elementos.length > 0) {
        return { esValido: true, errores: [] };
      }
    }

    // Validación para los 23 nuevos tipos de gráficos que NO usan elementos[]
    const tiposConEstructuraPropia: Record<string, (g: any) => boolean> = {
      'valor_posicional': (g) => Array.isArray(g.posiciones) && g.posiciones.length > 0,
      'descomposicion_numero': (g) => Array.isArray(g.partes) && g.partes.length > 0,
      'abaco': (g) => Array.isArray(g.columnas) && g.columnas.length > 0,
      'base_diez_bloques': (g) => Array.isArray(g.bloques) && g.bloques.length > 0,
      'pictograma': (g) => Array.isArray(g.elementos) && g.elementos.length > 0,
      'grafico_circular': (g) => Array.isArray(g.sectores) && g.sectores.length > 0,
      'grafico_lineal': (g) => Array.isArray(g.series) && g.series.length > 0,
      'tabla_frecuencias': (g) => Array.isArray(g.datos) && g.datos.length > 0,
      'reloj_tiempo': (g) => Array.isArray(g.relojes) && g.relojes.length > 0,
      'calendario': (g) => g.mes !== undefined && g.anio !== undefined,
      'termometro': (g) => g.temperatura !== undefined,
      'conversion_medidas': (g) => Array.isArray(g.conversiones) && g.conversiones.length > 0,
      'regla_medicion': (g) => g.inicio !== undefined && g.fin !== undefined,
      'caja_funcion': (g) => Array.isArray(g.pares) && g.pares.length > 0,
      'arbol_factores': (g) => g.arbol !== undefined && g.arbol !== null,
      'multiplos_tabla': (g) => g.numero !== undefined && g.rango !== undefined,
      'potencias_raices': (g) => Array.isArray(g.expresiones) && g.expresiones.length > 0,
      'cuerpos_geometricos': (g) => Array.isArray(g.cuerpos) && g.cuerpos.length > 0,
      'angulos': (g) => Array.isArray(g.angulos) && g.angulos.length > 0,
      'simetria': (g) => g.figuraOriginal !== undefined && g.ejeSimetria !== undefined,
      'redes_cuerpos': (g) => Array.isArray(g.redes) && g.redes.length > 0,
      'cambio_monedas': (g) => Array.isArray(g.monedasInicio) && Array.isArray(g.monedasResultado),
      'recta_fraccion': (g) => Array.isArray(g.marcas) && g.marcas.length > 0,
      // ===== Áreas curriculares (no-Matemática) =====
      'estructura_narrativa': (g) => Array.isArray(g.secciones) && g.secciones.length > 0,
      'organizador_kvl': (g) => Array.isArray(g.columnas) && g.columnas.length > 0,
      'planificador_escritura': (g) => Array.isArray(g.campos) && g.campos.length > 0,
      'tabla_observacion': (g) => Array.isArray(g.columnas) && g.columnas.length > 0 && Array.isArray(g.filas),
      'ciclo_proceso': (g) => Array.isArray(g.fases) && g.fases.length > 0,
      'clasificacion_dicotomica': (g) => Array.isArray(g.nodos) && g.nodos.length > 0,
      'linea_tiempo': (g) => Array.isArray(g.eventos) && g.eventos.length > 0,
      'cuadro_comparativo': (g) => Array.isArray(g.criterios) && Array.isArray(g.columnas) && g.columnas.length > 0,
      'rueda_emociones': (g) => Array.isArray(g.emociones) && g.emociones.length > 0,
      'ficha_autoconocimiento': (g) => Array.isArray(g.secciones) && g.secciones.length > 0,
      'tarjeta_reflexion': (g) => typeof g.texto === 'string' && g.texto.length > 0,
      'tarjeta_compromiso': (g) => Array.isArray(g.campos) && g.campos.length > 0,
      'ficha_analisis_obra': (g) => g.obra !== undefined && Array.isArray(g.dimensiones),
      'ficha_proceso_creativo': (g) => Array.isArray(g.etapas) && g.etapas.length > 0,
      'secuencia_movimiento': (g) => Array.isArray(g.pasos) && g.pasos.length > 0,
      'tabla_habitos': (g) => Array.isArray(g.habitos) && g.habitos.length > 0 && Array.isArray(g.dias),
    };

    const validadorEspecial = tiposConEstructuraPropia[grafico.tipoGrafico];
    if (validadorEspecial) {
      const graficoAny = grafico as any;
      if (validadorEspecial(graficoAny)) {
        if (!grafico.elementos) {
          graficoAny.elementos = [];
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
