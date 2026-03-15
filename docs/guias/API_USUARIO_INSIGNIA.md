# API: Insignia del colegio (Usuario)

Subida de la **foto de la insignia del colegio** del usuario. Se usa **URL prefirmada (S3)**: el frontend no envía base64 ni el archivo al backend; pide una URL, sube directo a S3 y luego confirma para que el backend guarde la URL en `Usuario.insigniaUrl`.

---

## Flujo resumido

1. Frontend: `POST /api/usuario/insignia/upload-url` (opcional: `contentType`) → recibe `uploadUrl`, `key`, `contentType`, `expiresIn`.
2. Frontend: `PUT` del archivo a `uploadUrl` con header `Content-Type` igual al recibido.
3. Frontend: `POST /api/usuario/insignia/confirmar` con `{ key }` → backend guarda la URL en `Usuario.insigniaUrl` y la devuelve.

Todas las rutas requieren **Bearer token** (usuario autenticado). La insignia es siempre del usuario del token.

---

## 1. Solicitar URL de subida

**Request**

```
POST /api/usuario/insignia/upload-url
Authorization: Bearer <token>
Content-Type: application/json

{
  "contentType": "image/jpeg"   // opcional; "image/png" o por defecto image/jpeg
}
```

**Response 200**

```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://...",
    "key": "usuarios/<usuarioId>/insignia.jpg",
    "expiresIn": 600,
    "method": "PUT",
    "contentType": "image/jpeg"
  },
  "message": "URL de subida de insignia generada"
}
```

- **uploadUrl**: URL prefirmada; el cliente debe hacer `PUT` del body binario (la imagen) con header `Content-Type: data.contentType`.
- **key**: Identificador del objeto en S3; se envía en el paso de confirmar.
- **expiresIn**: Segundos hasta que `uploadUrl` expire (ej. 600 = 10 min).

---

## 2. Subir el archivo (cliente → S3)

El frontend hace una sola petición:

```
PUT <uploadUrl>
Content-Type: <el contentType recibido en el paso 1>
Body: archivo binario (imagen)
```

No se llama a ningún endpoint del backend en este paso.

---

## 3. Confirmar subida y guardar URL en el usuario

**Request**

```
POST /api/usuario/insignia/confirmar
Authorization: Bearer <token>
Content-Type: application/json

{
  "key": "usuarios/<usuarioId>/insignia.jpg"
}
```

`key` es el mismo recibido en el paso 1.

**Response 200**

```json
{
  "success": true,
  "data": {
    "insigniaUrl": "https://<bucket>.s3.<region>.amazonaws.com/usuarios/<usuarioId>/insignia.jpg"
  },
  "message": "Insignia guardada correctamente"
}
```

El backend actualiza `Usuario.insigniaUrl` con esa URL. En siguientes lecturas del usuario (GET /api/usuario/:id, perfil, etc.) el campo `insigniaUrl` vendrá poblado.

---

## Errores

| Código | Situación |
|--------|-----------|
| 401 | Sin token o token inválido. |
| 404 | Usuario no encontrado (auth0UserId sin usuario en BD). |
| 400 | En confirmar: falta `key` en el body. |
| 403 | En confirmar: la `key` no corresponde al usuario autenticado (ej. key de otro usuario). |
| 500 | Error interno (S3, BD). |

---

## Borrar o cambiar la insignia

- **Borrar:** el frontend puede usar `PATCH /api/usuario/:id` con `{ "insigniaUrl": null }` (si el token corresponde a ese usuario y la app lo permite).
- **Cambiar:** repetir el flujo 1–2–3; la nueva subida sobrescribe el objeto en S3 (misma key) y se actualiza `insigniaUrl` con la misma URL (el contenido del archivo es el que cambia).

---

## Modelo (Prisma)

En `Usuario`:

- `insigniaUrl String?` — URL pública de la imagen en S3 (null si no ha subido insignia).
