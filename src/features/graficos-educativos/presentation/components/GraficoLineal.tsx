import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoLineal as GraficoLinealType } from '../../domain/types';
import { roughColors, defaultRoughConfig, resolveColor } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoLinealType;
}

const COLORES_SERIE = [roughColors.azul, roughColors.rojo, roughColors.verde, roughColors.naranja, roughColors.morado];

export const GraficoLinealComp: React.FC<Props> = ({ data }) => {
  const { series, ejeX, ejeY, mostrarPuntos = true } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || series.length === 0) return;
    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const padding = 60;
    const chartW = 500;
    const chartH = 300;
    const axisX = padding;
    const axisY = chartH - padding;

    // Normalizar series: aceptar tanto 'puntos' como 'datos' (array de números)
    const seriesNorm = series.map(s => {
      const sAny = s as any;
      if (s.puntos && Array.isArray(s.puntos)) return s;
      if (sAny.datos && Array.isArray(sAny.datos)) {
        return { ...s, puntos: sAny.datos.map((v: number, i: number) => ({ x: i, y: v })) };
      }
      return { ...s, puntos: [] };
    });

    // Encontrar max Y
    const allYVals = seriesNorm.flatMap(s => (s.puntos || []).map((p: {x: number | string; y: number}) => p.y));
    if (allYVals.length === 0) return;
    const maxY = ejeY?.maximo || Math.ceil(Math.max(...allYVals) * 1.1);
    const intervaloY = ejeY?.intervalo || Math.ceil(maxY / 5);

    // Encontrar etiquetas X
    const allXLabels = ejeX?.etiquetas || seriesNorm[0].puntos.map((p: {x: number | string; y: number}) => String(p.x));
    const numPoints = allXLabels.length;

    // Eje Y
    svgRef.current.appendChild(rc.line(axisX, padding - 10, axisX, axisY + 5, { stroke: '#2C3E50', strokeWidth: 2, roughness: 0.8 }));
    // Eje X
    svgRef.current.appendChild(rc.line(axisX - 5, axisY, chartW - padding / 2, axisY, { stroke: '#2C3E50', strokeWidth: 2, roughness: 0.8 }));

    // Marcas Y
    const yRange = chartH - padding * 2;
    for (let v = 0; v <= maxY; v += intervaloY) {
      const yPos = axisY - (v / maxY) * yRange;
      svgRef.current.appendChild(rc.line(axisX - 5, yPos, axisX + 5, yPos, { stroke: '#2C3E50', strokeWidth: 1.5, roughness: 0.5 }));
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', (axisX - 10).toString());
      t.setAttribute('y', (yPos + 4).toString());
      t.setAttribute('text-anchor', 'end');
      t.setAttribute('font-size', '11');
      t.setAttribute('font-family', 'Comic Sans MS, cursive');
      t.setAttribute('fill', '#64748b');
      t.textContent = v.toString();
      svgRef.current.appendChild(t);
    }

    // Etiquetas X
    const xStep = (chartW - padding * 2) / Math.max(numPoints - 1, 1);
    allXLabels.forEach((label: string, i: number) => {
      const x = axisX + i * xStep;
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', x.toString());
      t.setAttribute('y', (axisY + 20).toString());
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('font-size', '11');
      t.setAttribute('font-family', 'Comic Sans MS, cursive');
      t.setAttribute('fill', '#64748b');
      t.textContent = label;
      svgRef.current!.appendChild(t);
    });

    // Series
    seriesNorm.forEach((serie, sIdx) => {
      const color = resolveColor(serie.color) || COLORES_SERIE[sIdx % COLORES_SERIE.length];
      const puntos = serie.puntos;

      for (let i = 0; i < puntos.length - 1; i++) {
        const x1 = axisX + i * xStep;
        const y1 = axisY - (puntos[i].y / maxY) * yRange;
        const x2 = axisX + (i + 1) * xStep;
        const y2 = axisY - (puntos[i + 1].y / maxY) * yRange;

        svgRef.current!.appendChild(rc.line(x1, y1, x2, y2, { stroke: color, strokeWidth: 3, roughness: 0.8 }));
      }

      if (mostrarPuntos) {
        puntos.forEach((p: {x: number | string; y: number}, i: number) => {
          const x = axisX + i * xStep;
          const y = axisY - (p.y / maxY) * yRange;
          svgRef.current!.appendChild(rc.circle(x, y, 10, { fill: color, fillStyle: 'solid', stroke: color, strokeWidth: 2, roughness: 0.5 }));
        });
      }
    });

    // Títulos de ejes
    if (ejeY?.titulo) {
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', '15');
      t.setAttribute('y', ((padding + axisY) / 2).toString());
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('font-size', '12');
      t.setAttribute('font-weight', 'bold');
      t.setAttribute('font-family', 'Comic Sans MS, cursive');
      t.setAttribute('fill', '#1e293b');
      t.setAttribute('transform', `rotate(-90, 15, ${(padding + axisY) / 2})`);
      t.textContent = ejeY.titulo;
      svgRef.current.appendChild(t);
    }
    if (ejeX?.titulo) {
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', ((axisX + chartW - padding) / 2).toString());
      t.setAttribute('y', (axisY + 45).toString());
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('font-size', '12');
      t.setAttribute('font-weight', 'bold');
      t.setAttribute('font-family', 'Comic Sans MS, cursive');
      t.setAttribute('fill', '#1e293b');
      t.textContent = ejeX.titulo;
      svgRef.current.appendChild(t);
    }
  }, [data]);

  return (
    <div className="grafico-lineal-container" style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
      <svg ref={svgRef} viewBox="0 0 500 300" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: '500px', height: 'auto' }} />
    </div>
  );
};
