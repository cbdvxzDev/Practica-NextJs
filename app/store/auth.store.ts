// app/store/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthState {
  user: { id: string; email: string; name: string } | null;
  isAuthenticated: boolean;
  setAuth: (user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setAuth: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage', // Nombre de la clave en localStorage
    }
  )
);