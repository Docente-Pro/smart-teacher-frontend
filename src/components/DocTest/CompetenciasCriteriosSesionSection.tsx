interface CompetenciaCapacidadFija {
  competencia: string;
  capacidades: string[];
}

const COMPETENCIAS_CAPACIDADES_FIJAS: CompetenciaCapacidadFija[] = [
  {
    competencia: "Se desenvuelve en entornos virtuales generados por las TIC",
    capacidades: [
      "Personaliza entornos virtuales",
      "Gestiona informacion del entorno virtual",
      "Interactua en entornos virtuales",
      "Crea objetos virtuales en diversos formatos",
    ],
  },
  {
    competencia: "Gestiona su aprendizaje de manera autonoma",
    capacidades: [
      "Define metas de aprendizaje",
      "Organiza acciones estrategicas para alcanzar sus metas de aprendizaje",
      "Monitorea y ajusta su desempeno durante el proceso de aprendizaje",
    ],
  },
];

function renderCriterios(criterios: string[]) {
  if (!criterios.length) {
    return (
      <p style={{ fontSize: "9pt", fontStyle: "italic", color: "#666" }}>
        -
      </p>
    );
  }

  return criterios.map((criterio, idx) => (
    <p key={idx} style={{ fontSize: "9pt", marginBottom: "0.2rem" }}>
      • {criterio}
    </p>
  ));
}

function normalizeCriteriaText(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

export function splitCriteriosEnDosBloques(criterios: string[]): [string[], string[]] {
  const normalized = criterios.map(normalizeCriteriaText).filter(Boolean);
  if (!normalized.length) return [[], []];
  if (normalized.length === 1) return [[normalized[0]], []];

  const mid = Math.ceil(normalized.length / 2);
  return [normalized.slice(0, mid), normalized.slice(mid)];
}

interface CompetenciasCriteriosSesionSectionProps {
  sectionColor?: string;
  criteriosPorCompetencia?: string[][];
}

export function CompetenciasCriteriosSesionSection({
  sectionColor = "#E8F5E9",
  criteriosPorCompetencia = [],
}: CompetenciasCriteriosSesionSectionProps) {
  return (
    <table style={{ marginBottom: "0.5rem" }}>
      <tbody>
        <tr>
          <th style={{ width: "55%", backgroundColor: sectionColor }}>
            COMPETENCIAS TRANSVERSALES
          </th>
          <th style={{ width: "45%", backgroundColor: sectionColor }}>CRITERIOS</th>
        </tr>
        {COMPETENCIAS_CAPACIDADES_FIJAS.map((item, idx) => (
          <tr key={idx}>
            <td>
              <p style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>
                {item.competencia}
              </p>
              {item.capacidades.map((capacidad, capIdx) => (
                <p key={capIdx} style={{ fontSize: "9pt", marginBottom: "0.15rem" }}>
                  • {capacidad}
                </p>
              ))}
            </td>
            <td>{renderCriterios(criteriosPorCompetencia[idx] || [])}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

