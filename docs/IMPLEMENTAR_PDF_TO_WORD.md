# PDF to Word — Guía de implementación

## Resumen

El docente genera un Word desde cualquier página (MisSesiones, SesionViewer, etc.)
**sin salir de la pantalla actual**. El frontend envía solo el `sesionId` al backend,
el backend descarga el PDF desde S3 internamente, convierte a Word con **SayPDF**,
sube el .docx a **S3**, guarda `wordUrl` en la BD, y notifica al frontend vía **Socket.IO**.

## Arquitectura

```
Docente hace click en "Generar Word"
         │
         ▼
┌─────────────────────┐
│   FRONTEND          │
│   POST { sesionId } │  (JSON, sin archivo — liviano)
└────────┬────────────┘
         │ POST /api/pdf-to-word/from-session
         ▼
┌─────────────────────┐
│   BACKEND           │
│   responde { jobId }│  ← < 1 segundo
│   lanza background  │
│   ↓                 │
│   descarga PDF      │  ← S3 → backend (interno, sin CORS)
│   de S3             │
└────────┬────────────┘
         │ (async, sin bloquear)
         ▼
┌─────────────────────┐
│   SAYPDF API        │
│   convierte a .docx │  (~5-20s)
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│   BACKEND           │
│   sube .docx a S3   │  (bucket: docs-words-generated)
│   guarda wordUrl    │  (Prisma: sesion.wordUrl)
│   emite socket      │  → "word:listo" { jobId, wordUrl }
└────────┬────────────┘
         │ Socket.IO → user:<usuarioId>
         ▼
┌─────────────────────┐
│   FRONTEND          │
│   recibe wordUrl    │
│   botón cambia a    │
│   "Ver Word" (verde)│
└─────────────────────┘
```

## Comportamiento del botón

| Estado | Botón | Acción |
|--------|-------|--------|
| Sin `wordUrl` en la sesión | **Generar Word** (azul) | Envía sesionId → backend descarga PDF de S3 → convierte → sube Word a S3 |
| Con `wordUrl` en la sesión | **Ver Word** (verde) | Obtiene URL de descarga firmada de S3 → abre en nueva pestaña |

## Endpoints

### `POST /api/pdf-to-word/from-session` ← NUEVO (preferido)

Backend descarga el PDF desde S3 internamente. Sin upload de archivos.
Evita errores 413 y problemas de CORS.

**Body (JSON):** `{ "sesionId": "uuid" }`
**Response:** `{ "success": true, "jobId": "uuid" }`

**Implementación backend:**
```typescript
// En pdf-to-word.controller.ts
async function convertFromSession(req: AuthRequest, res: Response) {
  const apiKey = process.env.SAYPDF_API_KEY;
  if (!apiKey) return res.status(500).json({ success: false, error: "SAYPDF_API_KEY no configurado" });

  const auth0Sub = req.auth?.sub;
  if (!auth0Sub) return res.status(401).json({ success: false, error: "No autorizado" });

  const { sesionId } = req.body;
  if (!sesionId) return res.status(400).json({ success: false, error: "sesionId requerido" });

  // Verificar que la sesión existe y tiene PDF
  const sesion = await prismaClient.sesion.findUnique({
    where: { id: sesionId },
    select: { pdfUrl: true },
  });

  if (!sesion?.pdfUrl) {
    return res.status(400).json({ success: false, error: "La sesión no tiene PDF" });
  }

  const jobId = randomUUID();
  res.json({ success: true, jobId });

  // Background: descargar PDF de S3 → convertir → subir Word
  processConversionFromS3(jobId, sesion.pdfUrl, sesionId, auth0Sub, apiKey).catch((err) => {
    console.error(`[pdf-to-word] Job ${jobId} failed:`, err.message);
  });
}

async function processConversionFromS3(
  jobId: string, pdfUrl: string, sesionId: string, auth0Sub: string, apiKey: string,
) {
  // 1. Descargar PDF desde S3 (server-side, sin CORS)
  const pdfResp = await axios.get(pdfUrl, { responseType: "arraybuffer" });
  const pdfBuffer = Buffer.from(pdfResp.data);

  // 2. Reutilizar processConversion existente con el buffer
  // ... (misma lógica: SayPDF → upload Word a S3 → Prisma update → Socket.IO)
}
```

**Ruta:**
```typescript
// En pdf-to-word.routes.ts
router.post("/from-session", express.json(), convertFromSession);
```

### `POST /api/pdf-to-word` (legacy — con upload de archivo)

Usado solo cuando se genera un PDF fresco desde HTML (ej. primera vez en SesionSuscriptorResult).

**Body (form-data):** `file` (PDF, max 30MB), `sesionId` (UUID)
**Response:** `{ "success": true, "jobId": "uuid" }`

### Socket Events

| Evento | Payload | Cuándo |
|--------|---------|--------|
| `word:listo` | `{ jobId, wordUrl }` | .docx subido a S3 y wordUrl guardado |
| `word:error` | `{ jobId, message }` | Conversión falló |

### `POST /api/pdf-to-word/from-unidad` ← NUEVO (unidades)

Mismo flujo que `/from-session` pero para unidades didácticas.
Backend descarga el PDF de la unidad desde S3, convierte a Word con SayPDF,
sube el .docx a S3, guarda `wordUrl` / `wordGeneradoAt` en el modelo `Unidad`,
y notifica al frontend con `word:listo`.

**Body (JSON):** `{ "unidadId": "uuid" }`
**Response:** `{ "success": true, "jobId": "uuid" }`

**Implementación backend:**
```typescript
// En pdf-to-word.controller.ts
async function convertFromUnidad(req: AuthRequest, res: Response) {
  const apiKey = process.env.SAYPDF_API_KEY;
  if (!apiKey) return res.status(500).json({ success: false, error: "SAYPDF_API_KEY no configurado" });

  const auth0Sub = req.auth?.sub;
  if (!auth0Sub) return res.status(401).json({ success: false, error: "No autorizado" });

  const { unidadId } = req.body;
  if (!unidadId) return res.status(400).json({ success: false, error: "unidadId requerido" });

  const unidad = await prismaClient.unidad.findUnique({
    where: { id: unidadId },
    select: { pdfUrl: true, usuarioId: true },
  });

  if (!unidad?.pdfUrl) {
    return res.status(400).json({ success: false, error: "La unidad no tiene PDF" });
  }

  const jobId = randomUUID();
  res.json({ success: true, jobId });

  // Background: descargar PDF → SayPDF → S3 → DB → Socket
  processConversionFromS3Unidad(jobId, unidad.pdfUrl, unidadId, auth0Sub, apiKey).catch((err) => {
    console.error(`[pdf-to-word] Unidad job ${jobId} failed:`, err.message);
  });
}
```

**Ruta:**
```typescript
// En pdf-to-word.routes.ts
router.post("/from-unidad", express.json(), convertFromUnidad);
```

**Modelo Prisma — agregar campos:**
```prisma
model Unidad {
  // ... campos existentes ...
  wordUrl        String?
  wordGeneradoAt DateTime?
}
```

**Migración:**
```bash
npx prisma migrate dev --name add-word-fields-to-unidad
```

### Endpoints existentes (ya implementados)

| Endpoint | Descripción |
|----------|-------------|
| `GET /api/sesion/:id/download-url-word` | URL firmada para descargar el .docx de sesión desde S3 |
| `GET /api/unidad/:id/download-url-word` | URL firmada para descargar el .docx de unidad desde S3 (**nuevo**) |
| `DELETE /api/sesion/:id/word` | Elimina el .docx de S3 y limpia wordUrl |

## CORS — Configurar S3 bucket

El bucket `docs-pdfs-generated` necesita CORS para que el frontend pueda cargar
imágenes (ej. insignia.png) en el navegador.

**Ir a:** AWS Console → S3 → `docs-pdfs-generated` → Permissions → CORS

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": [
      "https://www.docente-pro.com",
      "https://docente-pro.com",
      "http://localhost:5173"
    ],
    "ExposeHeaders": ["Content-Length", "Content-Type"],
    "MaxAgeSeconds": 3600
  }
]
```

## Nginx — Aumentar body size (solo si se usa el endpoint legacy)

Si usas `POST /api/pdf-to-word` con archivo adjunto, Nginx rechaza PDFs > 1MB.

```nginx
# En la configuración del server block de api.docente-pro.com
location /api/pdf-to-word {
    client_max_body_size 30m;
    proxy_pass http://localhost:3000;
    # ... demás proxy headers
}
```

Con el nuevo endpoint `/from-session` esto no es necesario (solo envía JSON).

## Solo falta: API Key de SayPDF

1. Ir a [saypdf.com](https://saypdf.com) → crear cuenta → elegir plan
2. Obtener API key del dashboard
3. Pegar en `.env` del backend:

```env
SAYPDF_API_KEY=tu_api_key_aqui
```

4. Reiniciar backend

## SayPDF Pricing

| Plan | Precio | Páginas/mes |
|------|--------|-------------|
| Mini | $1/mes | 100 |
| Basic | $5/mes | 850 |
| Starter | $9.99/mes | 2,000 |
| Professional | $29.99/mes | 7,500 |

Sandbox mode: header `X-Sandbox: true` para probar sin gastar créditos.

## Checklist

### Sesiones
- [ ] **Backend:** crear endpoint `POST /api/pdf-to-word/from-session`
- [ ] Probar: click "Generar Word" desde MisSesiones → spinner → "Word generado" → botón verde "Ver Word"

### Unidades
- [ ] **Backend:** crear endpoint `POST /api/pdf-to-word/from-unidad`
- [ ] **Backend:** agregar `wordUrl` / `wordGeneradoAt` al modelo Prisma `Unidad` + migración
- [ ] **Backend:** crear endpoint `GET /api/unidad/:id/download-url-word` (URL presignada)
- [ ] Probar: click "Generar Word" desde EditarUnidad → spinner → "Word generado" → botón verde "Ver Word"

### General
- [ ] **S3 CORS:** configurar bucket `docs-pdfs-generated` (ver JSON arriba)
- [ ] **SayPDF:** crear cuenta y API key
- [ ] Pegar en `.env` → `SAYPDF_API_KEY=...`
- [ ] Reiniciar backend
