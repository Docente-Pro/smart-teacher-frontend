import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth.store";
import { usePermissions } from "@/hooks/usePermissions";
import { useSesionComplementaria } from "@/hooks/useSesionComplementaria";
import { listarUnidadesByUsuario } from "@/services/unidad.service";
import { isUnidadListaActiva } from "@/utils/unidadActiva";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import type { IUnidadListItem } from "@/interfaces/IUnidadList";
import type { TipoSesionComplementaria } from "@/interfaces/ISesionComplementaria";
import {
  ArrowLeft,
  BookOpen,
  Heart,
  Loader2,
  Sparkles,
  FolderOpen,
  Check,
  AlertTriangle,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const TIPOS: { value: TipoSesionComplementaria; label: string; icon: typeof BookOpen; desc: string; gradient: string }[] = [
  {
    value: "Tutoría",
    label: "Tutoría",
    icon: Heart,
    desc: "Sesión orientada al acompañamiento socioemocional, convivencia escolar y desarrollo personal de los estudiantes.",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    value: "Plan Lector",
    label: "Plan Lector",
    icon: BookOpen,
    desc: "Sesión enfocada en el fomento de la lectura, comprensión lectora y estrategias de animación a la lectura.",
    gradient: "from-amber-500 to-orange-600",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function GenerarSesionComplementaria() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isPremium } = usePermissions();

  // ─── State ───
  const [loading, setLoading] = useState(true);
  const [unidades, setUnidades] = useState<IUnidadListItem[]>([]);
  const [selectedUnidadId, setSelectedUnidadId] = useState<string>("");
  const [tipo, setTipo] = useState<TipoSesionComplementaria | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const { isRunning, phaseLabel, run } = useSesionComplementaria();

  // ─── Cargar unidades del usuario ───
  useEffect(() => {
    if (!user?.id) return;

    listarUnidadesByUsuario(user.id)
      .then((data) => {
        // Pago confirmado y unidad activa (no finalizada)
        const pagadas = data.filter(
          (u) =>
            u.estadoPago === "CONFIRMADO" && isUnidadListaActiva(u.fechaFin),
        );
        setUnidades(pagadas);
        if (pagadas.length === 1) {
          setSelectedUnidadId(pagadas[0].id);
        }
      })
      .catch(() => {
        handleToaster("Error al cargar tus unidades", "error");
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  // ─── Validación ───
  const canSubmit = tipo !== null && titulo.trim().length >= 3 && !isRunning;

  // ─── Generar sesión ───
  const handleGenerar = useCallback(async () => {
    if (!tipo || !titulo.trim()) return;

    const result = await run({
      tipo,
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || undefined,
      unidadId: selectedUnidadId || undefined,
    });

    if (result?.success && result.sesion) {
      navigate("/sesion-complementaria-result", {
        state: { complementariaData: result },
      });
    }
  }, [tipo, titulo, descripcion, selectedUnidadId, run, navigate]);

  // ─── Loading skeleton ───
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  // ─── Sin premium ───
  if (!isPremium) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-center max-w-md">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4">
            Función Premium
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Las sesiones complementarias están disponibles con un plan premium activo.
          </p>
          <Button onClick={() => navigate("/planes")}>
            Ver planes
          </Button>
        </div>
      </div>
    );
  }

  // ─── Main render ───
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
              Sesión Complementaria
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Genera sesiones de Tutoría o Plan Lector con IA (45 min)
            </p>
          </div>
        </div>

        {/* Step 1: Seleccionar tipo */}
        <div className="space-y-6">
          <div>
            <Label className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-3 block">
              1. Tipo de sesión
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TIPOS.map((t) => {
                const selected = tipo === t.value;
                const Icon = t.icon;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTipo(t.value)}
                    className={`
                      relative p-5 rounded-xl border-2 text-left transition-all duration-200
                      ${
                        selected
                          ? "border-transparent ring-2 ring-offset-2 ring-pink-500 dark:ring-offset-slate-900 bg-gradient-to-br " + t.gradient + " text-white shadow-lg scale-[1.02]"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${selected ? "bg-white/20" : "bg-slate-100 dark:bg-slate-700"}`}>
                        <Icon className={`h-5 w-5 ${selected ? "text-white" : "text-slate-600 dark:text-slate-300"}`} />
                      </div>
                      <span className="font-semibold text-lg">{t.label}</span>
                      {selected && <Check className="h-5 w-5 ml-auto" />}
                    </div>
                    <p className={`text-sm leading-relaxed ${selected ? "text-white/90" : "text-slate-500 dark:text-slate-400"}`}>
                      {t.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Título */}
          <div>
            <Label htmlFor="titulo" className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-2 block">
              2. Título de la sesión
            </Label>
            <Input
              id="titulo"
              placeholder={
                tipo === "Tutoría"
                  ? 'Ej: "Convivencia escolar", "Manejo de emociones"'
                  : 'Ej: "Lectura de cuentos andinos", "Comprensión de textos narrativos"'
              }
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              maxLength={120}
              className="text-base"
            />
            <p className="text-xs text-slate-400 mt-1">{titulo.length}/120 caracteres</p>
          </div>

          {/* Step 3: Descripción (opcional) */}
          <div>
            <Label htmlFor="descripcion" className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-2 block">
              3. Descripción{" "}
              <span className="text-sm font-normal text-slate-400">(opcional)</span>
            </Label>
            <textarea
              id="descripcion"
              placeholder="Agrega contexto adicional para que la IA genere una sesión más personalizada..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              maxLength={500}
              rows={3}
              className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white
                placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950
                focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
                dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400
                dark:focus-visible:ring-slate-300 resize-none"
            />
            <p className="text-xs text-slate-400 mt-1">{descripcion.length}/500 caracteres</p>
          </div>

          {/* Step 4: Unidad (opcional) */}
          {unidades.length > 0 && (
            <div>
              <Label className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-2 block">
                4. Vincular a unidad{" "}
                <span className="text-sm font-normal text-slate-400">(opcional)</span>
              </Label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setSelectedUnidadId("")}
                  className={`
                    w-full p-3 rounded-lg border text-left text-sm transition-all
                    ${
                      !selectedUnidadId
                        ? "border-pink-500 bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-300"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }
                  `}
                >
                  <span className="font-medium">Sin unidad</span>
                  <span className="text-xs text-slate-400 ml-2">— sesión independiente</span>
                </button>
                {unidades.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedUnidadId(u.id)}
                    className={`
                      w-full p-3 rounded-lg border text-left text-sm transition-all flex items-center gap-3
                      ${
                        selectedUnidadId === u.id
                          ? "border-pink-500 bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-300"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }
                    `}
                  >
                    <FolderOpen className="h-4 w-4 flex-shrink-0 text-slate-400" />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{u.titulo}</div>
                      <div className="text-xs text-slate-400">
                        {u.nivel?.nombre} — {u.grado?.nombre}
                      </div>
                    </div>
                    {selectedUnidadId === u.id && (
                      <Check className="h-4 w-4 ml-auto flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Info box */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
            <div className="flex gap-3">
              <Sparkles className="h-5 w-5 text-pink-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                <p className="font-medium">La IA generará automáticamente:</p>
                <ul className="list-disc list-inside text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                  <li>Propósito de la sesión de {tipo || "..."}</li>
                  <li>Enfoques transversales relacionados</li>
                  <li>Secuencia didáctica completa (inicio, desarrollo, cierre)</li>
                  <li>Recursos y materiales necesarios</li>
                  <li>Reflexiones pedagógicas</li>
                </ul>
                <p className="text-xs text-slate-400">
                  Duración fija: <strong>45 minutos</strong> — Transversal (no requiere área curricular)
                </p>
              </div>
            </div>
          </div>

          {/* Generating state */}
          {isRunning && (
            <div className="rounded-xl border border-pink-200 dark:border-pink-800 bg-pink-50 dark:bg-pink-500/10 p-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-pink-600" />
                <span className="text-sm font-medium text-pink-700 dark:text-pink-300">
                  {phaseLabel}
                </span>
              </div>
            </div>
          )}

          {/* Submit */}
          <Button
            onClick={handleGenerar}
            disabled={!canSubmit}
            size="lg"
            className="w-full gap-2 bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white shadow-lg"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generando con IA...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generar sesión complementaria
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default GenerarSesionComplementaria;
