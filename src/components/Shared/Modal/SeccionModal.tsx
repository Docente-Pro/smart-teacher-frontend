import { useState } from "react";
import { Sparkles, GraduationCap, Loader2 } from "lucide-react";
import ReusableModal from "@/components/Shared/Modal/ReusableModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateUsuario } from "@/services/usuarios.service";
import { useUserStore } from "@/store/user.store";
import { toast } from "sonner";

interface SeccionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal que solicita la sección a usuarios existentes que aún no la tienen.
 * Se muestra una sola vez; al guardar, actualiza el backend y el store.
 * Si el usuario cierra sin guardar, no se vuelve a mostrar en esa sesión
 * (pero sí en la próxima visita, hasta que la complete).
 */
export default function SeccionModal({ isOpen, onClose }: SeccionModalProps) {
  const { user, updateUsuario: updateStore } = useUserStore();
  const [seccion, setSeccion] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleGuardar() {
    if (!seccion.trim()) {
      toast.error("Ingresa una letra de sección (A, B, C…)");
      return;
    }

    setSaving(true);
    try {
      const res = await updateUsuario(user.id, { seccion: seccion.trim().toUpperCase() });
      const updated = res.data?.data ?? res.data;
      updateStore({ seccion: updated.seccion ?? seccion.trim().toUpperCase() });
      toast.success("¡Sección guardada exitosamente!");
      onClose();
    } catch (err: any) {
      console.error("Error al guardar sección:", err);
      toast.error(
        err?.response?.data?.message || "Error al guardar la sección",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleOmitir() {
    onClose();
  }

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={handleOmitir}
      size="sm"
      gradient="cyan-blue"
      showCloseButton={!saving}
      closeOnOverlayClick={!saving}
    >
      <div className="flex flex-col items-center text-center px-2 py-6">
        {/* Ícono */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-5">
          <Sparkles className="w-8 h-8 text-white" />
        </div>

        {/* Título */}
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          ¡Nueva característica!
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
          Ahora puedes registrar la <strong>sección</strong> de tu aula. Esta
          información aparecerá en tus documentos generados.
        </p>

        {/* Input de sección */}
        <div className="flex flex-col items-center gap-2 mb-6 w-full max-w-[200px]">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Tu sección
            </span>
          </div>
          <Input
            value={seccion}
            onChange={(e) =>
              setSeccion(e.target.value.toUpperCase().slice(0, 1))
            }
            maxLength={1}
            placeholder="A"
            className="text-center text-2xl font-bold uppercase tracking-widest h-14 w-20 border-2 border-blue-200 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-600"
            autoFocus
          />
          <span className="text-xs text-slate-400">
            Solo una letra: A, B, C…
          </span>
        </div>

        {/* Botones */}
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <Button
            onClick={handleGuardar}
            disabled={saving || !seccion.trim()}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold shadow-md"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando…
              </>
            ) : (
              "Guardar sección"
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={handleOmitir}
            disabled={saving}
            className="text-slate-400 hover:text-slate-600 text-sm"
          >
            Omitir por ahora
          </Button>
        </div>
      </div>
    </ReusableModal>
  );
}
