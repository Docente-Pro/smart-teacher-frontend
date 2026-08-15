import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  getUsuarioDetalle,
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
import { adminGetUnidadById, adminArreglarHorario, adminEditarContenidoUnidad, adminCorregirEstandares, adminArreglarActividades, adminFinalizarUnidad, adminResetUnidad, revocarSuscripcion } from "@/services/admin.service";
import type { IArreglarActividadesResponse } from "@/services/admin.service";
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
  FlagOff,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { ConsumoIADocente } from "@/components/admin/ConsumoIADocente";
import { toast } from "sonner";
import {
  adminCard,
  adminCta,
  adminBtnAtmosphere,
  adminBtnGhost,
  adminBtnDanger,
  adminBtnDangerOutline,
  adminBtnWarningOutline,
  adminInput,
  adminSelect,
  adminRowWarning,
  adminRowAtmosphere,
  adminRowGreen,
  adminRowPink,
  adminRowBtn,
} from "@/styles/adminUi";
import { dpFocusRing, dpSectionGap } from "@/styles/dpTokens";

import departamentosData from "@/utils/peru_ubigeo/1_ubigeo_departamentos.json";
import provinciasData from "@/utils/peru_ubigeo/2_ubigeo_provincias.json";
import distritosData from "@/utils/peru_ubigeo/3_ubigeo_distritos.json";

interface UbigeoDepartamento { id: number; departamento: string; ubigeo: string }
interface UbigeoProvincia { id: number; provincia: string; ubigeo: string; departamento_id: number }
interface UbigeoDistrito { id: number; distrito: string; ubigeo: string; provincia_id: number; departamento_id: number }

const departamentos: UbigeoDepartamento[] = departamentosData.ubigeo_departamentos;
const provincias: UbigeoProvincia[] = provinciasData.ubigeo_provincias;
const distritos: UbigeoDistrito[] = distritosData.ubigeo_distritos;

function isUnidadActivaParaFinalizar(fechaFin?: string | null): boolean {
  if (fechaFin == null) return true;
  return new Date(fechaFin).getTime() > Date.now();
}

export default function AdminUsuarioDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<IUsuarioDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [upgradePlan, setUpgradePlan] = useState<"premium_mensual" | "premium_anual">("premium_mensual");
  const [rehaciendo, setRehaciendo] = useState<string | null>(null);
  const [rehacerEstado, setRehacerEstado] = useState("");
  const [rellenandoLista, setRellenandoLista] = useState<string | null>(null);
  const [corrigiendoUnidad, setCorrigiendoUnidad] = useState<string | null>(null);
  const [corrigiendoHorario, setCorrigiendoHorario] = useState<string | null>(null);
  const [arreglandoActividades, setArreglandoActividades] = useState<string | null>(null);
  const [resultadoArreglo, setResultadoArreglo] = useState<{ unidadId: string; res: IArreglarActividadesResponse } | null>(null);
  const [downloadingWord, setDownloadingWord] = useState<string | null>(null);
  const [generatingWord, setGeneratingWord] = useState<string | null>(null);
  const [generandoFicha, setGenerandoFicha] = useState<string | null>(null);
  const [finalizandoUnidadId, setFinalizandoUnidadId] = useState<string | null>(null);
  const [reiniciandoUnidadId, setReiniciandoUnidadId] = useState<string | null>(null);

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
      const res = await revocarSuscripcion(id!);
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
      <div className="space-y-4" aria-busy="true" aria-label="Cargando docente">
        <div className="h-11 w-40 animate-pulse rounded-[16px] bg-[#EEF3F9]" />
        <div className={`${adminCard} h-48 animate-pulse`} />
        <div className={`${adminCard} h-32 animate-pulse`} />
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="space-y-4">
        <Link to="/admin/usuarios" className={`${adminBtnGhost} inline-flex`}>
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
          Volver
        </Link>
        <div className={`${adminCard} px-6 py-12 text-center`}>
          <User className="mx-auto mb-3 h-10 w-10 text-[#9CA3AF]" aria-hidden />
          <p className="text-lg font-extrabold text-[#1F2937]">
            No encontramos a este docente
          </p>
          <p className="mt-1 text-base font-semibold text-[#6B7280]">
            Vuelve a la lista e intenta de nuevo.
          </p>
        </div>
      </div>
    );
  }

  const plan = usuario.suscripcion?.plan || "free";
  const isPremium = plan !== "free" && usuario.suscripcion?.activa;

  return (
    <div className="text-[#1F2937]">
      <div className={`${dpSectionGap} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
        <Link to="/admin/usuarios" className={`${adminBtnGhost} inline-flex w-fit`}>
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
          Volver a usuarios
        </Link>
        <div className="flex flex-wrap gap-2">
          {!isPremium && (
            <div className="flex items-center gap-2">
              <label htmlFor="upgrade-plan-detalle" className="sr-only">
                Plan Premium
              </label>
              <select
                id="upgrade-plan-detalle"
                value={upgradePlan}
                onChange={(e) =>
                  setUpgradePlan(
                    e.target.value as "premium_mensual" | "premium_anual"
                  )
                }
                className={adminSelect}
              >
                <option value="premium_mensual">Mensual</option>
                <option value="premium_anual">Anual</option>
              </select>
              <Button
                onClick={handleUpgradePremium}
                disabled={!!actionLoading}
                className={adminBtnAtmosphere}
              >
                {actionLoading === "upgrade" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Crown className="mr-2 h-4 w-4" aria-hidden />
                )}
                Subir a Premium
              </Button>
            </div>
          )}
          {isPremium && (
            <Button
              variant="outline"
              onClick={handleDowngrade}
              disabled={!!actionLoading}
              className={adminBtnWarningOutline}
            >
              {actionLoading === "downgrade" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <ArrowDownCircle className="mr-2 h-4 w-4" aria-hidden />
              )}
              Bajar a Free
            </Button>
          )}
          <Button
            onClick={handleEliminar}
            disabled={!!actionLoading}
            className={adminBtnDanger}
          >
            {actionLoading === "eliminar" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" aria-hidden />
            )}
            Eliminar usuario
          </Button>
        </div>
      </div>

      <section className={`${dpSectionGap} ${adminCard} p-5 sm:p-6`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[18px] bg-[#EAF2FC] text-[#3B6CB5]">
            <User className="h-7 w-7" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-balance">
              {usuario.nombre || "Sin nombre"}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-base font-semibold text-[#6B7280]">
              <span className="flex items-center gap-1">
                <Mail className="h-4 w-4" aria-hidden />
                {usuario.email}
              </span>
              {usuario.nombreInstitucion && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" aria-hidden />
                  {usuario.nombreInstitucion}
                </span>
              )}
              {usuario.departamento && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" aria-hidden />
                  {[usuario.departamento, usuario.provincia, usuario.distrito]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
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

        <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-[#E6EBF2] pt-6 sm:grid-cols-4">
          <InfoItem label="ID" value={usuario.id} mono />
          <InfoItem label="Auth0 ID" value={usuario.auth0UserId} mono />
          <InfoItem label="Nivel" value={usuario.nivel?.nombre || "—"} />
          <InfoItem label="Grado" value={usuario.grado?.nombre || "—"} />
          <InfoItem label="Problemática" value={usuario.problematica?.nombre || "—"} />
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
        </dl>

        <div className="mt-4 flex justify-end border-t border-[#E6EBF2] pt-4">
          <Button
            variant="outline"
            onClick={() => (editOpen ? handleCancelEdit() : handleOpenEdit())}
            className={adminBtnGhost}
          >
            {editOpen ? <ChevronUp className="mr-1 h-4 w-4" /> : <Pencil className="mr-1 h-4 w-4" />}
            {editOpen ? "Cerrar edición" : "Editar perfil"}
          </Button>
        </div>
      </section>

      {/* Edit Profile Form */}
      {editOpen && (
        <section className={`${dpSectionGap} ${adminCard} space-y-5 p-5 sm:p-6`}>
          <h2 className="flex items-center gap-2 text-xl font-extrabold text-[#1F2937]">
            <Pencil className="h-5 w-5 text-[#3B6CB5]" aria-hidden />
            Editar perfil
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Nombre */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-nombre" className="text-sm font-bold text-[#1F2937]">Nombre completo</Label>
              <Input
                id="edit-nombre"
                value={editForm.nombre ?? ""}
                onChange={(e) => updateField("nombre", e.target.value)}
                placeholder="Nombre del docente"
                className={adminInput}
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-email" className="text-sm font-bold text-[#1F2937]">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email ?? ""}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="correo@ejemplo.com"
                className={adminInput}
              />
            </div>

            {/* Institución */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-institucion" className="text-sm font-bold text-[#1F2937]">Institución educativa</Label>
              <Input
                id="edit-institucion"
                value={editForm.nombreInstitucion ?? ""}
                onChange={(e) => updateField("nombreInstitucion", e.target.value)}
                placeholder="Nombre de la I.E."
                className={adminInput}
              />
            </div>

            {/* Género */}
            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-[#1F2937]">Género</Label>
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
              <Label className="text-sm font-bold text-[#1F2937]">Nivel</Label>
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
              <Label className="text-sm font-bold text-[#1F2937]">Grado</Label>
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
              <Label className="text-sm font-bold text-[#1F2937]">Problemática</Label>
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
              <Label htmlFor="edit-seccion" className="text-sm font-bold text-[#1F2937]">Sección</Label>
              <Input
                id="edit-seccion"
                value={editForm.seccion ?? ""}
                onChange={(e) => updateField("seccion", e.target.value)}
                placeholder='Ej: "A"'
                className={adminInput}
              />
            </div>

            {/* Directivo */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-directivo" className="text-sm font-bold text-[#1F2937]">Nombre del directivo</Label>
              <Input
                id="edit-directivo"
                value={editForm.nombreDirectivo ?? ""}
                onChange={(e) => updateField("nombreDirectivo", e.target.value)}
                placeholder="Director/a"
                className={adminInput}
              />
            </div>

            {/* Subdirectora */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-subdirectora" className="text-sm font-bold text-[#1F2937]">Nombre subdirectora</Label>
              <Input
                id="edit-subdirectora"
                value={editForm.nombreSubdirectora ?? ""}
                onChange={(e) => updateField("nombreSubdirectora", e.target.value)}
                placeholder="Subdirector/a"
                className={adminInput}
              />
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <p className="mb-2 flex items-center gap-1 text-sm font-bold text-[#6B7280]">
              <MapPin className="h-4 w-4" aria-hidden /> Ubicación
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Departamento */}
              <div className="space-y-1.5">
                <Label className="text-sm font-bold text-[#1F2937]">Departamento</Label>
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
                <Label className="text-sm font-bold text-[#1F2937]">Provincia</Label>
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
                <Label className="text-sm font-bold text-[#1F2937]">Distrito</Label>
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
              <Label htmlFor="edit-titulo-unidad" className="text-sm font-bold text-[#1F2937]">Título de unidad (contexto)</Label>
              <Input
                id="edit-titulo-unidad"
                value={editForm.tituloUnidadContexto ?? ""}
                onChange={(e) => updateField("tituloUnidadContexto", e.target.value)}
                placeholder="Título de la unidad didáctica"
                className={adminInput}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-situacion" className="text-sm font-bold text-[#1F2937]">Situación significativa (contexto)</Label>
              <Input
                id="edit-situacion"
                value={editForm.situacionSignificativaContexto ?? ""}
                onChange={(e) => updateField("situacionSignificativaContexto", e.target.value)}
                placeholder="Situación significativa de la unidad"
                className={adminInput}
              />
            </div>
          </div>

          {/* Save / Cancel */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={handleCancelEdit}
              disabled={editSaving}
              className={adminBtnGhost}
            >
              <X className="mr-1 h-4 w-4" /> Cancelar
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={editSaving}
              className={adminCta}
            >
              {editSaving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
              Guardar cambios
            </Button>
          </div>
        </section>
      )}

      <section className={`${dpSectionGap} ${adminCard} p-5 sm:p-6`}>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-extrabold text-[#1F2937]">
          <RotateCcw className="h-5 w-5 text-[#6B7280]" aria-hidden />
          Reset
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={handleResetSesiones}
            disabled={!!actionLoading}
            className={adminBtnWarningOutline}
          >
            {actionLoading === "reset-sesiones" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            Reset sesiones ({usuario.stats.totalSesiones})
          </Button>
          <Button
            variant="outline"
            onClick={handleResetUnidades}
            disabled={!!actionLoading}
            className={adminBtnWarningOutline}
          >
            {actionLoading === "reset-unidades" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FolderOpen className="mr-2 h-4 w-4" />
            )}
            Reset unidades ({usuario.stats.totalUnidades})
          </Button>
          <Button
            variant="outline"
            onClick={handleResetPerfil}
            disabled={!!actionLoading}
            className={adminBtnGhost}
          >
            {actionLoading === "reset-perfil" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="mr-2 h-4 w-4" />
            )}
            Reset perfil
          </Button>
          <Button
            variant="outline"
            onClick={handleResetTodo}
            disabled={!!actionLoading}
            className={adminBtnDangerOutline}
          >
            {actionLoading === "reset-todo" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="mr-2 h-4 w-4" />
            )}
            Reset todo
          </Button>
        </div>
      </section>

      <div className={`${dpSectionGap} grid grid-cols-2 gap-3 sm:grid-cols-5`}>
        <StatCard label="Sesiones" value={usuario.stats.totalSesiones} icon={FileText} />
        <StatCard label="Unidades" value={usuario.stats.totalUnidades} icon={FolderOpen} />
        <StatCard label="Ses. esta semana" value={usuario.stats.sesionesEstaSemana} icon={Calendar} />
        <StatCard label="Ses. con PDF" value={usuario.stats.sesionesConPdf} icon={FileText} />
        <StatCard label="Und. con PDF" value={usuario.stats.unidadesConPdf} icon={FolderOpen} />
      </div>

      {/* Consumo de IA */}
      <Section title="Consumo de IA" icon={Zap}>
        <ConsumoIADocente usuarioId={usuario.id} />
      </Section>

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
                  <tr className="border-b border-[#E6EBF2] text-left">
                    <th className="px-3 py-2 font-medium">Estado</th>
                    <th className="px-3 py-2 font-medium">Monto</th>
                    <th className="px-3 py-2 font-medium">Método</th>
                    <th className="px-3 py-2 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6EBF2]">
                  {usuario.suscripcion.pagos.map((p) => (
                    <tr key={p.id} className="hover:bg-[#F5F7FA]">
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
          <p className="py-6 text-center text-base font-semibold text-[#6B7280]">
            Este docente aún no tiene sesiones.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E6EBF2] text-left">
                  <th className="px-3 py-2 font-medium">Título</th>
                  <th className="px-3 py-2 font-medium">Fecha</th>
                  <th className="px-3 py-2 font-medium">PDF</th>
                  <th className="px-3 py-2 font-medium">Word</th>
                  <th className="px-3 py-2 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6EBF2]">
                {usuario.sesiones.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F5F7FA]">
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
                          className={`${dpFocusRing} text-[#3B6CB5] hover:text-[#1F2937]`}
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
                          className={`${adminRowGreen} p-1`}
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
                          className={adminRowAtmosphere}
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
                          className={adminRowWarning}
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
                          className={adminRowGreen}
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
                          className={adminRowPink}
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
          <p className="py-6 text-center text-base font-semibold text-[#6B7280]">
            Este docente aún no tiene unidades.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E6EBF2] text-left">
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">Título</th>
                  <th className="px-3 py-2 font-medium">Tipo</th>
                  <th className="px-3 py-2 font-medium">Fecha</th>
                  <th className="px-3 py-2 font-medium">PDF</th>
                  <th className="px-3 py-2 font-medium">Word</th>
                  <th className="px-3 py-2 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6EBF2]">
                {usuario.unidades.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F5F7FA]">
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
                          className={`${dpFocusRing} text-[#3B6CB5] hover:text-[#1F2937]`}
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
                          className={`${adminRowGreen} p-1`}
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
                          className={adminRowAtmosphere}
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
                      <div className="flex flex-wrap gap-1 items-center max-w-[min(100%,520px)]">
                      <Button
                        size="sm"
                        variant="outline"
                        className={adminRowWarning}
                        disabled={corrigiendoUnidad === u.id}
                        onClick={async () => {
                          if (!confirm(`¿Corregir estándares de la unidad "${u.titulo || u.id}"? Se regenerará el PDF.`)) return;
                          setCorrigiendoUnidad(u.id);
                          try {
                            const res = await adminCorregirEstandares(u.id);
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
                        className={adminRowAtmosphere}
                        disabled={corrigiendoHorario === u.id}
                        onClick={async () => {
                          if (!confirm(`¿Arreglar horario de la unidad "${u.titulo || u.id}"? Se corregirá la secuencia y se regenerará el PDF.`)) return;
                          setCorrigiendoHorario(u.id);
                          try {
                            // 1. Cargar unidad completa para obtener secuencia
                            const { data: rawUnidad } = await adminGetUnidadById(u.id);
                            const unidad = (rawUnidad as any)?.data ?? rawUnidad;
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
                            const res = await adminArreglarHorario({
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
                            await adminEditarContenidoUnidad(u.id, {
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
                      <Button
                        size="sm"
                        variant="outline"
                        className={adminRowPink}
                        disabled={arreglandoActividades === u.id}
                        onClick={async () => {
                          if (!confirm(`¿Arreglar actividades de la unidad "${u.titulo || u.id}"?\n\nEsto auditará y reparará competencias, actividades, criterios, estándares y la secuencia.\n\nPuede tardar hasta 4 minutos.`)) return;
                          setArreglandoActividades(u.id);
                          setResultadoArreglo(null);
                          try {
                            const res = await adminArreglarActividades(u.id, "mañana");
                            setResultadoArreglo({ unidadId: u.id, res });
                            if (res.correcciones.length > 0 && res.unidad) {
                              // Hubo correcciones → regenerar siempre PDF y Word (el contenido cambió)
                              toast.success(`${res.correcciones.length} corrección(es) aplicada(s) — generando PDF y Word actualizados…`);
                              navigate(`/admin/corregir-estandares-pdf/${u.id}`, {
                                state: {
                                  corregirResponse: {
                                    success: res.success,
                                    totalCorregidos: res.correcciones.length,
                                    guardadoEnBD: res.guardadoEnBD ?? false,
                                    correcciones: [],
                                    unidad: res.unidad,
                                    upload: null, // null → la página solicita presigned URL
                                    miembrosUpload: [],
                                  },
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
                                  nombreDirectivo: usuario?.nombreDirectivo ?? "",
                                  nombreSubdirectora: usuario?.nombreSubdirectora ?? "",
                                  usuarioId: usuario!.id,
                                  wordInvalidado: true, // siempre regenerar Word si hubo correcciones
                                },
                              });
                            } else {
                              toast.info("La unidad ya estaba correcta; no se aplicaron cambios.");
                            }
                          } catch (err: any) {
                            console.error("❌ [Admin] Error al arreglar actividades:", err);
                            toast.error(
                              err?.response?.data?.message || "Error al arreglar actividades",
                            );
                          } finally {
                            setArreglandoActividades(null);
                          }
                        }}
                      >
                        {arreglandoActividades === u.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <ListChecks className="w-3 h-3" />
                        )}
                        {arreglandoActividades === u.id ? "Arreglando…" : "Arreglar Actividades"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className={adminRowWarning}
                        disabled={reiniciandoUnidadId === u.id}
                        title="Reiniciar contenido IA de la unidad"
                        onClick={async () => {
                          if (
                            !confirm(
                              `¿Reiniciar la unidad "${u.titulo || u.id}"?\n\nSe limpiará el contenido IA, PDF y Word. El docente deberá rehacer el wizard desde el paso 1.\n\nLa unidad, pagos y sesiones existentes se conservan.`,
                            )
                          )
                            return;
                          setReiniciandoUnidadId(u.id);
                          try {
                            const res = await adminResetUnidad(u.id);
                            toast.success(res.message || "Unidad reiniciada");
                            setUsuario((prev) => {
                              if (!prev) return prev;
                              return {
                                ...prev,
                                unidades: prev.unidades.map((uni) =>
                                  uni.id === u.id
                                    ? { ...uni, pdfUrl: null, wordUrl: null, wordGeneradoAt: null }
                                    : uni,
                                ),
                              };
                            });
                          } catch (err: any) {
                            toast.error(
                              err?.response?.data?.message ||
                                "Error al reiniciar la unidad",
                            );
                          } finally {
                            setReiniciandoUnidadId(null);
                          }
                        }}
                      >
                        {reiniciandoUnidadId === u.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RotateCcw className="w-3 h-3" />
                        )}
                        {reiniciandoUnidadId === u.id ? "Reiniciando…" : "Reiniciar"}
                      </Button>
                      {isUnidadActivaParaFinalizar(u.fechaFin) && (
                        <Button
                          size="sm"
                          variant="outline"
                          className={`${adminRowBtn} bg-[#FFF7ED] text-[#C2410C] hover:bg-[#FFEDD5]`}
                          disabled={finalizandoUnidadId === u.id}
                          title="Finalizar unidad (admin)"
                          onClick={async () => {
                            if (
                              !confirm(
                                `¿Finalizar la unidad "${u.titulo || u.id}"?\n\nDejará de contar como activa. El docente podrá crear otra unidad si su plan lo permite. La unidad y sus sesiones/PDFs siguen existiendo.`,
                              )
                            )
                              return;
                            setFinalizandoUnidadId(u.id);
                            try {
                              const res = await adminFinalizarUnidad(u.id);
                              toast.success(res.message || "Unidad finalizada");
                              const nuevaFechaFin =
                                typeof res.data?.fechaFin === "string"
                                  ? res.data.fechaFin
                                  : new Date().toISOString();
                              setUsuario((prev) => {
                                if (!prev) return prev;
                                return {
                                  ...prev,
                                  unidades: prev.unidades.map((uni) =>
                                    uni.id === u.id ? { ...uni, fechaFin: nuevaFechaFin } : uni,
                                  ),
                                };
                              });
                            } catch (err: any) {
                              toast.error(
                                err?.response?.data?.message ||
                                  "Error al finalizar la unidad",
                              );
                            } finally {
                              setFinalizandoUnidadId(null);
                            }
                          }}
                        >
                          {finalizandoUnidadId === u.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <FlagOff className="w-3 h-3" />
                          )}
                          {finalizandoUnidadId === u.id ? "Finalizando…" : "Finalizar"}
                        </Button>
                      )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ─── Resultado de Arreglar Actividades ─── */}
            {resultadoArreglo && (
              <div className="mt-4 rounded-[20px] border border-[#E6EBF2] bg-[#EAF2FC] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="flex items-center gap-1.5 text-base font-extrabold text-[#3B6CB5]">
                    <ListChecks className="h-4 w-4" aria-hidden />
                    Resultado: arreglar actividades
                  </h4>
                  <button
                    type="button"
                    onClick={() => setResultadoArreglo(null)}
                    className={`${dpFocusRing} text-sm font-bold text-[#3B6CB5] hover:underline`}
                  >
                    Cerrar
                  </button>
                </div>

                {/* Advertencia PDF/Word invalidado */}
                {(resultadoArreglo.res.pdfInvalidado || resultadoArreglo.res.wordInvalidado) && (
                  <div className="mb-3 flex items-start gap-2 rounded-[16px] border border-[#E6EBF2] bg-[#FFF7ED] p-3 text-[#C2410C]">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    <div className="text-xs leading-relaxed">
                      {resultadoArreglo.res.advertencia
                        ? resultadoArreglo.res.advertencia
                        : [
                            resultadoArreglo.res.pdfInvalidado && "El PDF anterior fue eliminado.",
                            resultadoArreglo.res.wordInvalidado && "El Word anterior fue eliminado.",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                      {" "}El docente debe generar y subir un nuevo PDF desde su cuenta.
                    </div>
                  </div>
                )}

                {/* Resumen */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  {(
                    [
                      ["Competencias verificadas", resultadoArreglo.res.resumen.competenciasVerificadas],
                      ["Competencias corregidas", resultadoArreglo.res.resumen.competenciasCorregidas],
                      ["Capacidades corregidas", resultadoArreglo.res.resumen.capacidadesCorregidas],
                      ["Áreas con actividades nuevas", resultadoArreglo.res.resumen.areasConActividadesRegeneradas],
                      ["Estándares corregidos", resultadoArreglo.res.resumen.estandaresCorregidos],
                      ["Secuencia regenerada", resultadoArreglo.res.resumen.secuenciaRegenerada ? "Sí" : "No"],
                      ["Feriados reprogramados", resultadoArreglo.res.resumen.feriadosDetectados],
                    ] as [string, number | string][]
                  ).map(([label, val]) => (
                    <div key={label} className="rounded-[16px] border border-[#E6EBF2] bg-white px-3 py-2 text-center">
                      <p className="text-lg font-extrabold tabular-nums text-[#3B6CB5]">{val}</p>
                      <p className="mt-0.5 text-sm font-semibold text-[#6B7280]">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Correcciones detalle */}
                {resultadoArreglo.res.correcciones.length === 0 ? (
                  <p className="text-sm font-semibold italic text-[#6B7280]">No se aplicaron cambios. La unidad ya estaba correcta.</p>
                ) : (
                  <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                    {resultadoArreglo.res.correcciones.map((c, i) => (
                      <div key={i} className="flex items-start gap-2 rounded-[16px] border border-[#E6EBF2] bg-white px-3 py-1.5 text-sm">
                        <span className="mt-0.5 shrink-0 rounded-full bg-[#EAF2FC] px-1.5 py-0.5 text-sm font-bold capitalize text-[#3B6CB5]">
                          {c.fase}
                        </span>
                        {c.area && (
                          <span className="mt-0.5 shrink-0 rounded-full bg-[#EEF3F9] px-1.5 py-0.5 text-sm font-bold text-[#6B7280]">
                            {c.area}
                          </span>
                        )}
                        <span className="leading-relaxed text-[#6B7280]">{c.descripcion}</span>
                      </div>
                    ))}
                  </div>
                )}

                {resultadoArreglo.res.duracion != null && (
                  <p className="mt-2 text-right text-sm font-semibold text-[#9CA3AF]">
                    Duración: {resultadoArreglo.res.duracion.toFixed(1)} s
                    {resultadoArreglo.res.guardadoEnBD && " · Guardado en BD"}
                  </p>
                )}
              </div>
            )}
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
    <section className={`${adminCard} mb-6 overflow-hidden`}>
      <div className="flex items-center gap-2 border-b border-[#E6EBF2] px-5 py-4">
        <span className="grid h-10 w-10 place-items-center rounded-[16px] bg-[#EAF2FC] text-[#3B6CB5]">
          <Icon className="h-5 w-5" />
        </span>
        <h2 className="text-xl font-extrabold text-[#1F2937]">{title}</h2>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
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
    <div className={`${adminCard} px-4 py-3`}>
      <div className="mb-1 flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#3B6CB5]" />
        <span className="text-sm font-bold text-[#6B7280]">{label}</span>
      </div>
      <p className="text-[28px] font-extrabold tabular-nums leading-none tracking-[-0.02em] text-[#1F2937]">
        {value}
      </p>
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
    <div className="min-w-0 rounded-[16px] bg-[#F5F7FA] px-3 py-3">
      <dt className="text-sm font-bold text-[#6B7280]">{label}</dt>
      <dd
        className={`mt-0.5 truncate text-base font-extrabold text-[#1F2937] ${mono ? "font-mono text-sm" : ""}`}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}

function PlanBadge({ plan, activa }: { plan: string; activa?: boolean }) {
  if (plan === "free") {
    return (
      <span className="rounded-full bg-[#EEF3F9] px-3 py-1 text-sm font-bold text-[#6B7280]">
        Free
      </span>
    );
  }
  const label = plan === "premium_anual" ? "Premium anual" : "Premium mensual";
  if (!activa) {
    return (
      <span className="rounded-full bg-[#FFF7ED] px-3 py-1 text-sm font-bold text-[#C2410C]">
        {label} inactivo
      </span>
    );
  }
  return (
    <span className="rounded-full bg-[#EAF2FC] px-3 py-1 text-sm font-bold text-[#3B6CB5]">
      {label}
    </span>
  );
}

function StatusBadge({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold ${
        ok ? "bg-[#E3F8EC] text-[#15803D]" : "bg-[#FFF7ED] text-[#C2410C]"
      }`}
    >
      {ok ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        <Shield className="h-3.5 w-3.5" />
      )}
      {label}
    </span>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const config: Record<string, string> = {
    PENDIENTE: "bg-[#FFF7ED] text-[#C2410C]",
    CONFIRMADO: "bg-[#E3F8EC] text-[#15803D]",
    RECHAZADO: "bg-[#FEE2E2] text-[#B91C1C]",
  };
  const c = config[estado] || config.PENDIENTE;
  return (
    <span className={`${c} rounded-full px-3 py-1 text-sm font-bold`}>
      {estado}
    </span>
  );
}
