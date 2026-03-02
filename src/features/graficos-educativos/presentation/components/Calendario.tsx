import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoCalendario } from '../../domain/types';
import { roughColors, resolveColor } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoCalendario;
}

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

/* ── Helper: crear texto SVG ── */
function svgText(
  parent: SVGSVGElement,
  x: number, y: number, text: string,
  opts: { size?: number; weight?: string; fill?: string; anchor?: string } = {}
) {
  const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  t.setAttribute('x', x.toString());
  t.setAttribute('y', y.toString());
  t.setAttribute('text-anchor', opts.anchor ?? 'middle');
  t.setAttribute('font-size', (opts.size ?? 14).toString());
  t.setAttribute('font-weight', opts.weight ?? 'normal');
  t.setAttribute('font-family', 'Comic Sans MS, cursive');
  t.setAttribute('fill', opts.fill ?? '#334155');
  t.textContent = text;
  parent.appendChild(t);
  return t;
}

export const Calendario: React.FC<Props> = ({ data }) => {
  const {
    mes, anio,
    eventos = [],
    destacarDias = [],
    pregunta,
  } = data;

  const svgRef = useRef<SVGSVGElement>(null);

  // Layout
  const cellW = 56;
  const cellH = 44;
  const gap = 3;                                   // espacio entre celdas
  const margen = 24;
  const headerRowY = 70;                           // fila "Dom Lun Mar …"
  const headerRowH = 32;
  const gridStartY = headerRowY + headerRowH + gap;

  const primerDia = new Date(anio, mes - 1, 1).getDay();
  const diasEnMes = new Date(anio, mes, 0).getDate();
  const numRows = Math.ceil((primerDia + diasEnMes) / 7);

  // Mapas rápidos
  const eventosMap = new Map(eventos.map(e => [e.dia, e]));
  const destacarSet = new Set(destacarDias);

  // Leyenda: reunir items de eventos con texto
  const leyenda: { color: string; label: string }[] = [];
  eventos.forEach(e => {
    if (e.texto) leyenda.push({ color: resolveColor(e.color, roughColors.azul), label: e.texto });
  });

  const gridW = 7 * (cellW + gap) - gap;
  const svgW = gridW + margen * 2;

  const leyendaStartY = gridStartY + numRows * (cellH + gap) + 10;
  const leyendaH = leyenda.length > 0 ? 20 + leyenda.length * 22 : 0;
  const preguntaH = pregunta ? 30 : 0;
  const svgH = leyendaStartY + leyendaH + preguntaH + 16;

  useEffect(() => {
    if (!svgRef.current) return;
    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';
    const svg = svgRef.current;

    // ── Fondo general redondeado ──
    svg.appendChild(rc.rectangle(4, 4, svgW - 8, svgH - 8, {
      roughness: 0.4, strokeWidth: 2, stroke: '#cbd5e1',
      fill: '#f8fafc', fillStyle: 'solid',
    }));

    // ── Título del mes ──
    svgText(svg, svgW / 2, 46, `${MESES[mes - 1]} ${anio}`, {
      size: 22, weight: 'bold', fill: roughColors.azul,
    });

    // ── Fila de días de la semana ──
    DIAS_SEMANA.forEach((dia, i) => {
      const x = margen + i * (cellW + gap);
      svg.appendChild(rc.rectangle(x, headerRowY, cellW, headerRowH, {
        roughness: 0.5, strokeWidth: 1.5, stroke: roughColors.azul,
        fill: roughColors.azul, fillStyle: 'solid',
      }));
      svgText(svg, x + cellW / 2, headerRowY + headerRowH / 2 + 5, dia, {
        size: 12, weight: 'bold', fill: '#ffffff',
      });
    });

    // ── Celdas de días ──
    for (let d = 1; d <= diasEnMes; d++) {
      const pos = primerDia + d - 1;
      const col = pos % 7;
      const row = Math.floor(pos / 7);
      const x = margen + col * (cellW + gap);
      const y = gridStartY + row * (cellH + gap);

      const esFinDeSemana = col === 0 || col === 6;
      const evento = eventosMap.get(d);
      const esDestacadoSimple = destacarSet.has(d);
      // Evento puede tener destacado=true para resaltar extra
      const esEventoDestacado = evento?.destacado === true;

      // Determinar color de fondo
      let fillColor: string | undefined;
      let textColor = '#334155';
      let bold = false;

      if (esDestacadoSimple) {
        fillColor = roughColors.amarillo;
        textColor = '#92400e';
        bold = true;
      } else if (evento) {
        fillColor = resolveColor(evento.color, roughColors.azul);
        textColor = '#ffffff';
        bold = true;
      } else if (esFinDeSemana) {
        fillColor = '#e0f2fe';       // azul muy clarito
        textColor = '#1e40af';
      }

      // Celda
      svg.appendChild(rc.rectangle(x, y, cellW, cellH, {
        roughness: 0.6,
        strokeWidth: (fillColor ? 1.8 : 1) + (esEventoDestacado ? 1.5 : 0),
        stroke: fillColor ? fillColor : '#94a3b8',
        ...(fillColor ? { fill: fillColor, fillStyle: 'solid' as const } : {}),
      }));

      // Número del día
      svgText(svg, x + cellW / 2, y + cellH / 2 + 5, d.toString(), {
        size: 15, weight: bold ? 'bold' : 'normal', fill: textColor,
      });

      // Circulito indicador para eventos
      if (evento) {
        const dotColor = resolveColor(evento.color, roughColors.azul);
        svg.appendChild(rc.circle(x + cellW / 2, y + cellH - 6, 6, {
          roughness: 0.3, strokeWidth: 0, fill: '#ffffff', fillStyle: 'solid',
        }));
        svg.appendChild(rc.circle(x + cellW / 2, y + cellH - 6, 4, {
          roughness: 0.2, strokeWidth: 0, fill: dotColor, fillStyle: 'solid',
        }));
      }
    }

    // ── Leyenda ──
    if (leyenda.length > 0) {
      let ly = leyendaStartY + 6;
      leyenda.forEach(item => {
        svg.appendChild(rc.rectangle(margen + 4, ly - 8, 14, 14, {
          roughness: 0.4, strokeWidth: 1, stroke: item.color,
          fill: item.color, fillStyle: 'solid',
        }));
        svgText(svg, margen + 26, ly + 3, item.label, {
          size: 12, anchor: 'start', fill: '#475569',
        });
        ly += 22;
      });
    }

    // ── Pregunta ──
    if (pregunta) {
      const py = leyendaStartY + leyendaH + 14;
      svgText(svg, svgW / 2, py, pregunta, {
        size: 14, fill: '#64748b',
      });
    }
  }, [data]);

  return (
    <div className="calendario-container" style={{
      padding: 16, background: '#fff', borderRadius: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)', margin: '16px 0',
      display: 'flex', justifyContent: 'center',
    }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${svgW} ${svgH}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', maxWidth: `${svgW}px`, height: 'auto' }}
      />
    </div>
  );
};
