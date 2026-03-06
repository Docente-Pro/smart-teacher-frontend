import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  CreditCard,
  FolderOpen,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  Search,
  Loader2,
  RotateCcw,
  Crown,
  Wrench,
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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [suscPendientes, setSuscPendientes] = useState<IPagoSuscripcionAdmin[]>([]);
  const [unidadPendientes, setUnidadPendientes] = useState<IPagoUnidadAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar usuario
  const [usuarioId, setUsuarioId] = useState("");
  const [estadisticas, setEstadisticas] = useState<IEstadisticasUsuario | null>(null);
  const [buscando, setBuscando] = useState(false);

  // Reset options
  const [resetLoading, setResetLoading] = useState(false);
  const [resetOpts, setResetOpts] = useState<IResetUsuarioRequest>({
    resetSesiones: true,
    resetPdfs: true,
    resetSuscripcion: false,
    resetUnidades: false,
    resetPerfil: false,
  });

  // Revocar
  const [revocarLoading, setRevocarLoading] = useState(false);
  const [revocarMotivo, setRevocarMotivo] = useState("");

  // Corregir estándares masivo
  const [corrigiendoMasivo, setCorrigiendoMasivo] = useState(false);

  // Upgrade premium
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradePlan, setUpgradePlan] = useState<"premium_mensual" | "premium_anual">("premium_mensual");

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
      toast.error("Error al cargar datos del dashboard");
    } finally {
      setIsLoading(false);
    }
  }

  async function buscarUsuario() {
    if (!usuarioId.trim()) return;
    setBuscando(true);
    setEstadisticas(null);
    try {
      const data = await getEstadisticasUsuario(usuarioId.trim());
      setEstadisticas(data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Usuario no encontrado");
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

    if (!window.confirm(`¿Resetear ${partes.join(", ")} del usuario ${nombre}? Esta acción no se puede deshacer.`)) return;

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
    if (!window.confirm(`¿Revocar suscripción del usuario ${nombre}? Se pasará a plan free.`)) return;

    setRevocarLoading(true);
    try {
      await revocarSuscripcion(id, revocarMotivo || undefined);
      toast.success("Suscripción revocada → plan free");
      setRevocarMotivo("");
      const data = await getEstadisticasUsuario(id);
      setEstadisticas(data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error al revocar suscripción");
    } finally {
      setRevocarLoading(false);
    }
  }

  async function handleUpgradePremium() {
    if (!estadisticas?.data?.usuario?.id) return;
    const id = estadisticas.data.usuario.id;
    const nombre = estadisticas.data.usuario.nombre;
    if (!window.confirm(`¿Subir a ${upgradePlan} al usuario ${nombre}?`)) return;

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Resumen general del sistema
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Pagos Suscripción Pendientes"
          value={isLoading ? "..." : suscPendientes.length}
          color="yellow"
          onClick={() => navigate("/admin/pagos-suscripcion")}
        />
        <StatCard
          icon={<CreditCard className="w-5 h-5" />}
          label="Pagos Unidad Pendientes"
          value={isLoading ? "..." : unidadPendientes.length}
          color="blue"
          onClick={() => navigate("/admin/pagos-unidad")}
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="Total Pendientes"
          value={
            isLoading
              ? "..."
              : suscPendientes.length + unidadPendientes.length
          }
          color="green"
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Acciones rápidas"
          value="→"
          color="purple"
          onClick={() => document.getElementById("buscar-usuario")?.focus()}
        />
      </div>

      {/* Pagos Pendientes Quickview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Suscripción Pendientes */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 font-semibold flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-yellow-600" />
              Suscripciones Pendientes
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/pagos-suscripcion")}
              className="text-blue-600 hover:text-blue-700 text-xs"
            >
              Ver todos →
            </Button>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
            </div>
          ) : suscPendientes.length === 0 ? (
            <p className="text-gray-400 text-sm py-4 text-center">
              No hay pagos pendientes
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {suscPendientes.slice(0, 5).map((p) => (
                <PagoSuscQuickItem key={p.id} pago={p} />
              ))}
              {suscPendientes.length > 5 && (
                <p className="text-gray-400 text-xs text-center pt-2">
                  +{suscPendientes.length - 5} más
                </p>
              )}
            </div>
          )}
        </div>

        {/* Unidad Pendientes */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 font-semibold flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-blue-600" />
              Unidades Pendientes
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/pagos-unidad")}
              className="text-blue-600 hover:text-blue-700 text-xs"
            >
              Ver todos →
            </Button>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
            </div>
          ) : unidadPendientes.length === 0 ? (
            <p className="text-gray-400 text-sm py-4 text-center">
              No hay pagos pendientes
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {unidadPendientes.slice(0, 5).map((p) => (
                <PagoUnidadQuickItem key={p.id} pago={p} />
              ))}
              {unidadPendientes.length > 5 && (
                <p className="text-gray-400 text-xs text-center pt-2">
                  +{unidadPendientes.length - 5} más
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Buscar Usuario */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-500" />
          Gestión de Usuario
        </h3>

        <div className="flex gap-3">
          <Input
            id="buscar-usuario"
            placeholder="ID del usuario..."
            value={usuarioId}
            onChange={(e) => setUsuarioId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscarUsuario()}
            className="bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500 max-w-md"
          />
          <Button
            onClick={buscarUsuario}
            disabled={buscando || !usuarioId.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {buscando ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Resultado */}
        {estadisticas?.data && (
          <div className="mt-5 border border-gray-300 rounded-lg p-4 space-y-4">
            {/* Info del usuario */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoItem
                label="Nombre"
                value={estadisticas.data.usuario.nombre}
              />
              <InfoItem
                label="Email"
                value={estadisticas.data.usuario.email}
              />
              <InfoItem
                label="Plan"
                value={estadisticas.data.suscripcion.plan}
                highlight
              />
              <InfoItem
                label="Suscripción Activa"
                value={estadisticas.data.suscripcion.activa ? "Sí" : "No"}
              />
            </div>

            {/* Estadísticas detalladas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoItem
                label="Total Sesiones"
                value={String(estadisticas.data.sesiones.total)}
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
                label="Total Unidades"
                value={String(estadisticas.data.unidades.total)}
              />
              <InfoItem
                label="Unidades con PDF"
                value={String(estadisticas.data.unidades.conPdf)}
              />
              {estadisticas.data.suscripcion.fechaInicio && (
                <InfoItem
                  label="Fecha Inicio Susc."
                  value={new Date(estadisticas.data.suscripcion.fechaInicio).toLocaleDateString("es-PE")}
                />
              )}
              {estadisticas.data.suscripcion.fechaFin && (
                <InfoItem
                  label="Fecha Fin Susc."
                  value={new Date(estadisticas.data.suscripcion.fechaFin).toLocaleDateString("es-PE")}
                />
              )}
            </div>

            {/* Upgrade Premium */}
            <div className="pt-3 border-t border-gray-300 space-y-3">
              <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
                <Crown className="w-4 h-4 text-yellow-600" />
                Subir a Premium
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={upgradePlan}
                  onChange={(e) => setUpgradePlan(e.target.value as "premium_mensual" | "premium_anual")}
                  className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-md px-3 py-1.5"
                >
                  <option value="premium_mensual">Premium Mensual</option>
                  <option value="premium_anual">Premium Anual</option>
                </select>
                <Button
                  size="sm"
                  onClick={handleUpgradePremium}
                  disabled={upgradeLoading}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  {upgradeLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Crown className="w-4 h-4 mr-2" />
                  )}
                  Upgrade
                </Button>
              </div>
            </div>

            {/* Reset usuario con opciones */}
            <div className="pt-3 border-t border-gray-300 space-y-3">
              <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
                <RotateCcw className="w-4 h-4" />
                Resetear usuario
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {([
                  { key: "resetSesiones", label: "Sesiones" },
                  { key: "resetPdfs", label: "PDFs" },
                  { key: "resetSuscripcion", label: "Suscripción" },
                  { key: "resetUnidades", label: "Unidades" },
                  { key: "resetPerfil", label: "Perfil (Onboarding)" },
                ] as const).map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!resetOpts[key]}
                      onChange={(e) => setResetOpts((prev) => ({ ...prev, [key]: e.target.checked }))}
                      className="rounded border-gray-300 bg-gray-100 text-blue-500 focus:ring-blue-500"
                    />
                    {label}
                  </label>
                ))}
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleResetUsuario}
                disabled={resetLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {resetLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4 mr-2" />
                )}
                Resetear usuario
              </Button>
            </div>

            {/* Revocar suscripción */}
            <div className="pt-3 border-t border-gray-300 space-y-3">
              <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
                <XCircle className="w-4 h-4" />
                Revocar suscripción
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Input
                  placeholder="Motivo (opcional)..."
                  value={revocarMotivo}
                  onChange={(e) => setRevocarMotivo(e.target.value)}
                  className="bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500 max-w-xs h-8 text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRevocarSuscripcion}
                  disabled={revocarLoading}
                  className="border-yellow-600 text-yellow-600 hover:bg-yellow-100"
                >
                  {revocarLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  Revocar suscripción
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Corregir Estándares Masivo */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-gray-900 font-semibold mb-3 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-amber-600" />
          Corregir Estándares (Masivo)
        </h3>
        <p className="text-gray-500 text-sm mb-4">
          Corrige estándares truncados en todas las unidades del sistema.
          El backend actualizará los datos y limpiará los PDFs obsoletos.
        </p>
        <Button
          size="sm"
          onClick={handleCorregirEstandaresMasivo}
          disabled={corrigiendoMasivo}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          {corrigiendoMasivo ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Wrench className="w-4 h-4 mr-2" />
          )}
          {corrigiendoMasivo ? "Corrigiendo…" : "Corregir todas las unidades"}
        </Button>
      </div>
    </div>
  );
}

// ─── Sub-components ───

function StatCard({
  icon,
  label,
  value,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: "yellow" | "blue" | "green" | "purple";
  onClick?: () => void;
}) {
  const colors = {
    yellow: "bg-yellow-100 text-yellow-600 border-yellow-200",
    blue: "bg-blue-100 text-blue-600 border-blue-200",
    green: "bg-green-100 text-green-600 border-green-200",
    purple: "bg-purple-100 text-purple-600 border-purple-200",
  };

  return (
    <button
      onClick={onClick}
      className={`${colors[color]} border rounded-xl p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98] w-full`}
    >
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs opacity-70 mt-1">{label}</p>
    </button>
  );
}

function PagoSuscQuickItem({ pago }: { pago: IPagoSuscripcionAdmin }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
      <div className="min-w-0">
        <p className="text-gray-900 text-sm truncate">
          {pago.usuario.nombre || pago.usuario.email}
        </p>
        <p className="text-gray-400 text-xs">
          S/ {pago.monto?.toFixed(2)} · {pago.descripcion || pago.plan || "—"}
        </p>
      </div>
      <span className="text-yellow-600 text-xs font-medium shrink-0 ml-2">
        PENDIENTE
      </span>
    </div>
  );
}

function PagoUnidadQuickItem({ pago }: { pago: IPagoUnidadAdmin }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
      <div className="min-w-0">
        <p className="text-gray-900 text-sm truncate">
          {pago.usuario.nombre || pago.usuario.email}
        </p>
        <p className="text-gray-400 text-xs">
          S/ {pago.monto?.toFixed(2)} · {pago.unidad?.titulo || pago.tipoPago}
        </p>
      </div>
      <span className="text-yellow-600 text-xs font-medium shrink-0 ml-2">
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
    <div>
      <p className="text-gray-400 text-xs">{label}</p>
      <p
        className={`text-sm font-medium ${
          highlight ? "text-blue-600" : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
