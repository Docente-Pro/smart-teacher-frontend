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
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import departamentosData from "@/utils/peru_ubigeo/1_ubigeo_departamentos.json";

const DEPARTAMENTOS = departamentosData.ubigeo_departamentos.map((d) => d.departamento);

const PLANES = [
  { value: "", label: "Todos los planes" },
  { value: "free", label: "Free" },
  { value: "premium_mensual", label: "Premium Mensual" },
  { value: "premium_anual", label: "Premium Anual" },
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

  // Filtros
  const [search, setSearch] = useState("");
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
      if (search.trim()) params.search = search.trim();
      if (planFilter) params.plan = planFilter as IListarUsuariosParams["plan"];
      if (deptoFilter) params.departamento = deptoFilter;

      const res = await getUsuarios(params);
      setUsuarios(res.data.usuarios);
      setPagination(res.data.pagination);
    } catch {
      toast.error("Error al cargar usuarios");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, planFilter, deptoFilter]);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    cargarUsuarios();
  }

  function handleClearFilters() {
    setSearch("");
    setPlanFilter("");
    setDeptoFilter("");
    setPage(1);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Usuarios
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {pagination.total} usuario{pagination.total !== 1 ? "s" : ""}{" "}
            registrado{pagination.total !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={cargarUsuarios}
          disabled={isLoading}
          className="border-gray-300 text-gray-600 hover:text-gray-900"
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Actualizar
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500 pl-10"
            />
          </div>
          <Button
            type="submit"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Buscar
          </Button>
        </form>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={planFilter}
            onChange={(e) => {
              setPlanFilter(e.target.value);
              setPage(1);
            }}
            className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-md px-3 py-1.5"
          >
            {PLANES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <select
            value={deptoFilter}
            onChange={(e) => {
              setDeptoFilter(e.target.value);
              setPage(1);
            }}
            className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-md px-3 py-1.5"
          >
            <option value="">Todos los departamentos</option>
            {DEPARTAMENTOS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {(search || planFilter || deptoFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-gray-500 hover:text-gray-900 text-xs"
            >
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
        </div>
      ) : usuarios.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No se encontraron usuarios</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-left">
                  <th className="px-4 py-3 font-medium">Usuario</th>
                  <th className="px-4 py-3 font-medium">Institución</th>
                  <th className="px-4 py-3 font-medium">Ubicación</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Perfil</th>
                  <th className="px-4 py-3 font-medium">Contenido</th>
                  <th className="px-4 py-3 font-medium">Registro</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {usuarios.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Nombre + Email */}
                    <td className="px-4 py-3">
                      <p className="text-gray-900 font-medium truncate max-w-[180px]">
                        {u.nombre || "—"}
                      </p>
                      <p className="text-gray-400 text-xs truncate max-w-[180px]">
                        {u.email}
                      </p>
                    </td>

                    {/* Institución */}
                    <td className="px-4 py-3 text-gray-600 text-xs truncate max-w-[140px]">
                      {u.nombreInstitucion || "—"}
                    </td>

                    {/* Ubicación */}
                    <td className="px-4 py-3">
                      <p className="text-gray-600 text-xs truncate max-w-[140px]">
                        {u.departamento || "—"}
                      </p>
                      {u.distrito && (
                        <p className="text-gray-400 text-xs truncate max-w-[140px]">
                          {u.distrito}
                        </p>
                      )}
                    </td>

                    {/* Plan */}
                    <td className="px-4 py-3">
                      <PlanBadge plan={u.suscripcion?.plan} activa={u.suscripcion?.activa} />
                    </td>

                    {/* Perfil completo */}
                    <td className="px-4 py-3">
                      {u.perfilCompleto ? (
                        <UserCheck className="w-4 h-4 text-green-600" />
                      ) : (
                        <UserX className="w-4 h-4 text-yellow-600" />
                      )}
                    </td>

                    {/* Sesiones / Unidades */}
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      <span>{u._count.sesiones} ses.</span>
                      <span className="text-gray-300 mx-1">·</span>
                      <span>{u._count.unidades} und.</span>
                    </td>

                    {/* Fecha registro */}
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString("es-PE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3 text-right">
                      <Link to={`/admin/usuarios/${u.id}`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 h-8 text-xs"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Ver
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <p className="text-gray-400 text-xs">
                Página {pagination.page} de {pagination.totalPages} — {pagination.total} resultados
              </p>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="text-gray-500 hover:text-gray-900 h-8"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="text-gray-500 hover:text-gray-900 h-8"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───

function PlanBadge({ plan, activa }: { plan?: string; activa?: boolean }) {
  if (!plan || plan === "free") {
    return (
      <span className="bg-gray-200 text-gray-500 text-xs font-medium px-2 py-1 rounded-full">
        Free
      </span>
    );
  }

  const label = plan === "premium_anual" ? "Anual" : "Mensual";
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
