import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Sparkles } from "lucide-react";
import { ProblematicasList } from "@/features/problematicas";
import { TipoProblematica } from "@/features/problematicas";

function GestionProblematicas() {
  const navigate = useNavigate();
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoProblematica>("todas");

  const tabs: { value: TipoProblematica; label: string; icon: any }[] = [
    { value: "todas", label: "Todas", icon: FileText },
    { value: "recomendadas", label: "Recomendadas", icon: Sparkles },
    { value: "personalizadas", label: "Mis Problemáticas", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-dp-blue-600 to-dp-orange-600 bg-clip-text text-transparent mb-2">
                Gestión de Problemáticas
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Administra las problemáticas educativas de tu institución
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b-2 border-slate-200 dark:border-slate-700">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.value}
                  onClick={() => setTipoSeleccionado(tab.value)}
                  className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 -mb-0.5 flex items-center gap-2 ${
                    tipoSeleccionado === tab.value
                      ? "border-dp-blue-500 text-dp-blue-600 dark:text-dp-blue-400"
                      : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenido */}
        <Card className="border-2 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>
              {tipoSeleccionado === "todas" && "Todas las Problemáticas"}
              {tipoSeleccionado === "recomendadas" && "Problemáticas Recomendadas"}
              {tipoSeleccionado === "personalizadas" && "Mis Problemáticas Personalizadas"}
            </CardTitle>
            <CardDescription>
              {tipoSeleccionado === "todas" &&
                "Explora todas las problemáticas disponibles en la plataforma"}
              {tipoSeleccionado === "recomendadas" &&
                "Problemáticas sugeridas por expertos educativos"}
              {tipoSeleccionado === "personalizadas" &&
                "Problemáticas que has creado para tu contexto específico"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProblematicasList
              tipo={tipoSeleccionado}
              showCreateButton={tipoSeleccionado === "personalizadas"}
              showSearch={true}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default GestionProblematicas;
