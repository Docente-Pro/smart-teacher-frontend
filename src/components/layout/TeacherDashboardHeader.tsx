import { BookOpen, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTeacherShell } from "@/components/layout/teacherShellContext";
import { dpFocusRing, dpPressable } from "@/styles/dpTokens";

interface TeacherDashboardHeaderProps {
  planLabel: string;
  gradoNombre: string | null;
  nivelNombre: string | null;
  userName?: string;
  firstName: string;
}

export default function TeacherDashboardHeader({
  planLabel,
  gradoNombre,
  nivelNombre,
  userName,
  firstName,
}: TeacherDashboardHeaderProps) {
  const { logout } = useTeacherShell();
  const focusRing = dpFocusRing;
  const pressable = dpPressable;

  return (
    <header className="dp-material sticky top-0 z-30 border-b border-[#E6EBF2]">
      <div className="flex h-[72px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3 lg:hidden">
          <div className="grid h-11 w-11 place-items-center rounded-[16px] bg-[#6B9FE8] text-white">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-extrabold">Docente Pro</p>
            <p className="truncate text-sm font-semibold text-[#6B7280]">
              {planLabel}
              {gradoNombre ? ` · ${gradoNombre}` : ""}
            </p>
          </div>
        </div>

        <div className="hidden min-w-0 lg:block">
          <p className="text-sm font-bold text-[#6B7280]">
            {gradoNombre || "Tu aula"}
            {nivelNombre ? ` · ${nivelNombre}` : ""}
          </p>
          <p className="text-xl font-extrabold text-[#1F2937]">
            Panel del docente
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-[0_6px_18px_rgba(31,41,55,0.05)] sm:flex">
            <div
              className="grid h-10 w-10 place-items-center rounded-full bg-[#EAF2FC] text-base font-extrabold text-[#3B6CB5]"
              aria-hidden="true"
            >
              {firstName.charAt(0)}
            </div>
            <span className="max-w-[16ch] truncate text-base font-bold">
              {userName}
            </span>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            className={`${focusRing} ${pressable} h-11 rounded-full border-[#E6EBF2] bg-white px-4 text-base font-bold lg:hidden`}
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </header>
  );
}
