"use client";

import * as React from "react";
import { useAuthStore } from "@/store/auth.store";
import { useProductStore } from "@/store/product.store";
import { useCategoryStore } from "@/store/category.store";
import { useOrderStore } from "@/store/order.store";

/**
 * Hidrata los stores usados por el panel administrativo desde la mini API:
 * productos, categorías y órdenes (alcanzables solo como admin/support).
 */
export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const hydrated = React.useRef(false);

  React.useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    const hydrate = async () => {
      const valid = await useAuthStore.getState().hydrate();

      if (valid) {
        await Promise.allSettled([
          useProductStore.getState().fetchProducts(),
          useCategoryStore.getState().fetchCategories(),
          useOrderStore.getState().fetchOrders(),
        ]);
      }
    };

    hydrate();
  }, []);

  return <>{children}</>;
}