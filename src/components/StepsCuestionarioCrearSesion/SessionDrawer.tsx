import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FileText, User, Target, Lightbulb, BookOpen, Package, BookOpenCheck } from "lucide-react";
import { useSesionStore } from "@/store/sesion.store";

export const SessionDrawer = () => {
  const { sesion } = useSesionStore();

  if (!sesion) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="lg"
          className="fixed top-20 right-4 z-50 shadow-lg hover:shadow-xl transition-all bg-white dark:bg-slate-800"
        >
          <FileText className="h-4 w-4 mr-2" />
          Ver Resumen
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Resumen de la Sesión
          </SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 mt-6 overflow-y-auto max-h-[calc(100vh-120px)] pr-4">
          
          {/* Título de la Sesión */}
          {sesion.titulo && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="font-bold text-xl text-center text-green-700 dark:text-green-400">
                {sesion.titulo}
              </h3>
            </div>
          )}

          {/* 🆕 Tema Curricular */}
          {sesion.temaCurricular && (
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950 p-4 rounded-lg border border-cyan-200 dark:border-cyan-800">
              <div className="flex items-center gap-2 mb-2">
                <BookOpenCheck className="h-5 w-5 text-cyan-600" />
                <h3 className="font-bold text-lg">Tema Curricular</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-cyan-800 dark:text-cyan-300">{sesion.temaCurricular}</p>
                {sesion.temaId && (
                  <p className="text-xs text-cyan-600 dark:text-cyan-400">
                    ID del currículo: {sesion.temaId}
                  </p>
                )}
                {!sesion.temaId && (
                  <span className="inline-block px-2 py-1 bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 text-xs rounded-full">
                    Tema personalizado
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Datos Generales */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-5 w-5 text-blue-600" />
              <h3 className="font-bold text-lg">Datos Generales</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>Institución:</strong> {sesion.datosGenerales.institucion}</p>
              <p><strong>Docente:</strong> {sesion.datosGenerales.docente}</p>
              <p><strong>Nivel:</strong> {sesion.datosGenerales.nivel}</p>
              <p><strong>Grado:</strong> {sesion.datosGenerales.grado}</p>
              <p><strong>Área:</strong> {sesion.datosGenerales.area || 'No seleccionada'}</p>
              <p><strong>Fecha:</strong> {sesion.datosGenerales.fecha || 'No especificada'}</p>
              <p><strong>Duración:</strong> {sesion.datosGenerales.duracion || 'No especificada'}</p>
            </div>
          </div>

          {/* Propósito de Aprendizaje */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-5 w-5 text-purple-600" />
              <h3 className="font-bold text-lg">Propósito de Aprendizaje</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <strong className="text-purple-700 dark:text-purple-400">Competencia:</strong>
                <p className="ml-4 mt-1">{sesion.propositoAprendizaje.competencia || 'No seleccionada'}</p>
              </div>
              
              {sesion.propositoAprendizaje.capacidades && sesion.propositoAprendizaje.capacidades.length > 0 && (
                <div>
                  <strong className="text-purple-700 dark:text-purple-400">Capacidades:</strong>
                  <ul className="ml-4 mt-1 list-disc list-inside space-y-1">
                    {sesion.propositoAprendizaje.capacidades.map((cap, idx) => (
                      <li key={idx}>{cap.nombre}</li>
                    ))}
                  </ul>
                </div>
              )}

              {sesion.propositoAprendizaje.criteriosEvaluacion && sesion.propositoAprendizaje.criteriosEvaluacion.length > 0 && (
                <div>
                  <strong className="text-purple-700 dark:text-purple-400">Criterios de Evaluación:</strong>
                  <ul className="ml-4 mt-1 list-disc list-inside space-y-1">
                    {sesion.propositoAprendizaje.criteriosEvaluacion.map((criterio, idx) => (
                      <li key={idx}>{typeof criterio === 'string' ? criterio : criterio.criterioCompleto}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Propósito de la Sesión */}
          {sesion.propositoSesion && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-lg">Propósito de la Sesión</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p>{sesion.propositoSesion}</p>
              </div>
            </div>
          )}

          {/* Preparación */}
          {sesion.preparacion && (
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-5 w-5 text-orange-600" />
                <h3 className="font-bold text-lg">Preparación</h3>
              </div>
              <div className="space-y-3 text-sm">
                {sesion.preparacion.quehacerAntes && sesion.preparacion.quehacerAntes.length > 0 && (
                  <div>
                    <strong className="text-orange-700 dark:text-orange-400">¿Qué hacer antes?</strong>
                    <ul className="ml-4 mt-1 list-disc list-inside space-y-1">
                      {sesion.preparacion.quehacerAntes.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {sesion.preparacion.recursosMateriales && sesion.preparacion.recursosMateriales.length > 0 && (
                  <div>
                    <strong className="text-orange-700 dark:text-orange-400">Recursos y Materiales:</strong>
                    <ul className="ml-4 mt-1 list-disc list-inside space-y-1">
                      {sesion.preparacion.recursosMateriales.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Secuencia Didáctica */}
          {sesion.secuenciaDidactica && (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-lg">Secuencia Didáctica</h3>
              </div>
              <div className="space-y-4 text-sm">
                {sesion.secuenciaDidactica.inicio && (
                  <div>
                    <strong className="text-indigo-700 dark:text-indigo-400">INICIO</strong>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Tiempo: {sesion.secuenciaDidactica.inicio.tiempo}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {sesion.secuenciaDidactica.inicio.procesos?.length || 0} procesos
                    </p>
                  </div>
                )}
                
                {sesion.secuenciaDidactica.desarrollo && (
                  <div>
                    <strong className="text-indigo-700 dark:text-indigo-400">DESARROLLO</strong>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Tiempo: {sesion.secuenciaDidactica.desarrollo.tiempo}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {sesion.secuenciaDidactica.desarrollo.procesos?.length || 0} procesos
                    </p>
                  </div>
                )}
                
                {sesion.secuenciaDidactica.cierre && (
                  <div>
                    <strong className="text-indigo-700 dark:text-indigo-400">CIERRE</strong>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Tiempo: {sesion.secuenciaDidactica.cierre.tiempo}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {sesion.secuenciaDidactica.cierre.procesos?.length || 0} procesos
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </SheetContent>
    </Sheet>
  );
};
