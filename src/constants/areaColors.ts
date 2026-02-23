import type { ComponentType } from "react";
import {
  Users,
  Activity,
  Palette,
  MessageCircle,
  Globe,
  Calculator,
  Microscope,
  Church,
  BookOpen,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN GLOBAL DE COLORES POR ÁREA
// ═══════════════════════════════════════════════════════════════════════════════
//
// Fuente única de verdad para los colores de cada área curricular.
// Se usa en:
//   - GenerarSesionPremium (calendario semanal)
//   - Areas.tsx (catálogo de áreas)
//   - Step1DatosUnidad.tsx (selección de áreas al crear unidad)
//   - UnidadDoc* (PDF de unidad de aprendizaje)
// ═══════════════════════════════════════════════════════════════════════════════

export interface AreaColorConfig {
  /** Tailwind gradient classes (e.g. "from-rose-400 to-red-500") */
  gradient: string;
  /** Tailwind bg for light surface */
  bg: string;
  /** Tailwind border */
  border: string;
  /** Tailwind text color */
  text: string;
  /** Tailwind dot/indicator bg */
  dot: string;
  /** Tailwind pill/badge classes */
  pill: string;
  /** Hex values for PDF inline styles */
  hex: {
    /** Color de cabecera / acento fuerte */
    primary: string;
    /** Fondo claro para celdas */
    light: string;
    /** Fondo intermedio para sub-cabeceras */
    medium: string;
    /** Color oscuro para bordes y acentos */
    accent: string;
  };
}

// ─── Colores específicos por área (asignación del usuario) ───────────────────
//
//  Matemática         → rosado / rojo
//  Personal Social    → celeste
//  Ciencia y Tecnol.  → verde
//  Comunicación       → amarillo
//  Educación Religiosa→ blanco azulado leve
//  Arte y Cultura     → lila
//  Educación Física   → azul
//  Inglés             → índigo (default)
//  Tutoría            → cyan  (default)
// ─────────────────────────────────────────────────────────────────────────────

export const AREA_COLORS: Record<string, AreaColorConfig> = {
  /* ── Matemática: rosado / rojo ── */
  "Matemática": {
    gradient: "from-rose-400 to-red-500",
    bg: "bg-rose-50 dark:bg-rose-500/10",
    border: "border-rose-200/70 dark:border-rose-500/25",
    text: "text-rose-700 dark:text-rose-300",
    dot: "bg-rose-500",
    pill: "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300",
    hex: { primary: "#FB7185", light: "#FFF1F2", medium: "#FECDD3", accent: "#E11D48" },
  },

  /* ── Personal Social: celeste ── */
  "Personal Social": {
    gradient: "from-sky-400 to-cyan-500",
    bg: "bg-sky-50 dark:bg-sky-500/10",
    border: "border-sky-200/70 dark:border-sky-500/25",
    text: "text-sky-700 dark:text-sky-300",
    dot: "bg-sky-500",
    pill: "bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300",
    hex: { primary: "#38BDF8", light: "#F0F9FF", medium: "#BAE6FD", accent: "#0284C7" },
  },

  /* ── Ciencia y Tecnología: verde ── */
  "Ciencia y Tecnología": {
    gradient: "from-green-500 to-emerald-500",
    bg: "bg-green-50 dark:bg-green-500/10",
    border: "border-green-200/70 dark:border-green-500/25",
    text: "text-green-700 dark:text-green-300",
    dot: "bg-green-500",
    pill: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300",
    hex: { primary: "#4ADE80", light: "#F0FDF4", medium: "#BBF7D0", accent: "#16A34A" },
  },

  /* ── Comunicación: amarillo ── */
  "Comunicación": {
    gradient: "from-amber-400 to-yellow-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200/70 dark:border-amber-500/25",
    text: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
    pill: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300",
    hex: { primary: "#FBBF24", light: "#FFFBEB", medium: "#FDE68A", accent: "#D97706" },
  },

  /* ── Educación Religiosa: blanco azulado leve ── */
  "Educación Religiosa": {
    gradient: "from-slate-200 to-blue-300",
    bg: "bg-blue-50 dark:bg-blue-400/10",
    border: "border-blue-100/70 dark:border-blue-400/25",
    text: "text-blue-600 dark:text-blue-300",
    dot: "bg-blue-300",
    pill: "bg-blue-50 dark:bg-blue-400/20 text-blue-600 dark:text-blue-300",
    hex: { primary: "#BFDBFE", light: "#EFF6FF", medium: "#DBEAFE", accent: "#3B82F6" },
  },

  /* ── Arte y Cultura: lila ── */
  "Arte y Cultura": {
    gradient: "from-purple-400 to-violet-500",
    bg: "bg-purple-50 dark:bg-purple-500/10",
    border: "border-purple-200/70 dark:border-purple-500/25",
    text: "text-purple-700 dark:text-purple-300",
    dot: "bg-purple-500",
    pill: "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300",
    hex: { primary: "#C084FC", light: "#FAF5FF", medium: "#E9D5FF", accent: "#9333EA" },
  },

  /* ── Educación Física: azul ── */
  "Educación Física": {
    gradient: "from-blue-500 to-indigo-500",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    border: "border-blue-200/70 dark:border-blue-500/25",
    text: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
    pill: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300",
    hex: { primary: "#60A5FA", light: "#EFF6FF", medium: "#BFDBFE", accent: "#2563EB" },
  },

  /* ── Inglés: índigo ── */
  "Inglés": {
    gradient: "from-indigo-400 to-blue-600",
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
    border: "border-indigo-200/70 dark:border-indigo-500/25",
    text: "text-indigo-700 dark:text-indigo-300",
    dot: "bg-indigo-500",
    pill: "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300",
    hex: { primary: "#818CF8", light: "#EEF2FF", medium: "#C7D2FE", accent: "#4F46E5" },
  },

  /* ── Tutoría: cyan ── */
  "Tutoría": {
    gradient: "from-cyan-400 to-teal-500",
    bg: "bg-cyan-50 dark:bg-cyan-500/10",
    border: "border-cyan-200/70 dark:border-cyan-500/25",
    text: "text-cyan-700 dark:text-cyan-300",
    dot: "bg-cyan-500",
    pill: "bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300",
    hex: { primary: "#22D3EE", light: "#ECFEFF", medium: "#A5F3FC", accent: "#0891B2" },
  },
};

// ─── Configuración por defecto (áreas no mapeadas) ──────────────────────────

export const DEFAULT_AREA_COLOR: AreaColorConfig = {
  gradient: "from-slate-500 to-slate-600",
  bg: "bg-slate-50 dark:bg-slate-500/10",
  border: "border-slate-200/70 dark:border-slate-500/25",
  text: "text-slate-600 dark:text-slate-300",
  dot: "bg-slate-500",
  pill: "bg-slate-100 dark:bg-slate-500/20 text-slate-600 dark:text-slate-300",
  hex: { primary: "#94A3B8", light: "#F8FAFC", medium: "#E2E8F0", accent: "#475569" },
};

// ─── Íconos por área ────────────────────────────────────────────────────────

export const AREA_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  "Personal Social": Users,
  "Educación Física": Activity,
  "Arte y Cultura": Palette,
  "Comunicación": MessageCircle,
  "Inglés": Globe,
  "Matemática": Calculator,
  "Ciencia y Tecnología": Microscope,
  "Educación Religiosa": Church,
  "Tutoría": BookOpen,
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Obtiene la configuración de color para un área por nombre.
 * Busca coincidencia parcial (el nombre de la área puede venir con
 * prefijo "Área de " o variaciones menores).
 */
export function getAreaColor(areaNombre: string): AreaColorConfig {
  if (!areaNombre) return DEFAULT_AREA_COLOR;

  // Intento directo
  if (AREA_COLORS[areaNombre]) return AREA_COLORS[areaNombre];

  // Búsqueda parcial (e.g. "Área de Comunicación" → "Comunicación")
  const key = Object.keys(AREA_COLORS).find(
    (k) => areaNombre.includes(k) || k.includes(areaNombre),
  );
  return key ? AREA_COLORS[key] : DEFAULT_AREA_COLOR;
}

/**
 * Obtiene el ícono Lucide correspondiente a un área.
 */
export function getAreaIcon(areaNombre: string): ComponentType<{ className?: string }> {
  if (!areaNombre) return BookOpen;

  if (AREA_ICONS[areaNombre]) return AREA_ICONS[areaNombre];

  const key = Object.keys(AREA_ICONS).find(
    (k) => areaNombre.includes(k) || k.includes(areaNombre),
  );
  return key ? AREA_ICONS[key] : BookOpen;
}
