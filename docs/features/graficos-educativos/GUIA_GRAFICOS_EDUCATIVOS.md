# 📚 Guía de Implementación - Feature Gráficos Educativos

## 🎯 Objetivo

Implementar un sistema de renderizado de gráficos educativos siguiendo Clean Architecture, separando dominio, casos de uso, repositorios y presentación.

---

## 📐 Arquitectura del Feature

```
features/graficos-educativos/
│
├── domain/                          # 🟦 CAPA DE DOMINIO
│   ├── entities/                    # Entidades de negocio
│   │   ├── Grafico.entity.ts
│   │   └── index.ts
│   ├── types/                       # Tipos e interfaces del dominio
│   │   ├── graficos.types.ts
│   │   └── index.ts
│   └── repositories/                # Contratos (interfaces) de repositorios
│       ├── IGrafico.repository.ts
│       └── index.ts
│
├── application/                     # 🟩 CAPA DE APLICACIÓN
│   └── use-cases/                   # Lógica de negocio
│       ├── ValidarGrafico.usecase.ts
│       ├── ObtenerTipoGrafico.usecase.ts
│       ├── TransformarDatosGrafico.usecase.ts
│       └── index.ts
│
├── infrastructure/                  # 🟨 CAPA DE INFRAESTRUCTURA
│   ├── repositories/                # Implementaciones de repositorios
│   │   ├── GraficoLocalStorage.repository.ts
│   │   └── index.ts
│   └── adapters/                    # Adaptadores externos
│       ├── GraficoBackend.adapter.ts
│       └── index.ts
│
├── presentation/                    # 🟪 CAPA DE PRESENTACIÓN
│   ├── components/                  # Componentes React
│   │   ├── GraficoRenderer.tsx      # Componente principal
│   │   ├── EcuacionCajas.tsx
│   │   ├── TablaPrecios.tsx
│   │   ├── BarrasComparacion.tsx
│   │   ├── TablaValores.tsx
│   │   ├── BloqueAgrupados.tsx
│   │   └── index.ts
│   ├── hooks/                       # Hooks personalizados
│   │   ├── useGraficosEducativos.ts
│   │   └── index.ts
│   ├── styles/                      # Estilos CSS
│   │   ├── colores-minedu.css
│   │   ├── graficos.css
│   │   ├── EcuacionCajas.css
│   │   ├── TablaPrecios.css
│   │   ├── BarrasComparacion.css
│   │   ├── TablaValores.css
│   │   └── BloqueAgrupados.css
│   └── examples/                    # Ejemplos de uso
│       ├── IntegracionProcesoPedagogico.example.tsx
│       ├── GaleriaEjemplos.example.tsx
│       └── index.ts
│
├── index.ts                         # Barrel export principal
└── README.md                        # Documentación del feature
```

---

## 🔵 Capa de Dominio

### Responsabilidades

- Define las entidades del negocio
- Establece tipos e interfaces
- No tiene dependencias externas
- Representa la lógica de negocio pura

### Entidades

**`Grafico.entity.ts`**
```typescript
export class GraficoEducativo {
  constructor(
    public readonly tipoGrafico: string,
    public readonly elementos: any[],
    public readonly titulo?: string,
    public readonly descripcion?: string,
    public readonly opciones?: Record<string, any>
  ) {}

  public validar(): boolean {
    // Lógica de validación
  }
}
```

### Tipos

**`graficos.types.ts`**
- Enums (TipoGraficoMatematica, ColorGrafico)
- Interfaces base (ConfiguracionGrafico)
- Interfaces específicas (GraficoEcuacionCajas, GraficoTablaPrecios, etc.)

### Repositorios (Interfaces)

**`IGrafico.repository.ts`**
```typescript
export interface IGraficoRepository {
  obtenerPorId(id: string): Promise<ConfiguracionGrafico | null>;
  obtenerPorSesion(sesionId: string): Promise<ConfiguracionGrafico[]>;
  guardar(id: string, grafico: ConfiguracionGrafico): Promise<void>;
  eliminar(id: string): Promise<void>;
  limpiarCache(): Promise<void>;
}
```

---

## 🟢 Capa de Aplicación

### Responsabilidades

- Implementa los casos de uso
- Orquesta la lógica de negocio
- No depende de frameworks
- Usa las abstracciones del dominio

### Casos de Uso

#### 1. ValidarGraficoUseCase

Valida que un gráfico tenga la estructura mínima requerida.

```typescript
const useCase = new ValidarGraficoUseCase();
const resultado = useCase.execute(grafico);

if (!resultado.esValido) {
  console.log(resultado.errores);
}
```

#### 2. ObtenerTipoGraficoUseCase

Determina qué tipo de gráfico debe renderizarse.

```typescript
const useCase = new ObtenerTipoGraficoUseCase();
const resultado = useCase.execute("ecuacion_cajas");

if (resultado.esConocido) {
  // Procesar gráfico
}
```

#### 3. TransformarDatosGraficoUseCase

Transforma y normaliza los datos recibidos del backend.

```typescript
const useCase = new TransformarDatosGraficoUseCase();
const grafico = useCase.execute(datosBackend, {
  validarEstructura: true,
  aplicarDefectos: true
});
```

---

## 🟡 Capa de Infraestructura

### Responsabilidades

- Implementa las interfaces del dominio
- Maneja detalles técnicos (API, LocalStorage, etc.)
- Adapta datos externos al formato del dominio

### Repositorios

**GraficoLocalStorageRepository**

Implementación de caché local usando LocalStorage:

```typescript
const repo = new GraficoLocalStorageRepository();

// Guardar
await repo.guardar('grafico-1', grafico);

// Obtener
const grafico = await repo.obtenerPorId('grafico-1');

// Obtener por sesión
const graficos = await repo.obtenerPorSesion('sesion-123');

// Limpiar
await repo.limpiarCache();
```

### Adaptadores

**GraficoBackendAdapter**

Normaliza datos del backend:

```typescript
// Adaptar un gráfico
const grafico = GraficoBackendAdapter.adaptarDesdeBackend(respuesta);

// Adaptar múltiples gráficos
const graficos = GraficoBackendAdapter.adaptarMultiplesDesdeBackend(array);

// Adaptar gráficos de sesión
const { graficoProblema, graficoSolucion } = 
  GraficoBackendAdapter.adaptarGraficosDeSesion(sesion);
```

---

## 🟣 Capa de Presentación

### Responsabilidades

- Componentes React de UI
- Hooks personalizados
- Estilos CSS
- Ejemplos de uso

### Componentes

#### GraficoRenderer (Componente Principal)

Selector que renderiza el tipo correcto de gráfico:

```tsx
import { GraficoRenderer } from '@/features/graficos-educativos';

<GraficoRenderer 
  grafico={grafico}
  className="mi-clase"
  mostrarErrores={true}
/>
```

#### Componentes Específicos

Cada tipo de gráfico tiene su componente:

- **EcuacionCajas** - Ecuaciones con cajas visuales
- **TablaPrecios** - Tablas de precios
- **BarrasComparacion** - Gráficos de barras
- **TablaValores** - Tablas genéricas
- **BloqueAgrupados** - Bloques agrupados

### Hooks

**useGraficosEducativos**

Hook que facilita el trabajo con gráficos:

```tsx
const {
  validarGrafico,
  obtenerTipoGrafico,
  transformarDesdeBackend,
  procesarGraficosDeSesion,
  tiposSoportados,
  error,
  limpiarError
} = useGraficosEducativos();

// Usar
const grafico = transformarDesdeBackend(datosBackend);
const validacion = validarGrafico(grafico);
```

### Estilos

**Variables CSS (colores-minedu.css)**
```css
:root {
  --color-azul: #4A90E2;
  --color-rojo: #E24A4A;
  --color-amarillo: #F5D547;
  --color-verde: #7ED321;
  /* ... más colores */
}
```

Cada componente tiene su archivo CSS específico.

---

## 🚀 Cómo Usar el Feature

### 1. Importación Básica

```tsx
import { GraficoRenderer } from '@/features/graficos-educativos';
```

### 2. Uso Simple

```tsx
function MiComponente() {
  const grafico = {
    tipoGrafico: "ecuacion_cajas",
    elementos: [
      { tipo: "caja", contenido: "12", color: "azul" },
      { tipo: "operador", contenido: "+" },
      { tipo: "caja", contenido: "6", color: "azul" }
    ]
  };

  return <GraficoRenderer grafico={grafico} />;
}
```

### 3. Uso con Hook

```tsx
function ComponenteConHook() {
  const { transformarDesdeBackend } = useGraficosEducativos();
  
  const grafico = transformarDesdeBackend(datosBackend);
  
  return grafico ? <GraficoRenderer grafico={grafico} /> : null;
}
```

### 4. Integración con Proceso Pedagógico

```tsx
import { 
  GraficoRenderer, 
  useGraficosEducativos 
} from '@/features/graficos-educativos';

function ProcesoPedagogico({ proceso }) {
  const { procesarGraficosDeSesion } = useGraficosEducativos();
  
  const { graficoProblema, graficoSolucion } = 
    procesarGraficosDeSesion(proceso);

  return (
    <div>
      <h3>{proceso.proceso}</h3>
      
      {proceso.problemaMatematico && (
        <div>
          <p>{proceso.problemaMatematico}</p>
          {graficoProblema && <GraficoRenderer grafico={graficoProblema} />}
        </div>
      )}
      
      {graficoSolucion && (
        <details>
          <summary>Ver solución</summary>
          <GraficoRenderer grafico={graficoSolucion} />
        </details>
      )}
    </div>
  );
}
```

---

## 📊 Tipos de Gráficos Disponibles

| Tipo | Descripción | Uso |
|------|-------------|-----|
| `ecuacion_cajas` | Ecuaciones con cajas | Operaciones matemáticas |
| `tabla_precios` | Tabla de precios | Problemas de compra/venta |
| `barras_comparacion` | Gráfico de barras | Comparar cantidades |
| `tabla_valores` | Tabla genérica | Datos tabulares |
| `bloques_agrupados` | Bloques agrupados | Representar conjuntos |
| `recta_numerica` | Recta numérica | Ubicar números |
| `circulos_fraccion` | Círculos fraccionados | Fracciones visuales |
| `barras_fraccion` | Barras fraccionadas | Fracciones en barras |

---

## ✅ Ventajas de esta Arquitectura

### 1. Separación de Responsabilidades
Cada capa tiene una responsabilidad clara y bien definida.

### 2. Testeable
Cada componente puede probarse independientemente.

### 3. Mantenible
Los cambios en una capa no afectan a las demás.

### 4. Escalable
Fácil agregar nuevos tipos de gráficos o funcionalidades.

### 5. Reutilizable
Los casos de uso pueden usarse en diferentes contextos.

### 6. Framework Agnóstico
El dominio y casos de uso no dependen de React.

---

## 🧪 Testing

### Domain

```typescript
describe('GraficoEducativo', () => {
  it('debe validar correctamente', () => {
    const grafico = new GraficoEducativo('test', []);
    expect(grafico.validar()).toBe(false);
  });
});
```

### Use Cases

```typescript
describe('ValidarGraficoUseCase', () => {
  it('debe retornar errores para gráfico inválido', () => {
    const useCase = new ValidarGraficoUseCase();
    const resultado = useCase.execute(null);
    expect(resultado.esValido).toBe(false);
  });
});
```

### Components

```typescript
describe('GraficoRenderer', () => {
  it('debe renderizar ecuación correctamente', () => {
    const grafico = { tipoGrafico: 'ecuacion_cajas', elementos: [] };
    render(<GraficoRenderer grafico={grafico} />);
    // assertions
  });
});
```

---

## 🔄 Flujo de Datos

```
Backend Response
      ↓
GraficoBackendAdapter.adaptarDesdeBackend()
      ↓
TransformarDatosGraficoUseCase.execute()
      ↓
ValidarGraficoUseCase.execute()
      ↓
GraficoRenderer (selecciona componente)
      ↓
Componente Específico (EcuacionCajas, TablaPrecios, etc.)
      ↓
Renderización final
```

---

## 📝 Próximos Pasos

1. Implementar más tipos de gráficos
2. Agregar animaciones
3. Implementar interactividad
4. Crear sistema de exportación a imagen
5. Agregar modo oscuro
6. Implementar tests unitarios
7. Crear storybook de componentes

---

## 💡 Tips de Desarrollo

1. **Siempre validar** los gráficos antes de renderizar
2. **Usar el hook** `useGraficosEducativos` para lógica compleja
3. **Cachear** gráficos frecuentemente usados
4. **Manejar errores** gracefully con el adaptador
5. **Seguir** la paleta de colores MINEDU

---

## 📚 Recursos

- [README del feature](./README.md)
- [Ejemplos de integración](./presentation/examples/)
- [Documentación de tipos](./domain/types/graficos.types.ts)
- [Guía de estilos](./presentation/styles/)

---

¿Dudas? Revisa los ejemplos en `presentation/examples/` o consulta el README.md
