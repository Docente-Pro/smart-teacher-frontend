# Componente DocTest - Modularizado y con Props

Este documento contiene información sobre la estructura modularizada del componente `DocTest` con soporte completo de TypeScript y props dinámicos.

## 📁 Estructura de Archivos

```
src/
├── components/
│   └── DocTest/
│       ├── index.ts                          # Exportaciones centralizadas
│       ├── DocumentStyles.tsx                # Estilos CSS personalizados
│       ├── DocumentHeader.tsx                # Cabecera del documento (con props)
│       ├── DatosGeneralesSection.tsx         # Sección I: Datos Generales (con props)
│       ├── AdditionalSections.tsx            # Título y Propósito de la Sesión (con props)
│       ├── PropositoAprendizajeSection.tsx   # Sección II: Propósito de Aprendizaje (con props)
│       ├── EnfoquesTransversalesSection.tsx  # Sección III: Enfoques Transversales (con props)
│       ├── PreparacionSesionSection.tsx      # Sección IV: Preparación de la Sesión (con props)
│       ├── SecuenciaDidacticaSection.tsx     # Sección V: Secuencia Didáctica (con props)
│       ├── ReflexionesSection.tsx            # Sección VI: Reflexiones (con props)
│       └── FirmasSection.tsx                 # Sección de Firmas (con props)
├── hooks/
│   └── usePDFGeneration.ts                   # Hook personalizado para generación de PDF
├── interfaces/
│   └── ISesionAprendizaje.ts                 # Interfaces TypeScript (20+ interfaces)
├── data/
│   └── mockSesionAprendizaje.ts              # Datos de ejemplo
└── pages/
    └── DocTest.tsx                            # Componente principal (100 líneas)
```

## 🎯 TypeScript y Props

Todos los componentes ahora aceptan props tipados con TypeScript para contenido dinámico.

### **Interfaces Principales**

El archivo `ISesionAprendizaje.ts` contiene todas las interfaces:

```typescript
export interface ISesionAprendizaje {
  datosGenerales: IDatosGenerales;
  titulo: string;
  propositoSesion: IPropositoSesion;
  propositoAprendizaje: IPropositoAprendizaje;
  enfoquesTransversales: IEnfoqueTransversal[];
  preparacion: IPreparacionSesion;
  secuenciaDidactica: ISecuenciaDidactica;
  reflexiones: IReflexionAprendizaje;
  firmas: IFirmas;
}
```

### **Interfaces por Componente**

#### **IDatosGenerales** (DatosGeneralesSection)
```typescript
interface IDatosGenerales {
  institucion: string;
  docente: string;
  nivel: string;
  grado: string;
  area: string;
  fecha: string;
  duracion: string;
  numeroEstudiantes: string;
}
```

#### **IPropositoAprendizaje** (PropositoAprendizajeSection)
```typescript
interface IPropositoAprendizaje {
  competencia: string;
  capacidades: ICapacidad[];
  criteriosEvaluacion: string[];
  competenciasTransversales: string[];
  evidenciaAprendizaje: string;
  instrumentoEvaluacion: string;
}
```

#### **ISecuenciaDidactica** (SecuenciaDidacticaSection)
```typescript
interface ISecuenciaDidactica {
  inicio: IInicio;
  desarrollo: IDesarrollo;
  cierre: ICierre;
}
```

Ver `ISesionAprendizaje.ts` para todas las interfaces detalladas.

## 🧩 Componentes con Props

### **DocumentHeader.tsx**
```typescript
interface DocumentHeaderProps {
  anioAcademico?: string; // Opcional, default: año actual
}

// Uso
<DocumentHeader anioAcademico="2025" />
```

### **DatosGeneralesSection.tsx**
```typescript
interface DatosGeneralesSectionProps {
  datos: IDatosGenerales;
}

// Uso
<DatosGeneralesSection datos={sesionData.datosGenerales} />
```

### **TituloSesionSection.tsx**
```typescript
interface TituloSesionSectionProps {
  titulo: string;
}

// Uso
<TituloSesionSection titulo="Resolvemos problemas de multiplicación" />
```

### **PropositoSesionSection.tsx**
```typescript
interface PropositoSesionSectionProps {
  proposito: IPropositoSesion;
}

// Uso
<PropositoSesionSection proposito={sesionData.propositoSesion} />
```

### **PropositoAprendizajeSection.tsx**
```typescript
interface PropositoAprendizajeSectionProps {
  proposito: IPropositoAprendizaje;
}

// Uso - Renderiza dinámicamente arrays con .map()
<PropositoAprendizajeSection proposito={sesionData.propositoAprendizaje} />
```

### **EnfoquesTransversalesSection.tsx**
```typescript
interface EnfoquesTransversalesSectionProps {
  enfoques: IEnfoqueTransversal[];
}

// Uso - Tabla dinámica
<EnfoquesTransversalesSection enfoques={sesionData.enfoquesTransversales} />
```

### **PreparacionSesionSection.tsx**
```typescript
interface PreparacionSesionSectionProps {
  preparacion: IPreparacionSesion;
}

// Uso - Divide materiales automáticamente en 2 columnas
<PreparacionSesionSection preparacion={sesionData.preparacion} />
```

### **SecuenciaDidacticaSection.tsx**
```typescript
interface SecuenciaDidacticaSectionProps {
  secuencia: ISecuenciaDidactica;
}

// Uso - Renderiza las 3 fases dinámicamente
<SecuenciaDidacticaSection secuencia={sesionData.secuenciaDidactica} />
```

### **ReflexionesSection.tsx**
```typescript
interface ReflexionesSectionProps {
  reflexiones: IReflexionAprendizaje;
}

// Uso
<ReflexionesSection reflexiones={sesionData.reflexiones} />
```

### **FirmasSection.tsx**
```typescript
interface FirmasSectionProps {
  firmas: IFirmas;
}

// Uso
<FirmasSection firmas={sesionData.firmas} />
```

## 📦 Datos de Ejemplo (Mock Data)

El archivo `mockSesionAprendizaje.ts` contiene un objeto completo de ejemplo:

```typescript
import { mockSesionAprendizaje } from "@/data/mockSesionAprendizaje";

// En tu componente
const sesionData = mockSesionAprendizaje;

<DatosGeneralesSection datos={sesionData.datosGenerales} />
```

## 🚀 Uso Completo

```tsx
import { mockSesionAprendizaje } from "@/data/mockSesionAprendizaje";
import {
  DocumentStyles,
  DocumentHeader,
  DatosGeneralesSection,
  TituloSesionSection,
  PropositoAprendizajeSection,
  PropositoSesionSection,
  EnfoquesTransversalesSection,
  PreparacionSesionSection,
  SecuenciaDidacticaSection,
  ReflexionesSection,
  FirmasSection,
} from "@/components/DocTest";

function DocTest() {
  const sesionData = mockSesionAprendizaje;
  
  return (
    <Document size="A4" orientation="portrait" margin="0.75in">
      <DocumentStyles />
      <DocumentHeader anioAcademico="2025" />
      
      <div style={{padding: '2.5rem 0'}} className="space-y-8">
        <DatosGeneralesSection datos={sesionData.datosGenerales} />
        <TituloSesionSection titulo={sesionData.titulo} />
        <PropositoAprendizajeSection proposito={sesionData.propositoAprendizaje} />
        <PropositoSesionSection proposito={sesionData.propositoSesion} />
        <EnfoquesTransversalesSection enfoques={sesionData.enfoquesTransversales} />
        <PreparacionSesionSection preparacion={sesionData.preparacion} />
        <SecuenciaDidacticaSection secuencia={sesionData.secuenciaDidactica} />
        <ReflexionesSection reflexiones={sesionData.reflexiones} />
        <FirmasSection firmas={sesionData.firmas} />
      </div>
      
      <Footer position="bottom-center">
        {({ currentPage, totalPages }) => (
          <div>Página {currentPage} de {totalPages}</div>
        )}
      </Footer>
    </Document>
  );
}
```

## 🎨 Características de Diseño

### **Paleta de Colores BBVA**
- Azul primario: `#2563eb`
- Azul secundario/cyan: `#0891b2`
- Azul oscuro: `#1e3a8a`, `#1e40af`
- Grises: `#374151`, `#6b7280`, `#9ca3af`

### **Clases CSS Personalizadas**
```css
.gradient-header       → Cabecera con gradiente azul
.gradient-section      → Sección con gradiente claro
.border-accent         → Borde izquierdo azul (4px)
.competencia-box       → Caja cyan con borde
.phase-header          → Cabecera de fase (gradiente)
.phase-body            → Cuerpo de fase (fondo celeste)
.phase-number          → Número circular blanco
.step-box              → Caja blanca con sombra
.highlight-box         → Caja destacada cyan
.grid-2                → Grid de 2 columnas
.space-y-2/4/8         → Espaciado vertical
```

## 📦 Exportaciones

El archivo `index.ts` centraliza todas las exportaciones:

```typescript
export { DocumentStyles } from "./DocumentStyles";
export { DocumentHeader } from "./DocumentHeader";
export { DatosGeneralesSection } from "./DatosGeneralesSection";
export { PropositoAprendizajeSection } from "./PropositoAprendizajeSection";
// ... etc
```

## 🚀 Uso

```tsx
import {
  DocumentStyles,
  DocumentHeader,
  DatosGeneralesSection,
  // ... otros componentes
} from "@/components/DocTest";

// En el componente:
<Document size="A4" orientation="portrait" margin="0.75in">
  <DocumentStyles />
  <DocumentHeader />
  
  <div style={{padding: '2.5rem 0'}} className="space-y-8">
    <DatosGeneralesSection />
    <TituloSesionSection />
    <PropositoAprendizajeSection />
    // ... demás secciones
  </div>
  
  <Footer position="bottom-center">
    {/* Footer con números de página */}
  </Footer>
</Document>
```

## ✅ Beneficios de la Modularización

1. **Mantenibilidad**: Cada sección en su propio archivo (fácil de ubicar y editar)
2. **Reusabilidad**: Componentes pueden reutilizarse en otros documentos
3. **Claridad**: Código más legible (de 1038 líneas a 92 líneas en el componente principal)
4. **Testabilidad**: Componentes pequeños son más fáciles de testear
5. **Escalabilidad**: Fácil agregar nuevas secciones sin afectar el código existente
6. **Separación de responsabilidades**: Estilos, lógica y presentación separados

## 📊 Métricas

- **Antes**: 1 archivo, 1038 líneas
- **Después**: 
  - 1 componente principal: 92 líneas
  - 10 componentes modulares: ~100-400 líneas c/u
  - 1 hook personalizado: 40 líneas
  - 1 archivo de estilos: 320 líneas

**Total de archivos**: 13 (vs 1 original)  
**Reducción en DocTest.tsx**: ~91% (de 1038 a 92 líneas)

## 🔧 Configuración HTMLDocs

- **Tamaño**: A4
- **Orientación**: Portrait
- **Márgenes**: 0.75in
- **Fuente**: Inter (Google Fonts)
- **Sin Tailwind**: Todo con CSS personalizado o inline styles

## 🎯 Próximos Pasos

1. Conectar con datos reales del store de Zustand
2. Crear interfaz TypeScript para los datos de la sesión
3. Hacer componentes más dinámicos (props para datos)
4. Agregar validaciones
5. Implementar tests unitarios
