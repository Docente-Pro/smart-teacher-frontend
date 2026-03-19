# Recursos de sesión — Indicaciones Backend y Frontend

Documentación del flujo **recursos sugeridos por sesión** (videos YouTube, cuadernos MINEDU, páginas web). La generación de la sesión **no se demora**: los recursos se obtienen con una llamada separada.

**Para el frontend:** solo tenéis que llamar a **`POST /api/sesion/recursos`** con body **`{ "sesionId": "<uuid>" }`**. No enviáis nivel, grado, área, título ni propósito; el backend obtiene todo eso de la sesión y llama a Python por vosotros.

---

## 1. Resumen para Backend (Python / RAG Service)

### 1.1 Ya implementado

- **Endpoint**: `POST /api/unidad/sesion/recursos`
- **Schemas**: `RecursosSesionRequest`, `RecursoSesion`, `RecursosSesionResponse` en `app/unidad/schemas.py`
- **Generador**: `generar_recursos_sesion` en `app/unidad/generador.py` (usa FLASH_MODEL)
- **Prompt**: `prompt_recursos_sesion` en `app/unidad/prompts.py`
- **Respuesta de sesión**: en `SesionUnidadResponse` existe el campo opcional `recursos` (null por defecto) para que el frontend pueda mergear cuando llame a este endpoint.

### 1.2 Contrato del endpoint (Python, uso interno)

El front **no llama a este endpoint**. Lo usa el backend Node tras enriquecer el body. Referencia:

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST   | `/api/unidad/sesion/recursos` | Sugiere recursos para una sesión (YouTube, cuadernos, páginas). Lo invoca Node internamente. |

**Request body que recibe Python** (`RecursosSesionRequest` — lo construye Node, no el front):

| Campo              | Tipo     | Obligatorio | Descripción |
|--------------------|----------|-------------|-------------|
| nivel              | string   | Sí          | Inicial, Primaria, Secundaria |
| grado              | string   | Sí          | 1er grado, 2do grado, 5to grado, etc. |
| area               | string   | Sí          | Matemática, Comunicación, etc. |
| tituloSesion       | string   | Sí          | Título de la sesión o actividad del planificador |
| propositoSesion    | string   | Sí          | Propósito de la sesión en 1-2 líneas |
| competencia        | string   | No          | Competencia del área (mejora coherencia) |
| capacidades        | string[] | No          | Lista de capacidades |

**Response** (`RecursosSesionResponse`):

```json
{
  "recursos": [
    {
      "tipo": "youtube",
      "titulo": "Título breve del video",
      "descripcion": "Para qué sirve en esta sesión",
      "url": "https://www.youtube.com/..."
    },
    {
      "tipo": "cuaderno_minedu",
      "titulo": "Cuaderno de trabajo",
      "descripcion": "Qué encontrará el docente",
      "referencia": "Cuaderno 5° Matemática, p. 23"
    },
    {
      "tipo": "pagina_web",
      "titulo": "Nombre del recurso",
      "descripcion": "Para qué sirve",
      "url": "https://..."
    }
  ]
}
```

**Tipos de recurso** (`tipo`):

- `youtube` — Video; usar `url` y `descripcion`.
- `pagina_web` — Enlace a MINEDU, PerúEduca, etc.; usar `url` y `descripcion`.
- `cuaderno_minedu` — Material impreso; usar `referencia` (ej. "Cuaderno 5° Matemática, p. 23") y `descripcion`.
- `recomendacion` — Otros (libro, ficha); puede tener `url` y/o `referencia`.

### 1.3 Comportamiento

- No se envía la sesión completa; con el contexto mínimo la IA sugiere recursos coherentes.
- Si la IA falla o devuelve vacío, el endpoint responde `{ "recursos": [] }`.
- Los ítems se normalizan para cumplir el schema (tipo, titulo, descripcion; url/referencia opcionales).

### 1.4 Backend Node — Enriquecimiento por ID (recomendado para el front)

El **frontend solo envía el ID de la sesión**. El backend Node carga la sesión, construye el body completo y llama a Python.

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST   | `/api/sesion/recursos` | Body: `{ sesionId }`. Node enriquece (nivel, grado, área, título, propósito, competencia, capacidades) desde la sesión y llama a `api/unidad/sesion/recursos` en Python. Respuesta: mismo `RecursosSesionResponse`. |

**Request body (frontend → Node):**

| Campo    | Tipo   | Obligatorio | Descripción   |
|----------|--------|-------------|---------------|
| sesionId | string | Sí          | UUID de la sesión |

**Response:** Igual que en 1.2 (`{ recursos: RecursoSesion[] }`). Si la sesión no existe, no pertenece al usuario o Python falla, se responde `{ recursos: [] }`.

El backend Node obtiene nivel/grado/área de las relaciones de la sesión, y propositoSesion/competencia/capacidades del campo `contenido` (y `resumen`) de la sesión.

---

## 2. Contratos TypeScript (Frontend)

El front **solo envía el ID de la sesión** (`sesionId`). El resto del contexto lo aporta el backend. Tipos para alinear con el backend:

### 2.0 Tipos e interfaces

```ts
/** Valor literal de `tipo` en cada recurso. El backend solo devuelve estos cuatro. */
export type TipoRecursoSesion =
  | 'youtube'
  | 'pagina_web'
  | 'cuaderno_minedu'
  | 'recomendacion';

/** Un recurso sugerido para la sesión (video, cuaderno MINEDU, página, etc.). */
export interface RecursoSesion {
  tipo: TipoRecursoSesion;
  titulo: string;
  descripcion: string;
  /** Presente en youtube y pagina_web; opcional en recomendacion. */
  url?: string | null;
  /** Referencia impresa; típico en cuaderno_minedu y recomendacion. */
  referencia?: string | null;
}

/** Response de POST /api/sesion/recursos (y del endpoint interno Python). */
export interface RecursosSesionResponse {
  recursos: RecursoSesion[];
}

/** Body que envía el front a POST /api/sesion/recursos — solo este campo. */
export interface RecursosSesionBody {
  sesionId: string;
}

/** Body interno que Node envía a Python (el front no usa este tipo). */
export interface RecursosSesionRequest {
  nivel: string;
  grado: string;
  area: string;
  tituloSesion: string;
  propositoSesion: string;
  competencia?: string | null;
  capacidades?: string[] | null;
}
```

### 2.1 Uso en la sesión (campo opcional)

La respuesta de `POST /api/unidad/generar-sesion` puede incluir recursos si el front los mergea después:

```ts
// En tu tipo de sesión (SesionUnidad o equivalente):
interface SesionUnidad {
  titulo: string;
  propositoSesion: string;
  // ... resto de campos ...
  /** Recursos sugeridos; null hasta que se llame a POST /sesion/recursos. */
  recursos?: RecursoSesion[] | null;
}
```

### 2.2 Constante para validar / mapear por tipo

```ts
export const TIPOS_RECURSO_SESION: TipoRecursoSesion[] = [
  'youtube',
  'pagina_web',
  'cuaderno_minedu',
  'recomendacion',
];

/** Indica si el recurso tiene enlace clicable (url). */
export function recursoTieneUrl(r: RecursoSesion): boolean {
  return (r.tipo === 'youtube' || r.tipo === 'pagina_web') && !!r.url;
}
```

---

## 3. Indicaciones para Frontend (Node / React)

### 3.1 Flujo recomendado

1. **Generar sesión** (sin esperar recursos):
   - Llamar `POST /api/unidad/generar-sesion` como hasta ahora.
   - Mostrar la sesión en cuanto llegue la respuesta (sin bloqueo por recursos).

2. **Obtener recursos** (en paralelo o al abrir la vista de la sesión):
   - Llamar **`POST /api/sesion/recursos`** con body **`{ sesionId }`** (solo el ID). El backend Node enriquece el body con los datos de la sesión y llama a Python.
   - Al recibir la respuesta, actualizar el estado de la sesión (o la vista) con `recursos: response.recursos`.

3. **Mostrar en la vista de la sesión**:
   - Sección tipo “Recursos para esta sesión” con la lista de `recursos`.
   - Por `tipo`: enlace clicable para `youtube` y `pagina_web` (`url`); texto para `cuaderno_minedu` y `recomendacion` (`referencia` si existe). Siempre mostrar `titulo` y `descripcion`.

### 3.2 Qué enviar en el request de recursos

**Solo el ID de la sesión.** No enviáis nivel, grado, área, título, propósito, competencia ni capacidades; el backend los obtiene de la sesión.

| Enviáis | No enviáis |
|---------|------------|
| `sesionId` (UUID de la sesión) | nivel, grado, area, tituloSesion, propositoSesion, competencia, capacidades |

Ejemplo de body para **`POST /api/sesion/recursos`**:

```json
{ "sesionId": "550e8400-e29b-41d4-a716-446655440000" }
```

Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`. Respuesta: `{ recursos: RecursoSesion[] }`.

### 3.3 Dónde guardar los recursos

- La respuesta de `POST /api/unidad/generar-sesion` incluye el campo opcional **`recursos`** (null si no se han pedido).
- Tras llamar a **`POST /api/sesion/recursos`** (con body `{ sesionId }`), actualizar la sesión en el estado/store con `sesion.recursos = response.recursos` para que la vista muestre la lista sin volver a llamar.

### 3.4 UX sugerida

- **Opción A**: Llamar a `sesion/recursos` en paralelo justo después de pedir la sesión; mostrar un bloque “Recursos” cuando llegue (o “Cargando recursos…” hasta entonces).
- **Opción B**: Llamar a `sesion/recursos` solo cuando el usuario abra la sección “Recursos de la sesión” (botón o acordeón), y cachear el resultado en el estado de la sesión.

En ambos casos la generación de la sesión no se demora por los recursos.

---

## 4. Resumen de archivos (Backend)

| Archivo | Contenido |
|---------|-----------|
| `app/unidad/schemas.py` | `RecursosSesionRequest`, `RecursoSesion`, `RecursosSesionResponse`; campo `recursos` en `SesionUnidadResponse` |
| `app/unidad/prompts.py` | `prompt_recursos_sesion` |
| `app/unidad/generador.py` | `generar_recursos_sesion` |
| `app/unidad/routes.py` | `POST /sesion/recursos` → `endpoint_recursos_sesion` |

Base URL del router: `/api/unidad` → endpoint completo: **`POST /api/unidad/sesion/recursos`**.
