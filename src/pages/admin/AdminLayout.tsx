import { NavLink, Outlet, useNavigate } from "react-router";
import { useAdminStore } from "@/store/admin.store";
import {
  LayoutDashboard,
  CreditCard,
  FolderOpen,
  LogOut,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const sidebarLinks = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/admin/pagos-suscripcion",
    label: "Pagos Suscripción",
    icon: CreditCard,
  },
  {
    to: "/admin/pagos-unidad",
    label: "Pagos Unidad",
    icon: FolderOpen,
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { admin, clearAdmin } = useAdminStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    clearAdmin();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar — Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-gray-900 border-r border-gray-800">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
          <Shield className="w-7 h-7 text-blue-400" />
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">
              DocentePro
            </h2>
            <p className="text-gray-500 text-xs">Panel Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`
              }
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* User Info + Logout */}
        <div className="px-3 py-4 border-t border-gray-800">
          <div className="px-3 py-2 mb-2">
            <p className="text-white text-sm font-medium truncate">
              {admin?.nombre || "Admin"}
            </p>
            <p className="text-gray-500 text-xs truncate">
              {admin?.email || ""}
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          <span className="text-white font-bold">Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-gray-400 hover:text-white"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50">
          <div className="absolute top-14 left-0 right-0 bg-gray-900 border-b border-gray-800 p-4 space-y-1">
            {sidebarLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-600/20 text-blue-400"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`
                }
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 w-full"
            >
              <LogOut className="w-5 h-5" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-0 mt-14 md:mt-0 overflow-auto">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
