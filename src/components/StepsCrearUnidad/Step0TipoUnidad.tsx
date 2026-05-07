import { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  User,
  Share2,
  Users,
  AlertCircle,
  Crown,
  MessageCircle,
  Loader2,
  PartyPopper,
  Rocket,
  Check,
  ArrowLeft,
  HelpCircle,
  X,
  ShieldCheck,
} from "lucide-react";
import type { TipoUnidad, IUnidadPrecios } from "@/interfaces/IUnidad";
import {
  conectarSocket,
  onSocketEvent,
  joinUserRoom,
} from "@/services/socket.service";
import { getUnidadPrecios, preSolicitarPagoUnidad } from "@/services/unidad.service";
import { useAuthStore } from "@/store/auth.store";

// ── Precios fallback (si el endpoint falla) ──
const PRECIOS_DEFAULT: IUnidadPrecios = {
  propietario: 20,
  suscriptor: 10,
};

interface Props {
  onContinue: (tipo: TipoUnidad, maxMiembros: number) => void;
  isPremium: boolean;
  onBack?: () => void;
  /** Secundaria: solo unidad personal (no compartida). */
  soloPersonalSecundaria?: boolean;
}

/**
 * Pre-paso: el usuario elige si la unidad será PERSONAL o COMPARTIDA.
 *
 * - Premium → continúa directo al wizard.
 * - Free → llama a POST /api/unidades/pago/propietario/pre-solicitar { tipo }
 *   → abre whatsappLink → espera WS pago:confirmado { accion: "CREAR_UNIDAD" }
 *   → desbloquea wizard.
 */
function Step0TipoUnidad({ onContinue, isPremium, onBack, soloPersonalSecundaria }: Props) {
  const [tipo, setTipo] = useState<TipoUnidad>("PERSONAL");
  const [maxMiembros, setMaxMiembros] = useState(2);
  const [fase, setFase] = useState<"select" | "payment" | "waiting" | "activated" | "error">(
    "select"
  );
  const [precios, setPrecios] = useState<IUnidadPrecios>(PRECIOS_DEFAULT);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showExplain, setShowExplain] = useState(false);

  const cleanupRef = useRef<(() => void) | null>(null);
  const updateUser = useAuthStore((s) => s.updateUser);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (soloPersonalSecundaria) setTipo("PERSONAL");
  }, [soloPersonalSecundaria]);

  // ── Cargar precios dinámicos ──
  useEffect(() => {
    let cancelled = false;
    async function fetchPrecios() {
      try {
        const res = await getUnidadPrecios();
        if (!cancelled && res?.data) {
          setPrecios({
            propietario:
              typeof res.data.propietario === "number"
                ? res.data.propietario
                : PRECIOS_DEFAULT.propietario,
            suscriptor:
              typeof res.data.suscriptor === "number"
                ? res.data.suscriptor
                : PRECIOS_DEFAULT.suscriptor,
          });
        }
      } catch (err) {
        // No se pudieron cargar precios, usar valores por defecto
      }
    }
    fetchPrecios();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Helpers ──
  const precio = precios.propietario;
  const tipoLabel = tipo === "PERSONAL" ? "Personal" : "Compartida";

  /** Suscribe al socket para escuchar "pago:confirmado" con acción CREAR_UNIDAD. */
  const subscribePayment = useCallback(() => {
    conectarSocket();
    if (user?.id) joinUserRoom(user.id);

    const cleanup = onSocketEvent("pago:confirmado", (payload) => {

      // Actualizar usuario a premium
      const planActualizado = (payload.planActualizado as string) || payload.plan || "premium_mensual";
      updateUser({
        plan: planActualizado as "premium_mensual" | "premium_anual",
        suscripcionActiva: true,
      });

      setFase("activated");
    });

    cleanupRef.current = cleanup;
  }, [user?.id, updateUser]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
  }, []);

  // Auto-continuar al activarse el pago
  useEffect(() => {
    if (fase === "activated") {
      const timer = setTimeout(() => {
        onContinue(tipo, maxMiembros);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [fase, tipo, maxMiembros, onContinue]);

  // ── Handlers ──

  /** Premium → continúa directo. Free → muestra resumen de pago. */
  const handleContinuar = () => {
    if (isPremium) {
      onContinue(tipo, maxMiembros);
    } else {
      setFase("payment");
    }
  };

  /** Llama a pre-solicitar → abre whatsappLink → escucha WS. */
  const handleSolicitarPago = async () => {
    try {
      setErrorMsg(null);
      const res = await preSolicitarPagoUnidad({ tipo, usuarioId: user?.id ?? "" });
      const { whatsappLink } = res.data;

      window.open(whatsappLink, "_blank", "noopener,noreferrer");
      subscribePayment();
      setFase("waiting");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Error al solicitar el pago.";
      setErrorMsg(msg);
      setFase("error");
    }
  };

  const handleVolver = () => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    setErrorMsg(null);
    setFase("select");
  };

  // ═══════════════════════════════════════════
  // RENDER — Pantalla de pago (free)
  // ═══════════════════════════════════════════

  if (fase === "payment") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-3 sm:p-6 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Crown className="w-8 h-8 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Unidad {tipoLabel}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
              Para crear esta unidad necesitas activar tu plan Premium.
            </p>

            <Card className="w-full mb-6 border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {tipo === "PERSONAL" ? (
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                        <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900/40">
                        <Share2 className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                      </div>
                    )}
                    <div className="text-left">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        Unidad {tipoLabel}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {tipo === "PERSONAL"
                          ? "Individual — solo tú"
                          : `Compartida — hasta ${maxMiembros} docentes`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                      S/. {precio}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">pago único</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg bg-white/70 dark:bg-slate-800/50 border border-amber-200/50 dark:border-amber-700/30">
                  <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Incluye plan Premium, generación con IA, exportar a PDF,
                    secuencia de sesiones y todos los pasos del wizard.
                    {tipo === "COMPARTIDA" && (
                      <> Cada colega que se una paga S/. {precios.suscriptor} aparte.</>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3 w-full">
              <Button
                onClick={handleSolicitarPago}
                className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-green-500/25 transition-all text-base"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Pagar por WhatsApp
              </Button>
              <Button
                onClick={handleVolver}
                variant="ghost"
                className="w-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Cambiar tipo de unidad
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (fase === "waiting") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-3 sm:p-6 flex items-center justify-center">
        <div className="max-w-md w-full flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 w-24 h-24 -m-2 rounded-full bg-amber-400/20 animate-ping" />
            <div className="absolute inset-0 w-20 h-20 rounded-full bg-amber-400/10 animate-pulse" />
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/30">
              <Crown
                className="w-10 h-10 text-white animate-bounce"
                style={{ animationDuration: "2s" }}
              />
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Esperando confirmación de pago
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-xs">
            Completa el pago de <strong className="text-amber-600">S/. {precio}</strong> por
            la Unidad {tipoLabel} en WhatsApp.
          </p>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-full px-4 py-2 mb-6">
            <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Escuchando confirmación de pago…
            </span>
          </div>

          <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6 text-left">
            <ol className="space-y-3">
              <WaitingStep number={1} text="Conversa con nuestro equipo en WhatsApp" done />
              <WaitingStep number={2} text={`Realiza el pago de S/. ${precio}`} />
              <WaitingStep number={3} text="Tu plan se activa al instante" />
            </ol>
          </div>

          <Button
            onClick={handleVolver}
            variant="ghost"
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
          >
            Cancelar y volver
          </Button>
        </div>
      </div>
    );
  }

  if (fase === "activated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-3 sm:p-6 flex items-center justify-center">
        <div className="max-w-md w-full flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div
              className="absolute inset-0 w-24 h-24 -m-2 rounded-full bg-emerald-400/20 animate-ping"
              style={{ animationDuration: "1.5s" }}
            />
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-xl shadow-emerald-500/30">
              <PartyPopper className="w-10 h-10 text-white" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            ¡Plan Premium activado!
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
            Ya puedes crear tu Unidad de Aprendizaje {tipoLabel} con IA.
          </p>

          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-full px-4 py-2">
            <Rocket className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Iniciando wizard…
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (fase === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-3 sm:p-6 flex items-center justify-center">
        <div className="max-w-md w-full flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/30 mb-6">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Ocurrió un error
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
            {errorMsg || "No pudimos procesar el pago. Intenta nuevamente."}
          </p>
          <div className="flex flex-col gap-2 w-full">
            <Button
              onClick={handleSolicitarPago}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
            >
              Reintentar
            </Button>
            <Button
              onClick={handleVolver}
              variant="ghost"
              className="w-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            >
              Volver
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // RENDER — Vista de selección de tipo (default)
  // ═══════════════════════════════════════════

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-3 sm:p-6">
      <div className="max-w-3xl mx-auto">
        {/* ── Volver al Dashboard ── */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-6 -ml-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </button>
        )}
        {/* ── Header ── */}
        <div className="text-center mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg mb-6 shadow-lg">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold tracking-wide">ANTES DE EMPEZAR</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-4 tracking-tight">
            {soloPersonalSecundaria
              ? "Tu unidad en secundaria es personal"
              : "¿Cómo trabajarás tu unidad?"}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {soloPersonalSecundaria
              ? "Las unidades compartidas no aplican en secundaria. Continúa con tu unidad personal."
              : "Elige el tipo de unidad que deseas crear"}
          </p>
        </div>

        {/* ── Selector PERSONAL / COMPARTIDA ── */}
        <div
          className={`grid grid-cols-1 gap-6 mb-8 ${soloPersonalSecundaria ? "" : "sm:grid-cols-2"}`}
        >
          {/* PERSONAL */}
          <div
            onClick={() => setTipo("PERSONAL")}
            className={`
              group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300
              ${
                tipo === "PERSONAL"
                  ? "ring-4 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900 scale-[1.02] shadow-2xl"
                  : "hover:scale-[1.02] hover:shadow-xl border-2 border-slate-200 dark:border-slate-700"
              }
            `}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 transition-opacity duration-300 ${
                tipo === "PERSONAL" ? "opacity-100" : "opacity-10 group-hover:opacity-20"
              }`}
            />
            <div className="relative p-4 sm:p-8 flex flex-col items-center gap-4">
              <div
                className={`p-4 rounded-xl transition-transform duration-300 ${
                  tipo === "PERSONAL"
                    ? "bg-white/20 backdrop-blur-sm scale-110"
                    : "bg-slate-100 dark:bg-slate-800 group-hover:scale-110"
                }`}
              >
                <User
                  className={`h-10 w-10 ${
                    tipo === "PERSONAL" ? "text-white" : "text-slate-600 dark:text-slate-400"
                  }`}
                />
              </div>
              <div className="text-center">
                <p
                  className={`text-xl font-bold mb-1 ${
                    tipo === "PERSONAL" ? "text-white" : "text-slate-900 dark:text-white"
                  }`}
                >
                  Personal
                </p>
                <p
                  className={`text-sm ${
                    tipo === "PERSONAL" ? "text-white/80" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  Creas y gestionas la unidad individualmente
                </p>
              </div>

              {/* ── Precio badge ── */}
              <div
                className={`px-3 py-1 rounded-full text-sm font-bold ${
                  tipo === "PERSONAL"
                    ? "bg-white/20 text-white"
                    : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                }`}
              >
                S/. {precios.propietario}
              </div>

              {tipo === "PERSONAL" && (
                <div className="absolute top-3 right-3 bg-white rounded-full p-1 shadow-lg">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
              )}
            </div>
          </div>

          {/* COMPARTIDA — oculta en secundaria */}
          {!soloPersonalSecundaria && (
          <div
            onClick={() => setTipo("COMPARTIDA")}
            className={`
              group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300
              ${
                tipo === "COMPARTIDA"
                  ? "ring-4 ring-sky-500 ring-offset-2 dark:ring-offset-slate-900 scale-[1.02] shadow-2xl"
                  : "hover:scale-[1.02] hover:shadow-xl border-2 border-slate-200 dark:border-slate-700"
              }
            `}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br from-sky-500 to-blue-500 transition-opacity duration-300 ${
                tipo === "COMPARTIDA" ? "opacity-100" : "opacity-10 group-hover:opacity-20"
              }`}
            />
            <div className="relative p-4 sm:p-8 flex flex-col items-center gap-4">
              <div
                className={`p-4 rounded-xl transition-transform duration-300 ${
                  tipo === "COMPARTIDA"
                    ? "bg-white/20 backdrop-blur-sm scale-110"
                    : "bg-slate-100 dark:bg-slate-800 group-hover:scale-110"
                }`}
              >
                <Share2
                  className={`h-10 w-10 ${
                    tipo === "COMPARTIDA" ? "text-white" : "text-slate-600 dark:text-slate-400"
                  }`}
                />
              </div>
              <div className="text-center">
                <p
                  className={`text-xl font-bold mb-1 ${
                    tipo === "COMPARTIDA" ? "text-white" : "text-slate-900 dark:text-white"
                  }`}
                >
                  Compartida
                </p>
                <p
                  className={`text-sm ${
                    tipo === "COMPARTIDA" ? "text-white/80" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  Colabora con otros docentes en la misma unidad
                </p>
              </div>

              {/* ── Precio badges ── */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`px-3 py-1 rounded-full text-sm font-bold ${
                    tipo === "COMPARTIDA"
                      ? "bg-white/20 text-white"
                      : "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400"
                  }`}
                >
                  S/. {precios.propietario}
                </div>
                <span
                  className={`text-xs ${
                    tipo === "COMPARTIDA"
                      ? "text-white/70"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  + S/. {precios.suscriptor} por miembro
                </span>
              </div>

              {tipo === "COMPARTIDA" && (
                <div className="absolute top-3 right-3 bg-white rounded-full p-1 shadow-lg">
                  <CheckCircle2 className="h-5 w-5 text-sky-600" />
                </div>
              )}
            </div>
          </div>
          )}
        </div>

        {/* ── Info contextual según tipo ── */}
        {tipo === "PERSONAL" ? (
          <div className="flex items-center justify-center gap-3 mb-6 px-5 py-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex-shrink-0 p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              ✨ Tú serás el encargado de crear y gestionar <strong>todas las sesiones</strong> de esta unidad.
            </p>
          </div>
        ) : (
          <div className="flex justify-center mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <button
              onClick={() => setShowExplain(true)}
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-800 shadow-sm hover:shadow-md hover:border-sky-400 dark:hover:border-sky-600 transition-all duration-300 text-sm font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300"
            >
              <HelpCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
              ¿Cómo funciona la unidad compartida?
            </button>
          </div>
        )}

        {/* ── Modal — Cómo funciona Compartida ── */}
        {showExplain && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setShowExplain(false)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            <div
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={() => setShowExplain(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors z-10"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Header */}
              <div className="bg-gradient-to-br from-sky-500 to-blue-600 px-6 pt-7 pb-5 rounded-t-3xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Unidad Compartida</h2>
                </div>
              </div>

              {/* Steps — visual y conciso */}
              <div className="p-5 space-y-4">
                {/* 1 */}
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 text-xs font-bold flex items-center justify-center">1</span>
                  <p className="text-sm text-slate-600 dark:text-slate-400 pt-0.5">
                    Tú creas la unidad y defines cuántos docentes pueden unirse <strong className="text-slate-800 dark:text-white">(máx. 5)</strong>
                  </p>
                </div>

                {/* 2 */}
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 text-xs font-bold flex items-center justify-center">2</span>
                  <p className="text-sm text-slate-600 dark:text-slate-400 pt-0.5">
                    Recibirás un <strong className="text-violet-600 dark:text-violet-400">código de invitación</strong> para compartir con tus colegas
                  </p>
                </div>

                {/* 3 */}
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 text-xs font-bold flex items-center justify-center">3</span>
                  <p className="text-sm text-slate-600 dark:text-slate-400 pt-0.5">
                    Cada colega que se una paga <strong className="text-sky-600 dark:text-sky-400">S/. {precios.suscriptor}</strong> por separado
                  </p>
                </div>

                {/* Resumen precios */}
                <div className="mt-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600 dark:text-slate-300">👤 Propietario (tú)</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">S/. {precios.propietario}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-300">👥 Cada miembro</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">S/. {precios.suscriptor}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 pb-5">
                <Button
                  onClick={() => setShowExplain(false)}
                  className="w-full h-11 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg"
                >
                  ¡Entendido! 👍
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Configuración COMPARTIDA ── */}
        {tipo === "COMPARTIDA" && (
          <Card className="mb-8 border-2 border-sky-200 dark:border-sky-800 shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="h-5 w-5 text-sky-600" />
                Configuración Compartida
              </CardTitle>
              <CardDescription>
                Establece la cantidad de docentes que participarán
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="maxMiembros" className="text-sm font-medium mb-1.5 block">
                  Máximo de Docentes
                </Label>
                <Input
                  id="maxMiembros"
                  type="number"
                  min={2}
                  max={5}
                  value={maxMiembros}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setMaxMiembros(Math.min(5, Math.max(2, v)));
                  }}
                  className="h-12 text-base max-w-[200px]"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Entre 2 y 5 docentes pueden colaborar en la unidad
                </p>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800">
                <AlertCircle className="h-4 w-4 text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-sky-700 dark:text-sky-300">
                  Al completar el pago de la unidad recibirás un{" "}
                  <strong>código de invitación</strong> que podrás compartir con los demás
                  docentes.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Botón Continuar ── */}
        <div className="flex justify-center pb-10">
          <Button
            onClick={handleContinuar}
            className="h-14 px-10 text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            Continuar
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Step0TipoUnidad;

// ── Sub-componente de paso en espera ──
function WaitingStep({
  number,
  text,
  done,
}: {
  number: number;
  text: string;
  done?: boolean;
}) {
  return (
    <li className="flex items-center gap-3">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
          done
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400"
            : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
        }`}
      >
        {done ? <Check className="w-3.5 h-3.5" /> : number}
      </div>
      <span
        className={`text-sm ${
          done
            ? "text-emerald-700 dark:text-emerald-400"
            : "text-slate-600 dark:text-slate-400"
        }`}
      >
        {text}
      </span>
    </li>
  );
}
