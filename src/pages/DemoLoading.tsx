import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import { toast } from "sonner";

/**
 * Página de demostración del sistema de loading global
 * Para acceder: /demo-loading
 */
function DemoLoading() {
  const { showLoading, hideLoading } = useGlobalLoading();

  const ejemplos = [
    {
      titulo: "Loading Básico (2s)",
      descripcion: "Loading simple por 2 segundos",
      accion: async () => {
        showLoading();
        await new Promise(resolve => setTimeout(resolve, 2000));
        hideLoading();
        toast.success("¡Completado!");
      },
    },
    {
      titulo: "Procesando Pago",
      descripcion: "Simula el flujo de pago",
      accion: async () => {
        showLoading("Procesando pago con Mercado Pago...");
        await new Promise(resolve => setTimeout(resolve, 3000));
        hideLoading();
        toast.success("Pago procesado exitosamente");
      },
    },
    {
      titulo: "Generando con IA",
      descripcion: "Simula generación de plan de sesión",
      accion: async () => {
        showLoading("Generando plan de sesión con IA...");
        await new Promise(resolve => setTimeout(resolve, 4000));
        hideLoading();
        toast.success("Plan generado exitosamente");
      },
    },
    {
      titulo: "Cargando Dashboard",
      descripcion: "Simula carga inicial de página",
      accion: async () => {
        showLoading("Cargando dashboard...");
        await new Promise(resolve => setTimeout(resolve, 1500));
        hideLoading();
        toast.success("Dashboard cargado");
      },
    },
    {
      titulo: "Guardando Datos",
      descripcion: "Simula guardado de formulario",
      accion: async () => {
        showLoading("Guardando datos...");
        await new Promise(resolve => setTimeout(resolve, 2000));
        hideLoading();
        toast.success("Datos guardados correctamente");
      },
    },
    {
      titulo: "Proceso Multipaso",
      descripcion: "Cambia el mensaje durante el proceso",
      accion: async () => {
        showLoading("Paso 1: Validando datos...");
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        showLoading("Paso 2: Procesando archivos...");
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        showLoading("Paso 3: Guardando en servidor...");
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        hideLoading();
        toast.success("¡Proceso completado!");
      },
    },
    {
      titulo: "Iniciando Sesión",
      descripcion: "Simula login + validación",
      accion: async () => {
        showLoading("Iniciando sesión...");
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        showLoading("Validando perfil...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        hideLoading();
        toast.success("Sesión iniciada correctamente");
      },
    },
    {
      titulo: "Error en Proceso",
      descripcion: "Simula un error (loading se oculta)",
      accion: async () => {
        showLoading("Procesando solicitud...");
        
        try {
          await new Promise(resolve => setTimeout(resolve, 2000));
          throw new Error("Error simulado");
        } catch (error) {
          hideLoading();
          toast.error("Error al procesar solicitud");
        }
      },
    },
    {
      titulo: "Subiendo Archivos",
      descripcion: "Simula carga de archivos",
      accion: async () => {
        showLoading("Subiendo archivos al servidor...");
        await new Promise(resolve => setTimeout(resolve, 3500));
        hideLoading();
        toast.success("Archivos subidos correctamente");
      },
    },
  ];

  return (
    <div className="min-h-screen bg-dp-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-dp-blue-500 mb-4">
            Demo: Sistema de Loading Global
          </h1>
          <p className="text-lg text-dp-gray-600 dark:text-gray-400">
            Prueba diferentes variantes del loading con mensajes personalizados
          </p>
        </div>

        {/* Grid de Ejemplos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ejemplos.map((ejemplo, index) => (
            <Card 
              key={index}
              className="hover:shadow-lg transition-all duration-300 border-dp-border-light hover:border-dp-blue-500"
            >
              <CardHeader>
                <CardTitle className="text-lg text-dp-blue-500">
                  {ejemplo.titulo}
                </CardTitle>
                <CardDescription>
                  {ejemplo.descripcion}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={ejemplo.accion}
                  className="w-full bg-dp-blue-500 hover:bg-dp-blue-600 text-white"
                >
                  Probar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Instrucciones */}
        <Card className="mt-12 border-dp-orange-500 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-dp-orange-500">
              <span>📚</span>
              Cómo usar el Loading Global
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-dp-blue-500 mb-2">1. Importar el hook:</h3>
              <code className="block bg-dp-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm">
                import {`{ useGlobalLoading }`} from "@/hooks/useGlobalLoading";
              </code>
            </div>
            
            <div>
              <h3 className="font-semibold text-dp-blue-500 mb-2">2. Usar en tu componente:</h3>
              <code className="block bg-dp-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm whitespace-pre">
{`const { showLoading, hideLoading } = useGlobalLoading();

const handleClick = async () => {
  showLoading("Procesando...");
  
  try {
    await apiCall();
  } finally {
    hideLoading();
  }
};`}
              </code>
            </div>

            <div>
              <h3 className="font-semibold text-dp-blue-500 mb-2">3. Mensajes personalizados:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-dp-gray-700 dark:text-gray-300">
                <li><code>showLoading()</code> - Mensaje por defecto "Cargando..."</li>
                <li><code>showLoading("Tu mensaje")</code> - Mensaje personalizado</li>
                <li><code>hideLoading()</code> - Oculta el loading</li>
              </ul>
            </div>

            <div className="bg-dp-orange-50 dark:bg-dp-orange-900/20 p-4 rounded-lg border border-dp-orange-500">
              <p className="text-sm text-dp-orange-700 dark:text-dp-orange-300">
                <strong>Tip:</strong> Siempre llama a <code>hideLoading()</code> en el bloque <code>finally</code> 
                para asegurar que se oculte incluso si hay errores.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DemoLoading;
