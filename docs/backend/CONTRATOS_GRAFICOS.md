# Contratos de Datos — Campo `grafico` en Procesos de Sesión

> **Documento para el equipo de Backend**
> Última actualización: 27/02/2026

## Contexto

Cuando la IA genera una sesión de aprendizaje, cada proceso de la secuencia didáctica puede incluir un campo **`grafico`** con datos estructurados que el frontend renderiza visualmente.

El frontend soporta **59 tipos de gráficos** organizados en:

- **43 tipos de Matemática** (operaciones, geometría, estadística, etc.)
- **16 tipos de Áreas curriculares** (Comunicación, Ciencia y Tecnología, Personal Social, Educación Religiosa, Arte y Cultura, Educación Física)

---

## Ubicación del campo `grafico`

```jsonc
// En cada proceso de la secuencia didáctica:
{
  "nombre": "Desarrollo",
  "descripcion": "...",
  "duracion": "30 min",
  "grafico": {   // <── ESTE CAMPO
    "tipoGrafico": "tabla_valores",
    "titulo": "...",
    // ... propiedades específicas del tipo
  }
}
```

### Reglas generales

| Regla | Detalle |
|-------|---------|
| `tipoGrafico` | **OBLIGATORIO**. String que identifica el tipo. Debe ser exactamente uno de los valores listados abajo. |
| `titulo` | **OBLIGATORIO** para áreas curriculares. Opcional para matemática. |
| Casing | Todos los valores de `tipoGrafico` usan **snake_case**. |
| `grafico` puede ser `null` | Si el proceso no necesita gráfico, enviar `null` o no incluir el campo. |

---

## Colores válidos (Matemática)

Cuando un campo pida `color` en los tipos matemáticos, usar uno de:

```
"azul" | "rojo" | "amarillo" | "verde" | "naranja" | "morado" | "neutro"
```

---

# PARTE 1 — MATEMÁTICA (43 tipos)

---

## 1. `ecuacion_cajas`

Muestra una ecuación con cajas visuales (operandos y operadores).

```json
{
  "tipoGrafico": "ecuacion_cajas",
  "titulo": "Resolvemos la suma",
  "elementos": [
    { "tipo": "caja", "contenido": "24", "color": "azul", "destacado": false },
    { "tipo": "operador", "contenido": "+" },
    { "tipo": "caja", "contenido": "13", "color": "verde", "destacado": false },
    { "tipo": "operador", "contenido": "=" },
    { "tipo": "caja", "contenido": "?", "color": "amarillo", "destacado": true }
  ],
  "agrupaciones": [
    {
      "desde": 0,
      "hasta": 2,
      "colorLlave": "azul",
      "textoAbajo": "Sumandos"
    }
  ],
  "filas": []
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `elementos` | `Array<{tipo, contenido, color?, destacado?}>` | ✅ | tipo: `"caja"` \| `"operador"` |
| `agrupaciones` | `Array<{desde, hasta, colorLlave, textoAbajo?, filaDestino?}>` | ❌ | Llaves que agrupan cajas |
| `filas` | `Array<{elementos, agrupaciones?}>` | ❌ | Filas adicionales para resolución paso a paso |

---

## 2. `tabla_precios`

Tabla de productos con precio unitario, cantidad y total.

```json
{
  "tipoGrafico": "tabla_precios",
  "titulo": "Compras en la tienda",
  "elementos": [
    { "tipo": "fila", "producto": "Cuaderno", "precioUnitario": 3.50, "cantidad": 2, "total": 7.00, "icono": "📓" },
    { "tipo": "fila", "producto": "Lápiz", "precioUnitario": 1.00, "cantidad": 5, "total": 5.00, "icono": "✏️" }
  ],
  "moneda": "S/",
  "mostrarTotal": true
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `elementos` | `Array<{tipo: "fila", producto, precioUnitario, cantidad, total?, icono?}>` | ✅ | |
| `moneda` | `"S/"` \| `"$"` \| `"€"` | ✅ | |
| `mostrarTotal` | `boolean` | ❌ | |

---

## 3. `barras_comparacion`

Gráfico de barras verticales para comparar cantidades.

```json
{
  "tipoGrafico": "barras_comparacion",
  "titulo": "Frutas favoritas del aula",
  "elementos": [
    { "tipo": "barra", "etiqueta": "Manzana", "valor": 8, "color": "rojo", "icono": "🍎" },
    { "tipo": "barra", "etiqueta": "Plátano", "valor": 12, "color": "amarillo", "icono": "🍌" },
    { "tipo": "barra", "etiqueta": "Uva", "valor": 5, "color": "morado", "icono": "🍇" }
  ],
  "ejeY": {
    "titulo": "Cantidad de estudiantes",
    "maximo": 15,
    "intervalo": 3
  }
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `elementos` | `Array<{tipo: "barra", etiqueta, valor, color, icono?}>` | ✅ | |
| `ejeY` | `{titulo, maximo, intervalo}` | ❌ | |

---

## 4. `tabla_valores`

Tabla genérica con encabezados y filas de datos.

```json
{
  "tipoGrafico": "tabla_valores",
  "titulo": "Planificación de Encuesta sobre Participación Escolar",
  "encabezados": ["Tema de Interés", "Pregunta Principal", "Posibles Respuestas"],
  "elementos": [
    { "celdas": ["Deportes", "¿Cuál es tu deporte favorito?", "Fútbol, Vóley, Básquet"] },
    { "celdas": ["Lectura", "¿Cuántos libros lees al mes?", "0, 1-2, 3 o más"] }
  ],
  "mostrarBordes": true
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `encabezados` | `string[]` | ✅ | Nombres de las columnas |
| `elementos` | `Array<{celdas: (string \| number)[]}>` | ✅ | Cada fila es un array de celdas |
| `mostrarBordes` | `boolean` | ❌ | Default: true |

> ⚠️ **IMPORTANTE**: Cada fila debe tener la **misma cantidad** de celdas que los encabezados.

---

## 5. `bloques_agrupados`

Bloques visuales para representar agrupaciones y conteo.

```json
{
  "tipoGrafico": "bloques_agrupados",
  "titulo": "Agrupamos de 10 en 10",
  "elementos": [
    { "tipo": "bloque", "cantidad": 10, "color": "azul", "etiqueta": "Decena", "icono": "🔵" },
    { "tipo": "bloque", "cantidad": 10, "color": "azul", "etiqueta": "Decena" },
    { "tipo": "bloque", "cantidad": 5, "color": "verde", "etiqueta": "Unidades" }
  ],
  "disposicion": "horizontal",
  "tamanoBloque": 20
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `elementos` | `Array<{tipo: "bloque", cantidad, color, etiqueta?, icono?}>` | ✅ | |
| `disposicion` | `"horizontal"` \| `"vertical"` | ❌ | |
| `tamanoBloque` | `number` | ❌ | |

---

## 6. `recta_numerica`

Recta numérica con marcas y saltos/arcos entre puntos.

```json
{
  "tipoGrafico": "recta_numerica",
  "titulo": "Ubicamos números en la recta",
  "inicio": 0,
  "fin": 20,
  "intervalo": 2,
  "marcas": [
    { "posicion": 5, "etiqueta": "5", "destacado": true, "color": "rojo" },
    { "posicion": 15, "etiqueta": "15", "destacado": true, "color": "azul" }
  ],
  "saltos": [
    { "desde": 5, "hasta": 15, "color": "verde", "etiqueta": "+10" }
  ],
  "mostrarFlechas": true
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `inicio` | `number` | ✅ | |
| `fin` | `number` | ✅ | |
| `intervalo` | `number` | ❌ | Espaciado entre marcas |
| `marcas` | `Array<{posicion, etiqueta?, destacado?, color?}>` | ❌ | |
| `saltos` | `Array<{desde, hasta, color?, etiqueta?}>` | ❌ | Arcos entre puntos |
| `mostrarFlechas` | `boolean` | ❌ | |

---

## 7. `circulos_fraccion`

Círculos divididos en partes para representar fracciones.

```json
{
  "tipoGrafico": "circulos_fraccion",
  "titulo": "Representamos fracciones",
  "elementos": [
    { "numerador": 3, "denominador": 4, "color": "azul", "etiqueta": "3/4" },
    { "numerador": 1, "denominador": 2, "color": "rojo", "etiqueta": "1/2" }
  ],
  "mostrarEtiquetas": true
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `elementos` | `Array<{numerador, denominador, color, etiqueta?}>` | ✅ | |
| `mostrarEtiquetas` | `boolean` | ❌ | |

---

## 8. `barras_fraccion`

Barras horizontales/verticales divididas para fracciones.

```json
{
  "tipoGrafico": "barras_fraccion",
  "titulo": "Comparamos fracciones con barras",
  "elementos": [
    { "numerador": 2, "denominador": 5, "color": "verde", "etiqueta": "2/5" },
    { "numerador": 3, "denominador": 5, "color": "naranja", "etiqueta": "3/5" }
  ],
  "orientacion": "horizontal"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `elementos` | `Array<{numerador, denominador, color, etiqueta?}>` | ✅ | |
| `orientacion` | `"horizontal"` \| `"vertical"` | ❌ | |

---

## 9. `diagrama_dinero`

Representación visual de monedas y billetes.

```json
{
  "tipoGrafico": "diagrama_dinero",
  "titulo": "¿Cuánto dinero tenemos?",
  "elementos": [
    { "tipo": "billete", "valor": 10, "cantidad": 2 },
    { "tipo": "moneda", "valor": 5, "cantidad": 1 },
    { "tipo": "moneda", "valor": 1, "cantidad": 3 }
  ],
  "moneda": "S/",
  "mostrarTotal": true
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `elementos` | `Array<{tipo: "billete" \| "moneda", valor, cantidad}>` | ✅ | |
| `moneda` | `"S/"` \| `"$"` \| `"€"` | ✅ | |
| `mostrarTotal` | `boolean` | ❌ | |

---

## 10. `figuras_geometricas`

Muestra figuras geométricas 2D.

```json
{
  "tipoGrafico": "figuras_geometricas",
  "titulo": "Identificamos figuras",
  "elementos": [
    { "tipo": "cuadrado", "ancho": 50, "alto": 50, "color": "azul", "etiqueta": "Cuadrado" },
    { "tipo": "circulo", "radio": 30, "color": "rojo", "etiqueta": "Círculo" },
    { "tipo": "triangulo", "ancho": 60, "alto": 50, "color": "verde", "etiqueta": "Triángulo" }
  ]
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `elementos` | `Array<{tipo, ancho?, alto?, radio?, color, etiqueta?}>` | ✅ | tipo: `"cuadrado"` \| `"rectangulo"` \| `"circulo"` \| `"triangulo"` \| `"trapecio"` \| `"rombo"` |

---

## 11. `medidas_comparacion`

Compara diferentes medidas (longitud, peso, capacidad, tiempo).

```json
{
  "tipoGrafico": "medidas_comparacion",
  "titulo": "Comparamos pesos",
  "elementos": [
    { "tipo": "peso", "valor": 500, "unidad": "g", "etiqueta": "Arroz", "color": "amarillo" },
    { "tipo": "peso", "valor": 1000, "unidad": "g", "etiqueta": "Azúcar", "color": "azul" }
  ]
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `elementos` | `Array<{tipo, valor, unidad, etiqueta?, color}>` | ✅ | tipo: `"longitud"` \| `"peso"` \| `"capacidad"` \| `"tiempo"` |

---

## 12. `patron_visual`

Secuencia de elementos que forman un patrón (formas, números, colores).

```json
{
  "tipoGrafico": "patron_visual",
  "titulo": "¿Qué sigue en el patrón?",
  "elementos": [
    { "tipo": "forma", "valor": "circulo", "color": "#FF0000" },
    { "tipo": "forma", "valor": "cuadrado", "color": "#0000FF" },
    { "tipo": "forma", "valor": "circulo", "color": "#FF0000" },
    { "tipo": "forma", "valor": "cuadrado", "color": "#0000FF" },
    { "tipo": "forma", "valor": "?", "color": "#999999" }
  ],
  "repeticiones": 2
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `elementos` | `Array<{tipo: "forma" \| "numero" \| "color", valor, color?}>` | ✅ | |
| `repeticiones` | `number` | ❌ | |

---

## 13. `patron_geometrico`

Secuencia de formas geométricas como patrón.

```json
{
  "tipoGrafico": "patron_geometrico",
  "titulo": "Completa la secuencia",
  "secuencia": [
    { "forma": "triangulo", "color": "#FF6B6B", "etiqueta": "A", "destacado": false },
    { "forma": "cuadrado", "color": "#4ECDC4", "etiqueta": "B", "destacado": false },
    { "forma": "circulo", "color": "#45B7D1", "etiqueta": "C", "destacado": false },
    { "forma": "triangulo", "color": "#FF6B6B", "etiqueta": "A", "destacado": false },
    { "forma": "interrogacion", "color": "#999", "etiqueta": "?", "destacado": true }
  ],
  "orientacion": "horizontal",
  "mostrarIndices": true,
  "nucleoPatron": 3,
  "repeticiones": 2
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `secuencia` | `Array<{forma, color, etiqueta?, destacado?}>` | ✅ | forma: `"circulo"` \| `"cuadrado"` \| `"triangulo"` \| `"rectangulo"` \| `"rombo"` \| `"hexagono"` \| `"estrella"` \| `"interrogacion"` |
| `orientacion` | `"horizontal"` \| `"vertical"` | ❌ | |
| `mostrarIndices` | `boolean` | ❌ | |
| `nucleoPatron` | `number` | ❌ | Cantidad de elementos que forman el núcleo del patrón |
| `repeticiones` | `number` | ❌ | |

---

## 14. `diagrama_venn`

Diagrama de Venn con conjuntos e intersección.

```json
{
  "tipoGrafico": "diagrama_venn",
  "titulo": "Conjuntos: Frutas y Verduras",
  "elementos": [
    { "nombre": "Frutas", "elementos": ["Manzana", "Pera", "Tomate"], "color": "#FF6B6B" },
    { "nombre": "Verduras", "elementos": ["Lechuga", "Zanahoria", "Tomate"], "color": "#4ECDC4" }
  ],
  "interseccion": ["Tomate"]
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `elementos` | `Array<{nombre, elementos: string[], color}>` | ✅ | |
| `interseccion` | `string[]` | ❌ | Elementos compartidos |

---

## 15. `tabla_doble_entrada`

Tabla con encabezados en filas y columnas.

```json
{
  "tipoGrafico": "tabla_doble_entrada",
  "titulo": "Registro de asistencia",
  "encabezadosColumnas": ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
  "encabezadosFilas": ["María", "Pedro", "Ana"],
  "datos": [
    ["✓", "✓", "✗", "✓", "✓"],
    ["✓", "✗", "✓", "✓", "✗"],
    ["✓", "✓", "✓", "✓", "✓"]
  ],
  "colorEncabezado": "#3B82F6"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `encabezadosColumnas` | `string[]` | ✅ | |
| `encabezadosFilas` | `string[]` | ✅ | |
| `datos` | `(string \| number)[][]` | ✅ | Matriz: `datos[fila][columna]` |
| `colorEncabezado` | `string` | ❌ | Color hex del encabezado |

---

## 16. `operacion_vertical`

Operación aritmética en formato vertical (como se escribe en el cuaderno).

```json
{
  "tipoGrafico": "operacion_vertical",
  "titulo": "Resolvemos la multiplicación",
  "operacion": "multiplicacion",
  "operandos": [24, 3],
  "mostrarResultado": true,
  "resultado": 72,
  "destacarLlevadas": true,
  "llevadasPrestas": [
    { "posicion": 1, "valor": 1 }
  ]
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `operacion` | `"suma"` \| `"resta"` \| `"multiplicacion"` \| `"division"` | ✅ | |
| `operandos` | `number[]` | ✅ | |
| `mostrarResultado` | `boolean` | ❌ | |
| `resultado` | `number` | ❌ | |
| `destacarLlevadas` | `boolean` | ❌ | |
| `llevadasPrestas` | `Array<{posicion, valor}>` | ❌ | |

---

## 17. `balanza_equilibrio`

Balanza para comparar cantidades/expresiones.

```json
{
  "tipoGrafico": "balanza_equilibrio",
  "titulo": "¿Están en equilibrio?",
  "ladoIzquierdo": { "tipo": "lado", "cantidad": 15, "color": "azul", "etiqueta": "3 × 5", "representacion": "🔵🔵🔵🔵🔵" },
  "ladoDerecho": { "tipo": "lado", "cantidad": 15, "color": "rojo", "etiqueta": "10 + 5", "representacion": "🔴🔴🔴🔴🔴" },
  "estado": "equilibrio",
  "mostrarEcuacion": true,
  "pregunta": "¿Cuánto vale cada lado?"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `ladoIzquierdo` | `{tipo: "lado", cantidad, color, etiqueta?, representacion?}` | ✅ | |
| `ladoDerecho` | `{tipo: "lado", cantidad, color, etiqueta?, representacion?}` | ✅ | |
| `estado` | `"equilibrio"` \| `"inclinada_izquierda"` \| `"inclinada_derecha"` | ✅ | |
| `mostrarEcuacion` | `boolean` | ❌ | |
| `pregunta` | `string` | ❌ | |

---

## 18. `numeros_ordinales`

Elementos en fila para trabajar números ordinales (1°, 2°, 3°...).

```json
{
  "tipoGrafico": "numeros_ordinales",
  "titulo": "¿Quién llegó primero?",
  "elementos": [
    { "numero": 1, "color": "rojo", "destacado": true, "tamano": "grande", "etiqueta": "Ana" },
    { "numero": 2, "color": "azul", "destacado": false, "tamano": "mediano", "etiqueta": "Luis" },
    { "numero": 3, "color": "verde", "destacado": false, "tamano": "mediano", "etiqueta": "Carlos" }
  ],
  "orientacion": "horizontal",
  "mostrarTexto": true
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `elementos` | `Array<{numero, color?, destacado?, tamano?, etiqueta?}>` | ✅ | tamano: `"pequeno"` \| `"mediano"` \| `"grande"` |
| `orientacion` | `"horizontal"` \| `"vertical"` | ❌ | |
| `mostrarTexto` | `boolean` | ❌ | Muestra "primero", "segundo", etc. |

---

## 19. `coordenadas_ejercicios`

Planos cartesianos con figuras y ejercicios de ubicación/traslación.

```json
{
  "tipoGrafico": "coordenadas_ejercicios",
  "titulo": "Trabajamos en el plano cartesiano",
  "planos": [
    {
      "id": 1,
      "tamano": { "ancho": 10, "alto": 10 },
      "origen": { "x": 0, "y": 0 },
      "figuras": [
        {
          "tipo": "triangulo",
          "vertices": [{ "x": 2, "y": 3 }, { "x": 5, "y": 3 }, { "x": 3, "y": 6 }],
          "color": "#FF6B6B",
          "etiqueta": "ABC"
        }
      ],
      "instruccion": "Observa el triángulo ABC"
    }
  ],
  "ejercicios": [
    {
      "numero": 1,
      "pregunta": "¿Cuáles son las coordenadas del vértice A?",
      "tipo": "identificacion",
      "planoId": 1
    }
  ],
  "tablas": [
    {
      "titulo": "Coordenadas",
      "encabezados": ["Vértice", "x", "y"],
      "filas": [
        { "elemento": "A", "valores": ["2", "3"] },
        { "elemento": "B", "valores": ["5", "3"] }
      ],
      "pregunta": "Completa la tabla"
    }
  ]
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `planos` | `Array<{id, tamano, origen, figuras, instruccion}>` | ✅ | |
| `planos[].figuras` | `Array<{tipo, vertices?, centro?, radio?, color, etiqueta?}>` | ✅ | tipo: `"poligono"` \| `"circulo"` \| `"cuadrado"` \| `"triangulo"` \| `"rectangulo"` |
| `ejercicios` | `Array<{numero, pregunta, tipo, planoId}>` | ✅ | tipo: `"traslacion"` \| `"ubicacion"` \| `"identificacion"` |
| `tablas` | `Array<{titulo, encabezados, filas, pregunta}>` | ✅ | |

---

## 20. `valor_posicional`

Muestra la descomposición de un número por posiciones (unidades, decenas, centenas...).

```json
{
  "tipoGrafico": "valor_posicional",
  "titulo": "Valor posicional de 3,425",
  "numero": 3425,
  "posiciones": [
    { "posicion": "millares", "digito": 3, "valor": 3000, "color": "#FF6B6B" },
    { "posicion": "centenas", "digito": 4, "valor": 400, "color": "#4ECDC4" },
    { "posicion": "decenas", "digito": 2, "valor": 20, "color": "#45B7D1" },
    { "posicion": "unidades", "digito": 5, "valor": 5, "color": "#96CEB4" }
  ],
  "mostrarDescomposicion": true,
  "estilo": "tabla"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `numero` | `number` | ✅ | |
| `posiciones` | `Array<{posicion, digito, valor, color?}>` | ✅ | posicion: `"unidades"` \| `"decenas"` \| `"centenas"` \| `"millares"` |
| `mostrarDescomposicion` | `boolean` | ❌ | |
| `estilo` | `"tabla"` \| `"bloques"` \| `"expandido"` | ❌ | |

---

## 21. `descomposicion_numero`

Descomposición aditiva, multiplicativa o mixta de un número.

```json
{
  "tipoGrafico": "descomposicion_numero",
  "titulo": "Descomponemos 345",
  "numero": 345,
  "partes": [
    { "valor": 300, "etiqueta": "3 centenas", "color": "#FF6B6B" },
    { "valor": 40, "etiqueta": "4 decenas", "color": "#4ECDC4" },
    { "valor": 5, "etiqueta": "5 unidades", "color": "#45B7D1" }
  ],
  "tipo": "aditiva",
  "mostrarArbol": true
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `numero` | `number` | ✅ | |
| `partes` | `Array<{valor, etiqueta, color?}>` | ✅ | |
| `tipo` | `"aditiva"` \| `"multiplicativa"` \| `"mixta"` | ✅ | |
| `mostrarArbol` | `boolean` | ❌ | |

---

## 22. `abaco`

Representación de un ábaco con columnas y cuentas.

```json
{
  "tipoGrafico": "abaco",
  "titulo": "Representamos 253 en el ábaco",
  "numero": 253,
  "columnas": [
    { "posicion": "centenas", "cuentas": 2, "color": "#FF6B6B" },
    { "posicion": "decenas", "cuentas": 5, "color": "#4ECDC4" },
    { "posicion": "unidades", "cuentas": 3, "color": "#45B7D1" }
  ],
  "mostrarValor": true,
  "maxCuentas": 9
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `numero` | `number` | ✅ | |
| `columnas` | `Array<{posicion, cuentas, color?}>` | ✅ | |
| `mostrarValor` | `boolean` | ❌ | |
| `maxCuentas` | `number` | ❌ | |

---

## 23. `base_diez_bloques`

Bloques de base 10 (unidades, barras, placas, cubos).

```json
{
  "tipoGrafico": "base_diez_bloques",
  "titulo": "Representamos 234",
  "numero": 234,
  "bloques": [
    { "tipo": "placa", "cantidad": 2, "color": "#FF6B6B" },
    { "tipo": "barra", "cantidad": 3, "color": "#4ECDC4" },
    { "tipo": "unidad", "cantidad": 4, "color": "#45B7D1" }
  ],
  "mostrarTotal": true,
  "agrupacion": false
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `numero` | `number` | ✅ | |
| `bloques` | `Array<{tipo, cantidad, color?}>` | ✅ | tipo: `"unidad"` \| `"barra"` \| `"placa"` \| `"cubo"` |
| `mostrarTotal` | `boolean` | ❌ | |
| `agrupacion` | `boolean` | ❌ | |

---

## 24. `pictograma`

Gráfico con íconos que representan cantidades.

```json
{
  "tipoGrafico": "pictograma",
  "titulo": "Mascotas de los estudiantes",
  "elementos": [
    { "categoria": "Perros", "cantidad": 8, "icono": "🐕", "color": "#FF6B6B" },
    { "categoria": "Gatos", "cantidad": 5, "icono": "🐈", "color": "#4ECDC4" },
    { "categoria": "Peces", "cantidad": 3, "icono": "🐟", "color": "#45B7D1" }
  ],
  "iconoBase": "⭐",
  "valorIcono": 1,
  "mostrarLeyenda": true,
  "orientacion": "horizontal"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `elementos` | `Array<{categoria, cantidad, icono?, color?}>` | ✅ | |
| `iconoBase` | `string` | ❌ | Ícono por defecto si no se especifica en el elemento |
| `valorIcono` | `number` | ❌ | Cuánto vale cada ícono (ej: 2 = cada ícono vale 2) |
| `mostrarLeyenda` | `boolean` | ❌ | |
| `orientacion` | `"horizontal"` \| `"vertical"` | ❌ | |

---

## 25. `grafico_circular`

Gráfico de torta/pastel con sectores.

```json
{
  "tipoGrafico": "grafico_circular",
  "titulo": "Distribución de notas",
  "sectores": [
    { "etiqueta": "AD", "valor": 5, "porcentaje": 20, "color": "#4CAF50" },
    { "etiqueta": "A", "valor": 10, "porcentaje": 40, "color": "#2196F3" },
    { "etiqueta": "B", "valor": 7, "porcentaje": 28, "color": "#FF9800" },
    { "etiqueta": "C", "valor": 3, "porcentaje": 12, "color": "#F44336" }
  ],
  "mostrarPorcentajes": true,
  "mostrarLeyenda": true,
  "total": 25
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `sectores` | `Array<{etiqueta, valor, porcentaje?, color?}>` | ✅ | |
| `mostrarPorcentajes` | `boolean` | ❌ | |
| `mostrarLeyenda` | `boolean` | ❌ | |
| `total` | `number` | ❌ | |

---

## 26. `grafico_lineal`

Gráfico de líneas con una o más series de datos.

```json
{
  "tipoGrafico": "grafico_lineal",
  "titulo": "Temperatura durante la semana",
  "series": [
    {
      "nombre": "Mañana",
      "puntos": [
        { "x": "Lun", "y": 15 },
        { "x": "Mar", "y": 17 },
        { "x": "Mié", "y": 14 },
        { "x": "Jue", "y": 18 },
        { "x": "Vie", "y": 16 }
      ],
      "color": "#FF6B6B"
    }
  ],
  "ejeX": { "titulo": "Día", "etiquetas": ["Lun", "Mar", "Mié", "Jue", "Vie"] },
  "ejeY": { "titulo": "°C", "maximo": 25, "intervalo": 5 },
  "mostrarPuntos": true,
  "mostrarArea": false
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `series` | `Array<{nombre, puntos: Array<{x, y, etiqueta?}>, color?}>` | ✅ | |
| `ejeX` | `{titulo, etiquetas?}` | ❌ | |
| `ejeY` | `{titulo, maximo?, intervalo?}` | ❌ | |
| `mostrarPuntos` | `boolean` | ❌ | |
| `mostrarArea` | `boolean` | ❌ | |

---

## 27. `tabla_frecuencias`

Tabla de distribución de frecuencias.

```json
{
  "tipoGrafico": "tabla_frecuencias",
  "titulo": "Edades de los estudiantes",
  "datos": [
    { "dato": 6, "conteo": "||||", "frecuencia": 4, "frecuenciaRelativa": 0.2, "frecuenciaAcumulada": 4 },
    { "dato": 7, "conteo": "|||| ||", "frecuencia": 7, "frecuenciaRelativa": 0.35, "frecuenciaAcumulada": 11 },
    { "dato": 8, "conteo": "|||| ||||", "frecuencia": 9, "frecuenciaRelativa": 0.45, "frecuenciaAcumulada": 20 }
  ],
  "mostrarConteo": true,
  "mostrarRelativa": true,
  "mostrarAcumulada": true,
  "totalDatos": 20
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `datos` | `Array<{dato, conteo?, frecuencia, frecuenciaRelativa?, frecuenciaAcumulada?}>` | ✅ | |
| `mostrarConteo` | `boolean` | ❌ | |
| `mostrarRelativa` | `boolean` | ❌ | |
| `mostrarAcumulada` | `boolean` | ❌ | |
| `totalDatos` | `number` | ❌ | |

---

## 28. `reloj_tiempo`

Uno o más relojes analógicos con hora configurada.

```json
{
  "tipoGrafico": "reloj_tiempo",
  "titulo": "¿Qué hora es?",
  "relojes": [
    { "hora": 3, "minuto": 30, "etiqueta": "Recreo" },
    { "hora": 8, "minuto": 0, "etiqueta": "Entrada" }
  ],
  "formato": "12h",
  "mostrarDigital": true,
  "tipo": "lectura"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `relojes` | `Array<{hora, minuto, etiqueta?}>` | ✅ | |
| `formato` | `"12h"` \| `"24h"` | ❌ | |
| `mostrarDigital` | `boolean` | ❌ | |
| `tipo` | `"lectura"` \| `"comparacion"` \| `"duracion"` | ❌ | |

---

## 29. `calendario`

Calendario de un mes con eventos y días destacados.

```json
{
  "tipoGrafico": "calendario",
  "titulo": "Calendario de marzo",
  "mes": 3,
  "anio": 2026,
  "eventos": [
    { "dia": 8, "texto": "Día de la Mujer", "color": "#FF6B6B", "destacado": true },
    { "dia": 22, "texto": "Día del Agua", "color": "#4ECDC4", "destacado": false }
  ],
  "destacarDias": [1, 5, 10, 15, 20, 25],
  "pregunta": "¿Cuántos días tiene marzo?"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `mes` | `number` (1-12) | ✅ | |
| `anio` | `number` | ✅ | |
| `eventos` | `Array<{dia, texto?, color?, destacado?}>` | ❌ | |
| `destacarDias` | `number[]` | ❌ | |
| `pregunta` | `string` | ❌ | |

---

## 30. `termometro`

Termómetro visual con temperatura marcada.

```json
{
  "tipoGrafico": "termometro",
  "titulo": "Temperatura de hoy",
  "temperatura": 25,
  "minimo": 0,
  "maximo": 50,
  "unidad": "C",
  "marcas": [0, 10, 20, 30, 40, 50],
  "etiqueta": "Lima, Perú",
  "colorLiquido": "#FF0000"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `temperatura` | `number` | ✅ | |
| `minimo` | `number` | ❌ | |
| `maximo` | `number` | ❌ | |
| `unidad` | `"C"` \| `"F"` | ❌ | |
| `marcas` | `number[]` | ❌ | |
| `etiqueta` | `string` | ❌ | |
| `colorLiquido` | `string` | ❌ | |

---

## 31. `conversion_medidas`

Muestra conversiones paso a paso entre unidades.

```json
{
  "tipoGrafico": "conversion_medidas",
  "titulo": "Convertimos metros a centímetros",
  "conversiones": [
    {
      "desde": { "valor": 2, "unidad": "m" },
      "hasta": { "valor": 200, "unidad": "cm" },
      "factor": "× 100"
    }
  ],
  "tipo": "longitud",
  "mostrarEscalera": true
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `conversiones` | `Array<{desde: {valor, unidad}, hasta: {valor, unidad}, factor?}>` | ✅ | |
| `tipo` | `"longitud"` \| `"masa"` \| `"capacidad"` \| `"tiempo"` | ❌ | |
| `mostrarEscalera` | `boolean` | ❌ | |

---

## 32. `regla_medicion`

Regla visual para medir objetos.

```json
{
  "tipoGrafico": "regla_medicion",
  "titulo": "Medimos el lápiz",
  "inicio": 0,
  "fin": 20,
  "unidad": "cm",
  "intervalo": 1,
  "marcas": [
    { "posicion": 0, "etiqueta": "Inicio", "destacado": true },
    { "posicion": 15, "etiqueta": "15 cm", "color": "#FF0000", "destacado": true }
  ],
  "objetoMedir": "Lápiz"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `inicio` | `number` | ✅ | |
| `fin` | `number` | ✅ | |
| `unidad` | `string` | ✅ | |
| `intervalo` | `number` | ❌ | |
| `marcas` | `Array<{posicion, etiqueta?, color?, destacado?}>` | ❌ | |
| `objetoMedir` | `string` | ❌ | |

---

## 33. `caja_funcion`

Máquina de funciones: entrada → regla → salida.

```json
{
  "tipoGrafico": "caja_funcion",
  "titulo": "Máquina de funciones",
  "regla": "× 3 + 1",
  "pares": [
    { "entrada": 2, "salida": 7 },
    { "entrada": 4, "salida": 13 },
    { "entrada": 5, "salida": "?" }
  ],
  "incognitas": [2],
  "mostrarRegla": true
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `regla` | `string` | ✅ | Expresión de la función |
| `pares` | `Array<{entrada, salida}>` | ✅ | Pueden ser `number` o `string` (para incógnitas) |
| `incognitas` | `number[]` | ❌ | Índices de los pares con incógnita |
| `mostrarRegla` | `boolean` | ❌ | |

---

## 34. `arbol_factores`

Árbol de descomposición en factores primos.

```json
{
  "tipoGrafico": "arbol_factores",
  "titulo": "Factorización de 60",
  "numero": 60,
  "arbol": {
    "valor": 60,
    "esPrimo": false,
    "hijos": [
      { "valor": 2, "esPrimo": true },
      {
        "valor": 30,
        "esPrimo": false,
        "hijos": [
          { "valor": 2, "esPrimo": true },
          {
            "valor": 15,
            "esPrimo": false,
            "hijos": [
              { "valor": 3, "esPrimo": true },
              { "valor": 5, "esPrimo": true }
            ]
          }
        ]
      }
    ]
  },
  "mostrarPrimos": true,
  "resultado": "2² × 3 × 5"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `numero` | `number` | ✅ | |
| `arbol` | `NodoFactor` (recursivo) | ✅ | `{valor, esPrimo?, hijos?: NodoFactor[]}` |
| `mostrarPrimos` | `boolean` | ❌ | |
| `resultado` | `string` | ❌ | Expresión final |

---

## 35. `multiplos_tabla`

Tabla del 1 al 100 con múltiplos resaltados.

```json
{
  "tipoGrafico": "multiplos_tabla",
  "titulo": "Múltiplos de 3",
  "numero": 3,
  "rango": { "inicio": 1, "fin": 100 },
  "multiplosDestacados": [3, 6, 9, 12, 15, 18, 21, 24, 27, 30],
  "mostrarTabla100": true,
  "colorMultiplo": "#4ECDC4"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `numero` | `number` | ✅ | |
| `rango` | `{inicio, fin}` | ✅ | |
| `multiplosDestacados` | `number[]` | ❌ | |
| `mostrarTabla100` | `boolean` | ❌ | |
| `colorMultiplo` | `string` | ❌ | |

---

## 36. `potencias_raices`

Expresiones de potencias y raíces con visualización.

```json
{
  "tipoGrafico": "potencias_raices",
  "titulo": "Potencias y raíces",
  "expresiones": [
    { "base": 3, "exponente": 2, "resultado": 9, "tipo": "potencia" },
    { "base": 9, "exponente": 2, "resultado": 3, "tipo": "raiz" }
  ],
  "mostrarVisualizacion": true,
  "tipo": "ambos"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `expresiones` | `Array<{base, exponente, resultado, tipo: "potencia" \| "raiz"}>` | ✅ | |
| `mostrarVisualizacion` | `boolean` | ❌ | |
| `tipo` | `"potencia"` \| `"raiz"` \| `"ambos"` | ❌ | |

---

## 37. `cuerpos_geometricos`

Cuerpos geométricos 3D.

```json
{
  "tipoGrafico": "cuerpos_geometricos",
  "titulo": "Cuerpos geométricos",
  "cuerpos": [
    { "tipo": "cubo", "etiqueta": "Cubo", "medidas": { "arista": 4 }, "color": "#FF6B6B" },
    { "tipo": "cilindro", "etiqueta": "Cilindro", "medidas": { "radio": 3, "altura": 6 }, "color": "#4ECDC4" }
  ],
  "mostrarNombres": true,
  "mostrarMedidas": true,
  "vista": "isometrica"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `cuerpos` | `Array<{tipo, etiqueta?, medidas?, color?}>` | ✅ | tipo: `"cubo"` \| `"esfera"` \| `"cilindro"` \| `"cono"` \| `"prisma"` \| `"piramide"` |
| `mostrarNombres` | `boolean` | ❌ | |
| `mostrarMedidas` | `boolean` | ❌ | |
| `vista` | `"frontal"` \| `"isometrica"` | ❌ | |

---

## 38. `angulos`

Representación de ángulos con medición y clasificación.

```json
{
  "tipoGrafico": "angulos",
  "titulo": "Clasificamos ángulos",
  "angulos": [
    { "grados": 45, "tipo": "agudo", "etiqueta": "∠A", "color": "#FF6B6B", "mostrarMedida": true },
    { "grados": 90, "tipo": "recto", "etiqueta": "∠B", "color": "#4ECDC4", "mostrarMedida": true },
    { "grados": 120, "tipo": "obtuso", "etiqueta": "∠C", "color": "#45B7D1", "mostrarMedida": true }
  ],
  "mostrarTransportador": true,
  "mostrarClasificacion": true
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `angulos` | `Array<{grados, tipo?, etiqueta?, color?, mostrarMedida?}>` | ✅ | tipo: `"agudo"` \| `"recto"` \| `"obtuso"` \| `"llano"` \| `"completo"` |
| `mostrarTransportador` | `boolean` | ❌ | |
| `mostrarClasificacion` | `boolean` | ❌ | |

---

## 39. `simetria`

Figura con eje de simetría y reflejo.

```json
{
  "tipoGrafico": "simetria",
  "titulo": "Eje de simetría",
  "figuraOriginal": {
    "tipo": "triangulo",
    "puntos": [{ "x": 2, "y": 0 }, { "x": 0, "y": 4 }, { "x": 4, "y": 4 }],
    "color": "#FF6B6B"
  },
  "ejeSimetria": "vertical",
  "mostrarEje": true,
  "mostrarReflejo": true,
  "cuadricula": true
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `figuraOriginal` | `{tipo, puntos?: Array<{x, y}>, color?}` | ✅ | |
| `ejeSimetria` | `"vertical"` \| `"horizontal"` \| `"diagonal"` | ✅ | |
| `mostrarEje` | `boolean` | ❌ | |
| `mostrarReflejo` | `boolean` | ❌ | |
| `cuadricula` | `boolean` | ❌ | |

---

## 40. `redes_cuerpos`

Desarrollo plano (red) de un cuerpo geométrico 3D.

```json
{
  "tipoGrafico": "redes_cuerpos",
  "titulo": "Red del cubo",
  "redes": [
    {
      "cuerpo": "cubo",
      "caras": [
        { "forma": "cuadrado", "posicion": { "x": 1, "y": 0 }, "dimensiones": { "lado": 3 }, "color": "#FF6B6B" },
        { "forma": "cuadrado", "posicion": { "x": 0, "y": 1 }, "dimensiones": { "lado": 3 }, "color": "#4ECDC4" },
        { "forma": "cuadrado", "posicion": { "x": 1, "y": 1 }, "dimensiones": { "lado": 3 }, "color": "#45B7D1" },
        { "forma": "cuadrado", "posicion": { "x": 2, "y": 1 }, "dimensiones": { "lado": 3 }, "color": "#96CEB4" },
        { "forma": "cuadrado", "posicion": { "x": 3, "y": 1 }, "dimensiones": { "lado": 3 }, "color": "#FFEAA7" },
        { "forma": "cuadrado", "posicion": { "x": 1, "y": 2 }, "dimensiones": { "lado": 3 }, "color": "#DDA0DD" }
      ]
    }
  ],
  "mostrarCuerpo3D": true,
  "mostrarDobleces": true
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `redes` | `Array<{cuerpo, caras}>` | ✅ | cuerpo: `"cubo"` \| `"prisma"` \| `"piramide"` \| `"cilindro"` \| `"cono"` |
| `redes[].caras` | `Array<{forma, posicion: {x, y}, dimensiones, color?}>` | ✅ | |
| `mostrarCuerpo3D` | `boolean` | ❌ | |
| `mostrarDobleces` | `boolean` | ❌ | |

---

## 41. `cambio_monedas`

Equivalencia entre monedas/billetes.

```json
{
  "tipoGrafico": "cambio_monedas",
  "titulo": "Cambiamos billetes por monedas",
  "monedasInicio": [
    { "tipo": "billete", "valor": 10, "cantidad": 1 }
  ],
  "monedasResultado": [
    { "tipo": "moneda", "valor": 5, "cantidad": 1 },
    { "tipo": "moneda", "valor": 2, "cantidad": 2 },
    { "tipo": "moneda", "valor": 1, "cantidad": 1 }
  ],
  "moneda": "S/",
  "mostrarEquivalencia": true,
  "totalOriginal": 10
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `monedasInicio` | `Array<{tipo: "moneda" \| "billete", valor, cantidad}>` | ✅ | |
| `monedasResultado` | `Array<{tipo: "moneda" \| "billete", valor, cantidad}>` | ✅ | |
| `moneda` | `"S/"` \| `"$"` \| `"€"` | ❌ | |
| `mostrarEquivalencia` | `boolean` | ❌ | |
| `totalOriginal` | `number` | ❌ | |

---

## 42. `recta_fraccion`

Recta numérica para ubicar fracciones.

```json
{
  "tipoGrafico": "recta_fraccion",
  "titulo": "Ubicamos fracciones en la recta",
  "inicio": 0,
  "fin": 2,
  "denominadorBase": 4,
  "marcas": [
    { "posicion": 0.25, "numerador": 1, "denominador": 4, "etiqueta": "1/4", "color": "#FF6B6B", "destacado": true },
    { "posicion": 0.5, "numerador": 1, "denominador": 2, "etiqueta": "1/2", "color": "#4ECDC4", "destacado": true },
    { "posicion": 1.0, "numerador": 4, "denominador": 4, "etiqueta": "4/4", "color": "#45B7D1", "destacado": false },
    { "posicion": 1.5, "numerador": 3, "denominador": 2, "etiqueta": "3/2", "color": "#96CEB4", "destacado": true }
  ]
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `inicio` | `number` | ✅ | |
| `fin` | `number` | ✅ | |
| `denominadorBase` | `number` | ❌ | |
| `marcas` | `Array<{posicion, numerador, denominador, etiqueta?, color?, destacado?}>` | ✅ | `posicion` = valor decimal |

---

## 43. `ecuacion_cajas` (con filas de resolución)

Ejemplo avanzado con filas de resolución paso a paso:

```json
{
  "tipoGrafico": "ecuacion_cajas",
  "titulo": "Resolución paso a paso",
  "elementos": [
    { "tipo": "caja", "contenido": "15", "color": "azul" },
    { "tipo": "operador", "contenido": "+" },
    { "tipo": "caja", "contenido": "27", "color": "verde" },
    { "tipo": "operador", "contenido": "=" },
    { "tipo": "caja", "contenido": "?", "color": "amarillo", "destacado": true }
  ],
  "filas": [
    {
      "elementos": [
        { "tipo": "caja", "contenido": "15", "color": "azul" },
        { "tipo": "operador", "contenido": "+" },
        { "tipo": "caja", "contenido": "27", "color": "verde" },
        { "tipo": "operador", "contenido": "=" },
        { "tipo": "caja", "contenido": "42", "color": "rojo", "destacado": true }
      ]
    }
  ]
}
```

---

# PARTE 2 — ÁREAS CURRICULARES (16 tipos)

---

## 44. `estructura_narrativa` — Comunicación

Estructura de inicio, nudo y desenlace de un texto narrativo.

```json
{
  "tipoGrafico": "estructura_narrativa",
  "titulo": "Analizamos el cuento: El zorro y el cóndor",
  "secciones": [
    { "nombre": "Inicio", "color": "#4ECDC4", "icono": "📖", "contenido": "Un zorro vivía en la sierra y quería volar como el cóndor." },
    { "nombre": "Nudo", "color": "#FF6B6B", "icono": "⚡", "contenido": "El zorro pidió al cóndor que lo llevara al cielo, pero al subir tuvo mucho miedo." },
    { "nombre": "Desenlace", "color": "#45B7D1", "icono": "🎯", "contenido": "El zorro aprendió que cada animal tiene sus propias habilidades." }
  ],
  "personajes": ["Zorro", "Cóndor"],
  "lugar": "Sierra peruana",
  "mensaje": "Debemos valorar nuestras propias habilidades"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `secciones` | `[Inicio, Nudo, Desenlace]` — Array de exactamente 3 objetos | ✅ | `{nombre, color, icono, contenido}` |
| `personajes` | `string[]` | ✅ | |
| `lugar` | `string` | ✅ | |
| `mensaje` | `string` | ✅ | Mensaje o moraleja |

---

## 45. `organizador_kvl` — Comunicación

Organizador "Lo que sé / Lo que quiero saber / Lo que aprendí".

```json
{
  "tipoGrafico": "organizador_kvl",
  "titulo": "Organizador KVL: Los volcanes",
  "tema": "Los volcanes",
  "columnas": [
    {
      "encabezado": "Lo que sé",
      "color": "#4ECDC4",
      "icono": "🧠",
      "items": ["Los volcanes hacen erupción", "Tienen lava caliente"]
    },
    {
      "encabezado": "Lo que quiero saber",
      "color": "#FF6B6B",
      "icono": "❓",
      "items": ["¿Por qué hacen erupción?", "¿Hay volcanes en Perú?"]
    },
    {
      "encabezado": "Lo que aprendí",
      "color": "#45B7D1",
      "icono": "✅",
      "items": ["La erupción ocurre por presión del magma", "El Misti es un volcán activo"]
    }
  ]
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `tema` | `string` | ✅ | |
| `columnas` | Array de exactamente 3 objetos | ✅ | `{encabezado, color, icono, items: string[]}` |

---

## 46. `planificador_escritura` — Comunicación

Planificación para producción de textos.

```json
{
  "tipoGrafico": "planificador_escritura",
  "titulo": "Planificamos nuestro cuento",
  "tipoTexto": "cuento",
  "campos": [
    { "pregunta": "¿Para quién escribimos?", "respuesta": "Para nuestros compañeros de clase" },
    { "pregunta": "¿Qué queremos contar?", "respuesta": "Una aventura en el bosque" },
    { "pregunta": "¿Qué lenguaje usaremos?", "respuesta": "Informal, con diálogos" }
  ],
  "ideasPrincipales": [
    "Dos amigos se pierden en el bosque",
    "Encuentran un río misterioso",
    "Aprenden a trabajar en equipo"
  ]
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `tipoTexto` | `"cuento"` \| `"carta"` \| `"noticia"` \| `"instrucciones"` \| `"poema"` \| `"afiche"` | ✅ | |
| `campos` | `Array<{pregunta, respuesta}>` | ✅ | |
| `ideasPrincipales` | `string[]` | ✅ | |

---

## 47. `tabla_observacion` — Ciencia y Tecnología

Tabla para registrar observaciones de un experimento.

```json
{
  "tipoGrafico": "tabla_observacion",
  "titulo": "Observamos el crecimiento de plantas",
  "subtitulo": "Registro semanal de altura",
  "columnas": [
    { "nombre": "Semana", "tipo": "texto" },
    { "nombre": "Planta A (con luz)", "tipo": "numero" },
    { "nombre": "Planta B (sin luz)", "tipo": "numero" }
  ],
  "filas": [
    ["Semana 1", "3", "2"],
    ["Semana 2", "6", "3"],
    ["Semana 3", "10", "4"],
    ["Semana 4", "15", "4"]
  ],
  "unidades": ["", "cm", "cm"]
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `subtitulo` | `string` | ✅ | |
| `columnas` | `Array<{nombre, tipo: "texto" \| "numero"}>` | ✅ | |
| `filas` | `string[][]` | ✅ | Cada subarray tiene los valores de una fila |
| `unidades` | `string[]` | ✅ | Unidad para cada columna (vacío si no aplica) |

---

## 48. `ciclo_proceso` — Ciencia y Tecnología

Diagrama de ciclo o proceso con fases.

```json
{
  "tipoGrafico": "ciclo_proceso",
  "titulo": "Ciclo del agua",
  "tipo": "circular",
  "fases": [
    { "nombre": "Evaporación", "descripcion": "El agua se calienta y sube como vapor", "icono": "☀️", "color": "#FF6B6B" },
    { "nombre": "Condensación", "descripcion": "El vapor se enfría y forma nubes", "icono": "☁️", "color": "#4ECDC4" },
    { "nombre": "Precipitación", "descripcion": "El agua cae como lluvia o nieve", "icono": "🌧️", "color": "#45B7D1" },
    { "nombre": "Recolección", "descripcion": "El agua se junta en ríos y lagos", "icono": "🌊", "color": "#96CEB4" }
  ],
  "colorFondo": "#F0F9FF"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `tipo` | `"circular"` \| `"lineal"` | ✅ | |
| `fases` | `Array<{nombre, descripcion, icono, color}>` | ✅ | |
| `colorFondo` | `string` | ❌ | |

---

## 49. `clasificacion_dicotomica` — Ciencia y Tecnología

Árbol de clasificación con preguntas sí/no.

```json
{
  "tipoGrafico": "clasificacion_dicotomica",
  "titulo": "Clasificamos los animales",
  "nodos": [
    { "id": "1", "pregunta": "¿Tiene columna vertebral?", "si": "2", "no": "3" },
    { "id": "2", "pregunta": "¿Tiene pelo?", "si": "4", "no": "5" },
    { "id": "3", "etiqueta": "Invertebrado", "esHoja": true, "ejemplos": ["Araña", "Hormiga"] },
    { "id": "4", "etiqueta": "Mamífero", "esHoja": true, "ejemplos": ["Perro", "Gato"] },
    { "id": "5", "etiqueta": "Otro vertebrado", "esHoja": true, "ejemplos": ["Lagartija", "Pez"] }
  ]
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `nodos` | `Array<NodoDicotomico>` | ✅ | Ver estructura abajo |

**Estructura `NodoDicotomico`:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` | ✅ Identificador único |
| `pregunta` | `string` | Pregunta sí/no (nodos internos) |
| `si` | `string` | ID del nodo hijo si la respuesta es sí |
| `no` | `string` | ID del nodo hijo si la respuesta es no |
| `etiqueta` | `string` | Texto del nodo hoja |
| `esHoja` | `boolean` | true si es nodo terminal |
| `ejemplos` | `string[]` | Ejemplos de la categoría |

---

## 50. `linea_tiempo` — Personal Social

Línea de tiempo con eventos históricos o secuenciales.

```json
{
  "tipoGrafico": "linea_tiempo",
  "titulo": "Historia del Perú",
  "subtitulo": "Eventos importantes",
  "orientacion": "horizontal",
  "eventos": [
    { "fecha": "1821", "etiqueta": "Independencia", "descripcion": "Proclamación de la independencia del Perú", "color": "#FF6B6B", "icono": "🇵🇪" },
    { "fecha": "1879", "etiqueta": "Guerra del Pacífico", "descripcion": "Inicio de la Guerra del Pacífico", "color": "#4ECDC4", "icono": "⚔️" },
    { "fecha": "1911", "etiqueta": "Machu Picchu", "descripcion": "Descubrimiento científico de Machu Picchu", "color": "#45B7D1", "icono": "🏛️" }
  ],
  "colorLinea": "#3B82F6",
  "mostrarDecadas": false
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `subtitulo` | `string` | ❌ | |
| `orientacion` | `"horizontal"` \| `"vertical"` | ✅ | |
| `eventos` | `Array<{fecha, etiqueta, descripcion, color, icono}>` | ✅ | |
| `colorLinea` | `string` | ❌ | |
| `mostrarDecadas` | `boolean` | ❌ | |

---

## 51. `cuadro_comparativo` — Personal Social

Tabla comparativa con criterios y columnas.

```json
{
  "tipoGrafico": "cuadro_comparativo",
  "titulo": "Comparamos regiones del Perú",
  "criterios": ["Clima", "Relieve", "Actividades económicas", "Flora"],
  "columnas": [
    {
      "nombre": "Costa",
      "color": "#FF6B6B",
      "valores": ["Cálido y seco", "Llanuras y desiertos", "Pesca, agricultura", "Algarrobo, huarango"]
    },
    {
      "nombre": "Sierra",
      "color": "#4ECDC4",
      "valores": ["Frío y seco", "Montañas y valles", "Minería, ganadería", "Ichu, quinua"]
    },
    {
      "nombre": "Selva",
      "color": "#45B7D1",
      "valores": ["Cálido y húmedo", "Llanuras tropicales", "Agricultura, extracción", "Caoba, orquídeas"]
    }
  ],
  "colorEncabezado": "#1E40AF"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `criterios` | `string[]` | ✅ | Filas de la tabla (columna izquierda) |
| `columnas` | `Array<{nombre, color, valores: string[]}>` | ✅ | Cada columna tiene tantos valores como criterios |
| `colorEncabezado` | `string` | ❌ | |

> ⚠️ **IMPORTANTE**: `columnas[i].valores.length` debe ser igual a `criterios.length`.

---

## 52. `rueda_emociones` — Personal Social

Rueda de emociones para identificar y reflexionar sobre sentimientos.

```json
{
  "tipoGrafico": "rueda_emociones",
  "titulo": "¿Cómo me siento hoy?",
  "instruccion": "Identifica la emoción que más se parece a lo que sientes",
  "emociones": [
    { "nombre": "Alegría", "color": "#FFD700", "icono": "😊", "descripcion": "Me siento contento y con energía" },
    { "nombre": "Tristeza", "color": "#4169E1", "icono": "😢", "descripcion": "Me siento desanimado" },
    { "nombre": "Enojo", "color": "#FF4500", "icono": "😠", "descripcion": "Algo me molesta mucho" },
    { "nombre": "Miedo", "color": "#8B008B", "icono": "😨", "descripcion": "Algo me asusta o preocupa" },
    { "nombre": "Calma", "color": "#32CD32", "icono": "😌", "descripcion": "Me siento tranquilo y en paz" },
    { "nombre": "Sorpresa", "color": "#FF69B4", "icono": "😲", "descripcion": "Algo inesperado me pasó" }
  ],
  "emocionSeleccionada": null,
  "preguntaReflexion": "¿Por qué crees que te sientes así?"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `instruccion` | `string` | ✅ | |
| `emociones` | `Array<{nombre, color, icono, descripcion}>` | ✅ | |
| `emocionSeleccionada` | `string \| null` | ✅ | Enviar `null` |
| `preguntaReflexion` | `string` | ✅ | |

---

## 53. `ficha_autoconocimiento` — Personal Social

Ficha para reflexionar sobre uno mismo.

```json
{
  "tipoGrafico": "ficha_autoconocimiento",
  "titulo": "Me conozco mejor",
  "subtitulo": "Reflexiono sobre mis cualidades",
  "colorFondo": "#FFF5E6",
  "secciones": [
    {
      "nombre": "Mis fortalezas",
      "icono": "💪",
      "preguntas": ["¿Qué hago bien?", "¿Qué me gusta de mí?"]
    },
    {
      "nombre": "Mis intereses",
      "icono": "⭐",
      "preguntas": ["¿Qué me gusta hacer?", "¿Qué quiero aprender?"]
    },
    {
      "nombre": "Mis retos",
      "icono": "🎯",
      "preguntas": ["¿Qué me cuesta más?", "¿Cómo puedo mejorar?"]
    }
  ]
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `subtitulo` | `string` | ❌ | |
| `colorFondo` | `string` | ❌ | |
| `secciones` | `Array<{nombre, icono, preguntas: string[]}>` | ✅ | |

---

## 54. `tarjeta_reflexion` — Educación Religiosa

Tarjeta con texto bíblico o parábola y preguntas de reflexión.

```json
{
  "tipoGrafico": "tarjeta_reflexion",
  "titulo": "Reflexionamos sobre la parábola",
  "referencia": "Lucas 15:3-7",
  "texto": "¿Quién de ustedes, si tiene cien ovejas y pierde una, no deja las noventa y nueve en el campo y va en busca de la oveja perdida hasta encontrarla?",
  "esParabola": true,
  "color": "#8B5CF6",
  "preguntas": [
    "¿Qué nos enseña esta parábola?",
    "¿Cómo podemos aplicarlo en nuestra vida?",
    "¿Alguna vez te sentiste como la oveja perdida?"
  ]
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `referencia` | `string` | ✅ | Cita bíblica |
| `texto` | `string` | ✅ | Contenido del pasaje |
| `esParabola` | `boolean` | ✅ | |
| `color` | `string` | ✅ | Color principal de la tarjeta |
| `preguntas` | `string[]` | ✅ | Preguntas de reflexión |

---

## 55. `tarjeta_compromiso` — Educación Religiosa

Tarjeta de compromiso personal basada en un valor.

```json
{
  "tipoGrafico": "tarjeta_compromiso",
  "titulo": "Mi compromiso de solidaridad",
  "valor": "Solidaridad",
  "campos": [
    { "pregunta": "¿Qué haré para ser más solidario?", "respuesta": "" },
    { "pregunta": "¿Con quién practicaré este valor?", "respuesta": "" },
    { "pregunta": "¿Cuándo empezaré?", "respuesta": "" }
  ],
  "colorFondo": "#FFF7ED"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `valor` | `string` | ✅ | Valor o virtud a trabajar |
| `campos` | `Array<{pregunta, respuesta}>` | ✅ | `respuesta` puede estar vacío (el alumno lo completa) |
| `colorFondo` | `string` | ❌ | |

---

## 56. `ficha_analisis_obra` — Arte y Cultura

Ficha para analizar una obra artística o cultural.

```json
{
  "tipoGrafico": "ficha_analisis_obra",
  "titulo": "Analizamos la cerámica Mochica",
  "obra": {
    "nombre": "Huaco retrato Mochica",
    "autor": "Cultura Mochica",
    "origen": "Costa norte del Perú",
    "tipo": "cerámica"
  },
  "dimensiones": [
    { "aspecto": "Forma", "icono": "🔷", "observacion": "Tiene forma de rostro humano con detalles finos" },
    { "aspecto": "Color", "icono": "🎨", "observacion": "Colores tierra: marrón, crema y rojo" },
    { "aspecto": "Técnica", "icono": "🔧", "observacion": "Moldeado a mano con pintura al fresco" },
    { "aspecto": "Significado", "icono": "💡", "observacion": "Representaba a personajes importantes de la sociedad" }
  ],
  "miOpinion": "¿Qué sientes al observar esta obra?"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `obra` | `{nombre, autor, origen, tipo}` | ✅ | tipo: `"cerámica"` \| `"pintura"` \| `"tejido"` \| `"danza"` \| `"música"` \| `"escultura"` \| `"artesanía"` \| `"arquitectura"` |
| `dimensiones` | `Array<{aspecto, icono, observacion}>` | ✅ | |
| `miOpinion` | `string` | ✅ | Pregunta abierta para el estudiante |

---

## 57. `ficha_proceso_creativo` — Arte y Cultura

Guía para un proceso creativo en algún lenguaje artístico.

```json
{
  "tipoGrafico": "ficha_proceso_creativo",
  "titulo": "Creamos nuestra danza",
  "lenguajeArtistico": "corporal",
  "etapas": [
    {
      "nombre": "Explorar",
      "icono": "🔍",
      "color": "#FF6B6B",
      "descripcion": "Explora diferentes movimientos con tu cuerpo",
      "lista": ["Movimientos suaves", "Movimientos fuertes", "Saltos"],
      "pasos": []
    },
    {
      "nombre": "Crear",
      "icono": "✨",
      "color": "#4ECDC4",
      "descripcion": "Crea una secuencia de 4 movimientos",
      "lista": [],
      "pasos": ["Elige 4 movimientos", "Ponlos en orden", "Practica la secuencia"]
    },
    {
      "nombre": "Presentar",
      "icono": "🎭",
      "color": "#45B7D1",
      "descripcion": "Presenta tu danza al grupo",
      "lista": [],
      "pasos": ["Ensaya una vez más", "Presenta con confianza", "Recibe comentarios"]
    }
  ]
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `lenguajeArtistico` | `"plástico"` \| `"musical"` \| `"corporal"` \| `"dramático"` | ✅ | |
| `etapas` | `Array<{nombre, icono, color, descripcion, lista?, pasos?}>` | ✅ | |

---

## 58. `secuencia_movimiento` — Educación Física

Secuencia de movimientos o ejercicios físicos.

```json
{
  "tipoGrafico": "secuencia_movimiento",
  "titulo": "Circuito de ejercicios",
  "tipo": "circuito",
  "pasos": [
    { "numero": 1, "nombre": "Saltar soga", "descripcion": "Salta con los dos pies juntos", "duracion": "2 min" },
    { "numero": 2, "nombre": "Sentadillas", "descripcion": "Baja y sube flexionando las rodillas", "duracion": "1 min" },
    { "numero": 3, "nombre": "Carrera en el lugar", "descripcion": "Corre sin moverte del sitio", "duracion": "2 min" },
    { "numero": 4, "nombre": "Estiramientos", "descripcion": "Estira brazos y piernas", "duracion": "1 min" }
  ],
  "repeticiones": 3,
  "materiales": ["Soga", "Colchoneta"],
  "colorFondo": "#F0FFF4"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `tipo` | `"calentamiento"` \| `"juego"` \| `"danza"` \| `"ejercicio"` \| `"estiramiento"` \| `"circuito"` | ✅ | |
| `pasos` | `Array<{numero, nombre, descripcion, duracion}>` | ✅ | |
| `repeticiones` | `number` | ✅ | |
| `materiales` | `string[]` | ✅ | |
| `colorFondo` | `string` | ❌ | |

---

## 59. `tabla_habitos` — Educación Física

Tabla semanal para seguimiento de hábitos saludables.

```json
{
  "tipoGrafico": "tabla_habitos",
  "titulo": "Mis hábitos saludables",
  "semana": "Semana del 3 al 7 de marzo",
  "habitos": [
    { "nombre": "Beber agua", "icono": "💧", "color": "#4ECDC4" },
    { "nombre": "Hacer ejercicio", "icono": "🏃", "color": "#FF6B6B" },
    { "nombre": "Comer frutas", "icono": "🍎", "color": "#96CEB4" },
    { "nombre": "Dormir temprano", "icono": "😴", "color": "#45B7D1" }
  ],
  "dias": ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
  "meta": "Cumplir al menos 3 hábitos cada día"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `semana` | `string` | ✅ | Texto descriptivo de la semana |
| `habitos` | `Array<{nombre, icono, color}>` | ✅ | |
| `dias` | `string[]` | ✅ | Nombres de los días |
| `meta` | `string` | ✅ | Objetivo para el estudiante |

---

# RESUMEN DE TIPOS

## Referencia rápida por `tipoGrafico`

| # | `tipoGrafico` | Área | Descripción corta |
|---|--------------|------|-------------------|
| 1 | `ecuacion_cajas` | Matemática | Ecuación con cajas de operandos |
| 2 | `tabla_precios` | Matemática | Tabla de productos y precios |
| 3 | `barras_comparacion` | Matemática | Gráfico de barras |
| 4 | `tabla_valores` | Matemática | Tabla genérica de datos |
| 5 | `bloques_agrupados` | Matemática | Bloques para conteo |
| 6 | `recta_numerica` | Matemática | Recta con marcas y saltos |
| 7 | `circulos_fraccion` | Matemática | Fracciones en círculos |
| 8 | `barras_fraccion` | Matemática | Fracciones en barras |
| 9 | `diagrama_dinero` | Matemática | Monedas y billetes |
| 10 | `figuras_geometricas` | Matemática | Figuras 2D |
| 11 | `medidas_comparacion` | Matemática | Comparación de medidas |
| 12 | `patron_visual` | Matemática | Patrón de formas/colores |
| 13 | `patron_geometrico` | Matemática | Patrón de figuras geométricas |
| 14 | `diagrama_venn` | Matemática | Diagrama de conjuntos |
| 15 | `tabla_doble_entrada` | Matemática | Tabla con doble encabezado |
| 16 | `operacion_vertical` | Matemática | Suma, resta, etc. vertical |
| 17 | `balanza_equilibrio` | Matemática | Balanza comparativa |
| 18 | `numeros_ordinales` | Matemática | Ordinales (1°, 2°, 3°...) |
| 19 | `coordenadas_ejercicios` | Matemática | Plano cartesiano |
| 20 | `valor_posicional` | Matemática | UM, C, D, U |
| 21 | `descomposicion_numero` | Matemática | Descomponer un número |
| 22 | `abaco` | Matemática | Ábaco visual |
| 23 | `base_diez_bloques` | Matemática | Bloques base 10 |
| 24 | `pictograma` | Matemática | Gráfico con íconos |
| 25 | `grafico_circular` | Matemática | Gráfico de pastel/torta |
| 26 | `grafico_lineal` | Matemática | Gráfico de líneas |
| 27 | `tabla_frecuencias` | Matemática | Distribución de frecuencias |
| 28 | `reloj_tiempo` | Matemática | Relojes analógicos |
| 29 | `calendario` | Matemática | Calendario mensual |
| 30 | `termometro` | Matemática | Termómetro visual |
| 31 | `conversion_medidas` | Matemática | Conversión de unidades |
| 32 | `regla_medicion` | Matemática | Regla para medir |
| 33 | `caja_funcion` | Matemática | Máquina de funciones |
| 34 | `arbol_factores` | Matemática | Factorización prima |
| 35 | `multiplos_tabla` | Matemática | Tabla de múltiplos |
| 36 | `potencias_raices` | Matemática | Potencias y raíces |
| 37 | `cuerpos_geometricos` | Matemática | Cuerpos 3D |
| 38 | `angulos` | Matemática | Ángulos con medida |
| 39 | `simetria` | Matemática | Simetría con eje |
| 40 | `redes_cuerpos` | Matemática | Desarrollo plano de cuerpos |
| 41 | `cambio_monedas` | Matemática | Equivalencia de monedas |
| 42 | `recta_fraccion` | Matemática | Fracciones en recta |
| 43 | `estructura_narrativa` | Comunicación | Inicio-Nudo-Desenlace |
| 44 | `organizador_kvl` | Comunicación | Sé/Quiero saber/Aprendí |
| 45 | `planificador_escritura` | Comunicación | Planificación de texto |
| 46 | `tabla_observacion` | Ciencia y Tecnología | Registro de observaciones |
| 47 | `ciclo_proceso` | Ciencia y Tecnología | Diagrama de ciclo |
| 48 | `clasificacion_dicotomica` | Ciencia y Tecnología | Árbol sí/no |
| 49 | `linea_tiempo` | Personal Social | Línea de tiempo |
| 50 | `cuadro_comparativo` | Personal Social | Tabla comparativa |
| 51 | `rueda_emociones` | Personal Social | Rueda de emociones |
| 52 | `ficha_autoconocimiento` | Personal Social | Ficha personal |
| 53 | `tarjeta_reflexion` | Educación Religiosa | Reflexión bíblica |
| 54 | `tarjeta_compromiso` | Educación Religiosa | Compromiso de valor |
| 55 | `ficha_analisis_obra` | Arte y Cultura | Análisis de obra |
| 56 | `ficha_proceso_creativo` | Arte y Cultura | Proceso creativo |
| 57 | `secuencia_movimiento` | Educación Física | Secuencia de ejercicios |
| 58 | `tabla_habitos` | Educación Física | Seguimiento de hábitos |

---

## Nota para el Backend

1. **Siempre incluir `tipoGrafico`** como string en snake_case. Es el campo que el frontend usa para decidir qué componente renderizar.
2. **Siempre incluir `titulo`** — es lo que se muestra como encabezado del gráfico.
3. Los campos marcados como ❌ (no obligatorios) se pueden omitir — el frontend usará valores por defecto.
4. **Los arrays deben tener datos coherentes**: si `encabezados` tiene 3 columnas, cada fila en `elementos` debe tener 3 celdas.
5. El frontend NO valida la data al recibirla — si llega con estructura incorrecta, el componente simplemente no renderizará o mostrará vacío.
6. Los colores pueden ser:
   - Nombres: `"azul"`, `"rojo"`, etc. (solo para tipos de Matemática)
   - Hex: `"#FF6B6B"`, `"#4ECDC4"`, etc. (para todos los tipos)
7. El campo `grafico` es **opcional** en cada proceso. Si la sesión no necesita gráfico, no lo incluyan.
