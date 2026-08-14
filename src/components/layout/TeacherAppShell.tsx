import { useState, useCallback, type ReactNode } from "react";
import { BookOpen, LogOut, Sparkles } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import UpgradePremiumModal from "@/components/Shared/Modal/UpgradePremiumModal";
import { useAuthStore } from "@/store/auth.store";
import { usePermissions } from "@/hooks/usePermissions";
import { clearUserStorage } from "@/utils/clearUserStorage";
import {
  useTeacherNav,
  type TeacherNavId,
} from "@/hooks/useTeacherNav";
import {
  dpFocusRing,
  dpPremiumUpsellIcon,
  dpPremiumUpsellSidebar,
  dpPressable,
} from "@/styles/dpTokens";
import { TeacherShellProvider } from "@/components/layout/teacherShellContext";
import "@fontsource/nunito/600.css";
import "@fontsource/nunito/700.css";
import "@fontsource/nunito/800.css";

const focusRing = dpFocusRing;
const pressable = dpPressable;

interface TeacherAppShellProps {
  activeNav: TeacherNavId;
  children: ReactNode;
}

export default function TeacherAppShell({
  activeNav,
  children,
}: TeacherAppShellProps) {
  const { logout } = useAuth0();
  const { isPremium, planLabel } = usePermissions();
  const { navItems, mobileNavItems } = useTeacherNav(activeNav);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleLogout = useCallback(() => {
    clearUserStorage();
    useAuthStore.getState().clearAuth();
    logout({ logoutParams: { returnTo: `${window.location.origin}/login` } });
  }, [logout]);

  const openUpgradeModal = useCallback(() => {
    setShowUpgradeModal(true);
  }, []);

  return (
    <TeacherShellProvider
      value={{ openUpgradeModal, logout: handleLogout }}
    >
    <div
      className="dp-canvas-dots relative min-h-[100dvh] overflow-x-hidden text-[#1F2937]"
      style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}
    >
      <div className="flex min-h-[100dvh] w-full">
        <aside className="dp-material sticky top-0 hidden h-[100dvh] w-[92px] shrink-0 flex-col items-center gap-3 border-r border-[#E6EBF2] px-3 py-5 lg:flex xl:w-[220px] xl:items-stretch xl:px-4">
          <div className="mb-4 flex items-center gap-3 xl:px-1">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] bg-[#6B9FE8] text-white shadow-[0_10px_24px_rgba(107,159,232,0.28)]">
              <BookOpen className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="hidden min-w-0 xl:block">
              <p className="truncate text-lg font-extrabold text-[#1F2937]">
                Docente Pro
              </p>
              <p className="truncate text-sm font-semibold text-[#6B7280]">
                {planLabel}
              </p>
            </div>
          </div>

          <nav
            aria-label="Navegación principal"
            className="flex flex-1 flex-col gap-2"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.action}
                  className={`${focusRing} ${pressable} flex items-center justify-center gap-3 rounded-[20px] px-3 py-3 text-left xl:justify-start ${
                    item.active
                      ? "bg-[#EAF2FC] text-[#3B6CB5]"
                      : "text-[#6B7280] hover:bg-[#EAF2FC]"
                  }`}
                  aria-current={item.active ? "page" : undefined}
                >
                  <span
                    className={`grid h-11 w-11 place-items-center rounded-full ${
                      item.active
                        ? "bg-[#6B9FE8] text-white shadow-[0_8px_18px_rgba(107,159,232,0.28)]"
                        : "bg-[#EAF2FC] text-[#6B7280]"
                    }`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="hidden text-base font-bold xl:inline">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {!isPremium && (
            <>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className={dpPremiumUpsellIcon}
                aria-label="Pasa a Premium"
                title="Pasa a Premium"
              >
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className={dpPremiumUpsellSidebar}
              >
                <p className="text-base font-extrabold">Pasa a Premium</p>
                <p className="mt-1 text-sm font-semibold text-[#6B7280]">
                  Unidades ilimitadas y más herramientas.
                </p>
              </button>
            </>
          )}

          <Button
            onClick={handleLogout}
            variant="outline"
            className={`${focusRing} ${pressable} mt-2 h-12 rounded-[16px] border-[#E6EBF2] bg-white px-3 text-base font-bold text-[#1F2937] hover:bg-[#EAF2FC]`}
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-5 w-5 xl:mr-2" aria-hidden="true" />
            <span className="hidden xl:inline">Salir</span>
          </Button>
        </aside>

        <div className="min-w-0 flex-1 pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
          {children}
        </div>
      </div>

      <nav
        aria-label="Accesos rápidos"
        className="dp-material fixed inset-x-0 bottom-0 z-40 border-t border-[#E6EBF2] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 lg:hidden"
      >
        <div className="mx-auto flex max-w-lg items-center justify-around gap-1">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.action}
                className={`${focusRing} ${pressable} flex min-w-[64px] flex-col items-center gap-1 rounded-[16px] px-2 py-2 ${
                  item.active ? "text-[#3B6CB5]" : "text-[#6B7280]"
                }`}
              >
                <span
                  className={`grid h-10 w-10 place-items-center rounded-full ${
                    item.active ? "bg-[#EAF2FC]" : "bg-transparent"
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-xs font-bold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <UpgradePremiumModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
    </TeacherShellProvider>
  );
}
