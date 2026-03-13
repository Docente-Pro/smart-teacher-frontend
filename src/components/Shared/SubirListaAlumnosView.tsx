import { useRef, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Users,
  Loader2,
  Trash2,
  Plus,
  AlertCircle,
  ImageIcon,
  ArrowRight,
} from "lucide-react";
import { useExtraerAlumnos } from "@/hooks/useExtraerAlumnos";
import type { IAlumno } from "@/interfaces/IAula";
import { saveAlumnosToAula } from "@/services/aula.service";
import { useAuthStore } from "@/store/auth.store";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { markAlumnosUploaded, saveAlumnos } from "@/utils/alumnosStorage";

interface SubirListaAlumnosViewProps {
  /** Se llama cuando el usuario quiere continuar (skip o después de subir) */
  onContinue: () => void;
  /** Texto del botón de continuar (default: "Continuar al dashboard") */
  continueLabel?: string;
}

/**
 * Vista post-pago para subir la lista de alumnos (OCR).
 * Se muestra dentro de UpgradePremiumModal después de la activación.
 * Es completamente opcional: el usuario puede saltar este paso.
 */
export function SubirListaAlumnosView({ onContinue, continueLabel = "Continuar al dashboard" }: SubirListaAlumnosViewProps) {
  const {
    status,
    alumnos,
    errorMessage,
    selectedFile,
    selectFile,
    extraer,
    updateAlumno,
    removeAlumno,
    addAlumno,
    reset,
  } = useExtraerAlumnos();
  const { user } = useAuthStore();
  const [savingToBackend, setSavingToBackend] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    selectFile(file);
  }

  function handleClickUploadArea() {
    fileInputRef.current?.click();
  }

  async function handleExtraer() {
    await extraer();
  }

  function handleRetry() {
    reset();
  }

  // ─── Estado idle: seleccionar imagen ───
  if (status === "idle" || (status === "error" && alumnos.length === 0)) {
    return (
      <div className="flex flex-col items-center text-center px-2 py-4">
        {/* Icono */}
        <div className="relative mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Users className="w-8 h-8 text-white" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Sube tu lista de alumnos
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 max-w-xs">
          Sube una foto o PDF de tu lista de alumnos y la extraeremos
          automáticamente con IA. <span className="font-medium">Este paso es opcional.</span>
        </p>

        {/* Zona de carga */}
        <div
          onClick={handleClickUploadArea}
          className="w-full border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 mb-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          {selectedFile ? (
            <div className="flex items-center gap-3 justify-center">
              <ImageIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <span className="text-sm text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                {selectedFile.name}
              </span>
              <span className="text-xs text-slate-400">
                ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-slate-400" />
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Haz clic para seleccionar una imagen
              </span>
              <span className="text-xs text-slate-400">
                JPG, PNG, WEBP o PDF — máx. 10 MB
              </span>
            </div>
          )}
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="flex items-center gap-2 text-red-600 text-sm mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Botones */}
        <div className="flex flex-col gap-2 w-full">
          <Button
            onClick={handleExtraer}
            disabled={!selectedFile}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            Extraer lista de alumnos
          </Button>
          <Button
            onClick={onContinue}
            variant="ghost"
            className="w-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
          >
            Saltar por ahora
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  // ─── Estado uploading: procesando OCR ───
  if (status === "uploading") {
    return (
      <div className="flex flex-col items-center text-center px-2 py-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Extrayendo alumnos...
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
          Estamos procesando tu imagen con IA. Esto puede tomar unos segundos.
        </p>
      </div>
    );
  }

  // ─── Estado success: tabla editable de alumnos ───
  if (status === "success" || (status === "error" && alumnos.length > 0)) {
    return (
      <div className="flex flex-col px-1 py-2">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 text-center">
          Lista de alumnos extraída
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 text-center">
          Revisa y edita los datos antes de continuar. Se encontraron{" "}
          <span className="font-semibold">{alumnos.length}</span> alumnos.
        </p>

        {errorMessage && (
          <div className="flex items-center gap-2 text-red-600 text-xs mb-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tabla editable */}
        <div className="max-h-[40vh] overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg mb-3">
          <table className="w-full text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0">
              <tr>
                <th className="px-2 py-1.5 text-left w-8">N°</th>
                <th className="px-2 py-1.5 text-left">Apellidos</th>
                <th className="px-2 py-1.5 text-left">Nombres</th>
                <th className="px-2 py-1.5 text-center w-10">Sexo</th>
                <th className="px-2 py-1.5 text-center w-6"></th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map((alumno, idx) => (
                <AlumnoRow
                  key={idx}
                  alumno={alumno}
                  index={idx}
                  onUpdate={updateAlumno}
                  onRemove={removeAlumno}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Agregar alumno */}
        <button
          onClick={addAlumno}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-4 mx-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Agregar alumno
        </button>

        {/* Botones */}
        <div className="flex flex-col gap-2 w-full">
          <Button
            disabled={savingToBackend}
            onClick={async () => {
              setSavingToBackend(true);
              try {
                if (user?.id) {
                  await saveAlumnosToAula(user.id, alumnos, {
                    nombre: "Mi aula",
                    nivelId: user.nivelId ?? 1,
                    gradoId: user.gradoId ?? 1,
                  });
                }
              } catch (e) {
                handleToaster("No se pudo guardar la lista en el servidor. Se guardó solo en este dispositivo.", "error");
              } finally {
                setSavingToBackend(false);
              }
              saveAlumnos(alumnos);
              markAlumnosUploaded();
              onContinue();
            }}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all"
          >
            {savingToBackend ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                {continueLabel}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
          <Button
            onClick={handleRetry}
            variant="ghost"
            className="w-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 text-xs"
          >
            Subir otra imagen
          </Button>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
}

// ─── Fila editable de alumno ───

function AlumnoRow({
  alumno,
  index,
  onUpdate,
  onRemove,
}: {
  alumno: IAlumno;
  index: number;
  onUpdate: (index: number, alumno: IAlumno) => void;
  onRemove: (index: number) => void;
}) {
  function handleChange(field: keyof IAlumno, value: string) {
    onUpdate(index, { ...alumno, [field]: value });
  }

  return (
    <tr className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
      <td className="px-2 py-1 text-slate-500 text-center">{alumno.orden}</td>
      <td className="px-1 py-1">
        <input
          type="text"
          value={alumno.apellidos}
          onChange={(e) => handleChange("apellidos", e.target.value)}
          className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-400 focus:outline-none px-1 py-0.5 text-xs"
          placeholder="Apellidos"
        />
      </td>
      <td className="px-1 py-1">
        <input
          type="text"
          value={alumno.nombres}
          onChange={(e) => handleChange("nombres", e.target.value)}
          className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-400 focus:outline-none px-1 py-0.5 text-xs"
          placeholder="Nombres"
        />
      </td>
      <td className="px-1 py-1 text-center">
        <select
          value={alumno.sexo}
          onChange={(e) => handleChange("sexo", e.target.value)}
          className="bg-transparent text-xs text-center focus:outline-none cursor-pointer"
        >
          <option value="M">M</option>
          <option value="F">F</option>
        </select>
      </td>
      <td className="px-1 py-1 text-center">
        <button
          onClick={() => onRemove(index)}
          className="text-slate-400 hover:text-red-500 transition-colors"
          title="Eliminar"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  );
}

export default SubirListaAlumnosView;
