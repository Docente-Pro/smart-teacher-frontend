import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { GraficoAreaRenderer } from "@/features/graficos-educativos/presentation/components/areas/GraficoAreaRenderer";
import type { ConfiguracionGraficoArea } from "@/features/graficos-educativos/domain/types/graficos-areas.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ============================================================
// DATOS DE EJEMPLO — uno por cada tipo de gráfico de área
// ============================================================

const ejemplosComunicacion: Record<string, ConfiguracionGraficoArea> = {
  estructura_narrativa: {
    tipoGrafico: "estructura_narrativa",
    titulo: "Estructura del cuento: El zorro y el cóndor",
    secciones: [
      { nombre: "Inicio", icono: "🌅", color: "verde", contenido: "En los Andes vivían un zorro astuto y un cóndor sabio. Eran vecinos en la montaña y se encontraban cada mañana." },
      { nombre: "Nudo", icono: "⚡", color: "naranja", contenido: "Un día el zorro retó al cóndor a una carrera para demostrar quién era más rápido. El zorro hizo trampa escondiéndose en las plumas del cóndor." },
      { nombre: "Desenlace", icono: "🌟", color: "celeste", contenido: "El cóndor descubrió al zorro y lo dejó caer suavemente. El zorro aprendió que la honestidad es más valiosa que ganar." },
    ],
    personajes: ["El zorro", "El cóndor"],
    lugar: "Las montañas de los Andes",
    mensaje: "La honestidad siempre triunfa sobre el engaño",
  } as any,
  organizador_kvl: {
    tipoGrafico: "organizador_kvl",
    titulo: "Lo que sé, quiero saber y aprendí",
    tema: "Los animales en peligro de extinción del Perú",
    columnas: [
      { encabezado: "¿Qué SÉ?", color: "verde", icono: "💡", items: ["Algunos animales están desapareciendo", "El oso de anteojos vive en los Andes"] },
      { encabezado: "¿Qué QUIERO saber?", color: "naranja", icono: "❓", items: ["¿Cuántos animales están en peligro?", "¿Qué podemos hacer para protegerlos?"] },
      { encabezado: "¿Qué APRENDÍ?", color: "celeste", icono: "📚", items: [] },
    ],
  } as any,
  planificador_escritura: {
    tipoGrafico: "planificador_escritura",
    titulo: "Planificamos nuestra escritura",
    tipoTexto: "cuento",
    campos: [
      { pregunta: "¿Qué voy a escribir?", respuesta: "Un cuento sobre la amistad entre un niño y un cóndor" },
      { pregunta: "¿Para quién escribo?", respuesta: "Para mis compañeros de tercer grado" },
      { pregunta: "¿Para qué escribo?", respuesta: "Para enseñar que cuidar la naturaleza es importante" },
      { pregunta: "¿Cuándo ocurre?", respuesta: "Hace mucho tiempo, en las montañas" },
      { pregunta: "¿Dónde ocurre?", respuesta: "En un pueblo de los Andes peruanos" },
    ],
    ideasPrincipales: ["El niño encuentra un cóndor herido", "Lo cuida hasta que se recupera", "El cóndor lo lleva a volar como agradecimiento"],
  } as any,
};

const ejemplosCiencia: Record<string, ConfiguracionGraficoArea> = {
  tabla_observacion: {
    tipoGrafico: "tabla_observacion",
    titulo: "Tabla de registro: Crecimiento de plantas",
    subtitulo: "¿Qué investigamos? ¿Cuánto crece una planta con diferente cantidad de agua?",
    columnas: [
      { nombre: "Grupo", tipo: "texto" },
      { nombre: "Agua diaria", tipo: "numero" },
      { nombre: "Altura al día 7", tipo: "numero" },
      { nombre: "Observaciones", tipo: "texto" },
    ],
    filas: [
      ["Grupo A", "50", "3.2", "Hojas verdes y firmes"],
      ["Grupo B", "100", "5.1", "Creció más alto, color oscuro"],
      ["Grupo C", "200", "4.0", "Raíz húmeda, algunas hojas amarillas"],
    ],
    unidades: ["", "ml", "cm", ""],
  } as any,
  ciclo_proceso: {
    tipoGrafico: "ciclo_proceso",
    titulo: "El ciclo del agua",
    tipo: "circular",
    fases: [
      { nombre: "Evaporación", descripcion: "El agua del mar se calienta y sube como vapor", icono: "☀️", color: "naranja" },
      { nombre: "Condensación", descripcion: "El vapor se enfría y forma nubes en la atmósfera", icono: "☁️", color: "celeste" },
      { nombre: "Precipitación", descripcion: "Cae lluvia, granizo o nieve hacia la tierra", icono: "🌧️", color: "celeste" },
      { nombre: "Infiltración", descripcion: "El agua penetra el suelo y vuelve a ríos y mares", icono: "🌊", color: "verde" },
    ],
    colorFondo: "celeste",
  } as any,
  ciclo_proceso_lineal: {
    tipoGrafico: "ciclo_proceso",
    titulo: "Proceso de la digestión",
    tipo: "lineal",
    fases: [
      { nombre: "Boca", descripcion: "Masticamos y mezclamos con saliva", icono: "👄", color: "rosa" },
      { nombre: "Esófago", descripcion: "El bolo alimenticio baja al estómago", icono: "⬇️", color: "violeta" },
      { nombre: "Estómago", descripcion: "Los jugos gástricos descomponen el alimento", icono: "🫧", color: "naranja" },
      { nombre: "Intestino delgado", descripcion: "Se absorben los nutrientes", icono: "🔄", color: "verde" },
      { nombre: "Intestino grueso", descripcion: "Se absorbe el agua y se forman los desechos", icono: "💧", color: "marron" },
    ],
    colorFondo: "melocoton",
  } as any,
  clasificacion_dicotomica: {
    tipoGrafico: "clasificacion_dicotomica",
    titulo: "Clasificamos: seres vivos",
    nodos: [
      { id: "raiz", pregunta: "¿Tiene columna vertebral?", si: "vertebrados", no: "invertebrados" },
      { id: "vertebrados", etiqueta: "Vertebrados", pregunta: "¿Tiene plumas?", si: "aves", no: "no_aves" },
      { id: "invertebrados", etiqueta: "Invertebrados", esHoja: true, ejemplos: ["Mariposa", "Araña", "Lombriz"] },
      { id: "aves", etiqueta: "Aves", esHoja: true, ejemplos: ["Cóndor", "Gallo", "Paloma"] },
      { id: "no_aves", etiqueta: "Otros vertebrados", esHoja: true, ejemplos: ["Perro", "Trucha", "Tortuga"] },
    ],
  } as any,
};

const ejemplosPersonalSocial: Record<string, ConfiguracionGraficoArea> = {
  linea_tiempo: {
    tipoGrafico: "linea_tiempo",
    titulo: "Línea de tiempo: El Imperio Inca",
    subtitulo: "Período: siglos XIV al XVI",
    orientacion: "horizontal",
    eventos: [
      { fecha: "1438", etiqueta: "Fundación del Tahuantinsuyo", descripcion: "Pachacútec expande el Imperio Inca", color: "naranja", icono: "🏛️" },
      { fecha: "1470", etiqueta: "Expansión al norte", descripcion: "El Inca llega hasta Ecuador", color: "violeta", icono: "🗺️" },
      { fecha: "1532", etiqueta: "Llegada de los españoles", descripcion: "Francisco Pizarro llega a Perú", color: "rojo", icono: "⚔️" },
      { fecha: "1533", etiqueta: "Caída de Atahualpa", descripcion: "Fin del Imperio Inca", color: "marron", icono: "📜" },
    ],
    colorLinea: "marron",
    mostrarDecadas: true,
  } as any,
  linea_tiempo_vertical: {
    tipoGrafico: "linea_tiempo",
    titulo: "Mi historia personal",
    orientacion: "vertical",
    eventos: [
      { fecha: "2017", etiqueta: "Nací", descripcion: "Llegué al mundo en Lima", color: "rosa", icono: "👶" },
      { fecha: "2020", etiqueta: "Primer día de inicial", descripcion: "Conocí a mis primeros amigos", color: "verde", icono: "🏫" },
      { fecha: "2023", etiqueta: "Entré a primaria", descripcion: "Empecé a leer y escribir", color: "celeste", icono: "📖" },
      { fecha: "2026", etiqueta: "Tercer grado", descripcion: "Aprendo sobre la historia del Perú", color: "naranja", icono: "🇵🇪" },
    ],
    colorLinea: "gris",
  } as any,
  cuadro_comparativo: {
    tipoGrafico: "cuadro_comparativo",
    titulo: "Comparamos: Tahuantinsuyo y Virreinato",
    criterios: ["Organización política", "Economía", "Religión", "Construcciones"],
    columnas: [
      { nombre: "Tahuantinsuyo", color: "verde", valores: ["Sapa Inca / curacas", "Mita / redistribución", "Politeísta (Inti)", "Caminos, templos"] },
      { nombre: "Virreinato", color: "celeste", valores: ["Rey / Virrey / Cabildo", "Tributo / minería", "Católica", "Catedrales, palacios"] },
    ],
    colorEncabezado: "indigo",
  } as any,
  rueda_emociones: {
    tipoGrafico: "rueda_emociones",
    titulo: "¿Cómo me siento ante el cambio de escuela?",
    instruccion: "Colorea o marca la emoción que describes",
    emociones: [
      { nombre: "Alegría", color: "amarillo", icono: "😊", descripcion: "Me siento contento y con energía" },
      { nombre: "Tristeza", color: "celeste", icono: "😢", descripcion: "Me siento con ganas de llorar" },
      { nombre: "Miedo", color: "lavanda", icono: "😨", descripcion: "Siento que algo malo puede pasar" },
      { nombre: "Enojo", color: "melocoton", icono: "😠", descripcion: "Algo me molesta mucho" },
      { nombre: "Sorpresa", color: "menta", icono: "😲", descripcion: "Algo me tomó por sorpresa" },
      { nombre: "Calma", color: "cyan", icono: "😌", descripcion: "Me siento tranquilo y relajado" },
    ],
    emocionSeleccionada: null,
    preguntaReflexion: "¿Por qué sientes eso? ¿Qué lo causó?",
  } as any,
  ficha_autoconocimiento: {
    tipoGrafico: "ficha_autoconocimiento",
    titulo: "Me conozco mejor",
    subtitulo: "Reflexiono sobre mí mismo(a)",
    colorFondo: "amarillo",
    secciones: [
      { nombre: "Mis cualidades", icono: "⭐", preguntas: ["¿En qué soy bueno(a)?", "¿Qué me gusta hacer?"] },
      { nombre: "Mis emociones", icono: "💛", preguntas: ["¿Cuándo me siento feliz?", "¿Qué hago cuando me enojo?"] },
      { nombre: "Mi familia y comunidad", icono: "🏠", preguntas: ["¿Quiénes son importantes para mí?", "¿Cómo ayudo en casa?"] },
    ],
  } as any,
};

const ejemplosReligion: Record<string, ConfiguracionGraficoArea> = {
  tarjeta_reflexion: {
    tipoGrafico: "tarjeta_reflexion",
    titulo: "Reflexionamos con la Palabra",
    referencia: "Mateo 5:43-44",
    texto: "Han oído que se dijo: 'Ama a tu prójimo y odia a tu enemigo.' Pero yo les digo: Amen a sus enemigos y oren por quienes los persiguen, para que sean hijos de su Padre que está en el cielo.",
    esParabola: false,
    color: "violeta",
    preguntas: ["¿Qué nos enseña este pasaje?", "¿Cómo puedo aplicarlo en mi vida?", "¿Qué valor encontramos aquí?"],
  } as any,
  tarjeta_reflexion_parabola: {
    tipoGrafico: "tarjeta_reflexion",
    titulo: "La parábola del buen samaritano",
    referencia: "Relato inspirado en Lucas 10:30-37",
    texto: "Un hombre fue asaltado en el camino. Pasaron dos personas importantes y no lo ayudaron. Pero un samaritano, a quien todos despreciaban, se detuvo, curó sus heridas y lo llevó a un lugar seguro.",
    esParabola: true,
    color: "oceano",
    preguntas: ["¿Quién actuó como un buen prójimo?", "¿Por qué crees que las otras personas no ayudaron?", "¿Cómo puedes ser tú un buen samaritano?"],
  } as any,
  tarjeta_compromiso: {
    tipoGrafico: "tarjeta_compromiso",
    titulo: "Mi compromiso",
    valor: "La solidaridad",
    campos: [
      { pregunta: "¿Qué haré?", respuesta: "Ayudaré a un compañero que tenga dificultades en clase" },
      { pregunta: "¿Cuándo?", respuesta: "Esta semana, durante el recreo o en las clases" },
      { pregunta: "¿Con quién?", respuesta: "Con mis compañeros que necesiten apoyo" },
      { pregunta: "¿Cómo sabré que lo cumplí?", respuesta: "Si mi compañero me agradece o si yo me siento bien ayudando" },
    ],
    colorFondo: "rosa",
  } as any,
};

const ejemplosArte: Record<string, ConfiguracionGraficoArea> = {
  ficha_analisis_obra: {
    tipoGrafico: "ficha_analisis_obra",
    titulo: "Analizamos: Cerámica Nazca",
    obra: {
      nombre: "Vasija Nazca con representación de orca",
      autor: "Cultura Nazca",
      origen: "Costa Sur del Perú (aprox. 100 a.C. – 800 d.C.)",
      tipo: "cerámica",
    },
    dimensiones: [
      { aspecto: "Colores", icono: "🎨", observacion: "Rojo, negro, blanco y ocre — colores de la tierra y el mar" },
      { aspecto: "Formas", icono: "📐", observacion: "Formas curvas y redondeadas, superficie lisa y pulida" },
      { aspecto: "Materiales", icono: "🔨", observacion: "Barro cocido con pinturas minerales naturales" },
      { aspecto: "Lo que transmite", icono: "💭", observacion: "Conexión espiritual con el mar y sus criaturas" },
      { aspecto: "Contexto cultural", icono: "🌎", observacion: "Representaba dioses del agua en la cosmovisión Nazca" },
    ],
    miOpinion: "¿Por qué crees que esta cerámica es importante para nuestra historia? Fundamenta tu respuesta.",
  } as any,
  ficha_proceso_creativo: {
    tipoGrafico: "ficha_proceso_creativo",
    titulo: "Mi proyecto artístico: Móvil de los animales del Perú",
    lenguajeArtistico: "plástico",
    etapas: [
      { nombre: "Exploración", icono: "🔍", color: "verde", descripcion: "¿Qué quiero crear? Un móvil con animales en peligro de extinción del Perú." },
      { nombre: "Materiales", icono: "🎨", color: "naranja", descripcion: "¿Qué necesito?", lista: ["Cartulina de colores", "Tijeras", "Hilo o pabilo", "Plumones", "Perforadora"] },
      { nombre: "Creación", icono: "✏️", color: "celeste", descripcion: "Paso a paso:", pasos: ["Dibujar el animal elegido en la cartulina", "Recortar el contorno con cuidado", "Colorear con los plumones", "Perforar y pasar el hilo para colgar"] },
      { nombre: "Presentación", icono: "🌟", color: "violeta", descripcion: "Explicaré mi animal al grupo y contaré por qué lo elegí." },
    ],
  } as any,
};

const ejemplosEdFisica: Record<string, ConfiguracionGraficoArea> = {
  secuencia_movimiento: {
    tipoGrafico: "secuencia_movimiento",
    titulo: "Rutina de calentamiento: El Robot",
    tipo: "calentamiento",
    pasos: [
      { numero: 1, nombre: "Cabeza y cuello", descripcion: "De pie, pies separados. Girar la cabeza lentamente hacia la derecha y luego a la izquierda.", duracion: "10 seg" },
      { numero: 2, nombre: "Hombros y brazos", descripcion: "Levantar los brazos a los lados hasta arriba y bajarlos. Como si fuera un robot.", duracion: "10 seg" },
      { numero: 3, nombre: "Cintura", descripcion: "Manos en la cintura. Girar el tronco hacia la derecha y luego a la izquierda. Sin mover los pies.", duracion: "10 seg" },
      { numero: 4, nombre: "Rodillas y pies", descripcion: "Doblar las rodillas suavemente y estirar. Luego levantarse en puntillas 5 veces.", duracion: "10 seg" },
    ],
    repeticiones: 3,
    materiales: ["ninguno"],
    colorFondo: "verde",
  } as any,
  tabla_habitos: {
    tipoGrafico: "tabla_habitos",
    titulo: "Mis hábitos saludables de la semana",
    semana: "Del 3 al 9 de marzo",
    habitos: [
      { nombre: "Tomé agua (8 vasos)", icono: "💧", color: "celeste" },
      { nombre: "Comí frutas y verduras", icono: "🥗", color: "verde" },
      { nombre: "Hice actividad física (30 min)", icono: "🏃", color: "naranja" },
      { nombre: "Dormí 8 horas", icono: "😴", color: "violeta" },
      { nombre: "Me cepillé los dientes", icono: "🦷", color: "cyan" },
    ],
    dias: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    meta: "¡Busca conseguir al menos 4 ✅ por hábito esta semana!",
  } as any,
};

// ============================================================
// ESTRUCTURA DE ÁREAS CON SUS EJEMPLOS
// ============================================================

interface AreaInfo {
  nombre: string;
  icono: string;
  color: string;
  ejemplos: Record<string, ConfiguracionGraficoArea>;
}

const areas: AreaInfo[] = [
  { nombre: "Comunicación", icono: "📖", color: "celeste", ejemplos: ejemplosComunicacion },
  { nombre: "Ciencia y Tecnología", icono: "🔬", color: "verde", ejemplos: ejemplosCiencia },
  { nombre: "Personal Social", icono: "🌎", color: "naranja", ejemplos: ejemplosPersonalSocial },
  { nombre: "Educación Religiosa", icono: "🕊️", color: "violeta", ejemplos: ejemplosReligion },
  { nombre: "Arte y Cultura", icono: "🎨", color: "rosa", ejemplos: ejemplosArte },
  { nombre: "Educación Física", icono: "🏃", color: "turquesa", ejemplos: ejemplosEdFisica },
];

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

const GraficosAreasPlayground = () => {
  const navigate = useNavigate();
  const [areaActiva, setAreaActiva] = useState(0);
  const [graficoKey, setGraficoKey] = useState<string | null>(null);
  const [jsonInput, setJsonInput] = useState("");
  const [graficoActual, setGraficoActual] = useState<ConfiguracionGraficoArea | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [vistaGaleria, setVistaGaleria] = useState(true);
  const [copied, setCopied] = useState(false);

  const areaSeleccionada = areas[areaActiva];

  const cargarEjemplo = (key: string) => {
    const ejemplo = areaSeleccionada.ejemplos[key];
    if (!ejemplo) return;
    setGraficoKey(key);
    setGraficoActual(ejemplo);
    setJsonInput(JSON.stringify(ejemplo, null, 2));
    setError(null);
    setVistaGaleria(false);
  };

  const handleJsonChange = (value: string) => {
    setJsonInput(value);
    try {
      const parsed = JSON.parse(value);
      setGraficoActual(parsed);
      setError(null);
    } catch {
      setError("JSON inválido");
    }
  };

  const volverAGaleria = () => {
    setVistaGaleria(true);
    setGraficoKey(null);
    setGraficoActual(null);
    setJsonInput("");
  };

  const copiarJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonInput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Error al copiar");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Button onClick={() => navigate(-1)} variant="ghost" size="sm">
              ← Volver
            </Button>
            <Link to="/graficos">
              <Button variant="outline" size="sm">
                📐 Ir a Matemática
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
            🎨 Galería de Gráficos — Áreas Curriculares
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Visualiza los 16 tipos de gráficos para Comunicación, Ciencia, Personal Social, Religión, Arte y Ed. Física.
          </p>
        </div>

        {/* Tabs de áreas */}
        <div className="flex flex-wrap gap-2 mb-6">
          {areas.map((area, idx) => (
            <button
              key={idx}
              onClick={() => {
                setAreaActiva(idx);
                setVistaGaleria(true);
                setGraficoActual(null);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                areaActiva === idx
                  ? "text-white shadow-md scale-105"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:scale-[1.02]"
              }`}
              style={areaActiva === idx ? { background: area.color } : undefined}
            >
              <span>{area.icono}</span>
              {area.nombre}
            </button>
          ))}
        </div>

        {/* -------- Vista Galería -------- */}
        {vistaGaleria ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>{areaSeleccionada.icono}</span>
                  {areaSeleccionada.nombre} — Ejemplos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Object.entries(areaSeleccionada.ejemplos).map(([key, ejemplo]) => (
                    <Card
                      key={key}
                      className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-opacity-60"
                      style={{ borderColor: `${areaSeleccionada.color}40` }}
                      onClick={() => cargarEjemplo(key)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center justify-between">
                          <span className="truncate">{ejemplo.titulo}</span>
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full text-white shrink-0 ml-2"
                            style={{ background: areaSeleccionada.color }}
                          >
                            {(ejemplo as any).tipoGrafico}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="pointer-events-none">
                          <GraficoAreaRenderer grafico={ejemplo} mostrarErrores={false} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* -------- Vista detalle + editor -------- */
          <div className="space-y-4">
            <Button onClick={volverAGaleria} variant="outline" size="sm">
              ← Volver a la galería
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Editor JSON */}
              <Card className="h-fit">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-lg">📝 Editor JSON</CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={copiarJson} variant="outline" size="sm">
                      {copied ? "✓ Copiado" : "Copiar"}
                    </Button>
                    <Button
                      onClick={() => {
                        try {
                          setJsonInput(JSON.stringify(JSON.parse(jsonInput), null, 2));
                        } catch {
                          /* noop */
                        }
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Formatear
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={jsonInput}
                    onChange={(e) => handleJsonChange(e.target.value)}
                    className="w-full h-[500px] p-4 font-mono text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    spellCheck={false}
                  />
                  {error && (
                    <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 border border-red-300 rounded text-red-700 dark:text-red-300 text-xs">
                      ⚠️ {error}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Vista previa */}
              <Card className="h-fit sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg">👁️ Vista Previa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[500px] p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-auto">
                    {graficoActual ? (
                      <div>
                        <GraficoAreaRenderer grafico={graficoActual} />
                        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-[11px] text-gray-500">
                            Tipo:{" "}
                            <span className="font-mono font-semibold">
                              {(graficoActual as any).tipoGrafico}
                            </span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center mt-20">
                        Selecciona un ejemplo o edita el JSON
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Guía de tipos */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">📖 Tipos de Gráficos por Área</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {areas.map((area) => (
                <div key={area.nombre}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: area.color }}>
                    {area.icono} {area.nombre}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.keys(area.ejemplos).map((key) => {
                      const tipo = (area.ejemplos[key] as any).tipoGrafico;
                      return (
                        <span
                          key={key}
                          className="text-[11px] px-2 py-1 rounded border font-mono"
                          style={{
                            color: area.color,
                            borderColor: `${area.color}40`,
                            background: `${area.color}10`,
                          }}
                        >
                          {tipo}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GraficosAreasPlayground;
