# Contratos API — Módulo Unidad de Aprendizaje

Referencia completa de los 8 endpoints para generar una **Unidad de Aprendizaje** según formato MINEDU.

**Base URL**: `/api/unidad`  
**Flujo**: Secuencial — Node.js llama `1 → 2 → 3 → 4 → 5 → 6 → 7 → 8`, acumulando respuestas.

---

## Flujo General (Node.js)

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ 1.Situa- │────▶│ 2.Eviden- │────▶│ 3.Propó- │────▶│ 4.Áreas  │
│ ción     │     │ cias     │     │ sitos    │     │ Compl.   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                                                        │
┌──────────┐     ┌──────────┐     ┌──────────┐         │
│ 8.Refle- │◀────│ 7.Mate-  │◀────│ 6.Secuen-│◀────────┘
│ xiones   │     │ riales   │     │ cia      │◀─── 5.Enfoques
└──────────┘     └──────────┘     └──────────┘
```

| Paso | Endpoint                         | Acumula de pasos anteriores               |
|------|----------------------------------|--------------------------------------------|
| 1    | `POST /situacion-significativa`  | —                                          |
| 2    | `POST /evidencias`               | situación (1)                              |
| 3    | `POST /propositos`               | situación (1), evidencias (2)              |
| 4    | `POST /areas-complementarias`    | situación (1), propósitos (3)              |
| 5    | `POST /enfoques`                 | situación (1)                              |
| 6    | `POST /secuencia`                | situación (1), evidencias (2), propósitos (3), enfoques (5) |
| 7    | `POST /materiales`               | situación (1), secuencia (6)               |
| 8    | `POST /reflexiones`              | —                                          |

---

## Contexto Base (compartido en TODOS los endpoints)

```json
{
  "nivel": "Primaria",
  "grado": "6to grado",
  "numeroUnidad": 7,
  "titulo": "¿Cómo los problemas sociales afectan nuestros derechos?",
  "duracion": 4,
  "fechaInicio": "2025-09-01",
  "fechaFin": "2025-09-26",
  "problematica": {
    "nombre": "Problemas sociales",
    "descripcion": "Desconocimiento de los derechos y cómo los problemas sociales afectan..."
  },
  "areas": [
    { "nombre": "Personal Social" },
    { "nombre": "Comunicación" },
    { "nombre": "Matemática" }
  ]
}
```

---

## Endpoint 1: Situación Significativa

### `POST /api/unidad/situacion-significativa`

**Request Body** — solo contexto base:

```json
{
  "nivel": "Primaria",
  "grado": "6to grado",
  "numeroUnidad": 7,
  "titulo": "¿Cómo los problemas sociales afectan nuestros derechos?",
  "duracion": 4,
  "fechaInicio": "2025-09-01",
  "fechaFin": "2025-09-26",
  "problematica": {
    "nombre": "Problemas sociales",
    "descripcion": "Desconocimiento de los derechos y cómo los problemas sociales afectan..."
  },
  "areas": [
    { "nombre": "Personal Social" },
    { "nombre": "Comunicación" }
  ]
}
```

**Response:**

```json
{
  "situacionSignificativa": "En la comunidad de los estudiantes del 6to grado se observa que muchos niños desconocen sus derechos fundamentales...",
  "situacionBase": {
    "id": "ps_6_03",
    "contexto": "Comunidad urbana Lima",
    "descripcion": "Situación sobre derechos del niño en contexto urbano",
    "region": "Lima",
    "score": 85
  }
}
```

**Frontend renderiza**: Bloque de texto de 2-3 párrafos.

---

## Endpoint 2: Evidencias de Aprendizaje

### `POST /api/unidad/evidencias`

**Request Body** — contexto base + situación (paso 1):

```json
{
  "nivel": "Primaria",
  "grado": "6to grado",
  "numeroUnidad": 7,
  "duracion": 4,
  "problematica": { "nombre": "...", "descripcion": "..." },
  "areas": [{ "nombre": "Personal Social" }, { "nombre": "Comunicación" }],
  "situacionSignificativa": "En la comunidad de los estudiantes..."
}
```

**Response:**

```json
{
  "proposito": "Que los estudiantes identifiquen y analicen cómo los problemas sociales afectan el ejercicio de sus derechos, proponiendo acciones para promover una convivencia justa y democrática.",
  "productoIntegrador": "Mural de nuestros derechos",
  "instrumentoEvaluacion": "Lista de cotejo"
}
```

**Frontend renderiza**: Tabla de 3 columnas:

| PROPÓSITO | PRODUCTO INTEGRADOR | INSTRUMENTO DE EVALUACIÓN |
|-----------|---------------------|---------------------------|
| Que los estudiantes... | Mural de nuestros derechos | Lista de cotejo |

---

## Endpoint 3: Propósitos de Aprendizaje

### `POST /api/unidad/propositos`

**Request Body** — contexto base + situación + evidencias:

```json
{
  "nivel": "Primaria",
  "grado": "6to grado",
  "numeroUnidad": 7,
  "duracion": 4,
  "problematica": { "nombre": "...", "descripcion": "..." },
  "areas": [{ "nombre": "Personal Social" }, { "nombre": "Comunicación" }],
  "situacionSignificativa": "En la comunidad de los estudiantes...",
  "evidencias": {
    "proposito": "Que los estudiantes...",
    "productoIntegrador": "Mural de nuestros derechos",
    "instrumentoEvaluacion": "Lista de cotejo"
  }
}
```

**Response:**

```json
{
  "areasPropositos": [
    {
      "area": "Personal Social",
      "competencias": [
        {
          "nombre": "Convive y participa democráticamente en la búsqueda del bien común",
          "capacidades": [
            "Interactúa con todas las personas",
            "Construye normas y asume acuerdos y leyes",
            "Maneja conflictos de manera constructiva"
          ],
          "estandar": "Convive y participa democráticamente cuando se relaciona...",
          "criterios": [
            "Propone acciones para defender los derechos de los niños",
            "Explica cómo los problemas sociales vulneran derechos"
          ],
          "actividades": [
            "Debate sobre situaciones que vulneran derechos",
            "Elaboración de afiches informativos"
          ],
          "instrumento": "Lista de cotejo"
        }
      ]
    }
  ],
  "competenciasTransversales": [
    {
      "nombre": "Se desenvuelve en entornos virtuales generados por las TIC",
      "capacidades": [
        "Personaliza entornos virtuales",
        "Gestiona información del entorno virtual"
      ],
      "criterios": [
        "Utiliza herramientas digitales para investigar sobre derechos"
      ]
    },
    {
      "nombre": "Gestiona su aprendizaje de manera autónoma",
      "capacidades": [
        "Define metas de aprendizaje",
        "Organiza acciones estratégicas para alcanzar sus metas"
      ],
      "criterios": [
        "Establece su plan de trabajo para elaborar el mural"
      ]
    }
  ]
}
```

**Frontend renderiza**: Tabla de 6 columnas por cada área:

| COMPETENCIA | CAPACIDADES | ESTÁNDAR | CRITERIOS | ACTIVIDADES | INSTRUMENTO |
|-------------|-------------|----------|-----------|-------------|-------------|
| Convive y participa... | • Interactúa con...<br>• Construye normas... | Convive y participa... | • Propone acciones...<br>• Explica cómo... | • Debate sobre...<br>• Elaboración de... | Lista de cotejo |

Y tabla de 3 columnas para transversales:

| COMPETENCIA TRANSVERSAL | CAPACIDADES | CRITERIOS |
|-------------------------|-------------|-----------|
| Se desenvuelve en entornos virtuales... | • Personaliza...<br>• Gestiona... | • Utiliza herramientas... |

---

## Endpoint 4: Áreas Complementarias

### `POST /api/unidad/areas-complementarias`

**Request Body** — contexto base + situación + propósitos:

```json
{
  "nivel": "Primaria",
  "grado": "6to grado",
  "numeroUnidad": 7,
  "duracion": 4,
  "problematica": { "nombre": "...", "descripcion": "..." },
  "areas": [{ "nombre": "Personal Social" }, { "nombre": "Comunicación" }],
  "situacionSignificativa": "En la comunidad de los estudiantes...",
  "propositos": {
    "areasPropositos": [ ... ],
    "competenciasTransversales": [ ... ]
  }
}
```

**Response:**

```json
{
  "areasComplementarias": [
    {
      "area": "Tutoría",
      "competenciaRelacionada": "Convive y participa democráticamente",
      "dimension": "Personal, Social",
      "actividades": [
        "Reflexión sobre casos de vulneración de derechos",
        "Dinámica grupal sobre convivencia democrática"
      ]
    },
    {
      "area": "Plan Lector",
      "competenciaRelacionada": "Lee diversos tipos de textos escritos",
      "dimension": "Social",
      "actividades": [
        "Lectura de textos sobre los derechos del niño",
        "Discusión guiada sobre lecturas seleccionadas"
      ]
    }
  ]
}
```

**Frontend renderiza**: Tabla de 4 columnas:

| ÁREA COMPLEMENTARIA | COMPETENCIA RELACIONADA | DIMENSIÓN | ACTIVIDADES |
|---------------------|-------------------------|-----------|-------------|
| Tutoría | Convive y participa... | Personal, Social | • Reflexión sobre...<br>• Dinámica grupal... |
| Plan Lector | Lee diversos tipos... | Social | • Lectura de textos...<br>• Discusión guiada... |

---

## Endpoint 5: Enfoques Transversales

### `POST /api/unidad/enfoques`

**Request Body** — contexto base + situación:

```json
{
  "nivel": "Primaria",
  "grado": "6to grado",
  "numeroUnidad": 7,
  "duracion": 4,
  "problematica": { "nombre": "...", "descripcion": "..." },
  "areas": [{ "nombre": "Personal Social" }, { "nombre": "Comunicación" }],
  "situacionSignificativa": "En la comunidad de los estudiantes..."
}
```

**Response:**

```json
{
  "enfoques": [
    {
      "enfoque": "Enfoque de Derechos",
      "valor": "Conciencia de derechos",
      "actitudes": "Los estudiantes reconocen que tienen derechos y deberes, y se organizan para defenderlos en su entorno."
    },
    {
      "enfoque": "Enfoque de Igualdad de Género",
      "valor": "Igualdad y dignidad",
      "actitudes": "Los estudiantes identifican situaciones de desigualdad y proponen acciones para una convivencia equitativa."
    }
  ]
}
```

**Frontend renderiza**: Tabla de 3 columnas:

| ENFOQUE TRANSVERSAL | VALOR | ACTITUDES / ACCIONES OBSERVABLES |
|---------------------|-------|----------------------------------|
| Enfoque de Derechos | Conciencia de derechos | Los estudiantes reconocen... |

---

## Endpoint 6: Secuencia de Actividades (Planificador Semanal)

### `POST /api/unidad/secuencia`

**Request Body** — contexto base + situación + evidencias + propósitos + enfoques + turno:

```json
{
  "nivel": "Primaria",
  "grado": "6to grado",
  "numeroUnidad": 7,
  "duracion": 4,
  "fechaInicio": "2025-09-01",
  "fechaFin": "2025-09-26",
  "problematica": { "nombre": "...", "descripcion": "..." },
  "areas": [{ "nombre": "Personal Social" }, { "nombre": "Comunicación" }, { "nombre": "Matemática" }],
  "situacionSignificativa": "En la comunidad de los estudiantes...",
  "evidencias": {
    "proposito": "...",
    "productoIntegrador": "Mural de nuestros derechos",
    "instrumentoEvaluacion": "Lista de cotejo"
  },
  "propositos": {
    "areasPropositos": [ ... ],
    "competenciasTransversales": [ ... ]
  },
  "enfoques": [
    { "enfoque": "Enfoque de Derechos", "valor": "...", "actitudes": "..." }
  ],
  "turno": "mañana"
}
```

**Response:**

```json
{
  "hiloConductor": "A lo largo de las 4 semanas, los estudiantes investigarán cómo los problemas sociales afectan sus derechos...",
  "semanas": [
    {
      "semana": 1,
      "dias": [
        {
          "dia": "Lunes",
          "fecha": "2025-09-01",
          "horas": [
            { "hora": 1, "inicio": "8:00",  "fin": "8:45",  "area": "Personal Social", "actividad": "Identificamos los problemas sociales de nuestra comunidad" },
            { "hora": 2, "inicio": "8:45",  "fin": "9:30",  "area": "Personal Social", "actividad": "Identificamos los problemas sociales de nuestra comunidad" },
            { "hora": 3, "inicio": "9:30",  "fin": "10:15", "area": "Comunicación",     "actividad": "Leemos textos sobre los derechos del niño" },
            { "hora": 4, "inicio": "10:45", "fin": "11:30", "area": "Comunicación",     "actividad": "Leemos textos sobre los derechos del niño" },
            { "hora": 5, "inicio": "11:30", "fin": "12:15", "area": "Matemática",       "actividad": "Organizamos datos de una encuesta sobre derechos" },
            { "hora": 6, "inicio": "12:15", "fin": "13:00", "area": "Matemática",       "actividad": "Organizamos datos de una encuesta sobre derechos" }
          ]
        },
        {
          "dia": "Martes",
          "fecha": "2025-09-02",
          "horas": [
            { "hora": 1, "inicio": "8:00",  "fin": "8:45",  "area": "Matemática",       "actividad": "Interpretamos gráficos sobre datos sociales" },
            { "hora": 2, "inicio": "8:45",  "fin": "9:30",  "area": "Matemática",       "actividad": "Interpretamos gráficos sobre datos sociales" },
            { "hora": 3, "inicio": "9:30",  "fin": "10:15", "area": "Personal Social",  "actividad": "Analizamos causas y consecuencias de problemas sociales" },
            { "hora": 4, "inicio": "10:45", "fin": "11:30", "area": "Personal Social",  "actividad": "Analizamos causas y consecuencias de problemas sociales" },
            { "hora": 5, "inicio": "11:30", "fin": "12:15", "area": "Tutoría",          "actividad": "Reflexionamos sobre nuestros derechos y deberes" },
            { "hora": 6, "inicio": "12:15", "fin": "13:00", "area": "Arte y Cultura",   "actividad": "Diseñamos afiches sobre derechos del niño" }
          ]
        }
      ]
    }
  ]
}
```

**Frontend renderiza**: Grilla semanal (una tabla por semana, 6 horas × 5 días):

### Semana 1

|                   | LUNES 01/09 | MARTES 02/09 | MIÉRCOLES 03/09 | JUEVES 04/09 | VIERNES 05/09 |
|-------------------|-------------|--------------|-----------------|--------------|----------------|
| **H1** 8:00–8:45  | PS: Identificamos... | MAT: Interpretamos... | COM: Escribimos... | PS: Debatimos... | MAT: Resolvemos... |
| **H2** 8:45–9:30  | PS: Identificamos... | MAT: Interpretamos... | COM: Escribimos... | PS: Debatimos... | MAT: Resolvemos... |
| **H3** 9:30–10:15 | COM: Leemos textos... | PS: Analizamos... | MAT: Calculamos... | COM: Revisamos... | ART: Diseñamos... |
| ☕ **RECREO** 10:15–10:45 | | | | | |
| **H4** 10:45–11:30 | COM: Leemos textos... | PS: Analizamos... | MAT: Calculamos... | COM: Revisamos... | ART: Diseñamos... |
| **H5** 11:30–12:15 | MAT: Organizamos... | TUT: Reflexionamos... | CyT: Experimentamos... | EF: Practicamos... | PL: Leemos y analizamos... |
| **H6** 12:15–13:00 | MAT: Organizamos... | ART: Diseñamos... | CyT: Experimentamos... | EF: Practicamos... | ING: Aprendemos... |

---

## Endpoint 7: Materiales y Recursos

### `POST /api/unidad/materiales`

**Request Body** — contexto base + situación + secuencia:

```json
{
  "nivel": "Primaria",
  "grado": "6to grado",
  "numeroUnidad": 7,
  "duracion": 4,
  "problematica": { "nombre": "...", "descripcion": "..." },
  "areas": [{ "nombre": "Personal Social" }, { "nombre": "Comunicación" }],
  "situacionSignificativa": "En la comunidad de los estudiantes...",
  "secuencia": {
    "hiloConductor": "...",
    "semanas": [ ... ]
  }
}
```

**Response:**

```json
{
  "materiales": [
    "Constitución Política del Perú (versión escolar)",
    "Láminas sobre derechos del niño",
    "Cuadernos de trabajo MINEDU - Personal Social 6to grado",
    "Papelógrafos y plumones de colores",
    "Tijeras, goma y revistas para el mural",
    "Computadoras o tablets con acceso a internet",
    "Textos seleccionados sobre problemas sociales"
  ]
}
```

**Frontend renderiza**: Lista simple con viñetas.

---

## Endpoint 8: Reflexiones sobre el Aprendizaje

### `POST /api/unidad/reflexiones`

**Request Body** — solo contexto base:

```json
{
  "nivel": "Primaria",
  "grado": "6to grado",
  "numeroUnidad": 7,
  "duracion": 4,
  "problematica": { "nombre": "...", "descripcion": "..." },
  "areas": [{ "nombre": "Personal Social" }, { "nombre": "Comunicación" }]
}
```

**Response:**

```json
{
  "reflexiones": [
    { "pregunta": "¿Qué avances y dificultades tuvieron los estudiantes en relación con los propósitos de aprendizaje?" },
    { "pregunta": "¿Qué aprendizajes debo reforzar en la siguiente unidad?" },
    { "pregunta": "¿Qué actividades y estrategias funcionaron mejor y cuáles debo mejorar?" },
    { "pregunta": "¿Cómo se sintieron los estudiantes al trabajar sobre los problemas sociales de su comunidad?" }
  ]
}
```

**Frontend renderiza**: Lista numerada de preguntas.

---

## Resumen de Responsabilidades

### Node.js (Backend intermedio)

| Responsabilidad | Detalle |
|-----------------|---------|
| Orquestar el flujo | Llamar los 8 endpoints en orden secuencial |
| Acumular respuestas | Guardar cada response y pasarlo como input al siguiente |
| Persistir | Guardar la unidad completa en base de datos |
| Autenticación | Validar el token del docente antes de llamar al RAG |
| Cachear | Guardar respuestas parciales por si el usuario retoma |

### Frontend (React)

| Responsabilidad | Detalle |
|-----------------|---------|
| Wizard paso a paso | Mostrar un stepper con los 8 pasos |
| Renderizar tablas | Cada endpoint tiene su formato de tabla MINEDU |
| Edición inline | Permitir al docente editar textos antes de guardar |
| Loading states | Mostrar spinners mientras Node llama al RAG |
| Exportar PDF | Armar el documento final con todas las secciones |

### RAG Service (Python — este servicio)

| Responsabilidad | Detalle |
|-----------------|---------|
| Generar contenido | Usar GPT-4.1 + contexto RAG de documentos MINEDU |
| Validar schemas | Pydantic valida automáticamente request/response |
| Recuperar contexto | Buscar en el vectorstore documentos relevantes |
| Devolver JSON | Cada endpoint devuelve JSON tipado según los schemas |
