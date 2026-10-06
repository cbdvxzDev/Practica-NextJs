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
   * Pide un enlace para restablecer la contraseña.
   *
   * La respuesta es idéntica exista o no la cuenta, así el formulario no
   * sirve para descubrir correos registrados. La mini API no envía correos,
   * así que en la demo devuelve además `resetUrl` para poder completar el
   * flujo sin un servidor SMTP.
   */
  async forgotPassword(email: string): Promise<{ message: string; resetUrl?: string }> {
    return fetcher<{ message: string; resetUrl?: string }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Cambia la contraseña usando el token del enlace de recuperación.
   */
  async resetPassword(token: string, password: string): Promise<string> {
    const data = await fetcher<{ message: string }>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
    return data.message;
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
   *
   * Antes borra la cookie en el servidor: si solo se limpiara localStorage,
   * `proxy.ts` seguiría viendo una sesión válida y dejaría pasar a /admin.
   */
  logout(): void {
    // `keepalive` para que la petición llegue aunque la página navegue de inmediato.
    void fetch("/api/auth/logout", { method: "POST", keepalive: true }).catch(() => {
      /* Si falla, el logout local sigue siendo válido para el usuario. */
    });
    localStorage.removeItem("auth_token");
    // Navegación dura a propósito, y por eso se salta la regla que sugiere
    // `useRouter().push()`: un logout no es un cambio de página normal. La cookie
    // se está borrando con una petición en vuelo, y una recarga completa es lo
    // único que garantiza que ni `proxy.ts` ni los server components del árbol
    // actual sigan serveando con la sesión anterior. Además este módulo no es un
    // Client Component, así que no tiene `useRouter`.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
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