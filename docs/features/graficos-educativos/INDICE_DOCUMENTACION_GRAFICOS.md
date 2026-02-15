# 📚 Índice de Documentación - Feature Gráficos Educativos

## 🎯 Inicio Rápido

¿Primera vez usando este feature? Empieza aquí:

1. 📖 **[RESUMEN_IMPLEMENTACION.md](./RESUMEN_IMPLEMENTACION.md)**
   - Resumen ejecutivo de la implementación
   - Lista completa de archivos creados
   - Checklist de implementación
   
2. 🚀 **[QUICK_START.tsx](./src/features/graficos-educativos/QUICK_START.tsx)**
   - Prueba rápida del feature
   - Copiar y pegar para probar
   - Verificar que todo funciona

---

## 📘 Documentación Completa

### 1. Guía de Implementación
📄 **[GUIA_GRAFICOS_EDUCATIVOS.md](./GUIA_GRAFICOS_EDUCATIVOS.md)**
- Arquitectura del feature
- Explicación de cada capa (Dominio, Aplicación, Infraestructura, Presentación)
- Casos de uso detallados
- Ejemplos de código
- Flujo de datos
- Tips de desarrollo

### 2. Estructura Visual
📐 **[ESTRUCTURA_GRAFICOS_EDUCATIVOS.md](./ESTRUCTURA_GRAFICOS_EDUCATIVOS.md)**
- Estructura completa de carpetas
- Flujo de datos entre capas
- Lista de todos los archivos
- Resumen visual del proyecto

### 3. README del Feature
📖 **[README.md](./src/features/graficos-educativos/README.md)**
- Descripción del feature
- Arquitectura específica
- Componentes disponibles
- Uso básico
- Hook personalizado
- Tipos soportados

---

## 🎓 Recursos de Aprendizaje

### Ejemplos de Código

📂 **[presentation/examples/](./src/features/graficos-educativos/presentation/examples/)**

1. **IntegracionProcesoPedagogico.example.tsx**
   - Ejemplo de integración con proceso pedagógico
   - Uso del hook useGraficosEducativos
   - Manejo de errores
   - Componente completo funcional

2. **GaleriaEjemplos.example.tsx**
   - 5 ejemplos diferentes de gráficos
   - Ecuaciones, tablas, barras, etc.
   - Simulación de datos del backend
   - Galería completa para visualizar

---

## 🔍 Documentación Técnica

### Dominio

📘 **[domain/types/graficos.types.ts](./src/features/graficos-educativos/domain/types/graficos.types.ts)**
- Definición de todos los tipos
- 15+ interfaces de gráficos
- Enums (TipoGraficoMatematica, ColorGrafico)
- Tipos exportados

📘 **[domain/entities/Grafico.entity.ts](./src/features/graficos-educativos/domain/entities/Grafico.entity.ts)**
- Entidad principal GraficoEducativo
- Métodos de validación
- Lógica de negocio pura

📘 **[domain/repositories/IGrafico.repository.ts](./src/features/graficos-educativos/domain/repositories/IGrafico.repository.ts)**
- Interface del repositorio
- Contrato de métodos
- Sin implementación (solo contrato)

### Aplicación (Casos de Uso)

💼 **[application/use-cases/ValidarGrafico.usecase.ts](./src/features/graficos-educativos/application/use-cases/ValidarGrafico.usecase.ts)**
- Validación de gráficos
- Retorna errores específicos
- Independiente de framework

💼 **[application/use-cases/ObtenerTipoGrafico.usecase.ts](./src/features/graficos-educativos/application/use-cases/ObtenerTipoGrafico.usecase.ts)**
- Identifica tipo de gráfico
- Verifica si es soportado
- Lista tipos disponibles

💼 **[application/use-cases/TransformarDatosGrafico.usecase.ts](./src/features/graficos-educativos/application/use-cases/TransformarDatosGrafico.usecase.ts)**
- Transforma datos del backend
- Aplica valores por defecto
- Normaliza estructura

### Infraestructura

🏗️ **[infrastructure/repositories/GraficoLocalStorage.repository.ts](./src/features/graficos-educativos/infrastructure/repositories/GraficoLocalStorage.repository.ts)**
- Implementación de caché local
- Usa LocalStorage
- Expiración automática (30 min)
- Gestión de memoria

🏗️ **[infrastructure/adapters/GraficoBackend.adapter.ts](./src/features/graficos-educativos/infrastructure/adapters/GraficoBackend.adapter.ts)**
- Normaliza respuestas del backend
- Soporta múltiples formatos
- Adapta nombres de propiedades
- Manejo robusto de errores

### Presentación

#### Componentes

⚛️ **[presentation/components/GraficoRenderer.tsx](./src/features/graficos-educativos/presentation/components/GraficoRenderer.tsx)**
- Componente principal (dispatcher)
- Selecciona componente correcto
- Manejo de errores
- Validación automática

⚛️ **[presentation/components/EcuacionCajas.tsx](./src/features/graficos-educativos/presentation/components/EcuacionCajas.tsx)**
- Ecuaciones con cajas visuales
- Soporte de agrupaciones
- Colores configurables

⚛️ **[presentation/components/TablaPrecios.tsx](./src/features/graficos-educativos/presentation/components/TablaPrecios.tsx)**
- Tablas de precios
- Cálculo automático de totales
- Soporte de iconos

⚛️ **[presentation/components/BarrasComparacion.tsx](./src/features/graficos-educativos/presentation/components/BarrasComparacion.tsx)**
- Gráficos de barras
- Eje Y configurable
- Múltiples colores

⚛️ **[presentation/components/TablaValores.tsx](./src/features/graficos-educativos/presentation/components/TablaValores.tsx)**
- Tablas genéricas
- Con/sin bordes
- Responsive

⚛️ **[presentation/components/BloqueAgrupados.tsx](./src/features/graficos-educativos/presentation/components/BloqueAgrupados.tsx)**
- Bloques agrupados
- Horizontal/Vertical
- Tamaño configurable

#### Hooks

🪝 **[presentation/hooks/useGraficosEducativos.ts](./src/features/graficos-educativos/presentation/hooks/useGraficosEducativos.ts)**
- Hook principal del feature
- Orquesta casos de uso
- Manejo de errores centralizado
- API simplificada

#### Estilos

💅 **[presentation/styles/colores-minedu.css](./src/features/graficos-educativos/presentation/styles/colores-minedu.css)**
- Variables CSS de colores
- Paleta educativa MINEDU
- Soporte modo oscuro
- Variables de espaciado

💅 **[presentation/styles/graficos.css](./src/features/graficos-educativos/presentation/styles/graficos.css)**
- Estilos globales
- Estados de error
- Optimización para impresión
- Responsive

💅 **Estilos específicos por componente**
- EcuacionCajas.css
- TablaPrecios.css
- BarrasComparacion.css
- TablaValores.css
- BloqueAgrupados.css

---

## 📋 Navegación Rápida por Tarea

### "Quiero integrar gráficos en mi aplicación"
1. Lee: [RESUMEN_IMPLEMENTACION.md](./RESUMEN_IMPLEMENTACION.md)
2. Prueba: [QUICK_START.tsx](./src/features/graficos-educativos/QUICK_START.tsx)
3. Consulta: [README.md](./src/features/graficos-educativos/README.md)
4. Ejemplo: [IntegracionProcesoPedagogico.example.tsx](./src/features/graficos-educativos/presentation/examples/IntegracionProcesoPedagogico.example.tsx)

### "Quiero entender la arquitectura"
1. Lee: [GUIA_GRAFICOS_EDUCATIVOS.md](./GUIA_GRAFICOS_EDUCATIVOS.md)
2. Visualiza: [ESTRUCTURA_GRAFICOS_EDUCATIVOS.md](./ESTRUCTURA_GRAFICOS_EDUCATIVOS.md)

### "Quiero ver ejemplos de código"
1. Galería: [GaleriaEjemplos.example.tsx](./src/features/graficos-educativos/presentation/examples/GaleriaEjemplos.example.tsx)
2. Integración: [IntegracionProcesoPedagogico.example.tsx](./src/features/graficos-educativos/presentation/examples/IntegracionProcesoPedagogico.example.tsx)
3. Prueba rápida: [QUICK_START.tsx](./src/features/graficos-educativos/QUICK_START.tsx)

### "Quiero agregar un nuevo tipo de gráfico"
1. Agrega tipo en: [graficos.types.ts](./src/features/graficos-educativos/domain/types/graficos.types.ts)
2. Crea componente en: `presentation/components/`
3. Registra en: [GraficoRenderer.tsx](./src/features/graficos-educativos/presentation/components/GraficoRenderer.tsx)
4. Crea estilos en: `presentation/styles/`

### "Quiero personalizar los estilos"
1. Revisa: [colores-minedu.css](./src/features/graficos-educativos/presentation/styles/colores-minedu.css)
2. Modifica: Variables CSS según necesidad
3. Específicos: Cada componente tiene su CSS

---

## 🎨 Recursos Visuales

### Estructura de Carpetas
```
Ver: ESTRUCTURA_GRAFICOS_EDUCATIVOS.md
```

### Flujo de Datos
```
Ver: GUIA_GRAFICOS_EDUCATIVOS.md (Sección "Flujo de Datos")
```

### Paleta de Colores
```
Ver: presentation/styles/colores-minedu.css
```

---

## 🔧 Mantenimiento

### Agregar Nuevo Tipo de Gráfico

1. **Dominio**: Agregar tipo en `graficos.types.ts`
2. **Presentación**: Crear componente en `components/`
3. **Estilos**: Crear CSS en `styles/`
4. **Registro**: Agregar en `GraficoRenderer.tsx`
5. **Ejemplo**: Agregar ejemplo en `examples/`

### Modificar Caso de Uso Existente

1. Navegar a: `application/use-cases/`
2. Modificar caso de uso específico
3. Tests (si existen)
4. Documentar cambios

### Actualizar Estilos

1. Variables globales: `colores-minedu.css`
2. Estilos generales: `graficos.css`
3. Específicos: `[Componente].css`

---

## 📊 Estadísticas del Proyecto

- **Total archivos**: 37
- **Líneas de código**: ~3,500+
- **Componentes React**: 6
- **Casos de Uso**: 3
- **Tipos definidos**: 15+
- **Archivos CSS**: 7
- **Ejemplos**: 2

---

## ✅ Checklist de Inicio

- [ ] Leer RESUMEN_IMPLEMENTACION.md
- [ ] Ejecutar QUICK_START.tsx
- [ ] Ver GaleriaEjemplos.example.tsx
- [ ] Leer README.md del feature
- [ ] Revisar GUIA_GRAFICOS_EDUCATIVOS.md
- [ ] Entender ESTRUCTURA_GRAFICOS_EDUCATIVOS.md
- [ ] Integrar en tu primera página

---

## 🆘 Soporte

### ¿No funciona algo?
1. Revisa: [QUICK_START.tsx](./src/features/graficos-educativos/QUICK_START.tsx)
2. Verifica: Errores en consola
3. Consulta: [GUIA_GRAFICOS_EDUCATIVOS.md](./GUIA_GRAFICOS_EDUCATIVOS.md)

### ¿Necesitas ejemplos?
1. Ver: [GaleriaEjemplos.example.tsx](./src/features/graficos-educativos/presentation/examples/GaleriaEjemplos.example.tsx)
2. Copiar: [IntegracionProcesoPedagogico.example.tsx](./src/features/graficos-educativos/presentation/examples/IntegracionProcesoPedagogico.example.tsx)

### ¿Quieres extender el feature?
1. Leer: [GUIA_GRAFICOS_EDUCATIVOS.md](./GUIA_GRAFICOS_EDUCATIVOS.md)
2. Ver estructura: [ESTRUCTURA_GRAFICOS_EDUCATIVOS.md](./ESTRUCTURA_GRAFICOS_EDUCATIVOS.md)

---

## 🎯 Próximos Pasos Recomendados

1. ✅ Ejecutar prueba rápida (QUICK_START.tsx)
2. ✅ Leer documentación básica (README.md)
3. ✅ Ver ejemplos (GaleriaEjemplos)
4. ✅ Integrar en tu app (IntegracionProcesoPedagogico)
5. ✅ Personalizar estilos (colores-minedu.css)
6. 🔜 Agregar tests unitarios
7. 🔜 Implementar más tipos de gráficos

---

📚 **Toda la documentación está interconectada y se complementa entre sí**

🎉 **¡Empieza por el RESUMEN_IMPLEMENTACION.md y la prueba rápida!**

---

_Documentación mantenida y actualizada_  
_Última actualización: Enero 2026_
