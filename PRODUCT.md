# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Docentes de primaria y secundaria en Perú, a menudo entre ~45 y 65 años. Planifican fuera del aula (casa, sala de profesores) con poco tiempo, y necesitan una interfaz clara, legible y calmada — no “techy”.

## Product Purpose

Docente Pro ayuda a planificar sesiones y unidades de aprendizaje alineadas al Currículo Nacional, generar documentos listos para clase y organizar el trabajo pedagógico con apoyo de IA.

Éxito = el docente crea o abre lo que necesita en pocos toques, sin fricción visual ni jerga técnica.

## Positioning

Planificación pedagógica hecha para el docente peruano: currículo local, documentos reales (sesiones, unidades, fichas) y un tono de herramienta de aula, no de startup genérica.

## Operating Context

- Dashboard como hub: crear, preparar documentos, abrir lo ya hecho, unirse a una unidad.
- Flujos de cuestionario → generación → resultado PDF/documento.
- Planes Free / Premium / Equipo con límites de sesiones y unidades.
- Ilustraciones 3D amables (docente por género) en el banner de bienvenida.

## Capabilities and Constraints

- Crear sesión (acción primaria), crear unidad, sesión individual (Premium).
- Subir lista de alumnos e insignia del colegio.
- Mis sesiones / unidades / fichas; unirse a unidad por código.
- Copy en español (Perú), tipografía grande, targets táctiles generosos.
- Open: alcance exacto de branding legal / logos oficiales no fijado aquí.

## Brand Commitments

- Nombre: **Docente Pro**.
- Voz: cercana, clara, sin anglicismos innecesarios (“Bienvenido/a”, “¿Qué quieres crear?”).
- Mundo visual: “cuaderno del docente” — calma Logip (azul pastel + peach), no purple-AI ni dark mode por defecto.
- Fuente de producto: **Nunito**.

## Evidence on Hand

- Implementación de referencia: `src/pages/Dashboard.tsx`.
- Tokens y motion: `DESIGN.md`, `src/index.css` (clases `dp-*`).
- Assets: `public/dashboard/welcome-male.png`, `welcome-female.png`, `sesion.png`, `unidad.png`.

## Product Principles

1. **Claridad primero** — una acción primaria obvia por pantalla.
2. **Calma operativa** — soft UI; decoración solo donde ayuda (banner, canvas).
3. **Respeto al docente** — tipografía legible, contraste suficiente, sin ruido.
4. **Currículo y documentos reales** — el producto habla de sesiones, unidades y fichas.

## Accessibility & Inclusion

- Público adulto no digital-nativo: tamaños de texto generosos (≥16px cuerpo), botones ≥44px de alto útil.
- Respetar `prefers-reduced-motion`.
- Contraste AA en texto sobre canvas, banner y CTAs.
- Bienvenida por género (`Bienvenido` / `Bienvenida`) cuando el perfil lo indique.
