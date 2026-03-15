# API: Admin — Rellenar lista de alumnos en una sesión

Endpoint para que un **admin** verifique si una sesión tiene lista de alumnos (`contenido.listaAlumnos`) y, si no la tiene, la rellene desde las Aulas del docente o desde otra sesión del mismo usuario. Solo administradores (rol Auth0 `Admin`).

Base: **`/api/admin`**  
Autenticación: **Bearer token** con rol **Admin**.

---

## POST /api/admin/sesion/:sesionId/rellenar-lista-alumnos

Verifica si la sesión indicada tiene una lista de alumnos en `contenido.listaAlumnos`.  
Si **no** la tiene, la rellena con:

1. Alumnos de las **Aulas** del docente (tabla `Alumno`, aulas del `usuarioId` de la sesión), o  
2. Si no hay alumnos en aulas, la lista de **otra sesión** del mismo usuario que ya tenga `listaAlumnos`.

Además, si la sesión tenía PDF generado, se **invalida** (se borra de S3 y se pone `pdfUrl`/`pdfGeneradoAt` a `null`) para que el docente pueda regenerarlo con la lista actualizada.

### Parámetros de ruta

| Parámetro | Tipo   | Descripción   |
|-----------|--------|---------------|
| sesionId  | string | UUID de la sesión |

### Body

No se envía body. Solo `POST` con `sesionId` en la URL.

### Respuesta 200 — Sesión ya tenía lista

Si la sesión ya tenía `contenido.listaAlumnos` con al menos un alumno, no se modifica nada:

```json
{
  "success": true,
  "message": "La sesión ya tiene lista de alumnos; no se realizaron cambios.",
  "data": {
    "sesionId": "uuid-de-la-sesion",
    "titulo": "Título de la sesión",
    "yaTeníaLista": true,
    "cantidadAlumnos": 25
  }
}
```

### Respuesta 200 — Lista rellenada

Si la sesión no tenía lista y se pudo obtener desde Aulas u otra sesión:

```json
{
  "success": true,
  "message": "Lista de alumnos rellenada en la sesión. PDF invalidado para que el docente lo regenere.",
  "data": {
    "sesionId": "uuid-de-la-sesion",
    "titulo": "Título de la sesión",
    "yaTeníaLista": false,
    "cantidadAlumnos": 30,
    "pdfInvalidado": true
  }
}
```

### Errores

| Código | Mensaje / Condición |
|--------|----------------------|
| **404** | "Sesión no encontrada" — `sesionId` no existe. |
| **400** | "No hay lista de alumnos para rellenar. Agregue alumnos a un aula del docente (POST /api/aula/:aulaId/alumnos) o use primero propagar lista por usuario (POST /api/admin/usuario/:usuarioId/propagar-lista-alumnos)." — El docente no tiene alumnos en aulas ni ninguna otra sesión con lista. |
| **500** | Error interno (mensaje en `message`). |

### Contrato de `data` (éxito)

| Campo             | Tipo    | Descripción |
|-------------------|---------|-------------|
| sesionId          | string  | UUID de la sesión. |
| titulo            | string  | Título de la sesión. |
| yaTeníaLista      | boolean | `true` si ya tenía lista (no se cambió nada); `false` si se rellenó. |
| cantidadAlumnos   | number  | Número de alumnos en la lista (actual o recién asignada). |
| pdfInvalidado    | boolean | Solo presente cuando `yaTeníaLista === false`. `true` indica que el PDF fue invalidado para regeneración. |

### Ejemplo de uso (frontend)

```http
POST /api/admin/sesion/550e8400-e29b-41d4-a716-446655440000/rellenar-lista-alumnos
Authorization: Bearer <token_admin>
Content-Type: application/json
```

Sin body. La respuesta indica si se rellenó la lista o si ya estaba completa.
