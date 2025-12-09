# Step3 - Componentes Modulares

Este directorio contiene los componentes modulares del **Paso 3: Criterios de Evaluación** del cuestionario de creación de sesión.

## 📁 Estructura

```
Step3Components/
├── Step3Header.tsx              # Encabezado del paso 3
├── ContextoProblematica.tsx     # Muestra el contexto de la problemática
├── CriteriosList.tsx            # Contenedor principal de la lista
├── CriterioCard.tsx             # Tarjeta individual de criterio
├── CriterioFormulario.tsx       # Formulario de edición
├── CriterioDetalles.tsx         # Vista de solo lectura
├── NavigationButtons.tsx        # Botones de navegación
├── useCriterios.ts              # Hook con toda la lógica de negocio
└── index.ts                     # Barrel export
```

## 🎯 Componentes

### Step3Header
**Propósito**: Muestra el encabezado del paso 3  
**Props**: Ninguna  
**Responsabilidad**: UI puro - Badge "Paso 3 de 3", título con gradiente, ícono Brain

```tsx
<Step3Header />
```

---

### ContextoProblematica
**Propósito**: Muestra información contextual de la problemática seleccionada  
**Props**:
- `contexto: ICriterioContexto | null` - Información del contexto

**Responsabilidad**: Renderizar card con nombre, descripción y base de la problemática

```tsx
<ContextoProblematica contexto={contexto} />
```

---

### CriteriosList
**Propósito**: Contenedor principal que maneja la lista de criterios  
**Props**:
- `criterios: ICriterioIA[]` - Lista completa de criterios
- `criteriosSeleccionados: ICriterioIA[]` - Criterios seleccionados
- `loadingCriterios: boolean` - Estado de carga
- `criterioEnEdicion: string | null` - ID del criterio en edición
- `criterioEditado: ICriterioIA | null` - Criterio siendo editado
- `onSeleccionar: (criterio: ICriterioIA) => void` - Handler de selección
- `onEditar: (criterio: ICriterioIA, e: React.MouseEvent) => void` - Handler de edición
- `onGuardar: (e: React.MouseEvent) => void` - Handler de guardado
- `onCancelar: (e: React.MouseEvent) => void` - Handler de cancelación
- `onCambioCampo: (campo: keyof ICriterioIA, valor: string) => void` - Handler de cambio

**Responsabilidad**: 
- Manejar estados de carga (skeletons)
- Manejar estado vacío
- Renderizar grid responsive
- Mapear criterios a CriterioCard

```tsx
<CriteriosList
  criterios={criterios}
  criteriosSeleccionados={criteriosSeleccionados}
  loadingCriterios={loadingCriterios}
  {...handlers}
/>
```

---

### CriterioCard
**Propósito**: Tarjeta individual de un criterio con estados visuales  
**Props**:
- `criterio: ICriterioIA` - Criterio a mostrar
- `isSelected: boolean` - Si está seleccionado
- `isEditing: boolean` - Si está en modo edición
- `onSelect: () => void` - Handler de selección
- `onEditar: (e: React.MouseEvent) => void` - Iniciar edición
- `onGuardar: (e: React.MouseEvent) => void` - Guardar cambios
- `onCancelar: (e: React.MouseEvent) => void` - Cancelar edición
- `onCambioCampo: (campo: keyof ICriterioIA, valor: string) => void` - Cambiar campo

**Responsabilidad**:
- Manejar estados visuales (normal, seleccionado, editando)
- Mostrar botones Edit/Save/Cancel
- Alternar entre CriterioFormulario y CriterioDetalles
- Prevenir selección durante edición

```tsx
<CriterioCard
  criterio={criterio}
  isSelected={isSelected}
  isEditing={isEditing}
  onSelect={() => handleSelect(criterio)}
  {...editHandlers}
/>
```

---

### CriterioFormulario
**Propósito**: Formulario de edición inline para criterios  
**Props**:
- `criterio: ICriterioIA` - Criterio a editar
- `onCambioCampo: (campo: keyof ICriterioIA, valor: string) => void` - Handler de cambio

**Responsabilidad**:
- Renderizar 4 inputs (habilidad, conocimiento, condición, finalidad)
- Llamar handler en cada cambio
- Detener propagación de eventos

```tsx
<CriterioFormulario
  criterio={criterioEditado}
  onCambioCampo={handleCambioCampo}
/>
```

---

### CriterioDetalles
**Propósito**: Vista de solo lectura de un criterio  
**Props**:
- `criterio: ICriterioIA` - Criterio a mostrar
- `isSelected: boolean` - Si está seleccionado (para colores)

**Responsabilidad**:
- Mostrar los 4 campos del criterio
- Aplicar colores según selección

```tsx
<CriterioDetalles
  criterio={criterio}
  isSelected={isSelected}
/>
```

---

### NavigationButtons
**Propósito**: Botones de navegación del paso  
**Props**:
- `currentPage?: number` - Página actual (opcional)
- `criteriosSeleccionados: number` - Cantidad de criterios seleccionados
- `onPrevious: () => void` - Handler para retroceder
- `onNext: () => void` - Handler para avanzar

**Responsabilidad**:
- Renderizar botones Anterior/Siguiente
- Deshabilitar "Siguiente" si no hay selección
- Mostrar contador de seleccionados

```tsx
<NavigationButtons
  currentPage={pagina}
  criteriosSeleccionados={criteriosSeleccionados.length}
  onPrevious={() => setPagina(pagina - 1)}
  onNext={handleNextStep}
/>
```

---

## 🪝 Hook Personalizado

### useCriterios
**Propósito**: Encapsular toda la lógica de negocio del paso 3  
**Parámetros**:
```typescript
{
  areaId: number;
  gradoId: number;
  competenciaId: number;
  problematicaId: number | undefined;
  perfilCompleto: boolean | undefined;
}
```

**Retorna**:
```typescript
{
  criterios: ICriterioIA[];
  criteriosSeleccionados: ICriterioIA[];
  contexto: ICriterioContexto | null;
  loadingCriterios: boolean;
  criterioEnEdicion: string | null;
  criterioEditado: ICriterioIA | null;
  handleCriteriosSeleccionados: (criterio: ICriterioIA) => void;
  handleEditarCriterio: (criterio: ICriterioIA, e: React.MouseEvent) => void;
  handleGuardarEdicion: (e: React.MouseEvent) => void;
  handleCancelarEdicion: (e: React.MouseEvent) => void;
  handleCambioCampo: (campo: keyof ICriterioIA, valor: string) => void;
}
```

**Responsabilidad**:
- Gestión de estados
- Llamada a API `generarCriteriosIA`
- Validación de problematicaId
- Lógica de selección
- Lógica de edición
- Reconstrucción de `criterioCompleto`

**Uso**:
```tsx
const {
  criterios,
  criteriosSeleccionados,
  contexto,
  loadingCriterios,
  criterioEnEdicion,
  criterioEditado,
  handleCriteriosSeleccionados,
  handleEditarCriterio,
  handleGuardarEdicion,
  handleCancelarEdicion,
  handleCambioCampo,
} = useCriterios({
  areaId: cuestionarioState.area,
  gradoId: usuarioFromState.gradoId!,
  competenciaId: cuestionarioState.competencia,
  problematicaId: usuarioFromState.problematicaId,
  perfilCompleto: user?.perfilCompleto,
});
```

---

## 📦 Barrel Export (index.ts)

Todos los componentes y el hook se exportan desde `index.ts` para imports limpios:

```typescript
import {
  ContextoProblematica,
  CriteriosList,
  NavigationButtons,
  Step3Header,
  useCriterios,
} from './Step3Components';
```

---

## 🎨 Patrones Aplicados

### 1. **Single Responsibility Principle**
Cada componente tiene una única responsabilidad:
- `Step3Header` → Solo el encabezado
- `CriterioCard` → Gestión de una tarjeta individual
- `CriteriosList` → Contenedor y orquestación

### 2. **Separation of Concerns**
- **Lógica de negocio**: `useCriterios` hook
- **Presentación**: Componentes UI
- **Navegación**: `NavigationButtons` separado

### 3. **Component Composition**
```
CriteriosList
  └─ CriterioCard
       ├─ CriterioFormulario (modo edición)
       └─ CriterioDetalles (modo lectura)
```

### 4. **Custom Hooks**
Toda la lógica compleja extraída a `useCriterios` para:
- Reutilización
- Testability
- Separación de concerns

### 5. **Props Drilling Controlado**
Los handlers se pasan a través de props de manera clara y explícita.

---

## 🔄 Flujo de Datos

```
useCriterios (hook)
    ↓
  Step3 (componente padre)
    ↓
  ├─ Step3Header
  ├─ ContextoProblematica ← contexto
  ├─ CriteriosList ← criterios + handlers
  │    └─ CriterioCard (x N) ← criterio individual + handlers
  │         ├─ CriterioFormulario (edición)
  │         └─ CriterioDetalles (lectura)
  └─ NavigationButtons ← count + navigation handlers
```

---

## ✅ Ventajas de la Modularización

1. **Mantenibilidad**: Cada archivo tiene < 150 líneas
2. **Reutilizabilidad**: Componentes pueden usarse en otros contextos
3. **Testability**: Fácil crear tests unitarios para cada componente
4. **Legibilidad**: Código más fácil de entender y navegar
5. **Separación**: UI separada de lógica de negocio
6. **Escalabilidad**: Fácil agregar nuevas features

---

## 🛠️ Refactorización Realizada

**Antes**: `Step3.tsx` → ~440 líneas (monolítico)

**Después**: 
- `Step3.tsx` → ~92 líneas (orquestador)
- `useCriterios.ts` → 145 líneas (lógica)
- 7 componentes → 20-120 líneas cada uno

**Total**: ~600 líneas distribuidas en 9 archivos modulares

---

## 📝 Notas de Implementación

1. **Validación de problematicaId**: El hook valida que exista antes de llamar al API
2. **Auto-reconstrucción**: Al editar, se reconstruye automáticamente `criterioCompleto`
3. **Stop Propagation**: Los inputs detienen propagación para evitar selección accidental
4. **Loading States**: Skeletons mientras carga (6 tarjetas)
5. **Empty State**: Mensaje amigable si no hay criterios
6. **Responsive Grid**: 1 columna en móvil, 2 en desktop

---

## 🚀 Uso desde Step3.tsx

```tsx
function Step3({ pagina, setPagina, usuarioFromState, cuestionarioState, setCuestionarioState }: Props) {
  const { user } = useAuth0();

  const {
    criterios,
    criteriosSeleccionados,
    contexto,
    loadingCriterios,
    criterioEnEdicion,
    criterioEditado,
    handleCriteriosSeleccionados,
    handleEditarCriterio,
    handleGuardarEdicion,
    handleCancelarEdicion,
    handleCambioCampo,
  } = useCriterios({
    areaId: cuestionarioState.area,
    gradoId: usuarioFromState.gradoId!,
    competenciaId: cuestionarioState.competencia,
    problematicaId: usuarioFromState.problematicaId,
    perfilCompleto: user?.perfilCompleto,
  });

  useEffect(() => {
    setCuestionarioState((prevState) => ({
      ...prevState,
      criteriosEvaluacion: criteriosSeleccionados.map((crit) => crit.criterioCompleto),
    }));
  }, [criteriosSeleccionados, setCuestionarioState]);

  function handleNextStep() {
    if (cuestionarioState.criteriosEvaluacion.length > 0) {
      setPagina(pagina + 1);
    } else {
      handleToaster("Por favor selecciona al menos un criterio de evaluación", "error");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <Step3Header />
        <ContextoProblematica contexto={contexto} />
        <CriteriosList
          criterios={criterios}
          criteriosSeleccionados={criteriosSeleccionados}
          loadingCriterios={loadingCriterios}
          criterioEnEdicion={criterioEnEdicion}
          criterioEditado={criterioEditado}
          onSeleccionar={handleCriteriosSeleccionados}
          onEditar={handleEditarCriterio}
          onGuardar={handleGuardarEdicion}
          onCancelar={handleCancelarEdicion}
          onCambioCampo={handleCambioCampo}
        />
        <NavigationButtons
          currentPage={pagina}
          criteriosSeleccionados={criteriosSeleccionados.length}
          onPrevious={() => setPagina(pagina - 1)}
          onNext={handleNextStep}
        />
      </div>
    </div>
  );
}
```

---

## 🎓 Buenas Prácticas Aplicadas

✅ Nombres descriptivos y claros  
✅ Interfaces tipadas para props  
✅ Componentes pequeños y enfocados  
✅ Lógica separada de presentación  
✅ Barrel exports para imports limpios  
✅ Documentación inline (JSDoc recomendado)  
✅ Manejo de estados de carga/error  
✅ Responsive design  
✅ Accesibilidad (títulos en botones)  
✅ Performance (stopPropagation cuando necesario)
