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
  ArrowLeft,
  GraduationCap,
  CheckCircle2,
  PenLine,
  ScanLine,
  Pencil,
} from "lucide-react";
import { useExtraerAlumnos } from "@/hooks/useExtraerAlumnos";
import type { IAlumno } from "@/interfaces/IAula";
import { saveAlumnosToAula } from "@/services/aula.service";
import { useAuthStore } from "@/store/auth.store";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { markAlumnosUploaded, saveAlumnos, getSavedAlumnos } from "@/utils/alumnosStorage";

type InternalStep = "select-grado" | "select-method" | "upload-image" | "edit-table";

const INITIAL_MANUAL_ROWS = 5;

interface SubirListaAlumnosViewProps {
  /** Se llama cuando el usuario quiere continuar (skip o después de subir) */
  onContinue: () => void;
  /** Texto del botón de continuar (default: "Continuar al dashboard") */
  continueLabel?: string;
  /** ID del grado para almacenar la lista por grado (secundaria) — se ignora si hay gradosDisponibles */
  gradoId?: number;
  /** Grados disponibles para el docente (secundaria multi-grado) */
  gradosDisponibles?: Array<{ id: number; nombre: string }>;
}

function createEmptyRows(count: number): IAlumno[] {
  return Array.from({ length: count }, (_, i) => ({
    orden: i + 1,
    apellidos: "",
    nombres: "",
    sexo: "M" as const,
    dni: "",
  }));
}

export function SubirListaAlumnosView({
  onContinue,
  continueLabel = "Continuar al dashboard",
  gradoId: gradoIdProp,
  gradosDisponibles = [],
}: SubirListaAlumnosViewProps) {
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
    setAlumnos,
    reset,
  } = useExtraerAlumnos();
  const { user } = useAuthStore();
  const [savingToBackend, setSavingToBackend] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const requiereSeleccionGrado = gradosDisponibles.length > 1;

  const [selectedGradoId, setSelectedGradoId] = useState<number | undefined>(
    requiereSeleccionGrado ? undefined : gradoIdProp
  );
  const [selectedGradoNombre, setSelectedGradoNombre] = useState<string>("");

  const initialStep: InternalStep = requiereSeleccionGrado ? "select-grado" : "select-method";
  const [step, setStep] = useState<InternalStep>(initialStep);

  const effectiveGradoId = selectedGradoId ?? gradoIdProp;

  function handleSelectGrado(id: number, nombre: string) {
    setSelectedGradoId(id);
    setSelectedGradoNombre(nombre);
  }

  function handleConfirmGrado() {
    if (!selectedGradoId) {
      handleToaster("Selecciona un año primero", "error");
      return;
    }
    setStep("select-method");
  }

  function getExistingAlumnos(): IAlumno[] {
    return getSavedAlumnos(effectiveGradoId);
  }

  function handleEditExisting() {
    const existing = getExistingAlumnos();
    setAlumnos(existing);
    setStep("edit-table");
  }

  function handleSelectOCR() {
    setStep("upload-image");
  }

  function handleSelectManual() {
    setAlumnos(createEmptyRows(INITIAL_MANUAL_ROWS));
    setStep("edit-table");
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    selectFile(file);
  }

  function handleClickUploadArea() {
    fileInputRef.current?.click();
  }

  async function handleExtraer() {
    await extraer();
    setStep("edit-table");
  }

  function handleBackToMethod() {
    reset();
    setStep("select-method");
  }

  function handleBackToGrado() {
    reset();
    setSelectedGradoId(undefined);
    setSelectedGradoNombre("");
    setStep("select-grado");
  }

  async function handleSave() {
    const alumnosValidos = alumnos.filter(
      (a) => a.apellidos.trim() !== "" || a.nombres.trim() !== ""
    );
    if (alumnosValidos.length === 0) {
      handleToaster("Agrega al menos un alumno con nombre", "error");
      return;
    }

    const alumnosNumerados = alumnosValidos.map((a, i) => ({
      ...a,
      orden: i + 1,
    }));

    setSavingToBackend(true);
    try {
      if (user?.id) {
        await saveAlumnosToAula(user.id, alumnosNumerados, {
          nombre: selectedGradoNombre ? `Aula ${selectedGradoNombre}` : "Mi aula",
          nivelId: user.nivelId ?? 1,
          gradoId: effectiveGradoId ?? user.gradoId ?? 1,
        });
      }
    } catch {
      handleToaster(
        "No se pudo guardar la lista en el servidor. Se guardó solo en este dispositivo.",
        "error"
      );
    } finally {
      setSavingToBackend(false);
    }
    saveAlumnos(alumnosNumerados, effectiveGradoId);
    markAlumnosUploaded(effectiveGradoId);
    onContinue();
  }

  // ─────────────────────────────────────────────────────
  // PASO: Seleccionar grado (solo secundaria multi-grado)
  // ─────────────────────────────────────────────────────
  if (step === "select-grado") {
    return (
      <div className="flex flex-col items-center text-center px-2 py-4">
        <div className="relative mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          ¿Para qué año es esta lista?
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 max-w-xs">
          Selecciona el año para el cual deseas subir o crear la lista de alumnos
        </p>

        <div className="grid grid-cols-2 gap-3 w-full mb-5">
          {gradosDisponibles.map((grado) => {
            const isSelected = selectedGradoId === grado.id;
            return (
              <button
                key={grado.id}
                onClick={() => handleSelectGrado(grado.id, grado.nombre)}
                className={`
                  relative p-4 rounded-xl transition-all duration-200 text-left
                  ${
                    isSelected
                      ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 scale-[1.02]"
                      : "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <GraduationCap
                    className={`w-5 h-5 flex-shrink-0 ${
                      isSelected ? "text-white" : "text-emerald-500"
                    }`}
                  />
                  <span
                    className={`text-sm font-semibold ${
                      isSelected ? "text-white" : "text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {grado.nombre}
                  </span>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 w-full">
          <Button
            onClick={handleConfirmGrado}
            disabled={!selectedGradoId}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
          >
            Continuar
            <ArrowRight className="w-4 h-4 ml-2" />
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

  // ───────────────────────────────────
  // PASO: Elegir método (OCR o manual)
  // ───────────────────────────────────
  if (step === "select-method") {
    return (
      <div className="flex flex-col items-center text-center px-2 py-4">
        <div className="relative mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Users className="w-8 h-8 text-white" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
          Lista de alumnos
        </h3>
        {selectedGradoNombre && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium mb-3">
            <GraduationCap className="w-3.5 h-3.5" />
            {selectedGradoNombre}
          </span>
        )}
        {(() => {
          const existingAlumnos = getExistingAlumnos();
          const tieneListaExistente = existingAlumnos.length > 0;
          return (
            <>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
                {tieneListaExistente
                  ? `Tienes ${existingAlumnos.length} alumno(s) guardados. ¿Qué deseas hacer?`
                  : "¿Cómo deseas ingresar tu lista de alumnos?"}
              </p>

              <div className="flex flex-col gap-3 w-full mb-5">
                {tieneListaExistente && (
                  <button
                    onClick={handleEditExisting}
                    className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-2 border-emerald-300 dark:border-emerald-600 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md transition-all text-left group"
                  >
                    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/25 flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Pencil className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                        Editar lista actual
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Modifica, agrega o elimina alumnos de tu lista guardada ({existingAlumnos.length} alumnos)
                      </p>
                    </div>
                  </button>
                )}

                <button
                  onClick={handleSelectOCR}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all text-left group"
                >
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25 flex-shrink-0 group-hover:scale-105 transition-transform">
                    <ScanLine className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                      {tieneListaExistente ? "Reemplazar con imagen" : "Subir imagen o PDF"}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Sube una foto de tu nómina y la extraeremos con IA
                    </p>
                  </div>
                </button>

                <button
                  onClick={handleSelectManual}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md transition-all text-left group"
                >
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/25 flex-shrink-0 group-hover:scale-105 transition-transform">
                    <PenLine className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                      {tieneListaExistente ? "Empezar de cero" : "Llenar manualmente"}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Ingresa los datos de cada alumno celda por celda
                    </p>
                  </div>
                </button>
              </div>
            </>
          );
        })()}

        <div className="flex flex-col gap-2 w-full">
          {requiereSeleccionGrado && (
            <Button
              onClick={handleBackToGrado}
              variant="ghost"
              className="w-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Cambiar de año
            </Button>
          )}
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

  // ──────────────────────────────
  // PASO: Subir imagen (OCR)
  // ──────────────────────────────
  if (step === "upload-image") {
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

    return (
      <div className="flex flex-col items-center text-center px-2 py-4">
        <div className="relative mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <ScanLine className="w-8 h-8 text-white" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Sube tu lista de alumnos
        </h3>
        {selectedGradoNombre && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            {selectedGradoNombre}
          </span>
        )}
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 max-w-xs">
          Sube una foto o PDF de tu lista de alumnos y la extraeremos
          automáticamente con IA.
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

        {errorMessage && (
          <div className="flex items-center gap-2 text-red-600 text-sm mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

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
            onClick={handleBackToMethod}
            variant="ghost"
            className="w-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────
  // PASO: Tabla editable (OCR o manual)
  // ──────────────────────────────────────
  if (step === "edit-table") {
    return (
      <div className="flex flex-col px-1 py-2">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 text-center">
          Lista de alumnos
        </h3>
        {selectedGradoNombre && (
          <div className="flex justify-center mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
              <GraduationCap className="w-3.5 h-3.5" />
              {selectedGradoNombre}
            </span>
          </div>
        )}
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 text-center">
          {alumnos.some((a) => a.apellidos || a.nombres)
            ? `Revisa y edita los datos. ${alumnos.filter((a) => a.apellidos.trim() || a.nombres.trim()).length} alumno(s) con datos.`
            : "Ingresa los datos de cada alumno. Puedes agregar más filas al final."}
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
            onClick={handleSave}
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
            onClick={handleBackToMethod}
            variant="ghost"
            className="w-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

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
