# 📊 Especificaciones para Generación de Gráficos Educativos

## 🎯 GUÍA RÁPIDA: ¿Qué Gráfico Usar?

### Problemas de MULTIPLICACIÓN (grupos repetidos - TODOS IGUALES)
**Ejemplo:** "20 equipos con 6 jugadores CADA UNO"
**Característica clave:** TODOS los grupos tienen la MISMA cantidad
- ✅ **bloques_agrupados**: Visualiza grupos de elementos iguales
- ✅ **operacion_vertical**: Para mostrar la multiplicación 20 × 6 = 120
- ❌ **NO usar barras_comparacion**: No muestra la repetición/multiplicación

### Problemas de SUMA (cantidades DIFERENTES que se juntan)
**Ejemplo:** "3 equipos: uno con 5, otro con 3 y otro con 4 jugadores"
**Característica clave:** Cada grupo tiene DIFERENTE cantidad
- ✅ **barras_comparacion**: Visualiza cantidades diferentes para comparar y sumar
- ✅ **ecuacion_cajas**: Para mostrar 5 + 3 + 4 = 12
- ❌ **NO usar bloques_agrupados**: Solo para grupos iguales

### Problemas de SUMA/RESTA simple
**Ejemplo:** "Tengo 12, regalo 4"
- ✅ **ecuacion_cajas**: 12 - 4 = 8 (con cajas visuales)
- ✅ **recta_numerica**: Saltos en la recta numérica

### Problemas de DIVISIÓN vertical
**Ejemplo:** "24 ÷ 3 = 8"
- ✅ **operacion_vertical**: División en formato tradicional
- ✅ **bloques_agrupados**: 24 elementos divididos en 3 grupos

### Problemas de COMPARACIÓN
**Ejemplo:** "Comparar precios de frutas"
- ✅ **barras_comparacion**: Comparar cantidades
- ✅ **tabla_precios**: Lista de productos con precios

### Problemas de DATOS/ENCUESTAS
**Ejemplo:** "Frutas favoritas de la clase"
- ✅ **tabla_doble_entrada**: Tabla de frecuencias
- ✅ **barras_comparacion**: Gráfico de barras de resultados

### Problemas de FRACCIONES
**Ejemplo:** "3/4 de una pizza"
- ✅ **circulos_fraccion**: Círculos divididos
- ✅ **barras_fraccion**: Barras fraccionadas

---

## ⚠️ Problemas Actuales Detectados

### 1. **Ecuación de Cajas - Estructura Incompleta**
**Problema actual:**
```json
{
    "tipoGrafico": "ecuacion_cajas",
    "elementos": [
        {"tipo": "caja", "valor": "12", "color": "#A8D5FF"},
        {"tipo": "operador", "valor": "-", "color": "#FFB4D6"},
        {"tipo": "numero", "valor": "4"}
    ]
}
```

**Problemas:**
- ❌ Usa `valor` en lugar de `contenido`
- ❌ Falta el signo `=`
- ❌ Falta el resultado o incógnita `?`
- ❌ Usa colores hexadecimales en lugar de nombres del enum
- ❌ El tipo `"numero"` no existe (solo `"caja"` o `"operador"`)

---

## ✅ Estructura Correcta por Tipo de Gráfico

### 1. **ECUACION_CAJAS** (Ecuaciones visuales)

**Campos requeridos:**
```typescript
{
  tipoGrafico: "ecuacion_cajas",
  elementos: [
    {
      tipo: "caja" | "operador",  // SOLO estos dos tipos
      contenido: string,           // NO "valor"
      color?: "azul" | "rojo" | "verde" | "amarillo" | "naranja" | "morado" | "neutro",
      destacado?: boolean          // true para resaltar (resultado/incógnita)
    }
  ],
  agrupaciones?: [                // Opcional: llaves para agrupar
    {
      desde: number,              // Índice del primer elemento
      hasta: number,              // Índice del último elemento
      colorLlave: "azul" | "rojo" | "verde" | "amarillo" | "naranja" | "morado",
      textoAbajo?: string         // Explicación debajo de la llave
    }
  ]
}
```

**Ejemplo CORRECTO - Resta:**
```json
{
  "tipoGrafico": "ecuacion_cajas",
  "elementos": [
    {
      "tipo": "caja",
      "contenido": "12",
      "color": "azul"
    },
    {
      "tipo": "operador",
      "contenido": "-"
    },
    {
      "tipo": "caja",
      "contenido": "4",
      "color": "rojo"
    },
    {
      "tipo": "operador",
      "contenido": "="
    },
    {
      "tipo": "caja",
      "contenido": "?",
      "color": "verde",
      "destacado": true
    }
  ]
}
```

**Ejemplo CORRECTO - Suma:**
```json
{
  "tipoGrafico": "ecuacion_cajas",
  "elementos": [
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
      "contenido": "="
    },
    {
      "tipo": "caja",
      "contenido": "8",
      "color": "verde",
      "destacado": true
    }
  ],
  "agrupaciones": [
    {
      "desde": 0,
      "hasta": 2,
      "colorLlave": "amarillo",
      "textoAbajo": "Frutas que junta María"
    }
  ]
}
```

---

### 2. **TABLA_PRECIOS** (Problemas de compra-venta)

**Problema actual del backend:**
```json
{
  "tipoGrafico": "tabla_precios",
  "elementos": [
    {
      "producto": "Zanahorias",
      "precio": "S/ 2",        // ❌ Debería ser precioUnitario numérico
      "cantidad": "kilos"      // ❌ Debería ser número, no string
    }
  ]
}
```

**Estructura CORRECTA:**
```json
{
  "tipoGrafico": "tabla_precios",
  "elementos": [
    {
      "tipo": "fila",
      "producto": "Zanahorias",
      "precioUnitario": 2,      // ✅ Número
      "cantidad": 5,            // ✅ Número de unidades compradas
      "total": 10,              // ✅ precioUnitario × cantidad
      "icono": "🥕"            // Opcional
    },
    {
      "tipo": "fila",
      "producto": "Tomates",
      "precioUnitario": 3,
      "cantidad": 4,
      "total": 12,
      "icono": "🍅"
    }
  ],
  "moneda": "S/",             // "S/", "$", "€"
  "mostrarTotal": true
}
```

---

### 3. **TABLA_DOBLE_ENTRADA** (Organización de datos)

**Problema actual:**
```json
{
  "tipoGrafico": "tabla_doble_entrada",
  "elementos": [
    {"figura": "Cubos", "cantidad": 3},
    {"figura": "Pirámides", "cantidad": 3}
  ]
}
```

**Estructura CORRECTA (opción 1 - transformación automática):**
```json
{
  "tipoGrafico": "tabla_doble_entrada",
  "elementos": [
    {"figura": "Cubos", "cantidad": 3},
    {"figura": "Pirámides", "cantidad": 3}
  ]
}
```
✅ **Esto funciona** - El frontend lo transforma a tabla simple

**Estructura CORRECTA (opción 2 - completa):**
```json
{
  "tipoGrafico": "tabla_doble_entrada",
  "elementos": [],
  "encabezadosColumnas": ["Lunes", "Martes", "Miércoles"],
  "encabezadosFilas": ["Cubos", "Pirámides", "Cilindros"],
  "datos": [
    [3, 5, 2],
    [4, 3, 6],
    [2, 4, 3]
  ],
  "colorEncabezado": "#10b981"
}
```

---

### 4. **BLOQUES_AGRUPADOS** (Multiplicación visual - grupos repetidos)

**Cuándo usar:**
- Problemas de multiplicación como "20 equipos con 6 jugadores cada uno"
- Problemas de división representada como grupos iguales
- Visualizar agrupaciones o conjuntos

**Estructura CORRECTA:**
```json
{
  "tipoGrafico": "bloques_agrupados",
  "elementos": [],
  "cantidadGrupos": 20,        // Número de grupos (equipos)
  "elementosPorGrupo": 6,      // Elementos en cada grupo (jugadores)
  "icono": "⚽",                // Opcional: emoji o símbolo para representar elementos
  "colorGrupo": "azul",        // Color del borde del grupo
  "colorElementos": "rojo",    // Color de los elementos dentro
  "etiquetaGrupo": "Equipo",   // Opcional: nombre del grupo
  "etiquetaElemento": "Jugador" // Opcional: nombre del elemento
}
```

**Ejemplo CORRECTO - 20 equipos con 6 jugadores:**
```json
{
  "tipoGrafico": "bloques_agrupados",
  "elementos": [],
  "cantidadGrupos": 20,
  "elementosPorGrupo": 6,
  "icono": "👤",
  "colorGrupo": "azul",
  "colorElementos": "rojo",
  "etiquetaGrupo": "Equipo",
  "etiquetaElemento": "Jugador"
}
```

**❌ NO USAR barras_comparacion para multiplicación:**
```json
// ❌ INCORRECTO - No visualiza la multiplicación
{
  "tipoGrafico": "barras_comparacion",
  "elementos": [
    {"etiqueta": "Equipos", "valor": 20, "color": "azul"},
    {"etiqueta": "Jugadores por equipo", "valor": 6, "color": "rojo"}
  ]
}
```

---

## 🎯 Palabras Clave para Detección de Tipo de Problema

### **MULTIPLICACIÓN (Grupos repetidos - TODOS IGUALES)**
Palabras clave en el problema:
- **"cada uno tiene"**, **"cada equipo tiene"**, **"por cada"**, "grupos de"
- **"todos tienen lo mismo"**, "igualmente", "mismo número"
- "veces", "repetir", "total de grupos"
- **IMPORTANTE:** La cantidad por grupo es LA MISMA en todos

**Pregunta clave para detectar:** ¿Todos los grupos tienen la MISMA cantidad?
- **SÍ** → Multiplicación → `bloques_agrupados` o `operacion_vertical`
- **NO** → Suma → `barras_comparacion` o `ecuacion_cajas`

**Acción:** Usar `bloques_agrupados` para visualizar grupos o `operacion_vertical` para la operación matemática

**Ejemplos:**
- ✅ "20 equipos con 6 jugadores CADA UNO" → `bloques_agrupados` (20×6=120)
- ❌ "3 equipos con 5, 3 y 4 jugadores" → `barras_comparacion` (5+3+4=12) NO ES MULTIPLICACIÓN

### **DIVISIÓN (Repartir/Agrupar)**
Palabras clave:
- "repartir", "dividir", "compartir igualmente", "agrupar en"
- "cuántos le tocan a cada", "grupos de", "en partes iguales"

**Acción:** Usar `operacion_vertical` con operación `÷` o `bloques_agrupados` para mostrar la división en grupos

### **RESTA (Separación/Cambio/Pérdida)**
Palabras clave en el problema:
- "le da", "regala", "pierde", "gasta", "quedan"
- "se fue", "se comió", "se rompieron", "restan"
- "cuántos le quedan", "cuántos quedan"

**Acción:** Generar ecuación con operador `-` y resultado con `destacado: true`

### **SUMA (Agregar/Juntar - cantidades DIFERENTES)**
Palabras clave:
- "recibe", "compra", "gana", **"en total"**, "suma"
- "junta", "agrega", "añade", "compra más"
- **"uno tiene X, otro tiene Y"**, "primer equipo tiene X, segundo tiene Y"
- "cuántos tiene en total", "cuántos hay"
- **IMPORTANTE:** Cada elemento tiene DIFERENTE cantidad

**Pregunta clave:** ¿Las cantidades son diferentes?
- **SÍ** → Suma → `barras_comparacion` para visualizar diferencias
- **NO** (todas iguales) → Multiplicación → `bloques_agrupados`

**Acción:** Usar `barras_comparacion` para comparar cantidades o `ecuacion_cajas` con operador `+`

**Ejemplos:**
- ✅ "3 equipos: uno con 5, otro con 3, otro con 4 jugadores" → `barras_comparacion`
- ✅ "María tiene 5 manzanas, Pedro tiene 3" → `barras_comparacion`

### **COMPARACIÓN**
Palabras clave:
- "más que", "menos que", "diferencia"
- "cuántos más tiene", "cuántos menos"

**Acción:** Usar barras de comparación o ecuación según contexto

### **COMPRA-VENTA**
Palabras clave:
- "compra", "vende", "mercado", "precio", "cuesta"
- "paga", "gasta", "dinero", "soles"

**Acción:** Usar `tabla_precios` con cálculos completos

---

## 📝 Checklist para Validación

Antes de enviar un gráfico, verificar:

- [ ] ✅ Campo `tipoGrafico` usa valores del enum
- [ ] ✅ Ecuaciones tienen TODOS los elementos: números, operadores Y resultado
- [ ] ✅ Se usa `contenido` (no `valor`) en ecuación_cajas
- [ ] ✅ Colores usan nombres del enum (no hex): `"azul"`, `"rojo"`, etc.
- [ ] ✅ Tabla de precios tiene `precioUnitario` numérico
- [ ] ✅ Tabla de precios tiene `cantidad` numérica
- [ ] ✅ Resultado/incógnita está marcado con `destacado: true`
- [ ] ✅ Operador `=` está presente en ecuaciones

---

## 🔧 Compatibilidad Actual del Frontend

El frontend **temporalmente acepta**:
- ✅ `valor` → se transforma a `contenido`
- ✅ Colores hexadecimales → se usan directamente
- ✅ Tabla precios con `precio: "S/ 2"` → se extrae el número
- ✅ Tabla doble entrada con solo `elementos` → se transforma

**PERO** es mejor enviar el formato correcto desde el backend para:
- Mejor rendimiento
- Menos transformaciones
- Evitar errores de parsing
- Código más mantenible

---

## 📚 Tipos de Gráfico Disponibles

```typescript
enum TipoGraficoMatematica {
  // Números y operaciones
  ECUACION_CAJAS = "ecuacion_cajas",
  OPERACION_VERTICAL = "operacion_vertical",
  RECTA_NUMERICA = "recta_numerica",
  BLOQUES_AGRUPADOS = "bloques_agrupados",
  
  // Fracciones
  CIRCULOS_FRACCION = "circulos_fraccion",
  BARRAS_FRACCION = "barras_fraccion",
  
  // Datos y estadística
  BARRAS_COMPARACION = "barras_comparacion",
  TABLA_VALORES = "tabla_valores",
  TABLA_DOBLE_ENTRADA = "tabla_doble_entrada",
  
  // Geometría y medidas
  FIGURAS_GEOMETRICAS = "figuras_geometricas",
  MEDIDAS_COMPARACION = "medidas_comparacion",
  
  // Problemas cotidianos
  DIAGRAMA_DINERO = "diagrama_dinero",
  TABLA_PRECIOS = "tabla_precios",
  
  // Otros
  PATRON_VISUAL = "patron_visual",
  DIAGRAMA_VENN = "diagrama_venn"
}
```

---

## 💡 Recomendaciones Finales

1. **Implementar lógica de detección automática:**
   ```python
   def detectar_tipo_operacion(problema: str) -> str:
       palabras_resta = ["le da", "regala", "pierde", "quedan", "gasta"]
       palabras_suma = ["recibe", "compra", "gana", "total", "junta"]
       
       problema_lower = problema.lower()
       
       if any(palabra in problema_lower for palabra in palabras_resta):
           return "resta"
       elif any(palabra in problema_lower for palabra in palabras_suma):
           return "suma"
       return "desconocido"
   ```

2. **Generar ecuaciones completas:**
   - Siempre incluir: número₁ + operador + número₂ + `=` + resultado/`?`
   - Marcar resultado con `destacado: true`

3. **Validar estructura antes de enviar:**
   - Verificar que todos los campos requeridos existan
   - Usar nombres de enum en lugar de hex

4. **Testing:**
   - Probar con problemas de suma, resta, multiplicación
   - Verificar que los gráficos se rendericen correctamente
   - Validar cálculos (total = precioUnitario × cantidad)
