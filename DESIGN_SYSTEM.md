# 🎨 Sistema de Diseño DocentePro

## Filosofía de Diseño

DocentePro es una plataforma educativa profesional que inspira **confianza** y **seriedad**, manteniendo un toque de **energía** y **acción** para motivar a los docentes.

---

## 🎯 Paleta de Colores

### Colores Primarios

#### Azul Profesional (Confianza)
**Color principal de la marca** - Transmite profesionalismo, confianza y estabilidad.

```
dp-blue-500: #004e98  ← COLOR PRINCIPAL
dp-blue-400: #3a6ea5  ← Secundario
dp-blue-600: #00468a  ← Hover de botones
dp-blue-700: #003d7b  ← Botones presionados
```

**Uso:**
- Botones principales
- Headers y navegación
- Enlaces importantes
- Fondos de secciones destacadas
- Gradientes principales

#### Gris Neutro (Balance)
**Fondos y textos** - Proporciona balance y legibilidad.

```
dp-gray-100: #ebebeb  ← Fondo principal
dp-gray-300: #c0c0c0  ← Gris medio
dp-gray-600: #787878  ← Texto secundario
```

**Uso:**
- Fondos de página
- Bordes y separadores
- Textos secundarios
- Estados deshabilitados

#### Naranja (Acción y Energía)
**Acentos y CTAs secundarios** - Aporta energía y llama a la acción.

```
dp-orange-500: #ff6700  ← Color de acción
dp-orange-400: #ffa05c  ← Hover
dp-orange-300: #ffb885  ← Highlight
```

**Uso:**
- CTAs secundarios
- Notificaciones importantes
- Badges y chips
- Elementos decorativos (blur effects)
- Números destacados

---

## 📐 Tipografía

### Fuente Principal
**Inter** (Google Fonts) - Fuente profesional, moderna y altamente legible.

```tsx
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
}
```

### Jerarquía de Textos

```tsx
// Títulos principales
text-dp-text-title (#001a38)      // dp-blue-950
className="text-4xl font-bold text-dp-text-title"

// Subtítulos
text-dp-text-subtitle (#002c5e)   // dp-blue-900
className="text-2xl font-semibold text-dp-text-subtitle"

// Texto del cuerpo
text-dp-text-body (#00356d)       // dp-blue-800
className="text-base text-dp-text-body"

// Texto secundario
text-dp-text-secondary (#606060)  // dp-gray-700
className="text-sm text-dp-text-secondary"

// Texto terciario
text-dp-text-tertiary (#909090)   // dp-gray-500
className="text-xs text-dp-text-tertiary"

// Texto deshabilitado
text-dp-text-disabled (#a8a8a8)   // dp-gray-400
```

---

## 🎨 Componentes de UI

### Botones

#### Botón Primario (Azul)
```tsx
<Button className="bg-dp-blue-500 hover:bg-dp-blue-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all">
  Acción Principal
</Button>
```

#### Botón Secundario (Outline)
```tsx
<Button className="border-2 border-dp-blue-500 text-dp-blue-500 hover:bg-dp-blue-50 font-semibold px-6 py-3 rounded-xl transition-all">
  Acción Secundaria
</Button>
```

#### Botón de Acción (Naranja)
```tsx
<Button className="bg-dp-orange-500 hover:bg-dp-orange-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all">
  ¡Comenzar Ahora!
</Button>
```

#### Botón Degradado (Hero/Landing)
```tsx
<Button className="bg-gradient-to-r from-dp-blue-500 to-dp-blue-700 hover:from-dp-blue-600 hover:to-dp-blue-800 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-xl transition-all">
  Iniciar Sesión
</Button>
```

### Cards

#### Card Básico
```tsx
<div className="bg-white border border-dp-border-light rounded-16 p-6 shadow-sm hover:shadow-md transition-shadow">
  {/* Contenido */}
</div>
```

#### Card con Gradiente (Destacado)
```tsx
<div className="bg-gradient-to-br from-dp-blue-50 to-white border border-dp-blue-200 rounded-16 p-6 shadow-md">
  {/* Contenido */}
</div>
```

### Inputs

```tsx
<input 
  type="text" 
  className="w-full px-4 py-3 border border-dp-border-medium rounded-12 focus:border-dp-blue-500 focus:ring-2 focus:ring-dp-blue-100 outline-none transition-all"
  placeholder="Ingresa tu texto"
/>
```

### Badges y Chips

```tsx
// Badge informativo
<span className="bg-dp-blue-100 text-dp-blue-700 px-3 py-1 rounded-full text-sm font-medium">
  Premium
</span>

// Badge de acción
<span className="bg-dp-orange-100 text-dp-orange-700 px-3 py-1 rounded-full text-sm font-medium">
  Nuevo
</span>

// Badge de éxito
<span className="bg-dp-success-100 text-dp-success-700 px-3 py-1 rounded-full text-sm font-medium">
  Completado
</span>
```

---

## 🌈 Gradientes y Fondos

### Gradiente Principal (Hero/Headers)
```tsx
className="bg-gradient-to-br from-dp-blue-500 via-dp-blue-600 to-dp-blue-800"
```

### Efectos Decorativos
```tsx
{/* Blur circles */}
<div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl opacity-10"></div>
<div className="absolute bottom-20 right-10 w-96 h-96 bg-dp-orange-400 rounded-full blur-3xl opacity-10"></div>
```

### Fondos de Sección
```tsx
// Fondo blanco (principal)
className="bg-dp-bg-primary"

// Fondo gris claro (alternativo)
className="bg-dp-bg-secondary"

// Fondo gris medio (terciario)
className="bg-dp-bg-tertiary"
```

---

## 📏 Espaciado

### Sistema de Espaciado Personalizado
```tsx
spacing: {
  4: '4px',
  8: '8px',
  12: '12px',
  16: '16px',
  20: '20px',
  32: '32px',
  40: '40px',
  48: '48px',
  52: '52px',
  64: '64px',
  76: '76px',
  84: '84px',
  96: '96px',
}
```

### Uso Recomendado
- **Padding de componentes pequeños**: `p-12` o `p-16`
- **Padding de cards**: `p-20` o `p-32`
- **Márgenes entre secciones**: `my-64` o `my-96`
- **Gap en grids**: `gap-20` o `gap-32`

---

## 🔲 Bordes y Radios

### Border Radius
```tsx
// Componentes pequeños
rounded-8   // 8px - Inputs, badges
rounded-12  // 12px - Botones pequeños, cards pequeños
rounded-16  // 16px - Cards medianos
rounded-20  // 20px - Cards grandes, modales
rounded-40  // 40px - Elementos muy redondeados
```

### Bordes
```tsx
// Borde claro
border border-dp-border-light

// Borde medio
border border-dp-border-medium

// Borde oscuro
border-2 border-dp-border-dark
```

---

## 💫 Sombras

### Sistema de Sombras
```tsx
shadow-sm   // Sombra sutil
shadow-md   // Sombra media (cards)
shadow-lg   // Sombra grande (hover cards)
shadow-xl   // Sombra extra grande (modales, popups)
shadow-2xl  // Sombra máxima (elementos flotantes)
```

**Nota:** Las sombras usan un tono azulado (`rgba(0, 78, 152, ...)`) para mantener consistencia con la marca.

---

## 🎯 Estados Interactivos

### Hover
```tsx
// Botones
hover:bg-dp-blue-600 hover:shadow-lg hover:scale-105

// Cards
hover:shadow-md hover:border-dp-blue-200

// Links
hover:text-dp-blue-600 hover:underline
```

### Focus
```tsx
focus:border-dp-blue-500 focus:ring-2 focus:ring-dp-blue-100 focus:outline-none
```

### Disabled
```tsx
disabled:bg-dp-bg-disabled disabled:text-dp-text-disabled disabled:cursor-not-allowed
```

---

## 🚦 Colores Semánticos

### Success (Verde)
```tsx
bg-dp-success-500 text-white        // Botón success
bg-dp-success-50 text-dp-success-700 // Badge success
```

### Warning (Amarillo)
```tsx
bg-dp-warning-500 text-white        // Botón warning
bg-dp-warning-50 text-dp-warning-700 // Badge warning
```

### Error (Rojo)
```tsx
bg-dp-error-500 text-white          // Botón error
bg-dp-error-50 text-dp-error-700    // Badge error
text-dp-error-600                   // Texto de error
```

### Info (Azul claro)
```tsx
bg-dp-info-500 text-white           // Botón info
bg-dp-info-50 text-dp-info-700      // Badge info
```

---

## 📱 Responsive

### Breakpoints (Tailwind por defecto)
```
sm: 640px   // Móvil grande
md: 768px   // Tablet
lg: 1024px  // Desktop pequeño
xl: 1280px  // Desktop grande
2xl: 1536px // Desktop muy grande
```

### Patrones Comunes
```tsx
// Ocultar en móvil
className="hidden lg:block"

// Grid responsive
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20"

// Texto responsive
className="text-2xl md:text-4xl lg:text-5xl"

// Padding responsive
className="px-4 md:px-8 lg:px-12"
```

---

## ✅ Ejemplos de Uso

### Hero Section
```tsx
<section className="relative bg-gradient-to-br from-dp-blue-500 via-dp-blue-600 to-dp-blue-800 text-white py-20 px-4 overflow-hidden">
  {/* Decoración */}
  <div className="absolute opacity-10">
    <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
    <div className="absolute bottom-20 right-10 w-96 h-96 bg-dp-orange-400 rounded-full blur-3xl"></div>
  </div>
  
  {/* Contenido */}
  <div className="relative z-10">
    <h1 className="text-5xl lg:text-7xl font-bold">
      Tu título aquí
    </h1>
    <p className="text-xl text-dp-blue-100">
      Subtítulo descriptivo
    </p>
  </div>
</section>
```

### Card de Pricing
```tsx
<div className="bg-white border-2 border-dp-blue-500 rounded-20 p-32 shadow-lg hover:shadow-xl transition-all">
  <h3 className="text-2xl font-bold text-dp-text-title">Plan Premium</h3>
  <p className="text-4xl font-bold text-dp-blue-500 mt-4">S/ 29.90</p>
  <Button className="w-full mt-6 bg-dp-blue-500 hover:bg-dp-blue-600 text-white py-4 rounded-12">
    Comenzar
  </Button>
</div>
```

### Form Input
```tsx
<div className="space-y-2">
  <label className="text-sm font-medium text-dp-text-body">Email</label>
  <input 
    type="email"
    className="w-full px-4 py-3 border border-dp-border-medium rounded-12 focus:border-dp-blue-500 focus:ring-2 focus:ring-dp-blue-100"
    placeholder="tu@email.com"
  />
</div>
```

---

## 🎨 Guía Rápida de Decisiones

| Elemento | Color Principal | Color Hover | Color Texto |
|----------|----------------|-------------|-------------|
| **Botón CTA Principal** | `bg-dp-blue-500` | `hover:bg-dp-blue-600` | `text-white` |
| **Botón CTA Acción** | `bg-dp-orange-500` | `hover:bg-dp-orange-600` | `text-white` |
| **Link** | `text-dp-blue-500` | `hover:text-dp-blue-600` | - |
| **Card** | `bg-white` | `hover:shadow-md` | `text-dp-text-body` |
| **Badge Premium** | `bg-dp-blue-100` | - | `text-dp-blue-700` |
| **Badge Nuevo** | `bg-dp-orange-100` | - | `text-dp-orange-700` |
| **Input** | `border-dp-border-medium` | `focus:border-dp-blue-500` | `text-dp-text-body` |
| **Título H1** | - | - | `text-dp-text-title` |
| **Texto Cuerpo** | - | - | `text-dp-text-body` |
| **Fondo Página** | `bg-dp-bg-secondary` | - | - |

---

## 📚 Recursos

- **Fuente Inter**: [Google Fonts - Inter](https://fonts.google.com/specimen/Inter)
- **Tailwind CSS**: [Documentación oficial](https://tailwindcss.com)
- **shadcn/ui**: [Componentes](https://ui.shadcn.com)

---

**Última actualización:** 4 de diciembre de 2025
**Versión:** 1.0.0
