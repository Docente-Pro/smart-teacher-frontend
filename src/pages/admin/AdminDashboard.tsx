import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import {
  CreditCard,
  FolderOpen,
  CheckCircle2,
  XCircle,
  Search,
  Loader2,
  RotateCcw,
  Crown,
  Wrench,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getPagosSuscripcionPendientes,
  getPagosUnidadPendientes,
  getEstadisticasUsuario,
  resetUsuario,
  revocarSuscripcion,
  upgradePremium,
} from "@/services/admin.service";
import type {
  IPagoSuscripcionAdmin,
  IPagoUnidadAdmin,
  IEstadisticasUsuario,
  IResetUsuarioRequest,
} from "@/interfaces/IAdmin";
import { toast } from "sonner";
import { corregirEstandaresMasivo } from "@/services/unidad.service";
import {
  dpCardShadow,
  dpCtaPrimary,
  dpFocusRing,
  dpInputClass,
  dpLiftable,
  dpSectionGap,
} from "@/styles/dpTokens";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [suscPendientes, setSuscPendientes] = useState<IPagoSuscripcionAdmin[]>(
    [],
  );
  const [unidadPendientes, setUnidadPendientes] = useState<IPagoUnidadAdmin[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);

  const [usuarioId, setUsuarioId] = useState("");
  const [estadisticas, setEstadisticas] = useState<IEstadisticasUsuario | null>(
    null,
  );
  const [buscando, setBuscando] = useState(false);
  const [busquedaError, setBusquedaError] = useState<string | null>(null);

  const [resetLoading, setResetLoading] = useState(false);
  const [resetOpts, setResetOpts] = useState<IResetUsuarioRequest>({
    resetSesiones: true,
    resetPdfs: true,
    resetSuscripcion: false,
    resetUnidades: false,
    resetPerfil: false,
  });

  const [revocarLoading, setRevocarLoading] = useState(false);
  const [revocarMotivo, setRevocarMotivo] = useState("");

  const [corrigiendoMasivo, setCorrigiendoMasivo] = useState(false);

  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradePlan, setUpgradePlan] = useState<
    "premium_mensual" | "premium_anual"
  >("premium_mensual");

  useEffect(() => {
    cargarResumen();
  }, []);

  async function cargarResumen() {
    setIsLoading(true);
    try {
      const [suscRes, unidadRes] = await Promise.all([
        getPagosSuscripcionPendientes(),
        getPagosUnidadPendientes(),
      ]);
      setSuscPendientes(suscRes.data || []);
      setUnidadPendientes(unidadRes.data || []);
    } catch (err) {
      console.error("Error cargando resumen admin:", err);
      toast.error("No se pudo cargar el resumen. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  async function buscarUsuario() {
    if (!usuarioId.trim()) return;
    setBuscando(true);
    setEstadisticas(null);
    setBusquedaError(null);
    try {
      const data = await getEstadisticasUsuario(usuarioId.trim());
      setEstadisticas(data);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "No encontramos ese usuario. Revisa el ID e intenta de nuevo.";
      setBusquedaError(msg);
      toast.error(msg);
    } finally {
      setBuscando(false);
    }
  }

  async function handleResetUsuario() {
    if (!estadisticas?.data?.usuario?.id) return;
    const id = estadisticas.data.usuario.id;
    const nombre = estadisticas.data.usuario.nombre;

    const partes: string[] = [];
    if (resetOpts.resetSesiones) partes.push("sesiones");
    if (resetOpts.resetPdfs) partes.push("PDFs");
    if (resetOpts.resetSuscripcion) partes.push("suscripción");
    if (resetOpts.resetUnidades) partes.push("unidades");
    if (resetOpts.resetPerfil) partes.push("perfil (onboarding)");
    if (partes.length === 0) {
      toast.error("Selecciona al menos una opción de reset");
      return;
    }

    if (
      !window.confirm(
        `¿Resetear ${partes.join(", ")} del usuario ${nombre}? Esta acción no se puede deshacer.`,
      )
    )
      return;

    setResetLoading(true);
    try {
      const res = await resetUsuario(id, resetOpts);
      toast.success(res.message || "Usuario reseteado correctamente");
      const data = await getEstadisticasUsuario(id);
      setEstadisticas(data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error al resetear usuario");
    } finally {
      setResetLoading(false);
    }
  }

  async function handleRevocarSuscripcion() {
    if (!estadisticas?.data?.usuario?.id) return;
    const id = estadisticas.data.usuario.id;
    const nombre = estadisticas.data.usuario.nombre;
    if (
      !window.confirm(
        `¿Revocar suscripción del usuario ${nombre}? Se pasará a plan free.`,
      )
    )
      return;

    setRevocarLoading(true);
    try {
      await revocarSuscripcion(id, revocarMotivo || undefined);
      toast.success("Suscripción revocada. El usuario queda en plan free.");
      setRevocarMotivo("");
      const data = await getEstadisticasUsuario(id);
      setEstadisticas(data);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Error al revocar suscripción",
      );
    } finally {
      setRevocarLoading(false);
    }
  }

  async function handleUpgradePremium() {
    if (!estadisticas?.data?.usuario?.id) return;
    const id = estadisticas.data.usuario.id;
    const nombre = estadisticas.data.usuario.nombre;
    if (!window.confirm(`¿Subir a ${upgradePlan} al usuario ${nombre}?`))
      return;

    setUpgradeLoading(true);
    try {
      const res = await upgradePremium(id, { plan: upgradePlan });
      toast.success(res.message || "Usuario actualizado a premium");
      const data = await getEstadisticasUsuario(id);
      setEstadisticas(data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error al subir a premium");
    } finally {
      setUpgradeLoading(false);
    }
  }

  async function handleCorregirEstandaresMasivo() {
    if (
      !window.confirm(
        "¿Corregir estándares truncados de TODAS las unidades? Este proceso puede tardar.",
      )
    )
      return;

    setCorrigiendoMasivo(true);
    try {
      const res = await corregirEstandaresMasivo();
      toast.success(
        `Corrección masiva completada: ${res.corregidas} corregidas, ${res.sinCambios} sin cambios, ${res.errores} errores (total: ${res.total})`,
      );
    } catch (err: any) {
      console.error("❌ [Admin] Error corregir masivo:", err);
      toast.error(
        err?.response?.data?.message || "Error al corregir estándares masivo",
      );
    } finally {
      setCorrigiendoMasivo(false);
    }
  }

  const totalPendientes = suscPendientes.length + unidadPendientes.length;

  return (
    <div className="text-[#1F2937]">
      <header className={`${dpSectionGap} dp-enter`}>
        <p className="mb-1 text-sm font-bold text-[#3B6CB5]">
          Panel de administración
        </p>
        <h1 className="text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-balance">
          Pagos y docentes
        </h1>
        <p className="mt-2 max-w-[42ch] text-base font-semibold leading-7 text-[#6B7280]">
          Revisa lo pendiente y busca un usuario cuando necesites ayudar.
        </p>
      </header>

      <section
        className={`${dpSectionGap} dp-enter dp-enter-delay-1`}
        aria-label="Cola de pagos"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <QueueJump
            label="Suscripciones por revisar"
            count={isLoading ? null : suscPendientes.length}
            onClick={() => navigate("/admin/pagos-suscripcion")}
            tone="warning"
          />
          <QueueJump
            label="Unidades por revisar"
            count={isLoading ? null : unidadPendientes.length}
            onClick={() => navigate("/admin/pagos-unidad")}
            tone="atmosphere"
          />
        </div>
        {!isLoading && totalPendientes === 0 && (
          <p className="mt-3 text-base font-semibold text-[#15803D]">
            No hay pagos pendientes ahora.
          </p>
        )}
      </section>

      <section
        className={`${dpSectionGap} grid grid-cols-1 gap-6 lg:grid-cols-2`}
        aria-label="Últimos pendientes"
      >
        <QueuePanel
          title="Suscripciones"
          icon={<CreditCard className="h-5 w-5" aria-hidden />}
          onSeeAll={() => navigate("/admin/pagos-suscripcion")}
          loading={isLoading}
          empty="Cuando un docente pague una suscripción, el pago aparece aquí."
          delayClass="dp-enter dp-enter-delay-2"
          isEmpty={!isLoading && suscPendientes.length === 0}
        >
          {suscPendientes.slice(0, 5).map((p) => (
            <PagoSuscQuickItem key={p.id} pago={p} />
          ))}
          {suscPendientes.length > 5 && (
            <p className="pt-1 text-center text-sm font-semibold text-[#6B7280]">
              +{suscPendientes.length - 5} más en la lista completa
            </p>
          )}
        </QueuePanel>

        <QueuePanel
          title="Unidades"
          icon={<FolderOpen className="h-5 w-5" aria-hidden />}
          onSeeAll={() => navigate("/admin/pagos-unidad")}
          loading={isLoading}
          empty="Cuando un docente pague una unidad, el pago aparece aquí."
          delayClass="dp-enter dp-enter-delay-3"
          isEmpty={!isLoading && unidadPendientes.length === 0}
        >
          {unidadPendientes.slice(0, 5).map((p) => (
            <PagoUnidadQuickItem key={p.id} pago={p} />
          ))}
          {unidadPendientes.length > 5 && (
            <p className="pt-1 text-center text-sm font-semibold text-[#6B7280]">
              +{unidadPendientes.length - 5} más en la lista completa
            </p>
          )}
        </QueuePanel>
      </section>

      <section
        className={`${dpSectionGap} dp-enter dp-enter-delay-4 rounded-[28px] border border-[#E6EBF2] bg-white p-5 ${dpCardShadow} sm:p-6`}
        aria-labelledby="gestion-usuario"
      >
        <h2
          id="gestion-usuario"
          className="mb-1 text-xl font-extrabold text-[#1F2937]"
        >
          Buscar un docente
        </h2>
        <p className="mb-5 max-w-[48ch] text-base font-semibold leading-7 text-[#6B7280]">
          Pega el ID del usuario para ver su plan, sesiones y unidades.
        </p>

        <div className="flex max-w-xl flex-col gap-2">
          <label
            htmlFor="buscar-usuario"
            className="text-sm font-bold text-[#1F2937]"
          >
            ID del usuario
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              id="buscar-usuario"
              placeholder="Ej. c8f1…"
              value={usuarioId}
              onChange={(e) => {
                setUsuarioId(e.target.value);
                setBusquedaError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && buscarUsuario()}
              className={`${dpInputClass} flex-1`}
              aria-invalid={!!busquedaError}
              aria-describedby={
                busquedaError ? "buscar-usuario-error" : "buscar-usuario-ayuda"
              }
            />
            <Button
              onClick={buscarUsuario}
              disabled={buscando || !usuarioId.trim()}
              className={`${dpCtaPrimary} min-w-[140px] disabled:opacity-50`}
            >
              {buscando ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Search className="mr-2 h-4 w-4" aria-hidden />
              )}
              {buscando ? "Buscando" : "Buscar"}
            </Button>
          </div>
          {busquedaError ? (
            <p id="buscar-usuario-error" className="text-sm font-bold text-[#C2410C]">
              {busquedaError}
            </p>
          ) : (
            <p id="buscar-usuario-ayuda" className="text-sm font-semibold text-[#9CA3AF]">
              Enter también busca.
            </p>
          )}
        </div>

        {estadisticas?.data && (
          <div className="mt-6 space-y-5 rounded-[24px] border border-[#E6EBF2] bg-[#F5F7FA] p-4 sm:p-5">
            <div>
              <p className="text-lg font-extrabold tracking-[-0.02em] text-[#1F2937]">
                {estadisticas.data.usuario.nombre}
              </p>
              <p className="text-base font-semibold text-[#6B7280]">
                {estadisticas.data.usuario.email}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <InfoItem
                label="Plan"
                value={estadisticas.data.suscripcion.plan}
                highlight
              />
              <InfoItem
                label="Suscripción activa"
                value={estadisticas.data.suscripcion.activa ? "Sí" : "No"}
              />
              <InfoItem
                label="Sesiones"
                value={String(estadisticas.data.sesiones.total)}
              />
              <InfoItem
                label="Unidades"
                value={String(estadisticas.data.unidades.total)}
              />
              <InfoItem
                label="Sesiones esta semana"
                value={String(estadisticas.data.sesiones.estaSemana)}
              />
              <InfoItem
                label="Sesiones con PDF"
                value={String(estadisticas.data.sesiones.conPdf)}
              />
              <InfoItem
                label="Unidades con PDF"
                value={String(estadisticas.data.unidades.conPdf)}
              />
              {estadisticas.data.suscripcion.fechaInicio && (
                <InfoItem
                  label="Inicio de suscripción"
                  value={new Date(
                    estadisticas.data.suscripcion.fechaInicio,
                  ).toLocaleDateString("es-PE")}
                />
              )}
              {estadisticas.data.suscripcion.fechaFin && (
                <InfoItem
                  label="Fin de suscripción"
                  value={new Date(
                    estadisticas.data.suscripcion.fechaFin,
                  ).toLocaleDateString("es-PE")}
                />
              )}
            </dl>

            <div className="rounded-[20px] border border-[#E6EBF2] bg-white p-4">
              <p className="mb-3 flex items-center gap-2 text-base font-extrabold text-[#1F2937]">
                <Crown className="h-4 w-4 text-[#3B6CB5]" aria-hidden />
                Subir a Premium
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <label className="sr-only" htmlFor="upgrade-plan">
                  Plan Premium
                </label>
                <select
                  id="upgrade-plan"
                  value={upgradePlan}
                  onChange={(e) =>
                    setUpgradePlan(
                      e.target.value as "premium_mensual" | "premium_anual",
                    )
                  }
                  className={`${dpFocusRing} h-11 rounded-[16px] border border-[#E6EBF2] bg-white px-3 text-base font-semibold text-[#1F2937]`}
                >
                  <option value="premium_mensual">Premium mensual</option>
                  <option value="premium_anual">Premium anual</option>
                </select>
                <Button
                  onClick={handleUpgradePremium}
                  disabled={upgradeLoading}
                  className={`${dpFocusRing} dp-press h-11 rounded-[16px] bg-[#6B9FE8] px-5 text-base font-extrabold text-white shadow-[0_8px_20px_rgba(107,159,232,0.28)] hover:bg-[#3B6CB5]`}
                >
                  {upgradeLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Crown className="mr-2 h-4 w-4" aria-hidden />
                  )}
                  Subir a Premium
                </Button>
              </div>
            </div>

            <div className="rounded-[20px] border border-[#E6EBF2] bg-white p-4">
              <p className="mb-3 flex items-center gap-2 text-base font-extrabold text-[#1F2937]">
                <RotateCcw className="h-4 w-4" aria-hidden />
                Resetear usuario
              </p>
              <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2">
                {(
                  [
                    { key: "resetSesiones", label: "Sesiones" },
                    { key: "resetPdfs", label: "PDFs" },
                    { key: "resetSuscripcion", label: "Suscripción" },
                    { key: "resetUnidades", label: "Unidades" },
                    { key: "resetPerfil", label: "Perfil (onboarding)" },
                  ] as const
                ).map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex min-h-11 cursor-pointer items-center gap-2 text-base font-semibold text-[#6B7280]"
                  >
                    <input
                      type="checkbox"
                      checked={!!resetOpts[key]}
                      onChange={(e) =>
                        setResetOpts((prev) => ({
                          ...prev,
                          [key]: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-[#E6EBF2] text-[#FF8B5C] focus:ring-[#FF8B5C]"
                    />
                    {label}
                  </label>
                ))}
              </div>
              <Button
                variant="destructive"
                onClick={handleResetUsuario}
                disabled={resetLoading}
                className={`${dpFocusRing} dp-press h-11 rounded-[16px] bg-[#C2410C] px-5 text-base font-extrabold text-white hover:bg-[#9A3412]`}
              >
                {resetLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
                )}
                Resetear usuario
              </Button>
            </div>

            <div className="rounded-[20px] border border-[#E6EBF2] bg-white p-4">
              <p className="mb-3 flex items-center gap-2 text-base font-extrabold text-[#1F2937]">
                <XCircle className="h-4 w-4" aria-hidden />
                Revocar suscripción
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Input
                  placeholder="Motivo (opcional)"
                  value={revocarMotivo}
                  onChange={(e) => setRevocarMotivo(e.target.value)}
                  className={`${dpInputClass} max-w-xs`}
                />
                <Button
                  variant="outline"
                  onClick={handleRevocarSuscripcion}
                  disabled={revocarLoading}
                  className={`${dpFocusRing} h-11 rounded-[16px] border-[#E6EBF2] px-5 text-base font-bold text-[#C2410C] hover:bg-[#FFF7ED]`}
                >
                  {revocarLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" aria-hidden />
                  )}
                  Revocar suscripción
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>

      <section
        className={`dp-enter dp-enter-delay-5 rounded-[28px] border border-[#E6EBF2] bg-white p-5 ${dpCardShadow} sm:p-6`}
        aria-labelledby="mantenimiento"
      >
        <h2
          id="mantenimiento"
          className="mb-1 flex items-center gap-2 text-xl font-extrabold text-[#1F2937]"
        >
          <Wrench className="h-5 w-5 text-[#C2410C]" aria-hidden />
          Mantenimiento
        </h2>
        <p className="mb-4 max-w-[52ch] text-base font-semibold leading-7 text-[#6B7280]">
          Corrige estándares truncados en todas las unidades. El sistema
          actualiza los datos y limpia los PDF obsoletos.
        </p>
        <Button
          onClick={handleCorregirEstandaresMasivo}
          disabled={corrigiendoMasivo}
          className={`${dpFocusRing} dp-press h-11 rounded-[16px] bg-[#FFF7ED] px-5 text-base font-extrabold text-[#C2410C] hover:bg-[#FFEDD5]`}
        >
          {corrigiendoMasivo ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Wrench className="mr-2 h-4 w-4" aria-hidden />
          )}
          {corrigiendoMasivo
            ? "Corrigiendo…"
            : "Corregir todas las unidades"}
        </Button>
      </section>
    </div>
  );
}

function QueueJump({
  label,
  count,
  onClick,
  tone,
}: {
  label: string;
  count: number | null;
  onClick: () => void;
  tone: "warning" | "atmosphere";
}) {
  const well =
    tone === "warning"
      ? "bg-[#FFF7ED] text-[#C2410C] hover:bg-[#FFEDD5]"
      : "bg-[#EAF2FC] text-[#3B6CB5] hover:bg-[#DCE9FA]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${dpFocusRing} ${dpLiftable} flex min-h-[96px] w-full items-center justify-between rounded-[28px] px-5 py-4 text-left ${well}`}
    >
      <span>
        <span className="block text-sm font-bold opacity-80">{label}</span>
        <span className="mt-1 block font-extrabold tabular-nums text-[28px] leading-none tracking-[-0.02em]">
          {count === null ? (
            <span className="inline-block h-8 w-10 animate-pulse rounded-md bg-current/15" />
          ) : (
            count
          )}
        </span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 opacity-70" aria-hidden />
    </button>
  );
}

function QueuePanel({
  title,
  icon,
  onSeeAll,
  loading,
  empty,
  delayClass,
  isEmpty,
  children,
}: {
  title: string;
  icon: ReactNode;
  onSeeAll: () => void;
  loading: boolean;
  empty: string;
  delayClass: string;
  isEmpty: boolean;
  children: ReactNode;
}) {

  return (
    <div
      className={`${delayClass} rounded-[28px] border border-[#E6EBF2] bg-white p-5 ${dpCardShadow}`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-extrabold text-[#1F2937]">
          <span className="grid h-10 w-10 place-items-center rounded-[16px] bg-[#EAF2FC] text-[#3B6CB5]">
            {icon}
          </span>
          {title}
        </h2>
        <Button
          variant="ghost"
          onClick={onSeeAll}
          className={`${dpFocusRing} h-11 rounded-[16px] px-3 text-base font-bold text-[#3B6CB5] hover:bg-[#EAF2FC]`}
        >
          Ver todos
          <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
        </Button>
      </div>
      {loading ? (
        <div className="space-y-2" aria-busy="true" aria-label="Cargando pagos">
          <div className="h-16 animate-pulse rounded-[20px] bg-[#EEF3F9]" />
          <div className="h-16 animate-pulse rounded-[20px] bg-[#EEF3F9]" />
          <div className="h-16 animate-pulse rounded-[20px] bg-[#EEF3F9]" />
        </div>
      ) : isEmpty ? (
        <div className="flex items-start gap-3 rounded-[20px] bg-[#E3F8EC] px-4 py-5 text-[#15803D]">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <p className="text-base font-semibold leading-7">{empty}</p>
        </div>
      ) : (
        <div className="space-y-2">{children}</div>
      )}
    </div>
  );
}

function PagoSuscQuickItem({ pago }: { pago: IPagoSuscripcionAdmin }) {
  return (
    <div className="flex min-h-[72px] items-center justify-between rounded-[20px] border border-[#E6EBF2] bg-[#F5F7FA] px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-base font-extrabold text-[#1F2937]">
          {pago.usuario.nombre || pago.usuario.email}
        </p>
        <p className="text-sm font-semibold tabular-nums text-[#6B7280]">
          S/ {pago.monto?.toFixed(2)} · {pago.descripcion || pago.plan || "Sin detalle"}
        </p>
      </div>
      <span className="ml-2 shrink-0 rounded-full bg-[#FFF7ED] px-3 py-1 text-sm font-bold text-[#C2410C]">
        Pendiente
      </span>
    </div>
  );
}

function PagoUnidadQuickItem({ pago }: { pago: IPagoUnidadAdmin }) {
  return (
    <div className="flex min-h-[72px] items-center justify-between rounded-[20px] border border-[#E6EBF2] bg-[#F5F7FA] px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-base font-extrabold text-[#1F2937]">
          {pago.usuario.nombre || pago.usuario.email}
        </p>
        <p className="text-sm font-semibold tabular-nums text-[#6B7280]">
          S/ {pago.monto?.toFixed(2)} · {pago.unidad?.titulo || pago.tipoPago}
        </p>
      </div>
      <span className="ml-2 shrink-0 rounded-full bg-[#EAF2FC] px-3 py-1 text-sm font-bold text-[#3B6CB5]">
        {pago.tipoPago}
      </span>
    </div>
  );
}

function InfoItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-[16px] bg-white px-3 py-3">
      <dt className="text-sm font-bold text-[#6B7280]">{label}</dt>
      <dd
        className={`mt-0.5 text-base font-extrabold tabular-nums ${
          highlight ? "text-[#3B6CB5]" : "text-[#1F2937]"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
