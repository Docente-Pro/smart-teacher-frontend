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
POST /api/ia-unidad/:id/secuencia                  ← paso 6 (detecta multigrado y hace fan-out por grado)
POST /api/ia-unidad/:id/materiales-multigrado      ← paso 7 (genera materiales por grado en paralelo)
POST /api/ia-unidad/:id/reflexiones                ← paso 8 (igual que primaria)
```

> **Importante:** El paso 6 (secuencia) debe ejecutarse ANTES del paso 5 (formato-secundaria) si se quiere que `secuenciaSesionesPorGrado` tenga datos en el formato. De lo contrario, `totalSemanas: 0`.
> El paso 7 usa `/materiales-multigrado` (NO `/materiales`) porque necesita `secuenciaPorGrado[]` en vez de `secuencia`.

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
  "maxCompetenciasPorAreaSecundaria": 2,
  "totalSesionesUnidad": 8,
  "actividadesPorCompetencia": 4
}
```

> Node resuelve los IDs a nombres (`"Segundo Año"`, `"Tercer Año"`, `"Cuarto Año"`) para enviarlos a Python, y además actualiza `contenido.gradosSecundaria` con los IDs.
>
> Nuevos parámetros dinámicos:
> - `totalSesionesUnidad` (opcional): objetivo total de actividades por grado.
> - `actividadesPorCompetencia` (opcional): fuerza una cantidad fija de actividades por competencia.
>
> Regla:
> - Si viene `actividadesPorCompetencia`, tiene prioridad.
> - Si no viene, y viene `totalSesionesUnidad`, Node distribuye ese total entre las competencias.
> - Node normaliza la respuesta para que `actividades` y `actividadCriterios` queden consistentes con el objetivo final.

### Qué guarda en `contenido`

```json
{
  "gradosSecundaria": [8, 9, 10],
  "totalSesionesUnidad": 8,
  "actividadesPorCompetencia": 4,
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
        ],
        "competenciasTransversales": [...],
        "productoIntegradorGrado": "Feria Científica..., presentado mediante un plan de acción argumentado con metas, responsables y estrategias de seguimiento"
      }
    },
    { "gradoId": 9, "grado": "Tercer Año",  "propositos": { "...", "productoIntegradorGrado": "Feria Científica..., presentado mediante un proyecto ciudadano..." } },
    { "gradoId": 10, "grado": "Cuarto Año", "propositos": { "...", "productoIntegradorGrado": "Feria Científica..., presentado mediante una propuesta integral..." } }
  ],
  "propositos": { ... }
}

> **`productoIntegradorGrado`** (string | null): Python lo genera automáticamente para Secundaria. Contiene el producto base + formato diferenciado según el grado. Si no existe, usar `contenido.evidencias.productoIntegrador` como fallback.
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

## 6b. Paso 6 — `POST /api/ia-unidad/:unidadId/secuencia`

Body estándar (igual que primaria). Node detecta `contenido.gradosSecundaria` y entra en modo multigrado automáticamente.

```json
{}
```

### Qué guarda en `contenido`

```json
{
  "secuencia": { "...del primer grado..." },
  "secuenciaPorGrado": [
    { "gradoId": 8,  "grado": "Segundo Año", "secuencia": { "semanas": [...] } },
    { "gradoId": 9,  "grado": "Tercer Año",  "secuencia": { "semanas": [...] } },
    { "gradoId": 10, "grado": "Cuarto Año",  "secuencia": { "semanas": [...] } }
  ]
}
```

> `secuencia` (singular) = primer grado (compatibilidad). `secuenciaPorGrado` = array completo.

---

## 6c. Paso 7 — `POST /api/ia-unidad/:unidadId/materiales-multigrado`

Body vacío — Node lee `contenido.secuenciaPorGrado` y llama a Python `/api/unidad/materiales` una vez por cada grado en paralelo.

```json
{}
```

> **No usar** `/materiales` (el endpoint estándar) para multigrado. Ese valida `contenido.secuencia` que puede no existir en este flujo.

### Qué guarda en `contenido`

```json
{
  "materiales": { "materiales": ["...del primer grado..."] },
  "materialesPorGrado": [
    { "gradoId": 8,  "grado": "Segundo Año", "materiales": { "materiales": ["..."] } },
    { "gradoId": 9,  "grado": "Tercer Año",  "materiales": { "materiales": ["..."] } },
    { "gradoId": 10, "grado": "Cuarto Año",  "materiales": { "materiales": ["..."] } }
  ]
}
```

### Respuesta

```json
{
  "success": true,
  "paso": 7,
  "message": "Materiales generados para 3 grado(s)",
  "grados": [
    { "gradoId": 8,  "grado": "Segundo Año", "totalMateriales": 5 },
    { "gradoId": 9,  "grado": "Tercer Año",  "totalMateriales": 5 },
    { "gradoId": 10, "grado": "Cuarto Año",  "totalMateriales": 5 }
  ],
  "data": [...],
  "unidad": { ... }
}
```

---

## 6d. Paso 8 — `POST /api/ia-unidad/:unidadId/reflexiones`

Igual que primaria. No requiere adaptación multigrado.

---

## 7. Estructura final de `contenido` para una Unidad Secundaria

```json
{
  "gradosSecundaria": [8, 9, 10],
  "totalSesionesUnidad": 8,
  "actividadesPorCompetencia": 4,
  "situacionSignificativa": "En la comunidad educativa...",
  "evidencias": {
    "reto": "...",
    "proposito": "...",
    "productoIntegrador": "...",
    "instrumentoEvaluacion": "Lista de cotejo"
  },
  "propositosPorGrado": [
    { "gradoId": 8,  "grado": "Segundo Año", "propositos": { "areasPropositos": [...], "productoIntegradorGrado": "..." } },
    { "gradoId": 9,  "grado": "Tercer Año",  "propositos": { "areasPropositos": [...], "productoIntegradorGrado": "..." } },
    { "gradoId": 10, "grado": "Cuarto Año",  "propositos": { "areasPropositos": [...], "productoIntegradorGrado": "..." } }
  ],
  "propositos": { ... },
  "enfoques": { ... },
  "secuencia": { ... },
  "secuenciaPorGrado": [
    { "gradoId": 8,  "grado": "Segundo Año", "secuencia": { "semanas": [...] } },
    { "gradoId": 9,  "grado": "Tercer Año",  "secuencia": { "semanas": [...] } },
    { "gradoId": 10, "grado": "Cuarto Año",  "secuencia": { "semanas": [...] } }
  ],
  "materiales": { "materiales": ["..."] },
  "materialesPorGrado": [
    { "gradoId": 8,  "grado": "Segundo Año", "materiales": { "materiales": ["..."] } },
    { "gradoId": 9,  "grado": "Tercer Año",  "materiales": { "materiales": ["..."] } },
    { "gradoId": 10, "grado": "Cuarto Año",  "materiales": { "materiales": ["..."] } }
  ],
  "reflexiones": { "reflexiones": [{ "pregunta": "..." }] },
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
  "totalSesionesUnidad": 8,
  "actividadesPorCompetencia": 4,
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

### Producto diferenciado por grado (tabla 2.2)

```typescript
// ❌ ANTES: mismo producto para todos los grados
const producto = contenido.evidencias.productoIntegrador;

// ✅ AHORA: producto específico por grado con fallback
for (const pg of contenido.propositosPorGrado) {
  const producto =
    pg.propositos?.productoIntegradorGrado    // diferenciado por grado
    || contenido.evidencias.productoIntegrador; // fallback global
  renderFilaTabla(pg.grado, producto);
}
```

### Materiales multigrado

```typescript
// Para secundaria multigrado usar:
await api.post(`/api/ia-unidad/${unidadId}/materiales-multigrado`);

// NO usar /materiales (falla porque no encuentra contenido.secuencia)
// Resultado: contenido.materialesPorGrado[] — iterar por grado
for (const mg of contenido.materialesPorGrado) {
  renderMateriales(mg.grado, mg.materiales.materiales);
}
```

### Para generar el PDF

Llamar `POST /api/ia-unidad/:id/formato-secundaria` (body vacío). El backend guarda `formatoSecundaria` en `contenido`. El frontend usa ese campo para renderizar el documento.

---

## 11. Secundaria: unidad solo Tutoría (o un área en un solo grado)

Un docente puede tener **Matemática en varios grados** (multigrado) **y** **Tutoría en un solo grado**. La unidad de **Tutoría** es siempre **un grado + un área** (no usa `gradosSecundaria` ni `propositos-multigrado`).

### Crear unidad — `POST /api/unidades`

```json
{
  "usuarioId": "...",
  "nivelId": 2,
  "gradoId": 8,
  "modoSecundaria": "tutoria",
  "problematicaId": 5,
  "titulo": "...",
  "duracion": 4,
  "sesionesSemanales": 2,
  "tipo": "PERSONAL"
}
```

| Campo | Valor |
|-------|--------|
| `gradoId` | **Obligatorio** — un solo año (ej. `8` = Segundo Año) |
| `gradosSecundaria` | **No enviar** (vacío o ausente) |
| `modoSecundaria` | `"tutoria"` o `"mono_grado"` — se guarda en `contenido.modoSecundaria` para que front/Python sepan el modo |

Para una **área curricular en un solo grado** (sin multigrado), mismo patrón con `modoSecundaria: "mono_grado"` o sin el campo si solo envías `gradoId` y no `gradosSecundaria`.

### Errores si mezclas modos

- `modoSecundaria` = `tutoria` o `mono_grado` **y** además `gradosSecundaria` con ítems → **400** (mensaje explicando que uses solo `gradoId`).
- `modoSecundaria` = `tutoria` o `mono_grado` **sin** `gradoId` → **400**.

### Después de crear

1. `PUT /api/unidades/:unidadId/areas` con **solo** el `areaId` de Tutoría (u otra área única).
2. Wizard **estándar** de IA: `situacion-significativa`, `evidencias`, **`POST .../propositos`** (no `propositos-multigrado`).
3. Secuencia: flujo normal o `sinHorarioSecundaria` + `totalSesionesUnidad` / `sesionesPorSemana` como en secundaria de un grado (`sesionesSemanales × duracion` o body explícito).

### Detección en front

```typescript
const modo = unidad.contenido?.modoSecundaria;
const esTutoriaOMono = modo === "tutoria" || modo === "mono_grado";
const esMultigrado = (unidad.contenido?.gradosSecundaria?.length ?? 0) > 0;
// Tutoría: esTutoriaOMono && !esMultigrado
```

**Catálogo `Area`:** Tutoría y Plan Lector deben existir como filas en `Area` (mismo uso que Matemática: `areaId` en `UsuarioGradoArea` y en la unidad). Se insertan con la migración Prisma `20260329120000_add_area_tutoria_plan_lector` (`nombre` = `Tutoría` y `Plan Lector`). Si la BD es anterior, ejecutá `npx prisma migrate deploy` (o aplicá el SQL a mano con los mismos `INSERT … WHERE NOT EXISTS`).

---

## Paso 0 (wizard unidad secundaria): áreas y grados del docente

Las combinaciones **grado + área** (Matemática en 1.º, Tutoría en 2.º, etc.) **no** se guardan en el `PATCH /api/usuario/:id` genérico. Se persisten en **`UsuarioGradoArea`** al:

- **`POST /api/usuario/:id/configurar-grados`** (onboarding), o  
- **`POST /api/usuario/:id/grados-areas`** con `{ asignaciones: [{ gradoId, areaId }, ...] }` (reemplaza todas las filas).

Para el **paso 0** de crear unidad (mostrar qué puede enseñar el docente, con **IDs** para los siguientes pasos):

| Método | Ruta | Notas |
|--------|------|--------|
| `GET` | **`/api/usuario/me/grados-areas`** | Token Auth0; no hace falta el UUID interno. Respuesta: `usuarioId`, `data` (filas Prisma con `grado`, `area`, `nivel`) y **`resumenParaUnidad`**: `{ asignacionId, gradoId, gradoNombre, nivelNombre, areaId, areaNombre }[]`. |
| `GET` | `/api/usuario/:id/grados-areas` | Misma forma; `data` + `resumenParaUnidad`. |
| `GET` | `/api/usuario/:id` | El usuario incluye **`gradosAreas`** con `areaId` y `gradoId` en cada elemento. |

Cada fila de tutoría o materia es una asignación distinta: mismo docente puede tener varias filas (p. ej. Matemática en varios grados y Tutoría en uno).

> Implementación frontend recomendada: ver `docs/api/FRONTEND_ONBOARDING_AREAS_SECUNDARIA.md`.
