# 📡 Guía para el Backend: Envío de Datos con Agrupaciones

## 🎯 Objetivo

Esta guía explica cómo el backend debe estructurar los datos para enviar ecuaciones con agrupaciones al frontend.

---

## 📦 Estructura JSON Completa

```json
{
  "tipoGrafico": "ecuacion_cajas",
  "elementos": [
    {
      "tipo": "caja",
      "contenido": "4",
      "color": "azul"
    },
    {
      "tipo": "operador",
      "contenido": "×"
    },
    {
      "tipo": "caja",
      "contenido": "5",
      "color": "azul"
    },
    {
      "tipo": "operador",
      "contenido": "+"
    },
    {
      "tipo": "caja",
      "contenido": "3",
      "color": "azul"
    },
    {
      "tipo": "operador",
      "contenido": "×"
    },
    {
      "tipo": "caja",
      "contenido": "2",
      "color": "azul"
    },
    {
      "tipo": "operador",
      "contenido": "="
    },
    {
      "tipo": "caja",
      "contenido": "26",
      "color": "verde",
      "destacado": true
    }
  ],
  "agrupaciones": [
    {
      "desde": 0,
      "hasta": 2,
      "colorLlave": "verde",
      "textoAbajo": "Paso 1: 4 × 5 = 20"
    },
    {
      "desde": 4,
      "hasta": 6,
      "colorLlave": "naranja",
      "textoAbajo": "Paso 2: 3 × 2 = 6"
    }
  ]
}
```

---

## 🔍 Explicación Detallada

### 1. Campo `tipoGrafico`
```json
"tipoGrafico": "ecuacion_cajas"
```
- **Tipo:** String
- **Valor:** Siempre debe ser `"ecuacion_cajas"`
- **Obligatorio:** Sí

### 2. Campo `elementos`
```json
"elementos": [
  { "tipo": "caja", "contenido": "4", "color": "azul" },
  { "tipo": "operador", "contenido": "×" }
]
```

#### Propiedades de cada elemento:

| Campo | Tipo | Valores | Obligatorio | Descripción |
|-------|------|---------|-------------|-------------|
| `tipo` | String | `"caja"` \| `"operador"` | ✅ Sí | Tipo de elemento |
| `contenido` | String | Cualquier texto | ✅ Sí | Contenido a mostrar |
| `color` | String | Ver tabla de colores | ❌ No (solo cajas) | Color de la caja |
| `destacado` | Boolean | `true` \| `false` | ❌ No | Si la caja debe destacarse |

#### Tabla de Colores Disponibles:

| Color | Valor | Código Hex |
|-------|-------|------------|
| Azul | `"azul"` | #4A90E2 |
| Rojo | `"rojo"` | #E24A4A |
| Amarillo | `"amarillo"` | #F5D547 |
| Verde | `"verde"` | #7ED321 |
| Naranja | `"naranja"` | #F5A623 |
| Morado | `"morado"` | #BD10E0 |
| Neutro | `"neutro"` | #2C3E50 |

> **Nota:** También puedes enviar colores hexadecimales directamente: `"color": "#FF5733"`

### 3. Campo `agrupaciones` (NUEVO - Opcional)
```json
"agrupaciones": [
  {
    "desde": 0,
    "hasta": 2,
    "colorLlave": "verde",
    "textoAbajo": "Paso 1: 4 × 5 = 20"
  }
]
```

#### Propiedades de cada agrupación:

| Campo | Tipo | Descripción | Obligatorio | Ejemplo |
|-------|------|-------------|-------------|---------|
| `desde` | Number | Índice del primer elemento a agrupar (0-based) | ✅ Sí | `0` |
| `hasta` | Number | Índice del último elemento a agrupar (0-based, inclusivo) | ✅ Sí | `2` |
| `colorLlave` | String | Color de la llave (ver tabla de colores) | ✅ Sí | `"verde"` |
| `textoAbajo` | String | Texto explicativo debajo de la llave | ❌ No | `"Paso 1: 4 × 5 = 20"` |

---

## 📊 Ejemplos de Casos de Uso

### Caso 1: Operación Simple (Sin Agrupaciones)
```json
{
  "tipoGrafico": "ecuacion_cajas",
  "elementos": [
    { "tipo": "caja", "contenido": "8", "color": "azul" },
    { "tipo": "operador", "contenido": "+" },
    { "tipo": "caja", "contenido": "7", "color": "azul" },
    { "tipo": "operador", "contenido": "=" },
    { "tipo": "caja", "contenido": "15", "color": "verde", "destacado": true }
  ]
}
```
> **Nota:** El campo `agrupaciones` puede omitirse completamente

### Caso 2: Múltiples Operaciones con Pasos
```json
{
  "tipoGrafico": "ecuacion_cajas",
  "elementos": [
    { "tipo": "caja", "contenido": "4", "color": "azul" },
    { "tipo": "operador", "contenido": "×" },
    { "tipo": "caja", "contenido": "5", "color": "azul" },
    { "tipo": "operador", "contenido": "+" },
    { "tipo": "caja", "contenido": "3", "color": "azul" },
    { "tipo": "operador", "contenido": "×" },
    { "tipo": "caja", "contenido": "2", "color": "azul" },
    { "tipo": "operador", "contenido": "=" },
    { "tipo": "caja", "contenido": "26", "color": "verde", "destacado": true }
  ],
  "agrupaciones": [
    {
      "desde": 0,
      "hasta": 2,
      "colorLlave": "verde",
      "textoAbajo": "Paso 1: 4 × 5 = 20"
    },
    {
      "desde": 4,
      "hasta": 6,
      "colorLlave": "naranja",
      "textoAbajo": "Paso 2: 3 × 2 = 6"
    }
  ]
}
```

### Caso 3: Agrupación de Suma
```json
{
  "tipoGrafico": "ecuacion_cajas",
  "elementos": [
    { "tipo": "caja", "contenido": "15", "color": "azul" },
    { "tipo": "operador", "contenido": "+" },
    { "tipo": "caja", "contenido": "23", "color": "azul" },
    { "tipo": "operador", "contenido": "+" },
    { "tipo": "caja", "contenido": "12", "color": "azul" },
    { "tipo": "operador", "contenido": "=" },
    { "tipo": "caja", "contenido": "50", "color": "verde", "destacado": true }
  ],
  "agrupaciones": [
    {
      "desde": 0,
      "hasta": 4,
      "colorLlave": "morado",
      "textoAbajo": "Suma todos los números: 15 + 23 + 12 = 50"
    }
  ]
}
```

### Caso 4: Orden de Operaciones
```json
{
  "tipoGrafico": "ecuacion_cajas",
  "elementos": [
    { "tipo": "caja", "contenido": "2", "color": "azul" },
    { "tipo": "operador", "contenido": "×" },
    { "tipo": "operador", "contenido": "(" },
    { "tipo": "caja", "contenido": "6", "color": "rojo" },
    { "tipo": "operador", "contenido": "+" },
    { "tipo": "caja", "contenido": "4", "color": "rojo" },
    { "tipo": "operador", "contenido": ")" },
    { "tipo": "operador", "contenido": "=" },
    { "tipo": "caja", "contenido": "20", "color": "verde", "destacado": true }
  ],
  "agrupaciones": [
    {
      "desde": 3,
      "hasta": 5,
      "colorLlave": "rojo",
      "textoAbajo": "Primero: 6 + 4 = 10"
    }
  ]
}
```

---

## ⚠️ Consideraciones Importantes

### 1. **Índices (Zero-based)**
```json
// Elementos:  [0]   [1]   [2]   [3]   [4]
//             "4"   "×"   "5"   "+"   "3"

// Para agrupar "4 × 5":
{
  "desde": 0,  // Elemento en posición 0 ("4")
  "hasta": 2   // Elemento en posición 2 ("5") - INCLUSIVO
}
```

### 2. **Índices Inclusivos**
- `desde` y `hasta` son **inclusivos**
- Si `desde: 0, hasta: 2` agrupa los elementos en índices **0, 1 y 2**

### 3. **Múltiples Agrupaciones**
- Puedes tener múltiples agrupaciones en el mismo gráfico
- Las agrupaciones pueden superponerse visualmente (el frontend las dibuja todas)
- No hay límite en el número de agrupaciones

### 4. **Textos Explicativos**
- El campo `textoAbajo` es opcional pero muy recomendado
- Puede contener cualquier texto explicativo
- Se recomienda mantenerlo corto (máx. 40 caracteres) para mejor visualización

### 5. **Colores**
- Usa colores diferentes para agrupaciones distintas para mejor distinción visual
- El color de la llave NO tiene que coincidir con el color de las cajas

---

## 🧪 Validación de Datos

### Validaciones que el Backend Debe Realizar:

```python
# Pseudo-código de validación

def validar_ecuacion_cajas(data):
    # 1. Verificar campo obligatorio
    if not data.get("tipoGrafico"):
        raise Error("Campo 'tipoGrafico' es obligatorio")
    
    if data["tipoGrafico"] != "ecuacion_cajas":
        raise Error("tipoGrafico debe ser 'ecuacion_cajas'")
    
    # 2. Verificar elementos
    if not data.get("elementos") or len(data["elementos"]) == 0:
        raise Error("Debe haber al menos un elemento")
    
    for elem in data["elementos"]:
        if elem.get("tipo") not in ["caja", "operador"]:
            raise Error("Tipo de elemento inválido")
        
        if not elem.get("contenido"):
            raise Error("Campo 'contenido' es obligatorio")
    
    # 3. Verificar agrupaciones (si existen)
    if data.get("agrupaciones"):
        max_index = len(data["elementos"]) - 1
        
        for agrup in data["agrupaciones"]:
            # Verificar índices
            if agrup.get("desde") is None or agrup.get("hasta") is None:
                raise Error("Campos 'desde' y 'hasta' son obligatorios")
            
            # Verificar que los índices estén dentro del rango
            if agrup["desde"] < 0 or agrup["hasta"] > max_index:
                raise Error(f"Índices fuera de rango (0-{max_index})")
            
            # Verificar que 'desde' <= 'hasta'
            if agrup["desde"] > agrup["hasta"]:
                raise Error("'desde' debe ser <= 'hasta'")
            
            # Verificar color
            if not agrup.get("colorLlave"):
                raise Error("Campo 'colorLlave' es obligatorio")
    
    return True
```

---

## 📋 Plantilla de Respuesta API

### Endpoint Ejemplo: `/api/graficos/ecuacion-cajas`

**Request:**
```http
POST /api/graficos/ecuacion-cajas
Content-Type: application/json

{
  "operacion": "4 × 5 + 3 × 2",
  "mostrarPasos": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tipoGrafico": "ecuacion_cajas",
    "elementos": [
      { "tipo": "caja", "contenido": "4", "color": "azul" },
      { "tipo": "operador", "contenido": "×" },
      { "tipo": "caja", "contenido": "5", "color": "azul" },
      { "tipo": "operador", "contenido": "+" },
      { "tipo": "caja", "contenido": "3", "color": "azul" },
      { "tipo": "operador", "contenido": "×" },
      { "tipo": "caja", "contenido": "2", "color": "azul" },
      { "tipo": "operador", "contenido": "=" },
      { "tipo": "caja", "contenido": "26", "color": "verde", "destacado": true }
    ],
    "agrupaciones": [
      {
        "desde": 0,
        "hasta": 2,
        "colorLlave": "verde",
        "textoAbajo": "Paso 1: 4 × 5 = 20"
      },
      {
        "desde": 4,
        "hasta": 6,
        "colorLlave": "naranja",
        "textoAbajo": "Paso 2: 3 × 2 = 6"
      }
    ]
  }
}
```

---

## 🔄 Migración de Datos Existentes

Si tienes datos existentes sin agrupaciones:

### ✅ Forma Correcta (Agregar agrupaciones sin romper lo existente)
```json
{
  "tipoGrafico": "ecuacion_cajas",
  "elementos": [...],  // Elementos existentes
  "agrupaciones": []   // Array vacío o simplemente omitir el campo
}
```

### ❌ No Hacer
```json
{
  "tipoGrafico": "ecuacion_cajas",
  "elementos": [...],
  "agrupaciones": null  // Evitar null, mejor omitir o array vacío
}
```

---

## 📞 Soporte y Preguntas

Si tienes dudas sobre la implementación:

1. Revisa los ejemplos en: `src/features/graficos-educativos/presentation/examples/`
2. Consulta el documento de actualización: `ACTUALIZACION_ECUACION_CAJAS_AGRUPACIONES.md`
3. Prueba con el componente de test: `TestEcuacionCajasAgrupaciones.tsx`

---

**Última actualización:** 10 de enero de 2026  
**Versión del Frontend:** Compatible con agrupaciones desde esta actualización
