# 📑 Índice de Archivos - Feature Gráficos Educativos

## 📁 Estructura Completa

```
graficos-educativos/
├── 📄 README.md                          # Documentación principal del feature
├── 📄 ROUGH_IMPLEMENTATION.md             # Guía completa de implementación con Rough.js
├── 📄 MIGRATION_SUMMARY.md                # Resumen de la migración a Rough.js
├── 📄 INDEX.md                            # Este archivo - índice de navegación
│
├── 📁 domain/                             # Capa de Dominio (Entidades y Reglas de Negocio)
│   ├── 📁 entities/
│   │   └── 📄 Grafico.entity.ts          # Entidad principal del gráfico
│   │
│   ├── 📁 types/
│   │   ├── 📄 graficos.types.ts          # Tipos e interfaces de todos los gráficos
│   │   └── 📄 index.ts                   # Barrel export de tipos
│   │
│   └── 📁 repositories/
│       └── 📄 IGraficoRepository.ts       # Contrato del repositorio
│
├── 📁 application/                        # Capa de Aplicación (Casos de Uso)
│   ├── 📁 use-cases/
│   │   ├── 📄 ValidarGrafico.usecase.ts         # Validación de estructura de gráficos
│   │   ├── 📄 ObtenerTipoGrafico.usecase.ts     # Determinación del tipo de gráfico
│   │   ├── 📄 TransformarDatosGrafico.usecase.ts # Transformación de datos
│   │   └── 📄 index.ts                          # Barrel export de use cases
│   │
│   └── 📁 ports/
│       └── 📄 IBackendGraficoPort.ts      # Puerto para comunicación con backend
│
├── 📁 infrastructure/                     # Capa de Infraestructura
│   ├── 📁 repositories/
│   │   ├── 📄 GraficoLocalStorage.repository.ts  # Repositorio localStorage
│   │   └── 📄 index.ts                           # Barrel export de repositorios
│   │
│   └── 📁 adapters/
│       ├── 📄 GraficoBackendAdapter.ts    # Adaptador para backend
│       └── 📄 index.ts                    # Barrel export de adaptadores
│
└── 📁 presentation/                       # Capa de Presentación (UI/React)
    ├── 📁 components/                     # Componentes React
    │   ├── 📄 GraficoRenderer.tsx         # ⭐ Componente principal (selector)
    │   ├── 📄 EcuacionCajas.tsx           # ✅ Ecuaciones con cajas (Rough.js)
    │   ├── 📄 TablaPrecios.tsx            # ✅ Tablas de precios (Rough.js)
    │   ├── 📄 BarrasComparacion.tsx       # ✅ Gráficos de barras (Rough.js)
    │   ├── 📄 TablaValores.tsx            # ✅ Tablas genéricas (Rough.js)
    │   ├── 📄 BloqueAgrupados.tsx         # ✅ Bloques agrupados (Rough.js)
    │   └── 📄 index.ts                    # Barrel export de componentes
    │
    ├── 📁 hooks/                          # Hooks personalizados
    │   ├── 📄 useGraficosEducativos.ts    # Hook principal para usar casos de uso
    │   ├── 📄 useRoughSVG.ts              # ⭐ Hook para Rough.js (config y colores)
    │   └── 📄 index.ts                    # Barrel export de hooks
    │
    ├── 📁 styles/                         # Estilos CSS complementarios
    │   ├── 📄 EcuacionCajas.css           # Estilos para ecuaciones
    │   ├── 📄 TablaPrecios.css            # Estilos para tabla de precios
    │   ├── 📄 BarrasComparacion.css       # Estilos para barras
    │   ├── 📄 TablaValores.css            # Estilos para tabla de valores
    │   ├── 📄 BloqueAgrupados.css         # Estilos para bloques
    │   └── 📄 GraficoRenderer.css         # Estilos del renderer
    │
    └── 📁 examples/                       # Ejemplos de uso
        ├── 📄 RoughJSExamples.tsx         # ⭐ Galería completa con Rough.js
        ├── 📄 GaleriaEjemplos.example.tsx # Ejemplos variados
        └── 📄 IntegracionProcesoPedagogico.example.tsx  # Integración completa
```

---

## 📚 Guías de Navegación

### Para Empezar
1. **README.md** - Empieza aquí para entender el feature
2. **ROUGH_IMPLEMENTATION.md** - Aprende sobre Rough.js y la implementación
3. **RoughJSExamples.tsx** - Ve ejemplos funcionales

### Para Desarrolladores

#### Implementar Nuevos Gráficos
1. `domain/types/graficos.types.ts` - Agregar nuevo tipo
2. `presentation/components/` - Crear componente con Rough.js
3. `presentation/hooks/useRoughSVG.ts` - Usar configuración compartida
4. `application/use-cases/` - Agregar validaciones si es necesario

#### Entender la Arquitectura
1. `domain/` - Empieza con las entidades y tipos
2. `application/use-cases/` - Revisa los casos de uso
3. `presentation/components/` - Ve cómo se usan los casos de uso

#### Integrar en tu Aplicación
1. `presentation/examples/IntegracionProcesoPedagogico.example.tsx` - Ejemplo real
2. `presentation/hooks/useGraficosEducativos.ts` - Hook facilitador
3. `README.md` sección "Uso Básico"

### Para Diseñadores

#### Ver Ejemplos Visuales
1. **RoughJSExamples.tsx** - Galería completa interactiva
2. **ROUGH_IMPLEMENTATION.md** - Configuraciones y estilos
3. `presentation/styles/` - Estilos CSS complementarios

#### Entender el Diseño
1. **useRoughSVG.ts** - Paleta de colores y configuración
2. **ROUGH_IMPLEMENTATION.md** - Sección "Mejores Prácticas"
3. Componentes individuales - Implementaciones específicas

---

## 🎯 Componentes Principales

### 1. GraficoRenderer
**Propósito:** Selector que renderiza el componente correcto según el tipo

**Ubicación:** `presentation/components/GraficoRenderer.tsx`

**Uso:**
```tsx
<GraficoRenderer grafico={miGrafico} />
```

### 2. useRoughSVG (Hook)
**Propósito:** Configuración compartida de Rough.js

**Ubicación:** `presentation/hooks/useRoughSVG.ts`

**Exporta:**
- `useRoughSVG()` - Hook para referencias
- `defaultRoughConfig` - Configuración por defecto
- `roughColors` - Paleta de colores

### 3. Componentes de Gráficos (5)

| Componente | Archivo | Propósito |
|------------|---------|-----------|
| EcuacionCajas | `EcuacionCajas.tsx` | Ecuaciones matemáticas visuales |
| TablaPrecios | `TablaPrecios.tsx` | Problemas de compras/ventas |
| BarrasComparacion | `BarrasComparacion.tsx` | Comparación de cantidades |
| TablaValores | `TablaValores.tsx` | Datos tabulares generales |
| BloqueAgrupados | `BloqueAgrupados.tsx` | Conjuntos y agrupaciones |

---

## 📖 Archivos de Documentación

### 1. README.md
**Contenido:**
- Descripción general del feature
- Tecnologías utilizadas
- Arquitectura
- Uso básico
- Hooks personalizados
- Ejemplos

### 2. ROUGH_IMPLEMENTATION.md
**Contenido:**
- ¿Qué es Rough.js?
- Estilos de relleno disponibles
- Configuración detallada
- Descripción de cada componente
- Patrón de uso
- Métodos de Rough.js
- Mejores prácticas
- Recursos

### 3. MIGRATION_SUMMARY.md
**Contenido:**
- Estado de la migración
- Componentes migrados
- Hook personalizado
- Documentación creada
- Dependencias
- Patrón de implementación
- Estadísticas
- Ventajas
- Checklist
- Próximos pasos

### 4. INDEX.md (Este archivo)
**Contenido:**
- Estructura completa del proyecto
- Guías de navegación
- Componentes principales
- Referencias rápidas

---

## 🔧 Archivos Técnicos Clave

### Types & Interfaces
📄 `domain/types/graficos.types.ts` (300+ líneas)
- Todos los tipos de gráficos
- Interfaces de configuración
- Enums y tipos auxiliares

### Use Cases
📄 `application/use-cases/ValidarGrafico.usecase.ts`
- Validación de estructura

📄 `application/use-cases/ObtenerTipoGrafico.usecase.ts`
- Determinación del tipo

📄 `application/use-cases/TransformarDatosGrafico.usecase.ts`
- Transformación de datos

### Hooks
📄 `presentation/hooks/useGraficosEducativos.ts`
- Facilita uso de casos de uso
- Manejo de errores
- Transformación desde backend

📄 `presentation/hooks/useRoughSVG.ts` ⭐
- Configuración de Rough.js
- Paleta de colores
- Hook para referencias SVG

---

## 🎨 Archivos de Estilos

Todos en `presentation/styles/`:

| Archivo | Propósito | Tamaño ~|
|---------|-----------|---------|
| EcuacionCajas.css | Estilos para ecuaciones | 50 líneas |
| TablaPrecios.css | Estilos para tablas de precios | 60 líneas |
| BarrasComparacion.css | Estilos para barras | 40 líneas |
| TablaValores.css | Estilos para tablas genéricas | 45 líneas |
| BloqueAgrupados.css | Estilos para bloques | 50 líneas |
| GraficoRenderer.css | Estilos del contenedor | 30 líneas |

**Nota:** Los estilos CSS son complementarios. El diseño principal viene de Rough.js (SVG).

---

## 📝 Ejemplos y Demos

### RoughJSExamples.tsx ⭐
**Ubicación:** `presentation/examples/RoughJSExamples.tsx`

**Incluye:**
- 5 ejemplos completos (uno por tipo de gráfico)
- Galería interactiva
- Configuraciones mostradas
- Estilos CSS integrados
- Listo para usar como demo

### GaleriaEjemplos.example.tsx
**Ubicación:** `presentation/examples/GaleriaEjemplos.example.tsx`

**Incluye:**
- Ejemplos variados
- Diferentes configuraciones
- Casos de uso educativos

### IntegracionProcesoPedagogico.example.tsx
**Ubicación:** `presentation/examples/IntegracionProcesoPedagogico.example.tsx`

**Incluye:**
- Integración completa en sesión pedagógica
- Uso con datos del backend
- Manejo de estados
- Error handling

---

## 🚀 Quick Links

### Documentación
- [README Principal](./README.md)
- [Guía Rough.js](./ROUGH_IMPLEMENTATION.md)
- [Resumen Migración](./MIGRATION_SUMMARY.md)

### Código Principal
- [GraficoRenderer](./presentation/components/GraficoRenderer.tsx)
- [useRoughSVG Hook](./presentation/hooks/useRoughSVG.ts)
- [Tipos](./domain/types/graficos.types.ts)

### Ejemplos
- [Galería Rough.js](./presentation/examples/RoughJSExamples.tsx)
- [Ejemplos Variados](./presentation/examples/GaleriaEjemplos.example.tsx)

### Recursos Externos
- [Rough.js Docs](https://roughjs.com/)
- [Rough.js GitHub](https://github.com/rough-stuff/rough)

---

## 📊 Estadísticas del Feature

- **Total de archivos:** ~40
- **Líneas de código:** ~3,500+
- **Componentes React:** 6 (1 renderer + 5 gráficos)
- **Hooks personalizados:** 2
- **Use Cases:** 3
- **Archivos de documentación:** 4
- **Ejemplos:** 3 archivos
- **Dependencias:** Rough.js 4.6.6

---

## 🎓 Flujo de Aprendizaje Recomendado

### Nivel 1: Usuario
1. README.md - Sección "Uso Básico"
2. RoughJSExamples.tsx - Ver ejemplos visuales
3. GraficoRenderer - Usar el componente

### Nivel 2: Integrador
1. useGraficosEducativos.ts - Entender el hook
2. IntegracionProcesoPedagogico.example.tsx - Ver integración
3. domain/types/ - Conocer los tipos disponibles

### Nivel 3: Desarrollador
1. ROUGH_IMPLEMENTATION.md - Entender Rough.js
2. Componentes individuales - Ver implementaciones
3. useRoughSVG.ts - Configuración compartida
4. Use Cases - Entender la lógica de negocio

### Nivel 4: Arquitecto
1. Toda la estructura domain/
2. application/use-cases/
3. infrastructure/
4. Patrones y principios aplicados

---

## ✅ Checklist de Orientación

- [ ] He leído el README.md
- [ ] He visto los ejemplos en RoughJSExamples.tsx
- [ ] Entiendo qué es Rough.js y por qué se usa
- [ ] Conozco los 5 tipos de gráficos disponibles
- [ ] Sé cómo usar GraficoRenderer
- [ ] Entiendo la arquitectura en capas
- [ ] He revisado un componente completo
- [ ] Sé dónde agregar un nuevo tipo de gráfico

---

**Última actualización:** 2024  
**Versión:** 1.0.0 (Rough.js)  
**Estado:** ✅ Production Ready
