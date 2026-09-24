"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthService, type AuthUser } from "@/services/auth.service";
import { UserService } from "@/services/user.service";

export type { AuthUser };

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser) => void;
  hydrate: () => Promise<boolean>;
  updateUser: (updates: Partial<Pick<AuthUser, "name" | "email" | "avatarUrl">>) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setAuth: (user) => set({ user, isAuthenticated: true }),

      /**
       * Valida la sesión contra la mini API usando el token guardado.
       * Devuelve true si sigue siendo válida.
       */
      hydrate: async () => {
        if (!AuthService.getToken()) return false;
        try {
          const user = await AuthService.getMe();
          if (!user) {
            set({ user: null, isAuthenticated: false });
            return false;
          }
          set({ user, isAuthenticated: true });
          return true;
        } catch {
          set({ user: null, isAuthenticated: false });
          return false;
        }
      },

      updateUser: async (updates) => {
        const updated = await UserService.updateProfile(updates);
        set({ user: updated, isAuthenticated: true });
      },

      logout: () => {
        AuthService.logout();
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;