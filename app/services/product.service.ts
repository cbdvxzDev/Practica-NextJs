// app/services/product.service.ts
// Cliente para los endpoints de productos de la mini API (/api/products).

import { fetcher } from "@/lib/fetcher";

export interface Product {
  id: string;
  sku: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: { id: string; name: string; slug: string };
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  sku: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images?: string[];
  category: { id: string; name: string; slug: string };
  stock: number;
  isActive?: boolean;
}

interface ListResponse {
  data: Product[];
  meta?: { total: number };
}

export const ProductService = {
  /**
   * Obtiene todos los productos (con filtros opcionales por categoría o búsqueda).
   */
  async getAll(params?: { category?: string; search?: string }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.search) query.set("search", params.search);

    const res = await fetcher<ListResponse>(`/api/products?${query.toString()}`);
    return res.data;
  },

  /**
   * Obtiene un producto por su slug (URL amigable).
   */
  async getBySlug(slug: string): Promise<Product> {
    const res = await fetcher<{ data: Product }>(`/api/products/slug/${slug}`);
    return res.data;
  },

  /**
   * Obtiene un producto por su id.
   */
  async getById(id: string): Promise<Product> {
    const res = await fetcher<{ data: Product }>(`/api/products/${id}`);
    return res.data;
  },

  /**
   * Crea un producto (solo admin).
   */
  async create(input: ProductInput): Promise<Product> {
    const res = await fetcher<{ data: Product }>("/api/products", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return res.data;
  },

  /**
   * Actualiza un producto (solo admin).
   */
  async update(id: string, input: Partial<ProductInput>): Promise<Product> {
    const res = await fetcher<{ data: Product }>(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
    return res.data;
  },

  /**
   * Elimina un producto (solo admin).
   */
  async remove(id: string): Promise<void> {
    await fetcher<{ success: boolean }>(`/api/products/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Actualiza el stock de un producto.
   */
  async updateStock(id: string, stock: number): Promise<Product> {
    const res = await fetcher<{ data: Product }>(`/api/products/${id}/stock`, {
      method: "PATCH",
      body: JSON.stringify({ stock }),
    });
    return res.data;
  },
};

export type { Product as ProductType };