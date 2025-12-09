import { CheckCircle2, Zap, Edit2, Save, X } from "lucide-react";
import { ICriterioIA } from "@/interfaces/ICriterio";
import CriterioFormulario from "./CriterioFormulario";
import CriterioDetalles from "./CriterioDetalles";

interface CriterioCardProps {
  criterio: ICriterioIA;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: () => void;
  onEditar: (e: React.MouseEvent) => void;
  onGuardar: (e: React.MouseEvent) => void;
  onCancelar: (e: React.MouseEvent) => void;
  onCambioCampo: (campo: keyof ICriterioIA, valor: string) => void;
}

export default function CriterioCard({
  criterio,
  isSelected,
  isEditing,
  onSelect,
  onEditar,
  onGuardar,
  onCancelar,
  onCambioCampo,
}: CriterioCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`
        group relative overflow-hidden rounded-xl transition-all duration-300
        ${!isEditing && "cursor-pointer"}
        ${
          isEditing
            ? "ring-4 ring-blue-500 ring-offset-2 shadow-2xl bg-white dark:bg-slate-800"
            : isSelected
            ? "ring-4 ring-amber-500 ring-offset-2 dark:ring-offset-slate-900 shadow-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950"
            : "hover:shadow-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
        }
      `}
    >
      <div className="relative p-6">
        {/* Header con icono y botones */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div
            className={`p-2 rounded-lg transition-all duration-300 ${
              isSelected ? "bg-gradient-to-br from-amber-500 to-orange-500" : "bg-slate-100 dark:bg-slate-700"
            }`}
          >
            <Zap
              className={`h-5 w-5 transition-colors duration-300 ${
                isSelected ? "text-white" : "text-slate-600 dark:text-slate-400"
              }`}
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Botones de edición */}
            {isEditing ? (
              <>
                <button
                  onClick={onGuardar}
                  className="bg-green-600 hover:bg-green-700 rounded-full p-1.5 shadow-lg transition-colors"
                  title="Guardar cambios"
                >
                  <Save className="h-4 w-4 text-white" />
                </button>
                <button
                  onClick={onCancelar}
                  className="bg-red-600 hover:bg-red-700 rounded-full p-1.5 shadow-lg transition-colors"
                  title="Cancelar edición"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </>
            ) : (
              <button
                onClick={onEditar}
                className="opacity-0 group-hover:opacity-100 bg-blue-600 hover:bg-blue-700 rounded-full p-1.5 shadow-lg transition-all"
                title="Editar criterio"
              >
                <Edit2 className="h-4 w-4 text-white" />
              </button>
            )}

            {isSelected && !isEditing && (
              <div className="bg-amber-600 rounded-full p-1 shadow-lg">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Criterio completo destacado */}
        <div
          className={`mb-4 p-4 rounded-lg transition-colors duration-300 ${
            isSelected ? "bg-white/50 dark:bg-black/20" : "bg-slate-50 dark:bg-slate-900"
          }`}
        >
          <p
            className={`text-sm font-bold leading-relaxed transition-colors duration-300 ${
              isSelected ? "text-amber-800 dark:text-amber-200" : "text-slate-700 dark:text-slate-300"
            }`}
          >
            {criterio.criterioCompleto}
          </p>
        </div>

        {/* Componentes del criterio - Editables o Solo lectura */}
        {isEditing ? (
          <CriterioFormulario criterio={criterio} onCambioCampo={onCambioCampo} />
        ) : (
          <CriterioDetalles criterio={criterio} isSelected={isSelected} />
        )}
      </div>
    </div>
  );
}
