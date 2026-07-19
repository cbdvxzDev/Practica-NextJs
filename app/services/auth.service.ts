// app/services/auth.service.ts

export interface AuthResponse {
    user: { id: string; email: string; name: string };
    token: string;
  }
  
  export const AuthService = {
    /**
     * Autentica al usuario mediante credenciales
     */
    async login(email: string, password: string): Promise<AuthResponse> {
      // Simulación de llamada a API
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      if (!response.ok) {
        throw new Error("Credenciales inválidas o error de conexión.");
      }
  
      const data = await response.json();
      this.setToken(data.token);
      return data;
    },
  
    /**
     * Cierra sesión y limpia el almacenamiento
     */
    logout(): void {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    },
  
    /**
     * Gestiona la persistencia del token
     */
    setToken(token: string): void {
      localStorage.setItem("auth_token", token);
    },
  
    getToken(): string | null {
      return localStorage.getItem("auth_token");
    },
  
    isAuthenticated(): boolean {
      const token = this.getToken();
      return !!token; // Retorna true si el token existe
    }
  };