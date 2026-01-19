# 🤖 Sistema de Sugerencia Automática de Competencias

## 📋 Descripción

Sistema modular que utiliza IA para sugerir automáticamente la competencia más apropiada cuando el usuario selecciona un tema curricular en el Paso 2 del cuestionario.

---

## 🏗️ Arquitectura

### Flujo de Datos

```
Usuario selecciona Tema
    ↓
temaId guardado en Zustand Store
    ↓
useCompetenciaSugerida (hook) detecta cambio
    ↓
POST /api/ia/sugerir-competencia { areaId, temaId }
    ↓
IA Backend analiza y responde
    ↓
CompetenciaSugerida muestra resultado
    ↓
Competencia aplicada automáticamente
```

### Componentes Creados

1. **Servicio**: `src/services/competencias.service.ts`
2. **Hook**: `src/hooks/useCompetenciaSugerida.ts`
3. **Componente UI**: `src/components/CompetenciaSugerida.tsx`
4. **Integración**: `src/components/StepsCuestionarioCrearSesion/Step2.tsx`

---

## 📁 Archivos Modificados/Creados

### 1. `src/services/competencias.service.ts`

**Agregado:**
```typescript
export interface ICompetenciaSugerida {
  competenciaId: number;
  competencia: {
    id: number;
    nombre: string;
    descripcion: string;
  };
  razonamiento: string;
  tema: {
    id: number;
    nombre: string;
  };
}

export interface SugerenciaCompetenciaResponse {
  success: boolean;
  data: ICompetenciaSugerida;
  message: string;
}

async function sugerirCompetencia(
  areaId: number,
  temaId: number
): Promise<AxiosResponse<SugerenciaCompetenciaResponse>>
```

**Función:**
- Consume endpoint `/api/ia/sugerir-competencia`
- Parámetros: `{ areaId, temaId }`
- Retorna: Competencia sugerida con razonamiento de la IA

---

### 2. `src/hooks/useCompetenciaSugerida.ts` (NUEVO)

**Hook personalizado que maneja la lógica de sugerencia**

```typescript
interface UseCompetenciaSugeridaProps {
  areaId: number | null;
  temaId: number | null;
  enabled?: boolean;
}

interface UseCompetenciaSugeridaReturn {
  sugerencia: ICompetenciaSugerida | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearSugerencia: () => void;
}
```

**Características:**
- ✅ Auto-ejecuta cuando cambian `areaId` o `temaId`
- ✅ Manejo de estados: `loading`, `error`, `sugerencia`
- ✅ Control con `enabled` para habilitar/deshabilitar
- ✅ Función `refetch()` para consultar manualmente
- ✅ Función `clearSugerencia()` para limpiar estado
- ✅ No muestra toast en error 404 (sin competencias)

**Ejemplo de uso:**
```typescript
const { sugerencia, loading, clearSugerencia } = useCompetenciaSugerida({
  areaId: 7,
  temaId: 15,
  enabled: true
});
```

---

### 3. `src/components/CompetenciaSugerida.tsx` (NUEVO)

**Componente UI para mostrar la sugerencia**

```typescript
interface CompetenciaSugeridaProps {
  sugerencia: ICompetenciaSugerida | null;
  loading?: boolean;
  onAceptar?: (competenciaId: number, competenciaNombre: string) => void;
  onRechazar?: () => void;
  variant?: "auto" | "confirmable";
  className?: string;
}
```

**Variantes:**

#### Modo `auto` (predeterminado)
- ✅ Fondo verde
- ✅ Sin botones de confirmación
- ✅ Indica que se aplicó automáticamente
- ✅ Mensaje: "✨ Competencia seleccionada automáticamente"

#### Modo `confirmable`
- 🔵 Fondo azul
- 🔵 Botones "Aplicar sugerencia" y "Elegir manualmente"
- 🔵 Mensaje: "🤖 Competencia sugerida por IA"
- 🔵 Usuario debe confirmar antes de aplicar

**Estados visuales:**
- **Loading**: Spinner animado + "🤖 Analizando tema curricular..."
- **Sugerencia**: Card con competencia + razonamiento de la IA
- **Null**: No renderiza nada

---

### 4. `src/components/StepsCuestionarioCrearSesion/Step2.tsx`

**Modificaciones:**

#### Imports agregados:
```typescript
import { useCompetenciaSugerida } from "@/hooks/useCompetenciaSugerida";
import { CompetenciaSugerida } from "@/components/CompetenciaSugerida";
```

#### Estados agregados:
```typescript
const [areaId, setAreaId] = useState<number | null>(null);
```

#### Hook integrado:
```typescript
const { sugerencia, loading: loadingSugerencia, clearSugerencia } = useCompetenciaSugerida({
  areaId,
  temaId: sesion?.temaId || null,
  enabled: !!areaId && !!sesion?.temaId,
});
```

#### Efecto para aplicar automáticamente:
```typescript
useEffect(() => {
  if (sugerencia && !competenciaSeleccionada) {
    handleClick(sugerencia.competencia.nombre);
  }
}, [sugerencia]);
```

#### UI agregada (después de SelectorTemas):
```tsx
{(loadingSugerencia || sugerencia) && (
  <div className="mb-8">
    <CompetenciaSugerida
      sugerencia={sugerencia}
      loading={loadingSugerencia}
      variant="auto"
    />
  </div>
)}
```

---

## 🔌 API Endpoint Requerido

### `POST /api/ia/sugerir-competencia`

**Request:**
```json
{
  "areaId": 7,
  "temaId": 15
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "competenciaId": 23,
    "competencia": {
      "id": 23,
      "nombre": "Resuelve problemas de cantidad",
      "descripcion": "Consiste en que el estudiante..."
    },
    "razonamiento": "Esta competencia es la más apropiada porque el tema requiere traducir situaciones a expresiones numéricas",
    "tema": {
      "id": 15,
      "nombre": "Resolvemos problemas de dos pasos con dos operaciones"
    }
  },
  "message": "Competencia sugerida exitosamente"
}
```

**Error 404 (sin competencias):**
```json
{
  "success": false,
  "message": "No se encontraron competencias para esta área",
  "data": null
}
```

---

## 🎯 Flujo de Usuario (UX)

1. Usuario selecciona **Área** (ej: Matemática) → `areaId = 7`
2. Usuario selecciona **Grado** (ej: Segundo Grado) → `gradoId = 2`
3. Sistema carga **temas disponibles** → Componente `SelectorTemas`
4. Usuario selecciona **tema** → `sesion.temaId = 15`
5. **Automáticamente**:
   - Hook detecta cambio en `temaId`
   - Muestra spinner "🤖 Analizando tema curricular..."
   - Consulta a `/api/ia/sugerir-competencia`
6. IA responde con competencia sugerida
7. **UI muestra**: Card verde con "✨ Competencia seleccionada automáticamente"
8. **Sistema aplica automáticamente** la competencia al formulario
9. Usuario puede **cambiar manualmente** si lo desea (limpia la sugerencia)

---

## ⚙️ Configuración

### Modo Automático (actual)
```tsx
<CompetenciaSugerida
  sugerencia={sugerencia}
  loading={loading}
  variant="auto" // ← Aplica automáticamente
/>
```

### Modo Confirmable (requiere acción del usuario)
```tsx
<CompetenciaSugerida
  sugerencia={sugerencia}
  loading={loading}
  variant="confirmable"
  onAceptar={(id, nombre) => handleClick(nombre)}
  onRechazar={() => clearSugerencia()}
/>
```

---

## 🧪 Testing Manual

### Test 1: Sugerencia Automática
1. Ir al Paso 2
2. Seleccionar Área: Matemática
3. Seleccionar Grado: Segundo Grado
4. Seleccionar Tema: "Resolvemos problemas de dos pasos"
5. **Verificar**: 
   - ✅ Aparece spinner de carga
   - ✅ Aparece card verde con competencia sugerida
   - ✅ Competencia se aplica automáticamente
   - ✅ Capacidades se cargan automáticamente

### Test 2: Cambio Manual
1. Después de aplicar sugerencia automática
2. Hacer clic en otra competencia manualmente
3. **Verificar**:
   - ✅ Card verde desaparece
   - ✅ Nueva competencia se selecciona
   - ✅ Capacidades se actualizan

### Test 3: Error Handling
1. Desconectar backend o simular error 500
2. Seleccionar tema
3. **Verificar**:
   - ✅ Aparece toast de error
   - ✅ No se rompe la UI
   - ✅ Usuario puede seleccionar manualmente

### Test 4: Sin Competencias (404)
1. Backend retorna 404
2. **Verificar**:
   - ✅ NO aparece toast de error (silencioso)
   - ✅ Usuario puede continuar seleccionando manualmente

---

## 🚀 Ventajas de la Arquitectura Modular

### ✅ Reutilizable
- Hook `useCompetenciaSugerida` puede usarse en otros componentes
- Componente `CompetenciaSugerida` tiene dos variantes

### ✅ Testeable
- Lógica separada en hook (fácil de testear)
- UI separada en componente (fácil de visualizar)

### ✅ Mantenible
- Cada pieza tiene responsabilidad única
- Fácil cambiar de modo automático a confirmable

### ✅ Extensible
- Fácil agregar caché de sugerencias
- Fácil agregar debounce
- Fácil agregar historial de sugerencias

---

## 🔄 Posibles Mejoras Futuras

### 1. Caché de Sugerencias
```typescript
const cache = new Map<string, ICompetenciaSugerida>();
const cacheKey = `${areaId}-${temaId}`;

if (cache.has(cacheKey)) {
  setSugerencia(cache.get(cacheKey)!);
  return;
}
```

### 2. Debounce (si el usuario cambia rápido)
```typescript
import { useDebounce } from '@/hooks/useDebounce';

const temaDebounced = useDebounce(temaId, 500);
```

### 3. Historial de Sugerencias
```typescript
const [historial, setHistorial] = useState<ICompetenciaSugerida[]>([]);
```

### 4. Modo Silencioso (sin UI)
```typescript
const { sugerencia } = useCompetenciaSugerida({
  areaId,
  temaId,
  silent: true // ← No muestra nada, solo aplica
});
```

---

## 📊 Dependencias

- **Zustand**: Store global para sesión
- **Axios**: HTTP client
- **Shadcn/ui**: Componentes UI (Card, Button)
- **Lucide React**: Iconos (Sparkles, Lightbulb, CheckCircle2, etc.)
- **Tailwind CSS**: Estilos

---

## 🐛 Debugging

### Ver estado del hook
```typescript
console.log('Sugerencia:', sugerencia);
console.log('Loading:', loading);
console.log('Error:', error);
console.log('AreaId:', areaId);
console.log('TemaId:', sesion?.temaId);
```

### Ver request/response
```typescript
// En competencias.service.ts
console.log('Requesting:', { areaId, temaId });
const response = await instance.post(...);
console.log('Response:', response.data);
```

---

## 📚 Recursos

- **Endpoint Backend**: `/api/ia/sugerir-competencia`
- **Store**: `useSesionStore()` → `sesion.temaId`, `sesion.propositoAprendizaje.competencia`
- **Componente Padre**: `Step2.tsx`
- **Componente Hijo**: `CompetenciaSugerida.tsx`

---

## ✅ Checklist de Implementación

- [x] Crear servicio `sugerirCompetencia()`
- [x] Crear hook `useCompetenciaSugerida`
- [x] Crear componente `CompetenciaSugerida`
- [x] Integrar en `Step2.tsx`
- [x] Guardar `areaId` en estado local
- [x] Aplicar sugerencia automáticamente
- [x] Limpiar sugerencia al cambiar manualmente
- [x] Manejo de errores
- [x] UI de loading
- [x] UI de sugerencia (modo auto)
- [x] TypeScript sin errores

---

## 🎨 Screenshots

### Loading State
```
┌─────────────────────────────────────────┐
│ 🤖 Analizando tema curricular...       │
│ La IA está sugiriendo la competencia   │
│ más apropiada                           │
└─────────────────────────────────────────┘
```

### Success State (Auto)
```
┌─────────────────────────────────────────┐
│ ✨ Competencia seleccionada            │
│    automáticamente                      │
│                                         │
│ Resuelve problemas de cantidad         │
│                                         │
│ 💡 Esta competencia es la más          │
│    apropiada porque el tema requiere   │
│    traducir situaciones a expresiones  │
│    numéricas                            │
└─────────────────────────────────────────┘
```

---

## 👨‍💻 Autor

Sistema implementado de forma modular para facilitar mantenimiento y testing.

**Fecha**: 11 de enero de 2026
