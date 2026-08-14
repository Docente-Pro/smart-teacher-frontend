import { problematicaApiService } from "../services/problematica-api.service";
import type { Problematica } from "../interfaces/problematica.interface";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";

export async function applyProblematicaSelection(problematica: Problematica): Promise<void> {
  await problematicaApiService.seleccionar({ problematicaId: problematica.id });

  useUserStore.getState().updateUsuario({
    problematicaId: problematica.id,
    problematica: {
      id: problematica.id,
      nombre: problematica.nombre,
      descripcion: problematica.descripcion,
    },
  });

  useAuthStore.getState().updateUser({ problematicaCompleta: true });
}
