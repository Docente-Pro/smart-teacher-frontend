import { useEffect, useState } from "react";

interface GlobalLoadingProps {
  message?: string;
}

export const GlobalLoading = ({ message = "Cargando..." }: GlobalLoadingProps) => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="flex flex-col items-center gap-8">
        {/* Logo animado con diseño BBVA */}
        <div className="relative">
          {/* Anillo exterior con gradiente */}
          <div
            className="w-28 h-28 rounded-full border-[3px] border-transparent bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 animate-spin"
            style={{
              backgroundClip: "padding-box",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              padding: "3px",
            }}
          />

          {/* Círculo central con gradiente sutil */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-slate-100 shadow-2xl flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white dark:text-slate-900 animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
          </div>

          {/* Partículas decorativas */}
          <div className="absolute -inset-4">
            <div className="absolute top-0 left-1/2 w-2 h-2 rounded-full bg-indigo-500 animate-ping" style={{ animationDelay: "0s" }} />
            <div className="absolute bottom-0 right-1/4 w-2 h-2 rounded-full bg-blue-500 animate-ping" style={{ animationDelay: "0.3s" }} />
            <div className="absolute top-1/2 right-0 w-2 h-2 rounded-full bg-cyan-500 animate-ping" style={{ animationDelay: "0.6s" }} />
          </div>
        </div>

        {/* Texto con estilo BBVA */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {message}
            <span className="inline-block w-8 text-left">{dots}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
