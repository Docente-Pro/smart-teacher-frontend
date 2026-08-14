import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

interface TeacherShellContextValue {
  openUpgradeModal: () => void;
  logout: () => void;
}

const TeacherShellContext = createContext<TeacherShellContextValue | null>(
  null,
);

export function TeacherShellProvider({
  value,
  children,
}: {
  value: TeacherShellContextValue;
  children: ReactNode;
}) {
  return (
    <TeacherShellContext.Provider value={value}>
      {children}
    </TeacherShellContext.Provider>
  );
}

export function useTeacherShell() {
  const ctx = useContext(TeacherShellContext);
  if (!ctx) {
    throw new Error("useTeacherShell must be used within TeacherAppShell");
  }
  return ctx;
}
