import { useEffect } from "react";
import { useLoadingStore } from "@/store/loading.store";

/**
 * Hook para manejar el loading global de forma sencilla
 * 
 * @example
 * const { showLoading, hideLoading } = useGlobalLoading();
 * 
 * const fetchData = async () => {
 *   showLoading("Cargando datos...");
 *   try {
 *     const data = await api.getData();
 *   } finally {
 *     hideLoading();
 *   }
 * };
 */
export const useGlobalLoading = () => {
  const { showLoading, hideLoading } = useLoadingStore();

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      hideLoading();
    };
  }, [hideLoading]);

  return {
    showLoading,
    hideLoading,
  };
};
