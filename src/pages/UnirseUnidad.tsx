import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Crown,
  MessageCircle,
  PartyPopper,
  Rocket,
  AlertCircle,
  Check,
  Users,
  Sparkles,
} from "lucide-react";
import {
  unirseAUnidad,
  solicitarPagoSuscriptor,
  getUnidadPrecios,
  getUnidadDetalleSuscriptor,
} from "@/services/unidad.service";
import {
  conectarSocket,
  onSocketEvent,
  joinUserRoom,
} from "@/services/socket.service";
import { useAuthStore } from "@/store/auth.store";
import type { PlanType } from "@/interfaces/IAuth";
import type { IUnidadPrecios } from "@/interfaces/IUnidad";

// ── Precios fallback ──
const PRECIOS_DEFAULT: IUnidadPrecios = {
  propietario: 20,
  suscriptor: 10,
};

type Fase =
  | "codigo"      // Ingresa código de invitación
  | "joining"     // Llamando a POST /unirse
  | "payment"     // Muestra precio S/.10 + botón WhatsApp
  | "waiting"     // Esperando confirmación por socket
  | "activated"   // Pago confirmado → acceso a la unidad
  | "error";      // Error genérico

/**
 * Página para que un suscriptor se una a una unidad compartida.
 *
 * Flujo:
 * 1. Ingresa código de invitación
 * 2. POST /api/unidades/unirse → estado PENDIENTE + monto S/.10
 * 3. POST /api/unidades/pago/suscriptor/solicitar → whatsappUrl
 * 4. Abre WhatsApp, escucha pago:confirmado
 * 5. Confirma → membresía activa + upgrade premium
 */
function UnirseUnidad() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [fase, setFase] = useState<Fase>("codigo");
  const [codigo, setCodigo] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [unidadId, setUnidadId] = useState<string | null>(null);
  const [unidadTitulo, setUnidadTitulo] = useState<string>("Unidad Compartida");
  const [monto, setMonto] = useState(10);
  const [precios, setPrecios] = useState<IUnidadPrecios>(PRECIOS_DEFAULT);

  const cleanupRef = useRef<(() => void) | null>(null);

  // ── Cargar precios dinámicos ──
  useEffect(() => {
    let cancelled = false;
    async function fetchPrecios() {
      try {
        const res = await getUnidadPrecios();
        if (!cancelled && res.data) setPrecios(res.data);
      } catch {
        // usar defaults
      }
    }
    fetchPrecios();
    return () => { cancelled = true; };
  }, []);

  // ── Cleanup socket al desmontar ──
  useEffect(() => {
    return () => { cleanupRef.current?.(); };
  }, []);

  // ── Auto-redirect tras activación → obtener unidad y generar PDF ──
  useEffect(() => {
    if (fase !== "activated") return;

    let cancelled = false;

    const redirigir = async () => {
      if (unidadId && user?.id) {
        try {
          const unidad = await getUnidadDetalleSuscriptor(unidadId, user.id);
          if (!cancelled && unidad?.contenido) {
            navigate("/unidad-suscriptor-result", { state: { unidad } });
            return;
          }
        } catch (err) {
          console.error("⚠️ Error al obtener detalle de unidad:", err);
        }
      }

      // Fallback si no se pudo cargar el detalle
      if (!cancelled) navigate("/mis-unidades");
    };

    redirigir();
    return () => { cancelled = true; };
  }, [fase, unidadId, user?.id, navigate]);

  // ── Handlers ──

  /** Paso 1: envía código → POST /unidad/unirse */
  const handleUnirse = useCallback(async () => {
    if (!codigo.trim()) {
      setErrorMsg("Ingresa un código de invitación");
      return;
    }

    setFase("joining");
    setErrorMsg(null);

    try {
      const res = await unirseAUnidad({ codigo: codigo.trim() });
      console.log("📋 [UnirseUnidad] Respuesta unirse:", res.data);

      const { unidadId: _unidadId, estadoPago, montoPendiente, unidadTitulo: _titulo } = res.data;

      setUnidadId(_unidadId);
      setUnidadTitulo(_titulo || "Unidad Compartida");
      setMonto(montoPendiente || precios.suscriptor);

      if (estadoPago === "CONFIRMADO") {
        // Ya pagado → directo
        setFase("activated");
      } else {
        // PENDIENTE → mostrar pantalla de pago
        setFase("payment");
      }
    } catch (err: any) {
      const status = err?.response?.status;
      let msg: string;

      if (status === 403) {
        msg =
          "El propietario de esta unidad aún no ha activado su pago. " +
          "Pídele que complete el pago primero para que puedas unirte.";
      } else {
        msg =
          err?.response?.data?.message ||
          err?.message ||
          "No se pudo unir a la unidad. Verifica el código.";
      }

      setErrorMsg(msg);
      setFase("error");
    }
  }, [codigo, precios.suscriptor]);

  /** Suscribe al socket para escuchar confirmación. */
  const subscribePayment = useCallback(() => {
    conectarSocket();
    if (user?.id) joinUserRoom(user.id);

    const cleanup = onSocketEvent("pago:confirmado", (payload) => {
      console.log("✅ Pago suscriptor confirmado:", payload);
      updateUser({
        plan: (payload.plan as PlanType) || "premium_mensual",
        suscripcionActiva: true,
      });
      setFase("activated");
    });

    cleanupRef.current = cleanup;
  }, [user?.id, updateUser]);

  /** Paso 2: solicitar pago suscriptor → abrir WhatsApp */
  const handlePagar = useCallback(async () => {
    if (!unidadId) {
      console.error("❌ [UnirseUnidad] No hay unidadId para solicitar pago");
      setErrorMsg("Error: no se recibió el ID de la unidad. Intenta unirte de nuevo.");
      setFase("error");
      return;
    }

    try {
      const res = await solicitarPagoSuscriptor({ unidadId });
      const { whatsappLink } = res.data;
      console.log("📲 [UnirseUnidad] Respuesta pago suscriptor:", res.data);

      if (!whatsappLink) {
        throw new Error("No se recibió el enlace de WhatsApp del servidor.");
      }

      // Abrir WhatsApp
      window.open(whatsappLink, "_blank", "noopener,noreferrer");

      // Escuchar confirmación por socket
      subscribePayment();
      setFase("waiting");
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message || err?.message || "Error al solicitar el pago"
      );
      setFase("error");
    }
  }, [unidadId, subscribePayment]);

  /** Volver al inicio */
  const handleVolver = () => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    setFase("codigo");
    setErrorMsg(null);
    setUnidadId(null);
    setUnidadTitulo("Unidad Compartida");
  };

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════

  const containerClass =
    "min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 flex items-center justify-center";

  // ── Vista: ingresar código ──
  if (fase === "codigo") {
    return (
      <div className={containerClass}>
        <div className="max-w-md w-full">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-lg shadow-sky-500/30 mb-6">
              <KeyRound className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Unirse a una Unidad
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-xs">
              Ingresa el código de invitación que te compartió el propietario de la unidad.
            </p>

            <div className="w-full space-y-4">
              <Input
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                placeholder="Ej: ABC123"
                className="h-14 text-center text-2xl tracking-[0.3em] font-mono uppercase"
                maxLength={10}
                onKeyDown={(e) => e.key === "Enter" && handleUnirse()}
              />

              {errorMsg && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
                </div>
              )}

              <Button
                onClick={handleUnirse}
                disabled={!codigo.trim()}
                className="w-full h-12 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-sky-500/25 transition-all text-base"
              >
                Unirme
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <Button
                onClick={() => navigate("/dashboard")}
                variant="ghost"
                className="w-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Volver al dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Vista: joining (loading) ──
  if (fase === "joining") {
    return (
      <div className={containerClass}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Verificando código de invitación…
          </p>
        </div>
      </div>
    );
  }

  // ── Vista: pago suscriptor ──
  if (fase === "payment") {
    return (
      <div className={containerClass}>
        <div className="max-w-md w-full">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-6">
              <Crown className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Pago de Membresía
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
              Para unirte a esta unidad necesitas realizar un pago único.
            </p>

            {/* Card info unidad + precio */}
            <Card className="w-full mb-6 border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900/40">
                      <Users className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {unidadTitulo}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Membresía de suscriptor
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                      S/. {monto || precios.suscriptor || 10}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">pago único</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg bg-white/70 dark:bg-slate-800/50 border border-amber-200/50 dark:border-amber-700/30">
                  <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Acceso completo a la unidad compartida, generación con IA,
                    exportar a PDF y plan Premium activo.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Botones */}
            <div className="flex flex-col gap-3 w-full">
              <Button
                onClick={handlePagar}
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
                Usar otro código
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Vista: esperando confirmación ──
  if (fase === "waiting") {
    return (
      <div className={containerClass}>
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
            Esperando confirmación
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-xs">
            Completa el pago de{" "}
            <strong className="text-amber-600">S/. {monto}</strong> en WhatsApp
            para activar tu membresía.
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
              <WaitingStep number={2} text={`Realiza el pago de S/. ${monto}`} />
              <WaitingStep number={3} text="Tu membresía se activa al instante" />
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

  // ── Vista: activado ──
  if (fase === "activated") {
    return (
      <div className={containerClass}>
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
            ¡Membresía activada!
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
            Ya tienes acceso a{" "}
            <strong>{unidadTitulo || "la unidad compartida"}</strong>.
            Tu plan Premium está activo.
          </p>

          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-full px-4 py-2">
            <Rocket className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Preparando tu unidad personalizada…
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Cargando contenido…
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── Vista: error ──
  return (
    <div className={containerClass}>
      <div className="max-w-md w-full flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/30 mb-6">
          <AlertCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Ocurrió un error
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
          {errorMsg || "No pudimos procesar tu solicitud. Intenta nuevamente."}
        </p>
        <div className="flex flex-col gap-2 w-full">
          <Button
            onClick={handleVolver}
            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold"
          >
            Intentar de nuevo
          </Button>
          <Button
            onClick={() => navigate("/dashboard")}
            variant="ghost"
            className="w-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
          >
            Volver al dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Sub-componente ──
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

export default UnirseUnidad;
