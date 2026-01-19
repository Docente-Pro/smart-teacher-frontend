import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { GraficoBalanzaEquilibrio, ColorGrafico } from '../../domain/types';

interface Props {
  data: GraficoBalanzaEquilibrio;
}

/**
 * Componente de Balanza de Equilibrio
 * Representa visualmente una balanza con cubos de colores para enseñar conceptos de igualdad
 * 
 * @example
 * // Igualdad simple: 7 = 7
 * <BalanzaEquilibrio data={{
 *   ladoIzquierdo: { cantidad: 7, color: "azul", etiqueta: "7 cubos" },
 *   ladoDerecho: { cantidad: 7, color: "naranja", etiqueta: "7 cubos" },
 *   estado: "equilibrio"
 * }} />
 */
export const BalanzaEquilibrio: React.FC<Props> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    ladoIzquierdo,
    ladoDerecho,
    estado,
    mostrarEcuacion = true,
    pregunta
  } = data;

  // Calcular el estado real basado en las cantidades
  // El lado con más peso BAJA
  const estadoReal = ladoIzquierdo.cantidad === ladoDerecho.cantidad 
    ? 'equilibrio'
    : ladoIzquierdo.cantidad > ladoDerecho.cantidad
    ? 'inclinada_izquierda'
    : 'inclinada_derecha';

  // Mapeo de colores
  const colorMap: Record<ColorGrafico, string> = {
    [ColorGrafico.AZUL]: '#3B82F6',
    [ColorGrafico.NARANJA]: '#F97316',
    [ColorGrafico.ROJO]: '#EF4444',
    [ColorGrafico.VERDE]: '#10B981',
    [ColorGrafico.AMARILLO]: '#F59E0B',
    [ColorGrafico.MORADO]: '#A855F7',
    [ColorGrafico.NEUTRO]: '#6B7280'
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar canvas
    const width = 800;
    const height = 600;
    canvas.width = width;
    canvas.height = height;

    const rc = rough.canvas(canvas);

    // Limpiar canvas
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, width, height);

    // Configuración de posiciones
    const balanzaY = 380;
    const platoWidth = 140;
    const platoHeight = 12;
    const cuboSize = 24;
    
    // Calcular inclinación basado en estadoReal (ya calculado fuera del useEffect)
    // El lado con más peso BAJA (desplazamiento vertical positivo)
    let anguloIzq = 0;
    let anguloDer = 0;
    let desplazamientoVertical = 0;
    
    if (estadoReal === 'inclinada_izquierda') {
      // Lado izquierdo tiene más peso, baja
      anguloIzq = 0.2;
      anguloDer = -0.2;
      desplazamientoVertical = 40;
    } else if (estadoReal === 'inclinada_derecha') {
      // Lado derecho tiene más peso, baja
      anguloIzq = -0.2;
      anguloDer = 0.2;
      desplazamientoVertical = 40;
    }

    // Función para dibujar cubos apilados verticalmente
    const dibujarCubos = (
      x: number,
      y: number,
      cantidad: number,
      color: ColorGrafico,
      angulo: number
    ) => {
      if (cantidad === 0) return 0;
      
      const espaciado = 2;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angulo);
      
      for (let i = 0; i < cantidad; i++) {
        const cuboX = -cuboSize / 2;
        const cuboY = -(i + 1) * (cuboSize + espaciado);
        
        rc.rectangle(cuboX, cuboY, cuboSize - 2, cuboSize - 2, {
          fill: colorMap[color],
          fillStyle: 'solid',
          stroke: '#1F2937',
          strokeWidth: 2,
          roughness: 0.8,
          fillWeight: 3
        });
      }
      
      ctx.restore();
      return cantidad * (cuboSize + espaciado);
    };

    // Dibujar base (triángulo mejorado)
    const baseX = width / 2;
    const baseY = balanzaY + 120;
    const baseWidth = 80;
    const baseHeight = 100;

    // Sombra de la base
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    
    rc.polygon([
      [baseX, baseY - baseHeight],
      [baseX - baseWidth / 2, baseY],
      [baseX + baseWidth / 2, baseY]
    ], {
      fill: '#DC2626',
      fillStyle: 'solid',
      stroke: '#991B1B',
      strokeWidth: 3,
      roughness: 0.8
    });
    
    ctx.restore();

    // Posiciones de los platos
    const platoIzqX = 200;
    const platoIzqY = balanzaY + (estadoReal === 'inclinada_izquierda' ? desplazamientoVertical : estadoReal === 'inclinada_derecha' ? -desplazamientoVertical : 0);
    const platoDerX = 600;
    const platoDerY = balanzaY + (estadoReal === 'inclinada_derecha' ? desplazamientoVertical : estadoReal === 'inclinada_izquierda' ? -desplazamientoVertical : 0);

    // Dibujar barra principal (mejorada)
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 8;
    
    rc.line(platoIzqX, platoIzqY + platoHeight / 2, platoDerX, platoDerY + platoHeight / 2, {
      stroke: '#374151',
      strokeWidth: 8,
      roughness: 0.5
    });
    
    ctx.restore();

    // Soporte central
    rc.line(baseX, balanzaY, baseX, baseY - baseHeight, {
      stroke: '#374151',
      strokeWidth: 6,
      roughness: 0.5
    });

    // Dibujar plato izquierdo con sombra
    ctx.save();
    ctx.translate(platoIzqX, platoIzqY);
    ctx.rotate(anguloIzq);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 8;
    
    rc.rectangle(-platoWidth / 2, 0, platoWidth, platoHeight, {
      fill: '#DC2626',
      fillStyle: 'solid',
      stroke: '#991B1B',
      strokeWidth: 2.5,
      roughness: 0.8
    });
    
    // Varilla soporte izquierda
    rc.line(0, platoHeight / 2, 0, -30, {
      stroke: '#374151',
      strokeWidth: 4,
      roughness: 0.5
    });
    
    ctx.restore();

    // Dibujar plato derecho con sombra
    ctx.save();
    ctx.translate(platoDerX, platoDerY);
    ctx.rotate(anguloDer);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 8;
    
    rc.rectangle(-platoWidth / 2, 0, platoWidth, platoHeight, {
      fill: '#DC2626',
      fillStyle: 'solid',
      stroke: '#991B1B',
      strokeWidth: 2.5,
      roughness: 0.8
    });
    
    // Varilla soporte derecha
    rc.line(0, platoHeight / 2, 0, -30, {
      stroke: '#374151',
      strokeWidth: 4,
      roughness: 0.5
    });
    
    ctx.restore();

    // Dibujar cubos
    const alturaCubosIzq = dibujarCubos(platoIzqX, platoIzqY, ladoIzquierdo.cantidad, ladoIzquierdo.color, anguloIzq);
    const alturaCubosDer = dibujarCubos(platoDerX, platoDerY, ladoDerecho.cantidad, ladoDerecho.color, anguloDer);

    // Etiquetas con mejor diseño
    if (ladoIzquierdo.etiqueta) {
      ctx.save();
      ctx.translate(platoIzqX, platoIzqY - alturaCubosIzq - 40);
      ctx.rotate(anguloIzq);
      ctx.fillStyle = '#1F2937';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ladoIzquierdo.etiqueta, 0, 0);
      ctx.restore();
    }
    
    if (ladoDerecho.etiqueta) {
      ctx.save();
      ctx.translate(platoDerX, platoDerY - alturaCubosDer - 40);
      ctx.rotate(anguloDer);
      ctx.fillStyle = '#1F2937';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ladoDerecho.etiqueta, 0, 0);
      ctx.restore();
    }

    // Dibujar flechas indicadoras de movimiento
    if (estadoReal !== 'equilibrio') {
      const flechaSize = 30;
      
      // Flecha lado que baja
      if (estadoReal === 'inclinada_izquierda') {
        ctx.fillStyle = '#F97316';
        ctx.beginPath();
        ctx.moveTo(platoIzqX - 80, platoIzqY + 40);
        ctx.lineTo(platoIzqX - 80 - flechaSize/2, platoIzqY + 40 - flechaSize);
        ctx.lineTo(platoIzqX - 80 + flechaSize/2, platoIzqY + 40 - flechaSize);
        ctx.fill();
      } else {
        ctx.fillStyle = '#F97316';
        ctx.beginPath();
        ctx.moveTo(platoDerX + 80, platoDerY + 40);
        ctx.lineTo(platoDerX + 80 - flechaSize/2, platoDerY + 40 - flechaSize);
        ctx.lineTo(platoDerX + 80 + flechaSize/2, platoDerY + 40 - flechaSize);
        ctx.fill();
      }
      
      // Flecha lado que sube
      if (estadoReal === 'inclinada_izquierda') {
        ctx.fillStyle = '#3B82F6';
        ctx.beginPath();
        ctx.moveTo(platoDerX + 80, platoDerY - 40);
        ctx.lineTo(platoDerX + 80 - flechaSize/2, platoDerY - 40 + flechaSize);
        ctx.lineTo(platoDerX + 80 + flechaSize/2, platoDerY - 40 + flechaSize);
        ctx.fill();
      } else {
        ctx.fillStyle = '#3B82F6';
        ctx.beginPath();
        ctx.moveTo(platoIzqX - 80, platoIzqY - 40);
        ctx.lineTo(platoIzqX - 80 - flechaSize/2, platoIzqY - 40 + flechaSize);
        ctx.lineTo(platoIzqX - 80 + flechaSize/2, platoIzqY - 40 + flechaSize);
        ctx.fill();
      }
    }

  }, [data, estadoReal, colorMap]);

  return (
    <div className="balanza-equilibrio-container">
      {/* Pregunta */}
      {pregunta && (
        <div className="bg-blue-100 dark:bg-blue-950 px-6 py-3 rounded-lg border-2 border-blue-300 dark:border-blue-700 mb-6">
          <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
            {pregunta}
          </p>
        </div>
      )}

      {/* Canvas */}
      <div className="flex justify-center">
        <canvas 
          ref={canvasRef} 
          className="max-w-full h-auto"
        />
      </div>

      {/* Ecuación visual mejorada */}
      {mostrarEcuacion && (
        <div className="mt-8 flex flex-col items-center gap-4">
          {/* Cajas estilo imagen de referencia */}
          <div className="flex items-center justify-center gap-3">
            {/* Caja lado izquierdo */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600 px-6 py-4 shadow-md min-w-[100px] flex items-center justify-center">
              <span className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                {ladoIzquierdo.cantidad === 0 ? '?' : ladoIzquierdo.cantidad}
              </span>
            </div>

            {/* Símbolo de igualdad */}
            <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">=</div>

            {/* Caja lado derecho con operaciones */}
            {ladoDerecho.representacion ? (
              <div className="flex items-center gap-2">
                {ladoDerecho.representacion.split('+').map((parte, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && (
                      <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">+</span>
                    )}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600 px-6 py-4 shadow-md min-w-[80px] flex items-center justify-center">
                      <span className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                        {parte.trim() === '0' ? '?' : parte.trim()}
                      </span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600 px-6 py-4 shadow-md min-w-[100px] flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                  {ladoDerecho.cantidad === 0 ? '?' : ladoDerecho.cantidad}
                </span>
              </div>
            )}
          </div>

          {/* Indicador de estado */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
            estadoReal === 'equilibrio' 
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 border-2 border-green-300 dark:border-green-700' 
              : ladoIzquierdo.cantidad === 0 || ladoDerecho.cantidad === 0
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 border-2 border-blue-300 dark:border-blue-700'
              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 border-2 border-red-300 dark:border-red-700'
          }`}>
            {estadoReal === 'equilibrio' && (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>¡Equilibrio perfecto!</span>
              </>
            )}
            {estadoReal !== 'equilibrio' && (ladoIzquierdo.cantidad === 0 || ladoDerecho.cantidad === 0) && (
              <>
                <HelpCircle className="w-5 h-5" />
                <span>¿Cuál es el número que falta?</span>
              </>
            )}
            {estadoReal !== 'equilibrio' && ladoIzquierdo.cantidad > 0 && ladoDerecho.cantidad > 0 && (
              <>
                <XCircle className="w-5 h-5" />
                <span>
                  No está en equilibrio: {ladoIzquierdo.cantidad} {
                    ladoIzquierdo.cantidad > ladoDerecho.cantidad ? '>' : '<'
                  } {ladoDerecho.cantidad}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
