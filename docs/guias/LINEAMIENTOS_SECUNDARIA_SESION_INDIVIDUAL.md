# Lineamientos: Sesión Individual para Secundaria

> **Contexto:** Un docente de secundaria puede tener **múltiples grados** asignados (ej. Matemática en 2.°, 3.° y 4.° año). El flujo de creación de sesión individual (`/crear-sesion`) debe permitir que el docente seleccione para qué grado desea crear la sesión.

---

## 1. Modelo de datos — Grados de Secundaria

| ID  | Nombre       |
| --- | ------------ |
| 7   | Primer Año   |
| 8   | Segundo Año  |
| 9   | Tercer Año   |
| 10  | Cuarto Año   |
| 11  | Quinto Año   |

Los grados del docente de secundaria se obtienen de `GET /usuario/:id` en el campo `gradosAreas`:

```typescript
gradosAreas?: Array<{
  gradoId: number;
  areaId: number;
  grado?: { id: number; nombre: string; nivel?: { nombre: string } };
  area?: { id: number; nombre: string };
}>;
```

Cada entrada vincula un grado con un área. Un docente puede tener, por ejemplo:
- Matemática (areaId: 3) → Segundo Año (gradoId: 8), Tercer Año (gradoId: 9)
- Ciencia y Tecnología (areaId: 5) → Segundo Año (gradoId: 8)

---

## 2. Flujo del Wizard de Sesión Individual (`/crear-sesion`)

### 2.1 Detección de múltiples grados

En `CuestionarioSesion.tsx`, al cargar el usuario:

1. Se extrae `gradosAreas` del response de `GET /usuario/:id`
2. Se deducen los grados **únicos** (eliminando duplicados por `grado.id`)
3. Si `nivel === "Secundaria"` y hay **más de 1 grado**, se activa el selector

```
esSecundaria && gradosFromAreas.length > 1  →  mostrar selector de grado
```

Si el docente tiene **un solo grado**, no se muestra selector (comportamiento idéntico a primaria).

### 2.2 Step 1 — Selector de Grado

Cuando `gradosDisponibles.length > 1`, se renderiza un Card adicional **antes** de la selección de área:

```
[ Selecciona el grado ]  ← NUEVO (solo secundaria multi-grado)
[ Selecciona el área   ]
[ Selecciona la duración ]
[ Continuar ]
```

Al seleccionar un grado:
- `sesion.gradoId` se actualiza con el ID numérico
- `sesion.datosGenerales.grado` se actualiza con el nombre del grado
- El botón "Continuar" se deshabilita si no hay grado seleccionado

### 2.3 Propagación del grado seleccionado

El `gradoId` seleccionado en Step 1 se propaga a todos los consumidores vía `useSesionStore`:

| Componente / Hook | Cómo lee el grado | Para qué |
| --- | --- | --- |
| `SelectorTemas` | `sesion.gradoId` | Filtrar temas curriculares por grado |
| `useAutoGenerarSesion` | `sesion.datosGenerales.grado` | Enviar grado a endpoints de IA |
| `usePDFGeneration` | `sesion.gradoId ?? usuario.gradoId` | Payload `POST /sesion` |
| `SessionDrawer` | `sesion.datosGenerales.grado` | Mostrar resumen lateral |

---

## 3. Payload de Creación de Sesión

### `POST /sesion` — `ISesionToCreate`

```typescript
{
  titulo: string;
  usuarioId: string;
  nivelId: number;        // del perfil del usuario
  gradoId: number;        // ← PRIORIDAD: sesion.gradoId > usuario.gradoId > 1
  problematicaId: number; // del perfil del usuario
  duracion: number;       // de sesion.datosGenerales.duracion
  areaId?: number;        // de sesion.areaId (seleccionado en Step 1)
}
```

**Regla de prioridad para `gradoId`:**
```typescript
const gradoIdFinal = sesion.gradoId ?? usuario.gradoId ?? 1;
```

### `POST /sesion/confirmar-upload` — Contenido completo

El campo `contenido` incluye toda la sesión (`ISesionAprendizaje`), que ya contiene `gradoId` y `datosGenerales.grado` con los valores seleccionados.

---

## 4. Lista de Alumnos — Almacenamiento por Grado

### Problema

Antes, la lista de alumnos se guardaba en localStorage con una **única key**:
- `dp_alumnos_data` → `IAlumno[]`
- `dp_alumnos_subidos` → `"true"` / ausente

Esto no funcionaba para secundaria donde cada grado tiene su propia lista.

### Solución implementada

Las funciones de `alumnosStorage.ts` aceptan un `gradoId` opcional:

| Key sin grado (default) | Key con grado |
| --- | --- |
| `dp_alumnos_data` | `dp_alumnos_data_grado_{gradoId}` |
| `dp_alumnos_subidos` | `dp_alumnos_subidos_grado_{gradoId}` |

```typescript
// Guardar alumnos del 3er año de secundaria (gradoId = 9)
saveAlumnos(alumnos, 9);

// Leer alumnos del 3er año
const alumnos = getSavedAlumnos(9);

// Leer sin grado → lee key genérica (retrocompatible con primaria)
const alumnos = getSavedAlumnos();

// Leer con grado pero sin datos → fallback a key genérica
const alumnos = getSavedAlumnos(9); // si no hay dp_alumnos_data_grado_9, lee dp_alumnos_data
```

### Consumidores actualizados

| Archivo | Fuente de `gradoId` |
| --- | --- |
| `DocTest.tsx` | `sesion?.gradoId` (de `useSesionStore`) |
| `SesionViewer.tsx` | `data.gradoId` (de `ISesion` API response) |
| `SesionSuscriptorResult.tsx` | `raw.gradoId` (de API response) |
| `SesionPremiumDoc.tsx` | `sesion.gradoId` o `sesion.grado.id` |
| `EditarSesionPremium.tsx` | `rawSesion.gradoId` (de API response) |
| `Dashboard.tsx` | `user.gradoId` (del perfil) |
| `SubirListaAlumnosView.tsx` | prop `gradoId` (pasado por el padre) |

### Limpieza al cerrar sesión

`clearAllAlumnosStorage()` barre **todas** las keys que empiezan con `dp_alumnos` (genéricas y por grado). Se invoca desde:
- `clearUserStorage()` (`clearUserStorage.ts`)
- `logout()` (`auth.store.ts`)

---

## 5. Flujo de Subir Lista de Alumnos (`SubirListaAlumnosView`)

El componente tiene un flujo interno por pasos:

### Para secundaria multi-grado:
```
1. [Seleccionar año]     → "¿Para qué año es esta lista?" (cards de grados)
2. [Elegir método]       → "Subir imagen (OCR)" o "Llenar manualmente"
3a. [Subir imagen]       → Zona de drag & drop → OCR con IA
3b. [Llenar manualmente] → Tabla vacía con 5 filas iniciales
4. [Tabla editable]      → Editar, agregar, eliminar filas → Guardar
```

### Para primaria / grado único:
```
1. [Elegir método]       → "Subir imagen (OCR)" o "Llenar manualmente"
2. [Subir imagen / Tabla] → Mismo flujo
3. [Guardar]
```

### Props de `SubirListaAlumnosView`:
| Prop | Tipo | Descripción |
| --- | --- | --- |
| `onContinue` | `() => void` | Callback al terminar |
| `continueLabel` | `string?` | Texto del botón final (default: "Continuar al dashboard") |
| `gradoId` | `number?` | Grado fijo (primaria o secundaria con 1 grado) |
| `gradosDisponibles` | `Array<{id, nombre}>?` | Grados para el selector (secundaria multi-grado) |

El Dashboard extrae `gradosDisponibles` de `useUserStore().gradosAreas` y los pasa al modal.

---

## 6. Pendientes y mejoras futuras

### 6.1 Filtrar áreas por grado seleccionado

En Step 1, las áreas se cargan con `getAllAreas()` (todas las áreas del sistema). Para secundaria, se podría filtrar mostrando solo las áreas asignadas al grado seleccionado (cruzando con `gradosAreas`).

### 6.2 Migrar listas de alumnos a backend por aula/grado

El modelo de `Aula` en el backend ya soporta `gradoId` y `nivelId`. La migración natural es:
- Un aula por grado para secundaria
- `GET /aula/usuario/:id` devuelve múltiples aulas
- Cada aula con sus propios alumnos

Esto reemplazaría el localStorage como almacenamiento definitivo.

### 6.3 Sincronización bidireccional

Cuando el backend almacene alumnos por aula/grado, se deberá:
1. Al cargar sesión: si hay aula para el grado, cargar alumnos del backend
2. Al subir lista: guardar en backend (aula del grado) + localStorage (cache)
3. Al ver sesión: preferir `contenido.listaAlumnos` > backend aula > localStorage

---

## 7. Archivos clave modificados

| Archivo | Cambio |
| --- | --- |
| `src/pages/CuestionarioSesion.tsx` | Extrae grados únicos, detecta multi-grado, pasa `gradosDisponibles` a Step1 |
| `src/components/StepsCuestionarioCrearSesion/Step1.tsx` | Nuevo selector de grado con cards clickables |
| `src/hooks/usePDFGeneration.ts` | `gradoId` prioriza `sesion.gradoId` sobre `usuario.gradoId` |
| `src/utils/alumnosStorage.ts` | Todas las funciones aceptan `gradoId` opcional; keys por grado |
| `src/utils/clearUserStorage.ts` | Usa `clearAllAlumnosStorage()` para limpiar keys dinámicas |
| `src/store/auth.store.ts` | Logout usa `clearAllAlumnosStorage()` |
| `src/components/Shared/SubirListaAlumnosView.tsx` | Reescrito: selector de grado, método (OCR/manual), tabla editable |
| `src/components/Shared/Modal/SubirAlumnosModal.tsx` | Pasa `gradoId` y `gradosDisponibles` a la vista de subida |
| `src/pages/Dashboard.tsx` | Extrae `gradosDisponibles` de `useUserStore` y los pasa al modal |
| `src/pages/DocTest.tsx` | `getSavedAlumnos(sesion?.gradoId)` |
| `src/pages/SesionViewer.tsx` | `getSavedAlumnos(data.gradoId)` |
| `src/pages/SesionSuscriptorResult.tsx` | `getSavedAlumnos(raw.gradoId)` |
| `src/components/SesionPremiumDoc/SesionPremiumDoc.tsx` | Extrae `gradoId` de sesion y lo pasa a `getSavedAlumnos` |
| `src/pages/EditarSesionPremium.tsx` | `getSavedAlumnos(rawSesion.gradoId)` |
