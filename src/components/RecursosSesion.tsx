import { useState } from "react";
import {
  Youtube,
  Globe,
  BookOpen,
  Lightbulb,
  ExternalLink,
  Download,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RecursoSesion } from "@/interfaces/IRecursoSesion";
import { recursoTieneUrl } from "@/interfaces/IRecursoSesion";

const ICON_MAP: Record<string, typeof Youtube> = {
  youtube: Youtube,
  pagina_web: Globe,
  cuaderno_minedu: BookOpen,
  recomendacion: Lightbulb,
};

const STYLE_MAP: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  youtube: {
    bg: "bg-red-50 dark:bg-red-500/10",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-100 dark:border-red-800/30",
    badge: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  },
  pagina_web: {
    bg: "bg-blue-50 dark:bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-100 dark:border-blue-800/30",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  },
  cuaderno_minedu: {
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-100 dark:border-emerald-800/30",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  },
  recomendacion: {
    bg: "bg-amber-50 dark:bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-100 dark:border-amber-800/30",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  },
};

const LABEL_MAP: Record<string, string> = {
  youtube: "Video",
  pagina_web: "Web",
  cuaderno_minedu: "Cuaderno MINEDU",
  recomendacion: "Recomendación",
};

interface RecursosSesionProps {
  sesionId: string;
  recursos: RecursoSesion[] | null;
  loading: boolean;
  error: string | null;
  onCargar: () => void;
}

function RecursoCard({ recurso }: { recurso: RecursoSesion }) {
  const Icon = ICON_MAP[recurso.tipo] ?? Lightbulb;
  const style = STYLE_MAP[recurso.tipo] ?? STYLE_MAP.recomendacion;
  const label = LABEL_MAP[recurso.tipo] ?? recurso.tipo;
  const hasUrl = recursoTieneUrl(recurso);

  const isCuaderno = recurso.tipo === "cuaderno_minedu";

  return (
    <div className={`rounded-lg border ${style.border} p-3 space-y-2 transition-colors hover:shadow-sm`}>
      <div className="flex items-start gap-2.5">
        <div className={`flex-shrink-0 w-7 h-7 rounded-md ${style.bg} flex items-center justify-center mt-0.5`}>
          <Icon className={`h-3.5 w-3.5 ${style.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${style.badge}`}>
              {label}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">
            {recurso.titulo}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
            {recurso.descripcion}
          </p>
          {recurso.referencia && (
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 italic">
              {recurso.referencia}
            </p>
          )}
        </div>
      </div>

      {isCuaderno && hasUrl && recurso.url && (
        <div className="mt-1 space-y-1.5">
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Si ya tienes este cuaderno descargado, no es necesario volver a abrirlo.
          </p>
          <a
            href={recurso.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 text-xs font-medium ${style.text} hover:underline`}
          >
            <Download className="h-3 w-3" />
            Abrir cuaderno
          </a>
        </div>
      )}

      {!isCuaderno && hasUrl && recurso.url && (
        <a
          href={recurso.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 text-xs font-medium ${style.text} hover:underline mt-1`}
        >
          <ExternalLink className="h-3 w-3" />
          Abrir enlace
        </a>
      )}
    </div>
  );
}

export function RecursosSesionPanel({
  recursos,
  loading,
  error,
  onCargar,
}: RecursosSesionProps) {
  const [expanded, setExpanded] = useState(true);
  const hasRecursos = recursos && recursos.length > 0;
  const notLoaded = recursos === null && !loading && !error;

  return (
    <div className="rounded-xl border border-violet-200 dark:border-violet-800/30 bg-gradient-to-br from-violet-50/80 to-purple-50/50 dark:from-violet-500/5 dark:to-purple-500/5 p-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-500/15 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Recursos sugeridos
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {hasRecursos
                ? `${recursos.length} recurso${recursos.length > 1 ? "s" : ""}`
                : "Videos, cuadernos y más"}
            </p>
          </div>
        </div>
        {hasRecursos && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Not loaded yet */}
      {notLoaded && (
        <Button
          size="sm"
          onClick={onCargar}
          className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-sm shadow-violet-500/20 transition-all"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Buscar recursos
        </Button>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-4">
          <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Buscando recursos...
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="space-y-2">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={onCargar}
            className="w-full border-violet-300 text-violet-700 hover:bg-violet-50 dark:border-violet-600 dark:text-violet-400"
          >
            Reintentar
          </Button>
        </div>
      )}

      {/* Empty */}
      {recursos && recursos.length === 0 && !loading && (
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-2">
          No se encontraron recursos para esta sesión
        </p>
      )}

      {/* Resource list */}
      {hasRecursos && expanded && (
        <div className="space-y-2 mt-1">
          {recursos.map((r, i) => (
            <RecursoCard key={`${r.tipo}-${i}`} recurso={r} />
          ))}
        </div>
      )}
    </div>
  );
}
