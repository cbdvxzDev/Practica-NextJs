// app/types/category.ts

/**
 * Representa una categoría dentro del catálogo de productos.
 */
export interface Category {
    id: string;
    slug: string;        // Para URLs amigables (ej: 'seguridad-electronica')
    name: string;        // Nombre visible al usuario
    description?: string; // Descripción opcional para páginas de categoría
    imageUrl?: string;    // Imagen representativa de la categoría
    productCount: number; // Útil para mostrar contadores en menús de navegación
  }
  
  /**
   * Payload para crear o editar una categoría (administración).
   */
  export type CategoryInput = Omit<Category, 'id' | 'productCount'>;