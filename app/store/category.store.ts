"use client";

import { create } from "zustand";
import { CategoryService, type Category } from "@/services/category.service";

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
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

  removeCategory: async (id) => {
    await CategoryService.remove(id);
    set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }));
  },
}));

export default useCategoryStore;