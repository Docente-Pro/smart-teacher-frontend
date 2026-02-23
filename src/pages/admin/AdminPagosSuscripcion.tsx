import { useEffect, useState } from "react";
import {
  getPagosSuscripcionPendientes,
  getHistorialPagosSuscripcion,
  confirmarPagoSuscripcion,
  rechazarPagoSuscripcion,
} from "@/services/admin.service";
import type { IPagoSuscripcionAdmin, EstadoPago } from "@/interfaces/IAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  CreditCard,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

type Tab = "pendientes" | "historial";

export default function AdminPagosSuscripcion() {
  const [tab, setTab] = useState<Tab>("pendientes");
  const [pagos, setPagos] = useState<IPagoSuscripcionAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [estadoFilter, setEstadoFilter] = useState<EstadoPago | "">("");

  // Motivo rechazo
  const [motivoRechazo, setMotivoRechazo] = useState<Record<string, string>>({});

  useEffect(() => {
    cargarPagos();
  }, [tab, estadoFilter]);

  async function cargarPagos() {
    setIsLoading(true);
    try {
      const res =
        tab === "pendientes"
          ? await getPagosSuscripcionPendientes()
          : await getHistorialPagosSuscripcion(estadoFilter || undefined);
      setPagos(res.data || []);
    } catch (err) {
      toast.error("Error al cargar pagos de suscripción");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConfirmar(pagoId: string) {
    if (!window.confirm("¿Confirmar este pago de suscripción?")) return;
    setActionLoading(pagoId);
    try {
      await confirmarPagoSuscripcion(pagoId);
      toast.success("Pago confirmado");
      cargarPagos();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error al confirmar pago");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRechazar(pagoId: string) {
    const motivo = motivoRechazo[pagoId]?.trim();
    if (!window.confirm("¿Rechazar este pago de suscripción?")) return;
    setActionLoading(pagoId);
    try {
      await rechazarPagoSuscripcion(pagoId, motivo || undefined);
      toast.success("Pago rechazado");
      setMotivoRechazo((prev) => {
        const copy = { ...prev };
        delete copy[pagoId];
        return copy;
      });
      cargarPagos();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error al rechazar pago");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-400" />
            Pagos de Suscripción
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Gestiona los pagos manuales de suscripción
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={cargarPagos}
          disabled={isLoading}
          className="border-gray-700 text-gray-300 hover:text-white"
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Actualizar
        </Button>
      </div>

      {/* Tabs + Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-1 bg-gray-900 p-1 rounded-lg w-fit">
          <TabButton
            active={tab === "pendientes"}
            onClick={() => { setTab("pendientes"); setEstadoFilter(""); }}
            icon={<Clock className="w-4 h-4" />}
            label="Pendientes"
          />
          <TabButton
            active={tab === "historial"}
            onClick={() => setTab("historial")}
            icon={<CheckCircle2 className="w-4 h-4" />}
            label="Historial"
          />
        </div>
        {tab === "historial" && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value as EstadoPago | "")}
              className="bg-gray-800 border border-gray-700 text-white text-sm rounded-md px-3 py-1.5"
            >
              <option value="">Todos</option>
              <option value="CONFIRMADO">Confirmado</option>
              <option value="RECHAZADO">Rechazado</option>
              <option value="PENDIENTE">Pendiente</option>
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : pagos.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <CreditCard className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">
            {tab === "pendientes"
              ? "No hay pagos pendientes"
              : "No hay historial de pagos"}
          </p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-left">
                  <th className="px-4 py-3 font-medium">Usuario</th>
                  <th className="px-4 py-3 font-medium">Descripción</th>
                  <th className="px-4 py-3 font-medium">Método</th>
                  <th className="px-4 py-3 font-medium">Monto</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  {tab === "pendientes" && (
                    <th className="px-4 py-3 font-medium text-right">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {pagos.map((pago) => (
                  <tr
                    key={pago.id}
                    className="hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="text-white font-medium truncate max-w-[200px]">
                        {pago.usuario.nombre || "—"}
                      </p>
                      <p className="text-gray-500 text-xs truncate">
                        {pago.usuario.email || pago.usuario.id}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-300 truncate max-w-[160px]">
                      {pago.descripcion || pago.plan || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-xs">
                      {pago.metodoPago || "—"}
                    </td>
                    <td className="px-4 py-3 text-white font-medium">
                      {pago.moneda === "USD" ? "$" : "S/"} {pago.monto?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <EstadoBadge estado={pago.estado} />
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(pago.createdAt).toLocaleDateString("es-PE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    {tab === "pendientes" && (
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleConfirmar(pago.id)}
                              disabled={actionLoading === pago.id}
                              className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs"
                            >
                              {actionLoading === pago.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                              )}
                              Confirmar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRechazar(pago.id)}
                              disabled={actionLoading === pago.id}
                              className="h-8 text-xs"
                            >
                              {actionLoading === pago.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <XCircle className="w-3 h-3 mr-1" />
                              )}
                              Rechazar
                            </Button>
                          </div>
                          <Input
                            placeholder="Motivo rechazo..."
                            value={motivoRechazo[pago.id] || ""}
                            onChange={(e) =>
                              setMotivoRechazo((prev) => ({ ...prev, [pago.id]: e.target.value }))
                            }
                            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-600 h-7 text-xs w-48"
                          />
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        active
          ? "bg-gray-800 text-white"
          : "text-gray-400 hover:text-gray-300"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    PENDIENTE: { bg: "bg-yellow-500/10", text: "text-yellow-400" },
    CONFIRMADO: { bg: "bg-green-500/10", text: "text-green-400" },
    RECHAZADO: { bg: "bg-red-500/10", text: "text-red-400" },
  };
  const c = config[estado] || config.PENDIENTE;
  return (
    <span
      className={`${c.bg} ${c.text} text-xs font-medium px-2 py-1 rounded-full`}
    >
      {estado}
    </span>
  );
}
