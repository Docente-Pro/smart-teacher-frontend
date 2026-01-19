# 🚀 Quick Start - Gráficos Educativos con Rough.js

## ⚡ Instalación

```bash
# Ya instalado ✅
pnpm add roughjs
```

## 📦 Importación

```typescript
import { GraficoRenderer } from '@/features/graficos-educativos';
```

## 🎯 Uso Básico

### 1. Ecuación con Cajas

```tsx
const ecuacion = {
  tipoGrafico: "ecuacion_cajas",
  elementos: [
    { tipo: "caja", contenido: "12", color: "azul" },
    { tipo: "operador", contenido: "+" },
    { tipo: "caja", contenido: "6", color: "azul" },
    { tipo: "operador", contenido: "=" },
    { tipo: "caja", contenido: "18", color: "verde", destacado: true }
  ]
};

<GraficoRenderer grafico={ecuacion} />
```

### 2. Tabla de Precios

```tsx
const tabla = {
  tipoGrafico: "tabla_precios",
  elementos: [
    { producto: "Cuaderno", icono: "📓", precioUnitario: 3.50, cantidad: 4, total: 14.00 },
    { producto: "Lápiz", icono: "✏️", precioUnitario: 0.50, cantidad: 10, total: 5.00 }
  ],
  moneda: "S/",
  mostrarTotal: true
};

<GraficoRenderer grafico={tabla} />
```

### 3. Barras de Comparación

```tsx
const barras = {
  tipoGrafico: "barras_comparacion",
  elementos: [
    { etiqueta: "Enero", valor: 25, color: "azul", icono: "📅" },
    { etiqueta: "Febrero", valor: 35, color: "verde", icono: "📅" }
  ],
  ejeY: { titulo: "Ventas", maximo: 50, intervalo: 10 }
};

<GraficoRenderer grafico={barras} />
```

### 4. Bloques Agrupados

```tsx
const bloques = {
  tipoGrafico: "bloques_agrupados",
  elementos: [
    { etiqueta: "Manzanas", cantidad: 12, color: "rojo", icono: "🍎" },
    { etiqueta: "Naranjas", cantidad: 8, color: "naranja", icono: "🍊" }
  ],
  disposicion: "horizontal",
  tamanoBloque: 30
};

<GraficoRenderer grafico={bloques} />
```

### 5. Tabla de Valores

```tsx
const tablaValores = {
  tipoGrafico: "tabla_valores",
  encabezados: ["Día", "Temperatura", "Lluvia"],
  elementos: [
    { celdas: ["Lunes", "22°C", "0mm"] },
    { celdas: ["Martes", "25°C", "2mm"] }
  ],
  mostrarBordes: true
};

<GraficoRenderer grafico={tablaValores} />
```

## 🎨 Configuración de Rough.js

### Colores Disponibles

```typescript
const roughColors = {
  azul: '#4A90E2',
  rojo: '#E24A4A',
  verde: '#4CAF50',
  amarillo: '#FFC107',
  morado: '#9C27B0',
  naranja: '#FF9800'
};
```

### Configuración por Defecto

```typescript
const defaultRoughConfig = {
  roughness: 1.2,        // Nivel de irregularidad (0-5)
  bowing: 1,             // Curvatura de líneas
  strokeWidth: 2,        // Grosor del trazo
  fillStyle: 'hachure',  // Estilo de relleno
  fillWeight: 0.5,       // Peso del relleno
  hachureGap: 4          // Separación entre líneas
};
```

### Estilos de Relleno

- `hachure` - Líneas paralelas
- `cross-hatch` - Líneas cruzadas
- `solid` - Relleno sólido
- `zigzag` - Líneas en zigzag
- `dots` - Puntos
- `dashed` - Líneas punteadas

## 🔧 Hook Personalizado

```typescript
import { useGraficosEducativos } from '@/features/graficos-educativos';

function MiComponente() {
  const { validarGrafico, transformarDesdeBackend } = useGraficosEducativos();
  
  // Validar un gráfico
  const validacion = validarGrafico(miGrafico);
  if (!validacion.esValido) {
    console.error(validacion.errores);
  }
  
  // Transformar desde backend
  const grafico = transformarDesdeBackend(datosBackend);
  
  return <GraficoRenderer grafico={grafico} />;
}
```

## 📁 Archivos Principales

| Archivo | Propósito |
|---------|-----------|
| `GraficoRenderer.tsx` | Componente selector principal |
| `useRoughSVG.ts` | Hook con configuración de Rough.js |
| `useGraficosEducativos.ts` | Hook para casos de uso |
| `graficos.types.ts` | Tipos TypeScript |

## 📚 Documentación Completa

- [README.md](./README.md) - Documentación principal
- [ROUGH_IMPLEMENTATION.md](./ROUGH_IMPLEMENTATION.md) - Guía de Rough.js
- [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md) - Resumen de migración
- [INDEX.md](./INDEX.md) - Índice de navegación

## 🎓 Ejemplos Completos

Ver: `presentation/examples/RoughJSExamples.tsx`

```typescript
import { GaleriaGraficosRoughJS } from '@/features/graficos-educativos/presentation/examples/RoughJSExamples';

<GaleriaGraficosRoughJS />
```

## ⚠️ Notas Importantes

1. **TypeScript:** Usa `as const` para literales de tipo
2. **Colores:** Solo usa los colores de `roughColors`
3. **Tipos:** Importa desde `@/features/graficos-educativos`
4. **Validación:** Siempre valida antes de renderizar

## 🐛 Troubleshooting

### Error: Tipo de color inválido
```typescript
// ❌ Incorrecto
color: "azul"

// ✅ Correcto
color: "azul" as const
```

### Error: Módulo no encontrado
```typescript
// Verifica la ruta de importación
import { GraficoRenderer } from '@/features/graficos-educativos';
```

### El gráfico no se muestra
```typescript
// Asegúrate de que el tipo es válido
const validacion = validarGrafico(miGrafico);
console.log(validacion);
```

## 🎯 Próximos Pasos

1. ✅ Importar `GraficoRenderer`
2. ✅ Crear objeto con datos del gráfico
3. ✅ Usar tipo correcto (`tipoGrafico`)
4. ✅ Validar estructura (opcional)
5. ✅ Renderizar con `<GraficoRenderer grafico={...} />`

## 📖 Recursos

- [Rough.js Docs](https://roughjs.com/)
- [GitHub Rough.js](https://github.com/rough-stuff/rough)
- [Ejemplos Interactivos](https://roughjs.com/examples/)

---

**¿Necesitas ayuda?** Revisa [INDEX.md](./INDEX.md) para navegación completa.
