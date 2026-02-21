import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  User,
  Share2,
  Users,
  AlertCircle,
} from "lucide-react";
import type { TipoUnidad } from "@/interfaces/IUnidad";

interface Props {
  onContinue: (tipo: TipoUnidad, maxMiembros: number) => void;
}

/**
 * Pre-paso: el usuario elige si la unidad será PERSONAL o COMPARTIDA.
 * Si elige COMPARTIDA, debe indicar la cantidad máxima de docentes (2-5).
 * Esto determina el precio y el flujo posterior.
 */
function Step0TipoUnidad({ onContinue }: Props) {
  const [tipo, setTipo] = useState<TipoUnidad>("PERSONAL");
  const [maxMiembros, setMaxMiembros] = useState(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-3xl mx-auto">
        {/* ── Header ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg mb-6 shadow-lg">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold tracking-wide">
              ANTES DE EMPEZAR
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-4 tracking-tight">
            ¿Cómo trabajarás tu unidad?
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Elige el tipo de unidad que deseas crear
          </p>
        </div>

        {/* ── Selector PERSONAL / COMPARTIDA ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {/* PERSONAL */}
          <div
            onClick={() => setTipo("PERSONAL")}
            className={`
              group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300
              ${
                tipo === "PERSONAL"
                  ? "ring-4 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900 scale-[1.02] shadow-2xl"
                  : "hover:scale-[1.02] hover:shadow-xl border-2 border-slate-200 dark:border-slate-700"
              }
            `}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 transition-opacity duration-300 ${
                tipo === "PERSONAL"
                  ? "opacity-100"
                  : "opacity-10 group-hover:opacity-20"
              }`}
            />
            <div className="relative p-8 flex flex-col items-center gap-4">
              <div
                className={`p-4 rounded-xl transition-transform duration-300 ${
                  tipo === "PERSONAL"
                    ? "bg-white/20 backdrop-blur-sm scale-110"
                    : "bg-slate-100 dark:bg-slate-800 group-hover:scale-110"
                }`}
              >
                <User
                  className={`h-10 w-10 ${
                    tipo === "PERSONAL"
                      ? "text-white"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                />
              </div>
              <div className="text-center">
                <p
                  className={`text-xl font-bold mb-1 ${
                    tipo === "PERSONAL"
                      ? "text-white"
                      : "text-slate-900 dark:text-white"
                  }`}
                >
                  Personal
                </p>
                <p
                  className={`text-sm ${
                    tipo === "PERSONAL"
                      ? "text-white/80"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  Creas y gestionas la unidad individualmente
                </p>
              </div>
              {tipo === "PERSONAL" && (
                <div className="absolute top-3 right-3 bg-white rounded-full p-1 shadow-lg">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
              )}
            </div>
          </div>

          {/* COMPARTIDA */}
          <div
            onClick={() => setTipo("COMPARTIDA")}
            className={`
              group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300
              ${
                tipo === "COMPARTIDA"
                  ? "ring-4 ring-sky-500 ring-offset-2 dark:ring-offset-slate-900 scale-[1.02] shadow-2xl"
                  : "hover:scale-[1.02] hover:shadow-xl border-2 border-slate-200 dark:border-slate-700"
              }
            `}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br from-sky-500 to-blue-500 transition-opacity duration-300 ${
                tipo === "COMPARTIDA"
                  ? "opacity-100"
                  : "opacity-10 group-hover:opacity-20"
              }`}
            />
            <div className="relative p-8 flex flex-col items-center gap-4">
              <div
                className={`p-4 rounded-xl transition-transform duration-300 ${
                  tipo === "COMPARTIDA"
                    ? "bg-white/20 backdrop-blur-sm scale-110"
                    : "bg-slate-100 dark:bg-slate-800 group-hover:scale-110"
                }`}
              >
                <Share2
                  className={`h-10 w-10 ${
                    tipo === "COMPARTIDA"
                      ? "text-white"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                />
              </div>
              <div className="text-center">
                <p
                  className={`text-xl font-bold mb-1 ${
                    tipo === "COMPARTIDA"
                      ? "text-white"
                      : "text-slate-900 dark:text-white"
                  }`}
                >
                  Compartida
                </p>
                <p
                  className={`text-sm ${
                    tipo === "COMPARTIDA"
                      ? "text-white/80"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  Colabora con otros docentes en la misma unidad
                </p>
              </div>
              {tipo === "COMPARTIDA" && (
                <div className="absolute top-3 right-3 bg-white rounded-full p-1 shadow-lg">
                  <CheckCircle2 className="h-5 w-5 text-sky-600" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Configuración COMPARTIDA ── */}
        {tipo === "COMPARTIDA" && (
          <Card className="mb-8 border-2 border-sky-200 dark:border-sky-800 shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="h-5 w-5 text-sky-600" />
                Configuración Compartida
              </CardTitle>
              <CardDescription>
                Establece la cantidad de docentes que participarán
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label
                  htmlFor="maxMiembros"
                  className="text-sm font-medium mb-1.5 block"
                >
                  Máximo de Docentes
                </Label>
                <Input
                  id="maxMiembros"
                  type="number"
                  min={2}
                  max={5}
                  value={maxMiembros}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setMaxMiembros(Math.min(5, Math.max(2, v)));
                  }}
                  className="h-12 text-base max-w-[200px]"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Entre 2 y 5 docentes pueden colaborar en la unidad
                </p>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800">
                <AlertCircle className="h-4 w-4 text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-sky-700 dark:text-sky-300">
                  Al crear la unidad compartida recibirás un{" "}
                  <strong>código de invitación</strong> que podrás compartir con
                  los demás docentes.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Botón Continuar ── */}
        <div className="flex justify-center pb-10">
          <Button
            onClick={() => onContinue(tipo, maxMiembros)}
            className="h-14 px-10 text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            Continuar
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Step0TipoUnidad;
