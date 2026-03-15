# PDF to Word — Guía de implementación

## Resumen

El docente genera un Word desde la página de sesión. El frontend genera un PDF (client-side), lo envía al backend, el backend convierte a Word con **SayPDF**, sube el .docx a **S3**, guarda `wordUrl` en la BD, y notifica al frontend vía **Socket.IO**. La conversión es **no bloqueante**.

## Arquitectura

```
Docente hace click en "Descargar Word"
         │
         ▼
┌─────────────────────┐
│   FRONTEND          │
│   genera PDF blob   │  (html2canvas + jsPDF, client-side)
└────────┬────────────┘
         │ POST /api/pdf-to-word { file, sesionId }
         ▼
┌─────────────────────┐
│   BACKEND           │
│   recibe PDF        │  ← responde { jobId } en < 1 segundo
│   lanza background  │
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
│   "Ver Word"        │
└─────────────────────┘
```

## Comportamiento del botón

| Estado | Botón | Acción |
|--------|-------|--------|
| Sin `wordUrl` en la sesión | **Descargar Word** (azul) | Genera PDF → envía al backend → convierte → sube a S3 |
| Con `wordUrl` en la sesión | **Ver Word** (verde) | Obtiene URL de descarga firmada de S3 → abre en nueva pestaña |

## Solo falta: API Key de SayPDF

1. Ir a [saypdf.com](https://saypdf.com) → crear cuenta → elegir plan
2. Obtener API key del dashboard
3. Pegar en `.env` del backend:

```env
SAYPDF_API_KEY=tu_api_key_aqui
```

4. Reiniciar backend

## Archivos modificados

### Backend (smart-teacher-backend)

| Archivo | Cambio |
|---------|--------|
| `src/controllers/pdf-to-word/pdf-to-word.controller.ts` | Nuevo: recibe PDF, convierte con SayPDF, sube a S3, guarda wordUrl |
| `src/routes/pdf-to-word/pdf-to-word.routes.ts` | Nuevo: `POST /api/pdf-to-word` |
| `src/routes/index.ts` | Registra ruta `/api/pdf-to-word` con `verifyToken` |
| `src/utils/socketService.ts` | Nuevos eventos: `emitWordListo`, `emitWordError` |
| `src/utils/s3Client.ts` | Nueva función: `uploadWordToS3` |
| `.env` | Nueva variable: `SAYPDF_API_KEY` |

### Frontend (smart-teacher-frontend)

| Archivo | Cambio |
|---------|--------|
| `src/services/pdfToWord.service.ts` | Reescrito: envía PDF + sesionId, espera socket, retorna wordUrl |
| `src/services/htmldocs.service.ts` | `generateAndUploadWord(element, sesionId)` reemplaza a `generateAndDownloadWord` |
| `src/services/socket.service.ts` | Nuevos tipos: `WordListoPayload`, `WordErrorPayload` |
| `src/interfaces/ISesion.ts` | Nuevos campos: `wordUrl`, `wordGeneradoAt` |
| `src/pages/SesionSuscriptorResult.tsx` | Botón "Descargar Word" → "Ver Word" cuando hay wordUrl |
| `src/pages/SesionPremiumResult.tsx` | Idem |
| `src/hooks/useSesionPremiumPDF.ts` | Nuevas funciones: `handleGenerateWord`, `handleVerWord`, estado `wordUrl` |
| `index.html` | Limpieza: removidos polyfills de html-to-docx |
| `vite.config.ts` | Limpieza: removido plugin html-to-docx |
| `package.json` | Removido: `@turbodocx/html-to-docx` |

## API Reference

### `POST /api/pdf-to-word`

Inicia conversión. Retorna inmediatamente.

**Body (form-data):** `file` (PDF, max 30MB), `sesionId` (UUID)
**Response:** `{ "success": true, "jobId": "uuid" }`

### Socket Events

| Evento | Payload | Cuándo |
|--------|---------|--------|
| `word:listo` | `{ jobId, wordUrl }` | .docx subido a S3 y wordUrl guardado |
| `word:error` | `{ jobId, message }` | Conversión falló |

### Endpoints existentes (ya implementados en backend)

| Endpoint | Descripción |
|----------|-------------|
| `GET /api/sesion/:id/download-url-word` | URL firmada para descargar el .docx desde S3 |
| `DELETE /api/sesion/:id/word` | Elimina el .docx de S3 y limpia wordUrl |

## SayPDF Pricing

| Plan | Precio | Páginas/mes |
|------|--------|-------------|
| Mini | $1/mes | 100 |
| Basic | $5/mes | 850 |
| Starter | $9.99/mes | 2,000 |
| Professional | $29.99/mes | 7,500 |

Sandbox mode: header `X-Sandbox: true` para probar sin gastar créditos.

## Checklist

- [ ] Crear cuenta en saypdf.com
- [ ] Crear API key
- [ ] Pegar en `.env` → `SAYPDF_API_KEY=...`
- [ ] Reiniciar backend
- [ ] Probar en una sesión: click "Descargar Word" → esperar → debería cambiar a "Ver Word"
