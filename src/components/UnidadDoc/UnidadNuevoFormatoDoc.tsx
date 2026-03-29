import type { IUnidadContenido } from "@/interfaces/IUnidadIA";

interface UnidadDocContexto {
  nivel: string;
  grado: string;
  numeroUnidad: number;
  titulo: string;
  duracion: number;
  areas: Array<{ nombre: string }>;
}

interface Props {
  datosBase: UnidadDocContexto;
  contenido: IUnidadContenido;
  institucion: string;
  directivo: string;
  subdirectora?: string;
  docente: string;
  seccion: string;
  propositoGrados?: string[];
}

function normalizeText(value: string | undefined, fallback = "—"): string {
  const v = (value || "").trim();
  return v || fallback;
}

function toLines(items: string[] | undefined): string {
  if (!items || items.length === 0) return "—";
  return items.filter(Boolean).join("\n");
}

function getWeekActivityTitles(contenido: IUnidadContenido): string[] {
  const semanas = contenido.secuencia?.semanas || [];
  return semanas.map((semana) => {
    const firstDia = semana.dias?.[0];
    const legacy = firstDia?.horas?.[0]?.actividad;
    const maniana = firstDia?.turnoManana?.actividad;
    const tarde = firstDia?.turnoTarde?.actividad;
    return normalizeText(legacy || maniana || tarde, "TÍTULO DE LA SESIÓN");
  });
}

function gradeColumns() {
  return ["PRIMER AÑO", "SEGUNDO AÑO", "TERCER AÑO", "CUARTO AÑO", "QUINTO AÑO"];
}

function gradeColumnIndex(grado: string): number {
  const txt = (grado || "").toLowerCase();
  if (txt.includes("primer")) return 0;
  if (txt.includes("segundo")) return 1;
  if (txt.includes("tercer")) return 2;
  if (txt.includes("cuarto")) return 3;
  if (txt.includes("quinto")) return 4;
  return 2;
}

const TRANSVERSALES_FIJAS = [
  {
    nombre: "Se desenvuelve en entornos virtuales generados por las TIC",
    capacidades: [
      "Personaliza entornos virtuales",
      "Gestiona información del entorno virtual",
      "Interactúa en entornos virtuales",
      "Crea objetos virtuales en diversos formatos",
    ],
  },
  {
    nombre: "Gestiona su aprendizaje de manera autónoma",
    capacidades: [
      "Define metas de aprendizaje",
      "Organiza acciones estratégicas para alcanzar sus metas",
      "Monitorea y ajusta su desempeño durante el proceso de aprendizaje",
    ],
  },
] as const;

export function UnidadNuevoFormatoDoc({
  datosBase,
  contenido,
  institucion,
  directivo,
  subdirectora,
  docente,
  seccion,
  propositoGrados,
}: Props) {
  const evidencias = contenido.evidencias;
  const weekTitles = getWeekActivityTitles(contenido);
  const gradeCols = gradeColumns();
  const activeGradeCol = gradeColumnIndex(datosBase.grado);
  const areaLabel = datosBase.areas.map((a) => a.nombre).join(", ");
  const gradesForPropositos =
    propositoGrados && propositoGrados.length > 0
      ? propositoGrados
      : [normalizeText(datosBase.grado)];
  const competenciasTransversalesRaw = contenido.propositos?.competenciasTransversales || [];
  const competenciasTransversalesFijas = TRANSVERSALES_FIJAS.map((base, idx) => {
    const fromData = competenciasTransversalesRaw[idx];
    return {
      nombre: normalizeText(fromData?.nombre || base.nombre),
      capacidades:
        fromData?.capacidades && fromData.capacidades.length > 0
          ? fromData.capacidades
          : [...base.capacidades],
      estandar: normalizeText(fromData?.estandar, ""),
      criterios:
        fromData?.criterios && fromData.criterios.length > 0
          ? fromData.criterios
          : ["TRES CRITERIOS"],
    };
  });

  return (
    <div className="unidad-nuevo-formato">
      <style>{`
        .unidad-nuevo-formato { font-family: Arial, Helvetica, sans-serif; color: #111; }
        .unidad-nuevo-formato * { box-sizing: border-box; }
        .unidad-nuevo-formato .u-title { text-align: center; font-weight: 700; margin-bottom: 0.25rem; letter-spacing: 0.35rem; font-size: 14pt; }
        .unidad-nuevo-formato .u-subtitle { text-align: center; font-size: 14pt; margin-bottom: 0.45rem; font-weight: 700; color: #c50000; }
        .unidad-nuevo-formato .u-section { margin-top: 0.35rem; margin-bottom: 0.25rem; font-size: 11pt; font-weight: 700; }
        .unidad-nuevo-formato table { width: 100%; border-collapse: collapse; margin-bottom: 0.35rem; table-layout: fixed; }
        .unidad-nuevo-formato th, .unidad-nuevo-formato td { border: 1px solid #222; padding: 0.18rem 0.28rem; vertical-align: top; font-size: 8.7pt; line-height: 1.2; }
        .unidad-nuevo-formato .th-soft { background: #ffff00; font-weight: 700; text-align: center; }
        .unidad-nuevo-formato .label { font-weight: 700; width: 22%; }
        .unidad-nuevo-formato .box { border: 1px solid #222; min-height: 85px; white-space: pre-wrap; padding: 0.3rem 0.35rem; margin-bottom: 0.35rem; font-size: 8.7pt; line-height: 1.25; }
        .unidad-nuevo-formato .small-list { margin: 0.08rem 0 0 0.8rem; }
        .unidad-nuevo-formato .small-list li { margin-bottom: 0.05rem; font-size: 8.7pt; }
        .unidad-nuevo-formato .firma-wrap { display: flex; justify-content: space-between; margin-top: 1rem; }
        .unidad-nuevo-formato .firma { width: 42%; text-align: center; font-size: 10pt; }
        .unidad-nuevo-formato .linea { border-top: 1px solid #111; margin-bottom: 0.2rem; }
      `}</style>

      <p className="u-title">UNIDAD DE APRENDIZAJE N° {datosBase.numeroUnidad}</p>
      <p className="u-subtitle">"{normalizeText(datosBase.titulo, "Título de la unidad")}"</p>

      <p className="u-section">I. - DATOS INFORMATIVOS:</p>
      <table>
        <tbody>
          <tr>
            <td className="label">INSTITUCIÓN EDUCATIVA</td>
            <td>{normalizeText(institucion)}</td>
            <td className="label">NIVEL</td>
            <td>{normalizeText(datosBase.nivel)}</td>
          </tr>
          <tr>
            <td className="label">DIRECTOR (A)</td>
            <td>{normalizeText(directivo)}</td>
            <td className="label">SUBDIRECTOR(A)</td>
            <td>{normalizeText(subdirectora)}</td>
          </tr>
          <tr>
            <td className="label">ÁREA</td>
            <td>{normalizeText(areaLabel)}</td>
            <td className="label">GRADO</td>
            <td>{normalizeText(datosBase.grado)}</td>
          </tr>
          <tr>
            <td className="label">SECCIONES</td>
            <td>{normalizeText(seccion)}</td>
            <td className="label">DURACIÓN</td>
            <td>{datosBase.duracion} semanas</td>
          </tr>
          <tr>
            <td className="label">DOCENTE</td>
            <td colSpan={3}>{normalizeText(docente)}</td>
          </tr>
        </tbody>
      </table>

      <p className="u-section">II. - COMPONENTES:</p>

      <p className="u-section">2.1.- PLANTEAMIENTO DE LA SITUACIÓN SIGNIFICATIVA.</p>
      <div className="box">{normalizeText(contenido.situacionSignificativa)}</div>

      <p className="u-section">2.2.- PRODUCTO DE LA UNIDAD DE APRENDIZAJE POR GRADO</p>
      <div className="box">{normalizeText(evidencias?.productoIntegrador)}</div>

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
          {(contenido.enfoques || []).map((e, idx) => (
            <tr key={`${e.enfoque}-${idx}`}>
              <td>{normalizeText(e.enfoque)}</td>
              <td>{normalizeText(e.valor)}</td>
              <td>{normalizeText(e.actitudes)}</td>
            </tr>
          ))}
          {(contenido.enfoques || []).length === 0 && (
            <tr>
              <td>—</td>
              <td>—</td>
              <td>—</td>
            </tr>
          )}
        </tbody>
      </table>

      <p className="u-section">2.4.- INSTRUMENTO DE EVALUACIÓN.</p>
      <ul className="small-list">
        <li>{normalizeText(evidencias?.instrumentoEvaluacion)}</li>
      </ul>

      <p className="u-section">2.5.- PROPÓSITOS DE APRENDIZAJE</p>
      {gradesForPropositos.map((grado, gIdx) => (
        <table key={`${grado}-${gIdx}`}>
          <thead>
            <tr>
              <th colSpan={6} style={{ textAlign: "center" }}>
                GRADO {normalizeText(grado)}
              </th>
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
            {(contenido.propositos?.areasPropositos || []).flatMap((ap) =>
              (ap.competencias || []).map((c, idx) => (
                <tr key={`${gIdx}-${ap.area}-${c.nombre}-${idx}`}>
                  <td>
                    <strong>{normalizeText(c.nombre)}</strong>
                    <ul className="small-list">
                      {(c.capacidades || []).map((cap, i) => (
                        <li key={i}>{cap}</li>
                      ))}
                    </ul>
                  </td>
                  <td>{normalizeText(c.estandar)}</td>
                  <td>{toLines(c.actividades)}</td>
                  <td>{normalizeText(ap.area)}</td>
                  <td>{toLines(c.criterios)}</td>
                  <td>{normalizeText(c.instrumento)}</td>
                </tr>
              )),
            )}
            {(contenido.propositos?.areasPropositos || []).length === 0 && (
              <tr>
                <td>—</td>
                <td>—</td>
                <td>—</td>
                <td>—</td>
                <td>—</td>
                <td>—</td>
              </tr>
            )}
          </tbody>
        </table>
      ))}

      <p className="u-section">2.6.- COMPETENCIAS TRANSVERSALES</p>
      <table>
        <thead>
          <tr>
            <th className="th-soft">COMPETENCIA Y CAPACIDADES</th>
            <th className="th-soft">ESTÁNDAR DE APRENDIZAJE DEL CICLO</th>
            <th className="th-soft">CRITERIOS</th>
          </tr>
        </thead>
        <tbody>
          {competenciasTransversalesFijas.map((ct, idx) => (
            <tr key={`${ct.nombre}-${idx}`}>
              <td>
                <strong>{normalizeText(ct.nombre)}</strong>
                <ul className="small-list">
                  {(ct.capacidades || []).map((cap, i) => (
                    <li key={i}>{cap}</li>
                  ))}
                </ul>
              </td>
              <td>{normalizeText(ct.estandar, " ")}</td>
              <td>{toLines(ct.criterios)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="u-section">2.7. SECUENCIA DE SESIONES POR GRADO</p>
      <table>
        <thead>
          <tr>
            <th style={{ width: "12%" }}></th>
            {gradeCols.map((gc) => (
              <th key={gc} style={{ textAlign: "center" }}>{gc}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.max(weekTitles.length, 5) }).map((_, i) => (
            <tr key={i}>
              <td><strong>SEMANA {i + 1}</strong></td>
              {gradeCols.map((_, colIdx) => (
                <td key={colIdx}>
                  {colIdx === activeGradeCol
                    ? normalizeText(weekTitles[i], "TÍTULO DE LA SESIÓN")
                    : "TÍTULO DE LA SESIÓN"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <p className="u-section">III.- RECURSOS Y MATERIALES DIDÁCTICOS:</p>
      <div className="box">{toLines(contenido.materiales)}</div>

      <p className="u-section">IV.- BIBLIOGRAFÍA.</p>
      <div className="box">—</div>

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

