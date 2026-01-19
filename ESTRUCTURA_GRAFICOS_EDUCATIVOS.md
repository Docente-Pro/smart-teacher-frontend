# 🎨 Sistema de Gráficos Educativos - Estructura Visual

## 📁 Estructura Completa del Feature

```
src/features/graficos-educativos/
│
├── 📘 domain/                                    # CAPA DE DOMINIO (Reglas de negocio puras)
│   │
│   ├── 📄 entities/
│   │   ├── Grafico.entity.ts                    # Entidad principal del gráfico
│   │   └── index.ts                              # Exports
│   │
│   ├── 📋 types/
│   │   ├── graficos.types.ts                     # 15+ tipos de gráficos definidos
│   │   └── index.ts                              # Exports
│   │
│   └── 🔌 repositories/
│       ├── IGrafico.repository.ts                # Interface del repositorio
│       └── index.ts                              # Exports
│
├── 💼 application/                               # CAPA DE APLICACIÓN (Lógica de negocio)
│   │
│   └── 🎯 use-cases/
│       ├── ValidarGrafico.usecase.ts             # Validación de gráficos
│       ├── ObtenerTipoGrafico.usecase.ts         # Identificación de tipo
│       ├── TransformarDatosGrafico.usecase.ts    # Transformación de datos
│       └── index.ts                              # Exports
│
├── 🏗️ infrastructure/                            # CAPA DE INFRAESTRUCTURA (Implementaciones)
│   │
│   ├── 💾 repositories/
│   │   ├── GraficoLocalStorage.repository.ts     # Caché local de gráficos
│   │   └── index.ts                              # Exports
│   │
│   └── 🔄 adapters/
│       ├── GraficoBackend.adapter.ts             # Normalización de datos backend
│       └── index.ts                              # Exports
│
├── 🎨 presentation/                              # CAPA DE PRESENTACIÓN (UI/UX)
│   │
│   ├── ⚛️ components/
│   │   ├── GraficoRenderer.tsx                   # ⭐ Componente principal selector
│   │   ├── EcuacionCajas.tsx                     # Ecuaciones con cajas
│   │   ├── TablaPrecios.tsx                      # Tablas de precios
│   │   ├── BarrasComparacion.tsx                 # Gráficos de barras
│   │   ├── TablaValores.tsx                      # Tablas genéricas
│   │   ├── BloqueAgrupados.tsx                   # Bloques agrupados
│   │   └── index.ts                              # Exports
│   │
│   ├── 🪝 hooks/
│   │   ├── useGraficosEducativos.ts              # Hook principal del feature
│   │   └── index.ts                              # Exports
│   │
│   ├── 💅 styles/
│   │   ├── colores-minedu.css                    # Variables de colores educativos
│   │   ├── graficos.css                          # Estilos globales
│   │   ├── EcuacionCajas.css                     # Estilos de ecuaciones
│   │   ├── TablaPrecios.css                      # Estilos de tablas de precios
│   │   ├── BarrasComparacion.css                 # Estilos de barras
│   │   ├── TablaValores.css                      # Estilos de tablas
│   │   └── BloqueAgrupados.css                   # Estilos de bloques
│   │
│   └── 📝 examples/
│       ├── IntegracionProcesoPedagogico.example.tsx   # Ejemplo de integración
│       ├── GaleriaEjemplos.example.tsx                # Galería completa
│       └── index.ts                                    # Exports
│
├── 📦 index.ts                                    # Barrel export principal
└── 📖 README.md                                   # Documentación del feature
```

---

## 🔄 Flujo de Datos entre Capas

```
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND API                             │
│                 (Envía JSON con gráficos)                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    🔄 INFRASTRUCTURE                            │
│                                                                 │
│  GraficoBackendAdapter.adaptarDesdeBackend()                   │
│  ├─ Normaliza estructura                                       │
│  ├─ Adapta diferentes formatos                                 │
│  └─ Retorna ConfiguracionGrafico                               │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    💼 APPLICATION                               │
│                                                                 │
│  TransformarDatosGraficoUseCase.execute()                      │
│  ├─ Aplica valores por defecto                                 │
│  └─ Normaliza estructura                                        │
│                                                                 │
│  ValidarGraficoUseCase.execute()                               │
│  ├─ Valida tipo de gráfico                                     │
│  ├─ Valida elementos                                            │
│  └─ Retorna errores si hay                                      │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    🎨 PRESENTATION                              │
│                                                                 │
│  useGraficosEducativos() Hook                                  │
│  ├─ Orquesta casos de uso                                      │
│  └─ Maneja estado de errores                                    │
│                                                                 │
│  GraficoRenderer Component                                      │
│  ├─ Valida gráfico                                             │
│  ├─ Selecciona componente correcto                             │
│  └─ Renderiza                                                   │
│           │                                                      │
│           ├─→ EcuacionCajas                                     │
│           ├─→ TablaPrecios                                      │
│           ├─→ BarrasComparacion                                 │
│           ├─→ TablaValores                                      │
│           └─→ BloqueAgrupados                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                      🖥️ DOM / BROWSER                           │
│                   (Renderización Final)                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Resumen de Archivos Creados

### Dominio (5 archivos)
- ✅ `domain/entities/Grafico.entity.ts`
- ✅ `domain/entities/index.ts`
- ✅ `domain/types/graficos.types.ts`
- ✅ `domain/types/index.ts`
- ✅ `domain/repositories/IGrafico.repository.ts`
- ✅ `domain/repositories/index.ts`

### Aplicación (4 archivos)
- ✅ `application/use-cases/ValidarGrafico.usecase.ts`
- ✅ `application/use-cases/ObtenerTipoGrafico.usecase.ts`
- ✅ `application/use-cases/TransformarDatosGrafico.usecase.ts`
- ✅ `application/use-cases/index.ts`

### Infraestructura (4 archivos)
- ✅ `infrastructure/repositories/GraficoLocalStorage.repository.ts`
- ✅ `infrastructure/repositories/index.ts`
- ✅ `infrastructure/adapters/GraficoBackend.adapter.ts`
- ✅ `infrastructure/adapters/index.ts`

### Presentación (20 archivos)
**Componentes:**
- ✅ `presentation/components/GraficoRenderer.tsx`
- ✅ `presentation/components/EcuacionCajas.tsx`
- ✅ `presentation/components/TablaPrecios.tsx`
- ✅ `presentation/components/BarrasComparacion.tsx`
- ✅ `presentation/components/TablaValores.tsx`
- ✅ `presentation/components/BloqueAgrupados.tsx`
- ✅ `presentation/components/index.ts`

**Hooks:**
- ✅ `presentation/hooks/useGraficosEducativos.ts`
- ✅ `presentation/hooks/index.ts`

**Estilos:**
- ✅ `presentation/styles/colores-minedu.css`
- ✅ `presentation/styles/graficos.css`
- ✅ `presentation/styles/EcuacionCajas.css`
- ✅ `presentation/styles/TablaPrecios.css`
- ✅ `presentation/styles/BarrasComparacion.css`
- ✅ `presentation/styles/TablaValores.css`
- ✅ `presentation/styles/BloqueAgrupados.css`

**Ejemplos:**
- ✅ `presentation/examples/IntegracionProcesoPedagogico.example.tsx`
- ✅ `presentation/examples/GaleriaEjemplos.example.tsx`
- ✅ `presentation/examples/index.ts`

### Raíz del Feature (2 archivos)
- ✅ `index.ts` (Barrel export principal)
- ✅ `README.md` (Documentación)

### Documentación Global (1 archivo)
- ✅ `GUIA_GRAFICOS_EDUCATIVOS.md` (Raíz del proyecto)

---

## 🎯 Total: 36 archivos creados

---

## 🚀 Cómo Empezar a Usar

### 1️⃣ Importar en tu componente

```tsx
import { GraficoRenderer } from '@/features/graficos-educativos';
```

### 2️⃣ Usar con datos del backend

```tsx
function MiComponente({ proceso }) {
  return (
    <div>
      {proceso.graficoProblema && (
        <GraficoRenderer grafico={proceso.graficoProblema} />
      )}
    </div>
  );
}
```

### 3️⃣ Usar con el hook (recomendado)

```tsx
import { GraficoRenderer, useGraficosEducativos } from '@/features/graficos-educativos';

function MiComponente({ proceso }) {
  const { transformarDesdeBackend } = useGraficosEducativos();
  
  const grafico = transformarDesdeBackend(proceso.graficoProblema);
  
  return grafico ? <GraficoRenderer grafico={grafico} /> : null;
}
```

---

## 🎨 Tipos de Gráficos Implementados

| # | Tipo | Componente | Estado |
|---|------|-----------|--------|
| 1 | Ecuación con Cajas | `EcuacionCajas.tsx` | ✅ Implementado |
| 2 | Tabla de Precios | `TablaPrecios.tsx` | ✅ Implementado |
| 3 | Barras de Comparación | `BarrasComparacion.tsx` | ✅ Implementado |
| 4 | Tabla de Valores | `TablaValores.tsx` | ✅ Implementado |
| 5 | Bloques Agrupados | `BloqueAgrupados.tsx` | ✅ Implementado |
| 6 | Recta Numérica | - | 🔜 Por implementar |
| 7 | Círculos de Fracción | - | 🔜 Por implementar |
| 8 | Barras de Fracción | - | 🔜 Por implementar |
| 9 | Diagrama de Dinero | - | 🔜 Por implementar |
| 10 | Figuras Geométricas | - | 🔜 Por implementar |

---

## 📚 Documentación Completa

1. **README del feature**: `src/features/graficos-educativos/README.md`
2. **Guía de implementación**: `GUIA_GRAFICOS_EDUCATIVOS.md`
3. **Ejemplos de código**: `src/features/graficos-educativos/presentation/examples/`
4. **Este archivo**: Estructura visual del proyecto

---

## 🎓 Aprende más

- Revisa los ejemplos en `presentation/examples/`
- Consulta la guía completa en `GUIA_GRAFICOS_EDUCATIVOS.md`
- Explora los tipos en `domain/types/graficos.types.ts`
- Prueba los componentes en la galería de ejemplos

---

✨ **Feature implementado siguiendo Clean Architecture** ✨
