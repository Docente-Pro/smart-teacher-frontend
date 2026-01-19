# Interfaces por Área - Documentación

## 📁 Estructura de Archivos

```
src/interfaces/areas/
├── index.ts                              # Exportación central
├── IProcesoBase.ts                       # Interfaz base para todos los procesos
├── IProcesoMatematica.ts                 # Procesos específicos de Matemática
├── IProcesoComunicacion.ts               # Procesos específicos de Comunicación
├── IProcesoCiencia.ts                    # Procesos específicos de Ciencia
├── IProcesoPersonalSocial.ts             # Procesos específicos de Personal Social
├── ISecuenciaMatematica.ts               # Secuencia didáctica de Matemática
├── ISecuenciaComunicacion.ts             # Secuencia didáctica de Comunicación
├── ISecuenciaCiencia.ts                  # Secuencia didáctica de Ciencia
├── ISecuenciaPersonalSocial.ts           # Secuencia didáctica de Personal Social
└── ISesionAprendizajePorArea.ts          # Sesiones completas por área
```

## 🎯 Jerarquía de Interfaces

### 1. Nivel Base
```typescript
IProcesoBase {
  proceso: string
  estrategias: string
  recursosDidacticos: string
  tiempo: string
}
```

### 2. Nivel Específico por Área

#### Matemática
```typescript
IProcesoMatematica extends IProcesoBase {
  // Propiedades específicas de Matemática
  problemaMatematico?: string
  descripcionImagenProblema?: string
  imagenProblema?: string
  solucionProblema?: string
  descripcionImagenSolucion?: string
  imagenSolucion?: string
}
```

#### Comunicación
```typescript
IProcesoComunicacion extends IProcesoBase {
  // Futuras propiedades específicas
  // textoLiterario?: string
  // tipoTexto?: string
}
```

#### Ciencia y Tecnología
```typescript
IProcesoCiencia extends IProcesoBase {
  // Futuras propiedades específicas
  // hipotesis?: string
  // materialesExperimento?: string[]
}
```

#### Personal Social
```typescript
IProcesoPersonalSocial extends IProcesoBase {
  // Futuras propiedades específicas
  // actividadReflexiva?: string
  // casoEstudio?: string
}
```

### 3. Nivel de Fases por Área

Cada área tiene sus propias interfaces para:
- `IFaseInicio[Area]`
- `IFaseDesarrollo[Area]`
- `IFaseCierre[Area]`
- `ISecuenciaDidactica[Area]`

### 4. Nivel de Sesión Completa

```typescript
ISesionAprendizajeMatematica {
  datosGenerales: IDatosGenerales
  titulo: string
  propositoAprendizaje: IPropositoAprendizaje
  propositoSesion: IPropositoSesion
  enfoquesTransversales: IEnfoqueTransversal[]
  preparacion: IPreparacionSesion
  secuenciaDidactica: ISecuenciaDidacticaMatematica  // <-- Específico del área
  reflexiones: IReflexionAprendizaje
  firmas: IFirmas
}
```

## 💡 Ejemplos de Uso

### Importación

```typescript
// Importar todo desde el barrel file
import {
  IProcesoMatematica,
  ISecuenciaDidacticaMatematica,
  ISesionAprendizajeMatematica,
  tieneProblemaMatematico,
  esImagenValida
} from '@/interfaces';

// O importar desde el subdirectorio específico
import { IProcesoMatematica } from '@/interfaces/areas';
```

### Uso en Componentes

#### 1. Mostrar Proceso de Matemática

```tsx
import { IProcesoMatematica, tieneProblemaMatematico } from '@/interfaces';

interface Props {
  proceso: IProcesoMatematica;
}

export const ProcesoMatematica: React.FC<Props> = ({ proceso }) => {
  return (
    <div className="proceso">
      <h3>{proceso.proceso}</h3>
      <p><strong>Estrategias:</strong> {proceso.estrategias}</p>
      <p><strong>Recursos:</strong> {proceso.recursosDidacticos}</p>
      <p><strong>Tiempo:</strong> {proceso.tiempo}</p>
      
      {/* Mostrar problema matemático si existe */}
      {tieneProblemaMatematico(proceso) && (
        <div className="problema-matematico">
          <h4>Problema:</h4>
          {proceso.imagenProblema && esImagenValida(proceso.imagenProblema) && (
            <img 
              src={proceso.imagenProblema} 
              alt="Ilustración del problema"
              className="w-full max-w-md rounded-lg shadow-md"
            />
          )}
          <p className="mt-4">{proceso.problemaMatematico}</p>
        </div>
      )}
      
      {/* Mostrar solución si existe */}
      {proceso.solucionProblema && (
        <details className="mt-4">
          <summary className="cursor-pointer font-semibold">
            Ver solución
          </summary>
          {proceso.imagenSolucion && esImagenValida(proceso.imagenSolucion) && (
            <img 
              src={proceso.imagenSolucion} 
              alt="Ilustración de la solución"
              className="w-full max-w-md rounded-lg shadow-md mt-2"
            />
          )}
          <pre className="mt-4 whitespace-pre-wrap bg-gray-50 p-4 rounded">
            {proceso.solucionProblema}
          </pre>
        </details>
      )}
    </div>
  );
};
```

#### 2. Renderizar Fase de Desarrollo

```tsx
import { IFaseDesarrolloMatematica } from '@/interfaces';
import { ProcesoMatematica } from './ProcesoMatematica';

interface Props {
  desarrollo: IFaseDesarrolloMatematica;
}

export const FaseDesarrollo: React.FC<Props> = ({ desarrollo }) => {
  return (
    <div className="fase-desarrollo">
      <h2>Desarrollo ({desarrollo.tiempo})</h2>
      
      {desarrollo.procesos.map((proceso, index) => (
        <ProcesoMatematica key={index} proceso={proceso} />
      ))}
      
      {desarrollo.atencionDiferenciada && (
        <div className="atencion-diferenciada mt-6">
          <h3>Atención Diferenciada</h3>
          <div>
            <h4>Estudiantes que requieren apoyo:</h4>
            <p>{desarrollo.atencionDiferenciada.estudiantesApoyo}</p>
          </div>
          <div>
            <h4>Estudiantes avanzados:</h4>
            <p>{desarrollo.atencionDiferenciada.estudiantesAvanzados}</p>
          </div>
        </div>
      )}
    </div>
  );
};
```

#### 3. Detectar Área y Usar Interfaz Correcta

```tsx
import {
  ISesionAprendizajeMatematica,
  ISesionAprendizajeComunicacion,
  ISesionAprendizajePorArea
} from '@/interfaces';

interface Props {
  sesion: ISesionAprendizajePorArea;
}

export const SesionViewer: React.FC<Props> = ({ sesion }) => {
  const area = sesion.datosGenerales.area.toLowerCase();
  
  // Type narrowing basado en el área
  if (area.includes('matemat')) {
    const sesionMat = sesion as ISesionAprendizajeMatematica;
    return <SesionMatematicaView sesion={sesionMat} />;
  }
  
  if (area.includes('comunicaci')) {
    const sesionCom = sesion as ISesionAprendizajeComunicacion;
    return <SesionComunicacionView sesion={sesionCom} />;
  }
  
  // Fallback genérico
  return <SesionGenericaView sesion={sesion} />;
};
```

### Uso en Hooks

```typescript
import { useQuery } from '@tanstack/react-query';
import { ISesionAprendizajeMatematica } from '@/interfaces';

export const useSesionMatematica = (sesionId: string) => {
  return useQuery<ISesionAprendizajeMatematica>({
    queryKey: ['sesion-matematica', sesionId],
    queryFn: async () => {
      const response = await fetch(`/api/sesiones/${sesionId}`);
      return response.json();
    }
  });
};
```

### Type Guards y Validaciones

```typescript
import {
  IProcesoMatematica,
  tieneProblemaMatematico,
  tieneSolucionMatematica,
  esImagenValida
} from '@/interfaces';

// Validar proceso completo
export const procesoMatematicaCompleto = (proceso: IProcesoMatematica): boolean => {
  if (!tieneProblemaMatematico(proceso)) return false;
  if (!tieneSolucionMatematica(proceso)) return false;
  if (!esImagenValida(proceso.imagenProblema)) return false;
  if (!esImagenValida(proceso.imagenSolucion)) return false;
  return true;
};

// Contar problemas en una sesión
export const contarProblemasMatematicos = (
  sesion: ISesionAprendizajeMatematica
): number => {
  const { inicio, desarrollo, cierre } = sesion.secuenciaDidactica;
  
  let count = 0;
  
  [...inicio.procesos, ...desarrollo.procesos, ...cierre.procesos].forEach(proceso => {
    if (tieneProblemaMatematico(proceso)) count++;
  });
  
  return count;
};
```

## 🔧 Patrones Recomendados

### 1. Componentes Reutilizables por Tipo

```
components/
├── procesos/
│   ├── ProcesoBase.tsx           # Componente base
│   ├── ProcesoMatematica.tsx     # Extensión para matemática
│   ├── ProcesoComunicacion.tsx   # Extensión para comunicación
│   └── ...
└── fases/
    ├── FaseInicio.tsx
    ├── FaseDesarrollo.tsx
    └── FaseCierre.tsx
```

### 2. Factory Pattern para Renderizado

```typescript
import { IProcesoPorArea } from '@/interfaces';

export const ProcesoFactory: React.FC<{ proceso: IProcesoPorArea; area: string }> = ({
  proceso,
  area
}) => {
  switch (area.toLowerCase()) {
    case 'matematica':
    case 'matemática':
      return <ProcesoMatematica proceso={proceso as IProcesoMatematica} />;
    case 'comunicacion':
    case 'comunicación':
      return <ProcesoComunicacion proceso={proceso as IProcesoComunicacion} />;
    case 'ciencia':
    case 'ciencia y tecnologia':
    case 'ciencia y tecnología':
      return <ProcesoCiencia proceso={proceso as IProcesoCiencia} />;
    default:
      return <ProcesoGenerico proceso={proceso} />;
  }
};
```

### 3. Utility para Descargar Imágenes

```typescript
import { IProcesoMatematica } from '@/interfaces';

export const descargarImagenesProblema = async (
  proceso: IProcesoMatematica
): Promise<void> => {
  const imagenes = [
    { url: proceso.imagenProblema, nombre: 'problema' },
    { url: proceso.imagenSolucion, nombre: 'solucion' }
  ];
  
  for (const img of imagenes) {
    if (!img.url || !esImagenValida(img.url)) continue;
    
    try {
      const response = await fetch(img.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${proceso.proceso}-${img.nombre}.png`;
      link.click();
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error descargando imagen ${img.nombre}:`, error);
    }
  }
};
```

## 🔍 Testing

```typescript
import { describe, it, expect } from 'vitest';
import {
  tieneProblemaMatematico,
  tieneSolucionMatematica,
  esImagenValida
} from '@/interfaces';

describe('Type Guards - Matemática', () => {
  it('debe detectar proceso con problema matemático', () => {
    const proceso = {
      proceso: 'Familiarización con el problema',
      estrategias: 'Lectura del problema',
      recursosDidacticos: 'Papelógrafos',
      tiempo: '10 min',
      problemaMatematico: 'Ana compró 3 manzanas...',
      imagenProblema: 'https://example.com/image.png'
    };
    
    expect(tieneProblemaMatematico(proceso)).toBe(true);
  });
  
  it('debe detectar imagen inválida', () => {
    expect(esImagenValida('GENERATE_IMAGE')).toBe(false);
    expect(esImagenValida('https://example.com/image.png')).toBe(true);
    expect(esImagenValida(undefined)).toBe(false);
  });
});
```

## 📝 Notas Importantes

### ⚠️ Consideraciones

1. **Retrocompatibilidad**: Las propiedades específicas son opcionales para mantener compatibilidad
2. **Type Safety**: Usar type guards para verificar existencia de propiedades opcionales
3. **Imágenes Temporales**: Las URLs de DALL-E expiran, considera cachearlas
4. **Validación**: Siempre validar con `esImagenValida()` antes de renderizar

### 🚀 Próximos Pasos

- [ ] Agregar más áreas (Arte, Inglés, Educación Física, etc.)
- [ ] Implementar propiedades específicas para cada área
- [ ] Crear componentes especializados por área
- [ ] Implementar sistema de caché de imágenes
- [ ] Agregar validaciones más robustas

### 📚 Referencias

- [Currículo Nacional MINEDU](http://www.minedu.gob.pe/)
- [TypeScript Handbook - Interfaces](https://www.typescriptlang.org/docs/handbook/2/objects.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
