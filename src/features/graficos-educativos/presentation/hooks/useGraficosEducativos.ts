/**
 * Hook personalizado para trabajar con gráficos educativos
 * Facilita el uso de los casos de uso en componentes React
 */

import { useState, useCallback, useMemo } from 'react';
import {
  ValidarGraficoUseCase,
  ObtenerTipoGraficoUseCase,
} from '../../application/use-cases';
import { GraficoBackendAdapter } from '../../infrastructure/adapters';
import { ConfiguracionGrafico } from '../../domain/types';

export const useGraficosEducativos = () => {
  const [error, setError] = useState<string | null>(null);

  // Instancias de casos de uso (memoizadas)
  const validarGraficoUseCase = useMemo(() => new ValidarGraficoUseCase(), []);
  const obtenerTipoGraficoUseCase = useMemo(() => new ObtenerTipoGraficoUseCase(), []);

  /**
   * Valida un gráfico
   */
  const validarGrafico = useCallback((grafico: ConfiguracionGrafico | null | undefined) => {
    setError(null);
    const resultado = validarGraficoUseCase.execute(grafico);
    
    if (!resultado.esValido) {
      setError(resultado.errores.join(', '));
    }
    
    return resultado;
  }, [validarGraficoUseCase]);

  /**
   * Obtiene el tipo de un gráfico
   */
  const obtenerTipoGrafico = useCallback((tipoGrafico: string) => {
    return obtenerTipoGraficoUseCase.execute(tipoGrafico);
  }, [obtenerTipoGraficoUseCase]);

  /**
   * Transforma datos del backend a la estructura esperada
   */
  const transformarDesdeBackend = useCallback((datosBackend: any) => {
    setError(null);
    try {
      return GraficoBackendAdapter.adaptarDesdeBackend(datosBackend);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al transformar datos');
      return null;
    }
  }, []);

  /**
   * Procesa datos de una sesión completa
   */
  const procesarGraficosDeSesion = useCallback((sesion: any) => {
    setError(null);
    try {
      return GraficoBackendAdapter.adaptarGraficosDeSesion(sesion);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar gráficos de sesión');
      return {};
    }
  }, []);

  /**
   * Obtiene todos los tipos soportados
   */
  const tiposSoportados = useMemo(() => {
    return obtenerTipoGraficoUseCase.obtenerTiposSoportados();
  }, [obtenerTipoGraficoUseCase]);

  return {
    // Funciones
    validarGrafico,
    obtenerTipoGrafico,
    transformarDesdeBackend,
    procesarGraficosDeSesion,
    
    // Datos
    tiposSoportados,
    error,
    
    // Utilidades
    limpiarError: () => setError(null)
  };
};
