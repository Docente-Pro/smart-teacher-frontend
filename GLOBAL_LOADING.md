# Global Loading System

Sistema de loading global para DocentePro que muestra una pantalla de carga completa con animaciones elegantes.

## 📦 Componentes Creados

### 1. `GlobalLoading.tsx`
Componente visual del loading que ocupa toda la pantalla.

**Características:**
- Loading spinner con gradiente azul/naranja
- Ícono de libro animado (identidad DocentePro)
- Barra de progreso infinita con efecto shimmer
- Puntos animados saltarines
- Texto personalizable con animación de puntos
- Soporte para modo oscuro
- Diseño responsive

### 2. `loading.store.ts`
Store de Zustand para controlar el estado global del loading.

**API:**
```typescript
interface LoadingStore {
  isLoading: boolean;
  loadingMessage: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
}
```

### 3. `useGlobalLoading.ts`
Hook personalizado para usar el loading fácilmente.

**Uso:**
```typescript
const { showLoading, hideLoading } = useGlobalLoading();
```

## 🎨 Diseño

**Paleta de colores:**
- Azul primario: `#004e98` (dp-blue-500)
- Naranja acción: `#ff6700` (dp-orange-500)
- Gradientes animados con ambos colores

**Animaciones:**
- Spinner rotatorio (border-t animado)
- Pulse en círculo central
- Shimmer en barra de progreso
- Bounce en puntos indicadores
- Puntos animados en texto

## 📖 Cómo Usar

### Opción 1: Usando el Hook (Recomendado)

```typescript
import { useGlobalLoading } from "@/hooks/useGlobalLoading";

function MiComponente() {
  const { showLoading, hideLoading } = useGlobalLoading();

  const handleSubmit = async () => {
    showLoading("Guardando datos...");
    
    try {
      await api.guardarDatos();
      hideLoading();
    } catch (error) {
      hideLoading();
    }
  };

  return <button onClick={handleSubmit}>Guardar</button>;
}
```

### Opción 2: Usando el Store Directamente

```typescript
import { useLoadingStore } from "@/store/loading.store";

function MiComponente() {
  const { showLoading, hideLoading } = useLoadingStore();

  const fetchData = async () => {
    showLoading("Cargando información...");
    
    try {
      const data = await api.getData();
      return data;
    } finally {
      hideLoading();
    }
  };
}
```

### Opción 3: En Servicios/APIs

```typescript
// services/ejemplo.service.ts
import { useLoadingStore } from "@/store/loading.store";

export const fetchUsuarios = async () => {
  const { showLoading, hideLoading } = useLoadingStore.getState();
  
  showLoading("Obteniendo usuarios...");
  
  try {
    const response = await instance.get("/usuarios");
    return response.data;
  } finally {
    hideLoading();
  }
};
```

## 🎯 Casos de Uso Comunes

### 1. Carga Inicial de Página
```typescript
useEffect(() => {
  const cargarDatos = async () => {
    showLoading("Cargando dashboard...");
    
    try {
      await Promise.all([
        cargarAreas(),
        cargarCompetencias(),
        cargarUsuario()
      ]);
    } finally {
      hideLoading();
    }
  };

  cargarDatos();
}, []);
```

### 2. Envío de Formularios
```typescript
const onSubmit = async (data: FormData) => {
  showLoading("Guardando sesión...");
  
  try {
    await crearSesion(data);
    toast.success("Sesión creada exitosamente");
    navigate("/sesiones");
  } catch (error) {
    toast.error("Error al crear sesión");
  } finally {
    hideLoading();
  }
};
```

### 3. Pago/Checkout
```typescript
const handlePagar = async (planId: string) => {
  showLoading("Procesando pago...");
  
  try {
    const { checkoutUrl } = await crearPreferenciaPago(userId, planId);
    window.location.href = checkoutUrl; // El loading se mantiene hasta redirección
  } catch (error) {
    hideLoading();
    toast.error("Error al procesar pago");
  }
};
```

### 4. Navegación entre Páginas
```typescript
const handleNavigate = async (to: string) => {
  showLoading("Cargando página...");
  
  // Simular carga de datos
  await fetchPageData();
  
  navigate(to);
  hideLoading();
};
```

## ⚙️ Configuración

### Mensajes Personalizados
Puedes personalizar el mensaje del loading:

```typescript
showLoading("Procesando pago con Mercado Pago...");
showLoading("Generando plan de sesión...");
showLoading("Actualizando suscripción...");
showLoading("Iniciando sesión...");
```

### Sin Mensaje (Usa el default "Cargando...")
```typescript
showLoading();
```

## 🎭 Variantes de Loading

El componente actualmente tiene una sola variante, pero puedes crear más:

```typescript
// GlobalLoading.tsx - Agregar prop variant
interface GlobalLoadingProps {
  message?: string;
  variant?: "default" | "payment" | "auth" | "data";
}

// Luego personalizar animaciones según variant
```

## 🚀 Mejoras Futuras

1. **Progress Bar Determinado:**
```typescript
showLoading("Subiendo archivos...", { progress: 45 });
```

2. **Múltiples Loadings:**
```typescript
showLoading("Paso 1: Validando datos...");
// Después
updateLoadingMessage("Paso 2: Guardando...");
```

3. **Cancelable:**
```typescript
showLoading("Procesando...", { 
  cancelable: true, 
  onCancel: () => abortController.abort() 
});
```

## 🎨 Personalización de Estilos

Para cambiar colores o animaciones, edita `GlobalLoading.tsx`:

```tsx
// Cambiar color del spinner
<div className="... border-t-[#TU_COLOR]" />

// Cambiar gradiente
<div className="... bg-gradient-to-br from-[#COLOR1] to-[#COLOR2]" />

// Ajustar velocidad de animación
<div className="... animate-spin" /> {/* 1s por defecto */}
```

## 📝 Notas Importantes

1. **Auto-cleanup:** El hook `useGlobalLoading` limpia el loading automáticamente al desmontar
2. **Z-index:** El loading tiene `z-50` para estar sobre todo el contenido
3. **Modo Oscuro:** Automáticamente adapta colores según el tema
4. **Accesibilidad:** Los puntos animados usan delays para ritmo visual
5. **Performance:** Usa CSS animations (GPU-accelerated)

## ✅ Checklist de Implementación

- [x] Componente GlobalLoading creado
- [x] Store de loading configurado
- [x] Hook useGlobalLoading creado
- [x] Integrado en main.tsx
- [x] Animación shimmer agregada a Tailwind
- [ ] Implementar en páginas principales
- [ ] Implementar en servicios de API
- [ ] Implementar en flujos de pago
- [ ] Testing en diferentes navegadores
