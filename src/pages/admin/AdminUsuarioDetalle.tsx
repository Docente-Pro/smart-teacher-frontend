import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  getUsuarioDetalle,
  downgradeUsuario,
  eliminarUsuario,
  resetUsuario,
  upgradePremium,
  rehacerSesion,
  rellenarListaAlumnosSesion,
  adminDownloadUrlWordSesion,
  adminDownloadUrlWordUnidad,
  adminGenerarWordSesion,
  adminGenerarWordUnidad,
  adminGenerarFichaAplicacion,
  adminUpdateUsuario,
} from "@/services/admin.service";
import type { IAdminUpdateUsuarioRequest } from "@/services/admin.service";
import { corregirEstandares, arreglarHorario, getUnidadById, editarContenidoUnidad } from "@/services/unidad.service";
import { getNiveles } from "@/features/initialForm/services/niveles.service";
import { getAllGrados } from "@/services/grado.service";
import { getAllProblematicas } from "@/services/problematica.service";
import type { IUsuarioDetalle } from "@/interfaces/IAdmin";
import type { INivel } from "@/interfaces/INivel";
import type { IGrado } from "@/interfaces/IGrado";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  FileDown,
  FolderOpen,
  ArrowDownCircle,
  Trash2,
  Shield,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RotateCcw,
  Crown,
  Wrench,
  CalendarClock,
  ListChecks,
  ClipboardList,
  Pencil,
  Save,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

import departamentosData from "@/utils/peru_ubigeo/1_ubigeo_departamentos.json";
import provinciasData from "@/utils/peru_ubigeo/2_ubigeo_provincias.json";
import distritosData from "@/utils/peru_ubigeo/3_ubigeo_distritos.json";

interface UbigeoDepartamento { id: number; departamento: string; ubigeo: string }
interface UbigeoProvincia { id: number; provincia: string; ubigeo: string; departamento_id: number }
interface UbigeoDistrito { id: number; distrito: string; ubigeo: string; provincia_id: number; departamento_id: number }

const departamentos: UbigeoDepartamento[] = departamentosData.ubigeo_departamentos;
const provincias: UbigeoProvincia[] = provinciasData.ubigeo_provincias;
const distritos: UbigeoDistrito[] = distritosData.ubigeo_distritos;

export default function AdminUsuarioDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<IUsuarioDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [upgradePlan, setUpgradePlan] = useState<"premium_mensual" | "premium_anual">("premium_mensual");
  const   [rehaciendo, setRehaciendo] = useState<string | null>(null);
  const [rehacerEstado, setRehacerEstado] = useState("");
  const [rellenandoLista, setRellenandoLista] = useState<string | null>(null);
  const [corrigiendoUnidad, setCorrigiendoUnidad] = useState<string | null>(null);
  const [corrigiendoHorario, setCorrigiendoHorario] = useState<string | null>(null);
  const [downloadingWord, setDownloadingWord] = useState<string | null>(null);
  const [generatingWord, setGeneratingWord] = useState<string | null>(null);
  const [generandoFicha, setGenerandoFicha] = useState<string | null>(null);

  // ── Edit profile state ──
  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm, setEditForm] = useState<IAdminUpdateUsuarioRequest>({});
  const [niveles, setNiveles] = useState<INivel[]>([]);
  const [todosLosGrados, setTodosLosGrados] = useState<IGrado[]>([]);
  const [problematicas, setProblematicas] = useState<{ id: number; nombre: string; descripcion: string }[]>([]);
  const [catalogsLoaded, setCatalogsLoaded] = useState(false);

  const gradosFiltrados = useMemo(() => {
    if (!editForm.nivelId || !todosLosGrados.length) return [];
    return todosLosGrados.filter((g) => g.nivelId === editForm.nivelId).sort((a, b) => a.id - b.id);
  }, [editForm.nivelId, todosLosGrados]);

  const provinciasFiltradas = useMemo(() => {
    if (!editForm.departamento) return [];
    const dep = departamentos.find((d) => d.departamento === editForm.departamento);
    if (!dep) return [];
    return provincias.filter((p) => p.departamento_id === dep.id);
  }, [editForm.departamento]);

  const distritosFiltrados = useMemo(() => {
    if (!editForm.provincia || !provinciasFiltradas.length) return [];
    const prov = provincias.find(
      (p) => p.provincia === editForm.provincia && provinciasFiltradas.includes(p),
    );
    if (!prov) return [];
    return distritos.filter((d) => d.provincia_id === prov.id);
  }, [editForm.provincia, provinciasFiltradas]);

  function initEditForm(u: IUsuarioDetalle) {
    setEditForm({
      nombre: u.nombre ?? "",
      email: u.email ?? "",
      nombreInstitucion: u.nombreInstitucion ?? "",
      nombreDirectivo: u.nombreDirectivo ?? "",
      nombreSubdirectora: u.nombreSubdirectora ?? "",
      genero: u.genero ?? "",
      seccion: u.seccion ?? "",
      nivelId: u.nivel?.id ?? 0,
      gradoId: u.grado?.id ?? 0,
      problematicaId: u.problematica?.id ?? 0,
      departamento: u.departamento ?? "",
      provincia: u.provincia ?? "",
      distrito: u.distrito ?? "",
      tituloUnidadContexto: u.tituloUnidadContexto ?? "",
      situacionSignificativaContexto: u.situacionSignificativaContexto ?? "",
    });
  }

  async function loadCatalogs() {
    if (catalogsLoaded) return;
    try {
      const [nivelesRes, gradosRes, probRes] = await Promise.all([
        getNiveles(),
        getAllGrados(),
        getAllProblematicas(),
      ]);
      setNiveles(nivelesRes.data.data ?? nivelesRes.data ?? []);
      setTodosLosGrados(gradosRes.data.data ?? gradosRes.data ?? []);
      const probData = probRes.data.data ?? probRes.data ?? [];
      setProblematicas(probData);
      setCatalogsLoaded(true);
    } catch {
      toast.error("Error al cargar catálogos");
    }
  }

  function handleOpenEdit() {
    if (!usuario) return;
    initEditForm(usuario);
    loadCatalogs();
    setEditOpen(true);
  }

  function handleCancelEdit() {
    setEditOpen(false);
  }

  function updateField<K extends keyof IAdminUpdateUsuarioRequest>(key: K, value: IAdminUpdateUsuarioRequest[K]) {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSaveProfile() {
    if (!id || !usuario) return;
    setEditSaving(true);
    try {
      const payload: IAdminUpdateUsuarioRequest = {};
      const f = editForm;
      if (f.nombre && f.nombre !== usuario.nombre) payload.nombre = f.nombre;
      if (f.email && f.email !== usuario.email) payload.email = f.email;
      if ((f.nombreInstitucion ?? "") !== (usuario.nombreInstitucion ?? "")) payload.nombreInstitucion = f.nombreInstitucion;
      if ((f.nombreDirectivo ?? "") !== (usuario.nombreDirectivo ?? "")) payload.nombreDirectivo = f.nombreDirectivo;
      if ((f.nombreSubdirectora ?? "") !== (usuario.nombreSubdirectora ?? "")) payload.nombreSubdirectora = f.nombreSubdirectora;
      if ((f.genero ?? "") !== (usuario.genero ?? "")) payload.genero = f.genero;
      if ((f.seccion ?? "") !== (usuario.seccion ?? "")) payload.seccion = f.seccion;
      if (f.nivelId && f.nivelId !== (usuario.nivel?.id ?? 0)) payload.nivelId = f.nivelId;
      if (f.gradoId && f.gradoId !== (usuario.grado?.id ?? 0)) payload.gradoId = f.gradoId;
      if (f.problematicaId && f.problematicaId !== (usuario.problematica?.id ?? 0)) payload.problematicaId = f.problematicaId;
      if ((f.departamento ?? "") !== (usuario.departamento ?? "")) payload.departamento = f.departamento;
      if ((f.provincia ?? "") !== (usuario.provincia ?? "")) payload.provincia = f.provincia;
      if ((f.distrito ?? "") !== (usuario.distrito ?? "")) payload.distrito = f.distrito;
      if ((f.tituloUnidadContexto ?? "") !== (usuario.tituloUnidadContexto ?? "")) payload.tituloUnidadContexto = f.tituloUnidadContexto;
      if ((f.situacionSignificativaContexto ?? "") !== (usuario.situacionSignificativaContexto ?? "")) payload.situacionSignificativaContexto = f.situacionSignificativaContexto;

      if (Object.keys(payload).length === 0) {
        toast.info("No hay cambios que guardar");
        return;
      }

      const res = await adminUpdateUsuario(id, payload);
      setUsuario(res.data);
      toast.success("Perfil actualizado correctamente");
      setEditOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.response?.data?.error || "Error al actualizar perfil");
    } finally {
      setEditSaving(false);
    }
  }

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

  async function handleUpgradePremium() {
    if (!id) return;
    const nombre = usuario?.nombre || id;
    if (
      !window.confirm(
        `¿Subir a ${upgradePlan === "premium_anual" ? "Premium Anual" : "Premium Mensual"} al usuario ${nombre}?`
      )
    )
      return;
    setActionLoading("upgrade");
    try {
      const res = await upgradePremium(id, { plan: upgradePlan });
      toast.success(res.message || "Usuario actualizado a premium");
      cargarDetalle();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error al subir a premium");
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
        <div className="flex flex-wrap gap-2">
          {!isPremium && (
            <div className="flex items-center gap-2">
              <select
                value={upgradePlan}
                onChange={(e) =>
                  setUpgradePlan(
                    e.target.value as "premium_mensual" | "premium_anual"
                  )
                }
                className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-md px-2 py-1.5"
              >
                <option value="premium_mensual">Mensual</option>
                <option value="premium_anual">Anual</option>
              </select>
              <Button
                size="sm"
                onClick={handleUpgradePremium}
                disabled={!!actionLoading}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                {actionLoading === "upgrade" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Crown className="w-4 h-4 mr-2" />
                )}
                Upgrade Premium
              </Button>
            </div>
          )}
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
          {usuario.genero && <InfoItem label="Género" value={usuario.genero} />}
          {usuario.seccion && <InfoItem label="Sección" value={usuario.seccion} />}
          {usuario.nombreDirectivo && <InfoItem label="Directivo" value={usuario.nombreDirectivo} />}
          {usuario.nombreSubdirectora && <InfoItem label="Subdirectora" value={usuario.nombreSubdirectora} />}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => (editOpen ? handleCancelEdit() : handleOpenEdit())}
            className="gap-1.5 text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            {editOpen ? <ChevronUp className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            {editOpen ? "Cerrar edición" : "Editar Perfil"}
          </Button>
        </div>
      </div>

      {/* Edit Profile Form */}
      {editOpen && (
        <div className="bg-white border border-blue-200 rounded-xl p-6 space-y-5">
          <h2 className="text-gray-900 font-semibold text-sm flex items-center gap-2">
            <Pencil className="w-4 h-4 text-blue-500" />
            Editar Perfil
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Nombre */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-nombre" className="text-xs text-gray-500">Nombre completo</Label>
              <Input
                id="edit-nombre"
                value={editForm.nombre ?? ""}
                onChange={(e) => updateField("nombre", e.target.value)}
                placeholder="Nombre del docente"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-email" className="text-xs text-gray-500">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email ?? ""}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </div>

            {/* Institución */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-institucion" className="text-xs text-gray-500">Institución Educativa</Label>
              <Input
                id="edit-institucion"
                value={editForm.nombreInstitucion ?? ""}
                onChange={(e) => updateField("nombreInstitucion", e.target.value)}
                placeholder="Nombre de la I.E."
              />
            </div>

            {/* Género */}
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Género</Label>
              <Select
                value={editForm.genero ?? ""}
                onValueChange={(v) => updateField("genero", v)}
              >
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Femenino">Femenino</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Nivel */}
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Nivel</Label>
              <Select
                value={editForm.nivelId ? String(editForm.nivelId) : ""}
                onValueChange={(v) => {
                  const nivelId = Number(v);
                  updateField("nivelId", nivelId);
                  const gradoValido = todosLosGrados.find(
                    (g) => g.nivelId === nivelId && g.id === editForm.gradoId,
                  );
                  if (!gradoValido) updateField("gradoId", 0);
                }}
              >
                <SelectTrigger><SelectValue placeholder="Seleccionar nivel" /></SelectTrigger>
                <SelectContent>
                  {niveles.map((n) => (
                    <SelectItem key={n.id} value={String(n.id)}>{n.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Grado */}
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Grado</Label>
              <Select
                value={editForm.gradoId ? String(editForm.gradoId) : ""}
                onValueChange={(v) => updateField("gradoId", Number(v))}
                disabled={!editForm.nivelId}
              >
                <SelectTrigger><SelectValue placeholder="Seleccionar grado" /></SelectTrigger>
                <SelectContent>
                  {gradosFiltrados.map((g) => (
                    <SelectItem key={g.id} value={String(g.id)}>{g.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Problemática */}
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Problemática</Label>
              <Select
                value={editForm.problematicaId ? String(editForm.problematicaId) : ""}
                onValueChange={(v) => updateField("problematicaId", Number(v))}
              >
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {problematicas.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sección */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-seccion" className="text-xs text-gray-500">Sección</Label>
              <Input
                id="edit-seccion"
                value={editForm.seccion ?? ""}
                onChange={(e) => updateField("seccion", e.target.value)}
                placeholder='Ej: "A"'
              />
            </div>

            {/* Directivo */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-directivo" className="text-xs text-gray-500">Nombre del Directivo</Label>
              <Input
                id="edit-directivo"
                value={editForm.nombreDirectivo ?? ""}
                onChange={(e) => updateField("nombreDirectivo", e.target.value)}
                placeholder="Director/a"
              />
            </div>

            {/* Subdirectora */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-subdirectora" className="text-xs text-gray-500">Nombre Subdirectora</Label>
              <Input
                id="edit-subdirectora"
                value={editForm.nombreSubdirectora ?? ""}
                onChange={(e) => updateField("nombreSubdirectora", e.target.value)}
                placeholder="Subdirector/a"
              />
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <p className="text-xs text-gray-400 font-medium mb-2 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Ubicación
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Departamento */}
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Departamento</Label>
                <Select
                  value={editForm.departamento ?? ""}
                  onValueChange={(v) => {
                    updateField("departamento", v);
                    updateField("provincia", "");
                    updateField("distrito", "");
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {departamentos.map((d) => (
                      <SelectItem key={d.id} value={d.departamento}>{d.departamento}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Provincia */}
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Provincia</Label>
                <Select
                  value={editForm.provincia ?? ""}
                  onValueChange={(v) => {
                    updateField("provincia", v);
                    updateField("distrito", "");
                  }}
                  disabled={!editForm.departamento}
                >
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {provinciasFiltradas.map((p) => (
                      <SelectItem key={p.id} value={p.provincia}>{p.provincia}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Distrito */}
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Distrito</Label>
                <Select
                  value={editForm.distrito ?? ""}
                  onValueChange={(v) => updateField("distrito", v)}
                  disabled={!editForm.provincia}
                >
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {distritosFiltrados.map((d) => (
                      <SelectItem key={d.id} value={d.distrito}>{d.distrito}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contexto de unidad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-titulo-unidad" className="text-xs text-gray-500">Título Unidad (contexto)</Label>
              <Input
                id="edit-titulo-unidad"
                value={editForm.tituloUnidadContexto ?? ""}
                onChange={(e) => updateField("tituloUnidadContexto", e.target.value)}
                placeholder="Título de la unidad didáctica"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-situacion" className="text-xs text-gray-500">Situación Significativa (contexto)</Label>
              <Input
                id="edit-situacion"
                value={editForm.situacionSignificativaContexto ?? ""}
                onChange={(e) => updateField("situacionSignificativaContexto", e.target.value)}
                placeholder="Situación significativa de la unidad"
              />
            </div>
          </div>

          {/* Save / Cancel */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancelEdit}
              disabled={editSaving}
              className="text-gray-500"
            >
              <X className="w-4 h-4 mr-1" /> Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSaveProfile}
              disabled={editSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {editSaving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
              Guardar cambios
            </Button>
          </div>
        </div>
      )}

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
                  <th className="px-3 py-2 font-medium">Word</th>
                  <th className="px-3 py-2 font-medium">Acción</th>
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
                    <td className="px-3 py-2">
                      {s.wordUrl ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1 text-xs h-7 text-green-700 hover:text-green-800 hover:bg-green-50 p-1"
                          disabled={downloadingWord === s.id}
                          onClick={async () => {
                            setDownloadingWord(s.id);
                            try {
                              const res = await adminDownloadUrlWordSesion(s.id);
                              window.open(res.data.downloadUrl, "_blank");
                            } catch (err: any) {
                              toast.error(err?.response?.data?.message || "Error al obtener Word");
                            } finally {
                              setDownloadingWord(null);
                            }
                          }}
                        >
                          {downloadingWord === s.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <FileDown className="w-4 h-4" />
                          )}
                        </Button>
                      ) : s.pdfUrl ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-xs h-7 border-blue-300 text-blue-700 hover:bg-blue-50"
                          disabled={generatingWord === s.id}
                          onClick={async () => {
                            setGeneratingWord(s.id);
                            try {
                              const wordUrl = await adminGenerarWordSesion(s.id);
                              setUsuario((prev) => {
                                if (!prev) return prev;
                                return {
                                  ...prev,
                                  sesiones: prev.sesiones.map((ses) =>
                                    ses.id === s.id ? { ...ses, wordUrl } : ses,
                                  ),
                                };
                              });
                              toast.success("Word generado");
                            } catch (err: any) {
                              toast.error(err?.message || "Error al generar Word");
                            } finally {
                              setGeneratingWord(null);
                            }
                          }}
                        >
                          {generatingWord === s.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <FileText className="w-3 h-3" />
                          )}
                          {generatingWord === s.id ? "…" : "Generar"}
                        </Button>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-xs h-7 border-amber-300 text-amber-700 hover:bg-amber-50"
                          disabled={rehaciendo === s.id || rellenandoLista === s.id}
                          onClick={async () => {
                            if (!confirm(`¿Rehacer la sesión "${s.titulo || s.id}"? Se regenerará el contenido y un PDF nuevo.`)) return;
                            setRehaciendo(s.id);
                            setRehacerEstado("Regenerando contenido…");
                            try {
                              const res = await rehacerSesion(s.id);
                              navigate(`/admin/rehacer-pdf/${s.id}`, {
                                state: {
                                  rehacerResponse: res,
                                  docente: usuario?.nombre ?? "",
                                  institucion: usuario?.nombreInstitucion ?? "",
                                  seccion: usuario?.seccion ?? "",
                                  usuarioId: usuario!.id,
                                },
                              });
                            } catch (err: any) {
                              console.error("❌ [Admin] Error al rehacer sesión:", err);
                              toast.error(
                                err?.response?.data?.message || "Error al rehacer la sesión",
                              );
                            } finally {
                              setRehaciendo(null);
                              setRehacerEstado("");
                            }
                          }}
                        >
                          {rehaciendo === s.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3 h-3" />
                          )}
                          {rehaciendo === s.id && rehacerEstado ? rehacerEstado : "Rehacer"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-xs h-7 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                          disabled={rehaciendo === s.id || rellenandoLista === s.id}
                          onClick={async () => {
                            if (!confirm(`¿Rellenar lista de alumnos en "${s.titulo || s.id}"? Se usará la lista del aula u otra sesión del docente. Si había PDF, se invalidará para regenerarlo.`)) return;
                            setRellenandoLista(s.id);
                            try {
                              const res = await rellenarListaAlumnosSesion(s.id);
                              const d = res.data;
                              if (d.yaTeníaLista) {
                                toast.success(`Ya tenía lista (${d.cantidadAlumnos} alumnos). ${res.message}`);
                              } else {
                                toast.success(`${res.message} (${d.cantidadAlumnos} alumnos${d.pdfInvalidado ? "; PDF invalidado" : ""})`);
                              }
                              cargarDetalle();
                            } catch (err: any) {
                              toast.error(
                                err?.response?.data?.message || "Error al rellenar lista de alumnos",
                              );
                            } finally {
                              setRellenandoLista(null);
                            }
                          }}
                        >
                          {rellenandoLista === s.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <ListChecks className="w-3 h-3" />
                          )}
                          {rellenandoLista === s.id ? "…" : "Rellenar lista"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-xs h-7 border-violet-300 text-violet-700 hover:bg-violet-50"
                          disabled={generandoFicha === s.id || rehaciendo === s.id}
                          onClick={async () => {
                            setGenerandoFicha(s.id);
                            try {
                              const res = await adminGenerarFichaAplicacion(s.id, {
                                incluirRespuestas: true,
                                dificultad: "media",
                              });
                              navigate(`/admin/ficha-pdf/${s.id}`, {
                                state: {
                                  ficha: res.ficha,
                                  fichaId: res.fichaId,
                                  presignedUrl: res.presignedUrl,
                                  s3Key: res.s3Key,
                                  docente: usuario?.nombre ?? "",
                                  institucion: usuario?.nombreInstitucion ?? "",
                                  usuarioId: usuario!.id,
                                },
                              });
                            } catch (err: any) {
                              toast.error(
                                err?.response?.data?.message ||
                                  err?.response?.data?.error ||
                                  "Error al generar ficha",
                              );
                            } finally {
                              setGenerandoFicha(null);
                            }
                          }}
                        >
                          {generandoFicha === s.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <ClipboardList className="w-3 h-3" />
                          )}
                          {generandoFicha === s.id ? "Generando…" : "Ficha"}
                        </Button>
                      </div>
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
                  <th className="px-3 py-2 font-medium">Word</th>
                  <th className="px-3 py-2 font-medium">Acciones</th>
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
                    <td className="px-3 py-2">
                      {u.wordUrl ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1 text-xs h-7 text-green-700 hover:text-green-800 hover:bg-green-50 p-1"
                          disabled={downloadingWord === u.id}
                          onClick={async () => {
                            setDownloadingWord(u.id);
                            try {
                              const res = await adminDownloadUrlWordUnidad(u.id);
                              window.open(res.data.downloadUrl, "_blank");
                            } catch (err: any) {
                              toast.error(err?.response?.data?.message || "Error al obtener Word");
                            } finally {
                              setDownloadingWord(null);
                            }
                          }}
                        >
                          {downloadingWord === u.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <FileDown className="w-4 h-4" />
                          )}
                        </Button>
                      ) : u.pdfUrl ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-xs h-7 border-blue-300 text-blue-700 hover:bg-blue-50"
                          disabled={generatingWord === u.id}
                          onClick={async () => {
                            setGeneratingWord(u.id);
                            try {
                              const wordUrl = await adminGenerarWordUnidad(u.id);
                              setUsuario((prev) => {
                                if (!prev) return prev;
                                return {
                                  ...prev,
                                  unidades: prev.unidades.map((uni) =>
                                    uni.id === u.id ? { ...uni, wordUrl } : uni,
                                  ),
                                };
                              });
                              toast.success("Word generado");
                            } catch (err: any) {
                              toast.error(err?.message || "Error al generar Word");
                            } finally {
                              setGeneratingWord(null);
                            }
                          }}
                        >
                          {generatingWord === u.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <FileText className="w-3 h-3" />
                          )}
                          {generatingWord === u.id ? "…" : "Generar"}
                        </Button>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-xs h-7 border-amber-300 text-amber-700 hover:bg-amber-50"
                        disabled={corrigiendoUnidad === u.id}
                        onClick={async () => {
                          if (!confirm(`¿Corregir estándares de la unidad "${u.titulo || u.id}"? Se regenerará el PDF.`)) return;
                          setCorrigiendoUnidad(u.id);
                          try {
                            const res = await corregirEstandares(u.id);
                            if (res.totalCorregidos === 0) {
                              toast.info("Los estándares ya estaban correctos");
                              return;
                            }
                            // Navegar a la página dedicada de renderizado PDF
                            navigate(`/admin/corregir-estandares-pdf/${u.id}`, {
                              state: {
                                corregirResponse: res,
                                unidadId: u.id,
                                titulo: u.titulo || "",
                                numeroUnidad: u.numeroUnidad,
                                grado: usuario?.grado?.nombre ?? "",
                                nivel: usuario?.nivel?.nombre ?? "",
                                fechaInicio: "",
                                fechaFin: "",
                                docente: usuario?.nombre ?? "",
                                institucion: usuario?.nombreInstitucion ?? "",
                                seccion: usuario?.seccion ?? "",
                                nombreDirectivo: "",
                                nombreSubdirectora: "",
                                usuarioId: usuario!.id,
                              },
                            });
                          } catch (err: any) {
                            console.error("❌ [Admin] Error al corregir estándares:", err);
                            toast.error(
                              err?.response?.data?.message || "Error al corregir estándares",
                            );
                          } finally {
                            setCorrigiendoUnidad(null);
                          }
                        }}
                      >
                        {corrigiendoUnidad === u.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Wrench className="w-3 h-3" />
                        )}
                        {corrigiendoUnidad === u.id ? "Corrigiendo…" : "Corregir"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-xs h-7 border-blue-300 text-blue-700 hover:bg-blue-50 ml-1"
                        disabled={corrigiendoHorario === u.id}
                        onClick={async () => {
                          if (!confirm(`¿Arreglar horario de la unidad "${u.titulo || u.id}"? Se corregirá la secuencia y se regenerará el PDF.`)) return;
                          setCorrigiendoHorario(u.id);
                          try {
                            // 1. Cargar unidad completa para obtener secuencia
                            const { data: unidad } = await getUnidadById(u.id);
                            let contenido = unidad.contenido as any;
                            if (typeof contenido === "string") {
                              try { contenido = JSON.parse(contenido); } catch { contenido = {}; }
                            }
                            if (typeof contenido === "string") {
                              try { contenido = JSON.parse(contenido); } catch { contenido = {}; }
                            }
                            if (contenido?.contenido && !contenido.secuencia) {
                              contenido = contenido.contenido;
                              if (typeof contenido === "string") {
                                try { contenido = JSON.parse(contenido); } catch { contenido = {}; }
                              }
                            }

                            if (!contenido?.secuencia) {
                              toast.error("La unidad no tiene secuencia de actividades");
                              return;
                            }

                            const grado = usuario?.grado?.nombre ?? "";

                            // 2. Llamar al endpoint de arreglar horario
                            const res = await arreglarHorario({
                              secuencia: contenido.secuencia,
                              grado,
                              turno: "mañana",
                            });

                            if (!res.success) {
                              toast.error(res.error || "Error al arreglar horario");
                              return;
                            }

                            if (!res.cambios || res.cambios.length === 0) {
                              toast.info("El horario ya estaba correcto");
                              return;
                            }

                            // 3. Guardar la secuencia corregida en BD
                            await editarContenidoUnidad(u.id, {
                              contenido: { secuencia: res.secuencia },
                            });

                            // 4. Navegar a regenerar PDF con el contenido actualizado
                            const unidadActualizada = { ...contenido, secuencia: res.secuencia };
                            navigate(`/admin/corregir-estandares-pdf/${u.id}`, {
                              state: {
                                corregirResponse: {
                                  success: true,
                                  totalCorregidos: res.cambios.length,
                                  guardadoEnBD: true,
                                  correcciones: [],
                                  unidad: unidadActualizada,
                                  upload: null,
                                  miembrosUpload: [],
                                },
                                unidadId: u.id,
                                titulo: u.titulo || "",
                                numeroUnidad: u.numeroUnidad,
                                grado,
                                nivel: usuario?.nivel?.nombre ?? "",
                                fechaInicio: "",
                                fechaFin: "",
                                docente: usuario?.nombre ?? "",
                                institucion: usuario?.nombreInstitucion ?? "",
                                seccion: usuario?.seccion ?? "",
                                nombreDirectivo: "",
                                nombreSubdirectora: "",
                                usuarioId: usuario!.id,
                              },
                            });

                            toast.success(`${res.cambios.length} horario(s) corregido(s)`);
                          } catch (err: any) {
                            console.error("❌ [Admin] Error al arreglar horario:", err);
                            toast.error(
                              err?.response?.data?.message || "Error al arreglar horario",
                            );
                          } finally {
                            setCorrigiendoHorario(null);
                          }
                        }}
                      >
                        {corrigiendoHorario === u.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <CalendarClock className="w-3 h-3" />
                        )}
                        {corrigiendoHorario === u.id ? "Arreglando…" : "Arreglar Horario"}
                      </Button>
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
