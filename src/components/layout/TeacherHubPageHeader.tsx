import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dpFocusRing } from "@/styles/dpTokens";
import DpEnter from "@/components/motion/DpEnter";

interface TeacherHubPageHeaderProps {
  title: string;
  description: ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
    className?: string;
  };
  backAction?: {
    label?: string;
    onClick: () => void;
  };
  className?: string;
}

export default function TeacherHubPageHeader({
  title,
  description,
  primaryAction,
  backAction,
  className = "",
}: TeacherHubPageHeaderProps) {
  return (
    <DpEnter
      as="header"
      className={`dp-material sticky top-0 z-10 -mx-4 mb-6 border-b border-[#E6EBF2] px-4 pb-5 pt-2 sm:-mx-6 sm:px-6 ${className}`}
    >
      {backAction && (
        <Button
          variant="ghost"
          onClick={backAction.onClick}
          className={`${dpFocusRing} mb-3 h-11 px-2 text-base font-bold text-[#6B7280] hover:bg-[#EAF2FC] hover:text-[#1F2937]`}
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          {backAction.label ?? "Atrás"}
        </Button>
      )}

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <h1 className="text-balance text-3xl font-extrabold tracking-[-0.02em] text-[#1F2937] sm:text-4xl">
            {title}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-base font-semibold text-[#6B7280]">
            {description}
          </div>
        </div>
        {primaryAction && (
          <Button
            onClick={primaryAction.onClick}
            className={
              primaryAction.className ??
              `${dpFocusRing} dp-press dp-lift dp-cta-soft-pattern inline-flex min-h-12 shrink-0 items-center justify-center rounded-[18px] bg-[#FF8B5C] px-5 text-base font-extrabold text-white shadow-[0_12px_28px_rgba(255,139,92,0.24)] hover:bg-[#F97316]`
            }
          >
            {primaryAction.icon}
            {primaryAction.label}
          </Button>
        )}
      </div>
    </DpEnter>
  );
}
