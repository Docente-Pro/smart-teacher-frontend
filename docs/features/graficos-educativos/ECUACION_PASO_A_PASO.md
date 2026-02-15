# 📐 Ecuaciones con Resolución Paso a Paso (Actualización Final)

## 🎯 Cambio Importante

El componente `EcuacionCajas` ahora soporta **resolución paso a paso en filas verticales**, no solo llaves con texto explicativo.

---

## 📊 Estructura Completa del Backend

```json
{
  "tipoGrafico": "ecuacion_cajas",
  "elementos": [
    { "tipo": "caja", "contenido": "4", "color": "azul" },
    { "tipo": "operador", "contenido": "×" },
    { "tipo": "caja", "contenido": "3", "color": "azul" },
    { "tipo": "operador", "contenido": "+" },
    { "tipo": "caja", "contenido": "5", "color": "azul" },
    { "tipo": "operador", "contenido": "×" },
    { "tipo": "caja", "contenido": "2", "color": "azul" },
    { "tipo": "operador", "contenido": "=" },
    { "tipo": "caja", "contenido": "22", "color": "verde", "destacado": true }
  ],
  "agrupaciones": [
    {
      "desde": 0,
      "hasta": 2,
      "colorLlave": "verde",
      "textoAbajo": "Paso 1: 4 × 3 = 12"
    },
    {
      "desde": 4,
      "hasta": 6,
      "colorLlave": "naranja",
      "textoAbajo": "Paso 2: 5 × 2 = 10"
    }
  ],
  "filas": [
    {
      "elementos": [
        { "tipo": "caja", "contenido": "12", "color": "verde" },
        { "tipo": "operador", "contenido": "+" },
        { "tipo": "caja", "contenido": "10", "color": "naranja" },
        { "tipo": "operador", "contenido": "=" },
        { "tipo": "caja", "contenido": "22", "color": "verde", "destacado": true }
      ],
      "agrupaciones": [
        {
          "desde": 0,
          "hasta": 2,
          "colorLlave": "morado",
          "textoAbajo": "12 + 10 = 22"
        }
      ]
    },
    {
      "elementos": [
        { "tipo": "caja", "contenido": "22", "color": "verde", "destacado": true },
        { "tipo": "operador", "contenido": "=" },
        { "tipo": "caja", "contenido": "22", "color": "verde", "destacado": true }
      ]
    }
  ]
}
```

---

## 🎨 Visualización Esperada

```
Fila 1 (Principal):
[4] × [3] + [5] × [2] = [22]
└─────┘     └─────┘
Paso 1      Paso 2
4×3=12      5×2=10

Fila 2 (Primer paso de resolución):
[12] + [10] = [22]
└──────┘
12+10=22

Fila 3 (Resultado final):
[22] = [22]
```

---

## 📋 Campos Explicados

### Campo `elementos` (Array - Obligatorio)
La fila principal de la ecuación.

### Campo `agrupaciones` (Array - Opcional)
Llaves que se muestran debajo de los elementos de la fila principal.

### Campo `filas` (Array - Opcional) ⭐ NUEVO
Cada fila adicional representa un paso en la resolución de la ecuación.

**Estructura de cada fila:**
```typescript
{
  elementos: CajaEcuacion[];      // Elementos de esta fila
  agrupaciones?: LlaveAgrupacion[]; // Llaves opcionales para esta fila
}
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Operación Aritmética Simple

**Input:**
```json
{
  "tipoGrafico": "ecuacion_cajas",
  "elementos": [
    { "tipo": "caja", "contenido": "4", "color": "azul" },
    { "tipo": "operador", "contenido": "×" },
    { "tipo": "caja", "contenido": "3", "color": "azul" },
    { "tipo": "operador", "contenido": "+" },
    { "tipo": "caja", "contenido": "5", "color": "azul" },
    { "tipo": "operador", "contenido": "×" },
    { "tipo": "caja", "contenido": "2", "color": "azul" },
    { "tipo": "operador", "contenido": "=" },
    { "tipo": "caja", "contenido": "22", "color": "verde", "destacado": true }
  ],
  "agrupaciones": [
    { "desde": 0, "hasta": 2, "colorLlave": "verde", "textoAbajo": "4 × 3" },
    { "desde": 4, "hasta": 6, "colorLlave": "naranja", "textoAbajo": "5 × 2" }
  ],
  "filas": [
    {
      "elementos": [
        { "tipo": "caja", "contenido": "12", "color": "verde" },
        { "tipo": "operador", "contenido": "+" },
        { "tipo": "caja", "contenido": "10", "color": "naranja" },
        { "tipo": "operador", "contenido": "=" },
        { "tipo": "caja", "contenido": "22", "color": "verde", "destacado": true }
      ]
    }
  ]
}
```

**Resultado Visual:**
```
[4] × [3] + [5] × [2] = [22]
└─────┘     └─────┘
  4×3         5×2

[12] + [10] = [22]
```

---

### Ejemplo 2: Ecuación Algebraica

**Input:**
```json
{
  "tipoGrafico": "ecuacion_cajas",
  "elementos": [
    { "tipo": "caja", "contenido": "3x", "color": "azul" },
    { "tipo": "operador", "contenido": "+" },
    { "tipo": "caja", "contenido": "5", "color": "rojo" },
    { "tipo": "operador", "contenido": "=" },
    { "tipo": "caja", "contenido": "20", "color": "verde" }
  ],
  "agrupaciones": [
    { "desde": 0, "hasta": 4, "colorLlave": "amarillo", "textoAbajo": "Restar 5" }
  ],
  "filas": [
    {
      "elementos": [
        { "tipo": "caja", "contenido": "3x", "color": "azul" },
        { "tipo": "operador", "contenido": "=" },
        { "tipo": "caja", "contenido": "15", "color": "verde" }
      ],
      "agrupaciones": [
        { "desde": 0, "hasta": 2, "colorLlave": "morado", "textoAbajo": "Dividir ÷3" }
      ]
    },
    {
      "elementos": [
        { "tipo": "caja", "contenido": "x", "color": "azul", "destacado": true },
        { "tipo": "operador", "contenido": "=" },
        { "tipo": "caja", "contenido": "5", "color": "verde", "destacado": true }
      ]
    }
  ]
}
```

**Resultado Visual:**
```
[3x] + [5] = [20]
└──────────┘
 Restar 5

[3x] = [15]
└──────┘
Dividir ÷3

[x] = [5]  ← Resultado destacado
```

---

## 🔧 Reglas Importantes

### 1. **Flexibilidad de Filas**
- ✅ Puedes tener 0, 1, 2, 3... N filas adicionales
- ✅ Cada fila puede tener cualquier número de elementos
- ✅ No todas las filas necesitan agrupaciones

### 2. **Agrupaciones por Fila**
- Las agrupaciones en `elementos` + `agrupaciones` aplican solo a la **fila principal**
- Las agrupaciones en `filas[0].agrupaciones` aplican solo a la **primera fila adicional**
- Y así sucesivamente...

### 3. **Indices Relativos**
Los índices `desde` y `hasta` en las agrupaciones son **relativos a los elementos de su propia fila**.

```json
{
  "elementos": [
    // Índice 0, 1, 2, 3, 4 para esta fila
  ],
  "agrupaciones": [
    { "desde": 0, "hasta": 2 }  // Se refiere a elementos[0..2]
  ]
}
```

### 4. **Colores Consistentes**
Se recomienda usar los mismos colores en las filas para identificar qué elementos provienen de qué agrupación anterior.

---

## 📱 Casos de Uso Recomendados

### ✅ Usar filas cuando:
- Quieres mostrar **cómo se resuelve paso a paso** una ecuación
- Necesitas visualizar **múltiples pasos algebraicos**
- Los estudiantes deben ver **la transformación de la ecuación**

### ❌ NO usar filas cuando:
- Solo quieres explicar partes de una ecuación (usa solo `agrupaciones`)
- La ecuación es muy simple (una sola operación)
- No hay pasos intermedios que mostrar

---

## 🧪 Testing

**Componente de prueba:**
```tsx
import { GraficoRenderer } from '@/features/graficos-educativos/presentation/components/GraficoRenderer';

const miEcuacion = {
  tipoGrafico: "ecuacion_cajas",
  elementos: [...],
  agrupaciones: [...],
  filas: [...]
};

<GraficoRenderer grafico={miEcuacion} />
```

**Archivo de ejemplos completos:**
`src/features/graficos-educativos/presentation/examples/EcuacionCajasAgrupaciones.example.tsx`

---

## 🔄 Retrocompatibilidad

✅ **100% compatible con versiones anteriores**

Si envías:
```json
{
  "tipoGrafico": "ecuacion_cajas",
  "elementos": [...]
  // Sin agrupaciones ni filas
}
```

El componente funciona perfectamente mostrando solo la ecuación básica.

---

## 🎨 Dimensiones y Espaciado

```typescript
const boxWidth = 70;        // Ancho de cada caja
const boxHeight = 50;       // Alto de cada caja
const gap = 15;             // Espacio horizontal entre elementos
const rowGap = 80;          // Espacio vertical entre filas
const bracketHeight = 40;   // Altura de las llaves
```

---

## 📞 Soporte

**Archivos relacionados:**
- Componente: `src/features/graficos-educativos/presentation/components/EcuacionCajas.tsx`
- Tipos: `src/features/graficos-educativos/domain/types/graficos.types.ts`
- Ejemplos: `src/features/graficos-educativos/presentation/examples/EcuacionCajasAgrupaciones.example.tsx`

---

**Última actualización:** 10 de enero de 2026  
**Versión:** 2.0 - Con soporte de resolución paso a paso
