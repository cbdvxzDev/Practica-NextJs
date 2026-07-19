// app/lib/validations.ts
import { z } from "zod";

/**
 * Esquemas de validación centralizados para formularios de GiborSec.
 */

// Validación para el Login
export const loginSchema = z.object({
  email: z.string().email("Formato de correo electrónico inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

// Validación para la creación de un nuevo Producto
export const productSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  category: z.string().min(1, "Debes seleccionar una categoría"),
  price: z.number().positive("El precio debe ser un número positivo"),
  stock: z.number().int().nonnegative("El stock no puede ser negativo"),
});

// Validación para el perfil de usuario
export const profileSchema = z.object({
  fullName: z.string().min(2, "El nombre es demasiado corto"),
  avatarUrl: z.string().url("Debe ser una URL válida").optional(),
});

// Tipo derivado automáticamente para usar en componentes
export type LoginInput = z.infer<typeof loginSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;