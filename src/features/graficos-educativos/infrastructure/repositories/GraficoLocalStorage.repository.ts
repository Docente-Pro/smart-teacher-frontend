import { IGraficoRepository } from '../../domain/repositories';
import { ConfiguracionGrafico } from '../../domain/types';

/**
 * Implementación del repositorio de gráficos usando LocalStorage
 * Permite cachear gráficos localmente para mejorar el rendimiento
 */
export class GraficoLocalStorageRepository implements IGraficoRepository {
  private readonly STORAGE_KEY = 'smart_teacher_graficos';
  private readonly CACHE_DURATION_MS = 1000 * 60 * 30; // 30 minutos

  /**
   * Obtiene un gráfico por su ID desde el caché local
   */
  async obtenerPorId(id: string): Promise<ConfiguracionGrafico | null> {
    try {
      const cache = this.obtenerCache();
      const item = cache[id];

      if (!item) {
        return null;
      }

      // Verificar si el caché ha expirado
      if (Date.now() - item.timestamp > this.CACHE_DURATION_MS) {
        await this.eliminar(id);
        return null;
      }

      return item.data;
    } catch (error) {
      console.error('Error al obtener gráfico del caché:', error);
      return null;
    }
  }

  /**
   * Obtiene todos los gráficos de una sesión
   */
  async obtenerPorSesion(sesionId: string): Promise<ConfiguracionGrafico[]> {
    try {
      const cache = this.obtenerCache();
      const graficos: ConfiguracionGrafico[] = [];

      for (const key in cache) {
        if (key.startsWith(`sesion_${sesionId}_`)) {
          const item = cache[key];
          
          // Verificar expiración
          if (Date.now() - item.timestamp <= this.CACHE_DURATION_MS) {
            graficos.push(item.data);
          } else {
            await this.eliminar(key);
          }
        }
      }

      return graficos;
    } catch (error) {
      console.error('Error al obtener gráficos de la sesión:', error);
      return [];
    }
  }

  /**
   * Guarda un gráfico en el caché local
   */
  async guardar(id: string, grafico: ConfiguracionGrafico): Promise<void> {
    try {
      const cache = this.obtenerCache();
      
      cache[id] = {
        data: grafico,
        timestamp: Date.now()
      };

      this.guardarCache(cache);
    } catch (error) {
      console.error('Error al guardar gráfico en caché:', error);
    }
  }

  /**
   * Elimina un gráfico del caché
   */
  async eliminar(id: string): Promise<void> {
    try {
      const cache = this.obtenerCache();
      delete cache[id];
      this.guardarCache(cache);
    } catch (error) {
      console.error('Error al eliminar gráfico del caché:', error);
    }
  }

  /**
   * Limpia todo el caché de gráficos
   */
  async limpiarCache(): Promise<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error al limpiar caché de gráficos:', error);
    }
  }

  /**
   * Obtiene el caché completo del localStorage
   */
  private obtenerCache(): Record<string, { data: ConfiguracionGrafico; timestamp: number }> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  /**
   * Guarda el caché en localStorage
   */
  private guardarCache(cache: Record<string, { data: ConfiguracionGrafico; timestamp: number }>): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Error al guardar caché:', error);
      // Si el localStorage está lleno, limpiarlo y reintentar
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.limpiarCache();
      }
    }
  }
}
