/**
 * QUICK START - Prueba rápida del feature Gráficos Educativos
 * 
 * Este archivo te permite probar rápidamente el sistema de gráficos.
 * Copia y pega en cualquier componente React para ver los gráficos en acción.
 */

import React from 'react';
import { GraficoRenderer } from './index';

/**
 * 🚀 PRUEBA RÁPIDA #1: Ecuación Simple
 */
export const PruebaEcuacionSimple = () => {
  const grafico = {
    tipoGrafico: "ecuacion_cajas",
    titulo: "Suma Simple",
    elementos: [
      { tipo: "caja", contenido: "5", color: "azul" },
      { tipo: "operador", contenido: "+" },
      { tipo: "caja", contenido: "3", color: "azul" },
      { tipo: "operador", contenido: "=" },
      { tipo: "caja", contenido: "8", color: "verde", destacado: true }
    ]
  };

  return <GraficoRenderer grafico={grafico} />;
};

/**
 * 🚀 PRUEBA RÁPIDA #2: Tabla de Compras
 */
export const PruebaTablaCompras = () => {
  const grafico = {
    tipoGrafico: "tabla_precios",
    titulo: "Lista de Compras",
    elementos: [
      {
        tipo: "fila",
        producto: "Manzanas",
        precioUnitario: 2.50,
        cantidad: 4,
        total: 10.00,
        icono: "🍎"
      },
      {
        tipo: "fila",
        producto: "Panes",
        precioUnitario: 0.50,
        cantidad: 6,
        total: 3.00,
        icono: "🥖"
      }
    ],
    moneda: "S/",
    mostrarTotal: true
  };

  return <GraficoRenderer grafico={grafico} />;
};

/**
 * 🚀 PRUEBA RÁPIDA #3: Gráfico de Barras
 */
export const PruebaBarras = () => {
  const grafico = {
    tipoGrafico: "barras_comparacion",
    titulo: "Frutas Vendidas",
    elementos: [
      {
        tipo: "barra",
        etiqueta: "Manzanas",
        valor: 10,
        color: "rojo",
        icono: "🍎"
      },
      {
        tipo: "barra",
        etiqueta: "Naranjas",
        valor: 15,
        color: "naranja",
        icono: "🍊"
      },
      {
        tipo: "barra",
        etiqueta: "Plátanos",
        valor: 8,
        color: "amarillo",
        icono: "🍌"
      }
    ],
    ejeY: {
      titulo: "Cantidad",
      maximo: 20,
      intervalo: 2
    }
  };

  return <GraficoRenderer grafico={grafico} />;
};

/**
 * 🚀 PRUEBA COMPLETA: Todas las pruebas juntas
 */
export const PruebaCompleta = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🧪 Pruebas Rápidas - Gráficos Educativos</h1>
      
      <section style={{ marginBottom: '3rem' }}>
        <h2>1️⃣ Ecuación Simple</h2>
        <PruebaEcuacionSimple />
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2>2️⃣ Tabla de Compras</h2>
        <PruebaTablaCompras />
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2>3️⃣ Gráfico de Barras</h2>
        <PruebaBarras />
      </section>

      <section style={{ 
        padding: '1rem', 
        background: '#e8f5e9', 
        borderRadius: '8px',
        marginTop: '3rem'
      }}>
        <h3>✅ Si ves los gráficos arriba, ¡todo funciona correctamente!</h3>
        <p>Puedes empezar a integrar este feature en tu aplicación.</p>
        <ul>
          <li>📖 Lee el README.md del feature</li>
          <li>📚 Consulta la GUIA_GRAFICOS_EDUCATIVOS.md</li>
          <li>🔍 Revisa los ejemplos en presentation/examples/</li>
        </ul>
      </section>
    </div>
  );
};

/**
 * 🎯 CÓMO USAR ESTE ARCHIVO:
 * 
 * 1. Importa en tu App.tsx o cualquier ruta:
 *    import { PruebaCompleta } from '@/features/graficos-educativos/QUICK_START';
 * 
 * 2. Renderiza el componente:
 *    <PruebaCompleta />
 * 
 * 3. Deberías ver 3 gráficos renderizados
 * 
 * 4. Si todo funciona, ya puedes integrar en tu aplicación real
 */

export default PruebaCompleta;
