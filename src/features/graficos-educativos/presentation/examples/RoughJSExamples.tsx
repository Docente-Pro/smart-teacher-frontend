/**
 * Ejemplos de gráficos educativos con Rough.js
 * 
 * Este archivo muestra cómo usar los componentes de gráficos
 * con el nuevo diseño dibujado a mano usando Rough.js
 */

import { GraficoRenderer } from '../components/GraficoRenderer';

/**
 * Ejemplo 1: Ecuación con cajas
 * Perfecto para enseñar sumas básicas
 */
export function EjemploEcuacionCajas() {
  const grafico = {
    tipoGrafico: "ecuacion_cajas" as const,
    elementos: [
      { tipo: "caja" as const, contenido: "5", color: "azul" as const },
      { tipo: "operador" as const, contenido: "+" },
      { tipo: "caja" as const, contenido: "3", color: "azul" as const },
      { tipo: "operador" as const, contenido: "=" },
      { tipo: "caja" as const, contenido: "8", color: "verde" as const, destacado: true }
    ]
  };

  return (
    <div className="ejemplo-wrapper">
      <h3>Suma básica con cajas visuales</h3>
      <GraficoRenderer grafico={grafico} />
      <p className="descripcion">
        Las cajas azules representan los números a sumar, y la caja verde 
        muestra el resultado. El estilo dibujado a mano hace el aprendizaje más amigable.
      </p>
    </div>
  );
}

/**
 * Ejemplo 2: Tabla de precios
 * Ideal para problemas de compras y cálculos de dinero
 */
export function EjemploTablaPrecios() {
  const grafico = {
    tipoGrafico: "tabla_precios" as const,
    elementos: [
      {
        producto: "Cuadernos",
        icono: "📓",
        precioUnitario: 3.50,
        cantidad: 4,
        total: 14.00
      },
      {
        producto: "Lápices",
        icono: "✏️",
        precioUnitario: 0.50,
        cantidad: 10,
        total: 5.00
      },
      {
        producto: "Borrador",
        icono: "🧹",
        precioUnitario: 1.00,
        cantidad: 2,
        total: 2.00
      }
    ],
    moneda: "S/",
    mostrarTotal: true
  };

  return (
    <div className="ejemplo-wrapper">
      <h3>Problema de compras escolares</h3>
      <GraficoRenderer grafico={grafico} />
      <p className="descripcion">
        Header con diseño cross-hatch, líneas dibujadas a mano, y total destacado en verde.
        Perfecto para que los estudiantes visualicen problemas de dinero.
      </p>
    </div>
  );
}

/**
 * Ejemplo 3: Gráfico de barras comparativas
 * Para comparar cantidades, estadísticas, etc.
 */
export function EjemploBarrasComparacion() {
  const grafico = {
    tipoGrafico: "barras_comparacion" as const,
    elementos: [
      {
        etiqueta: "Enero",
        valor: 25,
        color: "azul" as const,
        icono: "📅"
      },
      {
        etiqueta: "Febrero",
        valor: 35,
        color: "verde" as const,
        icono: "📅"
      },
      {
        etiqueta: "Marzo",
        valor: 20,
        color: "rojo" as const,
        icono: "📅"
      },
      {
        etiqueta: "Abril",
        valor: 45,
        color: "naranja" as const,
        icono: "📅"
      }
    ],
    ejeY: {
      titulo: "Libros leídos",
      maximo: 50,
      intervalo: 10
    }
  };

  return (
    <div className="ejemplo-wrapper">
      <h3>Libros leídos por mes</h3>
      <GraficoRenderer grafico={grafico} />
      <p className="descripcion">
        Barras con relleno hachure en ángulos diferentes, ejes dibujados a mano, 
        y valores destacados. Cada barra tiene un estilo único gracias a Rough.js.
      </p>
    </div>
  );
}

/**
 * Ejemplo 4: Bloques agrupados
 * Para representar conjuntos y cantidades
 */
export function EjemploBloquesAgrupados() {
  const grafico = {
    tipoGrafico: "bloques_agrupados" as const,
    elementos: [
      {
        etiqueta: "Manzanas",
        cantidad: 12,
        color: "rojo" as const,
        icono: "🍎"
      },
      {
        etiqueta: "Naranjas",
        cantidad: 8,
        color: "naranja" as const,
        icono: "🍊"
      },
      {
        etiqueta: "Plátanos",
        cantidad: 15,
        color: "amarillo" as const,
        icono: "🍌"
      }
    ],
    disposicion: "horizontal" as const,
    tamanoBloque: 25
  };

  return (
    <div className="ejemplo-wrapper">
      <h3>Frutas en la canasta</h3>
      <GraficoRenderer grafico={grafico} />
      <p className="descripcion">
        Bloques cuadrados con relleno hachure, organizados automáticamente en grid.
        Cada grupo tiene un ángulo de hachure único para diferenciarlos visualmente.
      </p>
    </div>
  );
}

/**
 * Ejemplo 5: Tabla de valores
 * Para datos tabulares generales
 */
export function EjemploTablaValores() {
  const grafico = {
    tipoGrafico: "tabla_valores" as const,
    encabezados: ["Día", "Temperatura (°C)", "Precipitación (mm)"],
    elementos: [
      { celdas: ["Lunes", "22", "0"] },
      { celdas: ["Martes", "25", "2"] },
      { celdas: ["Miércoles", "20", "15"] },
      { celdas: ["Jueves", "18", "8"] },
      { celdas: ["Viernes", "23", "0"] }
    ],
    mostrarBordes: true
  };

  return (
    <div className="ejemplo-wrapper">
      <h3>Registro del clima semanal</h3>
      <GraficoRenderer grafico={grafico} />
      <p className="descripcion">
        Tabla con bordes dibujados a mano, header destacado con cross-hatch, 
        y grid adaptable al contenido.
      </p>
    </div>
  );
}

/**
 * Galería completa de ejemplos
 */
export function GaleriaGraficosRoughJS() {
  return (
    <div className="galeria-graficos-roughjs">
      <div className="galeria-header">
        <h1>📊 Gráficos Educativos con Rough.js</h1>
        <p>
          Todos los gráficos usan Rough.js para crear un estilo dibujado a mano,
          perfecto para un ambiente educativo amigable y visualmente atractivo.
        </p>
      </div>

      <div className="galeria-grid">
        <EjemploEcuacionCajas />
        <EjemploTablaPrecios />
        <EjemploBarrasComparacion />
        <EjemploBloquesAgrupados />
        <EjemploTablaValores />
      </div>

      <div className="galeria-footer">
        <h3>✨ Características de Rough.js</h3>
        <ul>
          <li><strong>Roughness:</strong> Nivel de irregularidad (0-5) - usado 0.8-1.2 en estos ejemplos</li>
          <li><strong>Fill Styles:</strong> hachure, cross-hatch, solid, zigzag, dots, dashed</li>
          <li><strong>Ángulos variables:</strong> Cada elemento tiene un ángulo de hachure único</li>
          <li><strong>Ligero:</strong> Menos de 9kB, no afecta el performance</li>
          <li><strong>SVG:</strong> Escalable y de alta calidad en cualquier resolución</li>
        </ul>

        <div className="configuracion-ejemplo">
          <h4>Configuración por defecto:</h4>
          <pre>{`{
  roughness: 1.2,
  bowing: 1,
  strokeWidth: 2,
  fillStyle: 'hachure',
  fillWeight: 0.5,
  hachureGap: 4
}`}</pre>
        </div>
      </div>

      <style>{`
        .galeria-graficos-roughjs {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .galeria-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .galeria-header h1 {
          font-size: 2.5rem;
          color: #2C3E50;
          margin-bottom: 1rem;
        }

        .galeria-header p {
          font-size: 1.1rem;
          color: #7F8C8D;
          max-width: 800px;
          margin: 0 auto;
        }

        .galeria-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .ejemplo-wrapper {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .ejemplo-wrapper h3 {
          color: #2C3E50;
          margin-bottom: 1rem;
          font-size: 1.3rem;
        }

        .descripcion {
          margin-top: 1rem;
          color: #7F8C8D;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .galeria-footer {
          background: #F8F9FA;
          padding: 2rem;
          border-radius: 12px;
        }

        .galeria-footer h3 {
          color: #2C3E50;
          margin-bottom: 1rem;
        }

        .galeria-footer ul {
          list-style: none;
          padding: 0;
        }

        .galeria-footer li {
          padding: 0.5rem 0;
          color: #555;
        }

        .configuracion-ejemplo {
          margin-top: 1.5rem;
          background: white;
          padding: 1rem;
          border-radius: 8px;
        }

        .configuracion-ejemplo h4 {
          color: #2C3E50;
          margin-bottom: 0.5rem;
        }

        .configuracion-ejemplo pre {
          background: #2C3E50;
          color: #ECF0F1;
          padding: 1rem;
          border-radius: 6px;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
        }

        @media (max-width: 768px) {
          .galeria-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
