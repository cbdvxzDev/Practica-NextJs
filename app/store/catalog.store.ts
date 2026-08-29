// app/store/catalog.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CATEGORIES, PRODUCTS, type StoreCategory, type StoreProduct } from '../data/catalog';

const generateSlug = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

interface CatalogState {
  products: StoreProduct[];
  categories: StoreCategory[];
  /** Crea un producto nuevo a partir de datos parciales del formulario admin. */
  createProduct: (input: Omit<StoreProduct, 'id' | 'slug'> & { slug?: string }) => StoreProduct;
  /** Actualiza un producto existente por id. */
  updateProduct: (id: string, updates: Partial<StoreProduct>) => void;
  /** Elimina un producto del catálogo. */
  deleteProduct: (id: string) => void;
  /** Crea una nueva categoría. */
  createCategory: (input: Omit<StoreCategory, 'id' | 'slug'> & { slug?: string }) => StoreCategory;
  /** Actualiza una categoría existente por id. */
  updateCategory: (id: string, updates: Partial<StoreCategory>) => void;
  /** Elimina una categoría (solo si no tiene productos asociados). */
  deleteCategory: (id: string) => void;
  /** Cuenta cuántos productos pertenecen a una categoría dada. */
  getProductCountByCategory: (categorySlug: string) => number;
}

let productSequence = PRODUCTS.length;

export const useCatalogStore = create<CatalogState>()(
  persist(
    (set, get) => ({
      products: PRODUCTS,
      categories: CATEGORIES,

      createProduct: (input) => {
        productSequence += 1;
        const newProduct: StoreProduct = {
          ...input,
          id: String(productSequence),
          slug: input.slug?.trim() || generateSlug(input.title),
        };
        set((state) => ({ products: [newProduct, ...state.products] }));
        return newProduct;
      },

      updateProduct: (id, updates) =>
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id ? { ...product, ...updates } : product
          ),
        })),

      deleteProduct: (id) =>
        set((state) => ({ products: state.products.filter((product) => product.id !== id) })),

      createCategory: (input) => {
        const slug = input.slug?.trim() || generateSlug(input.name);
        const newCategory: StoreCategory = { ...input, id: slug, slug };
        set((state) => ({ categories: [...state.categories, newCategory] }));
        return newCategory;
      },

      updateCategory: (id, updates) =>
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === id ? { ...category, ...updates } : category
          ),
        })),

      deleteCategory: (id) =>
        set((state) => ({ categories: state.categories.filter((category) => category.id !== id) })),

      getProductCountByCategory: (categorySlug) =>
        get().products.filter((product) => product.category.slug === categorySlug).length,
    }),
    {
      name: 'catalog-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          productSequence = Math.max(
            PRODUCTS.length,
            ...state.products.map((product) => Number(product.id) || 0)
          );
        }
      },
    }
  )
);
