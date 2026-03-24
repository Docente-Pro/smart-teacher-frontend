# Contrato: secuencia de unidad y horario (Front ↔ Node ↔ Python)

Documento normativo para evitar discrepancias entre cliente, **smart-teacher-backend** (Node) y el servicio Python (RAG / unidad). Si algo no está aquí descrito, el comportamiento debe alinearse a este contrato o actualizarse este archivo.

---

## 1. Rutas y autenticación

| Uso | Método | Ruta (Node) |
|-----|--------|-------------|
| Generar paso 6 (secuencia) | `POST` | `/api/ia-unidad/:unidadId/secuencia` |
| Regenerar solo el paso 6 | `POST` | `/api/ia-unidad/:unidadId/regenerar/secuencia` |

- **Autenticación:** header de token según el middleware del proyecto (`verifyToken` en rutas `ia-unidad`).
- **`Content-Type`:** `application/json` en el body (salvo endpoints explícitamente multipart).
- **Regenerar:** internamente invoca el **mismo handler** que `POST .../secuencia`. El contrato del body es **idéntico**; no existe un payload distinto para “regenerar”.

> **Nota:** En documentación antigua puede aparecer `POST /api/unidad/secuencia`. Esa ruta **no existe en Node**; el servicio Python suele exponer `.../api/unidad/secuencia` como destino al que **Node reenvía** el JSON ya armado.

---

## 2. Responsabilidades por capa

| Capa | Qué hace |
|------|----------|
| **Front** | Envía JSON con los datos del paso (y horario cuando aplique). Para regenerar secuencia con un horario editado en pantalla, debe **incluir el horario en el body** o haberlo **persistido antes** en `unidad.contenido.horario` vía API de unidad. |
| **Node** | Valida acceso, fusiona `contenidoEditado` con el contenido persistido, **resuelve** el horario (varias claves y fallback a BD), **normaliza** nombres de área y forma del horario, y reenvía a Python el payload del paso 6. Opcionalmente **persiste** `horario` en la unidad. |
| **Python** | Recibe el JSON del paso 6 (contexto + evidencias + propósitos + enfoques + opcional `horario` ya normalizado). Debe tratar la presencia/ausencia de `horario` según lo que Node envía. |

---

## 3. Body de `POST .../secuencia` y `POST .../regenerar/secuencia`

### 3.1 Campos que Node lee del body

- **`contenidoEditado`** (opcional): objeto con claves del contenido de la unidad a fusionar **antes** de validar el paso 6. Merge **superficial** con el `contenido` actual en BD. Si incluye `horario`, queda disponible como `contenido.horario` para la resolución descrita en §4.

- **Horario en la raíz del body** (opcional, ver §4): cualquiera de las claves soportadas.

No es obligatorio enviar todo el contenido en cada llamada: Node parte del contenido guardado en la unidad y aplica `contenidoEditado` si viene.

### 3.2 Prerrequisitos de negocio (paso 6)

Node exige que, tras el merge, existan en `contenido`:

- Paso 1: situación significativa (texto o forma anidada admitida por el backend).
- Paso 2: `evidencias`
- Paso 3: `propositos`
- Paso 5: `enfoques` (array o forma `{ enfoques: [...] }` según implementación del extractor en Node)

Si falta alguno → **400** con mensaje acorde.

### 3.3 Horario obligatorio según nivel

Si el **nivel** de la unidad (nombre en BD, p. ej. `Nivel Secundaria`) implica horario obligatorio según la regla implementada en Node (**Inicial**, **Secundaria**, **Educación Física** por nombre), entonces debe existir un horario **válido** tras la resolución de §4. Si no → **400** con mensaje de horario obligatorio (paso 0).

**Primaria:** el horario no es obligatorio para generar secuencia.

---

## 4. Contrato del objeto **horario** (entrada desde el front)

### 4.1 Claves aceptadas en el **body** (orden de prioridad)

Node evalúa en este orden y usa el **primer** valor que sea válido (§4.3):

1. `horario`
2. `horarioEscolar`
3. `schedule`
4. `horario_escolar`

**Detección de “envío explícito en body”:** si **cualquiera** de esas propiedades está presente en el objeto body (`!== undefined`), Node considera que el cliente intentó mandar horario por body (aunque el valor sea inválido; en ese caso puede caer al guardado en BD o fallar validación).

### 4.2 Fallback si no hay horario válido en el body

Se usa `contenido.horario` después de aplicar `contenidoEditado` (merge con BD). Es la forma recomendada de “no reenviar horario” si ya se guardó con `PATCH` u otro flujo que persista `unidad.contenido.horario`.

### 4.3 Definición de “horario válido” en Node

Después de:

- parsear JSON si el valor llegó como **string**;
- normalizar `dias` si llegó como **objeto indexado** (`{ "0": {...}, "1": {...} }` → array ordenado por índice numérico),

debe cumplirse:

- `horario` es un objeto.
- `horario.dias` es un **array**.
- `horario.dias.length > 0`.

Opcional en el mismo objeto:

- `turno`: p. ej. `"mañana"` | `"tarde"` (Node puede reenviarlo a Python si existe).

### 4.4 Formas de cada elemento de `dias[]`

Cada día debe incluir al menos una de estas formas (Node las convierte antes de Python):

**A) Canónica (recomendada para Secundaria / 6 horas)**

```json
{
  "dia": "Lunes",
  "horas": [
    { "area": "Matemática" },
    { "area": "Matemática" },
    { "area": "Comunicación" }
  ]
}
```

- Cada elemento de `horas` puede ser `{ "area": "..." }` o un string (tratado como área).

**B) Alternativa (dos turnos)**

```json
{
  "dia": "Lunes",
  "turnoManana": { "area": "Matemática" },
  "turnoTarde": { "area": "Comunicación" }
}
```

**Comportamiento Node hacia Python**

- **Inicial, Secundaria, Educación Física (regla de nombre de nivel):** se **fuerza** a **6** slots por día: si hay `horas` con menos de 6, se rellena repitiendo la última área; si solo hay turnos mañana/tarde, se expande a 3 + 3 horas.
- **Primaria:** no se fuerza a 6; se genera `horas` con lo que haya (p. ej. 1–2 por día si solo hay turnos).

### 4.5 Normalización de nombres de área

Node normaliza textos de área (p. ej. prefijo “Área de …”, variantes IEP) a nombres estándar de catálogo antes de enviar a Python. El front puede enviar nombres largos; debe ser consistente con las áreas que el docente tiene en la unidad.

---

## 5. Payload que Node envía a Python (paso 6)

URL relativa configurada en Node: `api/unidad/secuencia` (sobre la base `PY_RAG_URL` / `PY_SERVICE_URL`).

Incluye como mínimo (nombres de campo tal cual los arma el controlador):

- Campos del **contexto base** de la unidad: `nivel`, `grado`, `numeroUnidad`, `titulo`, `duracion`, fechas si existen, `problematica`, `institucion`, `areas`, `tipo`, `numDocentes`, `genero`, etc.
- `situacionSignificativa` (string)
- `evidencias`, `propositos`, `enfoques` (array)
- `areasComplementarias` si están en el contenido
- **`horario`** solo si la resolución §4 produjo un horario válido; en ese caso el valor es el resultado de la **normalización** a `dias[].horas[]` descrita en §4.4.

Python debe interpretar: **ausencia de `horario`** = distribución libre (salvo reglas propias del servicio); **presencia de `horario`** = respetar esas áreas por franja.

---

## 6. Persistencia tras generar secuencia

- Node guarda el resultado del paso 6 en `unidad.contenido.secuencia`.
- Si el cliente envió horario explícito en body (§4.1) **y** el horario resuelto es válido, Node también actualiza `unidad.contenido.horario` con el objeto **ya normalizado en forma** (`normalizarFormaDiasHorario`), para próximas llamadas sin reenviar el body completo.

---

## 7. `POST .../generar-completa`

- El horario se resuelve con la **misma lógica de claves y fallback**, pero el contenido base para el fallback fusiona `contenidoEditado` del body con el contenido existente en BD **solo para la resolución de horario** en ese flujo.
- Si tras la resolución no hay horario válido y el nivel exige horario → **400** (igual que paso 6 aislado).

---

## 8. Ejemplos mínimos

### 8.1 Secuencia con horario en la raíz (recomendado)

```http
POST /api/ia-unidad/{unidadId}/secuencia
Content-Type: application/json
```

```json
{
  "horario": {
    "turno": "mañana",
    "dias": [
      {
        "dia": "Lunes",
        "horas": [
          { "area": "Área de Matemática" },
          { "area": "Área de Matemática" },
          { "area": "Área de Comunicación" },
          { "area": "Área de Comunicación" },
          { "area": "Tutoría" },
          { "area": "Tutoría" }
        ]
      }
    ]
  }
}
```

(Otros días omitidos en el ejemplo; en producción se espera la grilla completa que use el producto.)

### 8.2 Regenerar secuencia con horario editado en el cliente

Mismo body que §8.1 en:

`POST /api/ia-unidad/{unidadId}/regenerar/secuencia`

Si el front **no** envía horario aquí, Node usará `contenido.horario` guardado; si el usuario cambió el horario solo en estado local y no persistió, **debe** enviarlo en el body.

### 8.3 Horario solo vía `contenidoEditado`

```json
{
  "contenidoEditado": {
    "horario": {
      "dias": [
        {
          "dia": "Lunes",
          "turnoManana": { "area": "Matemática" },
          "turnoTarde": { "area": "Comunicación" }
        }
      ]
    }
  }
}
```

Válido si tras el merge `dias` cumple §4.3.

---

## 9. Observabilidad (Node)

Tras la normalización, Node puede registrar en consola una línea del estilo:

`[secuencia] horario → Python: sí|no (envío explícito en body: sí|no)`

Útil para comprobar que el backend está enviando `horario` al servicio Python.

---

## 10. Cambios futuros

Cualquier nueva clave de body, cambio en orden de prioridad, o cambio en el JSON hacia Python debe:

1. Actualizarse en el código (`ia-unidad.controller.ts`, helpers de horario).
2. Reflejarse en **este documento** en el mismo PR o inmediatamente después.

---

## Referencias en el repo

- Implementación: `src/controllers/ia-unidad/ia-unidad.controller.ts` (resolución y normalización de horario).
- Tipos de contenido: `src/types/ia-unidad.types.ts`, `src/types/horario.types.ts`.
- Rutas: `src/routes/ia-unidad/ia-unidad.routes.ts`.
- Contexto pedagógico paso 0: `docs/api/REGLA_ORO_HORARIO_PASO_0.md`.
