import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";
import { parseMarkdown } from "@/utils/parseMarkdown";

interface MarkdownTextareaProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  className?: string;
  viewClassName?: string;
  placeholder?: string;
}

/**
 * Convierte texto con saltos de línea y markdown en elementos React con párrafos.
 */
function renderParagraphs(text: string): React.ReactNode {
  // Dividir por doble salto de línea (párrafos)
  const paragraphs = text.split(/\n{2,}/);

  return paragraphs.map((paragraph, pIdx) => {
    // Dentro de cada párrafo, dividir por salto simple para <br>
    const lines = paragraph.trim().split("\n");

    return (
      <p key={pIdx} className="mb-3 last:mb-0">
        {lines.map((line, lIdx) => (
          <React.Fragment key={lIdx}>
            {lIdx > 0 && <br />}
            {parseMarkdown(line)}
          </React.Fragment>
        ))}
      </p>
    );
  });
}

/**
 * Textarea con renderizado de Markdown.
 * - Vista por defecto: muestra el texto con **negritas**, *cursivas*, etc.
 * - Click para editar: cambia a textarea normal.
 * - Click fuera o Escape: vuelve a vista renderizada.
 */
export function MarkdownTextarea({
  value,
  onChange,
  rows = 8,
  className,
  viewClassName,
  placeholder,
}: MarkdownTextareaProps) {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus el textarea al entrar en modo edición
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Posicionar cursor al final
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  // Cerrar edición al hacer click fuera
  const handleBlur = useCallback((e: React.FocusEvent) => {
    // Si el nuevo foco sigue dentro del container, no cerrar
    if (containerRef.current?.contains(e.relatedTarget as Node)) return;
    setIsEditing(false);
  }, []);

  // Cerrar edición con Escape
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsEditing(false);
    }
  }, []);

  if (isEditing) {
    return (
      <div ref={containerRef} onBlur={handleBlur}>
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={rows}
          placeholder={placeholder}
          className={cn("w-full text-sm leading-relaxed resize-y", className)}
        />
        <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
          Usa **texto** para <strong>negrita</strong> y *texto* para <em>cursiva</em>.
          Presiona Esc para cerrar.
        </p>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setIsEditing(true)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setIsEditing(true);
      }}
      className={cn(
        "group relative w-full rounded-md border bg-white dark:bg-slate-950 px-3 py-2 text-sm leading-relaxed cursor-text transition-colors",
        "border-slate-200 dark:border-slate-800",
        "hover:border-slate-400 dark:hover:border-slate-600",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:focus-visible:ring-slate-300 focus-visible:ring-offset-2",
        viewClassName
      )}
      style={{ minHeight: `${Math.max(rows * 1.5, 5)}rem` }}
    >
      {/* Icono de editar */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs">
          <Pencil className="w-3 h-3" />
          Editar
        </div>
      </div>

      {value ? (
        <div className="text-slate-700 dark:text-slate-300 [&_strong]:text-slate-900 dark:[&_strong]:text-white [&_strong]:font-bold [&_em]:italic">
          {renderParagraphs(value)}
        </div>
      ) : (
        <p className="text-slate-400 dark:text-slate-500 italic">
          {placeholder || "Haz clic para escribir..."}
        </p>
      )}
    </div>
  );
}
