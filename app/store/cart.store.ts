// app/store/cart.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  slug?: string;
  stock?: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const clampQuantity = (quantity: number, stock?: number) => {
  const requested = Number.isFinite(quantity) ? Math.max(1, Math.round(quantity)) : 1;
  const limit = Number.isFinite(stock) && stock !== undefined ? stock : Infinity;
  return Math.min(requested, limit);
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (product, quantity = 1) =>
        set((state) => {
          const nextQuantity = clampQuantity(quantity, product.stock);
          const existingItem = state.items.find((item) => item.id === product.id);

          if (existingItem) {
            return {
              items: state.items.map((item) => {
                if (item.id !== product.id) return item;

                const totalQuantity = item.quantity + nextQuantity;
                return {
                  ...item,
                  quantity: Math.min(item.stock ?? Infinity, totalQuantity),
                };
              }),
            };
          }

          return {
            items: [
              ...state.items,
              {
                ...product,
                quantity: nextQuantity,
              },
            ],
          };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items
            .map((item) => {
              if (item.id !== id) return item;

              const safeQuantity = Math.max(0, Number(quantity) || 0);
              return {
                ...item,
                quantity: Math.min(item.stock ?? Infinity, safeQuantity),
              };
            })
            .filter((item) => item.quantity > 0),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// Selector de conveniencia: total de unidades en el carrito (suma de quantity)
export const useCartTotalItems = () =>
  useCartStore((state) => state.items.reduce((acc, item) => acc + item.quantity, 0));