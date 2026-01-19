# 📊 Gráfico: Balanza de Equilibrio

## Tipo de Gráfico
`balanza_equilibrio`

## Descripción
Representación visual de una balanza con cubos de colores en ambos lados, ideal para enseñar conceptos de igualdad, equilibrio matemático y ecuaciones simples de forma concreta y visual.

## Cuándo Usar
- Introducir el concepto de igualdad (=)
- Problemas donde se debe "completar para equilibrar"
- Ecuaciones simples con representación concreta
- Grados 1° a 4° - conceptos iniciales de balance matemático
- Transición de lo concreto a lo simbólico

## Palabras Clave para Activación
Cuando el problema mencione:
- "equilibrio"
- "balanza"
- "igual peso"
- "en balance"
- "completar la igualdad"
- "mismo peso"
- "iguales"
- "¿por qué está equilibrada?"
- "para que se equilibre"

## Estructura JSON

### Ejemplo 1: Igualdad Simple (7 = 7)
```json
{
  "tipoGrafico": "balanza_equilibrio",
  "ladoIzquierdo": {
    "tipo": "lado",
    "cantidad": 7,
    "color": "azul",
    "etiqueta": "7 cubos azules",
    "representacion": "7"
  },
  "ladoDerecho": {
    "tipo": "lado",
    "cantidad": 7,
    "color": "naranja",
    "etiqueta": "7 cubos naranjas",
    "representacion": "7"
  },
  "estado": "equilibrio",
  "mostrarEcuacion": true,
  "pregunta": "¿Cuántos cubos hay en cada lado de la balanza?"
}
```

### Ejemplo 2: Igualdad con Suma (7 = 2 + 5)
```json
{
  "tipoGrafico": "balanza_equilibrio",
  "ladoIzquierdo": {
    "tipo": "lado",
    "cantidad": 7,
    "color": "azul",
    "etiqueta": "7 cubos",
    "representacion": "7"
  },
  "ladoDerecho": {
    "tipo": "lado",
    "cantidad": 7,
    "color": "verde",
    "etiqueta": "2 + 5 cubos",
    "representacion": "2 + 5"
  },
  "estado": "equilibrio",
  "mostrarEcuacion": true,
  "pregunta": "Si la balanza está en equilibrio, ¿cuánto es 2 + 5?"
}
```

### Ejemplo 3: Completar para Equilibrar (? + 3 = 8)
```json
{
  "tipoGrafico": "balanza_equilibrio",
  "ladoIzquierdo": {
    "tipo": "lado",
    "cantidad": 5,
    "color": "azul",
    "etiqueta": "? + 3 cubos",
    "representacion": "? + 3"
  },
  "ladoDerecho": {
    "tipo": "lado",
    "cantidad": 8,
    "color": "verde",
    "etiqueta": "8 cubos",
    "representacion": "8"
  },
  "estado": "equilibrio",
  "mostrarEcuacion": true,
  "pregunta": "¿Cuántos cubos faltan para equilibrar la balanza?"
}
```

### Ejemplo 4: Balanza Desequilibrada (10 > 6)
```json
{
  "tipoGrafico": "balanza_equilibrio",
  "ladoIzquierdo": {
    "tipo": "lado",
    "cantidad": 10,
    "color": "rojo",
    "etiqueta": "10 cubos",
    "representacion": "10"
  },
  "ladoDerecho": {
    "tipo": "lado",
    "cantidad": 6,
    "color": "amarillo",
    "etiqueta": "6 cubos",
    "representacion": "6"
  },
  "estado": "inclinada_izquierda",
  "mostrarEcuacion": true,
  "pregunta": "¿Por qué la balanza no está en equilibrio?"
}
```

### Ejemplo 5: Problema Sin Resolver (cantidad = 0)
**Uso pedagógico**: Mostrar el problema antes de que el estudiante lo resuelva
```json
{
  "tipoGrafico": "balanza_equilibrio",
  "ladoIzquierdo": {
    "tipo": "lado",
    "cantidad": 5,
    "color": "azul",
    "etiqueta": "5 cubos"
  },
  "ladoDerecho": {
    "tipo": "lado",
    "cantidad": 0,
    "color": "naranja",
    "etiqueta": "cubos de colores"
  },
  "estado": "inclinada_izquierda",
  "mostrarEcuacion": true,
  "pregunta": "¿Cuántos cubos necesitamos en el lado derecho?"
}
```
**Nota**: Este ejemplo muestra el problema sin resolver. En el gráfico de operación (solución), se mostraría con `cantidad: 5` en ambos lados y `estado: "equilibrio"`.

## Propiedades Detalladas

### `ladoIzquierdo` y `ladoDerecho` (LadoBalanza)
| Propiedad | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| `tipo` | `"lado"` | ✅ | Siempre debe ser "lado" |
| `cantidad` | `number` | ✅ | Número de cubos (0-20). Usar 0 para problemas sin resolver |
| `color` | `"azul" \| "naranja" \| "rojo" \| "verde" \| "amarillo" \| "morado"` | ✅ | Color de los cubos |
| `etiqueta` | `string` | ❌ | Texto descriptivo ("7 cubos", "2 + 5", "cubos de colores") |
| `representacion` | `string` | ❌ | Expresión matemática ("7", "2 + 5", "?") |

### `estado` (EstadoBalanza)
| Valor | Cuándo usar | Visual |
|-------|-------------|--------|
| `"equilibrio"` | Ambos lados tienen la misma cantidad | Balanza horizontal ⚖️ |
| `"inclinada_izquierda"` | Lado izquierdo tiene más cubos | Baja a la izquierda ⚖️ ↙️ |
| `"inclinada_derecha"` | Lado derecho tiene más cubos | Baja a la derecha ⚖️ ↘️ |

### Otras Propiedades
| Propiedad | Tipo | Obligatorio | Default | Descripción |
|-----------|------|-------------|---------|-------------|
| `mostrarEcuacion` | `boolean` | ❌ | `true` | Mostrar ecuación debajo de la balanza |
| `pregunta` | `string` | ❌ | - | Pregunta pedagógica arriba del gráfico |

## Reglas de Generación

### Cálculo Automático del Estado
```typescript
function calcularEstado(ladoIzq: number, ladoDer: number): EstadoBalanza {
  if (ladoIzq === ladoDer) return "equilibrio";
  if (ladoIzq > ladoDer) return "inclinada_izquierda";
  return "inclinada_derecha";
}
```

### Cantidades Recomendadas
- **Mínimo**: 0 cubos (para representar problemas sin resolver)
- **Máximo recomendado**: 20 cubos por lado (visualización óptima)
- **Ideal para primaria**: 5-15 cubos por lado
- **Uso de 0**: Útil para mostrar el problema antes de la solución

### Colores Sugeridos
- Usar **colores diferentes** en cada lado para facilitar la diferenciación
- Colores primarios para grados bajos (1°-2°)
- Puede combinar colores en el mismo lado para representar sumas

## Ejemplos de Uso Pedagógico

### Secuencia Didáctica
1. **Vivencial**: Usar balanza real con objetos concretos
2. **Gráfica**: Mostrar este gráfico digital
3. **Simbólica**: Escribir la ecuación (7 = 2 + 5)

### Progresión por Grados
| Grado | Tipo de Problema | Ejemplo |
|-------|------------------|---------|
| 1° | Igualdad simple | 5 = 5 |
| 2° | Suma básica | 8 = 3 + 5 |
| 3° | Completar | ? + 4 = 10 |
| 4° | Ecuaciones | 2 + ? = 9 |

## Competencias y Capacidades

### Competencia
Resuelve problemas de cantidad

### Capacidades
- Traduce cantidades a expresiones numéricas
- Comunica su comprensión sobre los números y las operaciones
- Usa estrategias y procedimientos de estimación y cálculo

## Validaciones

### Obligatorias
- ✅ `ladoIzquierdo.cantidad` >= 0
- ✅ `ladoDerecho.cantidad` >= 0
- ✅ Colores válidos del catálogo
- ✅ Estado coherente con las cantidades
- ✅ Propiedades `ladoIzquierdo`, `ladoDerecho` y `estado` presentes

### Recomendaciones
- Si `estado` = "equilibrio", las cantidades deben ser iguales
- Si las cantidades son diferentes, el estado debe ser "inclinada_izquierda" o "inclinada_derecha"
- Usar `pregunta` para contextualizar el problema
- `representacion` puede incluir "?" para indicar valor desconocido

## Notas de Implementación
- El gráfico usa **Rough.js** para el estilo hand-drawn
- Los cubos se apilan automáticamente en filas de 5
- La inclinación es visual (no representa peso real)
- Funciona en modo claro y oscuro

## Fecha de Implementación
11 de enero de 2026
