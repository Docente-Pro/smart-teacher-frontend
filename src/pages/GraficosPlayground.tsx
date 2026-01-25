import { useState } from "react";
import { useNavigate } from "react-router";
import { GraficoRenderer } from "@/features/graficos-educativos/presentation/components/GraficoRenderer";
import { ConfiguracionGrafico } from "@/features/graficos-educativos/domain/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ejemplosPredefinidos = {
  ecuacion_cajas: {
    tipoGrafico: "ecuacion_cajas",
    titulo: "Suma con cajas",
    descripcion: "Resuelve la ecuación paso a paso",
    elementos: [
      { tipo: "caja", contenido: "5", color: "azul" },
      { tipo: "operador", contenido: "+" },
      { tipo: "caja", contenido: "3", color: "rojo" },
      { tipo: "operador", contenido: "=" },
      { tipo: "caja", contenido: "?", color: "verde", destacado: true }
    ]
  },
  barras_comparacion: {
    tipoGrafico: "barras_comparacion",
    titulo: "Comparación de frutas",
    elementos: [
      { tipo: "barra", etiqueta: "Manzanas", valor: 8, color: "rojo" },
      { tipo: "barra", etiqueta: "Plátanos", valor: 5, color: "amarillo" },
      { tipo: "barra", etiqueta: "Naranjas", valor: 12, color: "naranja" }
    ],
    ejeY: { titulo: "Cantidad", maximo: 15, intervalo: 3 }
  },
  circulos_fraccion: {
    tipoGrafico: "circulos_fraccion",
    titulo: "Fracciones en círculos",
    elementos: [
      { numerador: 1, denominador: 2, color: "azul", etiqueta: "1/2" },
      { numerador: 1, denominador: 4, color: "rojo", etiqueta: "1/4" },
      { numerador: 3, denominador: 4, color: "verde", etiqueta: "3/4" }
    ],
    mostrarEtiquetas: true
  },
  recta_numerica: {
    tipoGrafico: "recta_numerica",
    titulo: "Recta numérica",
    elementos: [
      { valor: 0 },
      { valor: 5, destacado: true, color: "azul", etiqueta: "Inicio" },
      { valor: 10 },
      { valor: 15, destacado: true, color: "rojo", etiqueta: "Final" }
    ],
    rangoInicio: 0,
    rangoFin: 20,
    intervalo: 5,
    mostrarFlechas: true
  },
  bloques_agrupados: {
    tipoGrafico: "bloques_agrupados",
    titulo: "Bloques de colores",
    elementos: [
      { tipo: "bloque", cantidad: 5, color: "azul", etiqueta: "Grupo A" },
      { tipo: "bloque", cantidad: 3, color: "rojo", etiqueta: "Grupo B" },
      { tipo: "bloque", cantidad: 7, color: "verde", etiqueta: "Grupo C" }
    ],
    disposicion: "horizontal"
  },
  diagrama_dinero: {
    tipoGrafico: "diagrama_dinero",
    titulo: "Contando dinero",
    elementos: [
      { tipo: "billete", valor: 10, cantidad: 2 },
      { tipo: "billete", valor: 5, cantidad: 1 },
      { tipo: "moneda", valor: 1, cantidad: 3 },
      { tipo: "moneda", valor: 0.5, cantidad: 2 }
    ],
    moneda: "S/",
    mostrarTotal: true
  },
  operacion_vertical: {
    tipoGrafico: "operacion_vertical",
    titulo: "Suma vertical",
    elementos: [{
      operacion: "+",
      numeros: [234, 567],
      mostrarResultado: true,
      resultado: 801,
      llevadasPrestas: [
        { posicion: 0, valor: 1 },
        { posicion: 1, valor: 1 }
      ]
    }]
  },
  tabla_precios: {
    tipoGrafico: "tabla_precios",
    titulo: "Lista de compras",
    elementos: [
      { tipo: "fila", producto: "Manzanas", precioUnitario: 2.5, cantidad: 4, total: 10 },
      { tipo: "fila", producto: "Pan", precioUnitario: 1.5, cantidad: 2, total: 3 },
      { tipo: "fila", producto: "Leche", precioUnitario: 3.8, cantidad: 1, total: 3.8 }
    ],
    moneda: "S/",
    mostrarTotal: true
  },
  figuras_geometricas: {
    tipoGrafico: "figuras_geometricas",
    titulo: "Formas geométricas",
    elementos: [
      { tipo: "cuadrado", ancho: 100, alto: 100, color: "azul", etiqueta: "Cuadrado" },
      { tipo: "circulo", radio: 50, color: "rojo", etiqueta: "Círculo" },
      { tipo: "triangulo", ancho: 100, alto: 100, color: "verde", etiqueta: "Triángulo" }
    ]
  },
  balanza_equilibrio: {
    tipoGrafico: "balanza_equilibrio",
    titulo: "Balanza matemática",
    elementos: [{}], // Elemento dummy para pasar validación
    ladoIzquierdo: { tipo: "lado", cantidad: 5, color: "azul", etiqueta: "x" },
    ladoDerecho: { tipo: "lado", cantidad: 5, color: "rojo", etiqueta: "5" },
    estado: "equilibrio",
    mostrarEcuacion: true,
    pregunta: "¿Cuál es el valor de x?"
  },
  numeros_ordinales: {
    tipoGrafico: "numeros_ordinales",
    titulo: "Números ordinales",
    elementos: [
      { numero: 1 },
      { numero: 2 },
      { numero: 3, destacado: true },
      { numero: 4 },
      { numero: 5 },
      { numero: 6 },
      { numero: 7 },
      { numero: 8 },
      { numero: 9 },
      { numero: 10 }
    ],
    orientacion: "horizontal",
    mostrarTexto: true
  }
};

const GraficosPlayground = () => {
  const navigate = useNavigate();
  const [jsonInput, setJsonInput] = useState(JSON.stringify(ejemplosPredefinidos.ecuacion_cajas, null, 2));
  const [graficoActual, setGraficoActual] = useState<ConfiguracionGrafico | null>(ejemplosPredefinidos.ecuacion_cajas);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleJsonChange = (value: string) => {
    setJsonInput(value);
    try {
      const parsed = JSON.parse(value);
      setGraficoActual(parsed);
      setError(null);
    } catch (e) {
      setError("JSON inválido");
      setGraficoActual(null);
    }
  };

  const cargarEjemplo = (ejemplo: keyof typeof ejemplosPredefinidos) => {
    const graficoEjemplo = ejemplosPredefinidos[ejemplo];
    setJsonInput(JSON.stringify(graficoEjemplo, null, 2));
    setGraficoActual(graficoEjemplo);
    setError(null);
  };

  const formatearJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
    } catch (e) {
      setError("No se puede formatear JSON inválido");
    }
  };

  const copiarJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonInput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      setError("Error al copiar al portapapeles");
    }
  };

  const limpiarEditor = () => {
    setJsonInput("{\n  \"tipoGrafico\": \"\",\n  \"titulo\": \"\",\n  \"elementos\": []\n}");
    setGraficoActual(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header con botón de regreso */}
        <div className="mb-8">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            size="sm"
            className="mb-4"
          >
            ← Volver
          </Button>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            🎨 Playground de Gráficos Educativos
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Experimenta con diferentes configuraciones JSON para visualizar gráficos educativos interactivos
          </p>
        </div>

        {/* Ejemplos predefinidos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">📚 Ejemplos Predefinidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.keys(ejemplosPredefinidos).map((key) => (
                <Button
                  key={key}
                  onClick={() => cargarEjemplo(key as keyof typeof ejemplosPredefinidos)}
                  variant="outline"
                  size="sm"
                  className="capitalize"
                >
                  {key.replace(/_/g, " ")}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Editor y Visualización */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel del Editor JSON */}
          <Card className="h-fit">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg">📝 Editor JSON</CardTitle>
              <div className="flex gap-2">
                <Button onClick={limpiarEditor} variant="outline" size="sm">
                  Limpiar
                </Button>
                <Button onClick={copiarJson} variant="outline" size="sm">
                  {copied ? "✓ Copiado" : "Copiar"}
                </Button>
                <Button onClick={formatearJson} variant="outline" size="sm">
                  Formatear
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <textarea
                value={jsonInput}
                onChange={(e) => handleJsonChange(e.target.value)}
                className="w-full h-[600px] p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                spellCheck={false}
                placeholder="Ingresa aquí tu configuración JSON..."
              />
              {error && (
                <div className="mt-2 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                  <p className="text-red-700 dark:text-red-300 text-sm">⚠️ {error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Panel de Visualización */}
          <Card className="h-fit sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">👁️ Vista Previa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-[600px] p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-auto">
                {graficoActual ? (
                  <div>
                    <GraficoRenderer grafico={graficoActual} />
                    {graficoActual.titulo && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Tipo: <span className="font-mono font-semibold">{graficoActual.tipoGrafico}</span>
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400 dark:text-gray-500 text-center">
                      Ingresa un JSON válido para ver el gráfico
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Guía de Tipos */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">📖 Tipos de Gráficos Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                "ecuacion_cajas",
                "tabla_precios",
                "barras_comparacion",
                "tabla_valores",
                "bloques_agrupados",
                "recta_numerica",
                "circulos_fraccion",
                "barras_fraccion",
                "diagrama_dinero",
                "figuras_geometricas",
                "patron_visual",
                "diagrama_venn",
                "tabla_doble_entrada",
                "operacion_vertical",
                "medidas_comparacion",
                "balanza_equilibrio",
                "numeros_ordinales"
              ].map((tipo) => (
                <div
                  key={tipo}
                  className="px-3 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg text-sm text-blue-700 dark:text-blue-300"
                >
                  {tipo}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GraficosPlayground;
