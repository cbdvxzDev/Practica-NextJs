// app/store/wishlist.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  items: string[]; // Guardamos solo los IDs para mayor eficiencia
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      
      toggleWishlist: (productId) => 
        set((state) => {
          const isExists = state.items.includes(productId);
          return {
            items: isExists 
              ? state.items.filter((id) => id !== productId) 
              : [...state.items, productId]
          };
        }),

      isInWishlist: (productId) => get().items.includes(productId),
      
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'wishlist-storage', // Persistencia en localStorage
    }
  )
);