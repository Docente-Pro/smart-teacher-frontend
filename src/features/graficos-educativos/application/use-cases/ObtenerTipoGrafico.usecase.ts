import { TipoGraficoMatematica } from '../../domain/types';

/**
 * Caso de uso: Obtener Tipo de Gráfico
 * Determina qué tipo de gráfico debe renderizarse
 */
export class ObtenerTipoGraficoUseCase {
  /**
   * Ejecuta la lógica para obtener el tipo de gráfico
   */
  execute(tipoGrafico: string): {
    tipo: TipoGraficoMatematica | null;
    esConocido: boolean;
    mensaje?: string;
  } {
    const tiposValidos = Object.values(TipoGraficoMatematica);
    const tipoEncontrado = tiposValidos.find(tipo => tipo === tipoGrafico);

    if (tipoEncontrado) {
      return {
        tipo: tipoEncontrado as TipoGraficoMatematica,
        esConocido: true
      };
    }

    return {
      tipo: null,
      esConocido: false,
      mensaje: `El tipo de gráfico "${tipoGrafico}" no está soportado`
    };
  }

  /**
   * Obtiene todos los tipos de gráficos soportados
   */
  obtenerTiposSoportados(): TipoGraficoMatematica[] {
    return Object.values(TipoGraficoMatematica);
  }
}
