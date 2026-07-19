// app/services/user.service.ts

export interface UserProfile {
    id: string;
    email: string;
    fullName: string;
    role: 'admin' | 'customer';
    avatarUrl?: string;
  }
  
  export const UserService = {
    /**
     * Obtiene la información del usuario autenticado
     */
    async getProfile(): Promise<UserProfile> {
      const response = await fetch("/api/user/profile", {
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}` 
        }
      });
  
      if (!response.ok) throw new Error("No se pudo obtener el perfil del usuario.");
      return response.json();
    },
  
    /**
     * Actualiza los datos básicos del perfil
     */
    async updateProfile(data: Partial<Pick<UserProfile, 'fullName' | 'avatarUrl'>>): Promise<UserProfile> {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}` 
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) throw new Error("Error al actualizar el perfil.");
      return response.json();
    }
  };