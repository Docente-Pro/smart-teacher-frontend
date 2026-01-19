/**
 * EJEMPLO COMPLETO DE USO
 * ======================
 * Este archivo muestra cómo usar las interfaces y utilidades por área
 * en un componente React completo
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ISesionAprendizajePorArea,
  ISesionAprendizajeMatematica
} from '@/interfaces';
import {
  esSesionMatematica,
  obtenerTipoArea,
  obtenerEstadisticasImagenes,
  contarProblemasMatematicos,
  descargarImagenesDeLaSesion
} from '@/utils/sesionesHelpers';
import { ProcesoMatematicaCard } from '@/components/areas/ejemplos-matematica';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

interface SesionViewerProps {
  sesionId: string;
}

export const SesionViewer: React.FC<SesionViewerProps> = ({ sesionId }) => {
  // Fetch de la sesión
  const { data: sesion, isLoading } = useQuery<ISesionAprendizajePorArea>({
    queryKey: ['sesion', sesionId],
    queryFn: async () => {
      const response = await fetch(`/api/sesiones/${sesionId}`);
      return response.json();
    }
  });

  if (isLoading) {
    return <div className="text-center py-8">Cargando sesión...</div>;
  }

  if (!sesion) {
    return <div className="text-center py-8">Sesión no encontrada</div>;
  }

  // Detectar el tipo de área
  const tipoArea = obtenerTipoArea(sesion.datosGenerales.area);

  // Renderizar según el área
  switch (tipoArea) {
    case 'matematica':
      return <SesionMatematicaView sesion={sesion as ISesionAprendizajeMatematica} />;
    case 'comunicacion':
      return <SesionGenericaView sesion={sesion} titulo="Sesión de Comunicación" />;
    case 'ciencia':
      return <SesionGenericaView sesion={sesion} titulo="Sesión de Ciencia y Tecnología" />;
    case 'personal-social':
      return <SesionGenericaView sesion={sesion} titulo="Sesión de Personal Social" />;
    default:
      return <SesionGenericaView sesion={sesion} titulo="Sesión de Aprendizaje" />;
  }
};

// ============================================
// VISTA ESPECÍFICA DE MATEMÁTICA
// ============================================

interface SesionMatematicaViewProps {
  sesion: ISesionAprendizajeMatematica;
}

const SesionMatematicaView: React.FC<SesionMatematicaViewProps> = ({ sesion }) => {
  const [descargando, setDescargando] = React.useState(false);

  // Obtener estadísticas
  const numProblemas = contarProblemasMatematicos(sesion);
  const estadisticasImagenes = obtenerEstadisticasImagenes(sesion);

  // Handler para descargar todas las imágenes
  const handleDescargarImagenes = async () => {
    setDescargando(true);
    try {
      await descargarImagenesDeLaSesion(sesion);
      alert('Imágenes descargadas exitosamente');
    } catch (error) {
      alert('Error al descargar las imágenes');
    } finally {
      setDescargando(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{sesion.titulo}</h1>
          <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
            📐 Matemática
          </span>
        </div>

        {/* Datos generales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Institución</p>
            <p className="font-semibold">{sesion.datosGenerales.institucion}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Nivel / Grado</p>
            <p className="font-semibold">
              {sesion.datosGenerales.nivel} - {sesion.datosGenerales.grado}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Duración</p>
            <p className="font-semibold">{sesion.datosGenerales.duracion}</p>
          </div>
        </div>

        {/* Estadísticas de problemas matemáticos */}
        {numProblemas > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  📊 Problemas Matemáticos
                </h3>
                <div className="flex gap-4 text-sm">
                  <span className="text-blue-700">
                    <strong>{numProblemas}</strong> problemas
                  </span>
                  <span className="text-blue-700">
                    <strong>{estadisticasImagenes.imagenesProblemaValidas}</strong> imágenes de problemas
                  </span>
                  <span className="text-blue-700">
                    <strong>{estadisticasImagenes.imagenesSolucionValidas}</strong> imágenes de soluciones
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {/* Progreso */}
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${estadisticasImagenes.porcentajeCompletado}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {estadisticasImagenes.porcentajeCompletado}%
                  </span>
                </div>

                {/* Botón de descarga */}
                <button
                  onClick={handleDescargarImagenes}
                  disabled={descargando || estadisticasImagenes.porcentajeCompletado === 0}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm font-semibold transition-colors"
                >
                  {descargando ? '⏳ Descargando...' : '📥 Descargar todas las imágenes'}
                </button>
              </div>
            </div>

            {estadisticasImagenes.imagenesEnGeneracion > 0 && (
              <p className="text-sm text-yellow-700 mt-2">
                ⚠️ Hay {estadisticasImagenes.imagenesEnGeneracion} imágenes en proceso de generación
              </p>
            )}
          </div>
        )}
      </header>

      {/* Propósito de Aprendizaje */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Propósito de Aprendizaje</h2>
        <div className="bg-white border rounded-lg p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">Competencia:</h3>
            <p className="text-gray-600">{sesion.propositoAprendizaje.competencia}</p>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">Propósito de la Sesión:</h3>
            <p className="text-gray-600">{sesion.propositoSesion}</p>
          </div>
        </div>
      </section>

      {/* Secuencia Didáctica */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Secuencia Didáctica</h2>

        {/* INICIO */}
        <div className="mb-8">
          <div className="bg-green-100 px-4 py-2 rounded-t-lg border-b-2 border-green-500">
            <h3 className="text-xl font-semibold text-green-800 flex items-center justify-between">
              <span>🚀 Inicio</span>
              <span className="text-sm font-normal">
                {sesion.secuenciaDidactica.inicio.tiempo}
              </span>
            </h3>
          </div>
          <div className="bg-white border border-green-100 rounded-b-lg p-6">
            {sesion.secuenciaDidactica.inicio.procesos.map((proceso, idx) => (
              <ProcesoMatematicaCard key={idx} proceso={proceso} />
            ))}
          </div>
        </div>

        {/* DESARROLLO */}
        <div className="mb-8">
          <div className="bg-blue-100 px-4 py-2 rounded-t-lg border-b-2 border-blue-500">
            <h3 className="text-xl font-semibold text-blue-800 flex items-center justify-between">
              <span>⚙️ Desarrollo</span>
              <span className="text-sm font-normal">
                {sesion.secuenciaDidactica.desarrollo.tiempo}
              </span>
            </h3>
          </div>
          <div className="bg-white border border-blue-100 rounded-b-lg p-6">
            {sesion.secuenciaDidactica.desarrollo.procesos.map((proceso, idx) => (
              <ProcesoMatematicaCard key={idx} proceso={proceso} />
            ))}
          </div>
        </div>

        {/* CIERRE */}
        <div className="mb-8">
          <div className="bg-purple-100 px-4 py-2 rounded-t-lg border-b-2 border-purple-500">
            <h3 className="text-xl font-semibold text-purple-800 flex items-center justify-between">
              <span>🎯 Cierre</span>
              <span className="text-sm font-normal">
                {sesion.secuenciaDidactica.cierre.tiempo}
              </span>
            </h3>
          </div>
          <div className="bg-white border border-purple-100 rounded-b-lg p-6">
            {sesion.secuenciaDidactica.cierre.procesos.map((proceso, idx) => (
              <ProcesoMatematicaCard key={idx} proceso={proceso} />
            ))}
          </div>
        </div>
      </section>

      {/* Reflexiones */}
      {sesion.reflexiones && (
        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Reflexiones sobre el Aprendizaje</h2>
          <div className="bg-white border rounded-lg p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Avances de los estudiantes:</h3>
              <p className="text-gray-600">{sesion.reflexiones.avancesEstudiantes}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Dificultades experimentadas:</h3>
              <p className="text-gray-600">{sesion.reflexiones.dificultadesExperimentadas}</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

// ============================================
// VISTA GENÉRICA (otras áreas)
// ============================================

interface SesionGenericaViewProps {
  sesion: ISesionAprendizajePorArea;
  titulo: string;
}

const SesionGenericaView: React.FC<SesionGenericaViewProps> = ({ sesion, titulo }) => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{titulo}</h1>
      <h2 className="text-2xl mb-4">{sesion.titulo}</h2>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-yellow-800">
          ℹ️ Esta área aún no tiene componentes específicos. Mostrando vista genérica.
        </p>
      </div>

      {/* Aquí puedes agregar renderizado genérico */}
      <div className="bg-white border rounded-lg p-6">
        <pre className="whitespace-pre-wrap text-sm">
          {JSON.stringify(sesion, null, 2)}
        </pre>
      </div>
    </div>
  );
};

// ============================================
// EXPORTACIONES
// ============================================

export default SesionViewer;
