import { IFirmas } from "@/interfaces/ISesionAprendizaje";

interface FirmasSectionProps {
  firmas: IFirmas;
}

/**
 * Componente: FirmasSection
 * 
 * Renderiza la sección de firmas del documento.
 * Muestra las firmas del docente y director en columnas separadas.
 * 
 * @param firmas - Objeto con la información de las firmas del docente y director
 */
export function FirmasSection({ firmas }: FirmasSectionProps) {
  return (
    <section style={{marginTop: '3rem', paddingTop: '2rem', borderTop: '2px solid #dbeafe'}}>
      <div className="grid-2" style={{gap: '3rem'}}>
        <div style={{textAlign: 'center'}}>
          <div style={{borderTop: '2px solid #9ca3af', paddingTop: '0.5rem', marginTop: '4rem'}}>
            <p style={{fontWeight: '600'}}>{firmas.docente.nombre}</p>
            <p style={{fontSize: '0.875rem', color: '#6b7280'}}>{firmas.docente.cargo}</p>
          </div>
        </div>
        <div style={{textAlign: 'center'}}>
          <div style={{borderTop: '2px solid #9ca3af', paddingTop: '0.5rem', marginTop: '4rem'}}>
            <p style={{fontWeight: '600'}}>{firmas.director.nombre}</p>
            <p style={{fontSize: '0.875rem', color: '#6b7280'}}>{firmas.director.cargo}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

