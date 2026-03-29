// Mock de ejemplo real compartido por backend para validar el formato secundaria.
// Se usa en /unidad-result-prueba.
export const unidadSecundariaFormatoRealMock = {
  success: true,
  formato: {
    datosInformativos: {
      numeroUnidad: 1,
      titulo:
        "Modelamos situaciones de nuestra comunidad con álgebra y funciones",
      institucionEducativa: "I.E. José María Arguedas",
      director: "Mariela Quispe Rojas",
      subdirector: "Luis Alberto Gamarra",
      nivel: "Secundaria",
      area: "Matemática",
      grado: "Segundo Año, Tercer Año, Cuarto Año",
      secciones: "A, B",
      docente: "Carlos Huamán Paredes",
      duracion: 5,
    },
    componentes: {
      planteamientoSituacionSignificativa:
        "En la comunidad educativa se observa un incremento en el consumo de agua y energía, además de una gestión limitada de residuos sólidos. Los estudiantes de 2do, 3ro y 4to año proponen analizar datos reales de su institución para identificar patrones, comparar escenarios y plantear decisiones sostenibles. A partir de tablas, expresiones algebraicas y representaciones funcionales, se buscará argumentar propuestas de mejora para el uso responsable de recursos.",
      productoUnidadAprendizajePorGrado: [
        {
          grado: "Segundo Año",
          producto:
            "Informe con tablas y gráficos sobre consumo semanal de agua por aula, incluyendo conclusiones y recomendaciones.",
        },
        {
          grado: "Tercer Año",
          producto:
            "Modelo algebraico de costos de consumo (agua/energía) con análisis de escenarios y propuesta de ahorro.",
        },
        {
          grado: "Cuarto Año",
          producto:
            "Presentación comparativa de funciones lineales y no lineales aplicadas a datos de consumo escolar para sustentar decisiones.",
        },
      ],
      enfoquesTransversales: [
        {
          enfoque: "Enfoque Ambiental",
          valor: "Responsabilidad",
          actitudes:
            "Evalúa impactos de acciones cotidianas sobre el ambiente y propone decisiones sostenibles en la escuela.",
        },
        {
          enfoque: "Enfoque de Derechos",
          valor: "Bien común",
          actitudes:
            "Participa con respeto y argumentación en la toma de decisiones que favorecen a toda la comunidad educativa.",
        },
      ],
      instrumentoEvaluacion: "Lista de cotejo",
      propositosAprendizajePorGrado: [
        {
          grado: "Segundo Año",
          area: "Matemática",
          competencias: [
            {
              competenciaCapacidades: {
                competencia:
                  "Resuelve problemas de regularidad, equivalencia y cambio",
                capacidades: [
                  "Traduce datos y condiciones a expresiones algebraicas",
                  "Comunica su comprensión sobre relaciones algebraicas",
                  "Usa estrategias para hallar reglas de formación",
                ],
              },
              estandar:
                "Resuelve problemas de regularidad, equivalencia y cambio al modelar situaciones con expresiones algebraicas, verificar relaciones y argumentar procedimientos.",
              actividades: [
                "Organizamos datos de consumo en tablas y detectamos patrones de variación",
                "Representamos relaciones entre magnitudes con expresiones algebraicas",
                "Comparamos reglas de formación y validamos resultados con casos reales",
              ],
              campoTematico: "Patrones y expresiones algebraicas",
              criteriosEvaluacion: [
                "Modela datos de consumo con expresiones algebraicas coherentes con la situación planteada.",
                "Justifica la regla de formación usando procedimientos claros y verificables.",
                "Interpreta resultados y los relaciona con decisiones de uso responsable de recursos.",
              ],
              instrumentoEvaluacion: "Lista de cotejo",
            },
            {
              competenciaCapacidades: {
                competencia:
                  "Resuelve problemas de gestión de datos e incertidumbre",
                capacidades: [
                  "Representa datos con tablas y gráficos",
                  "Comunica conclusiones a partir de información estadística",
                  "Usa medidas estadísticas para interpretar datos",
                ],
              },
              estandar:
                "Resuelve problemas de gestión de datos e incertidumbre al organizar, representar e interpretar información para sustentar conclusiones.",
              actividades: [
                "Recolectamos y organizamos datos de consumo por aula",
                "Construimos tablas de frecuencia y gráficos estadísticos",
                "Interpretamos tendencias para proponer acciones de mejora",
              ],
              campoTematico: "Estadística descriptiva",
              criteriosEvaluacion: [
                "Organiza datos en tablas y gráficos adecuados al tipo de información recolectada.",
                "Interpreta tendencias y variaciones con argumentos basados en evidencia numérica.",
                "Propone recomendaciones viables a partir del análisis estadístico realizado.",
              ],
              instrumentoEvaluacion: "Lista de cotejo",
            },
          ],
        },
        {
          grado: "Tercer Año",
          area: "Matemática",
          competencias: [
            {
              competenciaCapacidades: {
                competencia:
                  "Resuelve problemas de regularidad, equivalencia y cambio",
                capacidades: [
                  "Modela relaciones con ecuaciones e inecuaciones",
                  "Emplea procedimientos algebraicos para resolver",
                  "Argumenta la validez de sus resultados",
                ],
              },
              estandar:
                "Resuelve problemas de regularidad, equivalencia y cambio al modelar y resolver situaciones con ecuaciones e inecuaciones en contextos reales.",
              actividades: [
                "Modelamos el costo mensual de consumo con ecuaciones lineales",
                "Resolvemos inecuaciones para estimar metas de ahorro",
                "Contrastamos escenarios de consumo y evaluamos su viabilidad",
              ],
              campoTematico: "Ecuaciones e inecuaciones lineales",
              criteriosEvaluacion: [
                "Formula ecuaciones e inecuaciones consistentes con la situación de consumo analizada.",
                "Resuelve modelos algebraicos aplicando procedimientos adecuados y ordenados.",
                "Sustenta decisiones de ahorro usando resultados numéricos y condiciones del contexto.",
              ],
              instrumentoEvaluacion: "Lista de cotejo",
            },
            {
              competenciaCapacidades: {
                competencia:
                  "Resuelve problemas de gestión de datos e incertidumbre",
                capacidades: [
                  "Organiza datos en representaciones estadísticas",
                  "Analiza medidas de tendencia central",
                  "Comunica conclusiones con lenguaje matemático",
                ],
              },
              estandar:
                "Resuelve problemas de gestión de datos e incertidumbre al analizar información estadística y comunicar conclusiones pertinentes.",
              actividades: [
                "Analizamos promedios y medianas del consumo por semana",
                "Comparamos grupos de datos para identificar variaciones significativas",
                "Elaboramos conclusiones para orientar decisiones institucionales",
              ],
              campoTematico:
                "Medidas de tendencia central y análisis comparativo",
              criteriosEvaluacion: [
                "Calcula e interpreta medidas estadísticas en función del problema planteado.",
                "Compara conjuntos de datos y argumenta diferencias relevantes.",
                "Comunica conclusiones claras para sustentar propuestas de mejora.",
              ],
              instrumentoEvaluacion: "Lista de cotejo",
            },
          ],
        },
        {
          grado: "Cuarto Año",
          area: "Matemática",
          competencias: [
            {
              competenciaCapacidades: {
                competencia:
                  "Resuelve problemas de regularidad, equivalencia y cambio",
                capacidades: [
                  "Modela situaciones con funciones",
                  "Interpreta el comportamiento de funciones en contextos reales",
                  "Argumenta decisiones a partir de representaciones funcionales",
                ],
              },
              estandar:
                "Resuelve problemas de regularidad, equivalencia y cambio al modelar con funciones y analizar su comportamiento para tomar decisiones fundamentadas.",
              actividades: [
                "Modelamos el consumo con funciones lineales y no lineales",
                "Interpretamos gráficas para identificar crecimiento y variación",
                "Evaluamos estrategias de ahorro con base en modelos funcionales",
              ],
              campoTematico: "Funciones y modelación",
              criteriosEvaluacion: [
                "Selecciona funciones adecuadas para modelar datos de consumo del contexto escolar.",
                "Interpreta parámetros y comportamiento de la función en términos de la situación real.",
                "Sustenta propuestas de acción usando evidencia proveniente de modelos funcionales.",
              ],
              instrumentoEvaluacion: "Lista de cotejo",
            },
            {
              competenciaCapacidades: {
                competencia:
                  "Resuelve problemas de gestión de datos e incertidumbre",
                capacidades: [
                  "Analiza datos con representaciones estadísticas",
                  "Valora la confiabilidad de la información",
                  "Comunica resultados con rigurosidad",
                ],
              },
              estandar:
                "Resuelve problemas de gestión de datos e incertidumbre al analizar y evaluar información para emitir conclusiones fundamentadas.",
              actividades: [
                "Consolidamos bases de datos de consumo por periodos",
                "Interpretamos indicadores para evaluar efectividad de acciones",
                "Comunicamos hallazgos en una exposición con sustento matemático",
              ],
              campoTematico: "Análisis de datos para toma de decisiones",
              criteriosEvaluacion: [
                "Organiza y procesa datos de manera consistente para el análisis requerido.",
                "Evalúa la pertinencia de indicadores para valorar resultados de intervención.",
                "Presenta conclusiones con argumentos numéricos claros y verificables.",
              ],
              instrumentoEvaluacion: "Lista de cotejo",
            },
          ],
        },
      ],
      competenciasTransversalesPorGrado: [
        {
          grado: "Segundo Año",
          competencias: [
            {
              competenciaCapacidades: {
                competencia:
                  "Se desenvuelve en entornos virtuales generados por las TIC",
                capacidades: [
                  "Personaliza entornos virtuales",
                  "Gestiona información del entorno virtual",
                  "Interactúa en entornos virtuales",
                  "Crea objetos virtuales en diversos formatos",
                ],
              },
              estandarCiclo:
                "Se desenvuelve en entornos virtuales cuando gestiona información, interactúa y crea recursos digitales con responsabilidad.",
              criterios: [
                "Selecciona información digital pertinente para analizar el consumo de recursos en su institución.",
                "Usa herramientas virtuales para organizar y presentar datos con claridad.",
                "Comparte productos digitales respetando normas de convivencia y seguridad.",
              ],
            },
            {
              competenciaCapacidades: {
                competencia: "Gestiona su aprendizaje de manera autónoma",
                capacidades: [
                  "Define metas de aprendizaje",
                  "Organiza acciones estratégicas para alcanzar sus metas",
                  "Monitorea y ajusta su desempeño durante el proceso de aprendizaje",
                ],
              },
              estandarCiclo:
                "Gestiona su aprendizaje cuando define metas, organiza acciones y evalúa su progreso para mejorar resultados.",
              criterios: [
                "Define metas concretas para el desarrollo de actividades matemáticas de la unidad.",
                "Organiza tiempos y acciones para cumplir las tareas propuestas en cada semana.",
                "Evalúa su avance y ajusta estrategias cuando identifica dificultades.",
              ],
            },
          ],
        },
        {
          grado: "Tercer Año",
          competencias: [
            {
              competenciaCapacidades: {
                competencia:
                  "Se desenvuelve en entornos virtuales generados por las TIC",
                capacidades: [
                  "Personaliza entornos virtuales",
                  "Gestiona información del entorno virtual",
                  "Interactúa en entornos virtuales",
                  "Crea objetos virtuales en diversos formatos",
                ],
              },
              estandarCiclo:
                "Se desenvuelve en entornos virtuales cuando gestiona información, interactúa y crea recursos digitales con responsabilidad.",
              criterios: [
                "Gestiona fuentes digitales confiables para construir modelos algebraicos del problema.",
                "Utiliza aplicaciones digitales para representar y contrastar resultados matemáticos.",
                "Comunica hallazgos en entornos virtuales con lenguaje claro y responsable.",
              ],
            },
            {
              competenciaCapacidades: {
                competencia: "Gestiona su aprendizaje de manera autónoma",
                capacidades: [
                  "Define metas de aprendizaje",
                  "Organiza acciones estratégicas para alcanzar sus metas",
                  "Monitorea y ajusta su desempeño durante el proceso de aprendizaje",
                ],
              },
              estandarCiclo:
                "Gestiona su aprendizaje cuando define metas, organiza acciones y evalúa su progreso para mejorar resultados.",
              criterios: [
                "Establece metas realistas para resolver situaciones algebraicas de la unidad.",
                "Planifica acciones y recursos para completar productos por etapa.",
                "Monitorea logros y ajusta procedimientos según evidencias de su desempeño.",
              ],
            },
          ],
        },
        {
          grado: "Cuarto Año",
          competencias: [
            {
              competenciaCapacidades: {
                competencia:
                  "Se desenvuelve en entornos virtuales generados por las TIC",
                capacidades: [
                  "Personaliza entornos virtuales",
                  "Gestiona información del entorno virtual",
                  "Interactúa en entornos virtuales",
                  "Crea objetos virtuales en diversos formatos",
                ],
              },
              estandarCiclo:
                "Se desenvuelve en entornos virtuales cuando gestiona información, interactúa y crea recursos digitales con responsabilidad.",
              criterios: [
                "Integra datos digitales para modelar funciones vinculadas al consumo institucional.",
                "Selecciona herramientas TIC adecuadas para analizar y visualizar comportamiento funcional.",
                "Publica conclusiones en formato digital considerando criterios éticos y de seguridad.",
              ],
            },
            {
              competenciaCapacidades: {
                competencia: "Gestiona su aprendizaje de manera autónoma",
                capacidades: [
                  "Define metas de aprendizaje",
                  "Organiza acciones estratégicas para alcanzar sus metas",
                  "Monitorea y ajusta su desempeño durante el proceso de aprendizaje",
                ],
              },
              estandarCiclo:
                "Gestiona su aprendizaje cuando define metas, organiza acciones y evalúa su progreso para mejorar resultados.",
              criterios: [
                "Define metas de mayor complejidad para modelar y argumentar con funciones.",
                "Gestiona tiempos y estrategias para completar análisis y presentación final.",
                "Reflexiona sobre su proceso y reajusta decisiones para optimizar resultados.",
              ],
            },
          ],
        },
      ],
      secuenciaSesionesPorGrado: {
        totalSemanas: 5,
        grados: {
          "Segundo Año": {
            "1": [
              "Organizamos datos de consumo y reconocemos patrones de variación",
              "Representamos relaciones entre magnitudes con expresiones algebraicas",
            ],
            "2": [
              "Construimos tablas de frecuencia y gráficos estadísticos",
              "Interpretamos resultados para proponer acciones de ahorro",
            ],
            "3": [
              "Comparamos estrategias de resolución en problemas de regularidad y cambio",
            ],
            "4": [
              "Aplicamos medidas estadísticas para analizar casos de la institución",
            ],
            "5": ["Presentamos informe con evidencias y recomendaciones por aula"],
          },
          "Tercer Año": {
            "1": ["Modelamos costos de consumo con ecuaciones lineales"],
            "2": [
              "Resolvemos inecuaciones para plantear metas de reducción de consumo",
            ],
            "3": ["Contrastamos escenarios y validamos resultados algebraicos"],
            "4": [
              "Analizamos promedios, medianas y variación de datos por periodos",
            ],
            "5": [
              "Sustentamos propuesta de mejora con argumentos matemáticos",
            ],
          },
          "Cuarto Año": {
            "1": ["Modelamos la situación con funciones lineales y no lineales"],
            "2": ["Interpretamos gráficas y parámetros para tomar decisiones"],
            "3": [
              "Comparamos modelos funcionales para evaluar estrategias de ahorro",
            ],
            "4": [
              "Consolidamos evidencia cuantitativa y cualitativa del proceso",
            ],
            "5": [
              "Presentamos conclusiones y recomendaciones de impacto institucional",
            ],
          },
        },
      },
      recursosMaterialesDidacticos: [
        "Base de datos de consumo de agua y energía por grado (5 semanas).",
        "Plantilla de hoja de cálculo para tablas, gráficos y análisis estadístico.",
        "Guía de modelación algebraica y funcional con casos del contexto escolar.",
        "Rúbrica y lista de cotejo para evaluación de productos por grado.",
        "Proyector o panel digital para socialización de resultados y sustentación.",
      ],
      bibliografia: [
        "Ministerio de Educación del Perú. Programa Curricular de Educación Secundaria.",
        "Ministerio de Educación del Perú. Currículo Nacional de la Educación Básica.",
        "Cuaderno de trabajo de Matemática - Secundaria (grado correspondiente).",
      ],
    },
  },
  observaciones: [],
};

