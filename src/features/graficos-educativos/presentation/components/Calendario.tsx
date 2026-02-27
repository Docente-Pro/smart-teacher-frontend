import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoCalendario } from '../../domain/types';
import { roughColors, defaultRoughConfig } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoCalendario;
}

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export const Calendario: React.FC<Props> = ({ data }) => {
  const { mes, anio, eventos = [], destacarDias = [], pregunta } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const cellW = 50;
    const cellH = 40;
    const margen = 20;
    const headerH = 60;

    // Título del mes
    const titulo = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    titulo.setAttribute('x', (margen + 7 * cellW / 2).toString());
    titulo.setAttribute('y', '30');
    titulo.setAttribute('text-anchor', 'middle');
    titulo.setAttribute('font-size', '20');
    titulo.setAttribute('font-weight', 'bold');
    titulo.setAttribute('font-family', 'Comic Sans MS, cursive');
    titulo.setAttribute('fill', roughColors.azul);
    titulo.textContent = `${MESES[mes - 1]} ${anio}`;
    svgRef.current.appendChild(titulo);

    // Días de la semana
    DIAS_SEMANA.forEach((dia, i) => {
      const x = margen + i * cellW;
      svgRef.current!.appendChild(rc.rectangle(x, headerH, cellW, cellH, {
        ...defaultRoughConfig, stroke: roughColors.azul, fill: roughColors.azul, fillStyle: 'solid', strokeWidth: 2, roughness: 0.8,
      }));
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', (x + cellW / 2).toString());
      t.setAttribute('y', (headerH + cellH / 2 + 5).toString());
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('font-size', '12');
      t.setAttribute('font-weight', 'bold');
      t.setAttribute('font-family', 'Comic Sans MS, cursive');
      t.setAttribute('fill', '#1e293b');
      t.textContent = dia;
      svgRef.current!.appendChild(t);
    });

    // Calcular primer día del mes
    const primerDia = new Date(anio, mes - 1, 1).getDay();
    const diasEnMes = new Date(anio, mes, 0).getDate();

    const eventosMap = new Map(eventos.map(e => [e.dia, e]));

    for (let d = 1; d <= diasEnMes; d++) {
      const pos = primerDia + d - 1;
      const col = pos % 7;
      const row = Math.floor(pos / 7);
      const x = margen + col * cellW;
      const y = headerH + cellH + row * cellH;

      const esDestacado = destacarDias.includes(d);
      const evento = eventosMap.get(d);

      const fill = esDestacado ? roughColors.amarillo : (evento?.color || undefined);
      svgRef.current.appendChild(rc.rectangle(x, y, cellW, cellH, {
        ...defaultRoughConfig,
        strokeWidth: 1.5,
        roughness: 0.8,
        ...(fill ? { fill, fillStyle: 'solid' as const } : {}),
      }));

      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', (x + cellW / 2).toString());
      t.setAttribute('y', (y + cellH / 2 + 5).toString());
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('font-size', '14');
      t.setAttribute('font-weight', esDestacado ? 'bold' : 'normal');
      t.setAttribute('font-family', 'Comic Sans MS, cursive');
      t.setAttribute('fill', esDestacado ? roughColors.rojo : '#1e293b');
      t.textContent = d.toString();
      svgRef.current.appendChild(t);
    }

    // Pregunta
    if (pregunta) {
      const numRows = Math.ceil((primerDia + diasEnMes) / 7);
      const py = headerH + cellH + numRows * cellH + 25;
      const pt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      pt.setAttribute('x', (margen + 7 * cellW / 2).toString());
      pt.setAttribute('y', py.toString());
      pt.setAttribute('text-anchor', 'middle');
      pt.setAttribute('font-size', '14');
      pt.setAttribute('font-family', 'Comic Sans MS, cursive');
      pt.setAttribute('fill', '#64748b');
      pt.textContent = pregunta;
      svgRef.current.appendChild(pt);
    }
  }, [data]);

  const primerDia = new Date(anio, mes - 1, 1).getDay();
  const diasEnMes = new Date(anio, mes, 0).getDate();
  const numRows = Math.ceil((primerDia + diasEnMes) / 7);
  const width = 7 * 50 + 40;
  const height = 60 + 40 + numRows * 40 + (pregunta ? 45 : 20);

  return (
    <div className="calendario-container" style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: `${width}px`, height: 'auto' }} />
    </div>
  );
};
