import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoCajaFuncion } from '../../domain/types';
import { roughColors, defaultRoughConfig } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoCajaFuncion;
}

export const CajaFuncion: React.FC<Props> = ({ data }) => {
  const { regla, pares, incognitas = [], mostrarRegla = true } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  const svgW = 520;
  const centerX = svgW / 2;
  const machineW = 150;
  const machineH = 60;
  const machineY = 30;

  // Tuberías verticales (bajan de la máquina a los pares)
  const pipeLeftX = centerX - machineW / 2;
  const pipeRightX = centerX + machineW / 2;

  const pairsStartY = machineY + machineH + 50;
  const pairSpacing = 52;

  const entryBoxX = 30;
  const entryBoxW = 70;
  const exitBoxX = svgW - 100;
  const exitBoxW = 70;

  useEffect(() => {
    if (!svgRef.current || pares.length === 0) return;
    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    // ── Máquina ──
    svgRef.current.appendChild(rc.rectangle(centerX - machineW / 2, machineY, machineW, machineH, {
      ...defaultRoughConfig, stroke: roughColors.morado, fill: roughColors.morado, fillStyle: 'solid', strokeWidth: 3, roughness: 0.8,
    }));

    // Texto centrado dentro de la máquina: ⚙️ + regla
    const machineMidY = machineY + machineH / 2 + 6;
    const labelText = mostrarRegla ? `⚙️  ${regla}` : '⚙️';
    const mLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    mLabel.setAttribute('x', centerX.toString());
    mLabel.setAttribute('y', machineMidY.toString());
    mLabel.setAttribute('text-anchor', 'middle');
    mLabel.setAttribute('font-size', '15');
    mLabel.setAttribute('font-weight', 'bold');
    mLabel.setAttribute('font-family', 'Comic Sans MS, cursive');
    mLabel.setAttribute('fill', '#fff');
    mLabel.textContent = labelText;
    svgRef.current.appendChild(mLabel);

    // ── Tuberías verticales ──
    const lastPairY = pairsStartY + (pares.length - 1) * pairSpacing + 15;

    // Tubería izquierda (entrada)
    svgRef.current.appendChild(rc.line(pipeLeftX, machineY + machineH, pipeLeftX, lastPairY, {
      stroke: roughColors.azul, strokeWidth: 2.5, roughness: 0.6,
    }));
    // Tubería derecha (salida)
    svgRef.current.appendChild(rc.line(pipeRightX, machineY + machineH, pipeRightX, lastPairY, {
      stroke: roughColors.rojo, strokeWidth: 2.5, roughness: 0.6,
    }));

    // ── Labels ──
    const labIn = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    labIn.setAttribute('x', (entryBoxX + entryBoxW / 2).toString());
    labIn.setAttribute('y', (pairsStartY - 12).toString());
    labIn.setAttribute('text-anchor', 'middle');
    labIn.setAttribute('font-size', '13');
    labIn.setAttribute('font-weight', 'bold');
    labIn.setAttribute('font-family', 'Comic Sans MS, cursive');
    labIn.setAttribute('fill', roughColors.azul);
    labIn.textContent = 'Entrada';
    svgRef.current.appendChild(labIn);

    const labOut = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    labOut.setAttribute('x', (exitBoxX + exitBoxW / 2).toString());
    labOut.setAttribute('y', (pairsStartY - 12).toString());
    labOut.setAttribute('text-anchor', 'middle');
    labOut.setAttribute('font-size', '13');
    labOut.setAttribute('font-weight', 'bold');
    labOut.setAttribute('font-family', 'Comic Sans MS, cursive');
    labOut.setAttribute('fill', roughColors.rojo);
    labOut.textContent = 'Salida';
    svgRef.current.appendChild(labOut);

    // ── Pares entrada → salida ──
    pares.forEach((par, idx) => {
      const y = pairsStartY + idx * pairSpacing;
      const midY = y + 15;
      const esIncognita = incognitas.includes(idx);

      // — Caja de entrada —
      svgRef.current!.appendChild(rc.rectangle(entryBoxX, y, entryBoxW, 30, {
        ...defaultRoughConfig, stroke: roughColors.azul, fill: roughColors.azul, fillStyle: 'solid', strokeWidth: 2, roughness: 0.8,
      }));

      const entText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      entText.setAttribute('x', (entryBoxX + entryBoxW / 2).toString());
      entText.setAttribute('y', (y + 21).toString());
      entText.setAttribute('text-anchor', 'middle');
      entText.setAttribute('font-size', '16');
      entText.setAttribute('font-weight', 'bold');
      entText.setAttribute('font-family', 'Comic Sans MS, cursive');
      entText.setAttribute('fill', '#fff');
      entText.textContent = par.entrada.toString();
      svgRef.current!.appendChild(entText);

      // Flecha entrada → tubería izquierda
      svgRef.current!.appendChild(rc.line(entryBoxX + entryBoxW + 4, midY, pipeLeftX, midY, {
        stroke: roughColors.azul, strokeWidth: 2, roughness: 0.8,
      }));
      // Punta de flecha
      svgRef.current!.appendChild(rc.polygon([
        [pipeLeftX - 2, midY],
        [pipeLeftX - 10, midY - 5],
        [pipeLeftX - 10, midY + 5],
      ], { fill: roughColors.azul, fillStyle: 'solid', strokeWidth: 1, roughness: 0.4 }));

      // Flecha tubería derecha → salida
      svgRef.current!.appendChild(rc.line(pipeRightX, midY, exitBoxX - 4, midY, {
        stroke: roughColors.rojo, strokeWidth: 2, roughness: 0.8,
      }));
      // Punta de flecha
      svgRef.current!.appendChild(rc.polygon([
        [exitBoxX - 2, midY],
        [exitBoxX - 10, midY - 5],
        [exitBoxX - 10, midY + 5],
      ], { fill: roughColors.rojo, fillStyle: 'solid', strokeWidth: 1, roughness: 0.4 }));

      // — Caja de salida —
      svgRef.current!.appendChild(rc.rectangle(exitBoxX, y, exitBoxW, 30, {
        ...defaultRoughConfig, stroke: roughColors.rojo, fill: esIncognita ? roughColors.amarillo : roughColors.rojo, fillStyle: 'solid', strokeWidth: 2, roughness: 0.8,
      }));

      const salText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      salText.setAttribute('x', (exitBoxX + exitBoxW / 2).toString());
      salText.setAttribute('y', (y + 21).toString());
      salText.setAttribute('text-anchor', 'middle');
      salText.setAttribute('font-size', '16');
      salText.setAttribute('font-weight', 'bold');
      salText.setAttribute('font-family', 'Comic Sans MS, cursive');
      salText.setAttribute('fill', esIncognita ? '#1e293b' : '#fff');
      salText.textContent = esIncognita ? '?' : par.salida.toString();
      svgRef.current!.appendChild(salText);
    });
  }, [data]);

  const height = pairsStartY + pares.length * pairSpacing + 20;

  return (
    <div className="caja-funcion-container" style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
      <svg ref={svgRef} viewBox={`0 0 ${svgW} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: `${svgW}px`, height: 'auto' }} />
    </div>
  );
};
