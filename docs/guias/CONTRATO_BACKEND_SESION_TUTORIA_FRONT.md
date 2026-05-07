# Contrato — Tutoría para nuevo esquema Front

Contrato actualizado para `POST /api/unidad/generar-sesion-complementaria` cuando `tipo = "Tutoría"`, alineado al nuevo formato visual de sesión tutorial del frontend.

## Endpoint

- **URL:** `POST /api/unidad/generar-sesion-complementaria`
- **Schema request:** `GenerarSesionComplementariaRequest`
- **Schema response:** `SesionComplementariaResponse`

## Cambios incorporados (Tutoría)

- La respuesta mantiene los campos existentes (`titulo`, `propositoSesion`, `inicio`, `desarrollo`, `cierre`, etc.).
- Se agrega `formatoFrontTutoria` con estructura lista para renderizar la plantilla de tutoría del front.
- Para tutoría, el formato front usa momentos `10 + 70 + 10` y un bloque adicional `despuesDeLaHoraTutoria`.
- Se aceptan dos campos opcionales nuevos en request para completar cabecera:
  - `seccion` (ej: `A`)
  - `fecha` (ISO `YYYY-MM-DD`)

## Request (Tutoría)

```json
{
  "nivel": "Secundaria",
  "grado": "3er grado",
  "seccion": "B",
  "fecha": "2026-03-30",
  "tipo": "Tutoría",
  "actividadTitulo": "Reflexionamos sobre el manejo de emociones",
  "semana": 2,
  "dia": "Miércoles",
  "turno": "mañana",
  "duracionMinutos": 90,
  "contextoUnidad": {
    "situacionSignificativa": "...",
    "hiloConductor": "...",
    "productoIntegrador": "...",
    "enfoques": []
  }
}
```

## Response (fragmento relevante para Front)

```json
{
  "titulo": "Reflexionamos sobre el manejo de emociones",
  "tipo": "Tutoría",
  "propositoSesion": "Fortalecer estrategias para reconocer y regular emociones en situaciones escolares.",
  "dimension": "Personal/Social",
  "inicio": { "...": "..." },
  "desarrollo": { "...": "..." },
  "cierre": { "...": "..." },
  "formatoFrontTutoria": {
    "datosInformativos": {
      "tituloSesion": "Reflexionamos sobre el manejo de emociones",
      "area": "Tutoría",
      "nivel": "Secundaria",
      "tutor": "Tutor(a)",
      "gradoSeccion": "3er grado - Sección B",
      "fecha": "2026-03-30",
      "dimension": "Personal/Social",
      "queBuscamos": "Fortalecer estrategias para reconocer y regular emociones en situaciones escolares.",
      "materiales": [
        "Tarjetas de emociones",
        "Papelotes",
        "Plumones"
      ]
    },
    "momentos": {
      "presentacion": {
        "tiempo": "10 min",
        "descripcion": "..."
      },
      "desarrollo": {
        "tiempo": "70 min",
        "descripcion": "..."
      },
      "cierre": {
        "tiempo": "10 min",
        "descripcion": "..."
      },
      "despuesDeLaHoraTutoria": {
        "tiempo": "Seguimiento semanal",
        "descripcion": "..."
      }
    }
  }
}
```

## Reglas de integración Front

- Si `tipo !== "Tutoría"`, no asumir `formatoFrontTutoria`.
- Si `tipo === "Tutoría"`, renderizar desde `formatoFrontTutoria` (preferente) para evitar transformar `inicio/desarrollo/cierre` en cliente.
- Mantener compatibilidad: si por alguna razón no llega `formatoFrontTutoria`, usar fallback con los campos legacy (`inicio`, `desarrollo`, `cierre`).

## Notas

- El contrato de Plan Lector no cambia con este documento.
- El backend conserva la respuesta completa de sesión complementaria para no romper integraciones previas.
