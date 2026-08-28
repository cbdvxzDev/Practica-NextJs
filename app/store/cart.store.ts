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

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      
      addItem: (product, quantity = 1) => 
        set((state) => {
          const existing = state.items.find((item) => item.id === product.id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === product.id ? { ...item, quantity: Math.min(item.stock ?? Infinity, item.quantity + quantity) } : item
              ),
            };
          }
          return { items: [...state.items, { ...product, quantity }] };
        }),

      removeItem: (id) => 
        set((state) => ({ items: state.items.filter((item) => item.id !== id) })),

      updateQuantity: (id, quantity) => 
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: Math.min(item.stock ?? Infinity, Math.max(0, quantity)) } : item
          ),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage', // Persistencia en localStorage
    }
  )
);

// Selector de conveniencia: total de unidades en el carrito (suma de quantity)
export const useCartTotalItems = () =>
  useCartStore((state) => state.items.reduce((acc, item) => acc + item.quantity, 0));