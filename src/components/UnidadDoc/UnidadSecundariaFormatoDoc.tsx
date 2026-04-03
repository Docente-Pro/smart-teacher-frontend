interface ProductoPorGrado {
  grado: string;
  producto: string;
}

interface EnfoqueTransversal {
  enfoque: string;
  valor: string;
  actitudes: string;
}

interface CompetenciaCapacidades {
  competencia: string;
  capacidades: string[];
}

interface PropositoCompetencia {
  competenciaCapacidades: CompetenciaCapacidades;
  estandar: string;
  actividades: string[];
  campoTematico: string;
  criteriosEvaluacion: string[];
  instrumentoEvaluacion: string;
}

interface PropositosPorGrado {
  grado: string;
  area: string;
  competencias: PropositoCompetencia[];
}

interface CompetenciaTransversalItem {
  competenciaCapacidades: CompetenciaCapacidades;
  estandarCiclo: string;
  criterios: string[];
}

interface CompetenciasTransversalesPorGrado {
  grado: string;
  competencias: CompetenciaTransversalItem[];
}

interface SecuenciaSesionesPorGrado {
  totalSemanas: number;
  grados: Record<string, Record<string, string[]>>;
}

interface FormatoSecundaria {
  datosInformativos: {
    numeroUnidad: number;
    titulo: string;
    institucionEducativa: string;
    director: string;
    subdirector: string;
    nivel: string;
    area: string;
    grado: string;
    secciones: string;
    docente: string;
    duracion: number;
  };
  componentes: {
    planteamientoSituacionSignificativa: string;
    productoUnidadAprendizajePorGrado: ProductoPorGrado[];
    enfoquesTransversales: EnfoqueTransversal[];
    instrumentoEvaluacion: string;
    propositosAprendizajePorGrado: PropositosPorGrado[];
    competenciasTransversalesPorGrado: CompetenciasTransversalesPorGrado[];
    secuenciaSesionesPorGrado: SecuenciaSesionesPorGrado;
    recursosMaterialesDidacticos: string[];
    recursosMaterialesPorGrado?: { grado: string; materiales: string[] }[];
    bibliografia: string[];
  };
  imagenSituacionUrl?: string;
}

interface Props {
  formato: FormatoSecundaria;
}

function text(v: string | undefined, fb = "—") {
  const t = (v || "").trim();
  return t || fb;
}

function lines(list: string[] | undefined, fb = "—") {
  if (!list || list.length === 0) return fb;
  return list.filter(Boolean).join("\n");
}

function renderList(list: string[] | undefined, fallback = "—") {
  if (!list || list.length === 0) return fallback;
  return (
    <ul className="small-list">
      {list.filter(Boolean).map((item, idx) => (
        <li key={idx}>{item}</li>
      ))}
    </ul>
  );
}

export function UnidadSecundariaFormatoDoc({ formato }: Props) {
  const di = formato.datosInformativos;
  const c = formato.componentes;
  const gradosSecuencia = Object.keys(c.secuenciaSesionesPorGrado.grados || {});
  const totalSemanas = Math.max(c.secuenciaSesionesPorGrado.totalSemanas || 0, 1);

  return (
    <div className="unidad-secundaria-formato">
      <style>{`
        .unidad-secundaria-formato { font-family: Arial, Helvetica, sans-serif; color: #111; }
        .unidad-secundaria-formato * { box-sizing: border-box; }
        .unidad-secundaria-formato .u-title { text-align: center; font-weight: 700; margin-bottom: 0.2rem; letter-spacing: 0.35rem; font-size: 14pt; }
        .unidad-secundaria-formato .u-subtitle { text-align: center; font-size: 14pt; margin-bottom: 0.45rem; font-weight: 700; color: #c50000; }
        .unidad-secundaria-formato .u-section { margin-top: 0.32rem; margin-bottom: 0.22rem; font-size: 11pt; font-weight: 700; }
        .unidad-secundaria-formato table { width: 100%; border-collapse: collapse; margin-bottom: 0.32rem; table-layout: fixed; }
        .unidad-secundaria-formato th, .unidad-secundaria-formato td { border: 1px solid #222; padding: 0.18rem 0.28rem; vertical-align: top; font-size: 8.6pt; line-height: 1.2; }
        .unidad-secundaria-formato .th-soft { background: #ffff00; font-weight: 700; text-align: center; }
        .unidad-secundaria-formato .label { font-weight: 700; width: 22%; }
        .unidad-secundaria-formato .box { border: 1px solid #222; min-height: 85px; white-space: pre-wrap; padding: 0.28rem 0.34rem; margin-bottom: 0.32rem; font-size: 8.6pt; line-height: 1.25; }
        .unidad-secundaria-formato .small-list {
          margin: 0.08rem 0 0 0.8rem;
          padding-left: 0.65rem;
          list-style-type: disc !important;
          list-style-position: outside;
        }
        .unidad-secundaria-formato .small-list li {
          margin-bottom: 0.05rem;
          font-size: 8.6pt;
          display: list-item !important;
          list-style-type: disc !important;
        }
        .unidad-secundaria-formato .firma-wrap { display: flex; justify-content: space-between; margin-top: 10rem; }
        .unidad-secundaria-formato .firma { width: 42%; text-align: center; font-size: 10pt; }
        .unidad-secundaria-formato .linea { border-top: 1px solid #111; margin-bottom: 0.2rem; }
      `}</style>

      <p className="u-title">UNIDAD DE APRENDIZAJE N° {di.numeroUnidad}</p>
      <p className="u-subtitle">"{text(di.titulo, "Título de la unidad")}"</p>

      <p className="u-section">I. - DATOS INFORMATIVOS:</p>
      <table>
        <tbody>
          <tr>
            <td className="label">INSTITUCIÓN EDUCATIVA</td>
            <td>{text(di.institucionEducativa)}</td>
            <td className="label">NIVEL</td>
            <td>{text(di.nivel)}</td>
          </tr>
          <tr>
            <td className="label">DIRECTOR (A)</td>
            <td>{text(di.director)}</td>
            <td className="label">SUBDIRECTOR(A)</td>
            <td>{text(di.subdirector)}</td>
          </tr>
          <tr>
            <td className="label">ÁREA</td>
            <td>{text(di.area)}</td>
            <td className="label">GRADO</td>
            <td>{text(di.grado)}</td>
          </tr>
          <tr>
            <td className="label">SECCIONES</td>
            <td>{text(di.secciones)}</td>
            <td className="label">DURACIÓN</td>
            <td>{di.duracion} semanas</td>
          </tr>
          <tr>
            <td className="label">DOCENTE</td>
            <td colSpan={3}>{text(di.docente)}</td>
          </tr>
        </tbody>
      </table>

      <p className="u-section">II. - COMPONENTES:</p>
      <p className="u-section">2.1.- PLANTEAMIENTO DE LA SITUACIÓN SIGNIFICATIVA.</p>
      <div className="box" style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>{text(c.planteamientoSituacionSignificativa)}</div>
        {formato.imagenSituacionUrl && (
          <img
            src={formato.imagenSituacionUrl}
            alt="Ilustración de la situación significativa"
            crossOrigin="anonymous"
            style={{
              width: "200px",
              height: "200px",
              objectFit: "cover",
              borderRadius: "8px",
              flexShrink: 0,
            }}
          />
        )}
      </div>

      <p className="u-section">2.2.- PRODUCTO DE LA UNIDAD DE APRENDIZAJE POR GRADO</p>
      <table>
        <thead>
          <tr>
            <th style={{ width: "22%" }}>GRADO</th>
            <th style={{ width: "78%" }}>PRODUCTO</th>
          </tr>
        </thead>
        <tbody>
          {c.productoUnidadAprendizajePorGrado.map((p, i) => (
            <tr key={`${p.grado}-${i}`}>
              <td>{text(p.grado)}</td>
              <td>
                <ul className="small-list">
                  <li>{text(p.producto)}</li>
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="u-section">2.3 ENFOQUES TRANSVERSALES.</p>
      <table>
        <thead>
          <tr>
            <th className="th-soft">ENFOQUES TRANSVERSAL</th>
            <th className="th-soft">VALOR</th>
            <th className="th-soft">ACTITUDES OBSERVABLES</th>
          </tr>
        </thead>
        <tbody>
          {c.enfoquesTransversales.map((e, idx) => (
            <tr key={`${e.enfoque}-${idx}`}>
              <td>{text(e.enfoque)}</td>
              <td>{text(e.valor)}</td>
              <td>{text(e.actitudes)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="u-section">2.4.- INSTRUMENTO DE EVALUACIÓN.</p>
      <ul className="small-list">
        <li>{text(c.instrumentoEvaluacion)}</li>
      </ul>

      <p className="u-section">2.5.- PROPÓSITOS DE APRENDIZAJE</p>
      {c.propositosAprendizajePorGrado.map((pg, gIdx) => (
        <table key={`${pg.grado}-${gIdx}`}>
          <thead>
            <tr>
              <th colSpan={6} style={{ textAlign: "center" }}>GRADO {text(pg.grado)}</th>
            </tr>
            <tr>
              <th style={{ width: "19%" }}>COMPETENCIA Y CAPACIDADES</th>
              <th style={{ width: "21%" }}>ESTÁNDAR</th>
              <th style={{ width: "22%" }}>ACTIVIDADES</th>
              <th style={{ width: "12%" }}>CAMPO TEMÁTICO</th>
              <th style={{ width: "17%" }}>CRITERIOS DE EVALUACIÓN</th>
              <th style={{ width: "9%" }}>Instrumento de evaluación</th>
            </tr>
          </thead>
          <tbody>
            {pg.competencias.map((cp, idx) => (
              <tr key={`${pg.grado}-${idx}`}>
                <td>
                  <strong>{text(cp.competenciaCapacidades.competencia)}</strong>
                  {renderList(cp.competenciaCapacidades.capacidades)}
                </td>
                <td>{text(cp.estandar)}</td>
                <td>{renderList(cp.actividades)}</td>
                <td>{text(cp.campoTematico)}</td>
                <td>{renderList(cp.criteriosEvaluacion)}</td>
                <td>{text(cp.instrumentoEvaluacion)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}

      <p className="u-section">2.6.- COMPETENCIAS TRANSVERSALES</p>
      {c.competenciasTransversalesPorGrado.map((tg, tIdx) => (
        <table key={`${tg.grado}-${tIdx}`}>
          <thead>
            <tr>
              <th colSpan={3} style={{ textAlign: "center" }}>GRADO {text(tg.grado)}</th>
            </tr>
            <tr>
              <th className="th-soft">COMPETENCIA Y CAPACIDADES</th>
              <th className="th-soft">ESTÁNDAR DE APRENDIZAJE DEL CICLO</th>
              <th className="th-soft">CRITERIOS</th>
            </tr>
          </thead>
          <tbody>
            {tg.competencias.map((ct, idx) => (
              <tr key={`${tg.grado}-${idx}`}>
                <td>
                  <strong>{text(ct.competenciaCapacidades.competencia)}</strong>
                {renderList(ct.competenciaCapacidades.capacidades)}
                </td>
                <td>{text(ct.estandarCiclo)}</td>
              <td>{renderList(ct.criterios)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}

      <p className="u-section">2.7. SECUENCIA DE SESIONES POR GRADO</p>
      <table>
        <thead>
          <tr>
            <th style={{ width: "12%" }}></th>
            {gradosSecuencia.map((g) => (
              <th key={g} style={{ textAlign: "center" }}>{g.toUpperCase()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: totalSemanas }).map((_, i) => {
            const semana = String(i + 1);
            return (
              <tr key={semana}>
                <td><strong>SEMANA {semana}</strong></td>
                {gradosSecuencia.map((g) => (
                  <td key={`${g}-${semana}`}>
                    {renderList(c.secuenciaSesionesPorGrado.grados[g]?.[semana] || ["—"])}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className="u-section">III.- RECURSOS Y MATERIALES DIDÁCTICOS:</p>
      {c.recursosMaterialesPorGrado && c.recursosMaterialesPorGrado.length > 0 ? (
        c.recursosMaterialesPorGrado.map((g, idx) => (
          <div key={idx} style={{ marginBottom: "0.4rem" }}>
            <p style={{ fontSize: "9pt", fontWeight: "bold", marginBottom: "0.1rem" }}>{g.grado}</p>
            <div className="box">{renderList(g.materiales)}</div>
          </div>
        ))
      ) : (
        <div className="box">{renderList(c.recursosMaterialesDidacticos)}</div>
      )}

      <div className="firma-wrap">
        <div className="firma">
          <div className="linea" />
          Docente.
        </div>
        <div className="firma">
          <div className="linea" />
          Directivo de la I.E.
        </div>
      </div>
    </div>
  );
}

