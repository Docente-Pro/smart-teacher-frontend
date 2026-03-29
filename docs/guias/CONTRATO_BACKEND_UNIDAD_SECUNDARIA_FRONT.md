# Contrato — Unidad Secundaria (Formato Front)

Contrato para el render del nuevo formato de **Unidad de Aprendizaje Secundaria** en frontend.

## Objetivo

Definir la estructura del payload que el frontend espera para renderizar el formato de secundaria (plantilla nueva), especialmente en:

- `/unidad-result-secundaria-prueba` (validación visual)
- futuro `/unidad-result-secundaria` (data real)

## Estructura de respuesta

```json
{
  "success": true,
  "formato": {
    "datosInformativos": {
      "numeroUnidad": 1,
      "titulo": "Modelamos situaciones...",
      "institucionEducativa": "I.E. ...",
      "director": "Nombre",
      "subdirector": "Nombre",
      "nivel": "Secundaria",
      "area": "Matemática",
      "grado": "Segundo Año, Tercer Año, Cuarto Año",
      "secciones": "A, B",
      "docente": "Nombre",
      "duracion": 5
    },
    "componentes": {
      "planteamientoSituacionSignificativa": "Texto...",
      "productoUnidadAprendizajePorGrado": [
        { "grado": "Segundo Año", "producto": "..." }
      ],
      "enfoquesTransversales": [
        { "enfoque": "...", "valor": "...", "actitudes": "..." }
      ],
      "instrumentoEvaluacion": "Lista de cotejo",
      "propositosAprendizajePorGrado": [
        {
          "grado": "Segundo Año",
          "area": "Matemática",
          "competencias": [
            {
              "competenciaCapacidades": {
                "competencia": "...",
                "capacidades": ["...", "..."]
              },
              "estandar": "...",
              "actividades": ["...", "..."],
              "campoTematico": "...",
              "criteriosEvaluacion": ["...", "..."],
              "instrumentoEvaluacion": "Lista de cotejo"
            }
          ]
        }
      ],
      "competenciasTransversalesPorGrado": [
        {
          "grado": "Segundo Año",
          "competencias": [
            {
              "competenciaCapacidades": {
                "competencia": "...",
                "capacidades": ["...", "..."]
              },
              "estandarCiclo": "...",
              "criterios": ["...", "..."]
            }
          ]
        }
      ],
      "secuenciaSesionesPorGrado": {
        "totalSemanas": 5,
        "grados": {
          "Segundo Año": {
            "1": ["Sesión A", "Sesión B"],
            "2": ["Sesión C"]
          }
        }
      },
      "recursosMaterialesDidacticos": ["...", "..."],
      "bibliografia": ["...", "..."]
    }
  },
  "observaciones": []
}
```

## Reglas de render en frontend

- `datosInformativos` llena bloque **I. Datos informativos**.
- `componentes.planteamientoSituacionSignificativa` llena **2.1**.
- `componentes.productoUnidadAprendizajePorGrado[]` llena **2.2** (tabla por grado).
- `componentes.enfoquesTransversales[]` llena **2.3**.
- `componentes.instrumentoEvaluacion` llena **2.4**.
- `componentes.propositosAprendizajePorGrado[]` llena **2.5** (una tabla por grado).
- `componentes.competenciasTransversalesPorGrado[]` llena **2.6** (una tabla por grado).
- `componentes.secuenciaSesionesPorGrado` llena **2.7** (semanas x grados).
- `componentes.recursosMaterialesDidacticos[]` llena **III**.
- `componentes.bibliografia[]` llena **IV**.

## Campos obligatorios recomendados

Para evitar celdas vacías en documento final:

- `datosInformativos.numeroUnidad`
- `datosInformativos.titulo`
- `datosInformativos.nivel`
- `datosInformativos.area`
- `datosInformativos.duracion`
- `componentes.planteamientoSituacionSignificativa`
- `componentes.instrumentoEvaluacion`
- `componentes.propositosAprendizajePorGrado`
- `componentes.competenciasTransversalesPorGrado`
- `componentes.secuenciaSesionesPorGrado.totalSemanas`
- `componentes.secuenciaSesionesPorGrado.grados`

## Compatibilidad

- Este contrato aplica solo al **formato secundaria**.
- El flujo actual de primaria (`/unidad-result`) se mantiene sin cambios.
