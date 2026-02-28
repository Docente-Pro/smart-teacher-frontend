import React from 'react';
import type { GraficoOrganizadorKVL } from '../../../domain/types/graficos-areas.types';
import { resolveColor } from '../../hooks/useRoughSVG';

interface Props {
  data: GraficoOrganizadorKVL;
}

/**
 * Organizador KVL — Comunicación
 * Tres columnas: ¿Qué SÉ? / ¿Qué QUIERO saber? / ¿Qué APRENDÍ?
 */
export const OrganizadorKVL: React.FC<Props> = ({ data }) => {
  const { tema, columnas } = data;

  return (
    <div className="space-y-3">
      {tema && (
        <p className="text-center text-sm font-medium text-gray-600">
          Tema: <span className="font-semibold text-gray-800">{tema}</span>
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columnas.map((col, idx) => {
          const c = resolveColor(col.color);
          return (
          <div
            key={idx}
            className="rounded-xl border-2 overflow-visible shadow-sm"
            style={{ borderColor: c }}
          >
            {/* Encabezado */}
            <div
              className="flex items-center gap-2 px-4 py-3"
              style={{ background: c, color: '#fff' }}
            >
              <span className="text-xl">{col.icono}</span>
              <h4 className="font-bold text-sm">{col.encabezado}</h4>
            </div>

            {/* Items */}
            <div className="p-4 min-h-[120px] bg-white">
              {col.items.length > 0 ? (
                <ul className="space-y-2">
                  {col.items.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <span className="mt-0.5 text-xs" style={{ color: c }}>●</span>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs italic text-gray-400 text-center mt-4">
                  (Se completa en clase)
                </p>
              )}
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
};
