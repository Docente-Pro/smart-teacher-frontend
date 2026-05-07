import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoPictograma, type FilaPictograma } from '../../domain/types';

function etiquetaFilaPictograma(fila: FilaPictograma): string {
  return String(fila.nombre ?? fila.categoria ?? '');
}
import { roughColors, defaultRoughConfig, resolveColor } from '../hooks/useRoughSVG';
import { estimateTextWidth, createSVGText } from '../utils/svgTextUtils';

interface Props {
  data: GraficoPictograma;
}

export const Pictograma: React.FC<Props> = ({ data }) => {
  const { elementos, iconoBase = '⭐', valorIcono = 1, mostrarLeyenda = true, orientacion = 'horizontal' } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !elementos?.length) return;
    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const filaHeight = 50;
    // Margen izquierdo dinámico según la categoría más larga
    const allCats = elementos.map(etiquetaFilaPictograma);
    const maxCatW = Math.max(...allCats.map(c => estimateTextWidth(c, 14)));
    const margenIzq = Math.max(120, maxCatW + 20);
    const margenTop = 30;
    const iconoSize = 30;
    const maxIconos = Math.max(...elementos.map(e => Math.ceil(e.cantidad / valorIcono)));

    elementos.forEach((fila, idx) => {
      const y = margenTop + idx * filaHeight;
      const color = resolveColor(fila.color) || [roughColors.azul, roughColors.rojo, roughColors.verde, roughColors.naranja][idx % 4];

      // Etiqueta de categoría
      const labelEl = createSVGText({
        x: margenIzq - 10, y: y + filaHeight / 2 + 5, text: etiquetaFilaPictograma(fila),
        fontSize: 14, fontWeight: '700', fill: '#1e293b',
        textAnchor: 'end', maxCharsPerLine: 20, lineHeight: 16,
      });
      svgRef.current!.appendChild(labelEl);

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

  if (!elementos?.length) {
    return (
      <div className="pictograma-container" style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', margin: '16px 0', color: '#64748b', fontSize: 14 }}>
        Sin datos para el pictograma.
      </div>
    );
  }

  const allCats = elementos.map(etiquetaFilaPictograma);
  const maxCatW = Math.max(...allCats.map(c => estimateTextWidth(c, 14)));
  const dynMargenIzq = Math.max(120, maxCatW + 20);
  const maxIconosFila = Math.max(...elementos.map(e => Math.ceil(e.cantidad / valorIcono)), 1);
  const width = dynMargenIzq + maxIconosFila * 38 + 80;
  const height = 30 + elementos.length * 50 + (mostrarLeyenda ? 40 : 10);

  return (
    <div className="pictograma-container" style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: `${width}px`, height: 'auto' }} />
    </div>
  );
};
