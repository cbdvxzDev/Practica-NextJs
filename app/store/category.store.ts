"use client";

import { create } from "zustand";
import { CategoryService, type Category } from "@/services/category.service";

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  createCategory: (input: Pick<Category, "name"> & Partial<Category>) => Promise<Category>;
  updateCategory: (id: string, input: Partial<Category>) => Promise<Category>;
  removeCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const categories = await CategoryService.getAll();
      set({ categories, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Error al cargar las categorías.",
        loading: false,
      });
    }
  },

  createCategory: async (input) => {
    const created = await CategoryService.create(input);
    // Refresca desde la API en vez de insertar localmente: así la lista del
    // panel refleja el orden y el contador reales del servidor.
    await get().fetchCategories();
    return created;
  },

  updateCategory: async (id, input) => {
    const updated = await CategoryService.update(id, input);
    await get().fetchCategories();
    return updated;
  },

  removeCategory: async (id) => {
    await CategoryService.remove(id);
    set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }));
  },
}));

export default useCategoryStore;