import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router";
import { getUsuarios } from "@/services/admin.service";
import type {
  IUsuarioListItem,
  IListarUsuariosPagination,
  IListarUsuariosParams,
} from "@/interfaces/IAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import departamentosData from "@/utils/peru_ubigeo/1_ubigeo_departamentos.json";
import {
  adminCard,
  adminCta,
  adminBtnGhost,
  adminInput,
  adminSelect,
  adminTh,
} from "@/styles/adminUi";
import { dpFocusRing, dpSectionGap } from "@/styles/dpTokens";

const DEPARTAMENTOS = departamentosData.ubigeo_departamentos.map(
  (d) => d.departamento,
);

const PLANES = [
  { value: "", label: "Todos los planes" },
  { value: "free", label: "Free" },
  { value: "premium_mensual", label: "Premium mensual" },
  { value: "premium_anual", label: "Premium anual" },
] as const;

const LIMIT = 15;

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<IUsuarioListItem[]>([]);
  const [pagination, setPagination] = useState<IListarUsuariosPagination>({
    total: 0,
    page: 1,
    limit: LIMIT,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("");
  const [deptoFilter, setDeptoFilter] = useState<string>("");
  const [page, setPage] = useState(1);

  const cargarUsuarios = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: IListarUsuariosParams = {
        page,
        limit: LIMIT,
        orderBy: "createdAt",
        order: "desc",
      };
      if (appliedSearch.trim()) params.search = appliedSearch.trim();
      if (planFilter) params.plan = planFilter as IListarUsuariosParams["plan"];
      if (deptoFilter) params.departamento = deptoFilter;

      const res = await getUsuarios(params);
      setUsuarios(res.data.usuarios);
      setPagination(res.data.pagination);
    } catch {
      toast.error("No se pudieron cargar los usuarios. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }, [page, appliedSearch, planFilter, deptoFilter]);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(search);
  }

  function handleClearFilters() {
    setSearch("");
    setAppliedSearch("");
    setPlanFilter("");
    setDeptoFilter("");
    setPage(1);
  }

  const hasFilters = appliedSearch || planFilter || deptoFilter;

  return (
    <div className="text-[#1F2937]">
      <header
        className={`${dpSectionGap} dp-enter flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between`}
      >
        <div>
          <p className="mb-1 text-sm font-bold text-[#3B6CB5]">
            Panel de administración
          </p>
          <h1 className="text-[28px] font-extrabold leading-tight tracking-[-0.02em]">
            Usuarios
          </h1>
          <p className="mt-2 text-base font-semibold text-[#6B7280]">
            {isLoading
              ? "Cargando docentes…"
              : `${pagination.total} docente${pagination.total !== 1 ? "s" : ""} registrado${pagination.total !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={cargarUsuarios}
          disabled={isLoading}
          className={`${adminBtnGhost} border-0`}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            aria-hidden
          />
          Actualizar
        </Button>
      </header>

      <form
        onSubmit={handleSearch}
        className={`${dpSectionGap} dp-enter dp-enter-delay-1 ${adminCard} p-4 sm:p-5`}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="min-w-0 flex-1">
            <label
              htmlFor="buscar-docente"
              className="mb-1.5 block text-sm font-bold text-[#1F2937]"
            >
              Buscar por nombre o correo
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]"
                aria-hidden
              />
              <Input
                id="buscar-docente"
                placeholder="Nombre o email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${adminInput} pl-10`}
              />
            </div>
          </div>
          <div>
            <label htmlFor="filtro-plan" className="mb-1.5 block text-sm font-bold text-[#1F2937]">
              Plan
            </label>
            <select
              id="filtro-plan"
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value);
                setPage(1);
              }}
              className={adminSelect}
            >
              {PLANES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filtro-depto" className="mb-1.5 block text-sm font-bold text-[#1F2937]">
              Departamento
            </label>
            <select
              id="filtro-depto"
              value={deptoFilter}
              onChange={(e) => {
                setDeptoFilter(e.target.value);
                setPage(1);
              }}
              className={`${adminSelect} max-w-[220px]`}
            >
              <option value="">Todos</option>
              {DEPARTAMENTOS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" className={adminCta}>
            <Search className="mr-2 h-4 w-4" aria-hidden />
            Buscar
          </Button>
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className={`${dpFocusRing} mt-3 text-base font-bold text-[#3B6CB5] hover:underline`}
          >
            Limpiar filtros
          </button>
        )}
      </form>

      {isLoading ? (
        <div className={`${adminCard} space-y-2 p-4`} aria-busy="true" aria-label="Cargando usuarios">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-[20px] bg-[#EEF3F9]" />
          ))}
        </div>
      ) : usuarios.length === 0 ? (
        <div className={`${adminCard} px-6 py-12 text-center`}>
          <Users className="mx-auto mb-3 h-10 w-10 text-[#9CA3AF]" aria-hidden />
          <p className="text-lg font-extrabold text-[#1F2937]">
            No hay docentes con esos filtros
          </p>
          <p className="mt-1 text-base font-semibold text-[#6B7280]">
            Prueba otro nombre, plan o departamento.
          </p>
        </div>
      ) : (
        <div className={`dp-enter dp-enter-delay-2 ${adminCard} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E6EBF2]">
                  <th className={adminTh}>Docente</th>
                  <th className={`${adminTh} hidden md:table-cell`}>Institución</th>
                  <th className={`${adminTh} hidden lg:table-cell`}>Ubicación</th>
                  <th className={adminTh}>Plan</th>
                  <th className={`${adminTh} hidden sm:table-cell`}>Perfil</th>
                  <th className={`${adminTh} hidden lg:table-cell`}>Contenido</th>
                  <th className={`${adminTh} hidden xl:table-cell`}>Registro</th>
                  <th className={`${adminTh} text-right`}> </th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-[#E6EBF2] last:border-0 hover:bg-[#F5F7FA]"
                  >
                    <td className="px-4 py-4">
                      <p className="max-w-[220px] truncate text-base font-extrabold text-[#1F2937]">
                        {u.nombre || "Sin nombre"}
                      </p>
                      <p className="max-w-[220px] truncate text-sm font-semibold text-[#6B7280]">
                        {u.email}
                      </p>
                    </td>
                    <td className="hidden max-w-[160px] truncate px-4 py-4 text-base font-semibold text-[#6B7280] md:table-cell">
                      {u.nombreInstitucion || "—"}
                    </td>
                    <td className="hidden px-4 py-4 lg:table-cell">
                      <p className="max-w-[160px] truncate text-base font-semibold text-[#6B7280]">
                        {u.departamento || "—"}
                      </p>
                      {u.distrito && (
                        <p className="max-w-[160px] truncate text-sm font-semibold text-[#9CA3AF]">
                          {u.distrito}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <PlanBadge
                        plan={u.suscripcion?.plan}
                        activa={u.suscripcion?.activa}
                      />
                    </td>
                    <td className="hidden px-4 py-4 sm:table-cell">
                      {u.perfilCompleto ? (
                        <span className="inline-flex items-center gap-1 text-sm font-bold text-[#15803D]">
                          <UserCheck className="h-4 w-4" aria-hidden />
                          Completo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-sm font-bold text-[#C2410C]">
                          <UserX className="h-4 w-4" aria-hidden />
                          Incompleto
                        </span>
                      )}
                    </td>
                    <td className="hidden px-4 py-4 text-base font-semibold tabular-nums text-[#6B7280] lg:table-cell">
                      {u._count.sesiones} ses. · {u._count.unidades} und.
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-4 text-sm font-semibold text-[#6B7280] xl:table-cell">
                      {new Date(u.createdAt).toLocaleDateString("es-PE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        to={`/admin/usuarios/${u.id}`}
                        className={`${dpFocusRing} dp-press inline-flex h-11 items-center rounded-[16px] bg-[#EAF2FC] px-4 text-base font-bold text-[#3B6CB5] hover:bg-[#DCE9FA]`}
                      >
                        Ver
                        <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[#E6EBF2] px-4 py-3">
              <p className="text-sm font-semibold text-[#6B7280]">
                Página {pagination.page} de {pagination.totalPages}
              </p>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={`${adminBtnGhost} h-11 w-11 p-0`}
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className={`${adminBtnGhost} h-11 w-11 p-0`}
                  aria-label="Página siguiente"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PlanBadge({ plan, activa }: { plan?: string; activa?: boolean }) {
  if (!plan || plan === "free") {
    return (
      <span className="rounded-full bg-[#EEF3F9] px-3 py-1 text-sm font-bold text-[#6B7280]">
        Free
      </span>
    );
  }

  const label = plan === "premium_anual" ? "Anual" : "Mensual";
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
