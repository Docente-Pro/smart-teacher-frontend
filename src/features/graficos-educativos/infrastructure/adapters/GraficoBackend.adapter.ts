import { ConfiguracionGrafico } from '../../domain/types';

/**
 * Adaptador para normalizar datos de gráficos del backend
 * Convierte diferentes formatos de respuesta a la estructura esperada
 */
export class GraficoBackendAdapter {
  /**
   * Adapta la respuesta del backend al formato del dominio
   */
  static adaptarDesdeBackend(respuestaBackend: any): ConfiguracionGrafico | null {
    if (!respuestaBackend) {
      return null;
    }

    // Si ya tiene el formato correcto, devolverlo
    if (this.esFormatoCorrecto(respuestaBackend)) {
      return respuestaBackend as ConfiguracionGrafico;
    }

    // Adaptar diferentes formatos posibles del backend
    return this.normalizarEstructura(respuestaBackend);
  }

  /**
   * Adapta múltiples gráficos desde el backend
   */
  static adaptarMultiplesDesdeBackend(graficos: any[]): ConfiguracionGrafico[] {
    if (!Array.isArray(graficos)) {
      return [];
    }

    return graficos
      .map(grafico => this.adaptarDesdeBackend(grafico))
      .filter((grafico): grafico is ConfiguracionGrafico => grafico !== null);
  }

  /**
   * Adapta datos de una sesión pedagógica completa
   */
  static adaptarGraficosDeSesion(sesion: any): {
    graficoProblema?: ConfiguracionGrafico;
    graficoSolucion?: ConfiguracionGrafico;
  } {
    const resultado: {
      graficoProblema?: ConfiguracionGrafico;
      graficoSolucion?: ConfiguracionGrafico;
    } = {};

    if (sesion.graficoProblema) {
      const adaptado = this.adaptarDesdeBackend(sesion.graficoProblema);
      if (adaptado) resultado.graficoProblema = adaptado;
    }

    if (sesion.graficoSolucion) {
      const adaptado = this.adaptarDesdeBackend(sesion.graficoSolucion);
      if (adaptado) resultado.graficoSolucion = adaptado;
    }

    return resultado;
  }

  /**
   * Verifica si los datos ya tienen el formato correcto
   */
  private static esFormatoCorrecto(datos: any): boolean {
    return (
      datos &&
      typeof datos === 'object' &&
      'tipoGrafico' in datos &&
      'elementos' in datos &&
      Array.isArray(datos.elementos)
    );
  }

  /**
   * Normaliza diferentes estructuras posibles del backend
   */
  private static normalizarEstructura(datos: any): ConfiguracionGrafico | null {
    // Caso 1: Los datos están envueltos en una propiedad 'grafico'
    if (datos.grafico) {
      return this.adaptarDesdeBackend(datos.grafico);
    }

    // Caso 2: Tiene 'type' en lugar de 'tipoGrafico'
    if (datos.type && !datos.tipoGrafico) {
      datos.tipoGrafico = datos.type;
    }

    // Caso 3: Tiene 'items' en lugar de 'elementos'
    if (datos.items && !datos.elementos) {
      datos.elementos = datos.items;
    }

    // Caso 4: Tiene 'data' que contiene elementos
    if (datos.data && Array.isArray(datos.data)) {
      datos.elementos = datos.data;
    }

    // Validar que ahora tenga la estructura mínima
    if (!this.esFormatoCorrecto(datos)) {
      console.warn('No se pudo normalizar la estructura del gráfico:', datos);
      return null;
    }

    return {
      tipoGrafico: datos.tipoGrafico,
      elementos: datos.elementos,
      titulo: datos.titulo || datos.title,
      descripcion: datos.descripcion || datos.description,
      opciones: datos.opciones || datos.options || {}
    };
  }

  /**
   * Adapta opciones específicas según el tipo de gráfico
   */
  static adaptarOpciones(tipoGrafico: string, opciones: any): Record<string, any> {
    const opcionesNormalizadas: Record<string, any> = { ...opciones };

    // Normalizar nombres de propiedades según tipo
    switch (tipoGrafico) {
      case 'tabla_precios':
        if (opciones.currency && !opciones.moneda) {
          opcionesNormalizadas.moneda = opciones.currency;
        }
        if (opciones.showTotal !== undefined && opciones.mostrarTotal === undefined) {
          opcionesNormalizadas.mostrarTotal = opciones.showTotal;
        }
        break;

      case 'barras_comparacion':
        if (opciones.yAxis && !opciones.ejeY) {
          opcionesNormalizadas.ejeY = {
            titulo: opciones.yAxis.title || 'Valores',
            maximo: opciones.yAxis.max || 10,
            intervalo: opciones.yAxis.interval || 1
          };
        }
        break;
    }

    return opcionesNormalizadas;
  }
}
