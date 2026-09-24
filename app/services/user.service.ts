// app/services/user.service.ts
// Cliente para los endpoints de usuarios y perfil de la mini API.

import { fetcher } from "@/lib/fetcher";
import type { AuthUser } from "./auth.service";
import type { DbOrder } from "@/types/db";

export interface UserAdmin extends AuthUser {
  isActive: boolean;
  createdAt: string;
}

interface ListResponse {
  data: UserAdmin[];
  meta?: { total: number };
}

export const UserService = {
  /**
   * Obtiene el perfil del usuario autenticado.
   */
  async getProfile(): Promise<AuthUser> {
    const res = await fetcher<{ user: AuthUser }>("/api/user/profile");
    return res.user;
  },

  /**
   * Actualiza los datos básicos del perfil.
   */
  async updateProfile(data: Partial<Pick<AuthUser, "name" | "email" | "avatarUrl">>): Promise<AuthUser> {
    const res = await fetcher<{ user: AuthUser }>("/api/user/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return res.user;
  },

  /**
   * Lista de usuarios (solo admin).
   */
  async getAll(): Promise<UserAdmin[]> {
    const res = await fetcher<ListResponse>("/api/users");
    return res.data;
  },

  /**
   * Detalle de un usuario con su historial de órdenes (solo admin).
   */
  async getById(id: string): Promise<UserAdmin & { orders: DbOrder[] }> {
    const res = await fetcher<{ data: UserAdmin & { orders: DbOrder[] } }>(`/api/users/${id}`);
    return res.data;
  },

  /**
   * Actualiza rol / estado de un usuario (solo admin).
   */
  async updateUser(id: string, data: Partial<Pick<UserAdmin, "name" | "role" | "isActive">>): Promise<UserAdmin> {
    const res = await fetcher<{ data: UserAdmin }>(`/api/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return res.data;
  },
};