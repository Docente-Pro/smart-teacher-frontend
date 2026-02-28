import React, { useMemo } from 'react';
import type {
  GraficoClasificacionDicotomica,
  NodoDicotomico,
} from '../../../domain/types/graficos-areas.types';

interface Props {
  data: GraficoClasificacionDicotomica;
}

/**
 * Clasificación Dicotómica — Ciencia y Tecnología
 * Árbol de preguntas Sí/No para clasificar seres u objetos.
 */
export const ClasificacionDicotomica: React.FC<Props> = ({ data }) => {
  const { nodos } = data;

  const nodoMap = useMemo(() => {
    const map = new Map<string, NodoDicotomico>();
    nodos.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodos]);

  const raiz = nodos.find((n) => n.id === 'raiz') ?? nodos[0];

  if (!raiz) return null;

  return (
    <div className="overflow-visible">
      <div className="inline-flex flex-col items-center min-w-full py-4">
        <NodoArbol nodo={raiz} nodoMap={nodoMap} />
      </div>
    </div>
  );
};

/* ---------- Componente recursivo ---------- */

const NodoArbol: React.FC<{
  nodo: NodoDicotomico;
  nodoMap: Map<string, NodoDicotomico>;
}> = ({ nodo, nodoMap }) => {
  if (nodo.esHoja) {
    return (
      <div className="flex flex-col items-center">
        <div className="bg-emerald-50 border-2 border-emerald-400 rounded-xl px-4 py-3 text-center max-w-[180px]">
          <p className="font-bold text-sm text-emerald-700">
            {nodo.etiqueta}
          </p>
          {nodo.ejemplos && nodo.ejemplos.length > 0 && (
            <p className="text-xs text-gray-600 mt-1">
              {nodo.ejemplos.join(', ')}
            </p>
          )}
        </div>
      </div>
    );
  }

  const hijoSi = nodo.si ? nodoMap.get(nodo.si) : undefined;
  const hijoNo = nodo.no ? nodoMap.get(nodo.no) : undefined;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Nodo pregunta */}
      <div className="bg-blue-50 border-2 border-blue-400 rounded-xl px-4 py-3 text-center max-w-[220px]">
        {nodo.etiqueta && (
          <p className="text-xs font-semibold text-blue-500 mb-1">{nodo.etiqueta}</p>
        )}
        <p className="font-bold text-sm text-gray-800">{nodo.pregunta}</p>
      </div>

      {/* Ramas Sí / No */}
      <div className="flex gap-8 mt-1">
        {/* Sí */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded">
            Sí
          </span>
          <div className="w-0.5 h-4 bg-green-400" />
          {hijoSi && <NodoArbol nodo={hijoSi} nodoMap={nodoMap} />}
        </div>
        {/* No */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">
            No
          </span>
          <div className="w-0.5 h-4 bg-red-400" />
          {hijoNo && <NodoArbol nodo={hijoNo} nodoMap={nodoMap} />}
        </div>
      </div>
    </div>
  );
};
