import { useState, useEffect } from "react";
import ReusableModal from "@/components/Shared/Modal/ReusableModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { problematicaApiService } from "../services/problematica-api.service";
import { Problematica, SugerenciaPersonalizacion } from "../interfaces/problematica.interface";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { useAuthStore } from "@/store/auth.store";
import { AlertCircle } from "lucide-react";
import SugerenciasPersonalizacion from "./SugerenciasPersonalizacion";

interface CreateEditProblematicaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (problematica: Problematica) => void;
  basadaEn?: Problematica | null; // Si se pasa, es modo edición
}

/**
 * Modal para crear o editar una problemática
 * - Si basadaEn es null: Crea desde cero
 * - Si basadaEn existe: Crea basada en una recomendada
 */
function CreateEditProblematicaModal({
  isOpen,
  onClose,
  onSuccess,
  basadaEn = null,
}: CreateEditProblematicaModalProps) {
  const { user } = useAuthStore();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [saving, setSaving] = useState(false);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false); // Cambiado a false por defecto

  // Pre-cargar datos si es edición de una recomendada
  useEffect(() => {
    if (basadaEn) {
      setNombre(basadaEn.nombre);
      setDescripcion(basadaEn.descripcion);
      setMostrarSugerencias(false); // No mostrar sugerencias por defecto hasta que backend esté listo
    } else {
      setNombre("");
      setDescripcion("");
      setMostrarSugerencias(false);
    }
  }, [basadaEn, isOpen]);

  /**
   * Handler cuando el usuario selecciona una sugerencia
   */
  function handleSeleccionarSugerencia(sugerencia: SugerenciaPersonalizacion) {
    setNombre(sugerencia.nombre);
    setDescripcion(sugerencia.descripcion);
    setMostrarSugerencias(false); // Ocultar sugerencias después de seleccionar
    handleToaster(
      "Sugerencia aplicada. Puedes editar antes de guardar.",
      "success"
    );
  }

  async function handleGuardar() {
    if (!nombre.trim() || !descripcion.trim()) {
      handleToaster("Por favor, completa todos los campos", "warning");
      return;
    }

    if (!user?.id) {
      handleToaster("Error: Usuario no encontrado", "error");
      return;
    }

    setSaving(true);

    try {
      const response = await problematicaApiService.create({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        usuarioId: user.id,
        basadaEnId: basadaEn?.id, // Si existe, se envía; sino undefined
      });

      const mensaje = basadaEn
        ? "Problemática personalizada creada desde plantilla"
        : "Problemática creada exitosamente";

      handleToaster(mensaje, "success");

      // Llamar callback con la problemática creada
      if (onSuccess && response.data) {
        onSuccess(response.data);
      }

      // Limpiar y cerrar
      setNombre("");
      setDescripcion("");
      onClose();
    } catch (error: any) {
      console.error("Error al guardar problemática:", error);
      handleToaster(
        error.response?.data?.message || "Error al guardar la problemática",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancelar() {
    setNombre("");
    setDescripcion("");
    onClose();
  }

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={handleCancelar}
      title={basadaEn ? "Personalizar Problemática" : "Crear Nueva Problemática"}
      size="lg"
      gradient="blue-orange"
      footer={
        <>
          <Button variant="outline" onClick={handleCancelar} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleGuardar}
            disabled={saving || !nombre.trim() || !descripcion.trim()}
            className="bg-gradient-to-r from-dp-blue-500 to-dp-orange-500 hover:from-dp-blue-600 hover:to-dp-orange-600 text-white"
          >
            {saving ? "Guardando..." : basadaEn ? "Crear Personalizada" : "Crear"}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Botón para mostrar sugerencias (cuando backend esté listo) */}
        {basadaEn && !mostrarSugerencias && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMostrarSugerencias(true)}
            className="w-full text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
          >
            💡 Ver sugerencias de usuarios similares
          </Button>
        )}

        {/* Sugerencias de personalización (solo si usuario las activó) */}
        {basadaEn && mostrarSugerencias && (
          <SugerenciasPersonalizacion
            basadaEnId={basadaEn.id}
            usuarioId={user?.id}
            onSeleccionarSugerencia={handleSeleccionarSugerencia}
            limite={3}
          />
        )}

        {/* Info si es basada en una recomendada */}
        {basadaEn && (
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-dp-blue-500 rounded-lg">
            <AlertCircle className="h-5 w-5 text-dp-blue-600 dark:text-dp-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                Personalizando plantilla
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Estás creando una versión personalizada de{" "}
                <span className="font-semibold">"{basadaEn.nombre}"</span>. Puedes editar el
                nombre y descripción para adaptarla a tu contexto.
              </p>
            </div>
          </div>
        )}

        {/* Formulario */}
        <div className="space-y-4">
          {/* Nombre */}
          <div>
            <Label htmlFor="nombre" className="text-slate-900 dark:text-white font-semibold">
              Nombre de la problemática *
            </Label>
            <Input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Dificultades en comprensión lectora"
              className="mt-2"
              maxLength={200}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {nombre.length}/200 caracteres
            </p>
          </div>

          {/* Descripción */}
          <div>
            <Label htmlFor="descripcion" className="text-slate-900 dark:text-white font-semibold">
              Descripción *
            </Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescripcion(e.target.value)}
              placeholder="Describe la problemática en detalle..."
              className="mt-2 min-h-[120px]"
              maxLength={500}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {descripcion.length}/500 caracteres
            </p>
          </div>
        </div>

        {/* Nota */}
        <div className="text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-700">
          {basadaEn ? (
            <p>
              La problemática personalizada se guardará en "Mis Problemáticas" y podrás usarla en
              tus sesiones futuras.
            </p>
          ) : (
            <p>
              Esta problemática se guardará como personalizada y estará disponible solo para ti en
              "Mis Problemáticas".
            </p>
          )}
        </div>
      </div>
    </ReusableModal>
  );
}

export default CreateEditProblematicaModal;
