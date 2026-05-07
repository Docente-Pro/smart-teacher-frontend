# Contrato — Wizard Unidad Secundaria por Areas

Guia funcional para frontend y backend sobre el flujo de creacion de unidad en Secundaria, considerando que el docente puede llevar mas de un area (por ejemplo, Matematica y Tutoria) y varios grados.

Este documento complementa `docs/CONTRATO_BACKEND_UNIDAD_SECUNDARIA_FORMATO.md`.

## Objetivo

Definir un flujo de pasos claro para:

- seleccionar areas y grados que lleva el docente;
- calcular/distribuir sesiones de unidad por area;
- mantener una regla especial para Tutoria (frecuencia semanal);
- generar una unidad consolidada por area con bloques globales y bloques por grado.

## Principios de negocio

- La unidad en Secundaria se genera por area.
- Un docente puede tener una o mas areas asignadas.
- Un docente puede llevar uno o mas grados en la misma area.
- Para areas curriculares (ejemplo: Matematica), el frontend pregunta `totalSesionesUnidad`.
- Para Tutoria, la regla por defecto es una sesion semanal:
  - `totalSesionesUnidad = totalSemanas`.
- La situacion significativa se define a nivel global de la unidad por area.
- Los productos, propositos y secuencia se construyen por grado.
- Competencias transversales siempre:
  - `Se desenvuelve en entornos virtuales generados por las TIC`
  - `Gestiona su aprendizaje de manera autonoma`
- Cada transversal debe tener exactamente 3 criterios.
- Instrumento de evaluacion para este flujo: `Lista de cotejo`.

## Flujo recomendado (paso a paso)

### Paso 1: Perfil docente academico

Frontend registra:

- `areasSeleccionadas[]` (ejemplo: `["Matematica", "Tutoria"]`)
- `gradosPorArea` (ejemplo: Matematica -> `["Segundo Ano", "Tercer Ano", "Cuarto Ano"]`)
- `tieneTutoria` (boolean)
- `gradosTutoria[]` si corresponde

Reglas:

- Si `tieneTutoria = true`, Tutoria debe existir en `areasSeleccionadas`.
- No se generan unidades para areas sin grados asignados.

### Paso 2: Configuracion de carga de sesiones por area

Para cada area seleccionada:

- Si area != Tutoria:
  - preguntar `totalSesionesUnidad` (numero entero).
- Si area == Tutoria:
  - autocompletar `totalSesionesUnidad = totalSemanas`.
  - permitir override opcional solo si negocio lo habilita.

Validaciones sugeridas para area curricular:

- minimo: `totalSemanas`
- maximo: `totalSemanas * 3`

### Paso 3: Distribucion semanal de sesiones

Input:

- `totalSemanas`
- `totalSesionesUnidad`
- `modoDistribucion` (`automatica` o `manual`)

Algoritmo automatico:

- `base = floor(totalSesionesUnidad / totalSemanas)`
- `resto = totalSesionesUnidad % totalSemanas`
- primeras `resto` semanas reciben `base + 1`
- semanas restantes reciben `base`

Ejemplo:

- 8 sesiones en 5 semanas -> `[2, 2, 2, 1, 1]`
- Tutoria con 5 semanas -> `[1, 1, 1, 1, 1]`

### Paso 4: Situacion significativa global por area

Se registra una sola situacion significativa por cada unidad-area.

Ejemplo:

- Matematica: situacion comun para 2do, 3ro y 4to.
- Tutoria: situacion comun para los grados asignados a tutoria.

### Paso 5: Construccion pedagogica por grado

Por cada grado del area:

- producto de unidad por grado;
- propositos de aprendizaje por grado (competencias del area);
- transversales canonicas (2) con 3 criterios cada una;
- secuencia de sesiones por semana segun distribucion aprobada.

### Paso 6: Ensamblado final de formato por area

El backend devuelve una unidad consolidada por area con:

- datos informativos globales;
- componentes globales (situacion, enfoques, instrumento);
- bloques por grado (producto, propositos, transversales, secuencia);
- materiales y bibliografia.

## Contrato de datos sugerido para el wizard

## Request (paso de planificacion por area)

```json
{
  "area": "Matematica",
  "grados": ["Segundo Ano", "Tercer Ano", "Cuarto Ano"],
  "totalSemanas": 5,
  "totalSesionesUnidad": 8,
  "modoDistribucion": "automatica",
  "tieneTutoria": true
}
```

## Response (paso de planificacion por area)

```json
{
  "success": true,
  "area": "Matematica",
  "planificacionSesiones": {
    "totalSemanas": 5,
    "totalSesionesUnidad": 8,
    "sesionesPorSemana": [2, 2, 2, 1, 1],
    "editable": true
  },
  "validaciones": {
    "sumaCorrecta": true,
    "sinSemanasVacias": true
  },
  "warnings": []
}
```

## Request (planificacion para Tutoria)

```json
{
  "area": "Tutoria",
  "grados": ["Segundo Ano"],
  "totalSemanas": 5,
  "modoDistribucion": "automatica"
}
```

## Response (planificacion para Tutoria)

```json
{
  "success": true,
  "area": "Tutoria",
  "planificacionSesiones": {
    "totalSemanas": 5,
    "totalSesionesUnidad": 5,
    "sesionesPorSemana": [1, 1, 1, 1, 1],
    "reglaAplicada": "Tutoria semanal"
  },
  "validaciones": {
    "sumaCorrecta": true,
    "sinSemanasVacias": true
  },
  "warnings": []
}
```

## Reglas de validacion backend (obligatorias)

- `len(sesionesPorSemana) == totalSemanas`
- `sum(sesionesPorSemana) == totalSesionesUnidad`
- cada semana debe tener al menos 1 sesion
- para Tutoria, por defecto `totalSesionesUnidad == totalSemanas`
- transversales exactamente 2 y con 3 criterios cada una
- instrumento de evaluacion igual a `Lista de cotejo`
- materiales de unidad en rango `5..7`

## Decisiones de UX recomendadas (frontend)

- Mostrar un bloque por cada area seleccionada en el paso 2.
- Para Tutoria, bloquear el campo de sesiones y mostrar texto: `1 sesion por semana`.
- Mostrar preview editable de distribucion semanal antes de generar.
- Si el docente ajusta manualmente, recalcular y validar en tiempo real.
- Persistir `planificacionSesiones` por area para auditoria.

## Caso ejemplo completo (docente con dos areas)

- Areas: Matematica y Tutoria.
- Matematica en 2do, 3ro y 4to con 8 sesiones en 5 semanas -> `[2, 2, 2, 1, 1]`.
- Tutoria en 2do con regla semanal en 5 semanas -> `[1, 1, 1, 1, 1]`.
- Resultado: se generan 2 unidades (una por area), cada una con su estructura consolidada por grado.

## Alcance

- Este contrato define la logica de wizard y planificacion.
- El formato de salida final consolidado por area se mantiene en `docs/CONTRATO_BACKEND_UNIDAD_SECUNDARIA_FORMATO.md`.
