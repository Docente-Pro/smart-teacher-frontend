# Contratos API — Fichas de Aplicación

## Resumen Ejecutivo

Las **Fichas de Aplicación** son documentos PDF complementarios que se generan **después** de cada sesión de aprendizaje. Contienen ejercicios, preguntas y actividades para que los estudiantes apliquen lo aprendido.

- **Python** genera el JSON de la ficha (endpoint separado)
- **Node** recibe el JSON y lo guarda en BD (para re-renderizar/editar)
- **Front** renderiza el PDF client-side y lo sube a S3 (presigned URL)
- **Node** genera la presigned URL y registra la URL final del PDF

---

## Flujo Completo

```
                           ┌─────────────────────────────────────────────────────┐
                           │               FLUJO FICHA DE APLICACIÓN             │
                           └─────────────────────────────────────────────────────┘

     FRONT (React)              NODE (Express)                PYTHON (FastAPI)          S3
     ─────────────              ──────────────                ────────────────          ──
          │                          │                              │                   │
          │  1. Sesión ya generada   │                              │                   │
          │  (tiene el JSON sesión)  │                              │                   │
          │                          │                              │                   │
          ├── POST /ficha ──────────►│                              │                   │
          │   { sesionId, sesionJSON │                              │                   │
          │     area, grado, ... }   │                              │                   │
          │                          ├── POST /api/unidad/ ────────►│                   │
          │                          │   ficha-aplicacion           │                   │
          │                          │   { sesionJSON completo,     │                   │
          │                          │     area, grado, nivel }     │                   │
          │                          │                              │                   │
          │                          │                   ┌──────────┤                   │
          │                          │                   │ Gemini   │                   │
          │                          │                   │ genera   │                   │
          │                          │                   │ ficha    │                   │
          │                          │                   └──────────┤                   │
          │                          │                              │                   │
          │                          │◄── { fichaJSON } ────────────┤                   │
          │                          │                              │                   │
          │                          ├── Guardar fichaJSON en BD    │                   │
          │                          │   (tabla FichaAplicacion)    │                   │
          │                          │                              │                   │
          │                          ├── Generar presigned URL ─────┼──────────────────►│
          │                          │   para upload a S3           │                   │
          │                          │                              │                   │
          │◄── { fichaJSON, ─────────┤                              │                   │
          │     presignedUrl,        │                              │                   │
          │     fichaId } ───────────┤                              │                   │
          │                          │                              │                   │
          ├── Renderizar PDF ────────┼──────────────────────────────┼───────────────────│
          │   (client-side)          │                              │                   │
          │                          │                              │                   │
          ├── PUT presignedUrl ──────┼──────────────────────────────┼──────────────────►│
          │   (upload PDF a S3)      │                              │                   │ PDF ✓
          │                          │                              │                   │
          ├── POST /ficha/confirm ──►│                              │                   │
          │   { fichaId, s3Url }     │                              │                   │
          │                          ├── Actualizar BD:             │                   │
          │                          │   pdfUrl = s3Url             │                   │
          │                          │                              │                   │
          │◄── { success } ──────────┤                              │                   │
          │                          │                              │                   │
```

---

## Paso a Paso Detallado

### Paso 1: Front solicita ficha a Node

El front YA tiene el JSON de la sesión generada. Envía la solicitud a Node.

### Paso 2: Node llama a Python

Node extrae los datos relevantes de la sesión y los envía al endpoint de Python.

### Paso 3: Python genera la ficha con Gemini

Python construye un prompt especializado por área, incluyendo el contenido de la sesión como contexto. Gemini genera un JSON estructurado con secciones renderizables.

### Paso 4: Node guarda JSON + genera presigned URL

- Guarda el `fichaJSON` en la tabla `FichaAplicacion` (BD Prisma)
- Genera una presigned URL de S3 para que el front suba el PDF

### Paso 5: Front renderiza PDF y lo sube a S3

- Renderiza el PDF en el navegador (jsPDF / html2pdf / react-pdf)
- Sube el archivo a S3 usando la presigned URL (PUT)

### Paso 6: Front confirma upload

- Front avisa a Node que el PDF está en S3
- Node actualiza el registro con la URL pública del PDF

---

## Endpoint Python: POST /api/unidad/ficha-aplicacion

### Request Body

```jsonc
{
  // ── Contexto de la sesión (obligatorio) ──
  "sesionJSON": {
    // JSON COMPLETO de la sesión ya generada
    // (inicio, desarrollo, cierre, propósitos, etc.)
  },

  // ── Datos curriculares ──
  "area": "Matemática",
  "grado": "3er grado",
  "nivel": "Primaria",
  "competencia": "Resuelve problemas de cantidad",
  "capacidades": ["Traduce cantidades a expresiones numéricas", "..."],

  // ── Configuración de la ficha ──
  "cantidadEjercicios": 5,        // opcional, default según área
  "incluirRespuestas": true,       // incluir solucionario para el docente
  "dificultad": "media",           // "baja" | "media" | "alta" (opcional)

  // ── Gráficos: qué tipo usó la sesión (Python reutiliza el mismo) ──
  "tipoGraficoSesion": "ecuacion_cajas",    // tipo principal detectado en la sesión (o null)
  "tipoGraficoOperacion": "operacion_vertical", // tipo de graficoOperacion si aplica (o null)

  // ── Datos de presentación ──
  "institucionEducativa": "I.E. 30001",   // opcional
  "seccion": "A",                          // opcional
  "docente": "María López"                 // opcional
}
```

### Response (éxito)

```jsonc
{
  "success": true,
  "ficha": {
    // ── Encabezado (universal) ──
    "titulo": "Ficha de Aplicación: Resolvemos problemas de multiplicación",
    "area": "Matemática",
    "grado": "3er grado",
    "nivel": "Primaria",
    "competencia": "Resuelve problemas de cantidad",
    "capacidad": "Traduce cantidades a expresiones numéricas",
    "desempeno": "Establece relaciones entre datos y acciones de juntar, quitar, igualar...",
    "instruccionGeneral": "Lee cada problema con atención. Resuelve en el espacio indicado y escribe tu respuesta.",

    // ── Tipo de ficha (determina la estructura del cuerpo) ──
    "tipoFicha": "problemas",
    // Valores posibles: "problemas" | "comprension_lectora" | "indagacion" |
    //                   "reflexion" | "apreciacion" | "worksheet" | "registro_actividad"

    // ── Cuerpo: array de secciones/bloques renderizables ──
    "secciones": [
      // ... ver "Tipos de Sección" abajo
    ],

    // ── Solucionario (solo si incluirRespuestas: true) ──
    "solucionario": [
      {
        "seccionIndex": 0,
        "respuesta": "48 ÷ 6 = 8 naranjas por bolsa"
      }
    ]
  }
}
```

### Response (error)

```json
{
  "success": false,
  "error": "No se pudo generar la ficha de aplicación",
  "detail": "El JSON de la sesión no contiene desarrollo con procesos pedagógicos"
}
```

---

## Tipos de Sección (Bloques Renderizables)

El front necesita saber renderizar **10 tipos de bloque**. La ficha de CUALQUIER área se arma combinándolos.

### 1. `texto` — Bloque de lectura

```json
{
  "tipo": "texto",
  "titulo": "Lee con atención",
  "contenido": {
    "texto": "María fue al mercado de Huancayo con su abuela. Llevaban 24 soles para comprar frutas y verduras. En el primer puesto, compraron 3 kilos de papa a 2 soles el kilo...",
    "fuente": "Adaptado de Cuadernillo MINEDU 3° Comunicación"
  }
}
```

**Renderizado:** Recuadro con fondo suave, texto con fuente serif, fuente en cursiva abajo.

### 2. `problema` — Problema contextualizado

```json
{
  "tipo": "problema",
  "titulo": "Problema 1",
  "contenido": {
    "enunciado": "Don Pedro tiene 48 naranjas y quiere repartirlas en 6 bolsas iguales. ¿Cuántas naranjas habrá en cada bolsa?",
    "datos": ["48 naranjas", "6 bolsas iguales"],
    "pregunta": "¿Cuántas naranjas habrá en cada bolsa?",
    "espacioResolucion": true,
    "grafico": { "...mismo schema que en la sesión..." },
    "graficoOperacion": { "...si aplica..." }
  }
}
```

**Renderizado:** Enunciado + gráfico SVG renderizado (si existe) + recuadro punteado para resolución + línea para respuesta.

> **IMPORTANTE:** Los campos `grafico` y `graficoOperacion` usan **exactamente los mismos schemas** que los procesos de la sesión. Ver sección "Gráficos en las Fichas" abajo.

### 3. `preguntas` — Preguntas de comprensión/reflexión

```json
{
  "tipo": "preguntas",
  "titulo": "Respondemos",
  "contenido": {
    "preguntas": [
      { "pregunta": "¿Qué compró María en el mercado?", "nivel": "literal", "lineasRespuesta": 2 },
      { "pregunta": "¿Por qué crees que su abuela la acompañó?", "nivel": "inferencial", "lineasRespuesta": 3 },
      { "pregunta": "¿Estás de acuerdo con lo que hizo María? ¿Por qué?", "nivel": "critico", "lineasRespuesta": 4 }
    ]
  }
}
```

**Renderizado:** Pregunta numerada + líneas punteadas según `lineasRespuesta`. Badge de color por nivel (literal=azul, inferencial=verde, crítico=naranja).

### 4. `tabla` — Tabla de datos/observación/registro

```json
{
  "tipo": "tabla",
  "titulo": "Registro de observación",
  "contenido": {
    "columnas": ["Material", "¿Flota?", "¿Se hunde?", "¿Por qué?"],
    "filas": [
      ["Piedra", "", "", ""],
      ["Madera", "", "", ""],
      ["Corcho", "", "", ""]
    ],
    "esEditable": true
  }
}
```

**Renderizado:** Tabla con bordes, columnas con header sombreado, celdas vacías editables.

### 5. `completar` — Completar espacios en blanco

```json
{
  "tipo": "completar",
  "titulo": "Completa las oraciones",
  "contenido": {
    "oraciones": [
      "El ___ es un animal que vive en la ___.",
      "La ___ del Perú es muy ___."
    ],
    "bancoRespuestas": ["cóndor", "diversa", "sierra", "biodiversidad"]
  }
}
```

**Renderizado:** Oraciones con línea/recuadro donde van los blancos. Banco de palabras en recuadro lateral.

### 6. `unir` — Relacionar/unir columnas

```json
{
  "tipo": "unir",
  "titulo": "Une con una línea",
  "contenido": {
    "columnaA": ["Suma", "Resta", "Multiplicación"],
    "columnaB": ["Quitar", "Juntar", "Repetir"]
  }
}
```

**Renderizado:** Dos columnas con puntos/conectores entre ellas.

### 7. `ordenar` — Secuenciar eventos/pasos/números

```json
{
  "tipo": "ordenar",
  "titulo": "Ordena la secuencia",
  "contenido": {
    "elementos": [
      "María llegó al mercado",
      "María salió de casa temprano",
      "María compró frutas",
      "María regresó a casa"
    ],
    "tipoOrden": "cronologico"
  }
}
```

**Renderizado:** Recuadros desordenados con ( ) para numerar.

### 8. `verdadero_falso` — Marcar V o F

```json
{
  "tipo": "verdadero_falso",
  "titulo": "Marca verdadero (V) o falso (F)",
  "contenido": {
    "afirmaciones": [
      { "texto": "El sol sale por el oeste.", "respuesta": false },
      { "texto": "Lima es la capital del Perú.", "respuesta": true }
    ]
  }
}
```

**Renderizado:** Afirmación + casillas (V) (F) al costado. `respuesta` va al solucionario, NO se muestra al estudiante.

### 9. `seleccion_multiple` — Tipo examen

```json
{
  "tipo": "seleccion_multiple",
  "titulo": "Elige la respuesta correcta",
  "contenido": {
    "preguntas": [
      {
        "pregunta": "¿Cuánto es 7 × 8?",
        "opciones": ["a) 54", "b) 56", "c) 58", "d) 48"],
        "respuestaCorrecta": 1
      }
    ]
  }
}
```

**Renderizado:** Pregunta + opciones con círculos para marcar. `respuestaCorrecta` va al solucionario.

### 10. `espacio_dibujo` — Espacio para dibujar

```json
{
  "tipo": "espacio_dibujo",
  "titulo": "Dibuja lo que imaginaste",
  "contenido": {
    "instruccion": "Dibuja la escena principal del cuento que leíste",
    "alto": "grande"
  }
}
```

**Renderizado:** Recuadro vacío grande (alto: "pequeño"=4cm, "mediano"=8cm, "grande"=12cm).

---

## Mapping Área → tipoFicha → Secciones Típicas

| Área | `tipoFicha` | Secciones típicas | Cantidad default |
|------|-------------|-------------------|------------------|
| **Matemática** | `problemas` | problema × 4-5, tabla (opc.) | 5 problemas |
| **Comunicación** | `comprension_lectora` | texto + preguntas (3 niveles) + espacio_dibujo (opc.) | 1 texto + 8 preguntas |
| **Ciencia y Tecnología** | `indagacion` | texto (hipótesis) + tabla (observación) + preguntas (conclusiones) | 6-8 ítems |
| **Personal Social** | `reflexion` | texto (caso) + preguntas + completar (compromisos) | 6-8 ítems |
| **Educación Religiosa** | `reflexion` | texto (lectura bíblica) + preguntas + completar | 5-6 ítems |
| **Arte y Cultura** | `apreciacion` | texto (obra) + preguntas (análisis) + espacio_dibujo | 4-5 ítems |
| **Educación Física** | `registro_actividad` | tabla (registro) + verdadero_falso (hábitos) | 5-6 ítems |
| **Inglés** | `worksheet` | completar + unir + preguntas + seleccion_multiple | 8-10 ítems |
| **Plan Lector** | `comprension_lectora` | texto + preguntas (3 niveles) | 1 texto + 6 preguntas |
| **Tutoría** | `reflexion` | texto (caso/dinámica) + preguntas + completar (compromisos) | 4-5 ítems |

---

## Contratos Node.js

### Tabla Prisma sugerida

```prisma
model FichaAplicacion {
  id            String   @id @default(uuid())
  sesionId      String
  fichaJSON     Json     // JSON completo de la ficha (para re-renderizar)
  pdfUrl        String?  // URL del PDF en S3 (null hasta que front confirme upload)
  area          String
  grado         String
  tipoFicha     String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relación con la sesión (ajustar según tu schema)
  // sesion Sesion @relation(fields: [sesionId], references: [id])
}
```

### Endpoint Node 1: Generar Ficha

```
POST /api/sesiones/:sesionId/ficha-aplicacion
```

```typescript
// Node (Express + TypeScript)
export const generarFichaAplicacion = async (req: Request, res: Response) => {
  try {
    const { sesionId } = req.params;
    const { cantidadEjercicios, incluirRespuestas, dificultad } = req.body;

    // 1. Obtener sesión de BD
    const sesion = await prisma.sesion.findUnique({
      where: { id: sesionId },
      include: { unidad: true }
    });
    if (!sesion) return res.status(404).json({ error: "Sesión no encontrada" });

    // 2. Llamar a Python
    const pythonResponse = await axios.post(
      `${PYTHON_URL}/api/unidad/ficha-aplicacion`,
      {
        sesionJSON: sesion.contenidoJSON,   // JSON completo de la sesión
        area: sesion.area,
        grado: sesion.grado,
        nivel: sesion.nivel,
        competencia: sesion.competencia,
        capacidades: sesion.capacidades,
        cantidadEjercicios,
        incluirRespuestas: incluirRespuestas ?? true,
        dificultad: dificultad ?? "media",
        // Extraer tipos de gráfico usados en la sesión para que la ficha los reutilice
        tipoGraficoSesion: extraerTipoGrafico(sesion.contenidoJSON),
        tipoGraficoOperacion: extraerTipoGraficoOperacion(sesion.contenidoJSON),
        institucionEducativa: sesion.unidad?.institucionEducativa,
        docente: req.user?.nombre  // del JWT
      }
    );

    if (!pythonResponse.data.success) {
      return res.status(500).json({ error: pythonResponse.data.error });
    }

    const fichaJSON = pythonResponse.data.ficha;

    // 3. Guardar JSON de la ficha en BD
    const ficha = await prisma.fichaAplicacion.create({
      data: {
        sesionId,
        fichaJSON,
        area: sesion.area,
        grado: sesion.grado,
        tipoFicha: fichaJSON.tipoFicha
      }
    });

    // 4. Generar presigned URL para upload del PDF
    const s3Key = `fichas/${sesion.area}/${ficha.id}.pdf`;
    const presignedUrl = await generatePresignedUploadUrl(s3Key, "application/pdf", 300);

    // 5. Responder al front con todo
    return res.json({
      success: true,
      fichaId: ficha.id,
      ficha: fichaJSON,          // para que front renderice el PDF
      presignedUrl,              // para que front suba el PDF
      s3Key                      // para construir la URL pública después
    });

  } catch (error) {
    console.error("Error generando ficha:", error);
    return res.status(500).json({ error: "Error al generar ficha de aplicación" });
  }
};
```

### Endpoint Node 2: Confirmar Upload del PDF

```
POST /api/fichas/:fichaId/confirm-upload
```

```typescript
export const confirmarUploadFicha = async (req: Request, res: Response) => {
  try {
    const { fichaId } = req.params;
    const { s3Key } = req.body;

    // Construir URL pública
    const pdfUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${s3Key}`;

    // Actualizar registro en BD
    const ficha = await prisma.fichaAplicacion.update({
      where: { id: fichaId },
      data: { pdfUrl }
    });

    return res.json({
      success: true,
      pdfUrl: ficha.pdfUrl
    });

  } catch (error) {
    console.error("Error confirmando upload:", error);
    return res.status(500).json({ error: "Error al confirmar upload" });
  }
};
```

### Endpoint Node 3: Obtener Ficha (re-renderizar/descargar)

```
GET /api/fichas/:fichaId
```

```typescript
export const obtenerFicha = async (req: Request, res: Response) => {
  try {
    const { fichaId } = req.params;

    const ficha = await prisma.fichaAplicacion.findUnique({
      where: { id: fichaId }
    });

    if (!ficha) return res.status(404).json({ error: "Ficha no encontrada" });

    return res.json({
      success: true,
      fichaId: ficha.id,
      ficha: ficha.fichaJSON,    // JSON para re-renderizar
      pdfUrl: ficha.pdfUrl,      // URL del PDF si ya se subió
      area: ficha.area,
      tipoFicha: ficha.tipoFicha
    });

  } catch (error) {
    return res.status(500).json({ error: "Error al obtener ficha" });
  }
};
```

---

## Flujo Front (React)

```typescript
// 1. Solicitar generación (después de tener la sesión)
const generarFicha = async (sesionId: string) => {
  setLoading(true);

  // Paso 1: Pedir ficha a Node
  const { data } = await api.post(`/sesiones/${sesionId}/ficha-aplicacion`, {
    incluirRespuestas: true,
    dificultad: "media"
  });

  // data = { fichaId, ficha (JSON), presignedUrl, s3Key }

  // Paso 2: Renderizar PDF en el navegador
  const pdfBlob = await renderizarPDF(data.ficha);
  //   → usa jsPDF, html2pdf, react-pdf/renderer, etc.

  // Paso 3: Subir PDF a S3 con presigned URL
  await fetch(data.presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/pdf" },
    body: pdfBlob,
  });

  // Paso 4: Confirmar upload
  await api.post(`/fichas/${data.fichaId}/confirm-upload`, {
    s3Key: data.s3Key
  });

  setLoading(false);
  // Listo! El PDF está en S3 y la URL guardada en BD
};
```

### Renderizado del PDF (sugerencia)

```typescript
import jsPDF from "jspdf";

const renderizarPDF = async (ficha: FichaJSON): Promise<Blob> => {
  const doc = new jsPDF();

  // ── Encabezado ──
  doc.setFontSize(16);
  doc.text(ficha.titulo, 105, 20, { align: "center" });
  doc.setFontSize(10);
  doc.text(`Área: ${ficha.area} | Grado: ${ficha.grado}`, 105, 28, { align: "center" });
  doc.text(`Competencia: ${ficha.competencia}`, 20, 38);
  doc.text(ficha.instruccionGeneral, 20, 48);

  let y = 60;

  // ── Renderizar cada sección según tipo ──
  for (const seccion of ficha.secciones) {
    switch (seccion.tipo) {
      case "texto":
        y = renderTexto(doc, seccion, y);
        break;
      case "problema":
        y = renderProblema(doc, seccion, y);
        break;
      case "preguntas":
        y = renderPreguntas(doc, seccion, y);
        break;
      case "tabla":
        y = renderTabla(doc, seccion, y);
        break;
      // ... etc para cada tipo
    }

    // Auto page-break si necesario
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
  }

  return doc.output("blob");
};
```

---

---

## Gráficos en las Fichas de Aplicación

### Principio clave

Las fichas **reusan el mismo sistema de gráficos** que las sesiones. Si la sesión de Matemática generó un `operacion_vertical` en el proceso de Socialización, la ficha de aplicación también puede incluir `operacion_vertical` en sus problemas.

### ¿Cuándo incluir gráficos?

| Área | ¿Gráfico en ficha? | Tipos típicos en fichas |
|------|--------------------|--------------------------|
| **Matemática** | **SÍ, casi siempre** | `ecuacion_cajas`, `operacion_vertical`, `recta_numerica`, `tabla_valores`, `circulos_fraccion`, `barras_comparacion`, `patron_geometrico`, etc. |
| **Comunicación** | A veces | `estructura_narrativa`, `organizador_kvl` (para comprensión lectora) |
| **Ciencia y Tecnología** | A veces | `tabla_observacion`, `ciclo_proceso` (para fichas de indagación) |
| **Personal Social** | Ocasional | `linea_tiempo`, `cuadro_comparativo` |
| **Ed. Religiosa** | Raro | `tarjeta_reflexion` |
| **Arte y Cultura** | Raro | `ficha_analisis_obra` |
| **Ed. Física** | No aplica | — |
| **Inglés** | No aplica | — |

### Cómo funciona el gráfico dentro de un bloque

El campo `grafico` va **dentro del contenido** del bloque, igual que en los procesos de la sesión:

```jsonc
// Bloque "problema" de la ficha CON gráfico
{
  "tipo": "problema",
  "titulo": "Problema 2",
  "contenido": {
    "enunciado": "Mariana tenía 45 caramelos. Regaló 18 a sus amigas. ¿Cuántos caramelos le quedan?",
    "datos": ["45 caramelos", "regaló 18"],
    "pregunta": "¿Cuántos caramelos le quedan?",
    "espacioResolucion": true,
    "grafico": {
      "tipoGrafico": "ecuacion_cajas",
      "titulo": "Resolvemos con cajas",
      "ecuacion": {
        "formato": "☐ - ☐ = ☐",
        "valores": [
          { "posicion": 1, "valor": 45, "color": "#4FC3F7", "visible": true },
          { "posicion": 2, "valor": 18, "color": "#FF8A65", "visible": true },
          { "posicion": 3, "valor": null, "color": "#E0E0E0", "visible": false }
        ]
      }
    },
    "graficoOperacion": {
      "tipoGrafico": "operacion_vertical",
      "titulo": "Resolvemos en forma vertical",
      "operacion": {
        "tipo": "resta",
        "numero1": "45",
        "numero2": "18",
        "resultado": "",
        "mostrarResultado": false
      }
    }
  }
}
```

```jsonc
// Bloque "problema" de la ficha SIN gráfico (problema de lógica verbal)
{
  "tipo": "problema",
  "titulo": "Problema 5",
  "contenido": {
    "enunciado": "Si cada caja tiene 6 botellas y hay 9 cajas, ¿cuántas botellas hay en total?",
    "datos": ["6 botellas por caja", "9 cajas"],
    "pregunta": "¿Cuántas botellas hay en total?",
    "espacioResolucion": true,
    "grafico": null,
    "graficoOperacion": null
  }
}
```

### Regla para el prompt de Python

La IA (Gemini) decide cuándo incluir gráficos en la ficha según estas reglas:

1. **Matemática**: Incluir `grafico` en al menos 2 de los 5 problemas. Usar el mismo `tipoGrafico` que se usó en la sesión (se pasa en `sesionJSON`). Incluir `graficoOperacion` cuando haya operaciones explícitas.
2. **Comunicación**: Incluir `grafico` (ej. `estructura_narrativa`) si la ficha es de comprensión lectora y el texto es narrativo.
3. **Ciencia y Tecnología**: Incluir `grafico` (ej. `tabla_observacion`) en fichas de indagación.
4. **Otras áreas**: Solo si es pedagógicamente relevante. No forzar.
5. **Nunca**: El `grafico` no va en bloques de tipo `espacio_dibujo`, `verdadero_falso`, `seleccion_multiple` ni `completar`.

### Renderizado en el Front

El front ya tiene los componentes de renderizado SVG de gráficos para las sesiones. **Reutiliza los mismos componentes** para la ficha:

```typescript
// Pseudo-código del renderizador de ficha
const renderBloque = (seccion: SeccionFicha) => {
  switch (seccion.tipo) {
    case "problema":
      return (
        <div>
          <p>{seccion.contenido.enunciado}</p>
          {/* Reusar el mismo componente de la sesión */}
          {seccion.contenido.grafico && (
            <GraficoRenderer grafico={seccion.contenido.grafico} />
          )}
          {seccion.contenido.graficoOperacion && (
            <GraficoRenderer grafico={seccion.contenido.graficoOperacion} />
          )}
          {seccion.contenido.espacioResolucion && <EspacioResolucion />}
        </div>
      );
    // ...
  }
};
```

Para el **PDF** (jsPDF), el front renderiza el SVG del gráfico a canvas con `html2canvas` o similar, y lo incrusta como imagen en el PDF.

---

## Ejemplo Completo: Ficha de Matemática

### Request a Python

```json
{
  "sesionJSON": {
    "titulo": "Resolvemos problemas de reparto equitativo",
    "desarrollo": {
      "procesos": [
        {
          "proceso": "Familiarización del problema",
          "estrategias": "Se presenta el problema: Don Pedro tiene 48 naranjas..."
        }
      ]
    }
  },
  "area": "Matemática",
  "grado": "3er grado",
  "nivel": "Primaria",
  "competencia": "Resuelve problemas de cantidad",
  "capacidades": ["Traduce cantidades a expresiones numéricas"],
  "cantidadEjercicios": 5,
  "incluirRespuestas": true
}
```

### Response de Python

```json
{
  "success": true,
  "ficha": {
    "titulo": "Ficha de Aplicación: Resolvemos problemas de reparto equitativo",
    "area": "Matemática",
    "grado": "3er grado",
    "nivel": "Primaria",
    "competencia": "Resuelve problemas de cantidad",
    "capacidad": "Traduce cantidades a expresiones numéricas",
    "desempeno": "Establece relaciones entre datos y acciones de repartir en cantidades iguales...",
    "instruccionGeneral": "Lee cada problema con atención. Usa dibujos, esquemas o operaciones para resolverlo. Escribe tu respuesta completa.",
    "tipoFicha": "problemas",
    "secciones": [
      {
        "tipo": "problema",
        "titulo": "Problema 1",
        "contenido": {
          "enunciado": "La señora Rosa tiene 36 galletas y quiere repartirlas por igual entre sus 4 hijos. ¿Cuántas galletas le tocará a cada hijo?",
          "datos": ["36 galletas", "4 hijos", "reparto equitativo"],
          "pregunta": "¿Cuántas galletas le tocará a cada hijo?",
          "espacioResolucion": true,
          "grafico": {
            "tipoGrafico": "ecuacion_cajas",
            "titulo": "Representamos el reparto",
            "ecuacion": {
              "formato": "☐ ÷ ☐ = ☐",
              "valores": [
                { "posicion": 1, "valor": 36, "color": "#4FC3F7", "visible": true },
                { "posicion": 2, "valor": 4, "color": "#FF8A65", "visible": true },
                { "posicion": 3, "valor": null, "color": "#E0E0E0", "visible": false }
              ]
            }
          },
          "graficoOperacion": {
            "tipoGrafico": "operacion_vertical",
            "titulo": "Resuelve la operación",
            "operacion": {
              "tipo": "division",
              "numero1": "36",
              "numero2": "4",
              "resultado": "",
              "mostrarResultado": false
            }
          }
        }
      },
      {
        "tipo": "problema",
        "titulo": "Problema 2",
        "contenido": {
          "enunciado": "En la feria de Huancavelica, don Julio vendió 56 choclos en 7 bolsas con la misma cantidad. ¿Cuántos choclos había en cada bolsa?",
          "datos": ["56 choclos", "7 bolsas iguales"],
          "pregunta": "¿Cuántos choclos había en cada bolsa?",
          "espacioResolucion": true,
          "grafico": null,
          "graficoOperacion": {
            "tipoGrafico": "operacion_vertical",
            "titulo": "Resuelve",
            "operacion": {
              "tipo": "division",
              "numero1": "56",
              "numero2": "7",
              "resultado": "",
              "mostrarResultado": false
            }
          }
        }
      },
      {
        "tipo": "problema",
        "titulo": "Problema 3",
        "contenido": {
          "enunciado": "La profesora tiene 45 colores y los reparte entre 9 mesas de trabajo. ¿Cuántos colores habrá en cada mesa?",
          "datos": ["45 colores", "9 mesas"],
          "pregunta": "¿Cuántos colores habrá en cada mesa?",
          "espacioResolucion": true,
          "grafico": {
            "tipoGrafico": "ecuacion_cajas",
            "titulo": "Usa las cajas para resolver",
            "ecuacion": {
              "formato": "☐ ÷ ☐ = ☐",
              "valores": [
                { "posicion": 1, "valor": 45, "color": "#4FC3F7", "visible": true },
                { "posicion": 2, "valor": 9, "color": "#FF8A65", "visible": true },
                { "posicion": 3, "valor": null, "color": "#E0E0E0", "visible": false }
              ]
            }
          },
          "graficoOperacion": null
        }
      },
      {
        "tipo": "problema",
        "titulo": "Problema 4 — Desafío",
        "contenido": {
          "enunciado": "En el mercado de Ayacucho, doña Carmen compró 72 mandarinas. Quiere armar paquetes con 8 mandarinas cada uno. ¿Cuántos paquetes podrá armar?",
          "datos": ["72 mandarinas", "8 por paquete"],
          "pregunta": "¿Cuántos paquetes podrá armar?",
          "espacioResolucion": true,
          "grafico": null,
          "graficoOperacion": null
        }
      },
      {
        "tipo": "tabla",
        "titulo": "Resuelve y completa",
        "contenido": {
          "columnas": ["Total", "Grupos", "En cada grupo", "Operación"],
          "filas": [
            ["24", "3", "", ""],
            ["40", "5", "", ""],
            ["63", "7", "", ""],
            ["54", "6", "", ""]
          ],
          "esEditable": true
        }
      }
    ],
    "solucionario": [
      { "seccionIndex": 0, "respuesta": "36 ÷ 4 = 9 galletas por hijo" },
      { "seccionIndex": 1, "respuesta": "56 ÷ 7 = 8 choclos por bolsa" },
      { "seccionIndex": 2, "respuesta": "45 ÷ 9 = 5 colores por mesa" },
      { "seccionIndex": 3, "respuesta": "72 ÷ 8 = 9 paquetes" },
      { "seccionIndex": 4, "respuesta": "24÷3=8 | 40÷5=8 | 63÷7=9 | 54÷6=9" }
    ]
  }
}
```

---

## Ejemplo Completo: Ficha de Comunicación

### Response de Python

```json
{
  "success": true,
  "ficha": {
    "titulo": "Ficha de Comprensión Lectora: La fiesta de mi pueblo",
    "area": "Comunicación",
    "grado": "4to grado",
    "nivel": "Primaria",
    "competencia": "Lee diversos tipos de textos escritos en su lengua materna",
    "capacidad": "Infiere e interpreta información del texto",
    "desempeno": "Deduce características implícitas de personajes, animales, objetos y lugares...",
    "instruccionGeneral": "Lee el texto con mucha atención. Luego responde las preguntas. Recuerda escribir respuestas completas.",
    "tipoFicha": "comprension_lectora",
    "secciones": [
      {
        "tipo": "texto",
        "titulo": "Lee con atención",
        "contenido": {
          "texto": "Cada año, en el mes de junio, mi pueblo celebra la Fiesta de San Juan. Desde temprano, las familias preparan juanes con arroz, huevo y aceituna envueltos en hojas de bijao. Los niños corren por las calles decoradas con banderines de colores mientras suena la música de la banda. Mi abuela dice que cuando ella era pequeña, la fiesta duraba tres días y todos los vecinos colaboraban para adornar la plaza. Este año, mi mamá me enseñó a envolver los juanes por primera vez. Me sentí muy orgullosa de aprender esta tradición de mi familia.",
          "fuente": "Texto creado para la sesión"
        }
      },
      {
        "tipo": "preguntas",
        "titulo": "Comprensión literal",
        "contenido": {
          "preguntas": [
            { "pregunta": "¿En qué mes se celebra la Fiesta de San Juan?", "nivel": "literal", "lineasRespuesta": 1 },
            { "pregunta": "¿Qué ingredientes se usan para preparar los juanes?", "nivel": "literal", "lineasRespuesta": 2 },
            { "pregunta": "¿Quién le enseñó a la narradora a envolver juanes?", "nivel": "literal", "lineasRespuesta": 1 }
          ]
        }
      },
      {
        "tipo": "preguntas",
        "titulo": "Comprensión inferencial",
        "contenido": {
          "preguntas": [
            { "pregunta": "¿Por qué crees que la abuela menciona que antes la fiesta duraba tres días?", "nivel": "inferencial", "lineasRespuesta": 3 },
            { "pregunta": "¿Qué quiere decir la narradora cuando dice que se sintió 'muy orgullosa'?", "nivel": "inferencial", "lineasRespuesta": 3 }
          ]
        }
      },
      {
        "tipo": "preguntas",
        "titulo": "Comprensión crítica",
        "contenido": {
          "preguntas": [
            { "pregunta": "¿Crees que es importante mantener las tradiciones de nuestro pueblo? ¿Por qué?", "nivel": "critico", "lineasRespuesta": 4 },
            { "pregunta": "¿Qué tradición de tu familia o comunidad te gustaría enseñar a otros niños?", "nivel": "critico", "lineasRespuesta": 4 }
          ]
        }
      },
      {
        "tipo": "espacio_dibujo",
        "titulo": "Dibuja tu escena favorita",
        "contenido": {
          "instruccion": "Dibuja la parte del texto que más te gustó. Luego escribe una oración explicando tu dibujo.",
          "alto": "grande"
        }
      }
    ],
    "solucionario": [
      { "seccionIndex": 1, "respuesta": "1) En junio. 2) Arroz, huevo y aceituna envueltos en hojas de bijao. 3) Su mamá." },
      { "seccionIndex": 2, "respuesta": "1) Porque antes había más participación comunitaria y la celebración era más extensa. 2) Siente orgullo porque aprendió algo valioso de su cultura familiar." }
    ]
  }
}
```

---

## Helper S3 para Presigned URL (Node)

```typescript
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({ region: process.env.S3_REGION });

export const generatePresignedUploadUrl = async (
  key: string,
  contentType: string,
  expiresInSeconds: number = 300
): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
};
```

---

## Rutas Node (Express Router)

```typescript
import { Router } from "express";
import { generarFichaAplicacion, confirmarUploadFicha, obtenerFicha } from "./fichaController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Generar ficha (llama a Python + guarda JSON en BD + devuelve presigned URL)
router.post("/sesiones/:sesionId/ficha-aplicacion", authMiddleware, generarFichaAplicacion);

// Confirmar que el front subió el PDF a S3
router.post("/fichas/:fichaId/confirm-upload", authMiddleware, confirmarUploadFicha);

// Obtener ficha (JSON para re-renderizar + URL del PDF)
router.get("/fichas/:fichaId", authMiddleware, obtenerFicha);

export default router;
```

### Helper: Extraer Tipo de Gráfico de la Sesión

```typescript
/**
 * Recorre los procesos del desarrollo de la sesión y extrae el primer
 * tipoGrafico encontrado. Se pasa a Python para que la ficha use el mismo.
 */
const extraerTipoGrafico = (sesionJSON: any): string | null => {
  try {
    const procesos = sesionJSON?.desarrollo?.procesos || [];
    for (const proceso of procesos) {
      if (proceso.grafico?.tipoGrafico) {
        return proceso.grafico.tipoGrafico;
      }
    }
  } catch {}
  return null;
};

const extraerTipoGraficoOperacion = (sesionJSON: any): string | null => {
  try {
    const procesos = sesionJSON?.desarrollo?.procesos || [];
    for (const proceso of procesos) {
      if (proceso.graficoOperacion?.tipoGrafico) {
        return proceso.graficoOperacion.tipoGrafico;
      }
    }
  } catch {}
  return null;
};
```

---

## Resumen de Responsabilidades

| Capa | Hace | NO hace |
|------|------|---------|
| **Python** | Genera JSON de la ficha con IA (Gemini) | No guarda nada, no genera PDF, no toca S3 |
| **Node** | Orquesta el flujo, guarda JSON en BD, genera presigned URL, registra PDF URL | No genera PDF, no llama a S3 para upload |
| **Front** | Renderiza PDF desde JSON (jsPDF/html2pdf), sube PDF a S3 (presigned URL), muestra/descarga | No genera el contenido, no decide el tipo de ficha |
| **S3** | Almacena el PDF final | No almacena el JSON (ese va en BD) |

---

## Checklist de Implementación

### Python (rag-service) — TÚ
- [ ] Modelo Pydantic: `FichaAplicacionRequest`, `FichaAplicacionResponse`
- [ ] Prompt por área (reutilizar lógica de `tipoFicha` → prompt especializado)
- [ ] Endpoint `POST /api/unidad/ficha-aplicacion`
- [ ] Validación: cantidad de secciones, tipos correctos, solucionario coherente
- [ ] Tests básicos

### Node (smart-teacher-backend) — BACKEND
- [ ] Tabla Prisma `FichaAplicacion`
- [ ] Migration
- [ ] Controller: `generarFichaAplicacion`, `confirmarUploadFicha`, `obtenerFicha`
- [ ] Helper: `generatePresignedUploadUrl`
- [ ] Rutas: 3 endpoints

### Front (React) — FRONTEND
- [ ] Servicio: llamar a los 3 endpoints de Node
- [ ] Renderizador PDF: componente que renderiza los 10 tipos de bloque
- [ ] Upload flow: presigned URL → PUT → confirm
- [ ] UI: botón "Generar Ficha" en la vista de sesión, loading state, preview
