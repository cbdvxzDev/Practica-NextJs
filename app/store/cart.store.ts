"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  /** Identificador del producto en el catálogo. */
  id: string;
  /**
   * Identificador de la línea del carrito. Combina producto y talla para que
   * dos tallas del mismo producto ocupen filas separadas.
   */
  lineId: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  stock?: number;
  size?: string;
}

export const buildLineId = (id: string, size?: string) => (size ? `${id}::${size}` : id);

interface CartState {
  items: CartItem[];
  addItem: (product: Omit<CartItem, "quantity" | "lineId">, quantity?: number) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (product, quantity = 1) =>
        set((state) => {
          const lineId = buildLineId(product.id, product.size);
          const existing = state.items.find((item) => item.lineId === lineId);

          if (existing) {
            return {
              items: state.items.map((item) =>
                item.lineId === lineId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          return { items: [...state.items, { ...product, lineId, quantity }] };
        }),

      removeItem: (lineId) =>
        set((state) => ({ items: state.items.filter((item) => item.lineId !== lineId) })),

      updateQuantity: (lineId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.lineId === lineId ? { ...item, quantity: Math.max(0, quantity) } : item
          ),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
      version: 1,
      // Los carritos guardados antes de soportar tallas solo tenían `id`.
      migrate: (persisted) => {
        const items = (persisted as { items?: CartItem[] })?.items ?? [];
        return {
          items: items.map((item) => ({
            ...item,
            lineId: item.lineId ?? buildLineId(item.id, item.size),
          })),
        };
      },
    }
  )
);

export const useCartTotalItems = () =>
  useCartStore((state) => state.items.reduce((acc, item) => acc + item.quantity, 0));
