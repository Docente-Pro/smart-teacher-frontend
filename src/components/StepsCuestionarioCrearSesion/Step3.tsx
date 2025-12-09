import { IUsuario } from "@/interfaces/IUsuario";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { useSesionStore } from "@/store/sesion.store";

interface Props {
  pagina: number;
  setPagina: (pagina: number) => void;
  usuarioFromState: IUsuario;
}

function Step3({ pagina, setPagina }: Props) {
  const { sesion } = useSesionStore();

  function handleNextStep() {
    // Por ahora solo avanzamos, en futuros Steps se pedirán criterios
    setPagina(pagina + 1);
  }

  if (!sesion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg mb-6 shadow-lg">
            <Sparkles className="h-4 w-4" />
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-emerald-600 text-xs font-bold">
              3
            </div>
            <span className="text-sm font-semibold tracking-wide">PASO 3 DE 9</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4 tracking-tight">
            Criterios de Evaluación
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            En los próximos pasos configuraremos todos los detalles de tu sesión
          </p>
        </div>

        {/* Resumen con diseño mejorado */}
        <Card className="mb-8 border-2 border-emerald-200 dark:border-emerald-800 shadow-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <div className="h-10 w-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              Resumen hasta ahora
            </CardTitle>
            <CardDescription className="text-base">
              Esta es la información que has ingresado
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Área */}
            <div className="p-5 bg-white dark:bg-slate-800 rounded-xl border-2 border-emerald-200 dark:border-emerald-700 shadow-md">
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-2">Área:</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{sesion.datosGenerales.area}</p>
            </div>

            {/* Duración */}
            <div className="p-5 bg-white dark:bg-slate-800 rounded-xl border-2 border-emerald-200 dark:border-emerald-700 shadow-md">
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-2">Duración:</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{sesion.datosGenerales.duracion}</p>
            </div>

            {/* Competencia */}
            <div className="md:col-span-2 p-5 bg-white dark:bg-slate-800 rounded-xl border-2 border-emerald-200 dark:border-emerald-700 shadow-md">
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-2">Competencia:</p>
              <p className="text-base font-bold text-slate-900 dark:text-white">{sesion.propositoAprendizaje.competencia}</p>
            </div>

            {/* Capacidades */}
            <div className="md:col-span-2 p-5 bg-white dark:bg-slate-800 rounded-xl border-2 border-emerald-200 dark:border-emerald-700 shadow-md">
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-3">
                Capacidades ({sesion.propositoAprendizaje.capacidades.length}):
              </p>
              <div className="space-y-2">
                {sesion.propositoAprendizaje.capacidades.map((cap, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-xs font-bold flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{cap.nombre}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de navegación */}
        <div className="flex justify-between items-center">
          <Button
            onClick={() => setPagina(pagina - 1)}
            variant="outline"
            className="h-14 px-8 text-lg font-semibold border-2"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Anterior
          </Button>
          <Button
            onClick={handleNextStep}
            className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            Continuar
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Step3;
