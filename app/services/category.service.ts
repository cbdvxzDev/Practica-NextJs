// app/services/category.service.ts

export interface Category {
    id: string;
    label: string;
    count: number;
  }
  
  export const CategoryService = {
    /**
     * Obtiene la lista completa de categorías desde el backend
     */
    async getAll(): Promise<Category[]> {
      try {
        const response = await fetch("/api/categories", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Aquí podrías añadir Authorization: `Bearer ${token}` si fuera necesario
          },
        });
  
        if (!response.ok) {
          throw new Error("Error al obtener las categorías.");
        }
  
        return await response.json();
      } catch (error) {
        console.error("CategoryService.getAll Error:", error);
        throw error;
      }
    },
  
    /**
     * Obtiene una categoría específica por ID
     */
    async getById(id: string): Promise<Category> {
      const response = await fetch(`/api/categories/${id}`);
      
      if (!response.ok) {
        throw new Error(`Categoría con ID ${id} no encontrada.`);
      }
  
      return await response.json();
    }
  };