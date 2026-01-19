import { IUsuario } from "@/interfaces/IUsuario";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft, Sparkles, Lightbulb, Wand2 } from "lucide-react";
import { useSesionStore } from "@/store/sesion.store";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { instance } from "@/services/instance";

interface Props {
  pagina: number;
  setPagina: (pagina: number) => void;
  usuarioFromState: IUsuario;
}

function Step6({ pagina, setPagina }: Props) {
  const { sesion, updateSesion } = useSesionStore();
  const [propositoSesionText, setPropositoSesionText] = useState("");
  const [loadingIA, setLoadingIA] = useState(false);

  console.log(sesion);
  

  // Inicializar desde el store si ya hay datos
  useEffect(() => {
    if (sesion?.propositoSesion) {
      // soportar string o el objeto antiguo
      if (typeof sesion.propositoSesion === 'string') {
        setPropositoSesionText(sesion.propositoSesion);
      } else {
        const legacy = sesion.propositoSesion as any;
        setPropositoSesionText(legacy.queAprenderan || legacy.texto || "");
      }
    }
  }, [sesion]);

  async function generarPropositoConIA() {
    if (!sesion) return;

    setLoadingIA(true);
    try {
      const response = await instance.post("/ia/generar-proposito-sesion", {
        area: sesion.datosGenerales.area,
        grado: sesion.datosGenerales.grado || "5to",
        competencia: sesion.propositoAprendizaje.competencia,
        capacidades: sesion.propositoAprendizaje.capacidades,
        duracion: sesion.datosGenerales.duracion
      });

      const data = response.data;

      if (data.success && data.data) {
        console.log(data.data);
        
        // El endpoint ahora puede devolver un único string `propositoSesion`.
        const proposito = data.data.propositoSesion ||
          // fallback: concatenar si vienen partes
          [data.data.queAprenderan, data.data.como, data.data.paraQue].filter(Boolean).join(" ");

        setPropositoSesionText(proposito || "");
        handleToaster("Propósito generado exitosamente con IA", "success");
      }
    } catch (error) {
      console.error("Error al generar propósito con IA:", error);
      handleToaster("Error al generar propósito con IA", "error");
    } finally {
      setLoadingIA(false);
    }
  }

  function handleNextStep() {
    if (!propositoSesionText.trim()) {
      handleToaster("Por favor completa el propósito de la sesión", "error");
      return;
    }

    // Actualizar el store con el string único
    if (sesion) {
      updateSesion({
        propositoSesion: propositoSesionText.trim()
      });
    }

    setPagina(pagina + 1);
  }

  if (!sesion) return null;

  console.log(propositoSesionText);
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg mb-6 shadow-lg">
            <Sparkles className="h-4 w-4" />
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-amber-600 text-xs font-bold">
              5
            </div>
            <span className="text-sm font-semibold tracking-wide">PASO 5 DE 8</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4 tracking-tight">
            Propósito de la Sesión
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-4">
            Define el propósito pedagógico de esta sesión de aprendizaje
          </p>
          
          {/* Botón Generar con IA */}
          <Button
            onClick={generarPropositoConIA}
            disabled={loadingIA}
            className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg"
          >
            <Wand2 className="h-5 w-5 mr-2" />
            {loadingIA ? "Generando con IA..." : "Generar Propósito con IA"}
          </Button>
        </div>

        {/* Propósito único de la sesión (qué, cómo y para qué en una sola oración) */}
        <Card className="mb-8 border-2 border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <div className="h-10 w-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              Propósito de la sesión
            </CardTitle>
            <CardDescription className="text-base">
              Redacta en una sola oración qué aprenderán, cómo lo harán y para qué lo aprenderán
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Ejemplo: Hoy aprenderemos a identificar paralelogramos mediante actividades prácticas de medición, para aplicar esa comprensión en resolver problemas geométricos cotidianos."
              value={propositoSesionText}
              onChange={(e) => setPropositoSesionText(e.target.value)}
              rows={5}
              className="resize-none"
            />
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
            className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            Continuar
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Step6;
