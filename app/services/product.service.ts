// app/services/product.service.ts
// Cliente para los endpoints de productos (/api/products).
// En local golpea la mini API de Next; con NEXT_PUBLIC_API_URL apunta a Spring.

import { fetcher } from "@/lib/fetcher";
import { apiUrl } from "@/lib/api-url";

const api = <T>(path: string, options?: RequestInit) => fetcher<T>(apiUrl(path), options);

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
  sizes: string[];
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
  sizes?: string[];
  stock: number;
  isActive?: boolean;
}

interface ListResponse {
  data: Product[];
  meta?: { total: number };
}

/**
 * El backend Spring solo acepta el slug de la categoría en un producto; la
 * mini API acepta además el objeto completo. Se manda siempre el slug, que
 * ambas formas entienden, y la mini API lo resuelve contra sus categorías.
 */
const toCategorySlug = (category: ProductInput["category"] | string): string =>
  typeof category === "string" ? category : category.slug;

export const ProductService = {
  /**
   * Obtiene todos los productos (con filtros opcionales por categoría o búsqueda).
   *
   * Con `admin: true` usa la lista de gestión, que sí incluye los productos
   * dados de baja: la pública solo devuelve activos cuando hay backend Spring.
   */
  async getAll(params?: {
    category?: string;
    search?: string;
    admin?: boolean;
  }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.search) query.set("search", params.search);

    const path = params?.admin ? "/api/admin/products" : "/api/products";
    const res = await api<ListResponse>(`${path}?${query.toString()}`);
    return res.data;
  },

  /**
   * Obtiene un producto por su slug (URL amigable).
   */
  async getBySlug(slug: string): Promise<Product> {
    const res = await api<{ data: Product }>(`/api/products/slug/${slug}`);
    return res.data;
  },

  /**
   * Obtiene un producto por su id.
   */
  async getById(id: string): Promise<Product> {
    const res = await api<{ data: Product }>(`/api/products/${id}`);
    return res.data;
  },

  /**
   * Crea un producto (solo admin).
   */
  async create(input: ProductInput): Promise<Product> {
    const res = await api<{ data: Product }>("/api/products", {
      method: "POST",
      body: JSON.stringify({ ...input, category: toCategorySlug(input.category) }),
    });
    return res.data;
  },

  /**
   * Actualiza un producto (solo admin).
   */
  async update(id: string, input: Partial<ProductInput>): Promise<Product> {
    const { category, ...rest } = input;
    const res = await api<{ data: Product }>(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...rest,
        ...(category ? { category: toCategorySlug(category) } : {}),
      }),
    });
    return res.data;
  },

  /**
   * Elimina un producto (solo admin).
   */
  async remove(id: string): Promise<void> {
    await api<{ success: boolean }>(`/api/products/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Actualiza el stock de un producto.
   */
  async updateStock(id: string, stock: number): Promise<Product> {
    const res = await api<{ data: Product }>(`/api/products/${id}/stock`, {
      method: "PATCH",
      body: JSON.stringify({ stock }),
    });
    return res.data;
  },
};