// app/services/auth.service.ts

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "customer";
}

export interface AuthResponse {
    user: AuthUser;
    token: string;
  }

interface StoredUser extends AuthUser {
  password: string;
}

const USERS_KEY = "nova-users";
const defaultUsers: StoredUser[] = [
  { id: "admin-1", name: "Administrador NOVA", email: "admin@nova.com", password: "Admin123!", role: "admin" },
  { id: "customer-1", name: "Cliente NOVA", email: "cliente@nova.com", password: "Cliente123!", role: "customer" },
];

const toAuthUser = (user: StoredUser): AuthUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
});
  
  export const AuthService = {
    /**
     * Autentica al usuario mediante credenciales
     */
    async login(email: string, password: string): Promise<AuthResponse> {
      const users = this.getUsers();
      const user = users.find((item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password);
      if (!user) throw new Error("Correo o contraseña incorrectos.");
      const data = { user: toAuthUser(user), token: `nova-session-${user.id}-${Date.now()}` };
      this.setToken(data.token);
      return data;
    },

    async register(name: string, email: string, password: string): Promise<AuthResponse> {
      const users = this.getUsers();
      if (users.some((item) => item.email.toLowerCase() === email.trim().toLowerCase())) {
        throw new Error("Ya existe una cuenta con este correo.");
      }
      const user: StoredUser = { id: `customer-${Date.now()}`, name: name.trim(), email: email.trim().toLowerCase(), password, role: "customer" };
      this.saveUsers([...users, user]);
      const data = { user: toAuthUser(user), token: `nova-session-${user.id}` };
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
    },

    getUsers(): StoredUser[] {
      const stored = localStorage.getItem(USERS_KEY);
      if (!stored) {
        this.saveUsers(defaultUsers);
        return defaultUsers;
      }
      try {
        const users = JSON.parse(stored) as StoredUser[];
        return Array.isArray(users) ? users : defaultUsers;
      } catch {
        return defaultUsers;
      }
    },

    saveUsers(users: StoredUser[]): void {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  };