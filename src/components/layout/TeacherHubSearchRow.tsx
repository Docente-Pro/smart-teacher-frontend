import { RefreshCw, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DpEnter from "@/components/motion/DpEnter";
import { dpFocusRing, dpInputClass, dpOutlineButtonClass } from "@/styles/dpTokens";

interface TeacherHubSearchRowProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder: string;
  onRefresh: () => void;
  refreshing?: boolean;
  className?: string;
}

export default function TeacherHubSearchRow({
  value,
  onChange,
  onClear,
  placeholder,
  onRefresh,
  refreshing = false,
  className = "",
}: TeacherHubSearchRowProps) {
  return (
    <DpEnter
      delayMs={40}
      className={`mb-6 flex flex-col gap-3 sm:flex-row ${className}`}
    >
      <div className="group/search relative flex-1">
        <Search
          className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF] transition-colors group-focus-within/search:text-[#3B6CB5]"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${dpInputClass} pl-10`}
          aria-label={placeholder}
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            className={`${dpFocusRing} absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#9CA3AF] hover:bg-[#F5F7FA] hover:text-[#6B7280]`}
            aria-label="Limpiar búsqueda"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
      <Button
        variant="outline"
        onClick={onRefresh}
        disabled={refreshing}
        className={dpOutlineButtonClass}
      >
        <RefreshCw
          className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          aria-hidden="true"
        />
        Actualizar
      </Button>
    </DpEnter>
  );
}
