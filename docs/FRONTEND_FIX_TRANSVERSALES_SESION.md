# Fix Frontend — Persistir `competenciasTransversalesSesion`

## Problema

El rag-service (Python) genera `competenciasTransversalesSesion` con criterios de evaluación para las 2 competencias transversales y lo incluye en la respuesta. El Node.js lo reenvía correctamente al frontend. Sin embargo, las competencias transversales aparecen **sin criterios de evaluación** en la sesión guardada.

**Causa raíz:** el frontend recibe el campo pero no lo persiste de vuelta en la BD.

---

## Cómo funciona cada flujo

### Flujo Unidad (premium) — NO hay problema

```
Python → result (incluye competenciasTransversalesSesion)
Node   → prisma.sesion.create({ contenido: result })   ← guarda TODO
Node   → res.json({ sesion: { ...nuevaSesion, ... } })  ← frontend recibe todo
```

`contenido: result` guarda el objeto completo de Python. El campo `competenciasTransversalesSesion` **sí está en BD** dentro de `contenido`.

**Acción frontend:** leer `sesion.contenido.competenciasTransversalesSesion` para mostrar los criterios.

---

### Flujo Free / Individual — AQUÍ está el problema

```
Python → result (incluye competenciasTransversalesSesion)
Node   → res.json(result)                               ← forward directo, frontend lo recibe
...
Frontend → POST /api/sesion/confirmar-upload             ← envía contenido sin competenciasTransversalesSesion
Node     → prisma.sesion.update({ contenido: body.contenido })  ← se pierde el campo
```

Node no guarda nada al generar; solo hace forward. La persistencia depende de lo que el frontend envíe luego a `confirmar-upload` o `PATCH /api/sesion/:id/contenido`.

---

## Qué devuelve Python (estructura del campo)

```json
{
  "titulo": "...",
  "propositoSesion": "...",
  "propositoAprendizaje": [ ... ],
  "competenciasTransversalesSesion": [
    {
      "nombre": "Se desenvuelve en entornos virtuales generados por las TIC",
      "capacidades": [
        "Personaliza entornos virtuales",
        "Gestiona información del entorno virtual",
        "Interactúa en entornos virtuales",
        "Crea objetos virtuales en diversos formatos"
      ],
      "criteriosEvaluacion": [
        "Gestiona información en entornos virtuales para sustentar su aprendizaje.",
        "Elabora y comparte evidencia digital vinculada a la actividad propuesta.",
        "Usa herramientas digitales para organizar y comunicar avances de forma pertinente."
      ]
    },
    {
      "nombre": "Gestiona su aprendizaje de manera autónoma",
      "capacidades": [
        "Define metas de aprendizaje",
        "Organiza acciones estratégicas para alcanzar sus metas de aprendizaje",
        "Monitorea y ajusta su desempeño durante el proceso de aprendizaje"
      ],
      "criteriosEvaluacion": [
        "Define metas de aprendizaje concretas para el desarrollo de la actividad.",
        "Organiza su tiempo y recursos para cumplir las actividades propuestas.",
        "Monitorea su progreso y ajusta estrategias durante la sesión."
      ]
    }
  ],
  "enfoquesTransversales": [ ... ],
  "inicio": { ... },
  "desarrollo": { ... },
  "cierre": { ... }
}
```

`competenciasTransversalesSesion` está al **mismo nivel raíz** que `titulo`, `inicio`, `desarrollo`, etc.

---

## Qué debe hacer el frontend

### 1. Al recibir la respuesta de generación (free/individual)

Cuando el frontend llama a `POST /api/ia/generar-sesion` o `POST /api/ia/generar-secuencia-didactica`, la respuesta ya incluye `competenciasTransversalesSesion`. **Guardarlo en el estado local** junto con el resto del resultado.

```typescript
const result = await api.post('/api/ia/generar-sesion', payload);

// result ya contiene competenciasTransversalesSesion
// Asegurarse de mantenerlo en el estado/store
setSesionData(result); // NO filtrar ni omitir campos
```

### 2. Al persistir la sesión (confirmar-upload o patchContenido)

Incluir `competenciasTransversalesSesion` dentro del objeto `contenido` que se envía al backend.

**Opción A — `POST /api/sesion/confirmar-upload`:**

```typescript
await api.post('/api/sesion/confirmar-upload', {
  sesionId,
  usuarioId,
  key,
  contenido: {
    titulo: sesionData.titulo,
    propositoSesion: sesionData.propositoSesion,
    propositoAprendizaje: sesionData.propositoAprendizaje,
    competenciasTransversalesSesion: sesionData.competenciasTransversalesSesion, // ← INCLUIR
    enfoquesTransversales: sesionData.enfoquesTransversales,
    inicio: sesionData.inicio,
    desarrollo: sesionData.desarrollo,
    cierre: sesionData.cierre,
    // ... resto de campos
  },
});
```

**Opción B — Lo más simple: enviar el objeto completo de Python como `contenido`:**

```typescript
await api.post('/api/sesion/confirmar-upload', {
  sesionId,
  usuarioId,
  key,
  contenido: sesionData, // enviar TODO el resultado de Python
});
```

**Opción C — `PATCH /api/sesion/:id/contenido` (merge parcial):**

```typescript
await api.patch(`/api/sesion/${sesionId}/contenido`, {
  contenido: {
    competenciasTransversalesSesion: sesionData.competenciasTransversalesSesion,
  },
});
```

Este endpoint hace merge superficial (`{ ...contenidoActual, ...contenido }`), así que solo sobreescribe las claves enviadas sin borrar las existentes.

### 3. Al mostrar los criterios de evaluación transversales

Leer desde `contenido.competenciasTransversalesSesion`, no desde `propositoAprendizaje.competenciasTransversales`:

```typescript
// ✅ Correcto
const transversales = sesion.contenido?.competenciasTransversalesSesion ?? [];

transversales.forEach(comp => {
  console.log(comp.nombre);          // "Se desenvuelve en entornos virtuales..."
  console.log(comp.capacidades);     // ["Personaliza entornos virtuales", ...]
  console.log(comp.criteriosEvaluacion); // ["Gestiona información en entornos...", ...]
});

// ❌ Incorrecto — este campo es de las competencias del ÁREA, no las transversales
const transversales = sesion.propositoAprendizaje?.competenciasTransversales;
```

---

## Diferencia entre campos similares

| Campo | Qué contiene | Dónde está |
|-------|-------------|------------|
| `propositoAprendizaje` | Competencias del **área curricular** (Comunicación, Matemática, etc.) con sus capacidades, estándar y criterios | Raíz de la respuesta / aplanado en `sesion` |
| `propositoAprendizaje[].competenciasTransversales` | **No existe** o está vacío — no es donde van las transversales | — |
| `competenciasTransversalesSesion` | Las 2 competencias **transversales** (TIC + Autonomía) con capacidades y criteriosEvaluacion | Raíz de `contenido` |

---

## Resumen de cambios requeridos

| Acción | Dónde | Detalle |
|--------|-------|---------|
| Guardar `competenciasTransversalesSesion` en el estado al recibir respuesta de generación | Store/estado del frontend | No filtrar campos de la respuesta de Python |
| Incluir `competenciasTransversalesSesion` en `contenido` al llamar `confirmar-upload` | Llamada a `POST /api/sesion/confirmar-upload` | Enviar el objeto completo o incluir el campo explícitamente |
| Leer criterios transversales desde `contenido.competenciasTransversalesSesion` | Componente que renderiza la sesión | No buscar en `propositoAprendizaje` |

---

## Endpoints de referencia

| Endpoint | Método | Qué hace |
|----------|--------|----------|
| `/api/ia/generar-sesion` | POST | Genera sesión free — devuelve resultado completo de Python (incluye `competenciasTransversalesSesion`) |
| `/api/ia/generar-secuencia-didactica` | POST | Genera sesión individual — mismo comportamiento |
| `/api/sesion/confirmar-upload` | POST | Persiste `contenido` + URL del PDF en BD |
| `/api/sesion/:id/contenido` | PATCH | Merge parcial de `contenido` en BD |
| `/api/unidades/:unidadId/sesion/generar` | POST | Genera sesión de unidad — Node guarda `contenido: result` automáticamente |
