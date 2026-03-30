# Frontend Onboarding: guardar Tutoría y Plan Lector

Este documento define **cómo debe guardar el frontend** las asignaciones del docente en secundaria para que el paso 0 de unidad funcione con IDs (`gradoId`, `areaId`).

## Regla clave

Tutoría y Plan Lector **se guardan igual que cualquier área**: como filas en `UsuarioGradoArea`.

No existe un campo especial tipo `usuario.esTutor`.

## Flujo recomendado (frontend)

1. Obtener catálogo de áreas:
   - `GET /api/area`
2. Resolver IDs por nombre:
   - buscar `Tutoría` y `Plan Lector` en la respuesta
3. Construir `asignaciones` del onboarding:
   - incluir materia(s) + Tutoría/Plan Lector según checks del usuario
4. Guardar con:
   - `POST /api/usuario/:id/configurar-grados` (onboarding completo), o
   - `POST /api/usuario/:id/grados-areas` (solo asignaciones)

## Payload esperado

`configurar-grados`:

```json
{
  "asignaciones": [
    { "gradoId": 7, "areaId": 5 },
    { "gradoId": 8, "areaId": 5 },
    { "gradoId": 8, "areaId": 15 },
    { "gradoId": 9, "areaId": 16 }
  ],
  "secciones": [
    { "gradoId": 7, "nivelId": 3, "secciones": ["A"] },
    { "gradoId": 8, "nivelId": 3, "secciones": ["A", "B"] },
    { "gradoId": 9, "nivelId": 3, "secciones": ["A"] }
  ]
}
```

Donde:
- `areaId: 5` es ejemplo de Matemática.
- `areaId: 15` es ejemplo de Tutoría.
- `areaId: 16` es ejemplo de Plan Lector.
- **No hardcodear** esos números: siempre resolver desde `GET /api/area`.

## Validación mínima sugerida en frontend

- Si el usuario marcó "Soy tutor" en un grado, debe agregarse una asignación con `areaId` de `Tutoría`.
- Si marcó "Plan lector" en un grado, debe agregarse asignación con `areaId` de `Plan Lector`.
- Evitar duplicados exactos (`gradoId` + `areaId`) antes de enviar.

## Lectura para paso 0 de unidad

Para mostrar opciones de área/grado del docente autenticado:

- `GET /api/usuario/me/grados-areas`

Respuesta incluye:
- `data`: filas completas con `gradoId` y `areaId`.
- `resumenParaUnidad`: arreglo plano listo para UI.

## Migración requerida en BD

Asegurarse de tener aplicada la migración:

- `prisma/migrations/20260329120000_add_area_tutoria_plan_lector/migration.sql`

Sin estas filas en `Area`, frontend no puede persistir Tutoría/Plan Lector por ID.
