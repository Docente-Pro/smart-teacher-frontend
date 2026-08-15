import { NavLink, Outlet, useNavigate } from "react-router";
import { useAdminStore } from "@/store/admin.store";
import {
  LayoutDashboard,
  CreditCard,
  FolderOpen,
  Users,
  LogOut,
  Shield,
  Menu,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { dpFocusRing } from "@/styles/dpTokens";

const sidebarLinks = [
  {
    to: "/admin/dashboard",
    label: "Inicio",
    icon: LayoutDashboard,
  },
  {
    to: "/admin/pagos-suscripcion",
    label: "Pagos de suscripción",
    icon: CreditCard,
  },
  {
    to: "/admin/pagos-unidad",
    label: "Pagos de unidad",
    icon: FolderOpen,
  },
  {
    to: "/admin/usuarios",
    label: "Usuarios",
    icon: Users,
  },
  {
    to: "/admin/consumo-ia",
    label: "Consumo de IA",
    icon: Zap,
  },
];

const nunito = { fontFamily: '"Nunito", system-ui, sans-serif' } as const;

function navClass(isActive: boolean) {
  return [
    "flex min-h-12 items-center gap-3 rounded-[20px] px-3 text-base font-bold transition-colors duration-200",
    dpFocusRing,
    isActive
      ? "bg-[#6B9FE8] text-white shadow-[0_8px_20px_rgba(107,159,232,0.28)]"
      : "text-[#6B7280] hover:bg-[#EAF2FC] hover:text-[#3B6CB5]",
  ].join(" ");
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const { admin, clearAdmin } = useAdminStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    clearAdmin();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div
      className="dp-canvas-dots flex min-h-[100dvh] text-[#1F2937]"
      style={nunito}
    >
      <aside className="hidden border-r border-[#E6EBF2] bg-white/90 md:flex md:w-64 md:flex-col">
        <div className="flex items-center gap-3 border-b border-[#E6EBF2] px-5 py-5">
          <div className="grid h-11 w-11 place-items-center rounded-[16px] bg-[#6B9FE8] text-white shadow-[0_8px_20px_rgba(107,159,232,0.28)]">
            <Shield className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="text-lg font-extrabold leading-tight tracking-[-0.02em] text-[#1F2937]">
              Docente Pro
            </p>
            <p className="text-sm font-semibold text-[#6B7280]">
              Panel de administración
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Admin">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => navClass(isActive)}
            >
              <link.icon className="h-5 w-5 shrink-0" aria-hidden />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[#E6EBF2] px-3 py-4">
          <div className="mb-2 rounded-[16px] bg-[#EAF2FC] px-3 py-2.5">
            <p className="truncate text-base font-extrabold text-[#1F2937]">
              {admin?.nombre || "Admin"}
            </p>
            <p className="truncate text-sm font-semibold text-[#3B6CB5]">
              {admin?.email || ""}
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={`${dpFocusRing} h-12 w-full justify-start rounded-[16px] text-base font-bold text-[#C2410C] hover:bg-[#FFF7ED] hover:text-[#C2410C]`}
          >
            <LogOut className="mr-2 h-4 w-4" aria-hidden />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-[#E6EBF2] bg-white/90 px-4 py-3 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-[14px] bg-[#6B9FE8] text-white">
            <Shield className="h-4 w-4" aria-hidden />
          </div>
          <span className="text-base font-extrabold text-[#1F2937]">Admin</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`${dpFocusRing} dp-press grid h-11 w-11 place-items-center rounded-[14px] text-[#6B7280] hover:bg-[#EAF2FC] hover:text-[#3B6CB5]`}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#1F2937]/20 md:hidden">
          <nav
            className="absolute inset-x-0 top-14 space-y-1 border-b border-[#E6EBF2] bg-white p-4"
            aria-label="Admin móvil"
          >
            {sidebarLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => navClass(isActive)}
              >
                <link.icon className="h-5 w-5 shrink-0" aria-hidden />
                {link.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className={`${dpFocusRing} flex min-h-12 w-full items-center gap-3 rounded-[20px] px-3 text-base font-bold text-[#C2410C] hover:bg-[#FFF7ED]`}
            >
              <LogOut className="h-5 w-5" aria-hidden />
              Cerrar sesión
            </button>
          </nav>
        </div>
      )}

      <main className="mt-14 min-w-0 flex-1 overflow-auto md:mt-0">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
