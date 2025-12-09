import { ISesionAprendizaje } from "@/interfaces/ISesionAprendizaje";

/**
 * Datos de ejemplo para una sesión de aprendizaje completa.
 * Este objeto puede ser usado para probar los componentes del documento PDF.
 */
export const mockSesionAprendizaje: ISesionAprendizaje = {
  // Datos Generales
  datosGenerales: {
    institucion: "I.E. N° 20182 'José María Arguedas'",
    docente: "Prof. María Elena Rodríguez García",
    nivel: "Primaria",
    grado: "4° Grado 'A'",
    area: "Matemática",
    fecha: "15 de marzo de 2025",
    duracion: "90 minutos",
    numeroEstudiantes: "28 estudiantes"
  },

  // Título y Propósito
  titulo: "Resolvemos problemas de multiplicación en situaciones de la vida cotidiana",
  propositoSesion: {
    queAprenderan: "Los estudiantes aprenderán a resolver problemas de multiplicación usando diferentes estrategias y representaciones.",
    como: "A través de situaciones problemáticas contextualizadas, trabajo colaborativo, uso de material concreto y representaciones gráficas.",
    paraQue: "Para que puedan aplicar la multiplicación en situaciones de su vida diaria y desarrollar su razonamiento matemático."
  },

  // Propósito del Aprendizaje
  propositoAprendizaje: {
    competencia: "Resuelve problemas de cantidad",
    capacidades: [
      {
        nombre: "Traduce cantidades a expresiones numéricas",
        descripcion: "Identifica datos y relaciones en problemas de multiplicación, expresándolos con operaciones de multiplicación."
      },
      {
        nombre: "Comunica su comprensión sobre los números y las operaciones",
        descripcion: "Explica con diversas representaciones su comprensión del significado de la multiplicación."
      },
      {
        nombre: "Usa estrategias y procedimientos de estimación y cálculo",
        descripcion: "Emplea estrategias heurísticas, de cálculo mental y escrito para resolver problemas de multiplicación."
      }
    ],
    criteriosEvaluacion: [
      "Identifica situaciones que requieren el uso de la multiplicación.",
      "Representa problemas de multiplicación usando material concreto, gráfico y simbólico.",
      "Aplica estrategias de cálculo para resolver problemas de multiplicación.",
      "Explica los procedimientos seguidos en la resolución de problemas."
    ],
    competenciasTransversales: [
      "Gestiona su aprendizaje de manera autónoma al proponer estrategias de resolución.",
      "Se desenvuelve en entornos virtuales al utilizar recursos digitales para practicar multiplicaciones (si aplica)."
    ],
    evidenciaAprendizaje: "Ficha de trabajo con problemas resueltos usando diferentes representaciones y estrategias.",
    instrumentoEvaluacion: "Lista de cotejo"
  },

  // Enfoques Transversales
  enfoquesTransversales: [
    {
      nombre: "Búsqueda de la excelencia",
      actitudesObservables: "Docentes y estudiantes demuestran flexibilidad para el cambio y adaptación a nuevas estrategias, superando sus propios límites."
    },
    {
      nombre: "Orientación al bien común",
      actitudesObservables: "Estudiantes comparten sus estrategias de resolución con el grupo, ayudándose mutuamente en el aprendizaje."
    }
  ],

  // Preparación de la Sesión
  preparacion: {
    quehacerAntes: [
      "Preparar material concreto: fichas de colores, semillas, botones.",
      "Imprimir fichas de trabajo con problemas de multiplicación.",
      "Preparar papelógrafos para el trabajo en equipo.",
      "Revisar las tablas de multiplicar a trabajar."
    ],
    recursosMateriales: [
      "Fichas de colores",
      "Semillas o botones",
      "Papelógrafos",
      "Plumones",
      "Cuadernos",
      "Fichas de trabajo",
      "Pizarra y tizas",
      "Tablas de multiplicar"
    ]
  },

  // Secuencia Didáctica
  secuenciaDidactica: {
    inicio: {
      motivacion: [
        "La docente inicia la sesión con una dinámica llamada 'La tiendita del aula'. Coloca sobre la mesa diferentes objetos agrupados (lápices en paquetes de 6, borradores en cajas de 4, cuadernos en grupos de 5).",
        "Invita a 3 estudiantes a pasar al frente y pregunta: 'Si María compra 3 paquetes de lápices y cada paquete tiene 6 lápices, ¿cuántos lápices tiene en total?' Los estudiantes manipulan el material y cuentan.",
        "La docente pregunta: '¿Hay otra forma de averiguarlo sin contar uno por uno? ¿Qué operación podríamos usar?' Se recogen saberes previos sobre la multiplicación."
      ],
      criteriosEvaluacion: [
        "Identificar cuándo usar la multiplicación en problemas del día a día",
        "Explicar cómo resolvemos usando dibujos y números",
        "Usar las tablas de multiplicar para resolver rápido y bien"
      ],
      comunicacionPropósito: "Hoy aprenderemos a resolver problemas de multiplicación que encontramos en nuestra vida diaria. Usaremos materiales, dibujos y las tablas de multiplicar para encontrar las respuestas. Esto nos ayudará a resolver situaciones rápidamente, como cuando compramos cosas o repartimos objetos.",
      enfoqueTransversal: "Búsqueda de la excelencia: 'Recuerden que todos podemos aprender matemática. Si un problema nos parece difícil, podemos intentarlo de diferentes maneras hasta lograrlo.'",
      acuerdosConvivencia: "Se establecen acuerdos: escuchar con atención, participar activamente, trabajar en equipo respetando las ideas de todos, y pedir ayuda cuando la necesiten."
    },
    desarrollo: {
      procesosDidacticos: [
        {
          numero: 1,
          titulo: "Familiarización con el Problema",
          contenido: "Situación problemática: 'En la feria del colegio, Ana vende empanadas. Tiene 4 bandejas y en cada bandeja hay 8 empanadas. ¿Cuántas empanadas tiene Ana para vender?'",
          actividades: [
            "Los estudiantes leen el problema de manera individual y luego en voz alta.",
            "Identifican las palabras clave: '4 bandejas', '8 empanadas en cada una', '¿cuántas en total?'",
            "Explican con sus propias palabras qué se pide resolver."
          ],
          vinculacionCapacidad: "Traduce cantidades a expresiones numéricas - identifican datos y la incógnita del problema."
        },
        {
          numero: 2,
          titulo: "Búsqueda y Ejecución de Estrategias",
          contenido: "La docente organiza a los estudiantes en equipos de 4 y entrega material concreto (fichas de colores).",
          actividades: [
            "Representación vivencial: Forman 4 grupos de 8 fichas cada uno usando el material.",
            "Representación gráfica: Dibujan en sus cuadernos las 4 bandejas con 8 empanadas cada una (pueden usar círculos o dibujos simples).",
            "Representación simbólica: Escriben la operación: 4 × 8 = ? o 8 + 8 + 8 + 8 = ?",
            "Aplican la estrategia de sumar repetidamente o usar la tabla del 8.",
            "Verifican contando las fichas o usando la calculadora."
          ],
          vinculacionCapacidad: "Usa estrategias y procedimientos de estimación y cálculo - emplean material concreto, representaciones y algoritmos."
        },
        {
          numero: 3,
          titulo: "Socialización de Representaciones",
          contenido: "",
          actividades: [
            "Cada equipo presenta su trabajo en papelógrafos, explicando cómo resolvieron el problema.",
            "Un representante explica: 'Nosotros pusimos 4 grupos de 8 fichas. Luego contamos todas y nos dio 32. También lo hicimos sumando 8+8+8+8 y también da 32.'",
            "Los demás estudiantes hacen preguntas y comentarios sobre las diferentes estrategias.",
            "La docente valora todas las estrategias y refuerza que la multiplicación es más rápida que la suma repetida."
          ],
          vinculacionCapacidad: "Comunica su comprensión sobre los números y las operaciones - expresan cómo resolvieron usando diferentes representaciones."
        },
        {
          numero: 4,
          titulo: "Reflexión y Formalización",
          contenido: "La docente guía la formalización del conocimiento a través de preguntas: ¿Qué hicimos para resolver el problema? ¿Qué significa multiplicar? ¿Cuándo usamos la multiplicación?",
          actividades: [],
          formalizacion: "La multiplicación nos ayuda a calcular el total cuando tenemos grupos con la misma cantidad de elementos. Los términos de la multiplicación son: factor × factor = producto",
          ejemplos: [
            "Ejemplo: 4 × 8 = 32 (4 grupos de 8 elementos dan 32 elementos en total)"
          ]
        },
        {
          numero: 5,
          titulo: "Transferencia a Nuevas Situaciones",
          contenido: "Los estudiantes resuelven problemas similares aplicando lo aprendido.",
          actividades: [
            "Problema 2: 'En el cumpleaños de Luis hay 6 mesas. En cada mesa se sientan 7 niños. ¿Cuántos niños hay en total?'",
            "Problema 3: 'María tiene 5 cajas de colores. Cada caja tiene 12 colores. ¿Cuántos colores tiene en total?'",
            "Los estudiantes trabajan individualmente en sus fichas de trabajo, aplicando las estrategias aprendidas."
          ]
        }
      ],
      atencionDiferenciada: {
        estudiantesApoyo: "Trabajan con números menores (tablas del 2, 3, 5) y con apoyo de material concreto adicional.",
        estudiantesAvanzados: "Resuelven problemas con números mayores o de dos pasos (por ejemplo: calcular el total y luego repartir)."
      }
    },
    cierre: {
      metacognicion: [
        {
          pregunta: "¿Qué aprendimos hoy?",
          respuestaEsperada: "Aprendimos a resolver problemas de multiplicación y cuándo usarla"
        },
        {
          pregunta: "¿Cómo lo aprendimos?",
          respuestaEsperada: "Usando fichas, haciendo dibujos, sumando y usando las tablas"
        },
        {
          pregunta: "¿Qué fue lo más fácil? ¿Qué fue lo más difícil?",
          respuestaEsperada: "Cada estudiante comparte su experiencia"
        },
        {
          pregunta: "¿Para qué nos sirve lo que aprendimos?",
          respuestaEsperada: "Para calcular rápido cuando compramos, repartimos cosas, jugamos, etc."
        },
        {
          pregunta: "¿Cómo se sintieron trabajando en equipo?",
          respuestaEsperada: "Reflexionan sobre la colaboración y el respeto a las ideas de los demás"
        }
      ],
      recuentoAcciones: [
        "Leímos y comprendimos el problema",
        "Usamos material concreto para representar",
        "Hicimos dibujos en nuestros cuadernos",
        "Escribimos la operación matemática",
        "Compartimos nuestras estrategias",
        "Practicamos con nuevos problemas"
      ],
      utilidadAprendido: {
        preguntaReflexiva: "¿Dónde más podemos usar la multiplicación en nuestra vida diaria?",
        ejemplosEstudiantes: "Los estudiantes comparten ejemplos: cuando compramos varios productos del mismo precio, cuando repartimos dulces en bolsitas iguales, cuando calculamos las patas de varios animales, etc."
      },
      aplicacionPractica: {
        pregunta: "Si en tu casa necesitas comprar 4 paquetes de galletas y cada paquete cuesta 3 soles, ¿cómo calcularías cuánto dinero necesitas?",
        respuesta: "Los estudiantes explican que multiplicarían 4 × 3 = 12 soles"
      },
      compromisoPersonal: "Cada estudiante se compromete a practicar las tablas de multiplicar en casa y buscar situaciones donde puedan aplicar la multiplicación en su vida diaria.",
      tareaParaCasa: "Crear 2 problemas de multiplicación basados en situaciones de su hogar o comunidad, y resolverlos usando dibujos y operaciones."
    }
  },

  // Reflexiones
  reflexiones: {
    avancesEstudiantes: "Los estudiantes lograron identificar situaciones donde se aplica la multiplicación, usaron diferentes estrategias de resolución y la mayoría alcanzó el nivel esperado.",
    dificultadesExperimentadas: "Algunos estudiantes confundieron la multiplicación con la suma simple. Se requiere reforzar el concepto de 'grupos iguales' con más ejemplos concretos.",
    aprendizajesReforzar: "Reforzar las tablas de multiplicar del 6, 7, 8 y 9. Trabajar más problemas de aplicación en contextos diversos.",
    actividadesEstrategiasMateriales: "El material concreto y el trabajo en equipo fueron muy efectivos. Los papelógrafos permitieron la socialización. Se necesita más tiempo para la práctica individual."
  },

  // Firmas
  firmas: {
    docente: {
      nombre: "Prof. María Elena Rodríguez García",
      cargo: "Docente de Aula"
    },
    director: {
      nombre: "Lic. Carlos Mendoza Vega",
      cargo: "Director"
    }
  }
};
