# Corrección de Estándares — API

Endpoint **determinista** (sin IA) para corregir estándares de aprendizaje truncados o incompletos en unidades ya generadas. Reemplaza los textos con los oficiales del **Currículo Nacional MINEDU**, textualmente.

**Idempotente**: Sí — llamar N veces produce el mismo resultado  
**Costo**: $0 (no usa IA)

---

## Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/api/unidades/corregir-estandares` | Token | Corrige estándares de **una** unidad |
| `POST` | `/api/unidades/corregir-estandares/masivo` | Token + Admin | Corrige estándares de **todas** las unidades |

---

## ¿Por qué existe este endpoint?

Los estándares se generaban vía RAG (vectorstore FAISS) que fragmenta los PDFs del MINEDU en chunks. Cuando un estándar cae en un límite de página o columna, el texto se trunca:

```
❌ "Construye y evalúa normas de con -"
✅ "Construye y evalúa normas de convivencia tomando en cuenta sus derechos..."
```

El servicio Python tiene un **diccionario hardcodeado** (`app/config/estandares_cn.py`) con los textos oficiales completos de **todas las competencias × todos los ciclos (III–VII)**.

---

## Flujo de Integración

```
┌─────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│   Node.js   │     │   Python (FastAPI)    │     │      Node.js         │
│             │     │                       │     │                      │
│ 1. Carga    │────▶│ 2. Deep-copy unidad   │────▶│ 4. Recibe unidad     │
│    unidad   │     │ 3. Reemplaza solo     │     │    corregida         │
│    de BD    │     │    los estándares      │     │ 5. Guarda en BD      │
└─────────────┘     └───────────────────────┘     └──────────────────────┘
```

---

## 1. Corregir una unidad — `POST /api/unidades/corregir-estandares`

Acepta **dos variantes** de body:

### Variante A — Por ID (recomendada)

El backend carga la unidad de BD, corrige, y **guarda automáticamente** si hubo cambios.

```json
{
  "unidadId": "uuid-de-la-unidad"
}
```

### Variante B — Body directo

Útil para scripts o previews sin guardar.

```json
{
  "unidad": { "...contenido JSON de la unidad..." },
  "nivel": "Primaria",
  "grado": "4to grado"
}
```

### Campos del request

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `unidadId` | `string` | ✅ (variante A) | UUID de la unidad en BD |
| `unidad` | `object` | ✅ (variante B) | Contenido completo de la unidad |
| `nivel` | `string` | ✅ (variante B) | `"Primaria"` o `"Secundaria"` |
| `grado` | `string` | ✅ (variante B) | `"1er grado"`, `"2do grado"`, ..., `"6to grado"` |

> Si se envía `unidadId`, no se necesitan `unidad`, `nivel` ni `grado` (se cargan de BD).

### Response `200`

```json
{
  "success": true,
  "totalCorregidos": 3,
  "guardadoEnBD": true,
  "correcciones": [
    {
      "area": "Personal Social",
      "competencia": "Convive y participa democráticamente en la búsqueda del bien común",
      "estandarAnterior": "Convive y participa democráticamente cuando se relaciona con los demás respetando las diferencias y los derechos de con -...",
      "estandarCorregido": "Convive y participa democráticamente cuando se relaciona con los demás respetando las diferencias y cumpliendo con sus d..."
    }
  ],
  "unidad": { "...contenido completo con estándares corregidos..." },
  "upload": {
    "presignedUrl": "https://s3.amazonaws.com/bucket/unidades/userId/unidadId.pdf?...",
    "s3Key": "unidades/userId/unidadId.pdf",
    "expiresIn": 600,
    "method": "PUT",
    "contentType": "application/pdf"
  },
  "miembrosUpload": [
    {
      "miembroId": "uuid-miembro",
      "usuarioId": "uuid-usuario-suscriptor",
      "presignedUrl": "https://s3.amazonaws.com/bucket/unidades/suscriptorId/unidadId.pdf?...",
      "s3Key": "unidades/suscriptorId/unidadId.pdf"
    }
  ]
}
```

### Campos del response

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `success` | `boolean` | `true` si la operación fue exitosa |
| `totalCorregidos` | `integer` | Cantidad de estándares reemplazados (0 si ya estaban correctos) |
| `guardadoEnBD` | `boolean` | Solo en variante A: `true` si se guardó en BD (hubo correcciones) |
| `correcciones` | `array` | Detalle de cada corrección (área, competencia, texto anterior vs. corregido truncados a 150 chars) |
| `unidad` | `object` | Unidad **completa** con estándares corregidos. Todo lo demás idéntico al input |
| `upload` | `object \| null` | Presigned URL para re-subir el PDF del propietario. `null` si no hubo correcciones |
| `upload.presignedUrl` | `string` | URL firmada para hacer `PUT` con el PDF nuevo |
| `upload.s3Key` | `string` | Key en S3 donde se almacenará |
| `upload.expiresIn` | `number` | Segundos de validez (600 = 10 min) |
| `miembrosUpload` | `array` | Presigned URLs para re-subir PDFs de cada miembro/suscriptor que tenía PDF |

> **Nota**: Cuando hay correcciones, el backend **elimina automáticamente** el PDF viejo de S3 y limpia `pdfUrl`/`pdfGeneradoAt` tanto del propietario como de los miembros. El front debe re-renderizar el PDF con el contenido corregido y subirlo via `PUT` a la `presignedUrl`.

### Error `400`

```json
{
  "success": false,
  "message": "Se requiere { unidadId } o { unidad, nivel, grado } en el body"
}
```

### Error `404`

```json
{
  "success": false,
  "message": "Unidad no encontrada"
}
```

---

## 2. Corrección masiva — `POST /api/unidades/corregir-estandares/masivo`

> Requiere rol **Admin**.

Recorre **todas** las unidades que tienen contenido en BD, corrige estándares y guarda.

**Request body:** ninguno (vacío o `{}`).

### Response `200`

```json
{
  "success": true,
  "total": 150,
  "corregidas": 42,
  "sinCambios": 105,
  "errores": 3,
  "detalles": [
    { "unidadId": "uuid-1", "totalCorregidos": 3 },
    { "unidadId": "uuid-2", "totalCorregidos": 1 },
    { "unidadId": "uuid-err", "totalCorregidos": 0, "error": "Python service error..." }
  ]
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `total` | `integer` | Total de unidades procesadas |
| `corregidas` | `integer` | Unidades que tenían estándares truncados y fueron corregidas |
| `sinCambios` | `integer` | Unidades cuyos estándares ya estaban correctos |
| `errores` | `integer` | Unidades que fallaron |
| `detalles` | `array` | Detalle por unidad (solo las que tuvieron correcciones o errores) |

---

## ¿Dónde busca los estándares?

Python escanea **3 ubicaciones** dentro del JSON `unidad`:

| Ubicación | Descripción |
|-----------|-------------|
| `unidad.areasPropositos[].competencias[].estandar` | Propósitos por área |
| `unidad.competenciasTransversales[].estandar` | Transversales |
| `unidad.propositoAprendizaje[].estandar` | Echo-back de sesiones (campo flat) |

> El matching usa el campo `nombre` **o** `competencia` (soporta ambos formatos).

---

## Integración en el Frontend

### Cuándo llamar

| Escenario | Endpoint | Quién |
|-----------|----------|-------|
| **Botón "Corregir estándares" en detalle de unidad** | `POST /api/unidades/corregir-estandares` con `{ unidadId }` | Docente |
| **Admin: corregir todas las unidades** | `POST /api/unidades/corregir-estandares/masivo` | Admin |

### Ejemplo de llamada desde el front (por ID)

```typescript
const response = await fetch('/api/unidades/corregir-estandares', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({ unidadId: 'uuid-de-la-unidad' }),
});

const data = await response.json();

if (data.success && data.totalCorregidos > 0) {
  // 1. Actualizar el estado local con la unidad corregida
  setUnidad(data.unidad);
  toast.success(`${data.totalCorregidos} estándar(es) corregido(s)`);

  // 2. Re-renderizar el PDF con el contenido corregido (en el front)
  const pdfBlob = await generarPdfDesdeContenido(data.unidad);

  // 3. Subir el PDF nuevo a S3 usando la presigned URL
  if (data.upload?.presignedUrl) {
    await fetch(data.upload.presignedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/pdf' },
      body: pdfBlob,
    });

    // 4. Confirmar al backend que el PDF fue subido
    await fetch('/api/unidades/confirmar-upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        unidadId: 'uuid-de-la-unidad',
        key: data.upload.s3Key,
      }),
    });
  }

  // 5. (Opcional) Re-subir PDFs de miembros si existen
  for (const miembro of data.miembrosUpload ?? []) {
    // Generar el PDF personalizado del miembro y subirlo
    const miembroPdf = await generarPdfMiembro(data.unidad, miembro.usuarioId);
    await fetch(miembro.presignedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/pdf' },
      body: miembroPdf,
    });
  }
} else {
  toast.info('Los estándares ya estaban correctos');
}
```

### Ejemplo: Admin masivo

```typescript
const response = await fetch('/api/unidades/corregir-estandares/masivo', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`,
  },
});

const data = await response.json();
// data = { total: 150, corregidas: 42, sinCambios: 105, errores: 3, detalles: [...] }
```

---

## Mapeo Grado → Ciclo

Python determina el ciclo automáticamente a partir de `nivel` + `grado`:

| Nivel | Grados | Ciclo |
|-------|--------|-------|
| Primaria | 1°, 2° | III |
| Primaria | 3°, 4° | IV |
| Primaria | 5°, 6° | V |
| Secundaria | 1°, 2° | VI |
| Secundaria | 3°, 4°, 5° | VII |

El matching de grado es flexible: acepta `"4to grado"`, `"4° grado"`, `"cuarto"`, `"4"`, etc.

---

## Competencias soportadas

El diccionario cubre **todas** las competencias del Currículo Nacional para los 5 ciclos:

| Área | Competencias |
|------|-------------|
| Comunicación | Se comunica oralmente, Lee diversos tipos de textos, Escribe diversos tipos de textos |
| Matemática | Resuelve problemas de cantidad, de regularidad, de forma, de gestión de datos |
| Personal Social | Construye su identidad, Convive y participa democráticamente |
| Ciencia y Tecnología | Indaga mediante métodos científicos, Explica el mundo físico, Diseña y construye soluciones tecnológicas |
| Arte y Cultura | Aprecia de manera crítica, Crea proyectos |
| Ed. Religiosa | Construye su identidad como persona humana, Asume la experiencia del encuentro personal y comunitario con Dios |
| Ed. Física | Se desenvuelve de manera autónoma, Asume una vida saludable, Interactúa a través de sus habilidades sociomotrices |
| Inglés | Se comunica oralmente en inglés, Lee diversos tipos de textos en inglés, Escribe diversos tipos de textos en inglés |
| **Transversales** | Se desenvuelve en entornos virtuales (TIC), Gestiona su aprendizaje de manera autónoma |

---

## Notas técnicas

1. **Deep copy**: Python hace `deepcopy` del input — el objeto original nunca se muta.
2. **Solo corrige si difiere**: Si un estándar ya es idéntico al oficial, no se cuenta como corrección.
3. **Búsqueda por nombre normalizado**: Matching de competencia por nombre completo (case-sensitive pero trimmed).
4. **Sin dependencias externas**: No llama a Gemini, no consulta vectorstore. Solo compara strings contra un diccionario en memoria.
5. **`correcciones[]` truncado a 150 chars**: Los campos `estandarAnterior` y `estandarCorregido` se truncan a 150 caracteres. La `unidad` devuelta contiene los textos completos.
6. **Guardado automático**: Con variante A (`unidadId`), Node.js guarda la corrección en BD automáticamente si hubo cambios.
