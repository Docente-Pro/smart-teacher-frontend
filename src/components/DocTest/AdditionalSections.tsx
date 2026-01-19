import { IPropositoSesion } from "@/interfaces/ISesionAprendizaje";

interface PropositoSesionSectionProps {
  proposito: IPropositoSesion | { queAprenderan?: string; como?: string; paraQue?: string };
}

/**
 * Componente: PropositoSesionSection
 * 
 * Renderiza la tabla del propósito de la sesión estilo MINEDU.
 * 
 * @param proposito - Objeto con el propósito de la sesión
 */
export function PropositoSesionSection({ proposito }: PropositoSesionSectionProps) {
  const normalizeText = (t: string) => t.trim().replace(/^"|"$/g, "");

  const splitIntoBullets = (t: string): string[] => {
    const text = normalizeText(t);
    if (!text) return [];
    // Primero por saltos de línea
    if (text.includes('\n')) {
      return text.split('\n').map(s => s.trim()).filter(Boolean);
    }
    // Luego por oraciones (manteniendo el punto)
    const bySentence = text.split(/(?<=\.)\s+/).map(s => s.trim()).filter(Boolean);
    if (bySentence.length > 1) return bySentence;
    // Luego por punto y coma
    const bySemi = text.split(';').map(s => s.trim()).filter(Boolean);
    if (bySemi.length > 1) return bySemi;
    // Fallback: devolver como único elemento
    return [text];
  };

  let bullets: string[] = [];
  if (typeof proposito === 'string') {
    bullets = splitIntoBullets(proposito);
  } else {
    const legacy = proposito as { queAprenderan?: string; como?: string; paraQue?: string };
    bullets = [legacy.queAprenderan, legacy.como, legacy.paraQue].filter(Boolean) as string[];
  }

  return (
    <table style={{marginBottom: "0.5rem"}}>
      <tbody>
        <tr>
          <td colSpan={2} style={{backgroundColor: "#E8F5E9", fontWeight: "bold", textAlign: "center"}}>
            PROPÓSITO DE LA SESIÓN
          </td>
        </tr>
        <tr>
          <td colSpan={2} style={{fontSize: "10pt", padding: "0.5rem"}}>
            <ul style={{marginLeft: "1rem", lineHeight: 1.6}}>
              {bullets.map((b, idx) => (
                <li key={idx} style={{marginBottom: "0.25rem"}}>{normalizeText(b)}</li>
              ))}
            </ul>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
