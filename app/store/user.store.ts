"use client";

import { create } from "zustand";
import { UserService, type UserAdmin } from "@/services/user.service";

interface UserState {
  users: UserAdmin[];
  loading: boolean;
  /** true cuando la primera carga (exitosa o fallida) ha terminado. */
  loaded: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  updateUser: (
    id: string,
    data: Partial<Pick<UserAdmin, "name" | "role" | "isActive">>
  ) => Promise<UserAdmin>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  loading: false,
  loaded: false,
  error: null,

  fetchUsers: async () => {
    // Evita la petición duplicada si otra pantalla ya puso la lista en marcha.
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const users = await UserService.getAll();
      set({ users, loading: false, loaded: true });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Error al cargar los usuarios.",
        loading: false,
        loaded: true,
      });
    }
  },

  updateUser: async (id, data) => {
    const updated = await UserService.updateUser(id, data);
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, ...updated } : u)),
    }));
    return updated;
  },
}));

export default useUserStore;
