# 🚀 Inicio Rápido - Interfaces por Área

## ⏱️ 5 Minutos para Empezar

### Paso 1: Importar Interfaces (30 segundos)

```typescript
// En tu componente o archivo TypeScript
import {
  ISesionAprendizajeMatematica,
  IProcesoMatematica,
  tieneProblemaMatematico,
  esImagenValida
} from '@/interfaces';
```

### Paso 2: Tipar tus Datos (1 minuto)

```typescript
// Antes
const sesion: any = await fetchSesion();

// Ahora
const sesion: ISesionAprendizajeMatematica = await fetchSesion();
```

### Paso 3: Validar Problemas Matemáticos (1 minuto)

```typescript
// Iterar sobre procesos
sesion.secuenciaDidactica.desarrollo.procesos.forEach(proceso => {
  if (tieneProblemaMatematico(proceso)) {
    console.log('Tiene problema:', proceso.problemaMatematico);
    
    // Verificar imagen
    if (esImagenValida(proceso.imagenProblema)) {
      console.log('Imagen válida:', proceso.imagenProblema);
    }
  }
});
```

### Paso 4: Renderizar (2 minutos)

```tsx
import { ProcesoMatematicaCard } from '@/components/areas/ejemplos-matematica';

function MiComponente({ proceso }: { proceso: IProcesoMatematica }) {
  return (
    <div>
      <ProcesoMatematicaCard 
        proceso={proceso} 
        mostrarSolucion={false}
      />
    </div>
  );
}
```

---

## 📊 Ejemplo Completo Mínimo

```tsx
import React from 'react';
import {
  ISesionAprendizajeMatematica,
  tieneProblemaMatematico,
  esImagenValida
} from '@/interfaces';

interface Props {
  sesion: ISesionAprendizajeMatematica;
}

export const SesionSimple: React.FC<Props> = ({ sesion }) => {
  const desarrollo = sesion.secuenciaDidactica.desarrollo;

  return (
    <div>
      <h1>{sesion.titulo}</h1>
      
      {desarrollo.procesos.map((proceso, idx) => (
        <div key={idx}>
          <h3>{proceso.proceso}</h3>
          <p>{proceso.estrategias}</p>
          
          {/* Mostrar problema si existe */}
          {tieneProblemaMatematico(proceso) && (
            <div>
              {esImagenValida(proceso.imagenProblema) && (
                <img src={proceso.imagenProblema} alt="Problema" />
              )}
              <p>{proceso.problemaMatematico}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
```

---

## 🛠️ Utilidades Más Usadas

### Detectar Área
```typescript
import { obtenerTipoArea } from '@/utils/sesionesHelpers';

const tipo = obtenerTipoArea(sesion.datosGenerales.area);
// Retorna: 'matematica' | 'comunicacion' | 'ciencia' | 'personal-social' | 'otra'
```

### Contar Problemas
```typescript
import { contarProblemasMatematicos } from '@/utils/sesionesHelpers';

const total = contarProblemasMatematicos(sesion);
console.log(`Total de problemas: ${total}`);
```

### Estadísticas de Imágenes
```typescript
import { obtenerEstadisticasImagenes } from '@/utils/sesionesHelpers';

const stats = obtenerEstadisticasImagenes(sesion);
console.log(`Progreso: ${stats.porcentajeCompletado}%`);
```

### Descargar Imágenes
```typescript
import { descargarImagenesDeLaSesion } from '@/utils/sesionesHelpers';

await descargarImagenesDeLaSesion(sesion);
```

---

## ✅ Checklist de Integración

- [ ] Importar interfaces necesarias
- [ ] Actualizar tipos de variables/props
- [ ] Agregar validaciones con type guards
- [ ] Renderizar imágenes cuando existan
- [ ] Probar con datos del backend

---

## 📚 Documentación Completa

Para más detalles, consulta:
- 📄 `INTERFACES_POR_AREA.md` - Guía completa
- 📄 `src/interfaces/areas/README.md` - Documentación técnica
- 📄 `src/examples/SesionViewer-ejemplo-completo.tsx` - Ejemplo completo

---

## 🎯 Casos de Uso Comunes

### Caso 1: Mostrar Solo Problemas
```typescript
import { obtenerProcesosConProblemas } from '@/utils/sesionesHelpers';

const problemasProc = obtenerProcesosConProblemas(sesion);
// Retorna solo procesos que tienen problemas matemáticos
```

### Caso 2: Validar Sesión Completa
```typescript
import { sesionMatematicaCompleta } from '@/utils/sesionesHelpers';

if (sesionMatematicaCompleta(sesion)) {
  console.log('✅ Todas las imágenes están generadas');
} else {
  console.log('⏳ Faltan imágenes por generar');
}
```

### Caso 3: Type Narrowing por Área
```typescript
import { esSesionMatematica } from '@/utils/sesionesHelpers';

if (esSesionMatematica(sesion)) {
  // TypeScript sabe que sesion es ISesionAprendizajeMatematica
  const stats = obtenerEstadisticasImagenes(sesion);
}
```

---

¡Listo! Ya puedes empezar a usar las interfaces por área en tu proyecto. 🎉
