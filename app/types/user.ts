// app/types/user.ts

export type UserRole = 'admin' | 'customer' | 'support';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
}

/**
 * Representa los datos necesarios para registrar a un nuevo usuario.
 */
export type RegisterInput = {
  email: string;
  password: string;
  fullName: string;
};

/**
 * Representa los datos editables por el usuario en su perfil.
 */
export type UpdateProfileInput = Partial<Pick<User, 'fullName' | 'avatarUrl'>>;