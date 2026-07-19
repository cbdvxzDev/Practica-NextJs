// app/services/product.service.ts

export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    status: "activo" | "agotado";
    description?: string;
    imageUrl?: string;
  }
  
  export const ProductService = {
    /**
     * Obtiene todos los productos (con soporte opcional para filtros)
     */
    async getAll(params?: { category?: string; search?: string }): Promise<Product[]> {
      const query = new URLSearchParams();
      if (params?.category) query.append("category", params.category);
      if (params?.search) query.append("search", params.search);
  
      const response = await fetch(`/api/products?${query.toString()}`);
      
      if (!response.ok) throw new Error("Error al recuperar el catálogo de productos.");
      return response.json();
    },
  
    /**
     * Obtiene un producto individual por su ID
     */
    async getById(id: string): Promise<Product> {
      const response = await fetch(`/api/products/${id}`);
      
      if (!response.ok) throw new Error(`Producto con ID ${id} no encontrado.`);
      return response.json();
    },
  
    /**
     * Actualiza el stock de un producto (vital para la gestión de inventario)
     */
    async updateStock(id: string, newStock: number): Promise<void> {
      const response = await fetch(`/api/products/${id}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });
  
      if (!response.ok) throw new Error("No se pudo actualizar el stock.");
    }
  };