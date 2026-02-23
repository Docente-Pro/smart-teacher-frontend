import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle, BookOpen } from "lucide-react";
import ReusableModal from "./ReusableModal";
import { getAreasDisponibles, seleccionarAreas } from "@/services/unidad.service";
import { getAreaColor, getAreaIcon } from "@/constants/areaColors";
import type { IAreaDisponible } from "@/interfaces/IUnidad";
import { handleToaster } from "@/utils/Toasters/handleToasters";

interface AreaSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  unidadId: string;
  unidadTitulo: string;
  /** Se ejecuta tras guardar áreas exitosamente */
  onAreasGuardadas: () => void;
}

/**
 * Modal para que un miembro de unidad compartida seleccione
 * las áreas que va a enseñar. Las áreas ya tomadas por otro
 * miembro aparecen deshabilitadas.
 *
 * Flujo:
 * 1. GET /api/unidad/:unidadId/areas-disponibles
 * 2. Usuario selecciona áreas libres
 * 3. PUT /api/unidad/:unidadId/areas { areaIds: [...] }
 */
function AreaSelectionModal({
  isOpen,
  onClose,
  unidadId,
  unidadTitulo,
  onAreasGuardadas,
}: AreaSelectionModalProps) {
  const [areas, setAreas] = useState<IAreaDisponible[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  const cargarAreas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAreasDisponibles(unidadId);
      // data puede venir envuelto en .data
      const items = Array.isArray(data) ? data : (data as any)?.data ?? [];
      setAreas(items);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "Error al cargar áreas disponibles"
      );
    } finally {
      setLoading(false);
    }
  }, [unidadId]);

  useEffect(() => {
    if (isOpen && unidadId) {
      cargarAreas();
      setSelectedIds(new Set());
    }
  }, [isOpen, unidadId, cargarAreas]);

  const toggleArea = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleGuardar = async () => {
    if (selectedIds.size === 0) {
      handleToaster("Selecciona al menos un área", "error");
      return;
    }

    setSaving(true);
    try {
      await seleccionarAreas(unidadId, { areaIds: Array.from(selectedIds) });
      handleToaster("¡Áreas asignadas correctamente!", "success");
      onAreasGuardadas();
    } catch (err: any) {
      handleToaster(
        err?.response?.data?.message || "Error al guardar las áreas",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const areasLibres = areas.filter((a) => !a.tomadaPor);
  const areasTomadas = areas.filter((a) => a.tomadaPor);

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title="Selecciona tus áreas"
      size="lg"
      gradient="purple-pink"
      closeOnOverlayClick={false}
      footer={
        <div className="flex items-center justify-between w-full">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {selectedIds.size} área{selectedIds.size !== 1 ? "s" : ""} seleccionada{selectedIds.size !== 1 ? "s" : ""}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button
              onClick={handleGuardar}
              disabled={selectedIds.size === 0 || saving}
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando…
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirmar áreas
                </>
              )}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Descripción */}
        <div className="p-3 rounded-lg bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-700/50">
          <p className="text-sm text-violet-700 dark:text-violet-300">
            <strong>{unidadTitulo}</strong>
          </p>
          <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">
            Elige las áreas que vas a enseñar. Las áreas ya tomadas por otro miembro no están disponibles.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Cargando áreas disponibles…</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Áreas disponibles */}
        {!loading && !error && (
          <>
            {areasLibres.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Áreas disponibles
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {areasLibres.map((area) => {
                    const isSelected = selectedIds.has(area.id);
                    const theme = getAreaColor(area.nombre);
                    const Icon = getAreaIcon(area.nombre);

                    return (
                      <button
                        key={area.id}
                        onClick={() => toggleArea(area.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                          isSelected
                            ? `${theme.border} ${theme.bg} shadow-sm ring-1 ring-violet-300/40`
                            : "border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600"
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            isSelected ? theme.bg : "bg-slate-100 dark:bg-slate-700/50"
                          }`}
                        >
                          <Icon
                            className={`h-5 w-5 ${
                              isSelected ? theme.text : "text-slate-400 dark:text-slate-500"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-medium text-sm ${
                              isSelected ? theme.text : "text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {area.nombre}
                          </p>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                            Disponible
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-5 w-5 text-violet-500 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Áreas ya tomadas */}
            {areasTomadas.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Ya asignadas a otro miembro
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {areasTomadas.map((area) => {
                    const Icon = getAreaIcon(area.nombre);

                    return (
                      <div
                        key={area.id}
                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/50 dark:border-slate-700/30 bg-slate-50/50 dark:bg-slate-800/30 opacity-60"
                      >
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700/30">
                          <Icon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-slate-500 dark:text-slate-400">
                            {area.nombre}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">
                            Tomada por {area.tomadaPor?.nombreUsuario || "otro miembro"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sin áreas disponibles */}
            {areasLibres.length === 0 && areasTomadas.length > 0 && (
              <div className="flex flex-col items-center gap-2 py-6">
                <AlertCircle className="h-8 w-8 text-amber-500" />
                <p className="text-sm text-slate-600 dark:text-slate-300 text-center">
                  Todas las áreas ya fueron asignadas a otros miembros.
                </p>
              </div>
            )}

            {/* Sin áreas en total */}
            {areas.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-6">
                <BookOpen className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                  No se encontraron áreas para esta unidad.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </ReusableModal>
  );
}

export default AreaSelectionModal;
