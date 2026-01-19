import { ConfiguracionGrafico, TipoGraficoMatematica } from '../../domain/types';

interface OpcionesTransformacion {
  validarEstructura?: boolean;
  aplicarDefectos?: boolean;
}

/**
 * Caso de uso: Transformar Datos de Gráfico
 * Transforma y normaliza los datos recibidos del backend
 */
export class TransformarDatosGraficoUseCase {
  /**
   * Ejecuta la transformación de datos
   */
  execute(
    datosBackend: any,
    opciones: OpcionesTransformacion = {}
  ): ConfiguracionGrafico | null {
    const { validarEstructura = true, aplicarDefectos = true } = opciones;

    if (!datosBackend) {
      return null;
    }

    // Normalizar estructura
    const graficoNormalizado: ConfiguracionGrafico = {
      tipoGrafico: datosBackend.tipoGrafico,
      elementos: datosBackend.elementos || [],
      titulo: datosBackend.titulo,
      descripcion: datosBackend.descripcion,
      opciones: datosBackend.opciones || {}
    };

    // Aplicar valores por defecto según tipo
    if (aplicarDefectos) {
      this.aplicarValoresPorDefecto(graficoNormalizado);
    }

    return graficoNormalizado;
  }

  /**
   * Aplica valores por defecto según el tipo de gráfico
   */
  private aplicarValoresPorDefecto(grafico: ConfiguracionGrafico): void {
    switch (grafico.tipoGrafico) {
      case TipoGraficoMatematica.TABLA_PRECIOS:
        if (!grafico.opciones) grafico.opciones = {};
        grafico.opciones.moneda = grafico.opciones.moneda || 'S/';
        grafico.opciones.mostrarTotal = grafico.opciones.mostrarTotal !== false;
        break;

      case TipoGraficoMatematica.BARRAS_COMPARACION:
        if (!grafico.opciones) grafico.opciones = {};
        if (!grafico.opciones.ejeY) {
          grafico.opciones.ejeY = {
            titulo: 'Valores',
            maximo: 10,
            intervalo: 1
          };
        }
        break;

      case TipoGraficoMatematica.BLOQUES_AGRUPADOS:
        if (!grafico.opciones) grafico.opciones = {};
        grafico.opciones.disposicion = grafico.opciones.disposicion || 'horizontal';
        grafico.opciones.tamanoBloque = grafico.opciones.tamanoBloque || 30;
        break;
    }
  }

  /**
   * Transforma múltiples gráficos
   */
  executeMultiple(
    datosArray: any[],
    opciones?: OpcionesTransformacion
  ): ConfiguracionGrafico[] {
    if (!Array.isArray(datosArray)) {
      return [];
    }

    return datosArray
      .map(datos => this.execute(datos, opciones))
      .filter((grafico): grafico is ConfiguracionGrafico => grafico !== null);
  }
}
