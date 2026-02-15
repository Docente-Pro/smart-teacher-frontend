# Endpoints Necesarios para el Backend - Smart Teacher

## 📋 Resumen
Este documento detalla los endpoints que deben ser implementados en el backend para soportar la funcionalidad de generación de sesiones de aprendizaje con IA.

---

## 🤖 Endpoints de Inteligencia Artificial

### 1. Generar Secuencia Didáctica Completa con IA
**Endpoint:** `POST /api/ia/generar-secuencia-didactica`

**Descripción:** Genera la secuencia didáctica completa (Inicio, Desarrollo, Cierre) basándose en los datos de la sesión.

**Request Body:**
```json
{
  "datosGenerales": {
    "area": "Matemática",
    "grado": "5to",
    "duracion": "90 minutos"
  },
  "propositoAprendizaje": {
    "competencia": "Resuelve problemas de cantidad",
    "capacidades": [
      {
        "nombre": "Traduce cantidades a expresiones numéricas",
        "descripcion": "..."
      }
    ]
  },
  "propositoSesion": {
    "queAprenderan": "Los estudiantes aprenderán...",
    "como": "A través de...",
    "paraQue": "Para que puedan..."
  },
  "criteriosEvaluacion": [
    "Identifica situaciones que requieren multiplicación",
    "Resuelve problemas usando estrategias"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "inicio": {
      "tiempo": "15 min",
      "procesos": [
        {
          "proceso": "Problematización",
          "estrategias": "El docente presenta una situación problemática del contexto...",
          "recursosDidacticos": "Papelógrafo con problema, plumones",
          "tiempo": "5 min"
        },
        {
          "proceso": "Motivación",
          "estrategias": "Se plantean preguntas para recuperar saberes previos...",
          "recursosDidacticos": "Tarjetas de preguntas",
          "tiempo": "5 min"
        },
        {
          "proceso": "Propósito y organización",
          "estrategias": "Se comunica el propósito de la sesión...",
          "recursosDidacticos": "",
          "tiempo": "5 min"
        }
      ]
    },
    "desarrollo": {
      "tiempo": "60 min",
      "procesos": [
        {
          "proceso": "Gestión y acompañamiento",
          "estrategias": "Los estudiantes en grupos analizan el problema, proponen estrategias de solución...",
          "recursosDidacticos": "Material concreto (Base 10), fichas de trabajo",
          "tiempo": "30 min"
        },
        {
          "proceso": "Representación",
          "estrategias": "Representan la solución usando material concreto, gráfico y simbólico...",
          "recursosDidacticos": "Papelógrafos, plumones de colores",
          "tiempo": "20 min"
        },
        {
          "proceso": "Socialización",
          "estrategias": "Cada grupo presenta sus estrategias y soluciones...",
          "recursosDidacticos": "Pizarra, plumones",
          "tiempo": "10 min"
        }
      ]
    },
    "cierre": {
      "tiempo": "15 min",
      "procesos": [
        {
          "proceso": "Evaluación",
          "estrategias": "Se aplica una ficha de evaluación individual...",
          "recursosDidacticos": "Fichas de evaluación",
          "tiempo": "8 min"
        },
        {
          "proceso": "Metacognición",
          "estrategias": "Se realizan preguntas de reflexión: ¿Qué aprendimos hoy? ¿Cómo lo aprendimos?...",
          "recursosDidacticos": "",
          "tiempo": "5 min"
        },
        {
          "proceso": "Transferencia",
          "estrategias": "Se plantea una tarea para casa relacionada con el tema...",
          "recursosDidacticos": "Cuaderno de trabajo",
          "tiempo": "2 min"
        }
      ]
    }
  },
  "message": "Secuencia didáctica generada exitosamente"
}
```

---

### 2. Generar Criterios de Evaluación con IA
**Endpoint:** `POST /api/ia/generar-criterios-evaluacion`

**Descripción:** Genera criterios de evaluación con el formato de **4 pilares pedagógicos** (Habilidad, Conocimiento, Condición, Finalidad) basándose en la competencia y capacidades seleccionadas.

**Request Body:**
```json
{
  "competencia": "Resuelve problemas de cantidad",
  "capacidades": [
    {
      "nombre": "Traduce cantidades a expresiones numéricas",
      "descripcion": "..."
    }
  ],
  "grado": "5to",
  "area": "Matemática"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "criterios": [
      {
        "id": "abc123def456",
        "habilidad": "Identifica",
        "conocimiento": "las características de los seres vivos",
        "condicion": "a través de la observación directa",
        "finalidad": "para clasificarlos según sus similitudes",
        "criterioCompleto": "Identifica las características de los seres vivos a través de la observación directa para clasificarlos según sus similitudes"
      },
      {
        "id": "def456ghi789",
        "habilidad": "Analiza",
        "conocimiento": "situaciones que requieren el uso de la multiplicación",
        "condicion": "mediante la resolución de problemas contextualizados",
        "finalidad": "para aplicar estrategias de cálculo adecuadas",
        "criterioCompleto": "Analiza situaciones que requieren el uso de la multiplicación mediante la resolución de problemas contextualizados para aplicar estrategias de cálculo adecuadas"
      },
      {
        "id": "ghi789jkl012",
        "habilidad": "Explica",
        "conocimiento": "el procedimiento utilizado en la resolución de problemas",
        "condicion": "usando representaciones concretas, gráficas y simbólicas",
        "finalidad": "para comunicar su comprensión matemática",
        "criterioCompleto": "Explica el procedimiento utilizado en la resolución de problemas usando representaciones concretas, gráficas y simbólicas para comunicar su comprensión matemática"
      },
      {
        "id": "jkl012mno345",
        "habilidad": "Justifica",
        "conocimiento": "sus estrategias de solución",
        "condicion": "argumentando con ejemplos y contraejemplos",
        "finalidad": "para validar sus respuestas",
        "criterioCompleto": "Justifica sus estrategias de solución argumentando con ejemplos y contraejemplos para validar sus respuestas"
      }
    ],
    "evidenciaSugerida": "Resolución de problemas de multiplicación en su cuaderno de trabajo, mostrando proceso y estrategias utilizadas",
    "instrumentoSugerido": "Lista de cotejo"
  },
  "message": "Criterios generados exitosamente"
}
```

**Notas Importantes:**
- Cada criterio debe tener un **id único** (puede ser UUID o generado por la IA)
- Los 4 pilares son **obligatorios**: habilidad, conocimiento, condicion, finalidad
- El `criterioCompleto` es la concatenación de los 4 pilares
- Se deben generar entre **3 y 5 criterios** por sesión
- La evidencia y el instrumento también son **generados por IA**

---

### 3. Generar Propósito de la Sesión con IA
**Endpoint:** `POST /api/ia/generar-proposito-sesion`

**Descripción:** Genera las respuestas a ¿Qué aprenderán?, ¿Cómo?, ¿Para qué? basándose en la competencia y capacidades.

**Request Body:**
```json
{
  "area": "Matemática",
  "grado": "5to",
  "competencia": "Resuelve problemas de cantidad",
  "capacidades": [
    {
      "nombre": "Traduce cantidades a expresiones numéricas",
      "descripcion": "..."
    }
  ],
  "duracion": "90 minutos"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "queAprenderan": "Los estudiantes aprenderán a resolver problemas de multiplicación identificando situaciones de su contexto que requieren agrupar cantidades iguales, representándolas con material concreto, gráfico y simbólico.",
    "como": "A través de situaciones problemáticas contextualizadas, trabajo colaborativo, uso de material concreto (Base 10), representaciones gráficas y simbólicas, y estrategias de cálculo mental y escrito.",
    "paraQue": "Para que puedan aplicar la multiplicación en situaciones de su vida diaria, desarrollar su razonamiento matemático y resolver problemas de manera autónoma y eficiente."
  },
  "message": "Propósito generado exitosamente"
}
```

---

### 4. Generar Recursos y Materiales con IA
**Endpoint:** `POST /api/ia/generar-recursos-materiales`

**Descripción:** Sugiere recursos y materiales necesarios para la sesión.

**Request Body:**
```json
{
  "area": "Matemática",
  "grado": "5to",
  "competencia": "Resuelve problemas de cantidad",
  "tema": "Multiplicación",
  "duracion": "90 minutos",
  "secuenciaDidactica": {
    "inicio": { "procesos": [...] },
    "desarrollo": { "procesos": [...] },
    "cierre": { "procesos": [...] }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "quehacerAntes": [
      "Preparar fichas de trabajo con problemas de multiplicación",
      "Organizar el aula en grupos de 4 estudiantes",
      "Revisar y preparar material concreto (Base 10)",
      "Preparar papelógrafos con situación problemática inicial",
      "Elaborar lista de cotejo para evaluación"
    ],
    "recursosMateriales": [
      "Material concreto: Base 10, bloques multibase",
      "Papelógrafos y plumones de colores",
      "Fichas de trabajo impresas",
      "Cuadernos de trabajo de matemática",
      "Tarjetas de preguntas para saberes previos",
      "Lista de cotejo para evaluación",
      "Pizarra y plumones"
    ]
  },
  "message": "Recursos generados exitosamente"
}
```

---

### 5. Generar Enfoques Transversales Sugeridos con IA
**Endpoint:** `POST /api/ia/sugerir-enfoques-transversales`

**Descripción:** Sugiere qué enfoques transversales son más pertinentes para la sesión.

**Request Body:**
```json
{
  "area": "Matemática",
  "grado": "5to",
  "competencia": "Resuelve problemas de cantidad",
  "propositoSesion": {
    "queAprenderan": "...",
    "como": "A través de trabajo colaborativo...",
    "paraQue": "..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "enfoquesSugeridos": [
      {
        "nombre": "Enfoque Búsqueda de la Excelencia",
        "actitudesObservables": "Disposición para adaptarse a los cambios, modificando su manera de trabajar para lograr mejores resultados",
        "justificacion": "Pertinente porque los estudiantes desarrollarán estrategias de solución mejorando su desempeño matemático"
      },
      {
        "nombre": "Enfoque Orientación al Bien Común",
        "actitudesObservables": "Disposición a apoyar incondicionalmente a personas en situaciones comprometidas",
        "justificacion": "Se trabaja de manera colaborativa apoyándose entre compañeros"
      }
    ]
  },
  "message": "Enfoques sugeridos exitosamente"
}
```

---

### 6. Generar Título de la Sesión con IA
**Endpoint:** `POST /api/ia/generar-titulo-sesion`

**Descripción:** Genera un título creativo y pedagógico para la sesión.

**Request Body:**
```json
{
  "area": "Matemática",
  "competencia": "Resuelve problemas de cantidad",
  "propositoSesion": {
    "queAprenderan": "Los estudiantes aprenderán a resolver problemas de multiplicación...",
    "como": "...",
    "paraQue": "..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "titulo": "Resolviendo problemas de multiplicación en situaciones de la vida diaria",
    "alternativas": [
      "Agrupamos cantidades iguales usando la multiplicación",
      "La multiplicación: una herramienta para resolver problemas",
      "Multiplicamos y resolvemos problemas de nuestro contexto"
    ]
  },
  "message": "Título generado exitosamente"
}
```

---

### 7. Generar Sesión Completa con IA (Endpoint Maestro)
**Endpoint:** `POST /api/ia/generar-sesion-completa`

**Descripción:** Genera TODA la sesión de aprendizaje completa basándose en los datos básicos proporcionados.

**Request Body:**
```json
{
  "datosGenerales": {
    "institucion": "I.E. José María Arguedas",
    "docente": "María González Pérez",
    "area": "Matemática",
    "grado": "5to",
    "nivel": "Primaria",
    "duracion": "90 minutos",
    "fecha": "05 de diciembre de 2025"
  },
  "tema": "Multiplicación de números naturales",
  "contexto": "Estudiantes de zona urbana, la mayoría con acceso a materiales educativos",
  "competencia": "Resuelve problemas de cantidad",
  "capacidades": [
    {
      "nombre": "Traduce cantidades a expresiones numéricas",
      "descripcion": "..."
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "titulo": "Resolviendo problemas de multiplicación en situaciones de la vida diaria",
    "propositoAprendizaje": {
      "competencia": "Resuelve problemas de cantidad",
      "capacidades": [...],
      "criteriosEvaluacion": [...],
      "evidenciaAprendizaje": "...",
      "instrumentoEvaluacion": "..."
    },
    "enfoquesTransversales": [...],
    "propositoSesion": {
      "queAprenderan": "...",
      "como": "...",
      "paraQue": "..."
    },
    "preparacion": {
      "quehacerAntes": [...],
      "recursosMateriales": [...]
    },
    "secuenciaDidactica": {
      "inicio": {...},
      "desarrollo": {...},
      "cierre": {...}
    },
    "reflexiones": {
      "sobreAprendizajes": "...",
      "sobreEnsenanza": "..."
    }
  },
  "message": "Sesión completa generada exitosamente"
}
```

---

## 🔧 Endpoints Adicionales Opcionales

### 8. Mejorar/Refinar Texto con IA
**Endpoint:** `POST /api/ia/mejorar-texto`

**Descripción:** Mejora un texto proporcionado haciéndolo más pedagógico y claro.

**Request Body:**
```json
{
  "texto": "Los alumnos van a aprender a multiplicar",
  "contexto": "propositoSesion",
  "area": "Matemática"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "textoMejorado": "Los estudiantes desarrollarán la capacidad de resolver problemas de multiplicación identificando situaciones de su contexto que requieren agrupar cantidades iguales.",
    "sugerencias": [
      "Usar 'estudiantes' en lugar de 'alumnos'",
      "Especificar el tipo de aprendizaje",
      "Contextualizar el aprendizaje"
    ]
  }
}
```

---

## 📝 Notas de Implementación

### Tecnologías Recomendadas para el Backend:
- **IA/LLM:** OpenAI GPT-4, Anthropic Claude, o Google Gemini
- **Framework:** Node.js/Express, Python/FastAPI, o NestJS
- **Base de datos:** Para cachear respuestas y mejorar rendimiento

### Consideraciones:
1. **Rate Limiting:** Implementar límites de solicitudes por usuario
2. **Caché:** Cachear respuestas similares para reducir costos de API
3. **Timeouts:** Las solicitudes de IA pueden tardar, configurar timeouts apropiados (30-60 segundos)
4. **Validación:** Validar que los datos generados cumplan con el currículo MINEDU
5. **Costos:** Monitorear uso de tokens para controlar costos de APIs de IA
6. **Fallbacks:** Tener respuestas por defecto si la IA falla

### Prioridad de Implementación:
🔴 **Alta Prioridad:**
- Endpoint 1: Generar Secuencia Didáctica Completa
- Endpoint 7: Generar Sesión Completa (Endpoint Maestro)

🟡 **Media Prioridad:**
- Endpoint 2: Generar Criterios de Evaluación
- Endpoint 3: Generar Propósito de la Sesión
- Endpoint 4: Generar Recursos y Materiales

🟢 **Baja Prioridad:**
- Endpoint 5: Sugerir Enfoques Transversales
- Endpoint 6: Generar Título
- Endpoint 8: Mejorar Texto

---

## 🎯 Integración en el Frontend

Los endpoints se integrarán principalmente en:
- **Step8.tsx:** Botón "Generar con IA" → Endpoint 1
- **Step4.tsx:** Generar criterios → Endpoint 2
- **Step6.tsx:** Generar propósito → Endpoint 3
- **Step7.tsx:** Generar recursos → Endpoint 4
- **Página nueva (opcional):** "Generar Sesión Completa" → Endpoint 7

### Ejemplo de llamada desde Frontend:
```typescript
// En Step8.tsx
async function generarConIA() {
  try {
    showLoading("Generando secuencia didáctica con IA...");
    
    const response = await fetch('/api/ia/generar-secuencia-didactica', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        datosGenerales: sesion.datosGenerales,
        propositoAprendizaje: sesion.propositoAprendizaje,
        propositoSesion: sesion.propositoSesion,
        criteriosEvaluacion: sesion.propositoAprendizaje.criteriosEvaluacion
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Actualizar el store con la secuencia generada
      updateSesion({
        secuenciaDidactica: data.data
      });
      
      // Actualizar estados locales
      setInicioProcesos(data.data.inicio.procesos);
      setDesarrolloProcesos(data.data.desarrollo.procesos);
      setCierreProcesos(data.data.cierre.procesos);
      
      handleToaster("Secuencia generada exitosamente", "success");
    }
  } catch (error) {
    handleToaster("Error al generar secuencia con IA", "error");
  } finally {
    hideLoading();
  }
}
```

---

**Fecha de creación:** 5 de diciembre de 2025
**Versión:** 1.0
