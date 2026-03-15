# API: Subir Word de sesión a S3

Contratos para que el frontend suba el documento Word (.docx) de una sesión a S3 y guarde la URL en el backend. Mismo patrón que el PDF: pedir URL prefirmada → PUT del archivo → confirmar upload.

Base: **`/api/sesion`**  
Autenticación: **Bearer token** (Auth0).  
Requisito: variable de entorno **`AWS_S3_BUCKET_WORDS`** configurada; si no, los endpoints responden **503**.

---

## Flujo en 3 pasos

1. **POST /api/sesion/upload-url-word** (body: `sesionId`, `usuarioId`) → el backend devuelve `uploadUrl` y `key`.
2. **PUT** del archivo .docx a `uploadUrl` (body binario, header `Content-Type` según `data.contentType`).
3. **POST /api/sesion/confirmar-upload-word** (body: `sesionId`, `usuarioId`, `key`) → el backend guarda `wordUrl` y `wordGeneradoAt` en la sesión.

---

## 1. Solicitar URL de subida

### `POST /api/sesion/upload-url-word`

Obtiene una URL prefirmada para subir el .docx a S3. La URL expira en **10 minutos**.

#### Headers

| Header            | Valor                        |
|-------------------|------------------------------|
| Authorization     | Bearer \<token Auth0\>        |
| Content-Type      | application/json             |

#### Body (JSON)

| Campo     | Tipo   | Requerido | Descripción                          |
|-----------|--------|-----------|--------------------------------------|
| sesionId  | string | Sí        | UUID de la sesión                    |
| usuarioId | string | Sí        | UUID del usuario (dueño de la sesión)|

#### Ejemplo de request

```json
{
  "sesionId": "550e8400-e29b-41d4-a716-446655440000",
  "usuarioId": "fa97b8c9-da76-41d9-8d78-766410d723bb"
}
```

#### Respuesta 200

```json
{
  "success": true,
  "message": "URL de subida Word generada exitosamente",
  "data": {
    "uploadUrl": "https://bucket-words.s3.region.amazonaws.com/sesiones/.../....docx?X-Amz-...",
    "key": "sesiones/{usuarioId}/{sesionId}.docx",
    "expiresIn": 600,
    "method": "PUT",
    "contentType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  }
}
```

#### Errores

| Código | Condición |
|--------|-----------|
| **400** | Falta `sesionId` o `usuarioId` → `"Se requieren sesionId y usuarioId"` |
| **403** | La sesión no pertenece a ese usuario |
| **404** | Sesión no encontrada |
| **503** | `"Almacenamiento Word no configurado (AWS_S3_BUCKET_WORDS)"` |

---

## 2. Subir el archivo a S3 (PUT)

El frontend debe hacer un **PUT** a la URL recibida en `data.uploadUrl`.

#### Request

| Dato        | Valor |
|-------------|--------|
| Método      | **PUT** |
| URL         | `data.uploadUrl` (la devuelta en el paso 1) |
| Body        | Binario del archivo .docx (blob/buffer) |
| Content-Type| `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (o el valor de `data.contentType`) |

No se envían más headers de autenticación; la URL ya está firmada.

- Si el **PUT** responde **200** (o 204), seguir al paso 3.
- Si responde **403** o **404**, la URL puede haber expirado; repetir desde el paso 1.

---

## 3. Confirmar subida y guardar URL en la sesión

### `POST /api/sesion/confirmar-upload-word`

Registra en la base de datos la URL del Word y la fecha, para que la sesión quede con `wordUrl` y `wordGeneradoAt`.

#### Headers

| Header       | Valor                 |
|-------------|------------------------|
| Authorization | Bearer \<token Auth0\> |
| Content-Type  | application/json      |

#### Body (JSON)

| Campo     | Tipo   | Requerido | Descripción |
|-----------|--------|-----------|-------------|
| sesionId  | string | Sí        | Mismo que en el paso 1 |
| usuarioId | string | Sí        | Mismo que en el paso 1 |
| key       | string | Sí        | Valor de `data.key` del paso 1 (ej. `sesiones/{usuarioId}/{sesionId}.docx`) |

#### Ejemplo de request

```json
{
  "sesionId": "550e8400-e29b-41d4-a716-446655440000",
  "usuarioId": "fa97b8c9-da76-41d9-8d78-766410d723bb",
  "key": "sesiones/fa97b8c9-da76-41d9-8d78-766410d723bb/550e8400-e29b-41d4-a716-446655440000.docx"
}
```

#### Respuesta 200

```json
{
  "success": true,
  "message": "Sesión actualizada con Word",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "titulo": "...",
    "wordUrl": "https://bucket-words.s3.region.amazonaws.com/sesiones/.../....docx",
    "wordGeneradoAt": "2025-03-13T12:00:00.000Z",
    "nivel": { ... },
    "grado": { ... },
    "problematica": { ... }
  }
}
```

#### Errores

| Código | Condición |
|--------|-----------|
| **400** | Falta `sesionId`, `usuarioId` o `key` → `"Se requieren sesionId, usuarioId y key"` |
| **403** | La sesión no pertenece a ese usuario |
| **404** | Sesión no encontrada |
| **503** | Almacenamiento Word no configurado |

---

## Resumen de contratos (frontend)

| Paso | Método | Ruta / acción | Body |
|------|--------|----------------|------|
| 1    | POST   | `/api/sesion/upload-url-word` | `{ sesionId, usuarioId }` |
| 2    | PUT    | `data.uploadUrl` (S3)         | Binario .docx + header Content-Type |
| 3    | POST   | `/api/sesion/confirmar-upload-word` | `{ sesionId, usuarioId, key }` |

---

## Otros endpoints relacionados

### `GET /api/sesion/:id/download-url-word`

Obtiene una URL prefirmada para **descargar** el Word de la sesión (solo si la sesión tiene `wordUrl`).

- **Params:** `id` = UUID de la sesión.
- **200:** `{ "success": true, "data": { "downloadUrl": "https://...", "expiresIn": 3600 } }`
- **404:** Sesión no encontrada o sesión sin Word generado.

### `DELETE /api/sesion/:id/word`

Elimina el Word de S3 y limpia `wordUrl` y `wordGeneradoAt` de la sesión.

- **Params:** `id` = UUID de la sesión.
- **200:** `{ "success": true, "message": "Word eliminado exitosamente" }`
- **404:** Sesión no encontrada o sesión sin Word.
