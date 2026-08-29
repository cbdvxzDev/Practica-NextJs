// app/services/auth.service.ts

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "customer";
}

export interface AdminAuthUser extends AuthUser {
  createdAt: string;
  suspended: boolean;
}

export interface AuthResponse {
    user: AuthUser;
    token: string;
  }

interface StoredUser extends AuthUser {
  password: string;
  createdAt?: string;
  suspended?: boolean;
}

const USERS_KEY = "nova-users";
const defaultUsers: StoredUser[] = [
  { id: "admin-1", name: "Administrador NOVA", email: "admin@nova.com", password: "Admin123!", role: "admin", createdAt: new Date().toISOString(), suspended: false },
  { id: "customer-1", name: "Cliente NOVA", email: "cliente@nova.com", password: "Cliente123!", role: "customer", createdAt: new Date().toISOString(), suspended: false },
];

const toAuthUser = (user: StoredUser): AuthUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
});

const toAdminAuthUser = (user: StoredUser): AdminAuthUser => ({
  ...toAuthUser(user),
  createdAt: user.createdAt ?? new Date().toISOString(),
  suspended: user.suspended ?? false,
});
  
  export const AuthService = {
    /**
     * Autentica al usuario mediante credenciales
     */
    async login(email: string, password: string): Promise<AuthResponse> {
      const users = this.getUsers();
      const user = users.find((item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password);
      if (!user) throw new Error("Correo o contraseña incorrectos.");
      if (user.suspended) throw new Error("Esta cuenta ha sido suspendida. Contacta a soporte.");
      const data = { user: toAuthUser(user), token: `nova-session-${user.id}-${Date.now()}` };
      this.setToken(data.token);
      return data;
    },

    async register(name: string, email: string, password: string): Promise<AuthResponse> {
      const users = this.getUsers();
      if (users.some((item) => item.email.toLowerCase() === email.trim().toLowerCase())) {
        throw new Error("Ya existe una cuenta con este correo.");
      }
      const user: StoredUser = { id: `customer-${Date.now()}`, name: name.trim(), email: email.trim().toLowerCase(), password, role: "customer", createdAt: new Date().toISOString(), suspended: false };
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
    },

    /**
     * Actualiza los datos personales (nombre/correo) de un usuario existente.
     */
    async updateUser(id: string, updates: { name?: string; email?: string }): Promise<AuthUser> {
      const users = this.getUsers();
      const trimmedEmail = updates.email?.trim().toLowerCase();
      if (trimmedEmail && users.some((item) => item.id !== id && item.email.toLowerCase() === trimmedEmail)) {
        throw new Error("Ya existe otra cuenta con este correo.");
      }
      let updatedUser: StoredUser | undefined;
      const nextUsers = users.map((item) => {
        if (item.id !== id) return item;
        updatedUser = { ...item, ...(updates.name ? { name: updates.name.trim() } : {}), ...(trimmedEmail ? { email: trimmedEmail } : {}) };
        return updatedUser;
      });
      if (!updatedUser) throw new Error("No se encontró la cuenta a actualizar.");
      this.saveUsers(nextUsers);
      return toAuthUser(updatedUser);
    },

    /**
     * Devuelve todos los usuarios registrados con metadatos para el panel admin.
     */
    getAdminUsers(): AdminAuthUser[] {
      return this.getUsers().map(toAdminAuthUser);
    },

    /**
     * Alterna el estado de suspensión de una cuenta (bloquea/permite el login).
     */
    toggleSuspend(id: string): AdminAuthUser {
      const users = this.getUsers();
      let updatedUser: StoredUser | undefined;
      const nextUsers = users.map((item) => {
        if (item.id !== id) return item;
        updatedUser = { ...item, suspended: !item.suspended };
        return updatedUser;
      });
      if (!updatedUser) throw new Error("No se encontró la cuenta.");
      this.saveUsers(nextUsers);
      return toAdminAuthUser(updatedUser);
    },

    /**
     * Cambia el rol de una cuenta entre administrador y cliente.
     */
    setRole(id: string, role: "admin" | "customer"): AdminAuthUser {
      const users = this.getUsers();
      let updatedUser: StoredUser | undefined;
      const nextUsers = users.map((item) => {
        if (item.id !== id) return item;
        updatedUser = { ...item, role };
        return updatedUser;
      });
      if (!updatedUser) throw new Error("No se encontró la cuenta.");
      this.saveUsers(nextUsers);
      return toAdminAuthUser(updatedUser);
    },
  };