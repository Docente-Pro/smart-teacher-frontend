import { Document, Footer, Head } from "@htmldocs/react";
import { Button } from "@/components/ui/button";
import { FileDown, Printer } from "lucide-react";
import { generateAndDownloadPDF } from "@/services/htmldocs.service";
import { useRef, useState } from "react";
import { handleToaster } from "@/utils/Toasters/handleToasters";

function DocTest() {
  const documentRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!documentRef.current) {
      handleToaster("No se pudo acceder al documento", "error");
      return;
    }

    setIsGenerating(true);
    try {
      await generateAndDownloadPDF(
        documentRef.current,
        "sesion-aprendizaje-matematica.pdf",
        {
          size: "A4",
          orientation: "portrait",
        }
      );
      handleToaster("PDF generado exitosamente", "success");
    } catch (error) {
      handleToaster("Error al generar el PDF", "error");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header con botones de acción */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Vista Previa - Sesión de Aprendizaje
          </h1>
          <div className="flex gap-3">
            <Button 
              onClick={handlePrint} 
              disabled={isGenerating}
              variant="outline" 
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
            <Button 
              onClick={handleDownloadPDF} 
              disabled={isGenerating}
              className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              <FileDown className="h-4 w-4" />
              {isGenerating ? "Generando PDF..." : "Descargar PDF"}
            </Button>
          </div>
        </div>

        {/* Documento con HTMLDocs */}
        <div ref={documentRef}>
          <Document size="A4" orientation="portrait" margin="0.75in">
            <Head>
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
              <style>
                {`
                  * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                  }
                  
                  body {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    color-adjust: exact !important;
                  }
                  
                  /* Gradientes BBVA */
                  .gradient-header {
                    background: linear-gradient(to right, #2563eb, #0891b2);
                    color: white;
                    padding: 2rem;
                    text-align: center;
                  }
                  
                  .gradient-section {
                    background: linear-gradient(135deg, #eff6ff 0%, #ecfeff 100%);
                    padding: 1.5rem;
                    border-radius: 0.5rem;
                    margin-bottom: 1.5rem;
                  }
                  
                  .border-accent {
                    border-left: 4px solid #2563eb;
                    padding-left: 1.5rem;
                  }
                  
                  /* Títulos */
                  h1 {
                    font-size: 1.875rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                  }
                  
                  h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1e3a8a;
                    margin-bottom: 1rem;
                  }
                  
                  h3 {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #1e40af;
                    margin-bottom: 0.75rem;
                  }
                  
                  h4 {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #1e40af;
                    margin-bottom: 0.5rem;
                  }
                  
                  /* Párrafos y listas */
                  p {
                    margin-bottom: 0.75rem;
                    line-height: 1.6;
                    color: #374151;
                  }
                  
                  ul, ol {
                    margin-left: 1.5rem;
                    margin-bottom: 1rem;
                  }
                  
                  li {
                    margin-bottom: 0.5rem;
                    line-height: 1.6;
                    color: #374151;
                  }
                  
                  /* Grid */
                  .grid-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                  }
                  
                  .info-row {
                    display: flex;
                    margin-bottom: 0.5rem;
                  }
                  
                  .info-label {
                    font-weight: 600;
                    color: #1e40af;
                    min-width: 140px;
                  }
                  
                  .info-value {
                    color: #374151;
                  }
                  
                  /* Secciones */
                  .section {
                    margin-bottom: 2rem;
                  }
                  
                  .subsection {
                    margin-bottom: 1.5rem;
                  }
                  
                  /* Competencia box */
                  .competencia-box {
                    background: #f0f9ff;
                    border: 2px solid #0891b2;
                    border-radius: 0.5rem;
                    padding: 1rem;
                    margin-bottom: 1rem;
                  }
                  
                  /* Tabla */
                  table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 1rem;
                  }
                  
                  th {
                    background: #1e40af;
                    color: white;
                    padding: 0.75rem;
                    text-align: left;
                    font-weight: 600;
                  }
                  
                  td {
                    padding: 0.75rem;
                    border-bottom: 1px solid #e5e7eb;
                  }
                  
                  tr:hover {
                    background: #f9fafb;
                  }
                  
                  /* Badge */
                  .badge {
                    display: inline-block;
                    background: #dbeafe;
                    color: #1e40af;
                    padding: 0.25rem 0.75rem;
                    border-radius: 9999px;
                    font-size: 0.875rem;
                    font-weight: 600;
                  }
                  
                  /* Firmas */
                  .firma-box {
                    text-align: center;
                    padding: 1.5rem;
                    border-top: 2px solid #000;
                    margin-top: 3rem;
                  }
                  
                  .text-blue-100 {
                    color: #dbeafe;
                  }
                  
                  .text-center {
                    text-align: center;
                  }
                  
                  .space-y-2 > * + * {
                    margin-top: 0.5rem;
                  }
                  
                  .space-y-4 > * + * {
                    margin-top: 1rem;
                  }
                  
                  .space-y-8 > * + * {
                    margin-top: 2rem;
                  }
                `}
              </style>
            </Head>
          {/* Encabezado del documento */}
          <div className="gradient-header">
            <div>
              <h1>SESIÓN DE APRENDIZAJE</h1>
              <p className="text-blue-100" style={{fontSize: '1.125rem'}}>Año Académico 2025</p>
            </div>
          </div>

          {/* Contenido del documento */}
          <div style={{padding: '2.5rem 0'}} className="space-y-8">
            {/* Datos Generales */}
            <section className="border-accent section">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">I. DATOS GENERALES</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex">
                    <span className="font-semibold text-blue-800 min-w-[140px]">Institución:</span>
                    <span className="text-gray-700">I.E. "José María Arguedas"</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-blue-800 min-w-[140px]">Docente:</span>
                    <span className="text-gray-700">Prof. María Elena Rodríguez García</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-blue-800 min-w-[140px]">Nivel:</span>
                    <span className="text-gray-700">Primaria</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-blue-800 min-w-[140px]">Grado:</span>
                    <span className="text-gray-700">4to Grado - Sección "A"</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="font-semibold text-blue-800 min-w-[140px]">Área:</span>
                    <span className="text-gray-700">Matemática</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-blue-800 min-w-[140px]">Fecha:</span>
                    <span className="text-gray-700">15 de diciembre de 2025</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-blue-800 min-w-[140px]">Duración:</span>
                    <span className="text-gray-700">90 minutos</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-blue-800 min-w-[140px]">N° Estudiantes:</span>
                    <span className="text-gray-700">28 estudiantes</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Título de la Sesión */}
            <section className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-xl font-bold text-blue-900 mb-2">Título de la Sesión:</h3>
              <p className="text-lg text-gray-800 italic">
                "Resolvemos problemas de multiplicación en situaciones cotidianas"
              </p>
            </section>

            {/* Propósito de Aprendizaje */}
            <section className="border-l-4 border-cyan-600 pl-6">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">II. PROPÓSITO DE APRENDIZAJE</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-cyan-800 mb-3">Competencia:</h3>
                <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                  <p className="text-gray-800">
                    <strong>Resuelve problemas de cantidad:</strong> Consiste en que el estudiante solucione problemas 
                    o plantee nuevos que le demanden construir y comprender las nociones de número, de sistemas numéricos, 
                    sus operaciones y propiedades.
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-cyan-800 mb-3">Capacidades:</h3>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="text-cyan-600 mr-2">●</span>
                    <span className="text-gray-800">
                      <strong>Traduce cantidades a expresiones numéricas:</strong> Es transformar las relaciones entre 
                      los datos y condiciones de un problema a una expresión numérica.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-600 mr-2">●</span>
                    <span className="text-gray-800">
                      <strong>Comunica su comprensión sobre los números y las operaciones:</strong> Es expresar la 
                      comprensión de los conceptos numéricos, las operaciones y propiedades.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-600 mr-2">●</span>
                    <span className="text-gray-800">
                      <strong>Usa estrategias y procedimientos de estimación y cálculo:</strong> Es seleccionar, 
                      adaptar, combinar o crear una variedad de estrategias y procedimientos.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-cyan-800 mb-3">Criterios de Evaluación:</h3>
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-lg border-l-4 border-cyan-500 shadow-sm">
                    <p className="text-gray-800">
                      ✓ <strong>Traduce</strong> situaciones cotidianas a expresiones numéricas de multiplicación 
                      <strong>identificando</strong> los datos relevantes <strong>para</strong> resolver el problema 
                      planteado.
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-cyan-500 shadow-sm">
                    <p className="text-gray-800">
                      ✓ <strong>Expresa</strong> su comprensión de la multiplicación como adición repetida 
                      <strong>utilizando</strong> representaciones concretas y gráficas <strong>para</strong> 
                      comunicar su razonamiento matemático.
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-cyan-500 shadow-sm">
                    <p className="text-gray-800">
                      ✓ <strong>Emplea</strong> estrategias de cálculo mental y algoritmos de multiplicación 
                      <strong>aplicando</strong> las tablas de multiplicar <strong>para</strong> resolver problemas 
                      con eficacia y precisión.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-cyan-800 mb-3">Evidencia o Producto:</h3>
                <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                  <p className="text-gray-800">
                    Resolución de problemas de multiplicación en fichas de trabajo, explicando oralmente el procedimiento 
                    utilizado y los resultados obtenidos mediante representaciones gráficas y numéricas.
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-cyan-800 mb-3">Instrumento de Evaluación:</h3>
                <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                  <p className="text-gray-800">Lista de cotejo y rúbrica analítica</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-cyan-800 mb-3">Competencias Transversales:</h3>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="text-cyan-600 mr-2">●</span>
                    <span className="text-gray-800">
                      <strong>Gestiona su aprendizaje de manera autónoma:</strong> Organiza su tiempo y materiales 
                      para realizar las actividades propuestas.
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Propósito de la Sesión */}
            <section className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-xl font-bold text-blue-900 mb-3">Propósito de la Sesión:</h3>
              <div className="space-y-2 text-gray-800">
                <p><strong>¿Qué aprenderán?</strong> Los estudiantes aprenderán a resolver problemas de multiplicación 
                identificando situaciones de la vida cotidiana donde se aplica esta operación.</p>
                <p><strong>¿Cómo?</strong> A través de situaciones problemáticas contextualizadas, uso de material 
                concreto, representaciones gráficas y aplicación de estrategias de cálculo.</p>
                <p><strong>¿Para qué?</strong> Para desarrollar su pensamiento matemático y aplicar la multiplicación 
                en la resolución de problemas de su entorno, facilitando la toma de decisiones en situaciones cotidianas.</p>
              </div>
            </section>

            {/* Enfoques Transversales */}
            <section className="border-l-4 border-blue-600 pl-6">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">III. ENFOQUES TRANSVERSALES</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="border border-blue-700 p-3 text-left">Enfoque</th>
                      <th className="border border-blue-700 p-3 text-left">Actitudes o Acciones Observables</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-blue-50">
                      <td className="border border-blue-200 p-3 font-semibold text-blue-900">
                        Enfoque de búsqueda de la excelencia
                      </td>
                      <td className="border border-blue-200 p-3 text-gray-800">
                        Los estudiantes demuestran flexibilidad para el cambio y la adaptación a circunstancias diversas, 
                        orientando su esfuerzo en la búsqueda de objetivos de aprendizaje. Se evidencia cuando los 
                        estudiantes perseveran en la resolución de problemas hasta encontrar la solución correcta.
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-blue-200 p-3 font-semibold text-blue-900">
                        Enfoque inclusivo o de atención a la diversidad
                      </td>
                      <td className="border border-blue-200 p-3 text-gray-800">
                        Docentes y estudiantes demuestran tolerancia, apertura y respeto a todos y cada uno, evitando 
                        cualquier forma de discriminación. Se promueve el trabajo colaborativo valorando las diferentes 
                        formas de resolver problemas matemáticos.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Preparación de la Sesión */}
            <section className="border-l-4 border-cyan-600 pl-6">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">IV. PREPARACIÓN DE LA SESIÓN</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-cyan-800 mb-3">¿Qué se debe hacer antes de la sesión?</h3>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="text-cyan-600 mr-2">✓</span>
                    <span className="text-gray-800">Revisar las capacidades y competencias del área de Matemática en el Currículo Nacional.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-600 mr-2">✓</span>
                    <span className="text-gray-800">Preparar el material concreto (bloques multibase, fichas, semillas, etc.).</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-600 mr-2">✓</span>
                    <span className="text-gray-800">Elaborar las fichas de trabajo con problemas contextualizados al entorno de los estudiantes.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-600 mr-2">✓</span>
                    <span className="text-gray-800">Preparar papelógrafos con problemas para trabajar en grupos.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-600 mr-2">✓</span>
                    <span className="text-gray-800">Organizar el aula para el trabajo en equipos de 4 estudiantes.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-600 mr-2">✓</span>
                    <span className="text-gray-800">Tener lista la lista de cotejo con los nombres de los estudiantes.</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-cyan-800 mb-3">Recursos y Materiales:</h3>
                <div className="grid grid-cols-2 gap-3">
                  <ul className="space-y-1 ml-6">
                    <li className="flex items-start">
                      <span className="text-cyan-600 mr-2">•</span>
                      <span className="text-gray-800">Bloques multibase</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-cyan-600 mr-2">•</span>
                      <span className="text-gray-800">Fichas de colores</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-cyan-600 mr-2">•</span>
                      <span className="text-gray-800">Semillas o chapas</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-cyan-600 mr-2">•</span>
                      <span className="text-gray-800">Papelógrafos y plumones</span>
                    </li>
                  </ul>
                  <ul className="space-y-1 ml-6">
                    <li className="flex items-start">
                      <span className="text-cyan-600 mr-2">•</span>
                      <span className="text-gray-800">Hojas de trabajo impresas</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-cyan-600 mr-2">•</span>
                      <span className="text-gray-800">Cinta adhesiva o limpiatipo</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-cyan-600 mr-2">•</span>
                      <span className="text-gray-800">Lista de cotejo</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-cyan-600 mr-2">•</span>
                      <span className="text-gray-800">Cuadernos de trabajo</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Secuencia Didáctica */}
            <section className="border-l-4 border-blue-600 pl-6">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">V. SECUENCIA DIDÁCTICA</h2>

              {/* INICIO */}
              <div className="mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4 rounded-t-lg">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <span className="bg-white text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm">1</span>
                    INICIO (15 minutos)
                  </h3>
                </div>
                <div className="bg-blue-50 p-6 rounded-b-lg border border-blue-200 space-y-4">
                  <div>
                    <h4 className="font-bold text-blue-900 mb-2">Motivación y Activación:</h4>
                    <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                      <p className="text-gray-800">
                        <strong>Paso 1:</strong> La docente inicia la sesión con una dinámica llamada "La tiendita del aula". 
                        Coloca sobre la mesa diferentes objetos agrupados (lápices en paquetes de 6, borradores en cajas de 4, 
                        cuadernos en grupos de 5).
                      </p>
                      <p className="text-gray-800">
                        <strong>Paso 2:</strong> Invita a 3 estudiantes a pasar al frente y pregunta: "Si María compra 3 paquetes 
                        de lápices y cada paquete tiene 6 lápices, ¿cuántos lápices tiene en total?" Los estudiantes manipulan 
                        el material y cuentan.
                      </p>
                      <p className="text-gray-800">
                        <strong>Paso 3:</strong> La docente pregunta: "¿Hay otra forma de averiguarlo sin contar uno por uno? 
                        ¿Qué operación podríamos usar?" Se recogen saberes previos sobre la multiplicación.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-blue-900 mb-2">Presentación de Criterios de Evaluación:</h4>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-gray-800 mb-2">
                        La docente presenta en la pizarra los criterios de evaluación con lenguaje cercano a los estudiantes:
                      </p>
                      <ul className="space-y-1 ml-6">
                        <li className="text-gray-800">• Identificar cuándo usar la multiplicación en problemas del día a día</li>
                        <li className="text-gray-800">• Explicar cómo resolvemos usando dibujos y números</li>
                        <li className="text-gray-800">• Usar las tablas de multiplicar para resolver rápido y bien</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-blue-900 mb-2">Comunicación del Propósito:</h4>
                    <div className="bg-cyan-100 p-4 rounded-lg border-l-4 border-cyan-600">
                      <p className="text-gray-800 italic">
                        "Hoy aprenderemos a resolver problemas de multiplicación que encontramos en nuestra vida diaria. 
                        Usaremos materiales, dibujos y las tablas de multiplicar para encontrar las respuestas. Esto nos 
                        ayudará a resolver situaciones rápidamente, como cuando compramos cosas o repartimos objetos."
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-blue-900 mb-2">Enfoque Transversal en Acción:</h4>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-gray-800">
                        <strong>Búsqueda de la excelencia:</strong> "Recuerden que todos podemos aprender matemática. 
                        Si un problema nos parece difícil, podemos intentarlo de diferentes maneras hasta lograrlo."
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-blue-900 mb-2">Acuerdos de Convivencia:</h4>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-gray-800">Se establecen acuerdos: escuchar con atención, participar activamente, 
                      trabajar en equipo respetando las ideas de todos, y pedir ayuda cuando la necesiten.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* DESARROLLO */}
              <div className="mb-8">
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-4 rounded-t-lg">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <span className="bg-white text-cyan-600 rounded-full w-8 h-8 flex items-center justify-center text-sm">2</span>
                    DESARROLLO (60 minutos)
                  </h3>
                </div>
                <div className="bg-cyan-50 p-6 rounded-b-lg border border-cyan-200 space-y-5">
                  <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-cyan-600">
                    <h4 className="font-bold text-cyan-900 mb-3">Proceso Didáctico 1: Familiarización con el Problema</h4>
                    <p className="text-gray-800 mb-3">
                      <strong>Situación problemática:</strong> "En la feria del colegio, Ana vende empanadas. Tiene 4 bandejas 
                      y en cada bandeja hay 8 empanadas. ¿Cuántas empanadas tiene Ana para vender?"
                    </p>
                    <p className="text-gray-800 mb-2"><strong>Actividades:</strong></p>
                    <ul className="space-y-2 ml-6">
                      <li className="text-gray-800">
                        → Los estudiantes leen el problema de manera individual y luego en voz alta.
                      </li>
                      <li className="text-gray-800">
                        → Identifican las palabras clave: "4 bandejas", "8 empanadas en cada una", "¿cuántas en total?"
                      </li>
                      <li className="text-gray-800">
                        → Explican con sus propias palabras qué se pide resolver.
                      </li>
                    </ul>
                    <p className="text-gray-800 mt-3">
                      <strong>Vinculación con capacidad:</strong> <em>Traduce cantidades a expresiones numéricas</em> - 
                      identifican datos y la incógnita del problema.
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-cyan-600">
                    <h4 className="font-bold text-cyan-900 mb-3">Proceso Didáctico 2: Búsqueda y Ejecución de Estrategias</h4>
                    <p className="text-gray-800 mb-3">
                      La docente organiza a los estudiantes en equipos de 4 y entrega material concreto (fichas de colores).
                    </p>
                    <p className="text-gray-800 mb-2"><strong>Actividades por equipos:</strong></p>
                    <ul className="space-y-2 ml-6">
                      <li className="text-gray-800">
                        → <strong>Representación vivencial:</strong> Forman 4 grupos de 8 fichas cada uno usando el material.
                      </li>
                      <li className="text-gray-800">
                        → <strong>Representación gráfica:</strong> Dibujan en sus cuadernos las 4 bandejas con 8 empanadas 
                        cada una (pueden usar círculos o dibujos simples).
                      </li>
                      <li className="text-gray-800">
                        → <strong>Representación simbólica:</strong> Escriben la operación: 4 × 8 = ? o 8 + 8 + 8 + 8 = ?
                      </li>
                      <li className="text-gray-800">
                        → Aplican la estrategia de sumar repetidamente o usar la tabla del 8.
                      </li>
                      <li className="text-gray-800">
                        → Verifican contando las fichas o usando la calculadora.
                      </li>
                    </ul>
                    <p className="text-gray-800 mt-3">
                      <strong>Vinculación con capacidades:</strong> <em>Usa estrategias y procedimientos de estimación y cálculo</em> - 
                      emplean material concreto, representaciones y algoritmos.
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-cyan-600">
                    <h4 className="font-bold text-cyan-900 mb-3">Proceso Didáctico 3: Socialización de Representaciones</h4>
                    <p className="text-gray-800 mb-2"><strong>Actividades:</strong></p>
                    <ul className="space-y-2 ml-6">
                      <li className="text-gray-800">
                        → Cada equipo presenta su trabajo en papelógrafos, explicando cómo resolvieron el problema.
                      </li>
                      <li className="text-gray-800">
                        → Un representante explica: "Nosotros pusimos 4 grupos de 8 fichas. Luego contamos todas 
                        y nos dio 32. También lo hicimos sumando 8+8+8+8 y también da 32."
                      </li>
                      <li className="text-gray-800">
                        → Los demás estudiantes hacen preguntas y comentarios sobre las diferentes estrategias.
                      </li>
                      <li className="text-gray-800">
                        → La docente valora todas las estrategias y refuerza que la multiplicación es más rápida 
                        que la suma repetida.
                      </li>
                    </ul>
                    <p className="text-gray-800 mt-3">
                      <strong>Vinculación con capacidad:</strong> <em>Comunica su comprensión sobre los números y las operaciones</em> - 
                      expresan cómo resolvieron usando diferentes representaciones.
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-cyan-600">
                    <h4 className="font-bold text-cyan-900 mb-3">Proceso Didáctico 4: Reflexión y Formalización</h4>
                    <p className="text-gray-800 mb-3">
                      La docente guía la formalización del conocimiento a través de preguntas:
                    </p>
                    <ul className="space-y-2 ml-6">
                      <li className="text-gray-800">
                        → ¿Qué hicimos para resolver el problema? → Multiplicamos 4 × 8
                      </li>
                      <li className="text-gray-800">
                        → ¿Qué significa multiplicar? → Es sumar varias veces el mismo número
                      </li>
                      <li className="text-gray-800">
                        → ¿Cuándo usamos la multiplicación? → Cuando tenemos grupos iguales de objetos
                      </li>
                    </ul>
                    <div className="bg-cyan-100 p-4 rounded-lg mt-3 border border-cyan-200">
                      <p className="text-gray-800 font-semibold mb-2">Formalización:</p>
                      <p className="text-gray-800">
                        La <strong>multiplicación</strong> nos ayuda a calcular el total cuando tenemos grupos con la misma 
                        cantidad de elementos. Los términos de la multiplicación son: <strong>factor × factor = producto</strong>
                      </p>
                      <p className="text-gray-800 mt-2">
                        Ejemplo: 4 × 8 = 32 (4 grupos de 8 elementos dan 32 elementos en total)
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-cyan-600">
                    <h4 className="font-bold text-cyan-900 mb-3">Proceso Didáctico 5: Transferencia a Nuevas Situaciones</h4>
                    <p className="text-gray-800 mb-3">
                      Los estudiantes resuelven problemas similares aplicando lo aprendido:
                    </p>
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-gray-800">
                          <strong>Problema 2:</strong> "En el cumpleaños de Luis hay 6 mesas. En cada mesa se sientan 7 niños. 
                          ¿Cuántos niños hay en total?"
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-gray-800">
                          <strong>Problema 3:</strong> "María tiene 5 cajas de colores. Cada caja tiene 12 colores. 
                          ¿Cuántos colores tiene en total?"
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-800 mt-3">
                      Los estudiantes trabajan individualmente en sus fichas de trabajo, aplicando las estrategias aprendidas.
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-blue-600">
                    <h4 className="font-bold text-blue-900 mb-2">Atención Diferenciada:</h4>
                    <ul className="space-y-1 ml-6 text-gray-800">
                      <li>→ Estudiantes que necesitan apoyo: Trabajan con números menores (tablas del 2, 3, 5)</li>
                      <li>→ Estudiantes avanzados: Resuelven problemas con números mayores o de dos pasos</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* CIERRE */}
              <div>
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4 rounded-t-lg">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <span className="bg-white text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm">3</span>
                    CIERRE (15 minutos)
                  </h3>
                </div>
                <div className="bg-blue-50 p-6 rounded-b-lg border border-blue-200 space-y-4">
                  <div>
                    <h4 className="font-bold text-blue-900 mb-3">Metacognición - Reflexión sobre el Aprendizaje:</h4>
                    <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                      <p className="text-gray-800 mb-2">
                        La docente promueve la reflexión mediante preguntas:
                      </p>
                      
                      <div className="space-y-2 ml-4">
                        <div className="flex items-start">
                          <span className="text-blue-600 font-bold mr-3">❓</span>
                          <div>
                            <p className="text-gray-800 font-semibold">¿Qué aprendimos hoy?</p>
                            <p className="text-gray-600 text-sm italic ml-4">
                              → "Aprendimos a resolver problemas de multiplicación y cuándo usarla"
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <span className="text-blue-600 font-bold mr-3">❓</span>
                          <div>
                            <p className="text-gray-800 font-semibold">¿Cómo lo aprendimos?</p>
                            <p className="text-gray-600 text-sm italic ml-4">
                              → "Usando fichas, haciendo dibujos, sumando y usando las tablas"
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <span className="text-blue-600 font-bold mr-3">❓</span>
                          <div>
                            <p className="text-gray-800 font-semibold">¿Qué fue lo más fácil? ¿Qué fue lo más difícil?</p>
                            <p className="text-gray-600 text-sm italic ml-4">
                              → Cada estudiante comparte su experiencia
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <span className="text-blue-600 font-bold mr-3">❓</span>
                          <div>
                            <p className="text-gray-800 font-semibold">¿Para qué nos sirve lo que aprendimos?</p>
                            <p className="text-gray-600 text-sm italic ml-4">
                              → "Para calcular rápido cuando compramos, repartimos cosas, jugamos, etc."
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <span className="text-blue-600 font-bold mr-3">❓</span>
                          <div>
                            <p className="text-gray-800 font-semibold">¿Cómo se sintieron trabajando en equipo?</p>
                            <p className="text-gray-600 text-sm italic ml-4">
                              → Reflexionan sobre la colaboración y el respeto a las ideas de los demás
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-blue-900 mb-3">Recuento de Acciones Realizadas:</h4>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-gray-800 mb-2">Los estudiantes recuerdan el proceso seguido:</p>
                      <ol className="space-y-1 ml-6 text-gray-800">
                        <li>1. Leímos y comprendimos el problema</li>
                        <li>2. Usamos material concreto para representar</li>
                        <li>3. Hicimos dibujos en nuestros cuadernos</li>
                        <li>4. Escribimos la operación matemática</li>
                        <li>5. Compartimos nuestras estrategias</li>
                        <li>6. Practicamos con nuevos problemas</li>
                      </ol>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-blue-900 mb-3">Utilidad de lo Aprendido:</h4>
                    <div className="bg-cyan-100 p-4 rounded-lg border-l-4 border-cyan-600">
                      <p className="text-gray-800 mb-2">
                        <strong>Pregunta reflexiva:</strong> "¿Dónde más podemos usar la multiplicación en nuestra vida diaria?"
                      </p>
                      <p className="text-gray-800 italic">
                        Los estudiantes comparten ejemplos: cuando compramos varios productos del mismo precio, cuando 
                        repartimos dulces en bolsitas iguales, cuando calculamos las patas de varios animales, etc.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-blue-900 mb-3">Aplicación Práctica:</h4>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-gray-800 mb-2">
                        <strong>Pregunta final:</strong> "Si en tu casa necesitas comprar 4 paquetes de galletas y cada 
                        paquete cuesta 3 soles, ¿cómo calcularías cuánto dinero necesitas?"
                      </p>
                      <p className="text-gray-800 italic">
                        → Los estudiantes explican que multiplicarían 4 × 3 = 12 soles
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-blue-900 mb-3">Compromiso Personal:</h4>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-gray-800">
                        Cada estudiante se compromete a practicar las tablas de multiplicar en casa y buscar situaciones 
                        donde puedan aplicar la multiplicación en su vida diaria.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-blue-900 mb-3">Tarea para Casa (Opcional):</h4>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-gray-800">
                        Crear 2 problemas de multiplicación basados en situaciones de su hogar o comunidad, y resolverlos 
                        usando dibujos y operaciones.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Reflexiones */}
            <section className="border-l-4 border-blue-600 pl-6">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">VI. REFLEXIONES SOBRE EL APRENDIZAJE</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="border border-blue-700 p-3 text-left">Aspectos a Reflexionar</th>
                      <th className="border border-blue-700 p-3 text-left">Respuesta</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-blue-50">
                      <td className="border border-blue-200 p-3 font-semibold text-blue-900">
                        ¿Qué avances tuvieron los estudiantes en sus aprendizajes?
                      </td>
                      <td className="border border-blue-200 p-3 text-gray-800">
                        Los estudiantes lograron identificar situaciones donde se aplica la multiplicación, usaron 
                        diferentes estrategias de resolución y la mayoría alcanzó el nivel esperado.
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-blue-200 p-3 font-semibold text-blue-900">
                        ¿Qué dificultades experimentaron los estudiantes?
                      </td>
                      <td className="border border-blue-200 p-3 text-gray-800">
                        Algunos estudiantes confundieron la multiplicación con la suma simple. Se requiere reforzar 
                        el concepto de "grupos iguales" con más ejemplos concretos.
                      </td>
                    </tr>
                    <tr className="bg-blue-50">
                      <td className="border border-blue-200 p-3 font-semibold text-blue-900">
                        ¿Qué aprendizajes debo reforzar en la siguiente sesión?
                      </td>
                      <td className="border border-blue-200 p-3 text-gray-800">
                        Reforzar las tablas de multiplicar del 6, 7, 8 y 9. Trabajar más problemas de aplicación 
                        en contextos diversos.
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-blue-200 p-3 font-semibold text-blue-900">
                        ¿Qué actividades, estrategias y materiales funcionaron y cuáles no?
                      </td>
                      <td className="border border-blue-200 p-3 text-gray-800">
                        El material concreto y el trabajo en equipo fueron muy efectivos. Los papelógrafos permitieron 
                        la socialización. Se necesita más tiempo para la práctica individual.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Firmas */}
            <section className="mt-12 pt-8 border-t-2 border-blue-200">
              <div className="grid grid-cols-2 gap-12">
                <div className="text-center">
                  <div className="border-t-2 border-gray-400 pt-2 mt-16">
                    <p className="font-semibold text-gray-800">Prof. María Elena Rodríguez García</p>
                    <p className="text-gray-600 text-sm">Docente de Aula</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="border-t-2 border-gray-400 pt-2 mt-16">
                    <p className="font-semibold text-gray-800">Lic. Carlos Mendoza Vega</p>
                    <p className="text-gray-600 text-sm">Director</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Footer del documento */}
          <Footer position="bottom-center" className="text-sm text-gray-600">
            {({ currentPage, totalPages }) => (
              <div className="flex justify-between items-center w-full px-4">
                <span>Sesión de Aprendizaje - MINEDU</span>
                <span>Página {currentPage} de {totalPages}</span>
              </div>
            )}
          </Footer>
        </Document>
        </div>
      </div>
    </div>
  );
}

export default DocTest;
