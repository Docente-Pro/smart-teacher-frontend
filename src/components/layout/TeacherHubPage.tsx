import type { ReactNode } from "react";

interface TeacherHubPageProps {
  children: ReactNode;
  /** full = sin tope de ancho (Dashboard); 7xl = hub estándar */
  maxWidth?: "3xl" | "7xl" | "full";
  className?: string;
}

const widthClass = {
  "3xl": "max-w-3xl",
  "7xl": "max-w-7xl",
  full: "max-w-none",
} as const;

/** Contenedor estándar para pantallas hub dentro de TeacherAppShell */
export default function TeacherHubPage({
  children,
  maxWidth = "7xl",
  className = "",
}: TeacherHubPageProps) {
  return (
    <div
      className={`mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 ${widthClass[maxWidth]} ${className}`}
    >
      {children}
    </div>
  );
}
