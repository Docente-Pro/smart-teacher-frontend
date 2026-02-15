# ✨ Sistema de Loading Global - DocentePro

## 🎯 Resumen

Sistema completo de loading global implementado con diseño coherente (azul #004e98 + naranja #ff6700), animaciones suaves y fácil integración.

## 📦 Archivos Creados

```
src/
├── components/
│   └── GlobalLoading.tsx          ✅ Componente visual del loading
├── store/
│   └── loading.store.ts           ✅ Estado global (Zustand)
├── hooks/
│   └── useGlobalLoading.ts        ✅ Hook para usar el loading
├── pages/
│   ├── Dashboard.tsx              ✅ Ejemplo implementado
│   └── DemoLoading.tsx            ✅ Página de pruebas
├── examples/
│   └── global-loading-examples.tsx ✅ 13 ejemplos de uso
├── main.tsx                       ✅ Integrado globalmente
└── tailwind.config.ts             ✅ Animación shimmer agregada

docs/
└── GLOBAL_LOADING.md              ✅ Documentación completa
```

## 🎨 Características del Diseño

### Animaciones
- 🔄 **Spinner rotatorio** con borde degradado
- 💓 **Pulso** en círculo central con gradiente azul→naranja
- ✨ **Shimmer** en barra de progreso (efecto de onda)
- 🎯 **Bounce** en 3 puntos indicadores con delays
- ⏱️ **Puntos animados** en el texto (. .. ...)

### Elementos Visuales
```
┌─────────────────────────────────────┐
│                                     │
│          ┌─────────┐                │
│          │ 🔄 ⚪ │  ← Spinner + Ícono Libro
│          └─────────┘                │
│                                     │
│      Cargando dashboard...          │
│      ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬  ← Barra shimmer
│                                     │
│           ● ● ●      ← Puntos bounce
│                                     │
└─────────────────────────────────────┘
```

### Colores
- **Primario**: `#004e98` (dp-blue-500)
- **Acción**: `#ff6700` (dp-orange-500)
- **Gradiente**: Azul → Naranja
- **Fondo**: Blanco / Dark mode adaptado

## 🚀 Uso Rápido

### Ejemplo 1: Loading Simple
```tsx
import { useGlobalLoading } from "@/hooks/useGlobalLoading";

function MiComponente() {
  const { showLoading, hideLoading } = useGlobalLoading();

  const handleClick = async () => {
    showLoading("Procesando...");
    
    try {
      await apiCall();
    } finally {
      hideLoading();
    }
  };
}
```

### Ejemplo 2: Carga de Página
```tsx
useEffect(() => {
  const cargarDatos = async () => {
    showLoading("Cargando dashboard...");
    
    try {
      await fetchData();
    } finally {
      hideLoading();
    }
  };

  cargarDatos();
}, []);
```

### Ejemplo 3: Proceso de Pago
```tsx
const handlePagar = async (planId: string) => {
  showLoading("Procesando pago con Mercado Pago...");
  
  try {
    const { checkoutUrl } = await crearPreferenciaPago(userId, planId);
    window.location.href = checkoutUrl; // Mantiene loading hasta redirección
  } catch (error) {
    hideLoading();
    toast.error("Error al procesar pago");
  }
};
```

## 🧪 Probar el Sistema

### Página de Demostración
Navega a: **`http://localhost:5173/demo-loading`**

Esta página incluye:
- ✅ 9 ejemplos diferentes de loading
- ✅ Mensajes personalizados
- ✅ Proceso multipaso
- ✅ Simulación de errores
- ✅ Instrucciones de uso
- ✅ Código de ejemplo

### Ejemplos Disponibles
1. Loading básico (2s)
2. Procesando pago
3. Generando con IA
4. Cargando dashboard
5. Guardando datos
6. Proceso multipaso
7. Iniciando sesión
8. Error en proceso
9. Subiendo archivos

## 📱 Responsive & Accesibilidad

- ✅ Funciona en todos los tamaños de pantalla
- ✅ Adaptado para modo oscuro
- ✅ Animaciones optimizadas por GPU
- ✅ Z-index alto (50) para estar sobre todo
- ✅ Ocupa toda la pantalla (fixed inset-0)

## 🎓 Patrones Recomendados

### ✅ HACER
```tsx
// Siempre usar finally
try {
  showLoading("Mensaje...");
  await apiCall();
} finally {
  hideLoading();
}

// Mensajes descriptivos
showLoading("Generando plan de sesión con IA...");

// Mantener loading en redirecciones
window.location.href = url; // No llamar hideLoading
```

### ❌ NO HACER
```tsx
// No olvidar hideLoading
showLoading();
await apiCall();
// ❌ Falta hideLoading()

// No usar sin try-catch
showLoading();
const data = await apiCall(); // ❌ Si hay error, loading nunca se oculta
hideLoading();

// No usar mensajes genéricos
showLoading("Espere..."); // ❌ Poco descriptivo
```

## 🔧 Configuración Avanzada

### Cambiar Duración de Animaciones
```tsx
// GlobalLoading.tsx
<div className="animate-spin" />  // Default: 1s
<div className="animate-pulse" /> // Default: 2s
<div className="animate-bounce" /> // Default: 1s
```

### Personalizar Gradiente
```tsx
// Cambiar colores del gradiente
<div className="bg-gradient-to-br from-[#TU_COLOR_1] to-[#TU_COLOR_2]" />
```

### Ajustar Velocidad Shimmer
```tsx
// tailwind.config.ts
shimmer: 'shimmer 2s linear infinite', // Cambiar '2s' por tu duración
```

## 📊 Integración con Dashboard

El Dashboard ya tiene implementado el loading:
- ✅ Carga inicial simulada (1.5s)
- ✅ Loading al navegar a crear sesión
- ✅ Loading al navegar a mis sesiones
- ✅ Loading al navegar a evaluaciones

## 🎯 Próximos Pasos

1. **Implementar en servicios API**
   ```tsx
   // services/sesiones.service.ts
   export const crearSesion = async (data) => {
     const { showLoading, hideLoading } = useLoadingStore.getState();
     showLoading("Creando sesión...");
     // ...
   };
   ```

2. **Agregar en formularios**
   ```tsx
   // Cuestionarios, login, signup, etc.
   const onSubmit = async (data) => {
     showLoading("Guardando...");
     // ...
   };
   ```

3. **Integrar con flujo de pago**
   ```tsx
   // Ya está en el ejemplo, solo copiar el patrón
   ```

## 📖 Documentación Completa

Ver `GLOBAL_LOADING.md` para:
- Casos de uso detallados
- 13 ejemplos de código
- Mejoras futuras
- Configuración avanzada
- Troubleshooting

## ✨ Demo Visual

```
🌐 URL: http://localhost:5173/demo-loading

┌─────────────────────────────────────────────────────┐
│  Demo: Sistema de Loading Global                   │
│  Prueba diferentes variantes del loading...        │
├─────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │ Loading     │  │ Procesando  │  │ Generando   │ │
│  │ Básico (2s) │  │ Pago        │  │ con IA      │ │
│  │             │  │             │  │             │ │
│  │  [Probar]   │  │  [Probar]   │  │  [Probar]   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
│                                                     │
│  ... 6 ejemplos más ...                            │
└─────────────────────────────────────────────────────┘
```

## 🎉 Estado del Proyecto

```
Sistema de Loading Global
├── ✅ Componente GlobalLoading
├── ✅ Store (Zustand)
├── ✅ Hook personalizado
├── ✅ Animaciones configuradas
├── ✅ Integrado en main.tsx
├── ✅ Ejemplo en Dashboard
├── ✅ Página de demostración
├── ✅ 13 ejemplos de código
└── ✅ Documentación completa

Status: ✅ 100% COMPLETADO
```

## 🚀 Comando para Probar

```bash
# Asegúrate de que el servidor esté corriendo
npm run dev

# Navega a:
http://localhost:5173/demo-loading
```

## 📝 Notas Finales

- El loading es **global** - un solo loading puede estar activo a la vez
- Se **auto-limpia** al desmontar componentes
- **Z-index 50** - aparece sobre todo el contenido
- **Performance optimizada** - animaciones CSS (GPU)
- **Modo oscuro** - se adapta automáticamente

¡El sistema está listo para usar! 🎉
