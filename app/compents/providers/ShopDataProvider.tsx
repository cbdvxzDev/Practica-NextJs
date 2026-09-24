"use client";

import * as React from "react";
import { useAuthStore } from "@/store/auth.store";
import { useCategoryStore } from "@/store/category.store";
import { useProductStore } from "@/store/product.store";
import { useOrderStore } from "@/store/order.store";

/**
 * Al montar la tienda, hidrata los stores con la mini API:
 *  - sesión (si hay token)
 *  - catálogo de productos
 *  - categorías
 *  - órdenes del usuario autenticado
 */
export function ShopDataProvider({ children }: { children: React.ReactNode }) {
  const hydrated = React.useRef(false);

  React.useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    const hydrate = async () => {
      await useAuthStore.getState().hydrate();

      const [products, categories] = await Promise.allSettled([
        useProductStore.getState().fetchProducts(),
        useCategoryStore.getState().fetchCategories(),
      ]);
      void products;
      void categories;

      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        await useOrderStore.getState().fetchOrders();
      }
    };

    hydrate();
  }, []);

  return <>{children}</>;
}