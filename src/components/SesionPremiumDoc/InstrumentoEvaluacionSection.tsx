/**
 * InstrumentoEvaluacionSection.tsx
 *
 * Renderiza el instrumento de evaluación dentro del PDF Premium.
 * Soporta 3 tipos:
 *  1. Lista de cotejo      → tabla: N° | Estudiante | criterio₁ Sí/No | criterio₂ Sí/No …
 *  2. Escala de valoración  → tabla: N° | Estudiante | criterio₁ Siempre/A veces/Nunca | …
 *  3. Rúbrica               → tabla: Criterio | Inicio | Proceso | Logrado | Destacado
 *
 * Los estilos son inline (requerido por @htmldocs/react para generación PDF).
 */

import type { AreaColorConfig } from "@/constants/areaColors";
import type {
  IInstrumentoEvaluacion,
  IListaCotejo,
  IEscalaValoracion,
  IRubrica,
} from "@/interfaces/IInstrumentoEvaluacion";
import type { IAlumno } from "@/interfaces/IAula";

type AreaHex = AreaColorConfig["hex"];

/** Número de filas vacías para la lista de estudiantes */
const FILAS_VACIAS = 30;

// ═════════════════════════════════════════════════════════════════════════════
// Sub-componentes internos
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Header compartido: titulo "INSTRUMENTO DE EVALUACIÓN" + subtítulo del tipo
 * + datos (área, grado, competencia, evidencia).
 */
function InstrumentoHeader({
  instrumento,
  hex,
}: {
  instrumento: IInstrumentoEvaluacion;
  hex: AreaHex;
}) {
  const tipoLabel =
    instrumento.tipo === "lista_cotejo"
      ? "Lista de Cotejo"
      : instrumento.tipo === "escala_valoracion"
        ? "Escala de Valoración"
        : "Rúbrica de Evaluación";

  return (
    <table style={{ marginBottom: "0.25rem", width: "100%" }}>
      <tbody>
        <tr>
          <td
            style={{
              backgroundColor: hex.light,
              fontWeight: "bold",
              textAlign: "center",
              fontSize: "11pt",
              padding: "0.4rem 0",
            }}
          >
            {tipoLabel}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

// ─── Lista de Cotejo ────────────────────────────────────────────────────────

function TablaListaCotejo({
  data,
  hex,
  alumnos = [],
}: {
  data: IListaCotejo;
  hex: AreaHex;
  alumnos?: IAlumno[];
}) {
  const { criterios, columnas } = data;

  return (
    <table style={{ width: "100%", fontSize: "8pt", borderCollapse: "collapse" }}>
      <thead>
        {/* Fila de cabecera: N° | Estudiante | (criterio + sub-cols Sí/No) … */}
        <tr>
          <th
            rowSpan={2}
            style={{
              backgroundColor: hex.light,
              width: "1%",
              whiteSpace: "nowrap",
              textAlign: "center",
              verticalAlign: "middle",
              fontSize: "7pt",
              padding: "0.1rem 0.3rem",
            }}
          >
            N°
          </th>
          <th
            rowSpan={2}
            style={{
              backgroundColor: hex.light,
              textAlign: "center",
              verticalAlign: "middle",
            }}
          >
            APELLIDOS Y NOMBRES
          </th>
          {criterios.map((criterio, i) => (
            <th
              key={i}
              colSpan={columnas.length}
              style={{
                backgroundColor: hex.light,
                textAlign: "center",
                fontSize: "7pt",
                padding: "0.2rem",
              }}
            >
              {criterio}
            </th>
          ))}
        </tr>
        <tr>
          {criterios.map((_criterio, ci) =>
            columnas.map((col, colIdx) => (
              <th
                key={`${ci}-${colIdx}`}
                style={{
                  backgroundColor: hex.light,
                  textAlign: "center",
                  fontSize: "7pt",
                  width: `${75 / (criterios.length * columnas.length)}%`,
                  padding: "0.15rem",
                }}
              >
                {col}
              </th>
            )),
          )}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: Math.max(FILAS_VACIAS, alumnos.length) }).map((_, rowIdx) => {
          const alumno = alumnos[rowIdx];
          return (
            <tr key={rowIdx}>
              <td style={{ textAlign: "center", padding: "0.1rem 0.5rem", fontSize: "7pt", whiteSpace: "nowrap" }}>
                {rowIdx + 1}
              </td>
              <td style={{ padding: "0.15rem 0.25rem", fontSize: "8pt" }}>
                {alumno ? `${alumno.apellidos} ${alumno.nombres}`.trim() : "\u00A0"}
              </td>
              {criterios.map((_criterio, ci) =>
                columnas.map((_col, colIdx) => (
                  <td
                    key={`${ci}-${colIdx}`}
                    style={{ textAlign: "center", padding: "0.1rem" }}
                  >
                    &nbsp;
                  </td>
                )),
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ─── Escala de Valoración ───────────────────────────────────────────────────

function TablaEscalaValoracion({
  data,
  hex,
  alumnos = [],
}: {
  data: IEscalaValoracion;
  hex: AreaHex;
  alumnos?: IAlumno[];
}) {
  const { criterios, columnas } = data;

  return (
    <table style={{ width: "100%", fontSize: "8pt", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th
            rowSpan={2}
            style={{
              backgroundColor: hex.light,
              width: "1%",
              whiteSpace: "nowrap",
              textAlign: "center",
              verticalAlign: "middle",
              fontSize: "7pt",
              padding: "0.1rem 0.5rem",
            }}
          >
            N°
          </th>
          <th
            rowSpan={2}
            style={{
              backgroundColor: hex.light,
              textAlign: "center",
              verticalAlign: "middle",
            }}
          >
            APELLIDOS Y NOMBRES
          </th>
          {criterios.map((criterio, i) => (
            <th
              key={i}
              colSpan={columnas.length}
              style={{
                backgroundColor: hex.light,
                textAlign: "center",
                fontSize: "7pt",
                padding: "0.2rem",
              }}
            >
              {criterio}
            </th>
          ))}
        </tr>
        <tr>
          {criterios.map((_criterio, ci) =>
            columnas.map((col, colIdx) => (
              <th
                key={`${ci}-${colIdx}`}
                style={{
                  backgroundColor: hex.light,
                  textAlign: "center",
                  fontSize: "7pt",
                  padding: "0.1rem",
                }}
              >
                {col}
              </th>
            )),
          )}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: Math.max(FILAS_VACIAS, alumnos.length) }).map((_, rowIdx) => {
          const alumno = alumnos[rowIdx];
          return (
            <tr key={rowIdx}>
              <td style={{ textAlign: "center", padding: "0.1rem 0.5rem", fontSize: "7pt", whiteSpace: "nowrap" }}>
                {rowIdx + 1}
              </td>
              <td style={{ padding: "0.15rem 0.25rem", fontSize: "8pt" }}>
                {alumno ? `${alumno.apellidos} ${alumno.nombres}`.trim() : "\u00A0"}
              </td>
              {criterios.map((_criterio, ci) =>
                columnas.map((_col, colIdx) => (
                  <td
                    key={`${ci}-${colIdx}`}
                    style={{ textAlign: "center", padding: "0.1rem" }}
                  >
                    &nbsp;
                  </td>
                )),
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ─── Rúbrica ────────────────────────────────────────────────────────────────

function TablaRubrica({
  data,
  hex,
}: {
  data: IRubrica;
  hex: AreaHex;
}) {
  const { criteriosRubrica, niveles } = data;

  return (
    <table style={{ width: "100%", fontSize: "8pt" }}>
      <thead>
        <tr>
          <th
            style={{
              backgroundColor: hex.light,
              width: "20%",
              textAlign: "center",
            }}
          >
            CRITERIO
          </th>
          {niveles.map((nivel, i) => (
            <th
              key={i}
              style={{
                backgroundColor: hex.light,
                width: "20%",
                textAlign: "center",
              }}
            >
              {nivel}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {criteriosRubrica.map((cr, i) => (
          <tr key={i}>
            <td
              style={{
                fontWeight: "bold",
                fontSize: "8pt",
                verticalAlign: "top",
                padding: "0.3rem",
              }}
            >
              {cr.criterio}
            </td>
            <td style={{ fontSize: "8pt", verticalAlign: "top", padding: "0.3rem" }}>
              {cr.niveles.inicio}
            </td>
            <td style={{ fontSize: "8pt", verticalAlign: "top", padding: "0.3rem" }}>
              {cr.niveles.proceso}
            </td>
            <td style={{ fontSize: "8pt", verticalAlign: "top", padding: "0.3rem" }}>
              {cr.niveles.logrado}
            </td>
            <td style={{ fontSize: "8pt", verticalAlign: "top", padding: "0.3rem" }}>
              {cr.niveles.destacado}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Componente principal exportado
// ═════════════════════════════════════════════════════════════════════════════

interface InstrumentoEvaluacionSectionProps {
  instrumento: IInstrumentoEvaluacion;
  hex: AreaHex;
  /** Lista de alumnos a pre-rellenar en las tablas (opcional) */
  alumnos?: IAlumno[];
}

/**
 * Renderiza la sección completa de instrumento de evaluación.
 * Detecta el tipo y muestra la tabla correspondiente.
 */
export function InstrumentoEvaluacionSection({
  instrumento,
  hex,
  alumnos = [],
}: InstrumentoEvaluacionSectionProps) {
  return (
    <div style={{ marginTop: "0.5rem" }}>
      {/* Header con datos comunes */}
      <InstrumentoHeader instrumento={instrumento} hex={hex} />

      {/* Tabla específica según tipo */}
      {instrumento.tipo === "lista_cotejo" && (
        <TablaListaCotejo data={instrumento} hex={hex} alumnos={alumnos} />
      )}
      {instrumento.tipo === "escala_valoracion" && (
        <TablaEscalaValoracion data={instrumento} hex={hex} alumnos={alumnos} />
      )}
      {instrumento.tipo === "rubrica" && (
        <TablaRubrica data={instrumento} hex={hex} />
      )}
    </div>
  );
}
