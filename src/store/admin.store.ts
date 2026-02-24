import { create } from "zustand";
import { persist } from "zustand/middleware";

// ============================================
// Admin Auth Store — Zustand con persistencia
// ============================================

interface AdminUser {
  id: string;
  email: string;
  nombre: string;
  roles: string[];
}

interface AdminState {
  // State
  token: string | null;
  admin: AdminUser | null;
  isAuthenticated: boolean;

  // Actions
  setAdmin: (token: string, admin: AdminUser) => void;
  clearAdmin: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      token: null,
      admin: null,
      isAuthenticated: false,

      setAdmin: (token, admin) => {
        localStorage.setItem("admin_token", token);
        set({ token, admin, isAuthenticated: true });
      },

      clearAdmin: () => {
        localStorage.removeItem("admin_token");
        set({ token: null, admin: null, isAuthenticated: false });
      },
    }),
    {
      name: "admin-auth-storage",
      partialize: (state) => ({
        token: state.token,
        admin: state.admin,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
