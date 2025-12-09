import { Sparkles, Brain } from "lucide-react";

export default function Step3Header() {
  return (
    <div className="text-center mb-12">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full mb-4 shadow-lg">
        <Sparkles className="h-4 w-4" />
        <span className="text-sm font-semibold">Paso 3 de 3</span>
      </div>
      <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
        Criterios de Evaluación
      </h1>
      <p className="text-xl text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2">
        <Brain className="h-6 w-6" />
        Generados con Inteligencia Artificial para tu sesión
      </p>
    </div>
  );
}
