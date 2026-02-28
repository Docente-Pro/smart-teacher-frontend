import React from "react";

/**
 * Convierte markdown básico a elementos React.
 * Soporta:
 * - **texto** → <strong>texto</strong>
 * - *texto* → <em>texto</em>
 * - `código` → <code>código</code>
 * 
 * @param text - Texto con formato markdown
 * @returns Array de ReactNodes o string si no hay formato
 */
export function parseMarkdown(text: string): React.ReactNode {
  if (!text) return text;

  // Regex para **negrita**, *cursiva* y `código`
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = text.split(regex);

  if (parts.length === 1) {
    // No hay formato markdown
    return text;
  }

  return parts.map((part, index) => {
    if (!part) return null;

    // Negrita: **texto**
    if (part.startsWith("**") && part.endsWith("**")) {
      const content = part.slice(2, -2);
      return <strong key={index}>{content}</strong>;
    }

    // Cursiva: *texto*
    if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
      const content = part.slice(1, -1);
      return <em key={index}>{content}</em>;
    }

    // Código: `texto`
    if (part.startsWith("`") && part.endsWith("`")) {
      const content = part.slice(1, -1);
      return (
        <code
          key={index}
          style={{
            backgroundColor: "#f3f4f6",
            padding: "0.1rem 0.25rem",
            borderRadius: "3px",
            fontFamily: "monospace",
            fontSize: "0.9em",
          }}
        >
          {content}
        </code>
      );
    }

    return part;
  });
}

/**
 * Versión que devuelve HTML string en lugar de React elements.
 * Útil para estilos inline o dangerouslySetInnerHTML.
 * 
 * @param text - Texto con formato markdown
 * @returns HTML string
 */
export function parseMarkdownToHTML(text: string): string {
  if (!text) return text;

  return text
    // Negrita: **texto** → <strong>texto</strong>
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    // Cursiva: *texto* → <em>texto</em>
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>")
    // Código: `texto` → <code>texto</code>
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}
