# 🏗️ Arquitectura de Features - Problemáticas

## 📁 Estructura de Carpetas

```
src/features/problematicas/
├── components/
│   ├── ProblematicasList.tsx               # Lista con búsqueda, filtros y paginación
│   ├── CreateEditProblematicaModal.tsx     # Modal para crear/editar problemáticas
│   └── SugerenciasPersonalizacion.tsx      # Muestra sugerencias basadas en usuarios similares
├── hooks/
│   └── useProblematicas.ts                  # Hook para manejar estado y lógica
├── interfaces/
│   └── problematica.interface.ts            # Todas las interfaces TypeScript
├── services/
│   └── problematica-api.service.ts          # Llamadas a la API (10 endpoints)
└── index.ts                                  # Barrel export
```

## 🎯 Patrón de Arquitectura

Esta feature sigue el **patrón de arquitectura modular** con separación de responsabilidades:

### 1. **Interfaces** (`interfaces/`)
- Define todos los tipos TypeScript
- Contratos de datos entre frontend y backend
- Reutilizables en toda la aplicación

### 2. **Services** (`services/`)
- Capa de comunicación con el backend
- Funciones puras que retornan Promises
- Sin lógica de negocio, solo HTTP calls

### 3. **Hooks** (`hooks/`)
- Lógica de negocio y manejo de estado
- Reutilizables en múltiples componentes
- Encapsulan comportamientos complejos

### 4. **Components** (`components/`)
- UI components específicos de la feature
- Usan hooks y services
- Pueden ser reutilizados

## 🔌 API Endpoints

### GET /api/problematica
Lista completa con filtros y paginación

**Query params:**
- `page`: Número de página (default: 1)
- `limit`: Items por página (default: 10)
- `tipo`: `recomendadas` | `personalizadas` | `todas`
- `usuarioId`: Filtrar por creador
- `search`: Buscar en nombre o descripción

```typescript
const response = await problematicaApiService.getAll({
  page: 1,
  limit: 20,
  tipo: 'recomendadas',
  search: 'lectura'
});
```

### GET /api/problematica/recomendadas
Solo recomendadas (sin paginación) - Ideal para modales

```typescript
const response = await problematicaApiService.getRecomendadas();
```

### GET /api/problematica/usuario/:usuarioId
Problemáticas creadas por un usuario específico

```typescript
const response = await problematicaApiService.getByUsuario(
  'uuid-usuario',
  { page: 1, limit: 10 }
);
```

### GET /api/problematica/search
Búsqueda avanzada

```typescript
const response = await problematicaApiService.search({
  q: 'lectura',
  tipo: 'recomendadas',
  page: 1
});
```

### POST /api/problematica/seleccionar
Seleccionar problemática (modal inicial) - Actualiza automáticamente `problematicaCompleta = true`

```typescript
await problematicaApiService.seleccionar({
  problematicaId: 1
});
```

### POST /api/problematica
Crear problemática personalizada

```typescript
await problematicaApiService.create({
  nombre: 'Mi problemática',
  descripcion: 'Descripción detallada'
});
```

### PUT /api/problematica/:id
Actualizar problemática personalizada

```typescript
await problematicaApiService.update(id, {
  nombre: 'Nombre actualizado'
});
```

### DELETE /api/problematica/:id
Eliminar problemática personalizada

```typescript
await problematicaApiService.delete(id);
```

## 🪝 Hook: useProblematicas

### Funciones Disponibles

```typescript
const {
  problematicas,      // Array de problemáticas
  loading,            // Estado de carga
  pagination,         // Info de paginación
  error,              // Errores
  loadRecomendadas,   // Cargar recomendadas
  loadAll,            // Cargar todas con filtros
  loadByUsuario,      // Cargar de un usuario
  searchProblematicas,// Búsqueda
  loadMore,           // Infinite scroll
  reset,              // Resetear estado
} = useProblematicas();
```

### Ejemplos de Uso

**1. Cargar problemáticas recomendadas (modal inicial):**
```typescript
useEffect(() => {
  loadRecomendadas();
}, []);
```

**2. Cargar con filtros:**
```typescript
loadAll({ 
  tipo: 'recomendadas', 
  page: 1, 
  limit: 20 
});
```

**3. Búsqueda con debounce:**
```typescript
useEffect(() => {
  if (!searchTerm) return;
  
  const timer = setTimeout(() => {
    searchProblematicas(searchTerm);
  }, 500);
  
  return () => clearTimeout(timer);
}, [searchTerm]);
```

**4. Infinite scroll:**
```typescript
<button 
  onClick={() => loadMore({ tipo: 'todas' })}
  disabled={!pagination?.hasMore || loading}
>
  Cargar más
</button>
```

**5. Problemáticas de un usuario:**
```typescript
loadByUsuario(userId, { page: 1, limit: 10 });
```

## 🧩 Componentes

### ProblematicasList

Componente completo con búsqueda, filtros y paginación.

**Props:**
```typescript
interface ProblematicasListProps {
  tipo?: TipoProblematica;          // 'todas' | 'recomendadas' | 'personalizadas'
  usuarioId?: string;                // Filtrar por usuario
  onSelect?: (id: number) => void;   // Callback al seleccionar
  showCreateButton?: boolean;        // Mostrar botón crear
  showSearch?: boolean;              // Mostrar búsqueda
}
```

**Ejemplo:**
```tsx
<ProblematicasList
  tipo="recomendadas"
  showSearch={true}
  onSelect={(id) => console.log('Seleccionada:', id)}
/>
```

## 📄 Interfaces TypeScript

### Problematica
```typescript
interface Problematica {
  id: number;
  nombre: string;
  descripcion: string;
  esPersonalizada: boolean;
  creadaPorId: string | null;
  creador?: ProblematicaCreador | null;
  createdAt: string;
  _count?: ProblematicaCount;
}
```

### PaginationInfo
```typescript
interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}
```

## 🎨 Flujo UX Recomendado

### 1. Modal Inicial (Primera vez)
```tsx
import { useProblematicas } from '@/features/problematicas';

function ProblematicaModal() {
  const { problematicas, loading, loadRecomendadas } = useProblematicas();
  
  useEffect(() => {
    loadRecomendadas(); // Sin paginación, todas las recomendadas
  }, []);
  
  return (
    // Mostrar grid 3x columnas
  );
}
```

### 2. Página de Gestión
```tsx
import { ProblematicasList } from '@/features/problematicas';

function GestionProblematicas() {
  const [tipo, setTipo] = useState('todas');
  
  return (
    <ProblematicasList
      tipo={tipo}
      showSearch={true}
      showCreateButton={tipo === 'personalizadas'}
    />
  );
}
```

### 3. Dashboard con Búsqueda
```tsx
const { searchProblematicas } = useProblematicas();

<Input 
  onChange={(e) => searchProblematicas(e.target.value)}
  placeholder="Buscar..."
/>
```

## ✨ Ventajas de esta Arquitectura

1. **Escalable**: Cada feature es independiente
2. **Reutilizable**: Hooks y componentes se pueden usar en múltiples lugares
3. **Testeable**: Lógica separada de UI
4. **Mantenible**: Fácil encontrar y modificar código
5. **Type-safe**: TypeScript en toda la capa
6. **Performance**: Búsqueda con debounce, infinite scroll
7. **Trazabilidad**: Campo `basadaEnId` para saber origen de personalizaciones
8. **Analytics**: Trackeo de qué problemáticas son más editadas
9. **Sugerencias inteligentes**: Sistema de recomendaciones basado en usuarios similares

## 🎯 Feature: Sugerencias de Personalización

### ¿Qué es?
Sistema inteligente que muestra cómo **otros usuarios con perfil similar** personalizaron una problemática recomendada.

### ¿Cómo funciona?

1. **Backend analiza:**
   - Nivel educativo del usuario
   - Grado que enseña
   - Área de especialización
   - Historial de personalizaciones

2. **Frontend muestra:**
   - Top 3 personalizaciones más populares
   - Badge "Similar" para usuarios con mismo perfil
   - Badge con número de usuarios que lo adoptaron
   - Info del creador (nombre, nivel, grado)

3. **Usuario puede:**
   - Ver las sugerencias al editar una recomendada
   - Aplicar una sugerencia con un click
   - Editarla antes de guardar
   - Crear desde cero si ninguna le sirve

### Endpoint

```typescript
GET /api/problematica/sugerencias/:basadaEnId
Query params:
- limite: number (default: 3)
- usuarioId: string (para filtrar por perfil similar)

Response:
{
  message: string;
  data: SugerenciaPersonalizacion[];
}
```

### Componente

```tsx
import { SugerenciasPersonalizacion } from '@/features/problematicas';

<SugerenciasPersonalizacion
  basadaEnId={problematica.id}
  usuarioId={user.id}
  onSeleccionarSugerencia={(sugerencia) => {
    setNombre(sugerencia.nombre);
    setDescripcion(sugerencia.descripcion);
  }}
  limite={3}
/>
```

### Beneficios

1. **Para el Usuario:**
   - Ahorra tiempo al no empezar desde cero
   - Ve ejemplos reales de su contexto
   - Aprende de otros docentes

2. **Para el Sistema:**
   - Reduce problemáticas duplicadas
   - Mejora calidad de personalizaciones
   - Genera insights sobre qué funciona mejor

3. **Para Analytics:**
   - Saber qué problemáticas son más editadas
   - Identificar patrones por nivel/grado
   - Mejorar recomendadas basado en ediciones comunes

### Flujo UX Completo

```
Usuario ve modal → Grid con problemáticas recomendadas
├── Opción 1: Seleccionar directamente
│   └── Click en card → "Continuar"
├── Opción 2: Crear desde cero
│   └── "Crear Nueva" → Formulario vacío
└── Opción 3: Personalizar
    └── Hover en card → Click "Editar"
        ├── Modal se abre
        ├── Muestra sugerencias de usuarios similares
        ├── Usuario puede:
        │   ├── Aplicar una sugerencia (1 click)
        │   ├── Editar la sugerencia aplicada
        │   └── Ignorar y crear desde la plantilla original
        └── Guardar → basadaEnId vincula con original
```

### Ejemplo de Sugerencia

```json
{
  "id": 123,
  "nombre": "Falta de comprensión lectora en textos científicos",
  "descripcion": "Adaptado para 5to grado: Los estudiantes no logran identificar hipótesis en experimentos simples...",
  "basadaEnId": 5,
  "popularidad": 47,
  "creadoPorUsuariosSimilares": true,
  "creador": {
    "id": "user-456",
    "nombre": "María González",
    "nivelEducativo": "Primaria",
    "grado": "5to"
  },
  "createdAt": "2024-11-15T10:30:00Z"
}
```

## 🔄 Migración desde la Estructura Antigua

**Antes:**
```typescript
import { getAllProblematicas } from '@/services/problematica.service';
```

**Ahora:**
```typescript
import { problematicaApiService, useProblematicas } from '@/features/problematicas';
```

## 📚 Próximas Features a Implementar

Con esta misma estructura, se pueden crear:

- `features/sesiones/`
- `features/evaluaciones/`
- `features/areas/`
- `features/competencias/`
- `features/criterios/`

Cada una con su propio:
- `components/`
- `hooks/`
- `services/`
- `interfaces/`
