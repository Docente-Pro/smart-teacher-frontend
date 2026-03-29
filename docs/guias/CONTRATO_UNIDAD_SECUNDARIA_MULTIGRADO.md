# Contrato: Unidad de Secundaria Multi-grado

> **Concepto clave:** En Secundaria, la unidad es **por área**. Un área puede abarcar varios grados (ej. Matemática: 2.°, 3.° y 4.° año). El backend guarda TODO en `contenido` (JSON) de la `Unidad`, sin migración de schema.

---

## 1. Diferencias con Primaria

| Aspecto | Primaria | Secundaria |
|---|---|---|
| Grados | 1 grado (`gradoId` en DB) | Múltiples → `contenido.gradosSecundaria: number[]` |
| `gradoId` en DB | ID del grado | `null` |
| Propósitos | Planos (`propositos`) | Por grado (`propositosPorGrado`) |
| Competencias transversales | Por unidad | Por grado (`competenciasTransversalesPorGrado`) |
| Secuencia | Por semana única | Por semana × grado (`secuenciaSesionesPorGrado`) |
| Producto | Uno | Por grado (`productoUnidadAprendizajePorGrado`) |
| Formato PDF | 1 documento | 1 documento con tablas por grado |

---

## 2. IDs de Grados de Secundaria

| ID | Nombre |
|---|---|
| 7 | Primer Año |
| 8 | Segundo Año |
| 9 | Tercer Año |
| 10 | Cuarto Año |
| 11 | Quinto Año |

> Node resuelve los IDs a nombres al construir los payloads para Python. El frontend siempre trabaja con IDs.

---

## 3. Crear la Unidad — `POST /api/unidades`

### Body

```json
{
  "usuarioId": "usr_abc123",
  "nivelId": 2,
  "gradoId": null,
  "gradosSecundaria": [8, 9, 10],
  "problematicaId": 5,
  "titulo": "Modelamos situaciones de nuestra comunidad con álgebra y funciones",
  "duracion": 5,
  "fechaInicio": "2026-04-01",
  "tipo": "PERSONAL",
  "sesionesSemanales": 3,
  "maxMiembros": 1
}
```

### Cambios vs Primaria

| Campo | Primaria | Secundaria |
|---|---|---|
| `gradoId` | Requerido (Int) | `null` |
| `gradosSecundaria` | No existe | `number[]` — IDs de la tabla `Grado` |

### Respuesta

```json
{
  "success": true,
  "unidad": {
    "id": "f341b809-...",
    "gradoId": null,
    "contenido": {
      "gradosSecundaria": [8, 9, 10]
    }
  }
}
```

> `gradosSecundaria` (IDs) se persiste en `contenido` al crear la unidad. Todos los pasos del wizard lo leen desde ahí; el front no necesita reenviarlo.

---

## 4. Flujo completo de generación

```
POST /api/unidades                                 ← crea unidad; guarda gradosSecundaria=[8,9,10] en contenido
POST /api/ia-unidad/:id/situacion-significativa    ← paso 1 (igual que primaria)
POST /api/ia-unidad/:id/evidencias                 ← paso 2 (igual que primaria)
POST /api/ia-unidad/:id/propositos-multigrado      ← paso 3 (llama Python N veces en paralelo)
POST /api/ia-unidad/:id/enfoques                   ← paso 4 (igual que primaria)
POST /api/ia-unidad/:id/formato-secundaria         ← paso 5 (genera documento consolidado)
```

---

## 5. Paso 3 — `POST /api/ia-unidad/:unidadId/propositos-multigrado`

### Body

```json
{
  "gradoIds": [8, 9, 10],
  "competenciasDocenteSecundaria": [
    {
      "area": "Matemática",
      "nombre": "Resuelve problemas de regularidad, equivalencia y cambio",
      "campoTematico": "Patrones y expresiones algebraicas"
    },
    {
      "area": "Matemática",
      "nombre": "Resuelve problemas de gestión de datos e incertidumbre",
      "campoTematico": "Estadística descriptiva"
    }
  ],
  "maxCompetenciasPorAreaSecundaria": 2
}
```

> Node resuelve los IDs a nombres (`"Segundo Año"`, `"Tercer Año"`, `"Cuarto Año"`) para enviarlos a Python, y además actualiza `contenido.gradosSecundaria` con los IDs.

### Qué guarda en `contenido`

```json
{
  "gradosSecundaria": [8, 9, 10],
  "situacionSignificativa": "...",
  "evidencias": { "reto": "...", "proposito": "...", ... },
  "propositosPorGrado": [
    {
      "gradoId": 8,
      "grado": "Segundo Año",
      "propositos": {
        "areasPropositos": [
          {
            "area": "Matemática",
            "competencias": [
              {
                "nombre": "Resuelve problemas de regularidad...",
                "capacidades": ["..."],
                "estandar": "...",
                "actividades": ["..."],
                "criterios": ["..."],
                "actividadCriterios": [{ "actividad": "...", "criterios": ["..."] }]
              }
            ]
          }
        ]
      }
    },
    { "gradoId": 9, "grado": "Tercer Año",  "propositos": { ... } },
    { "gradoId": 10, "grado": "Cuarto Año", "propositos": { ... } }
  ],
  "propositos": { ... }
}
```

### Respuesta

```json
{
  "success": true,
  "paso": 3,
  "message": "Propósitos generados para 3 grado(s)",
  "grados": [
    { "gradoId": 8,  "grado": "Segundo Año", "totalAreas": 1, "totalCompetencias": 2 },
    { "gradoId": 9,  "grado": "Tercer Año",  "totalAreas": 1, "totalCompetencias": 2 },
    { "gradoId": 10, "grado": "Cuarto Año",  "totalAreas": 1, "totalCompetencias": 2 }
  ],
  "data": [ ... ],
  "unidad": { ... }
}
```

---

## 6. Paso 5 — `POST /api/ia-unidad/:unidadId/formato-secundaria`

Body vacío — Node construye el payload leyendo `contenido.propositosPorGrado`, `contenido.gradosSecundaria`, `contenido.evidencias`, `contenido.enfoques`, etc.

```json
{}
```

### Qué guarda en `contenido`

```json
{
  "formatoSecundaria": {
    "datosInformativos": {
      "grado": "Segundo Año, Tercer Año, Cuarto Año",
      "area": "Matemática",
      "duracion": 5
    },
    "componentes": {
      "planteamientoSituacionSignificativa": "...",
      "productoUnidadAprendizajePorGrado": [
        { "grado": "Segundo Año", "producto": "..." },
        { "grado": "Tercer Año",  "producto": "..." },
        { "grado": "Cuarto Año",  "producto": "..." }
      ],
      "enfoquesTransversales": [...],
      "instrumentoEvaluacion": "Lista de cotejo",
      "propositosAprendizajePorGrado": [...],
      "competenciasTransversalesPorGrado": [...],
      "secuenciaSesionesPorGrado": {
        "totalSemanas": 5,
        "grados": {
          "Segundo Año": { "1": ["..."], "2": ["..."] },
          "Tercer Año":  { "1": ["..."], "2": ["..."] },
          "Cuarto Año":  { "1": ["..."], "2": ["..."] }
        }
      },
      "recursosMaterialesDidacticos": ["..."],
      "bibliografia": ["..."]
    }
  }
}
```

### Respuesta

```json
{
  "success": true,
  "paso": 5,
  "message": "Formato secundaria generado para 3 grado(s)",
  "grados": ["Segundo Año", "Tercer Año", "Cuarto Año"],
  "formato": { "datosInformativos": { ... }, "componentes": { ... } },
  "unidad": { "id": "...", "contenido": { ... } }
}
```

---

## 7. Estructura final de `contenido` para una Unidad Secundaria

```json
{
  "gradosSecundaria": [8, 9, 10],
  "situacionSignificativa": "En la comunidad educativa...",
  "evidencias": {
    "reto": "...",
    "proposito": "...",
    "productoIntegrador": "...",
    "instrumentoEvaluacion": "Lista de cotejo"
  },
  "propositosPorGrado": [
    { "gradoId": 8,  "grado": "Segundo Año", "propositos": { ... } },
    { "gradoId": 9,  "grado": "Tercer Año",  "propositos": { ... } },
    { "gradoId": 10, "grado": "Cuarto Año",  "propositos": { ... } }
  ],
  "propositos": { ... },
  "enfoques": { ... },
  "formatoSecundaria": {
    "datosInformativos": { ... },
    "componentes": {
      "planteamientoSituacionSignificativa": "...",
      "productoUnidadAprendizajePorGrado": [...],
      "enfoquesTransversales": [...],
      "instrumentoEvaluacion": "Lista de cotejo",
      "propositosAprendizajePorGrado": [...],
      "competenciasTransversalesPorGrado": [...],
      "secuenciaSesionesPorGrado": { ... },
      "recursosMaterialesDidacticos": [...],
      "bibliografia": [...]
    }
  }
}
```

---

## 8. Payload que Node envía a Python — `POST /api/unidad/propositos` (por grado)

Node llama una vez por cada grado, resolviendo el ID a nombre:

```json
{
  "nivel": "Secundaria",
  "grado": "Segundo Año",
  "numeroUnidad": 1,
  "titulo": "...",
  "duracion": 5,
  "problematica": { "nombre": "...", "descripcion": "..." },
  "areas": [{ "nombre": "Matemática" }],
  "situacionSignificativa": "...",
  "evidencias": { ... },
  "maxCompetenciasPorAreaSecundaria": 2,
  "competenciasDocenteSecundaria": [...]
}
```

---

## 9. Payload que Node envía a Python — `POST /api/unidad/formato-secundaria`

```json
{
  "nivel": "Secundaria",
  "numeroUnidad": 1,
  "titulo": "...",
  "duracion": 5,
  "problematica": { "nombre": "...", "descripcion": "..." },
  "situacionSignificativa": "...",
  "evidencias": { ... },
  "areas": [{ "nombre": "Matemática" }],
  "genero": "femenino",
  "institucion": { "nombre": "I.E. ...", "departamento": "...", ... },
  "propositosPorGrado": [
    { "gradoId": 8, "grado": "Segundo Año", "propositos": { "areasPropositos": [...] } },
    { "gradoId": 9, "grado": "Tercer Año",  "propositos": { "areasPropositos": [...] } },
    { "gradoId": 10, "grado": "Cuarto Año", "propositos": { "areasPropositos": [...] } }
  ],
  "enfoques": { ... }
}
```

---

## 10. Notas para el Frontend

### Al entrar al wizard de una unidad existente

```typescript
const gradosSecundaria: number[] = unidad.contenido?.gradosSecundaria ?? [];
const esMultigrado = gradosSecundaria.length > 1;
```

### Al llamar propositos-multigrado

```typescript
// ✅ Correcto: IDs desde el contenido de la unidad
const body = {
  gradoIds: unidad.contenido.gradosSecundaria, // [8, 9, 10]
  competenciasDocenteSecundaria: [...],
};

// ❌ Incorrecto: usar el grado del FK de la unidad (siempre es uno solo)
const body = {
  gradoIds: [unidad.gradoId], // solo un grado
};
```

### En la pantalla de propósitos generados

```typescript
// Iterar propositosPorGrado para mostrar tabs o secciones por grado
unidad.contenido.propositosPorGrado.forEach(({ gradoId, grado, propositos }) => {
  // renderizar tab para cada grado
});
```

### Para generar el PDF

Llamar `POST /api/ia-unidad/:id/formato-secundaria` (body vacío). El backend guarda `formatoSecundaria` en `contenido`. El frontend usa ese campo para renderizar el documento.
