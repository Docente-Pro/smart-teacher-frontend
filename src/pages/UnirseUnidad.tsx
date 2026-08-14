import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  KeyRound,
  ArrowRight,
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
import "@fontsource/nunito/600.css";
import "@fontsource/nunito/700.css";
import "@fontsource/nunito/800.css";
import TeacherAppShell from "@/components/layout/TeacherAppShell";
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
import { useQueryClient } from "@tanstack/react-query";

// ── Precios fallback ──
const PRECIOS_DEFAULT: IUnidadPrecios = {
  propietario: 20,
  suscriptor: 10,
};

type Fase =
  | "codigo"
  | "joining"
  | "payment"
  | "waiting"
  | "activated"
  | "error";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F7FA]";
const liftable = "dp-press dp-lift";
const cardShadow = "shadow-[0_8px_28px_rgba(31,41,55,0.05)]";

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
  const queryClient = useQueryClient();
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
        await queryClient.invalidateQueries({
          queryKey: ["userUnidades", user.id],
        });

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
  }, [fase, unidadId, user?.id, navigate, queryClient]);

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

  return (
    <TeacherAppShell activeNav="unirme">
      <main className="mx-auto flex w-full max-w-md flex-col justify-center px-4 py-8 sm:px-6 sm:py-12">
        {fase === "codigo" && (
          <div className="dp-enter flex flex-col items-center text-center">
            <div
              className={`mb-6 grid h-16 w-16 place-items-center rounded-[20px] bg-[#EAF2FC] text-[#3B6CB5] ${cardShadow}`}
            >
              <KeyRound className="h-8 w-8" aria-hidden="true" />
            </div>

            <h1 className="text-2xl font-extrabold text-[#1F2937] sm:text-3xl">
              Unirme a una unidad
            </h1>
            <p className="mt-2 max-w-xs text-sm font-semibold leading-relaxed text-[#6B7280]">
              Ingresa el código que te compartió el propietario de la unidad.
            </p>

            <div className="mt-8 w-full space-y-4">
              <Input
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                placeholder="Ej: ABC123"
                className={`${focusRing} h-14 rounded-[16px] border-[#E6EBF2] text-center font-mono text-2xl uppercase tracking-[0.3em]`}
                maxLength={10}
                onKeyDown={(e) => e.key === "Enter" && handleUnirse()}
                aria-label="Código de invitación"
              />

              {errorMsg && (
                <div className="flex items-start gap-2 rounded-[14px] border border-[#FECACA] bg-[#FEF2F2] p-3 text-left">
                  <AlertCircle
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]"
                    aria-hidden="true"
                  />
                  <p className="text-sm font-semibold text-[#B91C1C]">
                    {errorMsg}
                  </p>
                </div>
              )}

              <Button
                onClick={handleUnirse}
                disabled={!codigo.trim()}
                className={`${focusRing} ${liftable} dp-cta-soft-pattern h-12 w-full rounded-[18px] bg-[#FF8B5C] text-base font-extrabold text-white shadow-[0_12px_28px_rgba(255,139,92,0.24)] hover:bg-[#F97316] disabled:opacity-50`}
              >
                Unirme
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}

        {fase === "joining" && (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <Loader2
              className="h-10 w-10 animate-spin text-[#3B6CB5]"
              aria-hidden="true"
            />
            <p className="text-base font-semibold text-[#6B7280]">
              Verificando código de invitación…
            </p>
          </div>
        )}

        {fase === "payment" && (
          <div className="dp-enter flex flex-col items-center text-center">
            <div
              className={`mb-6 grid h-16 w-16 place-items-center rounded-[20px] bg-[#FFF0E8] text-[#EA580C] ${cardShadow}`}
            >
              <Crown className="h-8 w-8" aria-hidden="true" />
            </div>

            <h2 className="text-2xl font-extrabold text-[#1F2937]">
              Pago de membresía
            </h2>
            <p className="mt-2 max-w-xs text-sm font-semibold text-[#6B7280]">
              Para unirte a esta unidad necesitas realizar un pago único.
            </p>

            <div
              className={`mt-6 w-full rounded-[24px] border border-[#E6EBF2] bg-white p-6 text-left ${cardShadow}`}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[#EAF2FC] text-[#3B6CB5]">
                    <Users className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 text-left">
                    <p className="truncate font-extrabold text-[#1F2937]">
                      {unidadTitulo}
                    </p>
                    <p className="text-xs font-semibold text-[#6B7280]">
                      Membresía de suscriptor
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-3xl font-extrabold tabular-nums text-[#EA580C]">
                    S/. {monto || precios.suscriptor || 10}
                  </p>
                  <p className="text-xs font-semibold text-[#9CA3AF]">
                    pago único
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-[14px] border border-[#E6EBF2] bg-[#F5F7FA] p-3">
                <Sparkles
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#FF8B5C]"
                  aria-hidden="true"
                />
                <p className="text-xs font-semibold leading-relaxed text-[#6B7280]">
                  Acceso completo a la unidad compartida, generación con IA,
                  exportar a PDF y plan Premium activo.
                </p>
              </div>
            </div>

            <div className="mt-6 flex w-full flex-col gap-3">
              <Button
                onClick={handlePagar}
                className={`${focusRing} h-12 w-full rounded-[18px] bg-[#25D366] text-base font-extrabold text-white hover:bg-[#1DA851]`}
              >
                <MessageCircle className="mr-2 h-5 w-5" aria-hidden="true" />
                Pagar por WhatsApp
              </Button>
              <Button
                onClick={handleVolver}
                variant="outline"
                className={`${focusRing} h-11 w-full rounded-[16px] border-[#E6EBF2] text-sm font-bold text-[#6B7280] hover:bg-[#F5F7FA]`}
              >
                Usar otro código
              </Button>
            </div>
          </div>
        )}

        {fase === "waiting" && (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 -m-2 h-24 w-24 animate-ping rounded-full bg-[#FFF0E8]" />
              <div
                className={`relative grid h-20 w-20 place-items-center rounded-[20px] bg-[#FF8B5C] text-white ${cardShadow}`}
              >
                <Crown
                  className="h-10 w-10 animate-bounce"
                  style={{ animationDuration: "2s" }}
                  aria-hidden="true"
                />
              </div>
            </div>

            <h2 className="text-xl font-extrabold text-[#1F2937]">
              Esperando confirmación
            </h2>
            <p className="mt-2 max-w-xs text-sm font-semibold text-[#6B7280]">
              Completa el pago de{" "}
              <strong className="text-[#EA580C]">S/. {monto}</strong> en
              WhatsApp para activar tu membresía.
            </p>

            <div className="mb-6 mt-4 flex items-center gap-2 rounded-full bg-[#F5F7FA] px-4 py-2">
              <Loader2
                className="h-4 w-4 animate-spin text-[#FF8B5C]"
                aria-hidden="true"
              />
              <span className="text-xs font-semibold text-[#6B7280]">
                Escuchando confirmación de pago…
              </span>
            </div>

            <div className="mb-6 w-full rounded-[20px] border border-[#E6EBF2] bg-white p-4 text-left">
              <ol className="space-y-3">
                <WaitingStep
                  number={1}
                  text="Conversa con nuestro equipo en WhatsApp"
                  done
                />
                <WaitingStep
                  number={2}
                  text={`Realiza el pago de S/. ${monto}`}
                />
                <WaitingStep
                  number={3}
                  text="Tu membresía se activa al instante"
                />
              </ol>
            </div>

            <Button
              onClick={handleVolver}
              variant="outline"
              className={`${focusRing} border-[#E6EBF2] text-sm font-bold text-[#6B7280] hover:bg-[#F5F7FA]`}
            >
              Cancelar y volver
            </Button>
          </div>
        )}

        {fase === "activated" && (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="relative mb-6">
              <div
                className="absolute inset-0 -m-2 h-24 w-24 animate-ping rounded-full bg-[#E3F8EC]"
                style={{ animationDuration: "1.5s" }}
              />
              <div
                className={`relative grid h-20 w-20 place-items-center rounded-[20px] bg-[#15803D] text-white ${cardShadow}`}
              >
                <PartyPopper className="h-10 w-10" aria-hidden="true" />
              </div>
            </div>

            <h2 className="text-xl font-extrabold text-[#1F2937]">
              ¡Membresía activada!
            </h2>
            <p className="mt-2 max-w-xs text-sm font-semibold text-[#6B7280]">
              Ya tienes acceso a{" "}
              <strong className="text-[#1F2937]">
                {unidadTitulo || "la unidad compartida"}
              </strong>
              . Tu plan Premium está activo.
            </p>

            <div className="mt-6 flex items-center gap-2 rounded-full bg-[#E3F8EC] px-4 py-2">
              <Rocket className="h-4 w-4 text-[#15803D]" aria-hidden="true" />
              <span className="text-sm font-bold text-[#15803D]">
                Preparando tu unidad personalizada…
              </span>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Loader2
                className="h-4 w-4 animate-spin text-[#15803D]"
                aria-hidden="true"
              />
              <span className="text-xs font-semibold text-[#6B7280]">
                Cargando contenido…
              </span>
            </div>
          </div>
        )}

        {fase === "error" && (
          <div className="flex flex-col items-center text-center">
            <div
              className={`mb-6 grid h-16 w-16 place-items-center rounded-[20px] bg-[#FEE2E2] text-[#DC2626] ${cardShadow}`}
            >
              <AlertCircle className="h-8 w-8" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-extrabold text-[#1F2937]">
              Ocurrió un error
            </h2>
            <p className="mt-2 mb-6 max-w-xs text-sm font-semibold text-[#6B7280]">
              {errorMsg || "No pudimos procesar tu solicitud. Intenta nuevamente."}
            </p>
            <div className="flex w-full flex-col gap-2">
              <Button
                onClick={handleVolver}
                className={`${focusRing} ${liftable} dp-cta-soft-pattern h-12 w-full rounded-[18px] bg-[#FF8B5C] text-base font-extrabold text-white hover:bg-[#F97316]`}
              >
                Intentar de nuevo
              </Button>
            </div>
          </div>
        )}
      </main>
    </TeacherAppShell>
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
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          done
            ? "bg-[#E3F8EC] text-[#15803D]"
            : "bg-[#F5F7FA] text-[#6B7280]"
        }`}
      >
        {done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : number}
      </div>
      <span
        className={`text-sm font-semibold ${
          done ? "text-[#15803D]" : "text-[#6B7280]"
        }`}
      >
        {text}
      </span>
    </li>
  );
}

export default UnirseUnidad;
