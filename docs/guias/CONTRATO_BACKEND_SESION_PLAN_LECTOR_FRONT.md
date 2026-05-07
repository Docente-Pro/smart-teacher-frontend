# Contrato — Plan Lector para nuevo esquema Front

Contrato actualizado para `POST /api/unidad/generar-sesion-complementaria` cuando `tipo = "Plan Lector"`, alineado al nuevo formato visual de **Experiencia de Lectura** del frontend.

## Endpoint

- **URL:** `POST /api/unidad/generar-sesion-complementaria`
- **Schema request:** `GenerarSesionComplementariaRequest`
- **Schema response:** `SesionComplementariaResponse`

## Cambios incorporados (Plan Lector)

- Se mantiene la respuesta complementaria existente (`titulo`, `recursoNarrativo`, `inicio`, `desarrollo`, `cierre`, etc.).
- Se agrega `formatoFrontPlanLector` con estructura lista para render del nuevo formato en front.
- Para plan lector, el formato front usa momentos `5 + 35 + 5`.
- En request se admite `docente` (opcional) para completar la cabecera.

## Request (Plan Lector)

```json
{
  "nivel": "Primaria",
  "grado": "5to grado",
  "seccion": "A",
  "fecha": "2026-04-01",
  "docente": "Prof. Ana Torres",
  "tipo": "Plan Lector",
  "actividadTitulo": "Leemos y comentamos una leyenda andina",
  "semana": 3,
  "dia": "Miércoles",
  "turno": "mañana",
  "duracionMinutos": 45,
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
  "titulo": "Leemos y comentamos una leyenda andina",
  "tipo": "Plan Lector",
  "propositoSesion": "Desarrollar comprensión lectora y expresión de opiniones sobre el texto leído.",
  "recursoNarrativo": {
    "titulo": "La leyenda del ...",
    "tipo": "leyenda",
    "contenido": "...texto completo...",
    "fuente": "Texto creado para la sesión"
  },
  "inicio": { "...": "..." },
  "desarrollo": { "...": "..." },
  "cierre": { "...": "..." },
  "formatoFrontPlanLector": {
    "datosInformativos": {
      "tituloSesion": "Leemos y comentamos una leyenda andina",
      "area": "Plan lector - Comunicación",
      "docente": "Prof. Ana Torres",
      "fecha": "2026-04-01",
      "gradoSeccion": "5to grado - Sección A"
    },
    "momentos": {
      "inicio": {
        "tiempo": "5 min",
        "descripcion": "..."
      },
      "desarrollo": {
        "tiempo": "35 min",
        "descripcion": "..."
      },
      "cierre": {
        "tiempo": "5 min",
        "descripcion": "..."
      }
    }
  }
}
```

## Reglas de integración Front

- Si `tipo !== "Plan Lector"`, no asumir `formatoFrontPlanLector`.
- Si `tipo === "Plan Lector"`, renderizar preferentemente desde `formatoFrontPlanLector`.
- Mantener fallback con campos legacy (`inicio`, `desarrollo`, `cierre`) por compatibilidad.

## Notas

- El contrato de Tutoría sigue en `docs/CONTRATO_BACKEND_SESION_TUTORIA_FRONT.md`.
- Ambos bloques (`formatoFrontTutoria`, `formatoFrontPlanLector`) son opcionales y no rompen consumidores existentes.
