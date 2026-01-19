# Feature: Gráficos Educativos con Rough.js

Sistema de renderizado de gráficos educativos con estilo dibujado a mano para el proyecto Smart Teacher Frontend.

## 📋 Descripción

Este feature implementa un sistema completo para renderizar gráficos educativos usando **Rough.js**, una librería que crea gráficos con apariencia dibujada a mano, perfecta para un ambiente educativo y más amigable visualmente.

## 🎨 Tecnologías

- **React 18+** - Framework de UI
- **TypeScript** - Tipado estático
- **Rough.js** - Librería para gráficos con estilo dibujado a mano
- **SVG** - Renderizado vectorial escalable
- **Clean Architecture** - Arquitectura de software

## 🏗️ Arquitectura

El feature sigue **Clean Architecture** con separación clara de responsabilidades:

```
graficos-educativos/
├── domain/              # Capa de Dominio
│   ├── entities/        # Entidades del dominio
│   ├── types/           # Tipos e interfaces
│   └── repositories/    # Contratos de repositorios
├── application/         # Capa de Aplicación
│   └── use-cases/       # Casos de uso
├── infrastructure/      # Capa de Infraestructura
│   ├── repositories/    # Implementaciones de repositorios
│   └── adapters/        # Adaptadores externos
└── presentation/        # Capa de Presentación
    ├── components/      # Componentes React
    ├── hooks/           # Hooks personalizados (incluye useRoughSVG)
    └── styles/          # Estilos CSS complementarios
```

## 📦 Componentes Implementados

### Gráficos Disponibles

1. **EcuacionCajas** - Ecuaciones matemáticas con cajas visuales y brackets
   - Usa `rc.rectangle()` para cajas
   - Usa `rc.path()` para brackets de agrupación
   - Estilo cross-hatch para destacar elementos

2. **TablaPrecios** - Tablas de precios para problemas de compras/ventas
   - Header con fondo cross-hatch
   - Líneas divisorias con roughness reducido
   - Total destacado con color diferenciado

3. **BarrasComparacion** - Gráficos de barras comparativas
   - Ejes X e Y dibujados a mano
   - Barras con relleno hachure en ángulos variables
   - Grid lines sutiles para referencia

4. **TablaValores** - Tablas de valores genéricas
   - Bordes opcionales
   - Grid adaptable al número de columnas
   - Header destacado con cross-hatch

5. **BloqueAgrupados** - Bloques agrupados para representar cantidades
   - Layout automático en grid
   - Disposición horizontal o vertical
   - Ángulos de hachure únicos por grupo

### Componente Principal

`GraficoRenderer` - Selector que renderiza el tipo correcto de gráfico según los datos recibidos.

## 🎯 Uso Básico

### Importación

```typescript
import { GraficoRenderer } from '@/features/graficos-educativos';
```

### Ejemplo de uso

```tsx
import { GraficoRenderer } from '@/features/graficos-educativos';

function MiComponente() {
  const grafico = {
    tipoGrafico: "ecuacion_cajas",
    elementos: [
      { tipo: "caja", contenido: "12", color: "azul" },
      { tipo: "operador", contenido: "+" },
      { tipo: "caja", contenido: "6", color: "azul" },
      { tipo: "operador", contenido: "=" },
      { tipo: "caja", contenido: "18", color: "verde", destacado: true }
    ]
  };

  return <GraficoRenderer grafico={grafico} />;
}
```

### Con datos del backend

```tsx
import { useGraficosEducativos, GraficoRenderer } from '@/features/graficos-educativos';

function SesionPedagogica({ proceso }) {
  const { transformarDesdeBackend } = useGraficosEducativos();
  
  const graficoProblema = transformarDesdeBackend(proceso.graficoProblema);
  
  return (
    <div>
      {graficoProblema && <GraficoRenderer grafico={graficoProblema} />}
    </div>
  );
}
```

## 🔧 Hook Personalizado

### `useGraficosEducativos`

Hook que facilita el trabajo con gráficos:

```tsx
const {
  validarGrafico,
  transformarDesdeBackend,
  procesarGraficosDeSesion,
  tiposSoportados,
  error
} = useGraficosEducativos();
```

## 📊 Tipos de Gráficos Soportados

- `ecuacion_cajas` - Ecuaciones con cajas
- `tabla_precios` - Tablas de precios
- `barras_comparacion` - Gráficos de barras
- `tabla_valores` - Tablas genéricas
- `bloques_agrupados` - Bloques agrupados
- `recta_numerica` - Recta numérica
- `circulos_fraccion` - Círculos de fracciones
- `barras_fraccion` - Barras de fracciones
- Y más...

## 🎨 Estilos

Los estilos siguen la paleta de colores educativos MINEDU:

- Azul: #4A90E2
- Rojo: #E24A4A
- Amarillo: #F5D547
- Verde: #7ED321
- Naranja: #F5A623
- Morado: #BD10E0

## 🖨️ Soporte de Impresión

Todos los componentes están optimizados para impresión en formato A4:

- Prevención de saltos de página
- Colores garantizados para impresión
- Diseño responsive

## 🧪 Casos de Uso

### Validar Gráfico

```typescript
import { ValidarGraficoUseCase } from '@/features/graficos-educativos';

const useCase = new ValidarGraficoUseCase();
const resultado = useCase.execute(grafico);

if (!resultado.esValido) {
  console.log('Errores:', resultado.errores);
}
```

### Transformar Datos

```typescript
import { TransformarDatosGraficoUseCase } from '@/features/graficos-educativos';

const useCase = new TransformarDatosGraficoUseCase();
const graficoTransformado = useCase.execute(datosBackend);
```

## 🔌 Adaptadores

### GraficoBackendAdapter

Normaliza datos del backend a la estructura esperada:

```typescript
import { GraficoBackendAdapter } from '@/features/graficos-educativos';

const grafico = GraficoBackendAdapter.adaptarDesdeBackend(respuestaBackend);
const graficos = GraficoBackendAdapter.adaptarGraficosDeSesion(sesion);
```

## 💾 Repositorio

### GraficoLocalStorageRepository

Implementación de caché local para gráficos:

```typescript
import { GraficoLocalStorageRepository } from '@/features/graficos-educativos';

const repo = new GraficoLocalStorageRepository();
await repo.guardar('grafico-1', grafico);
const graficoCacheado = await repo.obtenerPorId('grafico-1');
```

## 🚀 Próximas Mejoras

- [ ] Más tipos de gráficos (diagramas Venn, figuras geométricas, etc.)
- [ ] Animaciones de transición
- [ ] Interactividad (tooltips, hover effects)
- [ ] Exportación a imagen (PNG/SVG)
- [ ] Modo oscuro
- [ ] Editor visual para profesores

## 📚 Documentación Adicional

Ver el archivo principal de documentación en la raíz del proyecto para ejemplos más detallados y guía completa de implementación.
