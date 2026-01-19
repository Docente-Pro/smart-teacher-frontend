import { ConfiguracionGrafico } from '../../domain/types';

/**
 * Interface del repositorio de gráficos
 * Define el contrato para acceder a datos de gráficos
 */
export interface IGraficoRepository {
  /**
   * Obtiene un gráfico por su identificador
   */
  obtenerPorId(id: string): Promise<ConfiguracionGrafico | null>;

  /**
   * Obtiene todos los gráficos de una sesión
   */
  obtenerPorSesion(sesionId: string): Promise<ConfiguracionGrafico[]>;

  /**
   * Guarda un gráfico (para caché local si es necesario)
   */
  guardar(id: string, grafico: ConfiguracionGrafico): Promise<void>;

  /**
   * Elimina un gráfico del caché local
   */
  eliminar(id: string): Promise<void>;

  /**
   * Limpia todos los gráficos en caché
   */
  limpiarCache(): Promise<void>;
}
