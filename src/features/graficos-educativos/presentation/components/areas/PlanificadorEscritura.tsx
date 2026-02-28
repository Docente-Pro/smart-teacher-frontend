import React from 'react';
import type { GraficoPlanificadorEscritura } from '../../../domain/types/graficos-areas.types';

interface Props {
  data: GraficoPlanificadorEscritura;
}

const tipoTextoEmoji: Record<string, string> = {
  cuento: '📖',
  carta: '✉️',
  noticia: '📰',
  instrucciones: '📋',
  poema: '🎶',
  afiche: '🖼️',
};

/**
 * Planificador de Escritura — Comunicación
 * Organiza intención, audiencia y estructura antes de escribir.
 */
export const PlanificadorEscritura: React.FC<Props> = ({ data }) => {
  const { tipoTexto, campos, ideasPrincipales } = data;

  return (
    <div className="space-y-4">
      {/* Tipo de texto */}
      <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-600">
        <span className="text-xl">{tipoTextoEmoji[tipoTexto] ?? '📝'}</span>
        Tipo de texto: <span className="capitalize text-gray-800">{tipoTexto}</span>
      </div>

      {/* Campos pregunta-respuesta */}
      <div className="space-y-3">
        {campos.map((campo, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-gray-200 p-3 bg-white"
          >
            <p className="text-xs font-semibold text-indigo-600 mb-1">
              {campo.pregunta}
            </p>
            <p className="text-sm text-gray-700">{campo.respuesta}</p>
          </div>
        ))}
      </div>

      {/* Ideas principales */}
      {ideasPrincipales.length > 0 && (
        <div className="bg-amber-50 rounded-lg p-4">
          <h5 className="text-xs font-bold uppercase tracking-wide text-amber-700 mb-2">
            💡 Ideas principales
          </h5>
          <ul className="space-y-1">
            {ideasPrincipales.map((idea, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-amber-500 mt-0.5">•</span>
                {idea}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
