import { useNavigate } from "react-router";
import {
  BookOpen,
  ClipboardList,
  FileText,
  FolderOpen,
  KeyRound,
  PlayCircle,
  type LucideIcon,
} from "lucide-react";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import { usePermissions } from "@/hooks/usePermissions";

export type TeacherNavId =
  | "inicio"
  | "sesiones"
  | "unidades"
  | "fichas"
  | "tutoriales"
  | "unirme";

export interface TeacherNavItem {
  id: TeacherNavId;
  icon: LucideIcon;
  label: string;
  active: boolean;
  action: () => void;
}

export function useTeacherNav(activeId: TeacherNavId) {
  const navigate = useNavigate();
  const { showLoading } = useGlobalLoading();
  const { isPremium } = usePermissions();

  const go = (path: string, loadingMsg: string) => {
    showLoading(loadingMsg);
    navigate(path);
  };

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const items: TeacherNavItem[] = [
    {
      id: "inicio",
      icon: BookOpen,
      label: "Inicio",
      active: activeId === "inicio",
      action: () =>
        activeId === "inicio" ? scrollTop() : go("/dashboard", "Cargando inicio…"),
    },
    {
      id: "sesiones",
      icon: FileText,
      label: "Sesiones",
      active: activeId === "sesiones",
      action: () =>
        activeId === "sesiones"
          ? scrollTop()
          : go("/mis-sesiones", "Cargando sesiones…"),
    },
    {
      id: "unidades",
      icon: FolderOpen,
      label: "Unidades",
      active: activeId === "unidades",
      action: () =>
        activeId === "unidades"
          ? scrollTop()
          : go("/mis-unidades", "Cargando unidades…"),
    },
    ...(isPremium
      ? [
          {
            id: "fichas" as const,
            icon: ClipboardList,
            label: "Fichas",
            active: activeId === "fichas",
            action: () =>
              activeId === "fichas"
                ? scrollTop()
                : go("/mis-fichas", "Cargando fichas…"),
          },
          {
            id: "unirme" as const,
            icon: KeyRound,
            label: "Unirme",
            active: activeId === "unirme",
            action: () =>
              activeId === "unirme"
                ? scrollTop()
                : go("/unirse-unidad", "Preparando…"),
          },
        ]
      : []),
    {
      id: "tutoriales",
      icon: PlayCircle,
      label: "Tutoriales",
      active: activeId === "tutoriales",
      action: () =>
        activeId === "tutoriales"
          ? scrollTop()
          : go("/tutoriales", "Cargando tutoriales…"),
    },
  ];

  return { navItems: items, mobileNavItems: items.slice(0, 4) };
}
