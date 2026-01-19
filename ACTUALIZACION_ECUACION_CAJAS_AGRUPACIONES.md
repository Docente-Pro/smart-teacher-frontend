# 📐 Actualización: Soporte de Agrupaciones en EcuacionCajas

## 🎯 Resumen de Cambios

El componente `EcuacionCajas` ha sido actualizado para soportar el campo opcional `agrupaciones`, que permite dibujar **llaves/corchetes debajo de elementos** y mostrar **textos explicativos** de pasos intermedios.

---

## ✨ Características Implementadas

### 1. **Campo `agrupaciones` (opcional)**
```typescript
interface GraficoEcuacionCajas {
  tipoGrafico: TipoGraficoMatematica.ECUACION_CAJAS;
  elementos: CajaEcuacion[];
  agrupaciones?: LlaveAgrupacion[];  // ⬅️ NUEVO
  filas?: number;
}

interface LlaveAgrupacion {
  desde: number;          // índice del primer elemento
  hasta: number;          // índice del último elemento
  colorLlave: ColorGrafico;
  textoAbajo?: string;    // texto explicativo debajo de la llave
}
```

### 2. **Cálculo preciso de posiciones**
El componente ahora:
- ✅ Guarda las posiciones reales (startX, endX) de cada elemento mientras los renderiza
- ✅ Considera que las cajas tienen 70px de ancho y los operadores 40px
- ✅ Calcula las llaves basándose en posiciones exactas, no en índices multiplicados por un ancho fijo

### 3. **Renderizado de llaves con Rough.js**
- Dibuja llaves curvas con estilo hand-drawn coherente con el resto del gráfico
- Las llaves se dibujan debajo de los elementos agrupados
- El punto medio de la llave tiene una pequeña extensión hacia abajo para darle forma de corchete

### 4. **Textos explicativos**
- Se muestran debajo de cada llave
- Centrados horizontalmente respecto a la agrupación
- Usan el mismo color que la llave
- Tamaño de fuente reducido (13px) para diferenciarlos del contenido principal

---

## 📊 Estructura de Datos del Backend

### Ejemplo Completo
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

### Visualización Esperada
```
[4] × [5] + [3] × [2] = [26]
└────┘     └────┘
   ↓          ↓
Paso 1:    Paso 2:
4 × 5=20   3 × 2=6
```

---

## 🔧 Archivos Modificados

### 1. **EcuacionCajas.tsx**
**Cambios principales:**
- Se agregó el array `elementosPos` para guardar posiciones de cada elemento
- Se modificó el loop de renderizado para guardar `startX` y `endX` de cada elemento
- Se actualizó el cálculo de las llaves para usar las posiciones guardadas en lugar de multiplicar índices
- Las llaves ahora se posicionan correctamente independientemente del tipo de elemento (caja/operador)

**Antes:**
```typescript
const startX = 20 + (agrup.desde * (boxWidth + gap));
const endX = 20 + (agrup.hasta * (boxWidth + gap)) + boxWidth;
```

**Después:**
```typescript
const startX = elementosPos[agrup.desde]?.startX || 20;
const endX = elementosPos[agrup.hasta]?.endX || startX + boxWidth;
```

---

## 🎨 Colores Disponibles

Los siguientes colores están disponibles para `colorLlave`:
- `azul` → #4A90E2
- `rojo` → #E24A4A
- `amarillo` → #F5D547
- `verde` → #7ED321
- `naranja` → #F5A623
- `morado` → #BD10E0
- `neutro` → #2C3E50

---

## 📝 Ejemplos de Uso

### Ejemplo 1: Operaciones Compuestas
```typescript
const grafico: GraficoEcuacionCajas = {
  tipoGrafico: TipoGraficoMatematica.ECUACION_CAJAS,
  elementos: [
    { tipo: "caja", contenido: "4", color: "azul" },
    { tipo: "operador", contenido: "×" },
    { tipo: "caja", contenido: "5", color: "azul" },
    { tipo: "operador", contenido: "+" },
    { tipo: "caja", contenido: "3", color: "azul" },
    { tipo: "operador", contenido: "×" },
    { tipo: "caja", contenido: "2", color: "azul" },
    { tipo: "operador", contenido: "=" },
    { tipo: "caja", contenido: "26", color: "verde", destacado: true }
  ],
  agrupaciones: [
    {
      desde: 0,
      hasta: 2,
      colorLlave: "verde",
      textoAbajo: "Paso 1: 4 × 5 = 20"
    },
    {
      desde: 4,
      hasta: 6,
      colorLlave: "naranja",
      textoAbajo: "Paso 2: 3 × 2 = 6"
    }
  ]
};
```

### Ejemplo 2: Suma con Agrupación Única
```typescript
const grafico: GraficoEcuacionCajas = {
  tipoGrafico: TipoGraficoMatematica.ECUACION_CAJAS,
  elementos: [
    { tipo: "caja", contenido: "15", color: "azul" },
    { tipo: "operador", contenido: "+" },
    { tipo: "caja", contenido: "23", color: "azul" },
    { tipo: "operador", contenido: "+" },
    { tipo: "caja", contenido: "12", color: "azul" },
    { tipo: "operador", contenido: "=" },
    { tipo: "caja", contenido: "50", color: "verde", destacado: true }
  ],
  agrupaciones: [
    {
      desde: 0,
      hasta: 4,
      colorLlave: "morado",
      textoAbajo: "Suma todos los números"
    }
  ]
};
```

### Ejemplo 3: Sin Agrupaciones (Retrocompatibilidad)
```typescript
const grafico: GraficoEcuacionCajas = {
  tipoGrafico: TipoGraficoMatematica.ECUACION_CAJAS,
  elementos: [
    { tipo: "caja", contenido: "8", color: "azul" },
    { tipo: "operador", contenido: "+" },
    { tipo: "caja", contenido: "7", color: "azul" },
    { tipo: "operador", contenido: "=" },
    { tipo: "caja", contenido: "15", color: "verde", destacado: true }
  ]
  // Sin campo agrupaciones - funciona perfectamente
};
```

---

## ✅ Compatibilidad

### Retrocompatibilidad
- ✅ El campo `agrupaciones` es **opcional**
- ✅ Los gráficos existentes sin agrupaciones siguen funcionando
- ✅ No se requieren cambios en gráficos ya creados

### Compatibilidad del Backend
- ✅ El componente acepta tanto `contenido` como `valor` en elementos
- ✅ Los colores pueden ser del enum (`"azul"`) o hexadecimales (`"#4A90E2"`)
- ✅ Si faltan datos de posición, usa valores por defecto seguros

---

## 🧪 Testing

Se ha creado un archivo de ejemplos completo:
```
src/features/graficos-educativos/presentation/examples/
  └── EcuacionCajasAgrupaciones.example.tsx
```

Este archivo contiene:
- ✅ 4 ejemplos diferentes de uso
- ✅ Documentación inline de la estructura
- ✅ Casos de prueba para retrocompatibilidad
- ✅ Ejemplos visuales con explicaciones

---

## 📐 Dimensiones y Espaciado

```typescript
const boxWidth = 70;      // Ancho de cada caja
const boxHeight = 50;     // Alto de cada caja
const gap = 15;           // Espacio entre cajas
const agrupY = baseY + boxHeight + 15;  // Posición Y de las llaves
const totalHeight = 140;  // Alto total con agrupaciones (vs 90 sin ellas)
```

---

## 🚀 Próximos Pasos

### Recomendaciones
1. **Probar con datos reales** del backend
2. **Validar el aspecto visual** en diferentes navegadores
3. **Ajustar colores** si es necesario para mayor contraste
4. **Considerar múltiples filas** de agrupaciones si se requiere en el futuro

### Posibles Mejoras Futuras
- [ ] Soporte para agrupaciones anidadas visualmente (múltiples niveles)
- [ ] Animaciones al mostrar las agrupaciones
- [ ] Tooltips interactivos en las agrupaciones
- [ ] Exportación a imagen de la ecuación con agrupaciones

---

## 📚 Referencias

- **Componente:** `src/features/graficos-educativos/presentation/components/EcuacionCajas.tsx`
- **Tipos:** `src/features/graficos-educativos/domain/types/graficos.types.ts`
- **Ejemplos:** `src/features/graficos-educativos/presentation/examples/EcuacionCajasAgrupaciones.example.tsx`
- **Hooks:** `src/features/graficos-educativos/presentation/hooks/useRoughSVG.ts`

---

**Última actualización:** 10 de enero de 2026  
**Estado:** ✅ Implementado y listo para usar
