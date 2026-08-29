// app/store/inventory.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PRODUCTS } from '../data/catalog';

interface InventoryState {
  /** Ajustes de stock por id de producto, sobre el stock base del catálogo. */
  stockOverrides: Record<string, number>;
  /** Descuenta unidades del stock disponible de un producto (mínimo 0). */
  decrementStock: (productId: string, quantity: number) => void;
  /** Fija un nuevo valor absoluto de stock (usado desde el panel admin). */
  setStock: (productId: string, quantity: number) => void;
  /** Devuelve el stock disponible actual, tomando en cuenta los ajustes. */
  getStock: (productId: string) => number;
}

const getBaseStock = (productId: string) => {
  const product = PRODUCTS.find((item) => item.id === productId);
  return product?.stock ?? 0;
};

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      stockOverrides: {},

      decrementStock: (productId, quantity) =>
        set((state) => {
          const current = state.stockOverrides[productId] ?? getBaseStock(productId);
          const next = Math.max(0, current - Math.max(0, quantity));
          return { stockOverrides: { ...state.stockOverrides, [productId]: next } };
        }),

      setStock: (productId, quantity) =>
        set((state) => ({
          stockOverrides: { ...state.stockOverrides, [productId]: Math.max(0, quantity) },
        })),

      getStock: (productId) => {
        const override = get().stockOverrides[productId];
        return override !== undefined ? override : getBaseStock(productId);
      },
    }),
    {
      name: 'inventory-storage',
    }
  )
);

/** Hook de conveniencia para leer el stock efectivo de un producto en un componente. */
export const useEffectiveStock = (productId: string) =>
  useInventoryStore((state) => state.stockOverrides[productId] ?? getBaseStock(productId));
