"use client";

import { create } from "zustand";
import { ProductService, type Product, type ProductInput } from "@/services/product.service";

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;

  /** Reemplaza el catálogo con datos frescos de la mini API. */
  setProducts: (products: Product[]) => void;

  /** Carga el catálogo completo desde la mini API. */
  fetchProducts: (params?: { category?: string; search?: string }) => Promise<void>;

  /** Crea un producto vía API y lo agrega al catálogo local. */
  addProduct: (input: ProductInput) => Promise<Product>;

  /** Actualiza un producto vía API. */
  updateProduct: (id: string, updates: Partial<ProductInput>) => Promise<Product>;

  /** Elimina un producto vía API. */
  deleteProduct: (id: string) => Promise<void>;

  /** Actualiza el stock vía API. */
  updateStock: (id: string, stock: number) => Promise<Product>;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  loading: false,
  error: null,

  setProducts: (products) => set({ products }),

  fetchProducts: async (params) => {
    set({ loading: true, error: null });
    try {
      const products = await ProductService.getAll(params);
      set({ products, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Error al cargar el catálogo.",
        loading: false,
      });
    }
  },

  addProduct: async (input) => {
    const product = await ProductService.create(input);
    set((state) => ({ products: [product, ...state.products] }));
    return product;
  },

  updateProduct: async (id, updates) => {
    const updated = await ProductService.update(id, updates);
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? updated : p)),
    }));
    return updated;
  },

  deleteProduct: async (id) => {
    await ProductService.remove(id);
    set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
  },

  updateStock: async (id, stock) => {
    const updated = await ProductService.updateStock(id, stock);
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? updated : p)),
    }));
    return updated;
  },
}));

export const useProductBySlug = (slug: string) =>
  useProductStore((state) => state.products.find((p) => p.slug === slug));

export default useProductStore;