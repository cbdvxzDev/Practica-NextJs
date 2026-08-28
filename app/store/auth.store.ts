// app/store/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthState {
  user: { id: string; email: string; name: string; role: "admin" | "customer" } | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthState["user"]) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setAuth: (user) => set({ user, isAuthenticated: Boolean(user) }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage', // Nombre de la clave en localStorage
    }
  )
);