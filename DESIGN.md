---
name: Docente Pro
description: Planificación pedagógica calmada y clara para docentes peruanos — “cuaderno del docente”
colors:
  canvas: "#F5F7FA"
  surface: "#FFFFFF"
  surface-muted: "#EEF3F9"
  ink: "#1F2937"
  ink-muted: "#6B7280"
  ink-subtle: "#9CA3AF"
  border: "#E6EBF2"
  primary: "#FF8B5C"
  primary-deep: "#F97316"
  primary-soft: "#FFEDE5"
  primary-text-on: "#FFFFFF"
  atmosphere: "#6B9FE8"
  atmosphere-mid: "#8BB4F0"
  atmosphere-soft: "#EAF2FC"
  atmosphere-ink: "#3B6CB5"
  accent-soft: "#E3F8EC"
  accent-ink: "#15803D"
  tag-pink: "#FCE7F3"
  tag-pink-ink: "#BE185D"
  warning-soft: "#FFF7ED"
  warning-ink: "#C2410C"
  focus-ring: "rgba(255, 139, 92, 0.32)"
typography:
  body:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.5
  heading:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  label:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.4
  display:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "36px"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.02em"
rounded:
  sm: "14px"
  md: "20px"
  lg: "28px"
  xl: "32px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  ease-move: "cubic-bezier(0.77, 0, 0.175, 1)"
  press: "140ms"
  hover: "200ms"
  enter: "280ms"
  banner-art: "420ms"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-text-on}"
    rounded: "{rounded.lg}"
    padding: "20px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.primary-text-on}"
    rounded: "{rounded.lg}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "20px"
  card-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "20px"
  banner-welcome:
    backgroundColor: "{colors.atmosphere}"
    textColor: "{colors.primary-text-on}"
    rounded: "{rounded.xl}"
    padding: "24px 32px"
  nav-active:
    backgroundColor: "{colors.atmosphere}"
    textColor: "{colors.primary-text-on}"
    rounded: "{rounded.md}"
  well-soft:
    backgroundColor: "{colors.atmosphere-soft}"
    textColor: "{colors.atmosphere-ink}"
    rounded: "{rounded.md}"
---

## Overview

Docente Pro es una UI **Operate** calmada, inspirada en Logip: lienzo gris suave, tarjetas blancas, **azul pastel desaturado** (`atmosphere`) para atmósfera y navegación, y **peach** (`primary`) solo para la acción principal de crear.

El signature visual es **“cuaderno del docente”**: patrón de líneas de cuaderno en el banner, puntos casi invisibles en el canvas vacío, y superficies de trabajo (cards/listas) limpias. No es un design system genérico: es la receta para que nuevas pantallas se sientan como el Dashboard.

**Audiencia:** docentes ~45–65. Priorizar legibilidad, targets grandes y cero ruido decorativo en zonas de decisión.

**Referencia canónica de implementación:** `src/pages/Dashboard.tsx` + clases `dp-*` en `src/index.css`.

### Principios

1. Una acción primaria obvia por vista.
2. Decoración solo en atmósfera (banner / canvas), nunca encima del contenido interactivo denso.
3. Soft UI: radios grandes, sombras suaves, sin neón ni glow.
4. Motion Emil: ease-out corto, press scale, reduced-motion respetado.
5. Ilustración 3D amable, coherente con el azul del banner.

### Jerarquía de acciones (Dashboard y pantallas hub)

De mayor a menor peso visual:

1. **Crear sesión** — CTA peach dominante  
2. **Crear unidad** — card blanca secundaria  
3. **Sesión individual** (Premium) — fila ancha  
4. **Preparar documentos** — cards de setup  
5. **Mis documentos** — lista de navegación  
6. **Unirme** — acción terciaria  
7. **Meta** (plan / unidad en curso) — chips o bloque pequeño al final  

---

## Colors

| Token | Hex | Uso |
|---|---|---|
| `canvas` | `#F5F7FA` | Fondo de página (+ dots) |
| `surface` | `#FFFFFF` | Cards, sidebar, listas |
| `ink` | `#1F2937` | Texto principal |
| `ink-muted` | `#6B7280` | Subtítulos, meta |
| `ink-subtle` | `#9CA3AF` | Chevrons, hints |
| `border` | `#E6EBF2` | Bordes de card / divisores |
| `atmosphere` | `#6B9FE8` | Banner, logo tile, nav activo |
| `atmosphere-soft` | `#EAF2FC` | Wells, pills activas |
| `atmosphere-ink` | `#3B6CB5` | Iconos/texto sobre wells azules |
| `primary` | `#FF8B5C` | Solo CTA principal (Crear sesión) |
| `primary-deep` | `#F97316` | Hover del CTA principal |
| `accent-soft` / `accent-ink` | verde | Unidades / éxito suave |
| `tag-pink` / `tag-pink-ink` | rosa | Fichas |
| `warning-soft` / `warning-ink` | naranja suave | Bloqueos Free / avisos |
| `focus-ring` | peach 32% | Focus visible |

### Reglas de color

- **Un peach por vista** como acción primaria. No pintar varias cards naranjas.
- El azul es atmósfera, no CTA de conversión.
- Semántica estable: azul = sesiones/navegación, verde = unidades, rosa = fichas, gris = unirme/meta.
- Prohibido por defecto: purple-to-indigo AI, cream+terracotta broadsheet, dark mode como look principal.

---

## Typography

Familia única: **Nunito** (cargada en el proyecto). No Inter / Roboto / system como display.

| Rol | Peso | Tamaño guía | Notas |
|---|---|---|---|
| Display / saludo banner | 800 | 32–36px (`sm:` 36–40) | `tracking-[-0.02em]`, `text-balance` |
| Section heading (`h2`) | 800 | 20px (`text-xl`) | Ink `#1F2937` |
| Card title | 800 | 18–24px | Según jerarquía |
| Body | 600 | 16px | Mínimo en UI operativa |
| Supporting | 600 | 16–18px | Leading cómodo (~28px) |
| Label / eyebrow | 700 | 14px | Banner kicker, meta |

Copy en **español claro**, sentence case. Controles nombran la acción (“Crear sesión”, no “Submit”).

---

## Layout

- **Ancho:** full-bleed útil (sin max-width estrecho tipo landing). Sidebar fija + main fluido.
- **Main padding:** `px-4 py-6` → `sm:px-6 sm:py-8` → `lg:px-8`.
- **Secciones:** un propósito, un `h2`, un bloque de acciones. Separación `mb-6` entre secciones.
- **Grid crear:** 2 columnas en `md+` para sesión/unidad; filas full-width debajo.
- **Banner:** texto a la izquierda (máx ~52% en `lg`), ilustración anclada abajo-derecha, `object-contain`, altura ~210–240px. No `background-size: cover` sobre el personaje.
- **Responsive:** en mobile el personaje del banner puede ocultarse (`hidden sm:block`); el texto y CTAs nunca dependen de la ilustración.

### Patrones “cuaderno del docente”

| Clase CSS | Dónde | Qué |
|---|---|---|
| `dp-canvas-dots` | Shell de página | Puntos azul muy suaves sobre `#F5F7FA` |
| `dp-banner-notebook` | Banner welcome | Líneas de cuaderno + margen + motifs académicos |
| `dp-cta-soft-pattern` | Solo CTA peach | Brillos / diagonal suave |
| — | Cards, listas, forms | **Sin patrón**. Fondo `surface` sólido |

No repetir el patrón de cuaderno en cada card. Saturar = ruido para la audiencia.

---

## Elevation & Depth

- Card default: `shadow-[0_8px_28px_rgba(31,41,55,0.05)]`.
- CTA peach: sombra teñida `0_16px_40px_rgba(255,139,92,0.28)`.
- Nav / logo atmosphere: sombra azul suave `rgba(107,159,232,0.28)`.
- Hover lift (`dp-lift`): `translateY(-2px)` + sombra atmosphere.
- Header sticky: `bg-[#F5F7FA]/85 backdrop-blur-md` + borde suave.
- Sin multi-layer neon glow ni sombras de color cero-offset como decoración.

---

## Shapes

- Radios grandes y amables: cards `28px`, banner `32px`, wells/icon tiles `16–22px`, pills `9999px`.
- Icon wells: cuadrados redondeados con color soft + ink semántico (no solo gris).
- Bordes de card: `1px solid #E6EBF2`; hover opcional con tinte peach/atmosphere al 30%.
- Evitar pills `rounded-full` en clusters decorativos; reservar full para chips/nav compacta.

---

## Components

### Shell

- Root: `dp-canvas-dots` + Nunito + ink.
- Sidebar blanca translúcida; item activo = `atmosphere` + texto blanco.
- Focus: `ring-4` con `focus-ring` peach y offset al canvas.

### Banner de bienvenida

```
section.dp-banner-notebook.bg-atmosphere.rounded-[32px]
  img.dp-banner-art (gender asset, object-contain, bottom-right)
  copy (kicker + saludo + subtítulo)
```

- Assets: `/dashboard/welcome-male.png` | `welcome-female.png` según `user.genero === "Femenino"`.
- Fondo del PNG debe ser **exactamente** `#6B9FE8` (mismo que CSS) o personaje con alpha real. Nunca damero “fake transparency”.
- Copy: “Tu espacio de planificación” / “Bienvenido(a), {nombre}” / subtítulo de una línea.

### CTA primario (Crear sesión)

- `bg-primary` + `dp-cta-soft-pattern` + `dp-press dp-lift`.
- Icono 3D en tile blanco (`/dashboard/sesion.png`).
- Título grande + una línea de apoyo en `orange-50` / blanco suave.

### Card secundaria (Crear unidad)

- `bg-surface` + border + misma estructura de icono (`/dashboard/unidad.png`).
- Badge Free/lock en `warning-soft` si aplica.

### Fila / lista de documentos

- Full-width, icon well semántico, título + descripción corta, chevron `ink-subtle` → hover peach.
- Targets altos (`min-h` 72–96px).

### Motion (clases)

| Clase | Uso |
|---|---|
| `dp-enter` + `dp-enter-delay-N` | Entrada de secciones (stagger 40ms) |
| `dp-press` | Todo control clickable |
| `dp-lift` | Cards/CTAs hover |
| `dp-banner-art` | Solo ilustración del banner |

Siempre incluir reglas `prefers-reduced-motion: reduce` (ya en `index.css`).

---

## Do's and Don'ts

### Do

- Empezar pantallas hub con jerarquía clara: crear → preparar → abrir.
- Usar tokens de color de este archivo (o hex equivalentes exactos).
- Mantener cards blancas y patrones solo en banner/canvas/CTA peach.
- Ilustración contenida (`object-contain`), anclada, sin costura de color.
- Texto ≥16px en UI operativa; focus visible peach.
- Copiar el tono del Dashboard: cercano, concreto, en español.

### Don't

- No poner patrón de cuaderno o grilla tech en cada card.
- No usar `background-size: cover` / `object-cover` si recorta la cabeza del docente.
- No exportar PNGs con damero de transparencia “horneado”.
- No introducir purple gradients, Inter como display, ni dark-first.
- No competir con varios CTAs peach/naranja en la misma vista.
- No animar acciones de teclado frecuentes; no `transition: all`; no `scale(0)` en entradas.
- No inventar métricas hero / stat strips en el dashboard operativo.

### Checklist rápido (nueva pantalla)

1. ¿Cuál es la única acción primaria? ¿Usa `primary`?
2. ¿Canvas con dots y cards limpias?
3. ¿Tipografía Nunito y tamaños legibles?
4. ¿Motion con `dp-*` y reduced-motion?
5. ¿Se ve calmada a 10 segundos para un docente de 55 años?

### Login (`/login`)

- Split: form card en canvas dots (izq.) + panel `atmosphere` + `dp-banner-notebook` (der., `lg+`).
- CTA único peach: **Iniciar sesión**. Google = outline secundaria.
- Ilustración: asset welcome contenido (`object-contain`), sin cover.
- Referencia: `src/features/auth-screens/login/`.

### Signup (`/signup`)

- Misma estructura que login (paridad visual del flujo auth).
- CTA peach: **Crear cuenta**. Panel con `welcome-female.png`.
- Referencia: `src/features/auth-screens/signup/`.

### Forgot password (`/forgot-password`)

- Misma estructura auth; formulario de un solo campo + estado de éxito.
- CTA peach: **Enviar enlace de recuperación**.
- Referencia: `src/features/auth-screens/forgot-password/ForgotPasswordPage.tsx`.

### Landing (`/`)

- Modo **Persuade**, audiencia 45–65: **poca info, un camino claro**.
- Flujo: Hero (1 CTA) → proceso visual de 3 pasos → muestra real del resultado → Elige tu plan → crear cuenta.
- **Header + hero forman una sola portada full-bleed** en `#6B9FE8`. El conjunto ocupa aproximadamente 85% del primer viewport; debe dejar una pista del contenido siguiente, no encerrarlo todo en `100vh`.
- Dentro de esa portada: texto con medida corta + ilustración 3D grande en `max-w-7xl`. El fondo ocupa todo el ancho, pero el contenido nunca se pega a los bordes.
- Los 3 pasos usan objetos 3D grandes como evidencia: cuaderno de sesión, organizador de unidad y resultado descargable. No son decoración genérica; cada imagen explica qué sucede o qué recibe el docente.
- Mantener una sola composición conectada para los pasos, con textos breves y números visibles. Evitar anidar tarjetas o sumar más etiquetas.
- Mencionar descarga en **Word y PDF**.
- Beneficios del plan se dicen **una sola vez**; las cards de plan solo muestran quién + precio + botón.
- Header: Entrar + Crear cuenta. Sin nav secundaria.
- Footer mínimo. Sin stat strips, sin badge “IA”, sin grids de features.
- La muestra de resultado usa páginas reales sin nombres personales visibles. Tabs Sesión / Unidad; explica qué contiene cada documento, no marketing.
- No agregar más secciones que repitan Currículo, Word/PDF o facilidad. Una sección nueva solo entra si aporta prueba real no mostrada, como testimonios auténticos.
- Referencia: `src/pages/LandingPage.tsx`, `src/components/landing/*`.

### UX note — full width

- **Sí** a full-bleed en hero/atmósfera (presencia, como las referencias).
- **No** a párrafos o listas a todo el ancho del monitor: docentes adultos leen mejor con ~35–45ch de apoyo y un solo CTA grande.
