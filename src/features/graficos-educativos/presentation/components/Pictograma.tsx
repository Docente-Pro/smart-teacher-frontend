import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoPictograma } from '../../domain/types';
import { roughColors, defaultRoughConfig } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoPictograma;
}

export const Pictograma: React.FC<Props> = ({ data }) => {
  const { elementos, iconoBase = '⭐', valorIcono = 1, mostrarLeyenda = true } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || elementos.length === 0) return;
    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const filaHeight = 50;
    const margenIzq = 120;
    const margenTop = 30;
    const iconoSize = 30;
    const maxIconos = Math.max(...elementos.map(e => Math.ceil(e.cantidad / valorIcono)));

    elementos.forEach((fila, idx) => {
      const y = margenTop + idx * filaHeight;
      const color = fila.color || [roughColors.azul, roughColors.rojo, roughColors.verde, roughColors.naranja][idx % 4];

      // Etiqueta de categoría
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', (margenIzq - 10).toString());
      label.setAttribute('y', (y + filaHeight / 2 + 5).toString());
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('font-size', '14');
      label.setAttribute('font-weight', 'bold');
      label.setAttribute('font-family', 'Comic Sans MS, cursive');
      label.setAttribute('fill', '#1e293b');
      label.textContent = fila.categoria;
      svgRef.current!.appendChild(label);

      // Íconos
      const numIconos = Math.floor(fila.cantidad / valorIcono);
      const fraccion = (fila.cantidad % valorIcono) / valorIcono;

      for (let i = 0; i < numIconos; i++) {
        const ix = margenIzq + i * (iconoSize + 8);
        const iconText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        iconText.setAttribute('x', ix.toString());
        iconText.setAttribute('y', (y + filaHeight / 2 + 8).toString());
        iconText.setAttribute('font-size', '22');
        iconText.textContent = fila.icono || iconoBase;
        svgRef.current!.appendChild(iconText);
      }

      // Medio ícono si hay fracción
      if (fraccion > 0) {
        const ix = margenIzq + numIconos * (iconoSize + 8);
        const halfIcon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        halfIcon.setAttribute('x', ix.toString());
        halfIcon.setAttribute('y', (y + filaHeight / 2 + 8).toString());
        halfIcon.setAttribute('font-size', '22');
        halfIcon.setAttribute('opacity', '0.5');
        halfIcon.textContent = fila.icono || iconoBase;
        svgRef.current!.appendChild(halfIcon);
      }

      // Valor numérico
      const numText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      const totalIconos = numIconos + (fraccion > 0 ? 1 : 0);
      numText.setAttribute('x', (margenIzq + totalIconos * (iconoSize + 8) + 10).toString());
      numText.setAttribute('y', (y + filaHeight / 2 + 6).toString());
      numText.setAttribute('font-size', '14');
      numText.setAttribute('font-weight', 'bold');
      numText.setAttribute('font-family', 'Comic Sans MS, cursive');
      numText.setAttribute('fill', color);
      numText.textContent = fila.cantidad.toString();
      svgRef.current!.appendChild(numText);
    });

    // Leyenda
    if (mostrarLeyenda) {
      const ly = margenTop + elementos.length * filaHeight + 15;
      const leyendaText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      leyendaText.setAttribute('x', margenIzq.toString());
      leyendaText.setAttribute('y', ly.toString());
      leyendaText.setAttribute('font-size', '13');
      leyendaText.setAttribute('font-family', 'Comic Sans MS, cursive');
      leyendaText.setAttribute('fill', '#64748b');
      leyendaText.textContent = `${iconoBase} = ${valorIcono}`;
      svgRef.current.appendChild(leyendaText);
    }
  }, [data]);

  const width = 120 + Math.max(...elementos.map(e => Math.ceil(e.cantidad / valorIcono))) * 38 + 80;
  const height = 30 + elementos.length * 50 + (mostrarLeyenda ? 40 : 10);

  return (
    <div className="pictograma-container" style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: `${width}px`, height: 'auto' }} />
    </div>
  );
};
