import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  getUsuarioDetalle,
  downgradeUsuario,
  eliminarUsuario,
  resetUsuario,
} from "@/services/admin.service";
import type { IUsuarioDetalle } from "@/interfaces/IAdmin";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Loader2,
  User,
  Mail,
  Building2,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  FolderOpen,
  ArrowDownCircle,
  Trash2,
  Shield,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminUsuarioDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<IUsuarioDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (id) cargarDetalle();
  }, [id]);

  async function cargarDetalle() {
    setIsLoading(true);
    try {
      const res = await getUsuarioDetalle(id!);
      setUsuario(res.data);
    } catch {
      toast.error("Error al cargar detalle del usuario");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResetTodo() {
    if (
      !window.confirm(
        "¿Resetear TODO este usuario? Se eliminarán sesiones, PDFs, unidades, perfil (onboarding) y se revocará la suscripción."
      )
    )
      return;
    setActionLoading("reset-todo");
    try {
      const res = await resetUsuario(id!, {
        resetSesiones: true,
        resetPdfs: true,
        resetSuscripcion: true,
        resetUnidades: true,
        resetPerfil: true,
      });
      toast.success(
        res.message ||
          `Reset completo: ${res.data.sesionesEliminadas} sesiones, ${res.data.unidadesEliminadas} unidades eliminadas`
      );
      cargarDetalle();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error al resetear usuario");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleResetSesiones() {
    if (
      !window.confirm(
        "¿Eliminar todas las sesiones de este usuario? Esta acción no se puede deshacer."
      )
    )
      return;
    setActionLoading("reset-sesiones");
    try {
      const res = await resetUsuario(id!, {
        resetSesiones: true,
        resetPdfs: true,
        resetSuscripcion: false,
        resetUnidades: false,
        resetPerfil: false,
      });
      toast.success(
        res.message || `${res.data.sesionesEliminadas} sesiones eliminadas`
      );
      cargarDetalle();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error al resetear sesiones");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleResetPerfil() {
    if (
      !window.confirm(
        "¿Resetear el perfil (onboarding) de este usuario? Se borrarán institución, nivel, grado, problemática y ubigeo."
      )
    )
      return;
    setActionLoading("reset-perfil");
    try {
      const res = await resetUsuario(id!, {
        resetSesiones: false,
        resetPdfs: false,
        resetSuscripcion: false,
        resetUnidades: false,
        resetPerfil: true,
      });
      toast.success(res.message || "Perfil reseteado correctamente");
      cargarDetalle();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error al resetear perfil");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleResetUnidades() {
    if (
      !window.confirm(
        "¿Eliminar todas las unidades de este usuario? Esta acción no se puede deshacer."
      )
    )
      return;
    setActionLoading("reset-unidades");
    try {
      const res = await resetUsuario(id!, {
        resetSesiones: false,
        resetPdfs: false,
        resetSuscripcion: false,
        resetUnidades: true,
        resetPerfil: false,
      });
      toast.success(
        res.message || `${res.data.unidadesEliminadas} unidades eliminadas`
      );
      cargarDetalle();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Error al resetear unidades"
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDowngrade() {
    if (
      !window.confirm(
        "¿Bajar a este usuario a plan free? Se desactivará su suscripción premium."
      )
    )
      return;
    setActionLoading("downgrade");
    try {
      const res = await downgradeUsuario(id!);
      toast.success(res.message || "Usuario bajado a free");
      cargarDetalle();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error al hacer downgrade");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleEliminar() {
    const confirmText = window.prompt(
      'Esta acción es IRREVERSIBLE. Escribe "ELIMINAR" para confirmar:'
    );
    if (confirmText !== "ELIMINAR") {
      if (confirmText !== null) toast.info("Acción cancelada");
      return;
    }
    setActionLoading("eliminar");
    try {
      const res = await eliminarUsuario(id!);
      toast.success(res.message || "Usuario eliminado");
      navigate("/admin/usuarios", { replace: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error al eliminar usuario");
    } finally {
      setActionLoading(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="space-y-4">
        <Link to="/admin/usuarios">
          <Button variant="ghost" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <User className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Usuario no encontrado</p>
        </div>
      </div>
    );
  }

  const plan = usuario.suscripcion?.plan || "free";
  const isPremium = plan !== "free" && usuario.suscripcion?.activa;

  return (
    <div className="space-y-6">
      {/* Back + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link to="/admin/usuarios">
          <Button variant="ghost" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a usuarios
          </Button>
        </Link>
        <div className="flex gap-2">
          {isPremium && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleDowngrade}
              disabled={!!actionLoading}
              className="border-yellow-600 text-yellow-600 hover:bg-yellow-100"
            >
              {actionLoading === "downgrade" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ArrowDownCircle className="w-4 h-4 mr-2" />
              )}
              Downgrade a Free
            </Button>
          )}
          <Button
            size="sm"
            variant="destructive"
            onClick={handleEliminar}
            disabled={!!actionLoading}
          >
            {actionLoading === "eliminar" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Eliminar usuario
          </Button>
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <User className="w-7 h-7 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900">
              {usuario.nombre || "Sin nombre"}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {usuario.email}
              </span>
              {usuario.nombreInstitucion && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {usuario.nombreInstitucion}
                </span>
              )}
              {usuario.departamento && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {[usuario.departamento, usuario.provincia, usuario.distrito]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <PlanBadge plan={plan} activa={usuario.suscripcion?.activa} />
              <StatusBadge
                label={usuario.perfilCompleto ? "Perfil completo" : "Perfil incompleto"}
                ok={usuario.perfilCompleto}
              />
              <StatusBadge
                label={
                  usuario.problematicaCompleta
                    ? "Problemática completa"
                    : "Sin problemática"
                }
                ok={usuario.problematicaCompleta}
              />
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
          <InfoItem label="ID" value={usuario.id} mono />
          <InfoItem label="Auth0 ID" value={usuario.auth0UserId} mono />
          <InfoItem
            label="Nivel"
            value={usuario.nivel?.nombre || "—"}
          />
          <InfoItem
            label="Grado"
            value={usuario.grado?.nombre || "—"}
          />
          <InfoItem
            label="Problemática"
            value={usuario.problematica?.nombre || "—"}
          />
          <InfoItem
            label="Registrado"
            value={new Date(usuario.createdAt).toLocaleDateString("es-PE", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          />
        </div>
      </div>

      {/* Reset Actions */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-gray-900 font-semibold text-sm flex items-center gap-2 mb-4">
          <RotateCcw className="w-4 h-4 text-gray-500" />
          Acciones de Reset
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={handleResetSesiones}
            disabled={!!actionLoading}
            className="border-orange-600 text-orange-600 hover:bg-orange-100"
          >
            {actionLoading === "reset-sesiones" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileText className="w-4 h-4 mr-2" />
            )}
            Reset Sesiones ({usuario.stats.totalSesiones})
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleResetUnidades}
            disabled={!!actionLoading}
            className="border-orange-600 text-orange-600 hover:bg-orange-100"
          >
            {actionLoading === "reset-unidades" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FolderOpen className="w-4 h-4 mr-2" />
            )}
            Reset Unidades ({usuario.stats.totalUnidades})
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleResetPerfil}
            disabled={!!actionLoading}
            className="border-purple-600 text-purple-600 hover:bg-purple-100"
          >
            {actionLoading === "reset-perfil" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4 mr-2" />
            )}
            Reset Perfil
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleResetTodo}
            disabled={!!actionLoading}
            className="border-red-600 text-red-600 hover:bg-red-100"
          >
            {actionLoading === "reset-todo" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4 mr-2" />
            )}
            Reset Todo
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard label="Sesiones" value={usuario.stats.totalSesiones} icon={FileText} />
        <StatCard label="Unidades" value={usuario.stats.totalUnidades} icon={FolderOpen} />
        <StatCard label="Ses. esta semana" value={usuario.stats.sesionesEstaSemana} icon={Calendar} />
        <StatCard label="Ses. con PDF" value={usuario.stats.sesionesConPdf} icon={FileText} />
        <StatCard label="Und. con PDF" value={usuario.stats.unidadesConPdf} icon={FolderOpen} />
      </div>

      {/* Suscripción */}
      {usuario.suscripcion && (
        <Section title="Suscripción" icon={CreditCard}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <InfoItem label="Plan" value={usuario.suscripcion.plan} />
            <InfoItem
              label="Estado"
              value={usuario.suscripcion.activa ? "Activa" : "Inactiva"}
            />
            <InfoItem
              label="Inicio"
              value={
                usuario.suscripcion.fechaInicio
                  ? new Date(usuario.suscripcion.fechaInicio).toLocaleDateString("es-PE")
                  : "—"
              }
            />
            <InfoItem
              label="Fin"
              value={
                usuario.suscripcion.fechaFin
                  ? new Date(usuario.suscripcion.fechaFin).toLocaleDateString("es-PE")
                  : "—"
              }
            />
          </div>

          {/* Pagos */}
          {usuario.suscripcion.pagos.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 text-left">
                    <th className="px-3 py-2 font-medium">Estado</th>
                    <th className="px-3 py-2 font-medium">Monto</th>
                    <th className="px-3 py-2 font-medium">Método</th>
                    <th className="px-3 py-2 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {usuario.suscripcion.pagos.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <EstadoBadge estado={p.estado} />
                      </td>
                      <td className="px-3 py-2 text-gray-900">
                        {p.moneda === "USD" ? "$" : "S/"}{" "}
                        {p.monto?.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-gray-600 text-xs">
                        {p.metodoPago || "—"}
                      </td>
                      <td className="px-3 py-2 text-gray-500 text-xs">
                        {new Date(p.createdAt).toLocaleDateString("es-PE", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      )}

      {/* Sesiones */}
      <Section title={`Sesiones (${usuario.sesiones.length})`} icon={FileText}>
        {usuario.sesiones.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">
            Sin sesiones creadas
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-left">
                  <th className="px-3 py-2 font-medium">Título</th>
                  <th className="px-3 py-2 font-medium">Fecha</th>
                  <th className="px-3 py-2 font-medium">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {usuario.sesiones.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-900 truncate max-w-[300px]">
                      {s.titulo || "—"}
                    </td>
                    <td className="px-3 py-2 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(s.createdAt).toLocaleDateString("es-PE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-3 py-2">
                      {s.pdfUrl ? (
                        <a
                          href={s.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Unidades */}
      <Section title={`Unidades (${usuario.unidades.length})`} icon={FolderOpen}>
        {usuario.unidades.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">
            Sin unidades creadas
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-left">
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">Título</th>
                  <th className="px-3 py-2 font-medium">Tipo</th>
                  <th className="px-3 py-2 font-medium">Fecha</th>
                  <th className="px-3 py-2 font-medium">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {usuario.unidades.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-500 text-xs">
                      {u.numeroUnidad}
                    </td>
                    <td className="px-3 py-2 text-gray-900 truncate max-w-[250px]">
                      {u.titulo || "—"}
                    </td>
                    <td className="px-3 py-2 text-gray-600 text-xs">
                      {u.tipo}
                    </td>
                    <td className="px-3 py-2 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString("es-PE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-3 py-2">
                      {u.pdfUrl ? (
                        <a
                          href={u.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
}

// ─── Sub-components ───

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-200 flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-500" />
        <h2 className="text-gray-900 font-semibold text-sm">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-gray-400" />
        <span className="text-gray-500 text-xs">{label}</span>
      </div>
      <p className="text-gray-900 text-xl font-bold">{value}</p>
    </div>
  );
}

function InfoItem({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-gray-400 text-xs mb-0.5">{label}</p>
      <p
        className={`text-gray-700 text-sm truncate ${mono ? "font-mono text-xs" : ""}`}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

function PlanBadge({ plan, activa }: { plan: string; activa?: boolean }) {
  if (plan === "free") {
    return (
      <span className="bg-gray-200 text-gray-500 text-xs font-medium px-2 py-1 rounded-full">
        Free
      </span>
    );
  }
  const label = plan === "premium_anual" ? "Premium Anual" : "Premium Mensual";
  if (!activa) {
    return (
      <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
        {label} (inactivo)
      </span>
    );
  }
  return (
    <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2 py-1 rounded-full">
      {label}
    </span>
  );
}

function StatusBadge({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span
      className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
        ok
          ? "bg-green-100 text-green-600"
          : "bg-yellow-100 text-yellow-600"
      }`}
    >
      {ok ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : (
        <Shield className="w-3 h-3" />
      )}
      {label}
    </span>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    PENDIENTE: { bg: "bg-yellow-100", text: "text-yellow-600" },
    CONFIRMADO: { bg: "bg-green-100", text: "text-green-600" },
    RECHAZADO: { bg: "bg-red-100", text: "text-red-600" },
  };
  const c = config[estado] || config.PENDIENTE;
  return (
    <span className={`${c.bg} ${c.text} text-xs font-medium px-2 py-1 rounded-full`}>
      {estado}
    </span>
  );
}
