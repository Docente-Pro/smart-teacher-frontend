import { useQuery } from "@tanstack/react-query";
import { listarUnidadesByUsuario } from "@/services/unidad.service";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";

/**
 * Hook centralizado para obtener las unidades del usuario autenticado.
 * Usa una única query key para compartir caché entre todas las páginas
 * (Dashboard, MisSesiones, MisUnidades, GenerarSesion, etc.).
 */
export function useUserUnidades() {
  const { user: authUser } = useAuthStore();
  const { user: usuario } = useUserStore();
  const userId = authUser?.id || usuario?.id;

  return useQuery({
    queryKey: ["userUnidades", userId],
    queryFn: () => listarUnidadesByUsuario(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 60 * 60 * 20, // 20 días
  });
}
