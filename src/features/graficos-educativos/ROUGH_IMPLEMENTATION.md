# Implementación con Rough.js

## 📚 Descripción General

Todos los componentes de gráficos educativos han sido implementados usando **Rough.js**, una librería que crea gráficos con un estilo dibujado a mano, perfecto para un ambiente educativo y más amigable visualmente.

## 🎨 Características de Rough.js

### ¿Qué es Rough.js?
- Librería ligera (<9kB) para crear gráficos con apariencia dibujada a mano
- Soporta tanto SVG como Canvas
- Altamente configurable: roughness, bowing, fill styles, etc.
- Perfecto para presentaciones, educación y diseños casuales

### Estilos de Relleno Disponibles
- **hachure**: Líneas paralelas (predeterminado para bloques)
- **cross-hatch**: Líneas cruzadas (usado en headers de tablas)
- **solid**: Relleno sólido (usado en fondos)
- **zigzag**: Líneas en zigzag
- **dots**: Puntos
- **dashed**: Líneas punteadas

## 🛠️ Configuración

### Hook personalizado: `useRoughSVG`

```typescript
export const useRoughSVG = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const roughSvg = svgRef.current ? rough.svg(svgRef.current) : null;
  
  return { svgRef, roughSvg };
};
```

### Configuración por defecto

```typescript
export const defaultRoughConfig = {
  roughness: 1.2,        // Nivel de irregularidad (0-5)
  bowing: 1,             // Curvatura de las líneas
  strokeWidth: 2,        // Grosor del trazo
  fillStyle: 'hachure',  // Estilo de relleno
  fillWeight: 0.5,       // Peso del relleno
  hachureGap: 4          // Separación entre líneas de relleno
};
```

### Paleta de colores

```typescript
export const roughColors = {
  azul: '#4A90E2',
  rojo: '#E24A4A',
  verde: '#4CAF50',
  amarillo: '#FFC107',
  morado: '#9C27B0',
  naranja: '#FF9800',
};
```

## 📊 Componentes Implementados

### 1. EcuacionCajas
**Usa Rough.js para:**
- ✅ Cajas rectangulares con `rc.rectangle()`
- ✅ Brackets de agrupación con `rc.path()`
- ✅ Operadores y valores con elementos SVG `<text>`

**Características:**
- Relleno cross-hatch para resaltar cajas
- Roughness de 1.0 para apariencia suave pero dibujada
- Colores diferenciados por tipo de operador

### 2. TablaPrecios
**Usa Rough.js para:**
- ✅ Borde exterior de la tabla con `rc.rectangle()`
- ✅ Header con fondo cross-hatch
- ✅ Líneas divisorias con `rc.line()`
- ✅ Fila de total con línea destacada

**Características:**
- Roughness de 0.8 para bordes más suaves
- Header con fill cross-hatch en color azul
- Líneas divisorias sutiles con roughness 0.5
- Total destacado con color verde

### 3. BarrasComparacion
**Usa Rough.js para:**
- ✅ Ejes X e Y con `rc.line()`
- ✅ Barras con `rc.rectangle()` y relleno hachure
- ✅ Líneas de guía horizontales
- ✅ Valores y etiquetas con SVG text

**Características:**
- Cada barra tiene un ángulo de hachure diferente (45° + idx * 15°)
- Roughness de 1.0 para apariencia dibujada
- Colores personalizables por barra
- Grid lines con roughness reducido (0.3) para no distraer

### 4. TablaValores
**Usa Rough.js para:**
- ✅ Borde exterior opcional con `rc.rectangle()`
- ✅ Header con fondo cross-hatch
- ✅ Líneas horizontales y verticales con `rc.line()`
- ✅ Celdas con texto SVG

**Características:**
- Modo con/sin bordes configurable
- Roughness variable según elemento (0.8 bordes, 0.4 divisiones)
- Header destacado con cross-hatch azul
- Grid adaptable al número de columnas

### 5. BloqueAgrupados
**Usa Rough.js para:**
- ✅ Bloques cuadrados con `rc.rectangle()`
- ✅ Relleno hachure con ángulos variables
- ✅ Etiquetas y cantidades con SVG text
- ✅ Disposición horizontal o vertical

**Características:**
- Cada grupo tiene un ángulo de hachure único (45° + idx * 30°)
- Roughness de 1.2 para máxima expresividad
- Layout automático en grid (sqrt de cantidad)
- Disposición configurable (horizontal/vertical)

## 🎯 Patrón de Uso

Todos los componentes siguen este patrón:

```typescript
export const MiComponente: React.FC<Props> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = ''; // Limpiar contenido previo

    // 1. Dibujar formas con Rough.js
    const shape = rc.rectangle(x, y, width, height, {
      ...defaultRoughConfig,
      fill: roughColors.azul,
      fillStyle: 'hachure'
    });
    svgRef.current.appendChild(shape);

    // 2. Agregar texto con SVG nativo
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x.toString());
    text.setAttribute('y', y.toString());
    text.textContent = 'Mi texto';
    svgRef.current.appendChild(text);

    // 3. Definir dimensiones del SVG
    svgRef.current.setAttribute('width', width.toString());
    svgRef.current.setAttribute('height', height.toString());

  }, [data]); // Re-dibujar cuando cambien los datos

  return <svg ref={svgRef} className="mi-svg" />;
};
```

## 📐 Métodos de Rough.js Utilizados

### Formas básicas
```typescript
// Rectángulo
rc.rectangle(x, y, width, height, options)

// Línea
rc.line(x1, y1, x2, y2, options)

// Círculo
rc.circle(x, y, diameter, options)

// Path personalizado (para brackets, curvas, etc.)
rc.path(svgPath, options)
```

### Opciones comunes
```typescript
{
  roughness: number,      // 0-5, mayor = más irregular
  bowing: number,         // Curvatura de líneas
  stroke: string,         // Color del trazo
  strokeWidth: number,    // Grosor del trazo
  fill: string,           // Color de relleno
  fillStyle: 'hachure' | 'solid' | 'cross-hatch' | 'zigzag' | 'dots' | 'dashed',
  fillWeight: number,     // Grosor de las líneas de relleno
  hachureAngle: number,   // Ángulo de las líneas de relleno (en grados)
  hachureGap: number      // Separación entre líneas de relleno
}
```

## 🎨 Mejores Prácticas

### 1. Roughness según contexto
- **0.3-0.5**: Grid lines, elementos de fondo
- **0.8-1.0**: Bordes principales, formas importantes
- **1.2-1.5**: Elementos destacados, bloques visuales

### 2. Fill styles por uso
- **solid**: Fondos, áreas grandes uniformes
- **hachure**: Bloques, barras, elementos individuales
- **cross-hatch**: Headers, secciones destacadas
- **dots/dashed**: Elementos secundarios, decorativos

### 3. Ángulos de hachure
- Variar el ángulo entre elementos similares (+15° o +30°)
- Mantiene el estilo consistente pero diferenciable
- Ejemplo: `hachureAngle: 45 + idx * 15`

### 4. Performance
- Limpiar el SVG antes de redibujar: `svgRef.current.innerHTML = ''`
- Usar dependencias específicas en useEffect
- Configurar width/height al final del renderizado

### 5. Accesibilidad
- Mantener contraste de colores adecuado
- Usar className para estilos CSS adicionales
- Agregar títulos/descripciones cuando sea necesario

## 📦 Instalación

```bash
pnpm add roughjs
```

## 🔗 Recursos

- [Documentación oficial de Rough.js](https://roughjs.com/)
- [GitHub de Rough.js](https://github.com/rough-stuff/rough)
- [Ejemplos interactivos](https://roughjs.com/examples/)

## ✨ Ventajas de esta Implementación

1. **Estilo amigable**: Apariencia dibujada a mano perfecta para educación
2. **Ligero**: <9kB, no afecta el performance
3. **Personalizable**: Múltiples opciones de configuración
4. **Consistente**: Mismo estilo en todos los gráficos
5. **Mantenible**: Código limpio y bien documentado
6. **Escalable**: Fácil agregar nuevos tipos de gráficos

## 🚀 Próximos Pasos

- [ ] Agregar animaciones con roughjs-animated
- [ ] Implementar exportación a PNG/PDF
- [ ] Agregar temas (oscuro/claro)
- [ ] Crear más variaciones de gráficos
- [ ] Optimizar rendering para gráficos grandes
