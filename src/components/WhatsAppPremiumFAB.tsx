import { useState, useEffect } from "react";
import { Crown, X, MessageCircle } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { usePermissions } from "@/hooks/usePermissions";
import { usePaymentSocket } from "@/hooks/usePaymentSocket";
import { useLocation } from "react-router";

// ── Ícono WhatsApp SVG ──
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ── Rutas donde NO se muestra el botón ── 
const HIDDEN_ROUTES = ["/", "/login", "/register", "/onboarding", "/planes"];

/**
 * Botón flotante de WhatsApp que induce a la compra Premium.
 * - Se muestra solo cuando el usuario está autenticado y NO es premium
 * - Se oculta en rutas públicas (landing, login, etc.)
 * - Al hacer clic inicia el flujo de pago por WhatsApp
 * - Tiene una etiqueta expandible con texto persuasivo
 */
export function WhatsAppPremiumFAB() {
  const user = useAuthStore((s) => s.user);
  const { isPremium, isSuscripcionActiva } = usePermissions();
  const location = useLocation();
  const { status, startPaymentFlow, cancelWaiting, reset } = usePaymentSocket();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Auto-expandir la etiqueta después de 3s la primera vez
  useEffect(() => {
    if (hasAnimated || isDismissed) return;
    const timer = setTimeout(() => {
      setIsExpanded(true);
      setHasAnimated(true);
      // Auto-colapsar después de 5s
      setTimeout(() => setIsExpanded(false), 5000);
    }, 3000);
    return () => clearTimeout(timer);
  }, [hasAnimated, isDismissed]);

  // Reset hasDismissed cuando cambia de ruta
  useEffect(() => {
    setIsDismissed(false);
  }, [location.pathname]);

  // ── No mostrar si: no hay usuario, es premium con suscripción activa, ruta pública, o fue descartado ──
  const isHiddenRoute = HIDDEN_ROUTES.some((r) => location.pathname === r);
  if (!user || (isPremium && isSuscripcionActiva) || isHiddenRoute || isDismissed) {
    return null;
  }

  const handleClick = () => {
    startPaymentFlow();
  };

  // Si está esperando confirmación, mostrar estado especial
  if (status === "waiting") {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center gap-3 max-w-xs">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Crown className="w-5 h-5 text-white animate-bounce" style={{ animationDuration: "2s" }} />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Esperando activación...
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Completa el pago en WhatsApp
            </p>
          </div>
          <button
            onClick={() => { cancelWaiting(); reset(); }}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    );
  }

  // Si se activó, mostrar éxito briefmente
  if (status === "activated") {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-3">
          <Crown className="w-5 h-5" />
          <span className="text-sm font-bold">¡Premium activado!</span>
          <span className="text-lg">🎉</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 select-none">
      {/* ── Dismiss tiny button (solo cuando expandido) ── */}
      {isExpanded && (
        <button
          onClick={(e) => { e.stopPropagation(); setIsDismissed(true); }}
          className="self-end mr-1 p-1 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-md hover:bg-white dark:hover:bg-slate-700 transition-all opacity-70 hover:opacity-100"
          aria-label="Cerrar"
        >
          <X className="w-3 h-3 text-slate-500" />
        </button>
      )}

      {/* ── Contenedor del botón + etiqueta ── */}
      <div
        className="flex items-center gap-0 cursor-pointer group"
        onClick={handleClick}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => { if (hasAnimated) setIsExpanded(false); }}
      >
        {/* Etiqueta expandible */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-out ${
            isExpanded ? "max-w-72 opacity-100" : "max-w-0 opacity-0"
          }`}
        >
          <div className="bg-white dark:bg-slate-800 rounded-l-2xl shadow-2xl border border-r-0 border-slate-200 dark:border-slate-700 pl-4 pr-2 py-3 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  ¡Quiero ser Premium!
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  Desbloquea todo el poder de la IA
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botón circular WhatsApp */}
        <div className="relative">
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-full bg-green-400/30 animate-ping" style={{ animationDuration: "3s" }} />

          <button
            className={`relative w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 
              text-white shadow-lg shadow-green-500/40 
              hover:shadow-xl hover:shadow-green-500/50 hover:scale-110
              active:scale-95
              transition-all duration-300 ease-out
              flex items-center justify-center
              ${isExpanded ? "rounded-l-none rounded-r-full" : ""}
              ${status === "loading" ? "opacity-70 pointer-events-none" : ""}
            `}
            disabled={status === "loading"}
            aria-label="Contactar por WhatsApp para ser Premium"
          >
            {status === "loading" ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <WhatsAppIcon className="w-7 h-7" />
            )}
          </button>

          {/* Badge crown */}
          <div className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900">
            <Crown className="w-3 h-3 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default WhatsAppPremiumFAB;
