/**
 * Componentes de ejemplo para renderizar procesos por área
 * Copia estos componentes y adáptalos según tus necesidades
 */

import React from 'react';
import {
  IProcesoMatematica,
  tieneProblemaMatematico,
  tieneSolucionMatematica,
  esImagenValida
} from '@/interfaces';

// ============================================
// COMPONENTE 1: Proceso Matemática Completo
// ============================================

interface ProcesoMatematicaProps {
  proceso: IProcesoMatematica;
  mostrarSolucion?: boolean;
}

export const ProcesoMatematicaCard: React.FC<ProcesoMatematicaProps> = ({
  proceso,
  mostrarSolucion = false
}) => {
  const [solucionVisible, setSolucionVisible] = React.useState(mostrarSolucion);

  return (
    <div className="border rounded-lg p-6 mb-4 bg-white shadow-sm">
      {/* Header del proceso */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {proceso.proceso}
        </h3>
        <div className="flex gap-4 text-sm text-gray-600">
          <span className="bg-blue-100 px-3 py-1 rounded-full">
            ⏱️ {proceso.tiempo}
          </span>
        </div>
      </div>

      {/* Estrategias */}
      <div className="mb-4">
        <h4 className="font-semibold text-gray-700 mb-2">Estrategias:</h4>
        <p className="text-gray-600 whitespace-pre-wrap">{proceso.estrategias}</p>
      </div>

      {/* Recursos Didácticos */}
      <div className="mb-4">
        <h4 className="font-semibold text-gray-700 mb-2">Recursos Didácticos:</h4>
        <p className="text-gray-600">{proceso.recursosDidacticos}</p>
      </div>

      {/* Problema Matemático */}
      {tieneProblemaMatematico(proceso) && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded">
          <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <span>📝</span>
            Problema Matemático:
          </h4>
          
          {/* Imagen del problema */}
          {proceso.imagenProblema && esImagenValida(proceso.imagenProblema) && (
            <div className="mb-4">
              <img
                src={proceso.imagenProblema}
                alt="Ilustración del problema"
                className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
                loading="lazy"
              />
              {proceso.descripcionImagenProblema && (
                <p className="text-xs text-gray-500 mt-2 italic">
                  {proceso.descripcionImagenProblema}
                </p>
              )}
            </div>
          )}
          
          {/* Texto del problema */}
          <div className="bg-white p-4 rounded border border-blue-200">
            <p className="text-gray-800 text-lg leading-relaxed">
              {proceso.problemaMatematico}
            </p>
          </div>
        </div>
      )}

      {/* Solución */}
      {tieneSolucionMatematica(proceso) && (
        <div className="mt-4">
          <button
            onClick={() => setSolucionVisible(!solucionVisible)}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
          >
            <span>{solucionVisible ? '🔽' : '▶️'}</span>
            {solucionVisible ? 'Ocultar solución' : 'Ver solución'}
          </button>

          {solucionVisible && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mt-3 rounded animate-fadeIn">
              <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <span>✅</span>
                Solución Paso a Paso:
              </h4>

              {/* Imagen de la solución */}
              {proceso.imagenSolucion && esImagenValida(proceso.imagenSolucion) && (
                <div className="mb-4">
                  <img
                    src={proceso.imagenSolucion}
                    alt="Ilustración de la solución"
                    className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Texto de la solución */}
              <div className="bg-white p-4 rounded border border-green-200">
                <pre className="text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                  {proceso.solucionProblema}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================
// COMPONENTE 2: Vista Compacta del Problema
// ============================================

export const ProblemaMatematicaCompacto: React.FC<{ proceso: IProcesoMatematica }> = ({
  proceso
}) => {
  if (!tieneProblemaMatematico(proceso)) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
      <div className="flex items-start gap-4">
        {/* Imagen miniatura */}
        {proceso.imagenProblema && esImagenValida(proceso.imagenProblema) && (
          <img
            src={proceso.imagenProblema}
            alt="Problema"
            className="w-24 h-24 object-cover rounded-lg shadow"
          />
        )}

        {/* Texto */}
        <div className="flex-1">
          <h5 className="font-semibold text-gray-800 mb-2">
            {proceso.proceso}
          </h5>
          <p className="text-sm text-gray-700 line-clamp-3">
            {proceso.problemaMatematico}
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE 3: Galería de Imágenes
// ============================================

interface GaleriaImagenesProps {
  procesos: IProcesoMatematica[];
}

export const GaleriaImagenesProblemas: React.FC<GaleriaImagenesProps> = ({ procesos }) => {
  const procesosConImagenes = procesos.filter(tieneProblemaMatematico);

  if (procesosConImagenes.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No hay problemas matemáticos con imágenes en esta sesión
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {procesosConImagenes.map((proceso, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
          {proceso.imagenProblema && esImagenValida(proceso.imagenProblema) && (
            <>
              <img
                src={proceso.imagenProblema}
                alt={proceso.proceso}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h5 className="font-semibold text-gray-800 mb-2">
                  {proceso.proceso}
                </h5>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {proceso.problemaMatematico}
                </p>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

// ============================================
// COMPONENTE 4: Descargador de Imágenes
// ============================================

interface DescargadorImagenesProps {
  proceso: IProcesoMatematica;
}

export const DescargadorImagenes: React.FC<DescargadorImagenesProps> = ({ proceso }) => {
  const [descargando, setDescargando] = React.useState(false);

  const descargarImagen = async (url: string, nombre: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${nombre}.png`;
      link.click();

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error descargando imagen:', error);
      alert('Error al descargar la imagen');
    }
  };

  const descargarTodasLasImagenes = async () => {
    setDescargando(true);

    try {
      if (proceso.imagenProblema && esImagenValida(proceso.imagenProblema)) {
        await descargarImagen(
          proceso.imagenProblema,
          `${proceso.proceso}-problema`
        );
      }

      if (proceso.imagenSolucion && esImagenValida(proceso.imagenSolucion)) {
        await descargarImagen(
          proceso.imagenSolucion,
          `${proceso.proceso}-solucion`
        );
      }
    } finally {
      setDescargando(false);
    }
  };

  if (!tieneProblemaMatematico(proceso)) return null;

  return (
    <div className="flex gap-2">
      {proceso.imagenProblema && esImagenValida(proceso.imagenProblema) && (
        <button
          onClick={() => descargarImagen(proceso.imagenProblema!, `${proceso.proceso}-problema`)}
          className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
          disabled={descargando}
        >
          📥 Problema
        </button>
      )}

      {proceso.imagenSolucion && esImagenValida(proceso.imagenSolucion) && (
        <button
          onClick={() => descargarImagen(proceso.imagenSolucion!, `${proceso.proceso}-solucion`)}
          className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
          disabled={descargando}
        >
          📥 Solución
        </button>
      )}

      {tieneSolucionMatematica(proceso) && (
        <button
          onClick={descargarTodasLasImagenes}
          className="px-3 py-1 text-sm bg-purple-500 hover:bg-purple-600 text-white rounded transition-colors"
          disabled={descargando}
        >
          {descargando ? '⏳ Descargando...' : '📥 Todas'}
        </button>
      )}
    </div>
  );
};

// ============================================
// COMPONENTE 5: Indicador de Estado de Imágenes
// ============================================

export const EstadoImagenes: React.FC<{ proceso: IProcesoMatematica }> = ({ proceso }) => {
  if (!tieneProblemaMatematico(proceso)) return null;

  const imagenProblemaValida = esImagenValida(proceso.imagenProblema);
  const imagenSolucionValida = esImagenValida(proceso.imagenSolucion);

  return (
    <div className="flex gap-2 text-sm">
      <span
        className={`px-2 py-1 rounded ${
          imagenProblemaValida
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}
      >
        {imagenProblemaValida ? '✅ Imagen problema' : '⏳ Generando imagen...'}
      </span>
      <span
        className={`px-2 py-1 rounded ${
          imagenSolucionValida
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}
      >
        {imagenSolucionValida ? '✅ Imagen solución' : '⏳ Generando imagen...'}
      </span>
    </div>
  );
};

// ============================================
// CSS adicional (agregar a tu archivo CSS global)
// ============================================

/*
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
*/
