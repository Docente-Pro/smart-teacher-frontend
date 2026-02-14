# 📊 Componentes Gráficos Educativos - Sistema Completo

## 🎯 Componentes Implementados (15 tipos)

### ✅ Componentes Existentes
1. **Ecuación con Cajas** (`ecuacion_cajas`)
2. **Barras de Comparación** (`barras_comparacion`)
3. **Tabla de Valores** (`tabla_valores`)
4. **Bloques Agrupados** (`bloques_agrupados`)
5. **Tabla de Precios** (`tabla_precios`)

### 🆕 Componentes Nuevos Implementados

#### 6. **Recta Numérica** (`recta_numerica`)
- **Uso pedagógico**: Secuencias, comparación de números, operaciones
- **Características**:
  - Rango personalizable
  - Marcas destacadas con etiquetas
  - Flechas direccionales
  - Intervalos configurables

```typescript
{
  tipoGrafico: "recta_numerica",
  rangoInicio: 0,
  rangoFin: 10,
  intervalo: 1,
  elementos: [
    { valor: 5, destacado: true, etiqueta: "Ana", color: "azul" }
  ]
}
```

#### 7. **Círculos de Fracción** (`circulos_fraccion`)
- **Uso pedagógico**: Introducción a fracciones, comparación visual
- **Características**:
  - Círculos divididos en secciones
  - Sombreado automático del numerador
  - Etiquetas descriptivas

```typescript
{
  tipoGrafico: "circulos_fraccion",
  elementos: [
    { numerador: 1, denominador: 2, color: "azul", etiqueta: "Un medio" },
    { numerador: 3, denominador: 4, color: "verde", etiqueta: "Tres cuartos" }
  ]
}
```

#### 8. **Barras de Fracción** (`barras_fraccion`)
- **Uso pedagógico**: Comparación de fracciones, equivalencias
- **Características**:
  - Barras divididas proporcionalmente
  - Sombreado del numerador
  - Comparación lado a lado

```typescript
{
  tipoGrafico: "barras_fraccion",
  orientacion: "horizontal",
  elementos: [
    { numerador: 2, denominador: 3, color: "azul", etiqueta: "Chocolate de María" }
  ]
}
```

#### 9. **Diagrama de Dinero** (`diagrama_dinero`)
- **Uso pedagógico**: Manejo de dinero, suma de cantidades, problemas de compra-venta
- **Características**:
  - Billetes y monedas diferenciados
  - Colores según denominación
  - Cálculo automático del total

```typescript
{
  tipoGrafico: "diagrama_dinero",
  moneda: "S/",
  mostrarTotal: true,
  elementos: [
    { tipo: 'billete', valor: 10, cantidad: 2 },
    { tipo: 'moneda', valor: 1, cantidad: 3 }
  ]
}
```

#### 10. **Figuras Geométricas** (`figuras_geometricas`)
- **Uso pedagógico**: Geometría plana, clasificación de figuras, perímetro, área
- **Características**:
  - 6 figuras básicas: cuadrado, rectángulo, círculo, triángulo, trapecio, rombo
  - Dimensiones personalizables
  - Colores y etiquetas

```typescript
{
  tipoGrafico: "figuras_geometricas",
  elementos: [
    { tipo: 'cuadrado', ancho: 80, color: "azul", etiqueta: "Ventana" },
    { tipo: 'circulo', radio: 40, color: "rojo", etiqueta: "Reloj" }
  ]
}
```

#### 11. **Patrón Visual** (`patron_visual`)
- **Uso pedagógico**: Pensamiento algebraico, secuencias, patrones
- **Características**:
  - Formas y números
  - Repetición automática del patrón
  - Separadores visuales

```typescript
{
  tipoGrafico: "patron_visual",
  repeticiones: 2,
  elementos: [
    { tipo: 'forma', valor: 'circulo', color: '#3b82f6' },
    { tipo: 'numero', valor: 2 }
  ]
}
```

#### 12. **Diagrama de Venn** (`diagrama_venn`)
- **Uso pedagógico**: Teoría de conjuntos, clasificación, intersecciones
- **Características**:
  - 2 o 3 conjuntos
  - Intersecciones automáticas
  - Elementos posicionados correctamente

```typescript
{
  tipoGrafico: "diagrama_venn",
  elementos: [
    { nombre: "Fútbol", elementos: ["Ana", "Luis"], color: "#3b82f6" },
    { nombre: "Básquet", elementos: ["Pedro", "Ana"], color: "#ef4444" }
  ],
  interseccion: ["Ana"]
}
```

#### 13. **Tabla Doble Entrada** (`tabla_doble_entrada`)
- **Uso pedagógico**: Organización de datos, resolución de problemas, estadística básica
- **Características**:
  - Encabezados en filas y columnas
  - Celdas con datos numéricos o texto
  - Formato MINEDU

```typescript
{
  tipoGrafico: "tabla_doble_entrada",
  encabezadosColumnas: ["Lunes", "Martes"],
  encabezadosFilas: ["Manzanas", "Naranjas"],
  datos: [
    [12, 15],
    [8, 12]
  ]
}
```

#### 14. **Operación Vertical** (`operacion_vertical`)
- **Uso pedagógico**: Algoritmos de suma, resta, multiplicación, división
- **Características**:
  - Formato vertical tradicional
  - Llevadas y préstamos visuales (opcional)
  - Alineación automática

```typescript
{
  tipoGrafico: "operacion_vertical",
  titulo: "¿Cuántos juguetes hay?",
  operacion: "suma",
  operandos: [8, 5],
  resultado: 13,
  mostrarResultado: true,
  destacarLlevadas: false
}
```

#### 15. **Medidas Comparación** (`medidas_comparacion`)
- **Uso pedagógico**: Unidades de medida, comparación de magnitudes
- **Características**:
  - Longitud, peso, capacidad, tiempo
  - Barras proporcionales
  - Íconos por tipo de medida

```typescript
{
  tipoGrafico: "medidas_comparacion",
  elementos: [
    { tipo: 'longitud', valor: 1.35, unidad: 'm', etiqueta: 'Ana', color: "azul" }
  ]
}
```

## 🎨 Características Comunes

### Estilo Rough.js
- **Trazos dibujados a mano**: Simulan dibujos escolares
- **Colores educativos**: Paleta apropiada para primaria
- **Tipografía infantil**: Comic Sans MS para títulos

### Paleta de Colores
```typescript
enum ColorGrafico {
  AZUL = "azul",      // #3b82f6
  ROJO = "rojo",      // #ef4444
  AMARILLO = "amarillo", // #fbbf24
  VERDE = "verde",    // #10b981
  NARANJA = "naranja", // #f97316
  MORADO = "morado",  // #8b5cf6
  NEUTRO = "neutro"   // #64748b
}
```

## 📚 Uso en Sesiones de Aprendizaje

### Integración con Backend
El backend puede enviar cualquier tipo de gráfico en el campo `grafico`:

```typescript
{
  "proceso": "Construcción del aprendizaje",
  "estrategias": "...",
  "grafico": {
    "tipoGrafico": "circulos_fraccion",
    "titulo": "Comparando fracciones",
    "elementos": [...]
  }
}
```

### Renderizado Automático
El componente `GraficoRenderer` detecta automáticamente el tipo y renderiza el componente correcto:

```tsx
import { GraficoRenderer } from '@/features/graficos-educativos';

<GraficoRenderer grafico={proceso.grafico} />
```

## 📖 Competencias MINEDU Cubiertas

| Componente | Competencia | Capacidades |
|------------|-------------|-------------|
| Recta Numérica | Resuelve problemas de cantidad | Traduce cantidades, Comunica |
| Fracciones (círculos/barras) | Resuelve problemas de cantidad | Usa estrategias, Representa |
| Diagrama Dinero | Resuelve problemas de gestión de datos | Traduce datos, Comunica |
| Figuras Geométricas | Resuelve problemas de forma, movimiento | Modela objetos, Comunica |
| Patrón Visual | Resuelve problemas de regularidad | Traduce patrones, Argumenta |
| Diagrama Venn | Resuelve problemas de gestión de datos | Representa datos, Usa estrategias |
| Tabla Doble Entrada | Resuelve problemas de gestión de datos | Representa datos, Usa estrategias |
| Operación Vertical | Resuelve problemas de cantidad | Usa estrategias, Argumenta |
| Medidas Comparación | Resuelve problemas de cantidad | Traduce magnitudes, Comunica |

## 🚀 Ejemplo de Uso Completo

```tsx
import { GraficoRenderer } from '@/features/graficos-educativos';

function ProcesoDidactico() {
  const proceso = {
    proceso: "Construcción del aprendizaje",
    estrategias: "Los estudiantes resuelven problemas con fracciones...",
    grafico: {
      tipoGrafico: "circulos_fraccion",
      titulo: "¿Quién comió más pizza?",
      elementos: [
        { numerador: 2, denominador: 4, color: "azul", etiqueta: "María" },
        { numerador: 3, denominador: 4, color: "verde", etiqueta: "Pedro" }
      ],
      mostrarEtiquetas: true
    },
    tiempo: "25 min"
  };

  return (
    <div>
      <h3>{proceso.proceso}</h3>
      <p>{proceso.estrategias}</p>
      <GraficoRenderer grafico={proceso.grafico} />
    </div>
  );
}
```

## ✅ Testing

Todos los componentes fueron probados con datos reales y cumplen con:
- ✅ Render sin errores
- ✅ Responsive design
- ✅ Accesibilidad básica
- ✅ Estilo consistente Rough.js
- ✅ Integración con GraficoRenderer

## 📝 Notas para Backend

Para generar gráficos con IA, usar los siguientes prompts según el tipo:

**Fracciones**: "Genera un gráfico de tipo circulos_fraccion para comparar 1/2 y 3/4"

**Dinero**: "Genera un diagrama_dinero mostrando 2 billetes de 10 soles y 3 monedas de 1 sol"

**Patrones**: "Genera un patron_visual con círculo-cuadrado-triángulo que se repita 2 veces"

El formato de respuesta debe ser JSON válido según las interfaces en `graficos.types.ts`.
