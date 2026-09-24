// app/services/auth.service.ts
// Cliente para los endpoints de autenticación de la mini API (/api/auth/*).

import { fetcher } from "@/lib/fetcher";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "customer" | "support";
  avatarUrl?: string;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const AuthService = {
  /**
   * Inicia sesión con credenciales reales contra la mini API.
   */
  async login(email: string, password: string): Promise<AuthUser> {
    const data = await fetcher<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    this.setToken(data.token);
    return data.user;
  },

  /**
   * Registra una cuenta nueva.
   */
  async register(input: { name: string; email: string; password: string }): Promise<AuthUser> {
    const data = await fetcher<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });

    this.setToken(data.token);
    return data.user;
  },

  /**
   * Recupera el usuario de la sesión actual usando el token guardado.
   */
  async getMe(): Promise<AuthUser | null> {
    if (!this.getToken()) return null;
    const data = await fetcher<{ user: AuthUser }>("/api/auth/me");
    return data.user;
  },

  /**
   * Cierra sesión y limpia el almacenamiento local.
   */
  logout(): void {
    localStorage.removeItem("auth_token");
    window.location.href = "/login";
  },

  setToken(token: string): void {
    localStorage.setItem("auth_token", token);
  },

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};