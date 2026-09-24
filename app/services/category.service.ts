// app/services/category.service.ts
// Cliente para los endpoints de categorías de la mini API (/api/categories).

import { fetcher } from "@/lib/fetcher";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

interface ListResponse {
  data: Category[];
  meta?: { total: number };
}

export const CategoryService = {
  /**
   * Obtiene la lista completa de categorías desde la mini API.
   */
  async getAll(): Promise<Category[]> {
    const res = await fetcher<ListResponse>("/api/categories");
    return res.data;
  },

  /**
   * Obtiene una categoría por su id.
   */
  async getById(id: string): Promise<Category> {
    const res = await fetcher<{ data: Category }>(`/api/categories/${id}`);
    return res.data;
  },

  /**
   * Crea una categoría (solo admin).
   */
  async create(input: Pick<Category, "name"> & Partial<Category>): Promise<Category> {
    const res = await fetcher<{ data: Category }>("/api/categories", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return res.data;
  },

  /**
   * Actualiza una categoría (solo admin).
   */
  async update(id: string, input: Partial<Category>): Promise<Category> {
    const res = await fetcher<{ data: Category }>(`/api/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
    return res.data;
  },

  /**
   * Elimina una categoría (solo admin).
   */
  async remove(id: string): Promise<void> {
    await fetcher<{ success: boolean }>(`/api/categories/${id}`, {
      method: "DELETE",
    });
  },
};