# 📚 Documentación — Smart Teacher Frontend

Documentación técnica del proyecto organizada por categorías.

---

## 🏗️ Arquitectura

Decisiones de diseño, autenticación y configuración base del proyecto.

| Documento | Descripción |
|-----------|-------------|
| [AUTH_FLOW.md](arquitectura/AUTH_FLOW.md) | Flujo de autenticación con Auth0 |
| [AUTH_STORE_GUIDE.md](arquitectura/AUTH_STORE_GUIDE.md) | Guía del store de autenticación |
| [CLEAN_AUTH_ARCHITECTURE.md](arquitectura/CLEAN_AUTH_ARCHITECTURE.md) | Arquitectura limpia de auth |
| [auth0-usage.md](arquitectura/auth0-usage.md) | Uso práctico de Auth0 |
| [DESIGN_SYSTEM.md](arquitectura/DESIGN_SYSTEM.md) | Sistema de diseño DocentePro |
| [DESIGN_UPDATE.md](arquitectura/DESIGN_UPDATE.md) | Actualizaciones del sistema de diseño |
| [NOTA_CONFIGURACION_TYPESCRIPT.md](arquitectura/NOTA_CONFIGURACION_TYPESCRIPT.md) | Configuración de TypeScript |
| [ARQUITECTURA_VISUAL.txt](arquitectura/ARQUITECTURA_VISUAL.txt) | Diagrama visual de la arquitectura |

---

## 🔌 Backend

Endpoints, contratos de API y requerimientos del backend.

| Documento | Descripción |
|-----------|-------------|
| [ENDPOINTS_BACKEND.md](backend/ENDPOINTS_BACKEND.md) | Catálogo de endpoints de la API |
| [BACKEND_REQUIREMENTS.md](backend/BACKEND_REQUIREMENTS.md) | Requerimientos del backend para login |

---

## ⚙️ Features

### 📊 Gráficos Educativos

Sistema de gráficos interactivos con Rough.js para sesiones de aprendizaje.

| Documento | Descripción |
|-----------|-------------|
| [INDICE_DOCUMENTACION_GRAFICOS.md](features/graficos-educativos/INDICE_DOCUMENTACION_GRAFICOS.md) | **Índice** de toda la documentación de gráficos |
| [FEATURE_GRAFICOS_EDUCATIVOS.md](features/graficos-educativos/FEATURE_GRAFICOS_EDUCATIVOS.md) | Descripción general del feature |
| [ESTRUCTURA_GRAFICOS_EDUCATIVOS.md](features/graficos-educativos/ESTRUCTURA_GRAFICOS_EDUCATIVOS.md) | Estructura visual del sistema |
| [GUIA_GRAFICOS_EDUCATIVOS.md](features/graficos-educativos/GUIA_GRAFICOS_EDUCATIVOS.md) | Guía de implementación |
| [ESPECIFICACIONES_GRAFICOS_BACKEND.md](features/graficos-educativos/ESPECIFICACIONES_GRAFICOS_BACKEND.md) | Specs para generación desde backend |
| [INTEGRACION_GRAFICOS_ROUGHJS.md](features/graficos-educativos/INTEGRACION_GRAFICOS_ROUGHJS.md) | Integración con Rough.js |
| [GRAFICOS_PLAYGROUND_README.md](features/graficos-educativos/GRAFICOS_PLAYGROUND_README.md) | Playground de gráficos |
| [ECUACION_PASO_A_PASO.md](features/graficos-educativos/ECUACION_PASO_A_PASO.md) | Ecuaciones con resolución paso a paso |
| [ACTUALIZACION_ECUACION_CAJAS_AGRUPACIONES.md](features/graficos-educativos/ACTUALIZACION_ECUACION_CAJAS_AGRUPACIONES.md) | Soporte de agrupaciones en EcuacionCajas |
| [GUIA_BACKEND_AGRUPACIONES.md](features/graficos-educativos/GUIA_BACKEND_AGRUPACIONES.md) | Guía backend para envío de agrupaciones |
| [RESUMEN_IMPLEMENTACION.md](features/graficos-educativos/RESUMEN_IMPLEMENTACION.md) | Resumen de implementación completa |

### 💳 Pagos

Sistema de pagos y suscripciones.

| Documento | Descripción |
|-----------|-------------|
| [PAYMENT_SYSTEM.md](features/pagos/PAYMENT_SYSTEM.md) | Sistema de pagos DocentePro |
| [INTEGRATION_CHECKLIST.md](features/pagos/INTEGRATION_CHECKLIST.md) | Checklist de integración de pagos |

### 🚀 Landing Page

Landing page pública y flujo de conversión.

| Documento | Descripción |
|-----------|-------------|
| [LANDING_README.md](features/landing/LANDING_README.md) | Documentación de la landing |
| [LANDING_IMPLEMENTATION_SUMMARY.md](features/landing/LANDING_IMPLEMENTATION_SUMMARY.md) | Resumen de implementación |
| [landing-payment-flow.md](features/landing/landing-payment-flow.md) | Flujo landing → pago |

### ⏳ Loading Global

Sistema de loading centralizado.

| Documento | Descripción |
|-----------|-------------|
| [GLOBAL_LOADING.md](features/loading/GLOBAL_LOADING.md) | Sistema de loading global |
| [LOADING_SYSTEM_SUMMARY.md](features/loading/LOADING_SYSTEM_SUMMARY.md) | Resumen del sistema de loading |

### 🤖 Competencias (IA)

Sugerencia automática de competencias por inteligencia artificial.

| Documento | Descripción |
|-----------|-------------|
| [SUGERENCIA_COMPETENCIA_DOCS.md](features/competencias/SUGERENCIA_COMPETENCIA_DOCS.md) | Sistema de sugerencia automática |

### 📝 Sesión de Aprendizaje

Interfaces y estructura de datos por área curricular.

| Documento | Descripción |
|-----------|-------------|
| [INTERFACES_POR_AREA.md](features/sesion-aprendizaje/INTERFACES_POR_AREA.md) | Interfaces separadas por área |
| [IMPLEMENTACION_AREAS_COMPLETADA.md](features/sesion-aprendizaje/IMPLEMENTACION_AREAS_COMPLETADA.md) | Implementación completada de áreas |
| [INICIO_RAPIDO.md](features/sesion-aprendizaje/INICIO_RAPIDO.md) | Inicio rápido — interfaces por área |

---

## 📋 Guías Generales

| Documento | Descripción |
|-----------|-------------|
| [IMPLEMENTATION_SUMMARY.md](guias/IMPLEMENTATION_SUMMARY.md) | Resumen de implementación general (auth) |
| [IMPLEMENTACION_COMPLETA.txt](guias/IMPLEMENTACION_COMPLETA.txt) | Log de implementación completa |

---

> **Nota:** Los README internos de cada feature (`src/features/*/README.md`) permanecen junto a su código fuente para mantener la colocación.
