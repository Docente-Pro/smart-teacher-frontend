import { IUsuario } from "@/interfaces/IUsuario";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, FileText, Edit, Sparkles, Check, X } from "lucide-react";
import { useSesionStore } from "@/store/sesion.store";
import { handleToaster } from "@/utils/Toasters/handleToasters";

interface Props {
  pagina: number;
  setPagina: (pagina: number) => void;
  usuarioFromState: IUsuario;
}

function Step9({ pagina, setPagina }: Props) {
  const { sesion, updateSesion } = useSesionStore();
  const [editingGrade, setEditingGrade] = useState(false);
  const [gradeValue, setGradeValue] = useState("");

  useEffect(() => {
    setGradeValue(sesion?.datosGenerales.grado || "");
  }, [sesion]);

  function handleGenerarPDF() {
    // Navegar a la página de resultado donde se generará el PDF
    window.location.href = "/result";
  }

  if (!sesion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg mb-6 shadow-lg">
            <Sparkles className="h-4 w-4" />
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-green-600 text-xs font-bold">
              7
            </div>
            <span className="text-sm font-semibold tracking-wide">PASO 7 DE 7</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4 tracking-tight">
            ¡Sesión Completada!
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Revisa tu sesión de aprendizaje antes de generar el PDF
          </p>
        </div>

        {/* Resumen de la sesión */}
        <div className="space-y-6">
          {/* Título de la Sesión */}
          {sesion.titulo && (
            <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                <CardTitle className="text-xl">Título de la Sesión</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-2xl font-bold text-slate-900 dark:text-white text-center">
                  {sesion.titulo}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Datos Generales */}
          <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Datos Generales</CardTitle>
                  <div className="flex items-center gap-2">
                    {editingGrade ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Cancelar edición
                            setGradeValue(sesion?.datosGenerales.grado || "");
                            setEditingGrade(false);
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            if (!sesion) return;
                            updateSesion({
                              datosGenerales: {
                                ...sesion.datosGenerales,
                                grado: gradeValue
                              }
                            });
                            setEditingGrade(false);
                            handleToaster("Grado actualizado", "success");
                          }}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Guardar
                        </Button>
                      </>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => setEditingGrade(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Grado
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Institución</p>
                <p className="text-slate-900 dark:text-white">{sesion.datosGenerales.institucion || "No especificado"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Docente</p>
                <p className="text-slate-900 dark:text-white">{sesion.datosGenerales.docente || "No especificado"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Área</p>
                <p className="text-slate-900 dark:text-white">{sesion.datosGenerales.area || "No especificado"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Duración</p>
                <p className="text-slate-900 dark:text-white">{sesion.datosGenerales.duracion || "No especificado"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Grado</p>
                {editingGrade ? (
                  <Input value={gradeValue} onChange={(e) => setGradeValue((e as any).target.value)} />
                ) : (
                  <p className="text-slate-900 dark:text-white">{sesion.datosGenerales.grado || "No especificado"}</p>
                )}
              </div>
              {sesion.datosGenerales.nivel && (
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Nivel</p>
                  <p className="text-slate-900 dark:text-white">{sesion.datosGenerales.nivel}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Propósito de Aprendizaje */}
          <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Propósito de Aprendizaje</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setPagina(2)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Competencia</p>
                <p className="text-slate-900 dark:text-white">{sesion.propositoAprendizaje.competencia}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Capacidades ({sesion.propositoAprendizaje.capacidades.length})</p>
                <ul className="list-disc list-inside text-slate-900 dark:text-white">
                  {sesion.propositoAprendizaje.capacidades.map((cap, idx) => (
                    <li key={idx}>{cap.nombre}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Evaluación */}
          <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Evaluación</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setPagina(4)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Criterios de Evaluación ({sesion.propositoAprendizaje.criteriosEvaluacion?.length || 0})
                </p>
                <ul className="list-disc list-inside text-slate-900 dark:text-white">
                  {sesion.propositoAprendizaje.criteriosEvaluacion?.map((criterio, idx) => {
                    // Si es un objeto con criterioCompleto, mostrarlo, sino mostrar como string
                    const texto = typeof criterio === 'string' ? criterio : (criterio as any).criterioCompleto || JSON.stringify(criterio);
                    return <li key={idx}>{texto}</li>;
                  })}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Evidencia</p>
                <p className="text-slate-900 dark:text-white">{sesion.propositoAprendizaje.evidenciaAprendizaje}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Instrumento</p>
                <p className="text-slate-900 dark:text-white">{sesion.propositoAprendizaje.instrumentoEvaluacion}</p>
              </div>
            </CardContent>
          </Card>

          {/* Enfoques Transversales */}
          <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Enfoques Transversales ({sesion.enfoquesTransversales.length})</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setPagina(5)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="list-disc list-inside text-slate-900 dark:text-white">
                {sesion.enfoquesTransversales.map((enfoque, idx) => (
                  <li key={idx}>{enfoque.nombre}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Propósito de la Sesión */}
          <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Propósito de la Sesión</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setPagina(6)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {typeof sesion.propositoSesion === 'string' ? (
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Propósito</p>
                  <p className="text-slate-900 dark:text-white">{sesion.propositoSesion}</p>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">¿Qué aprenderán?</p>
                    <p className="text-slate-900 dark:text-white">{(sesion.propositoSesion as any).queAprenderan}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">¿Cómo?</p>
                    <p className="text-slate-900 dark:text-white">{(sesion.propositoSesion as any).como}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">¿Para qué?</p>
                    <p className="text-slate-900 dark:text-white">{(sesion.propositoSesion as any).paraQue}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Preparación */}
          <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Preparación</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {sesion.preparacion.quehacerAntes.length > 0 ? (
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    ¿Qué hacer antes? ({sesion.preparacion.quehacerAntes.length})
                  </p>
                  <ul className="list-disc list-inside text-slate-900 dark:text-white">
                    {sesion.preparacion.quehacerAntes.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500 italic">Se generará automáticamente con la secuencia didáctica</p>
              )}
              {sesion.preparacion.recursosMateriales.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Recursos y Materiales ({sesion.preparacion.recursosMateriales.length})
                  </p>
                  <ul className="list-disc list-inside text-slate-900 dark:text-white">
                    {sesion.preparacion.recursosMateriales.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Secuencia Didáctica */}
          <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Secuencia Didáctica</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setPagina(8)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* INICIO */}
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Inicio - {sesion.secuenciaDidactica.inicio.tiempo} ({sesion.secuenciaDidactica.inicio.procesos.length} procesos)
                </p>
                {sesion.secuenciaDidactica.inicio.procesos.map((proceso: any, idx) => (
                  proceso.problemaMatematico && (
                    <div key={idx} className="mb-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      {proceso.imagenProblema && proceso.imagenProblema !== "GENERATE_IMAGE" && (
                        <img 
                          src={proceso.imagenProblema} 
                          alt="Problema" 
                          className="w-full max-w-sm rounded-lg shadow-md mb-2"
                        />
                      )}
                      <p className="text-sm text-slate-700 dark:text-slate-300">{proceso.problemaMatematico}</p>
                    </div>
                  )
                ))}
              </div>
              
              {/* DESARROLLO */}
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Desarrollo - {sesion.secuenciaDidactica.desarrollo.tiempo} ({sesion.secuenciaDidactica.desarrollo.procesos.length} procesos)
                </p>
                {sesion.secuenciaDidactica.desarrollo.procesos.map((proceso: any, idx) => (
                  proceso.problemaMatematico && (
                    <div key={idx} className="mb-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      {proceso.imagenProblema && proceso.imagenProblema !== "GENERATE_IMAGE" && (
                        <img 
                          src={proceso.imagenProblema} 
                          alt="Problema" 
                          className="w-full max-w-sm rounded-lg shadow-md mb-2"
                        />
                      )}
                      <p className="text-sm text-slate-700 dark:text-slate-300">{proceso.problemaMatematico}</p>
                    </div>
                  )
                ))}
              </div>
              
              {/* CIERRE */}
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Cierre - {sesion.secuenciaDidactica.cierre.tiempo} ({sesion.secuenciaDidactica.cierre.procesos.length} procesos)
                </p>
                {sesion.secuenciaDidactica.cierre.procesos.map((proceso: any, idx) => (
                  proceso.problemaMatematico && (
                    <div key={idx} className="mb-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      {proceso.imagenProblema && proceso.imagenProblema !== "GENERATE_IMAGE" && (
                        <img 
                          src={proceso.imagenProblema} 
                          alt="Problema" 
                          className="w-full max-w-sm rounded-lg shadow-md mb-2"
                        />
                      )}
                      <p className="text-sm text-slate-700 dark:text-slate-300">{proceso.problemaMatematico}</p>
                    </div>
                  )
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botones de navegación */}
        <div className="flex justify-between items-center mt-12">
          <Button
            onClick={() => setPagina(pagina - 1)}
            variant="outline"
            className="h-14 px-8 text-lg font-semibold border-2"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Anterior
          </Button>
          <Button
            onClick={handleGenerarPDF}
            className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <FileText className="mr-2 h-5 w-5" />
            Generar PDF
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Step9;
