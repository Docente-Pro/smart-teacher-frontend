import { useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays,
  Upload,
  Camera,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Info,
  ImageIcon,
} from "lucide-react";
import type { HorarioEscolar } from "@/interfaces/IHorario";
import { AREAS_CURRICULARES } from "@/interfaces/IHorario";

// ═══════════════════════════════════════════════════════
// Constantes de colores por área
// ═══════════════════════════════════════════════════════

const AREA_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Comunicación: { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-700 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800" },
  Matemática: { bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-700 dark:text-red-300", border: "border-red-200 dark:border-red-800" },
  "Personal Social": { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
  "Ciencia y Tecnología": { bg: "bg-green-50 dark:bg-green-950/30", text: "text-green-700 dark:text-green-300", border: "border-green-200 dark:border-green-800" },
  "Educación Religiosa": { bg: "bg-purple-50 dark:bg-purple-950/30", text: "text-purple-700 dark:text-purple-300", border: "border-purple-200 dark:border-purple-800" },
  "Arte y Cultura": { bg: "bg-pink-50 dark:bg-pink-950/30", text: "text-pink-700 dark:text-pink-300", border: "border-pink-200 dark:border-pink-800" },
  "Educación Física": { bg: "bg-orange-50 dark:bg-orange-950/30", text: "text-orange-700 dark:text-orange-300", border: "border-orange-200 dark:border-orange-800" },
  Tutoría: { bg: "bg-teal-50 dark:bg-teal-950/30", text: "text-teal-700 dark:text-teal-300", border: "border-teal-200 dark:border-teal-800" },
  "Plan Lector": { bg: "bg-indigo-50 dark:bg-indigo-950/30", text: "text-indigo-700 dark:text-indigo-300", border: "border-indigo-200 dark:border-indigo-800" },
  Inglés: { bg: "bg-cyan-50 dark:bg-cyan-950/30", text: "text-cyan-700 dark:text-cyan-300", border: "border-cyan-200 dark:border-cyan-800" },
  Computación: { bg: "bg-teal-50 dark:bg-teal-950/30", text: "text-teal-700 dark:text-teal-300", border: "border-teal-200 dark:border-teal-800" },
};

function getAreaStyle(area: string) {
  return AREA_COLORS[area] ?? {
    bg: "bg-slate-50 dark:bg-slate-900",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-700",
  };
}

// ═══════════════════════════════════════════════════════
// Props
// ═══════════════════════════════════════════════════════

interface HorarioPanelProps {
  horario: HorarioEscolar | null;
  scanning: boolean;
  confianza: "alta" | "media" | "baja" | null;
  notas: string | null;
  error: string | null;
  onScan: (file: File) => Promise<unknown>;
  onSlotChange: (diaIndex: number, horaIndex: number, area: string) => void;
  onClear: () => void;
  disabled?: boolean;
}

// ═══════════════════════════════════════════════════════
// Componente: HorarioPanel
// ═══════════════════════════════════════════════════════

export function HorarioPanel({
  horario,
  scanning,
  confianza,
  notas,
  error,
  onScan,
  onSlotChange,
  onClear,
  disabled = false,
}: HorarioPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    // Validar tipo
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      return;
    }
    // Validar tamaño (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return;
    }
    // Preview
    const url = URL.createObjectURL(file);
    setPreview(url);
    onScan(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleClear = () => {
    setPreview(null);
    onClear();
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Card className="border-2 border-dashed border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden mb-8">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Horario Escolar</CardTitle>
              <CardDescription className="text-xs">
                Opcional — sube una foto de tu horario para que la IA lo detecte
              </CardDescription>
            </div>
          </div>
          {horario && (
            <Button
              onClick={handleClear}
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1.5"
              disabled={disabled}
            >
              <Trash2 className="h-4 w-4" />
              Limpiar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ── Zona de Upload (cuando no hay horario) ── */}
        {!horario && !scanning && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
              ${isDragging
                ? "border-blue-400 bg-blue-50 dark:bg-blue-950/30 scale-[1.01]"
                : "border-slate-300 dark:border-slate-600 hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            onClick={() => !disabled && inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleInputChange}
              className="hidden"
              disabled={disabled}
            />

            <div className="flex flex-col items-center gap-3">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/50 dark:to-blue-900/50 flex items-center justify-center">
                <Camera className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <p className="text-base font-medium text-slate-700 dark:text-slate-300">
                  Arrastra una foto o haz clic para subir
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  JPG, PNG o WebP — máximo 10 MB
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 mt-1"
                disabled={disabled}
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              >
                <Upload className="h-4 w-4" />
                Seleccionar imagen
              </Button>
            </div>

            {/* Tip */}
            <div className="mt-4 flex items-start gap-2 text-left bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 mx-auto max-w-md">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Si no subes un horario, la IA generará automáticamente una distribución
                equilibrada que incluye Tutoría y Plan Lector.
              </p>
            </div>
          </div>
        )}

        {/* ── Escaneando... ── */}
        {scanning && (
          <div className="py-10 flex flex-col items-center gap-4">
            {preview && (
              <div className="relative w-48 h-32 rounded-lg overflow-hidden shadow-md mb-2">
                <img src={preview} alt="Horario" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-blue-500 animate-spin" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Escaneando horario con IA...
                </p>
                <p className="text-xs text-slate-400">
                  Detectando áreas y turnos de la imagen
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {error && !scanning && (
          <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/30 rounded-lg p-3 border border-red-200 dark:border-red-800">
            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                Error al escanear
              </p>
              <p className="text-xs text-red-500 mt-0.5">{error}</p>
              <Button
                onClick={() => inputRef.current?.click()}
                variant="outline"
                size="sm"
                className="mt-2 text-xs gap-1"
              >
                <Camera className="h-3 w-3" />
                Intentar con otra imagen
              </Button>
            </div>
          </div>
        )}

        {/* ── Resultado: indicador de confianza + tabla editable ── */}
        {horario && !scanning && (
          <>
            {/* Confianza + notas */}
            <div className="flex items-center gap-3 flex-wrap">
              {confianza && (
                <div
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${
                    confianza === "alta"
                      ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300"
                      : confianza === "media"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300"
                        : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Confianza: {confianza}
                </div>
              )}

              {preview && (
                <button
                  onClick={() => window.open(preview, "_blank")}
                  className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline"
                >
                  <ImageIcon className="h-3 w-3" />
                  Ver imagen original
                </button>
              )}
            </div>

            {notas && (
              <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-600 dark:text-amber-400">{notas}</p>
              </div>
            )}

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Revisa y corrige si es necesario. Este horario define qué área se trabaja cada día.
            </p>

            {/* ── Tabla editable: Horas (filas) × Días (columnas) ── */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 text-center font-semibold text-slate-700 dark:text-slate-300 w-16">
                      Hora
                    </th>
                    {horario.dias.map((dia) => (
                      <th
                        key={dia.dia}
                        className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 text-center font-semibold text-slate-700 dark:text-slate-300"
                      >
                        {dia.dia}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: Math.max(...horario.dias.map((d) => d.horas.length), 0) }).map((_, hIdx) => (
                    <tr key={hIdx} className={hIdx === 2 ? "border-b-4 border-b-amber-200 dark:border-b-amber-800" : ""}>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 text-center font-medium text-slate-500 dark:text-slate-400 text-xs">
                        H{hIdx + 1}
                        {hIdx === 2 && (
                          <span className="block text-[10px] text-amber-500 font-normal">recreo</span>
                        )}
                      </td>
                      {horario.dias.map((dia, dIdx) => {
                        const slot = dia.horas[hIdx];
                        const areaName = slot?.area ?? "";
                        const style = getAreaStyle(areaName);
                        return (
                          <td
                            key={dia.dia}
                            className={`border border-slate-200 dark:border-slate-700 p-1 ${style.bg}`}
                          >
                            <Select
                              value={areaName}
                              onValueChange={(val) => onSlotChange(dIdx, hIdx, val)}
                              disabled={disabled}
                            >
                              <SelectTrigger
                                className={`h-8 text-[11px] font-medium border ${style.border} ${style.text}`}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {AREAS_CURRICULARES.map((a) => (
                                  <SelectItem key={a} value={a} className="text-xs">
                                    {a}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default HorarioPanel;
