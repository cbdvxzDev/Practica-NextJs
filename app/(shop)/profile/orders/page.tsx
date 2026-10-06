"use client";

import * as React from "react";
import Link from "next/link";
import { PageTitle } from "../../../components/common/PageTitle";
import { Button } from "../../../components/ui/Button";
import { useAuthStore } from "../../../store/auth.store";
import { useOrderStore } from "../../../store/order.store";
import { useIsMounted } from "../../../hooks/useIsMounted";
import { isOrderOwnedBy } from "../../../utils/orderOwnership";
import { OrderList } from "../../../components/order/OrderList";

export default function ProfileOrdersPage() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isMounted = useIsMounted();

  const allOrders = useOrderStore((state) => state.orders);
  const loaded = useOrderStore((state) => state.loaded);
  const loading = useOrderStore((state) => state.loading);
  const fetchOrders = useOrderStore((state) => state.fetchOrders);

  /* El `ShopDataProvider` ya pide los pedidos al montar la tienda; este
     respaldo solo salta si se llega aquí sin ninguna carga en marcha. */
  React.useEffect(() => {
    if (isAuthenticated && !loaded && !loading) void fetchOrders();
  }, [isAuthenticated, loaded, loading, fetchOrders]);

  const myOrders = user ? allOrders.filter((o) => isOrderOwnedBy(o, user)) : [];

  if (isMounted && !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6 animate-fadeIn">
        <div className="space-y-2">
          <h1 className="text-2xl font-medium tracking-tight">Inicia sesión para ver tus pedidos</h1>
          <p className="text-sm text-brand-muted max-w-sm mx-auto">
            Accede a tu cuenta para revisar el estado de todos tus pedidos.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="primary" className="h-11 px-6">Iniciar sesión</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" className="h-11 px-6">Crear cuenta</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-neutral-100 rounded w-56" />
        <div className="space-y-px">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-neutral-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-border pb-5">
        <PageTitle
          title="Mis Pedidos"
          description="Todos los pedidos realizados con tu cuenta, con su estado actual."
        />
        <Link href="/profile" className="text-xs font-medium text-brand-muted hover:text-brand-dark transition-colors">
          ← Volver a mi cuenta
        </Link>
      </div>

      <OrderList orders={myOrders} />
    </div>
  );
}
