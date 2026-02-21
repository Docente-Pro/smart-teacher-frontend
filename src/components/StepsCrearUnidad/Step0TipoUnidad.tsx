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
} from "lucide-react";
import type { TipoUnidad } from "@/interfaces/IUnidad";
import type { PlanType } from "@/interfaces/IAuth";
import {
  conectarSocket,
  onSocketEvent,
  joinUserRoom,
} from "@/services/socket.service";
import { useAuthStore } from "@/store/auth.store";

// ── Precios por tipo de unidad ──
const PRECIOS: Record<TipoUnidad, number> = {
  PERSONAL: 20,
  COMPARTIDA: 30,
};

const ADMIN_WHATSAPP = import.meta.env.VITE_ADMIN_WHATSAPP || "51946668370";

interface Props {
  onContinue: (tipo: TipoUnidad, maxMiembros: number) => void;
  isPremium: boolean;
  userEmail?: string;
  userName?: string;
}

/**
 * Pre-paso: el usuario elige si la unidad será PERSONAL o COMPARTIDA.
 * Si elige COMPARTIDA, debe indicar la cantidad máxima de docentes (2-5).
 *
 * - Premium → continúa directo al wizard.
 * - Free → muestra pantalla de pago con precio según tipo,
 *   botón de WhatsApp y espera confirmación por WebSocket.
 */
function Step0TipoUnidad({ onContinue, isPremium, userEmail, userName }: Props) {
  const [tipo, setTipo] = useState<TipoUnidad>("PERSONAL");
  const [maxMiembros, setMaxMiembros] = useState(2);
  const [fase, setFase] = useState<"select" | "payment" | "waiting" | "activated" | "error">(
    "select"
  );

  const cleanupRef = useRef<(() => void) | null>(null);
  const updateUser = useAuthStore((s) => s.updateUser);
  const user = useAuthStore((s) => s.user);

  // ── Helpers ──
  const precio = PRECIOS[tipo];
  const tipoLabel = tipo === "PERSONAL" ? "Personal" : "Compartida";

  /** Genera el link de WhatsApp con mensaje personalizado. */
  const buildWhatsAppUrl = useCallback(() => {
    const nombre = userName || userEmail || "Docente";
    const msg = [
      `¡Hola! Soy ${nombre}.`,
      `Quiero crear una Unidad de Aprendizaje *${tipoLabel}*.`,
      `Precio: *S/. ${precio}.00*`,
      userEmail ? `Correo: ${userEmail}` : "",
      `Gracias 🙌`,
    ]
      .filter(Boolean)
      .join("\n");

    return `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(msg)}`;
  }, [tipoLabel, precio, userEmail, userName]);

  /** Suscribe al socket para escuchar "pago:confirmado". */
  const subscribePayment = useCallback(() => {
    conectarSocket();
    if (user?.id) joinUserRoom(user.id);

    const cleanup = onSocketEvent("pago:confirmado", (payload) => {
      console.log("✅ Pago confirmado via WebSocket:", payload);
      updateUser({
        plan: (payload.plan as PlanType) || "premium_mensual",
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
  const handleContinuar = () => {
    if (isPremium) {
      onContinue(tipo, maxMiembros);
    } else {
      setFase("payment");
    }
  };

  const handleContactWhatsApp = () => {
    try {
      const url = buildWhatsAppUrl();
      window.open(url, "_blank", "noopener,noreferrer");
      subscribePayment();
      setFase("waiting");
    } catch {
      setFase("error");
    }
  };

  const handleVolver = () => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    setFase("select");
  };

  // ═══════════════════════════════════════════
  // RENDER — Vista de pago (free)
  // ═══════════════════════════════════════════

  if (fase === "payment") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="flex flex-col items-center text-center">
            {/* Icono */}
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Crown className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Titulo */}
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Unidad {tipoLabel}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
              Para crear esta unidad necesitas realizar un pago único.
            </p>

            {/* Card de precio */}
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
                    Incluye generación con IA, exportar a PDF, secuencia de sesiones
                    y todos los pasos del wizard.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Botones */}
            <div className="flex flex-col gap-3 w-full">
              <Button
                onClick={handleContactWhatsApp}
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 flex items-center justify-center">
        <div className="max-w-md w-full flex flex-col items-center text-center">
          {/* Animación de espera */}
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
            Esperando confirmación
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-xs">
            Completa el pago de <strong className="text-amber-600">S/. {precio}</strong> por
            la Unidad {tipoLabel} en WhatsApp.
          </p>

          {/* Conexión activa */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-full px-4 py-2 mb-6">
            <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Escuchando confirmación de pago…
            </span>
          </div>

          {/* Pasos */}
          <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6 text-left">
            <ol className="space-y-3">
              <WaitingStep number={1} text="Conversa con nuestro equipo en WhatsApp" done />
              <WaitingStep number={2} text={`Realiza el pago de S/. ${precio}`} />
              <WaitingStep number={3} text="Tu unidad se desbloquea al instante" />
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 flex items-center justify-center">
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
            ¡Pago confirmado!
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 flex items-center justify-center">
        <div className="max-w-md w-full flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/30 mb-6">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Ocurrió un error
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
            No pudimos abrir WhatsApp. Intenta nuevamente.
          </p>
          <div className="flex flex-col gap-2 w-full">
            <Button
              onClick={handleContactWhatsApp}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-3xl mx-auto">
        {/* ── Header ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg mb-6 shadow-lg">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold tracking-wide">ANTES DE EMPEZAR</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-4 tracking-tight">
            ¿Cómo trabajarás tu unidad?
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Elige el tipo de unidad que deseas crear
          </p>
        </div>

        {/* ── Selector PERSONAL / COMPARTIDA ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
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
            <div className="relative p-8 flex flex-col items-center gap-4">
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
                S/. {PRECIOS.PERSONAL}
              </div>

              {tipo === "PERSONAL" && (
                <div className="absolute top-3 right-3 bg-white rounded-full p-1 shadow-lg">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
              )}
            </div>
          </div>

          {/* COMPARTIDA */}
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
            <div className="relative p-8 flex flex-col items-center gap-4">
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

              {/* ── Precio badge ── */}
              <div
                className={`px-3 py-1 rounded-full text-sm font-bold ${
                  tipo === "COMPARTIDA"
                    ? "bg-white/20 text-white"
                    : "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400"
                }`}
              >
                S/. {PRECIOS.COMPARTIDA}
              </div>

              {tipo === "COMPARTIDA" && (
                <div className="absolute top-3 right-3 bg-white rounded-full p-1 shadow-lg">
                  <CheckCircle2 className="h-5 w-5 text-sky-600" />
                </div>
              )}
            </div>
          </div>
        </div>

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
                  Al crear la unidad compartida recibirás un{" "}
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

export default Step0TipoUnidad;
