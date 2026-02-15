# 🎨 Playground de Gráficos Educativos

## Descripción

El Playground de Gráficos Educativos es una herramienta interactiva que te permite experimentar con diferentes configuraciones JSON para visualizar gráficos educativos en tiempo real.

## Acceso

Navega a `/graficos-playground` para acceder al playground.

## Características

### 📝 Editor JSON Interactivo
- Escribe o pega configuraciones JSON
- Validación en tiempo real
- Formateo automático del JSON
- Copiar al portapapeles
- Limpiar editor

### 👁️ Vista Previa en Vivo
- Visualización instantánea de los gráficos
- Actualización automática al cambiar el JSON
- Mensajes de error claros

### 📚 Ejemplos Predefinidos
El playground incluye ejemplos listos para usar de todos los tipos de gráficos:

- **ecuacion_cajas**: Ecuaciones matemáticas con cajas
- **barras_comparacion**: Gráficos de barras comparativas
- **circulos_fraccion**: Fracciones representadas en círculos
- **recta_numerica**: Líneas numéricas con marcadores
- **bloques_agrupados**: Bloques agrupados por categorías
- **diagrama_dinero**: Representación de billetes y monedas
- **operacion_vertical**: Operaciones aritméticas verticales
- **tabla_precios**: Tablas de precios con totales
- **figuras_geometricas**: Formas geométricas
- **balanza_equilibrio**: Balanzas de equilibrio matemático

## Uso Básico

1. **Selecciona un ejemplo predefinido** haciendo clic en uno de los botones en la sección "Ejemplos Predefinidos"
2. **Edita el JSON** en el panel izquierdo
3. **Observa los cambios** en tiempo real en el panel derecho
4. **Experimenta** modificando valores, agregando elementos o cambiando propiedades

## Estructura JSON Base

Todos los gráficos comparten una estructura base:

```json
{
  "tipoGrafico": "tipo_del_grafico",
  "titulo": "Título del gráfico (opcional)",
  "descripcion": "Descripción del gráfico (opcional)",
  "elementos": [],
  "opciones": {}
}
```

## Ejemplos de Uso

### Ecuación con Cajas
```json
{
  "tipoGrafico": "ecuacion_cajas",
  "titulo": "Suma simple",
  "elementos": [
    { "tipo": "caja", "contenido": "5", "color": "azul" },
    { "tipo": "operador", "contenido": "+" },
    { "tipo": "caja", "contenido": "3", "color": "rojo" },
    { "tipo": "operador", "contenido": "=" },
    { "tipo": "caja", "contenido": "?", "color": "verde", "destacado": true }
  ]
}
```

### Barras de Comparación
```json
{
  "tipoGrafico": "barras_comparacion",
  "titulo": "Comparación de frutas",
  "elementos": [
    { "tipo": "barra", "etiqueta": "Manzanas", "valor": 8, "color": "rojo" },
    { "tipo": "barra", "etiqueta": "Plátanos", "valor": 5, "color": "amarillo" }
  ],
  "ejeY": { "titulo": "Cantidad", "maximo": 15, "intervalo": 3 }
}
```

### Fracciones con Círculos
```json
{
  "tipoGrafico": "circulos_fraccion",
  "titulo": "Fracciones",
  "elementos": [
    { "numerador": 1, "denominador": 2, "color": "azul", "etiqueta": "1/2" },
    { "numerador": 3, "denominador": 4, "color": "verde", "etiqueta": "3/4" }
  ],
  "mostrarEtiquetas": true
}
```

## Colores Disponibles

- `azul`
- `rojo`
- `amarillo`
- `verde`
- `naranja`
- `morado`
- `neutro`

## Tipos de Gráficos Soportados

1. `ecuacion_cajas` - Ecuaciones con cajas
2. `tabla_precios` - Tablas de precios
3. `barras_comparacion` - Gráficos de barras
4. `tabla_valores` - Tablas de valores
5. `bloques_agrupados` - Bloques agrupados
6. `recta_numerica` - Recta numérica
7. `circulos_fraccion` - Fracciones con círculos
8. `barras_fraccion` - Fracciones con barras
9. `diagrama_dinero` - Diagramas de dinero
10. `figuras_geometricas` - Figuras geométricas
11. `patron_visual` - Patrones visuales
12. `diagrama_venn` - Diagramas de Venn
13. `tabla_doble_entrada` - Tablas de doble entrada
14. `operacion_vertical` - Operaciones verticales
15. `medidas_comparacion` - Comparación de medidas
16. `balanza_equilibrio` - Balanza de equilibrio

## Tips y Trucos

1. **Formateo**: Usa el botón "Formatear" para organizar tu JSON automáticamente
2. **Copiar**: Usa el botón "Copiar" para copiar la configuración al portapapeles
3. **Limpiar**: Usa el botón "Limpiar" para empezar con una plantilla vacía
4. **Errores**: Los errores de JSON se muestran en rojo debajo del editor

## Integración en tu Aplicación

Una vez que hayas creado tu configuración perfecta en el playground, puedes usarla directamente en tu aplicación:

```tsx
import { GraficoRenderer } from "@/features/graficos-educativos/presentation/components/GraficoRenderer";

const miConfiguracion = {
  // Tu configuración JSON aquí
};

function MiComponente() {
  return <GraficoRenderer grafico={miConfiguracion} />;
}
```

## Solución de Problemas

### El gráfico no se muestra
- Verifica que el JSON sea válido
- Asegúrate de que `tipoGrafico` tenga un valor correcto
- Revisa que todos los campos requeridos estén presentes

### Errores de validación
- Lee los mensajes de error que aparecen debajo del editor
- Compara tu JSON con los ejemplos predefinidos
- Verifica la estructura de los elementos según el tipo de gráfico

## Soporte

Para más información sobre la estructura específica de cada tipo de gráfico, consulta la documentación en:
- `src/features/graficos-educativos/domain/types/graficos.types.ts`
