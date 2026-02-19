import { IUsuario } from "@/interfaces/IUsuario";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft, Sparkles, Heart, Trash2, Wand2, Edit, Check, AlertCircle, CheckCircle2 } from "lucide-react";
import { useSesionStore } from "@/store/sesion.store";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { instance } from "@/services/instance";

interface Props {
  pagina: number;
  setPagina: (pagina: number) => void;
  usuarioFromState: IUsuario;
}

interface EnfoqueConJustificacion {
  nombre: string;
  actitudesObservables: string;
  justificacion?: string;
  enEdicion?: boolean;
}

function Step5({ pagina, setPagina }: Props) {
  const { sesion, updateSesion } = useSesionStore();
  const [enfoques, setEnfoques] = useState<EnfoqueConJustificacion[]>([]);
  const [loadingIA, setLoadingIA] = useState(false);

  // Enfoques transversales CNEB - Los 7 oficiales
  const enfoquesCNEB = [
    "Enfoque de Derechos",
    "Enfoque Inclusivo o de Atención a la Diversidad",
    "Enfoque Intercultural",
    "Enfoque Igualdad de Género",
    "Enfoque Ambiental",
    "Enfoque Orientación al Bien Común",
    "Enfoque Búsqueda de la Excelencia",
  ];

  // Inicializar desde el store si ya hay datos
  useEffect(() => {
    if (sesion?.enfoquesTransversales && sesion.enfoquesTransversales.length > 0) {
      setEnfoques(
        sesion.enfoquesTransversales.map((e) => ({
          nombre: e.nombre,
          actitudesObservables: e.actitudesObservables,
          enEdicion: false,
        })),
      );
    }
  }, [sesion]);

  function editarActitudes(index: number, nuevasActitudes: string) {
    const updated = [...enfoques];
    updated[index].actitudesObservables = nuevasActitudes;
    setEnfoques(updated);
  }

  function toggleEdicion(index: number) {
    const updated = [...enfoques];
    updated[index].enEdicion = !updated[index].enEdicion;
    setEnfoques(updated);
  }

  function eliminarEnfoque(index: number) {
    setEnfoques(enfoques.filter((_, i) => i !== index));
  }

  async function sugerirEnfoquesConIA() {
    if (!sesion) return;

    // Validar que se haya completado el propósito de la sesión
    const propositoTexto = sesion.propositoSesion || "";
    if (!propositoTexto) {
      handleToaster("Completa el propósito de la sesión primero (Step 6)", "warning");
      return;
    }

    setLoadingIA(true);
    try {
      const response = await instance.post("/ia/sugerir-enfoques-transversales", {
        area: sesion.datosGenerales.area,
        grado: sesion.datosGenerales.grado || "5to",
        competencia: sesion.propositoAprendizaje.competencia,
        propositoSesion: sesion.propositoSesion,
        temaId: sesion.temaId,
        situacionTexto: sesion.situacionTexto,
      });

      const data = response.data;

      if (data.success && data.data?.enfoquesSugeridos) {
        // Reemplazar enfoques con los sugeridos (incluye justificación)
        const enfoquesConIA = data.data.enfoquesSugeridos.map((e: any) => ({
          nombre: e.nombre,
          actitudesObservables: e.actitudesObservables,
          justificacion: e.justificacion,
          enEdicion: false,
        }));

        setEnfoques(enfoquesConIA);
        handleToaster(`${enfoquesConIA.length} enfoques sugeridos por IA`, "success");
      }
    } catch (error) {
      console.error("Error al sugerir enfoques con IA:", error);
      handleToaster("Error al generar sugerencias con IA", "error");
    } finally {
      setLoadingIA(false);
    }
  }

  function agregarEnfoqueManual(nombreEnfoque: string) {
    // Validar que no exista ya
    if (enfoques.find((e) => e.nombre === nombreEnfoque)) {
      handleToaster("Este enfoque ya está agregado", "info");
      return;
    }

    // Validar máximo 3
    if (enfoques.length >= 3) {
      handleToaster("Máximo 3 enfoques por sesión", "warning");
      return;
    }

    setEnfoques([
      ...enfoques,
      {
        nombre: nombreEnfoque,
        actitudesObservables: "",
        enEdicion: true,
      },
    ]);
  }

  function handleNextStep() {
    // Validación 1: Al menos 1 enfoque
    if (enfoques.length === 0) {
      handleToaster("Debes seleccionar al menos 1 enfoque transversal", "error");
      return;
    }

    // Validación 2: Todos deben tener actitudes observables
    const hayVacios = enfoques.some((e) => !e.actitudesObservables || e.actitudesObservables.trim() === "");
    if (hayVacios) {
      handleToaster("Completa las actitudes observables de todos los enfoques", "warning");
      return;
    }

    // Actualizar el store
    if (sesion) {
      updateSesion({
        enfoquesTransversales: enfoques.map((e) => ({
          nombre: e.nombre,
          actitudesObservables: e.actitudesObservables,
        })),
      });
    }

    setPagina(pagina + 1);
  }

  if (!sesion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg mb-6 shadow-lg">
            <Sparkles className="h-4 w-4" />
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-pink-600 text-xs font-bold">5</div>
            <span className="text-sm font-semibold tracking-wide">PASO 5 DE 7</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-4 tracking-tight">
            Enfoques Transversales
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-4">
            Los enfoques transversales son orientaciones ético-valorativas que atraviesan todas las áreas curriculares
          </p>

          {/* Info Box */}
          <Card className="mb-6 border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <strong>¿No sabes cuáles elegir?</strong> Nuestra IA analizará tu sesión y sugerirá los 2-3 enfoques más pertinentes
                    según el área, competencia y propósito definido. Luego podrás editarlos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botón Sugerir con IA */}
          <Button
            onClick={sugerirEnfoquesConIA}
            disabled={loadingIA || !sesion.propositoSesion}
            className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg"
          >
            <Wand2 className="h-5 w-5 mr-2" />
            {loadingIA ? "Generando sugerencias..." : "Sugerir Enfoques con IA"}
          </Button>

          {!sesion.propositoSesion && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">⚠️ Completa el propósito de la sesión primero (Step 6)</p>
          )}
        </div>

        {/* Lista de Enfoques Agregados */}
        {enfoques.length > 0 && (
          <Card className="mb-8 border-2 border-slate-200 dark:border-slate-700 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                Enfoques Seleccionados ({enfoques.length}/3)
              </CardTitle>
              <CardDescription>Cada sesión debe trabajar al menos 1 enfoque transversal contextualizado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {enfoques.map((enfoque, index) => (
                <div
                  key={index}
                  className="p-5 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950 rounded-xl border-2 border-pink-200 dark:border-pink-800 shadow-md"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">{enfoque.nombre}</h3>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleEdicion(index)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-950"
                      >
                        {enfoque.enEdicion ? <Check className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarEnfoque(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-950"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Actitudes Observables */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Actitudes Observables:</label>
                    {enfoque.enEdicion ? (
                      <Textarea
                        value={enfoque.actitudesObservables}
                        onChange={(e) => editarActitudes(index, e.target.value)}
                        placeholder="Describe las actitudes observables específicas para esta sesión..."
                        rows={4}
                        className="resize-none"
                      />
                    ) : (
                      <p className="text-slate-700 dark:text-slate-300 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        {enfoque.actitudesObservables || (
                          <span className="italic text-slate-400">Haz clic en editar para agregar actitudes observables</span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Justificación (solo si viene de IA) */}
                  {enfoque.justificacion && (
                    <div className="mt-3 p-3 bg-violet-100 dark:bg-violet-950 rounded-lg border border-violet-200 dark:border-violet-800">
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-violet-700 dark:text-violet-300 mb-1">Por qué es pertinente:</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{enfoque.justificacion}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {enfoques.length === 0 && (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No hay enfoques seleccionados</p>
                  <p className="text-sm">Usa IA o selecciona manualmente</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Selección Manual */}
        <Card className="mb-8 border-2 border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">O selecciona manualmente</CardTitle>
            <CardDescription>Los 7 Enfoques Transversales del Currículo Nacional</CardDescription>
          </CardHeader>
          <CardContent>
            {enfoques.length >= 3 && (
              <div className="mb-4 p-3 bg-amber-100 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Has alcanzado el máximo de 3 enfoques recomendados. Elimina uno para agregar otro.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enfoquesCNEB.map((enfoque, idx) => {
                const yaAgregado = enfoques.find((e) => e.nombre === enfoque);
                const maxAlcanzado = enfoques.length >= 3;

                return (
                  <button
                    key={idx}
                    onClick={() => agregarEnfoqueManual(enfoque)}
                    disabled={!!yaAgregado || maxAlcanzado}
                    className={`p-4 rounded-lg border-2 text-left transition-all duration-300 ${
                      yaAgregado
                        ? "bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-700 opacity-70 cursor-not-allowed"
                        : maxAlcanzado
                          ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 opacity-50 cursor-not-allowed"
                          : "bg-white dark:bg-slate-800 border-pink-200 dark:border-pink-800 hover:border-pink-500 hover:shadow-lg cursor-pointer"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{enfoque}</p>
                      {yaAgregado && <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Botones de navegación */}
        <div className="flex justify-between items-center">
          <Button onClick={() => setPagina(pagina - 1)} variant="outline" className="h-14 px-8 text-lg font-semibold border-2">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Anterior
          </Button>
          <Button
            onClick={handleNextStep}
            className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            Continuar
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Step5;
