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
      const valid = await useAuthStore.getState().hydrate();

      const [products, categories] = await Promise.allSettled([
        useProductStore.getState().fetchProducts(),
        useCategoryStore.getState().fetchCategories(),
      ]);
      void products;
      void categories;

      if (valid) {
        await useOrderStore.getState().fetchOrders();
      }
    };

    hydrate();
  }, []);

  // El montaje de arriba solo cubre la sesión que ya existía al llegar. Un
  // login o un registro posteriores (misma sesión del navegador, sin F5)
  // cambian `isAuthenticated` y aquí se hidratan sus pedidos; al cerrar
  // sesión se vacían para que no se filtren de una cuenta a otra.
  React.useEffect(() => {
    const unsubscribe = useAuthStore.subscribe((state, previous) => {
      if (state.isAuthenticated && !previous.isAuthenticated) {
        void useOrderStore.getState().fetchOrders();
      } else if (!state.isAuthenticated && previous.isAuthenticated) {
        useOrderStore.getState().setOrders([]);
      }
    });
    return unsubscribe;
  }, []);

  return <>{children}</>;
}