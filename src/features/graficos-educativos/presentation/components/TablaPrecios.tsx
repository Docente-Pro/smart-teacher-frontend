import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoTablaPrecios } from '../../domain/types';
import { roughColors, defaultRoughConfig } from '../hooks/useRoughSVG';
import '../styles/TablaPrecios.css';

interface Props {
  data: GraficoTablaPrecios;
}

/**
 * Componente para renderizar tablas de precios con estilo dibujado a mano
 * Útil para problemas de compras, ventas, etc.
 */
export const TablaPrecios: React.FC<Props> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Transformar datos del backend si vienen en formato {producto, precio, cantidad}
  const getTableData = () => {
    const moneda = data.moneda || 'S/';
    const mostrarTotal = data.mostrarTotal ?? false;

    // Verificar si los elementos tienen el formato del backend
    const elementosTransformados = (data.elementos || []).map((elem: any) => {
      // Si ya tiene el formato correcto, retornarlo
      if (elem.precioUnitario !== undefined && typeof elem.cantidad === 'number') {
        return elem;
      }

      // Transformar desde formato backend: {producto, precio: "S/ 2", cantidad: "kilos"}
      let precioUnitario = 0;
      let cantidad = 1;
      
      // Extraer precio numérico del string "S/ 2" o "$3.50"
      if (elem.precio) {
        const precioMatch = elem.precio.toString().match(/[\d.]+/);
        precioUnitario = precioMatch ? parseFloat(precioMatch[0]) : 0;
      } else if (elem.precioUnitario !== undefined) {
        precioUnitario = elem.precioUnitario;
      }

      // Si cantidad es un string descriptivo, usar 1
      if (typeof elem.cantidad === 'string') {
        cantidad = 1;
      } else if (typeof elem.cantidad === 'number') {
        cantidad = elem.cantidad;
      }

      const total = elem.total !== undefined ? elem.total : precioUnitario * cantidad;

      return {
        tipo: 'fila' as const,
        producto: elem.producto || 'Producto',
        precioUnitario,
        cantidad,
        total,
        icono: elem.icono
      };
    });

    return {
      elementos: elementosTransformados,
      moneda,
      mostrarTotal
    };
  };

  const { elementos, moneda, mostrarTotal } = getTableData();
  const total = elementos.reduce((sum, fila) => sum + (fila.total || 0), 0);

  useEffect(() => {
    if (!svgRef.current) return;

    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const padding = 15;
    const rowHeight = 45;
    const colWidths = [180, 100, 80, 100];
    const tableWidth = colWidths.reduce((a, b) => a + b, 0) + padding * 2;
    const headerHeight = 50;
    const totalRows = elementos.length + (mostrarTotal ? 2 : 1);
    const tableHeight = headerHeight + totalRows * rowHeight + padding;

    // Fondo de la tabla
    const tableBg = rc.rectangle(10, 10, tableWidth, tableHeight, {
      ...defaultRoughConfig,
      fill: '#FFFFFF',
      fillStyle: 'solid',
      stroke: roughColors.azul,
      strokeWidth: 2,
      roughness: 0.8
    });
    svgRef.current.appendChild(tableBg);

    // Header
    const headerBg = rc.rectangle(10, 10, tableWidth, headerHeight, {
      ...defaultRoughConfig,
      fill: roughColors.azul,
      fillStyle: 'cross-hatch',
      stroke: roughColors.azul,
      strokeWidth: 2,
      roughness: 0.8
    });
    svgRef.current.appendChild(headerBg);

    // Headers text
    const headers = ['Producto', 'Precio Unit.', 'Cantidad', 'Total'];
    let headerX = padding + 10;
    headers.forEach((header, idx) => {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', headerX.toString());
      text.setAttribute('y', (35).toString());
      text.setAttribute('font-size', '15');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('fill', '#2C3E50');
      text.setAttribute('class', 'rough-text');
      text.textContent = header;
      svgRef.current?.appendChild(text);
      headerX += colWidths[idx];
    });

    // Líneas horizontales y contenido
    let currentY = headerHeight + 10;
    elementos.forEach((fila, idx) => {
      // Línea divisoria
      if (idx > 0) {
        const line = rc.line(10, currentY, tableWidth + 10, currentY, {
          stroke: '#E3F2FD',
          strokeWidth: 1,
          roughness: 0.5
        });
        svgRef.current?.appendChild(line);
      }

      const rowY = currentY + 25;
      
      // Icono y producto
      let cellX = padding + 10;
      const productText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      productText.setAttribute('x', cellX.toString());
      productText.setAttribute('y', rowY.toString());
      productText.setAttribute('font-size', '14');
      productText.setAttribute('fill', '#2C3E50');
      productText.setAttribute('class', 'rough-text');
      productText.textContent = `${fila.icono || ''} ${fila.producto}`;
      svgRef.current?.appendChild(productText);

      // Precio unitario
      cellX += colWidths[0];
      const precioText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      precioText.setAttribute('x', cellX.toString());
      precioText.setAttribute('y', rowY.toString());
      precioText.setAttribute('font-size', '14');
      precioText.setAttribute('font-family', 'monospace');
      precioText.setAttribute('fill', '#2C3E50');
      precioText.setAttribute('class', 'rough-text');
      precioText.textContent = `${moneda} ${(fila.precioUnitario || 0).toFixed(2)}`;
      svgRef.current?.appendChild(precioText);

      // Cantidad
      cellX += colWidths[1];
      const cantidadText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      cantidadText.setAttribute('x', cellX.toString());
      cantidadText.setAttribute('y', rowY.toString());
      cantidadText.setAttribute('font-size', '14');
      cantidadText.setAttribute('font-family', 'monospace');
      cantidadText.setAttribute('fill', '#2C3E50');
      cantidadText.setAttribute('class', 'rough-text');
      cantidadText.textContent = (fila.cantidad || 0).toString();
      svgRef.current?.appendChild(cantidadText);

      // Total
      cellX += colWidths[2];
      const totalText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      totalText.setAttribute('x', cellX.toString());
      totalText.setAttribute('y', rowY.toString());
      totalText.setAttribute('font-size', '14');
      totalText.setAttribute('font-weight', 'bold');
      totalText.setAttribute('font-family', 'monospace');
      totalText.setAttribute('fill', roughColors.azul);
      totalText.setAttribute('class', 'rough-text');
      totalText.textContent = `${moneda} ${(fila.total || 0).toFixed(2)}`;
      svgRef.current?.appendChild(totalText);

      currentY += rowHeight;
    });

    // Fila de total
    if (mostrarTotal) {
      currentY += 5;
      const totalLine = rc.line(10, currentY, tableWidth + 10, currentY, {
        stroke: roughColors.azul,
        strokeWidth: 2,
        roughness: 0.8
      });
      svgRef.current.appendChild(totalLine);

      const totalY = currentY + 30;
      
      const totalLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      totalLabel.setAttribute('x', (padding + 10).toString());
      totalLabel.setAttribute('y', totalY.toString());
      totalLabel.setAttribute('font-size', '15');
      totalLabel.setAttribute('font-weight', 'bold');
      totalLabel.setAttribute('fill', '#2C3E50');
      totalLabel.setAttribute('class', 'rough-text');
      totalLabel.textContent = 'Total a pagar:';
      svgRef.current?.appendChild(totalLabel);

      const totalValue = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      totalValue.setAttribute('x', (padding + colWidths[0] + colWidths[1] + colWidths[2] + 10).toString());
      totalValue.setAttribute('y', totalY.toString());
      totalValue.setAttribute('font-size', '17');
      totalValue.setAttribute('font-weight', 'bold');
      totalValue.setAttribute('font-family', 'monospace');
      totalValue.setAttribute('fill', roughColors.verde);
      totalValue.setAttribute('class', 'rough-text');
      totalValue.textContent = `${moneda} ${total.toFixed(2)}`;
      svgRef.current?.appendChild(totalValue);
    }

    svgRef.current.setAttribute('width', (tableWidth + 30).toString());
    svgRef.current.setAttribute('height', (tableHeight + 20).toString());
  }, [elementos, moneda, mostrarTotal, total]);

  return (
    <div className="tabla-precios">
      <svg ref={svgRef} className="tabla-svg" />
    </div>
  );
};
