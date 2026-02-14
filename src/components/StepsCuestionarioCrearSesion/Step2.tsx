import { ICompetencia } from "@/interfaces/ICompetencia";
import { IUsuario } from "@/interfaces/IUsuario";
import { getCompetencyById } from "@/services/competencias.service";
import { useEffect, useRef, useState } from "react";
import { getCapacidadByCompentenciaId } from "@/services/capacidades.service";
import { ICapacidad } from "@/interfaces/ICapacidad";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, CheckCircle2, ArrowRight, ArrowLeft, Award, Sparkles } from "lucide-react";
import { useSesionStore } from "@/store/sesion.store";
import { getAllAreas } from "@/services/areas.service";
import { SelectorTemas } from "@/components/SelectorTemas";
import { useCompetenciaSugerida } from "@/hooks/useCompetenciaSugerida";
import { CompetenciaSugerida } from "@/components/CompetenciaSugerida";

interface Props {
  pagina: number;
  setPagina: (pagina: number) => void;
  usuarioFromState: IUsuario;
}

function Step2({ pagina, setPagina }: Props) {
  const { sesion, updateSesion } = useSesionStore();
  const [competencias, setCompetencias] = useState<ICompetencia[]>([]);
  const [capacidadesSeleccionadas, setCapacidadesSeleccionadas] = useState<ICapacidad[]>([]);
  const [loadingCompetencias, setLoadingCompetencias] = useState(true);
  const [loadingCapacidades, setLoadingCapacidades] = useState(false);
  const [competenciaSeleccionada, setCompetenciaSeleccionada] = useState<string>("");
  const [areaId, setAreaId] = useState<number | null>(null);

  // Ref para detectar realmente cambios de tema (y no limpiar en el primer render)
  const temaEffectInitializedRef = useRef(false);
  const temaPrevioRef = useRef<string | undefined | null>(sesion?.temaCurricular);

  // 🎯 Callback cuando se selecciona/guarda un tema - fuerza nueva sugerencia
  const handleTemaSeleccionado = (tema: string) => {
    console.log("📚 Tema confirmado, activando sugerencia de competencia:", tema);
    // Limpiar selecciones para permitir nueva sugerencia
    setCompetenciaSeleccionada("");
    setCapacidadesSeleccionadas([]);
    clearSugerencia();
    
    if (sesion) {
      updateSesion({
        propositoAprendizaje: {
          ...sesion.propositoAprendizaje,
          competencia: "",
          capacidades: [],
        },
      });
    }
  };

  // Hook para sugerencia de competencia por IA
  // Solo se ejecuta si NO hay competencia seleccionada (usa estado local para mejor reactividad)
  const { sugerencia, loading: loadingSugerencia, clearSugerencia } = useCompetenciaSugerida({
    areaId,
    temaId: sesion?.temaId ?? null,
    temaTexto: sesion?.temaCurricular || null,
    enabled: !!areaId && !!sesion?.temaCurricular && !competenciaSeleccionada,
  });

  // Inicializar desde el store al montar el componente
  useEffect(() => {
    if (sesion?.propositoAprendizaje.competencia) {
      setCompetenciaSeleccionada(sesion.propositoAprendizaje.competencia);
      
      // Si ya hay capacidades en el store, restaurarlas
      if (sesion.propositoAprendizaje.capacidades && sesion.propositoAprendizaje.capacidades.length > 0) {
        // Convertir las capacidades del store al formato ICapacidad
        const capacidadesFromStore: ICapacidad[] = sesion.propositoAprendizaje.capacidades.map((cap, index) => ({
          id: index + 1, // ID temporal
          nombre: cap.nombre,
          descripcion: cap.descripcion || "",
          competencia: 0, // ID temporal
          competenciaId: 0 // ID temporal
        }));
        setCapacidadesSeleccionadas(capacidadesFromStore);
      }
    }
  }, []); // Solo al montar

  // 🎯 Detectar cambio de tema curricular (incluye temas personalizados) y limpiar selecciones
  useEffect(() => {
    if (!sesion) return;

    const temaActual = sesion.temaCurricular;

    // En la primera ejecución solo guardamos el valor previo, no limpiamos
    if (!temaEffectInitializedRef.current) {
      temaEffectInitializedRef.current = true;
      temaPrevioRef.current = temaActual;
      return;
    }

    // Si el tema realmente cambió (incluye pasar de vacío a personalizado)
    if (temaActual && temaActual !== temaPrevioRef.current) {
      console.log("🔄 Tema curricular cambió, limpiando selecciones para nueva sugerencia", {
        anterior: temaPrevioRef.current,
        actual: temaActual,
      });

      setCompetenciaSeleccionada("");
      setCapacidadesSeleccionadas([]);
      clearSugerencia();

      updateSesion({
        propositoAprendizaje: {
          ...sesion.propositoAprendizaje,
          competencia: "",
          capacidades: [],
        },
      });
    }

    temaPrevioRef.current = temaActual;
  }, [sesion?.temaCurricular, clearSugerencia, updateSesion]);

  // Cargar competencias basándose en el área seleccionada
  useEffect(() => {
    async function cargarCompetencias() {
      if (!sesion?.datosGenerales.area) return;

      setLoadingCompetencias(true);
      try {
        // Primero obtenemos el ID del área
        const areasResponse = await getAllAreas();
        const areas = areasResponse.data.data || areasResponse.data;
        const areaEncontrada = areas.find((a: any) => a.nombre === sesion.datosGenerales.area);
        
        if (areaEncontrada) {
          setAreaId(areaEncontrada.id); // Guardar areaId para el hook de sugerencia
          const response = await getCompetencyById(areaEncontrada.id);
          setCompetencias(response.data.data || response.data);
        }
      } catch (error) {
        handleToaster("Error al cargar competencias", "error");
      } finally {
        setLoadingCompetencias(false);
      }
    }

    cargarCompetencias();
  }, [sesion?.datosGenerales.area]);

  // Cargar capacidades cuando se selecciona una competencia
  useEffect(() => {
    async function cargarCapacidades() {
      // Si ya hay capacidades cargadas y la competencia no ha cambiado, no recargar
      if (capacidadesSeleccionadas.length > 0 && 
          sesion?.propositoAprendizaje.competencia === competenciaSeleccionada) {
        return;
      }

      const competenciaEncontrada = competencias.find(c => c.nombre === competenciaSeleccionada);
      
      if (competenciaEncontrada) {
        setLoadingCapacidades(true);
        try {
          const response = await getCapacidadByCompentenciaId(competenciaEncontrada.id);
          const capacidadesData = response.data.data || response.data;
          
          // Seleccionar automáticamente TODAS las capacidades
          setCapacidadesSeleccionadas(capacidadesData);
          
          // Actualizar el store con las capacidades
          if (sesion) {
            updateSesion({
              propositoAprendizaje: {
                ...sesion.propositoAprendizaje,
                competencia: competenciaSeleccionada,
                capacidades: capacidadesData.map((cap: ICapacidad) => ({
                  nombre: cap.nombre,
                  descripcion: cap.descripcion || ""
                }))
              }
            });
          }
        } catch (error) {
          handleToaster("Error al cargar capacidades", "error");
        } finally {
          setLoadingCapacidades(false);
        }
      }
    }

    if (competenciaSeleccionada && competencias.length > 0) {
      cargarCapacidades();
    }
  }, [competenciaSeleccionada, competencias]);

  // Aplicar automáticamente la sugerencia de la IA
  useEffect(() => {
    if (sugerencia) {
      // Aplicar siempre que llegue una nueva sugerencia
      console.log('🤖 Aplicando sugerencia automática:', sugerencia.competenciaNombre);
      setCompetenciaSeleccionada(sugerencia.competenciaNombre);
    }
  }, [sugerencia, sesion?.temaId]);

  function handleClick(competenciaNombre: string) {
    // Limpiar sugerencia cuando el usuario selecciona manualmente
    if (sugerencia) {
      clearSugerencia();
    }
    // Limpiar capacidades al cambiar de competencia
    setCapacidadesSeleccionadas([]);
    setCompetenciaSeleccionada(competenciaNombre);
  }

  function handleNextStep() {
    // Validar que haya tema curricular
    if (!sesion?.temaCurricular || sesion.temaCurricular.trim() === "") {
      handleToaster("Por favor selecciona o crea un tema curricular", "error");
      return;
    }

    if (competenciaSeleccionada) {
      setPagina(pagina + 1);
    } else {
      handleToaster("Por favor selecciona una competencia", "error");
    }
  }

  if (!sesion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header con animación */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg mb-6 shadow-lg">
            <Sparkles className="h-4 w-4" />
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-purple-600 text-xs font-bold">
              2
            </div>
            <span className="text-sm font-semibold tracking-wide">PASO 2 DE 9</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 tracking-tight">
            Tema, Competencias y Capacidades
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Define el tema curricular y selecciona las competencias que trabajarás
          </p>
        </div>

        {/* 🆕 Selector de Tema Curricular */}
        <div className="mb-8">
          <SelectorTemas onTemaSeleccionado={handleTemaSeleccionado} />
        </div>

        {/* 🤖 Sugerencia de Competencia por IA */}
        {(loadingSugerencia || sugerencia) && (
          <div className="mb-8">
            <CompetenciaSugerida
              sugerencia={sugerencia}
              loading={loadingSugerencia}
              variant="auto"
            />
          </div>
        )}

        {/* Selección de Competencia */}
        <Card className="mb-8 border-2 border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              Selecciona la competencia
            </CardTitle>
            <CardDescription className="text-base">
              Elige la competencia principal que se desarrollará en la sesión
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingCompetencias ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-xl border-2 border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                    </div>
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : competencias.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-500 dark:text-slate-400">
                  No hay competencias disponibles para esta área
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {competencias.map((competencia) => {
                  const isSelected = competenciaSeleccionada === competencia.nombre;

                  return (
                    <div
                      key={competencia.id}
                      onClick={() => handleClick(competencia.nombre)}
                      className={`
                        group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300
                        ${isSelected 
                          ? 'ring-4 ring-purple-500 ring-offset-2 dark:ring-offset-slate-900 scale-105 shadow-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950' 
                          : 'hover:scale-105 hover:shadow-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                        }
                      `}
                    >
                      <div className="relative p-6">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className={`p-2 rounded-lg transition-all duration-300 ${isSelected ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-slate-100 dark:bg-slate-700'}`}>
                            <Target className={`h-5 w-5 transition-colors duration-300 ${isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`} />
                          </div>
                          {isSelected && (
                            <div className="bg-purple-600 rounded-full p-1 shadow-lg">
                              <CheckCircle2 className="h-5 w-5 text-white" />
                            </div>
                          )}
                        </div>
                        <h3 className={`text-base font-bold leading-tight transition-colors duration-300 ${isSelected ? 'text-purple-700 dark:text-purple-300' : 'text-slate-900 dark:text-white'}`}>
                          {competencia.nombre}
                        </h3>
                        {competencia.descripcion && (
                          <p className={`text-sm mt-2 line-clamp-3 transition-colors duration-300 ${isSelected ? 'text-purple-600 dark:text-purple-400' : 'text-slate-600 dark:text-slate-400'}`}>
                            {competencia.descripcion}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Capacidades - Solo visualización */}
        {competenciaSeleccionada && (
          <Card className="mb-8 border-2 border-slate-200 dark:border-slate-700 shadow-xl animate-in slide-in-from-top-4">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <div className="h-10 w-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <Award className="h-6 w-6 text-white" />
                </div>
                Capacidades incluidas automáticamente
              </CardTitle>
              <CardDescription className="text-base">
                {loadingCapacidades ? (
                  <Skeleton className="h-4 w-64" />
                ) : (
                  `Estas ${capacidadesSeleccionadas.length} capacidad${capacidadesSeleccionadas.length !== 1 ? 'es' : ''} se trabajarán en la sesión`
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingCapacidades ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-xl border-2 border-slate-200 dark:border-slate-700 p-5">
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-3/4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {capacidadesSeleccionadas.map((capacidad) => (
                    <div
                      key={capacidad.id}
                      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border-2 border-emerald-200 dark:border-emerald-800"
                    >
                      <div className="relative p-5">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 bg-emerald-600 rounded-full p-1.5 shadow-lg">
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-bold leading-tight text-emerald-700 dark:text-emerald-300">
                              {capacidad.nombre}
                            </h3>
                            {capacidad.descripcion && (
                              <p className="text-xs mt-2 line-clamp-2 text-emerald-600 dark:text-emerald-400">
                                {capacidad.descripcion}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
            disabled={!competenciaSeleccionada || !sesion?.temaCurricular}
            className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuar
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Step2;
