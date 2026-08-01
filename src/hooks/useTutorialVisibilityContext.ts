import { useMemo } from "react";
import { useAuthStore } from "@/store/auth.store";
import { usePermissions } from "@/hooks/usePermissions";
import type { TutorialVisibilityContext } from "@/data/dashboardTutorials";

export function useTutorialVisibilityContext(): TutorialVisibilityContext {
  const user = useAuthStore((state) => state.user);
  const { isPremium, sesionesUsadas } = usePermissions();

  return useMemo(
    () => ({
      isPremium,
      perfilCompleto: user?.perfilCompleto === true,
      sesionesUsadas,
    }),
    [isPremium, user?.perfilCompleto, sesionesUsadas],
  );
}
