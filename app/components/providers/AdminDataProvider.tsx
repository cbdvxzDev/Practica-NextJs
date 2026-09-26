"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useProductStore } from "@/store/product.store";
import { useCategoryStore } from "@/store/category.store";
import { useOrderStore } from "@/store/order.store";
import { ROLES } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";

const STAFF_ROLES: string[] = [ROLES.ADMIN, ROLES.SUPPORT];

type AdminGateStatus = "checking" | "granted" | "denied";

/**
 * Puerta de entrada del panel administrativo.
 *
 * Valida la sesión persistida en localStorage antes de montar el panel y solo
 * entonces hidrata los stores (productos, categorías y órdenes) desde la mini
 * API. Sin este control, cualquiera que escribiera /admin en la barra de
 * direcciones alcanzaba el esqueleto del panel; las APIs ya rechazaban las
 * escrituras, pero la interfaz quedaba expuesta.
 */
export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  // La validación corre una sola vez al montar. Se fija la ruta inicial para que
  // el efecto no se vuelva a ejecutar al navegar dentro del panel.
  const [requestedPath] = React.useState(() => pathname);
  const [status, setStatus] = React.useState<AdminGateStatus>("checking");

  React.useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const valid = await useAuthStore.getState().hydrate();

      if (cancelled) return;

      if (!valid) {
        setStatus("denied");
        router.replace(`${ROUTES.LOGIN}?next=${encodeURIComponent(requestedPath)}`);
        return;
      }

      const { user } = useAuthStore.getState();
      if (!user || !STAFF_ROLES.includes(user.role)) {
        useAuthStore.getState().logout();
        setStatus("denied");
        router.replace(ROUTES.LOGIN);
        return;
      }

      // `support` es un rol de solo lectura: según el README solo gestiona
      // pedidos, por eso no hidrata el catálogo (además la API lo rechaza).
      const requests = [useOrderStore.getState().fetchOrders()];
      if (user.role === ROLES.ADMIN) {
        requests.push(
          useProductStore.getState().fetchProducts(),
          useCategoryStore.getState().fetchCategories()
        );
      }

      await Promise.allSettled(requests);

      if (!cancelled) setStatus("granted");
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [router, requestedPath]);

  if (status !== "granted") {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-brand-light">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-dark/20 border-t-brand-dark" />
          <p className="text-xs uppercase tracking-widest text-brand-muted">
            {status === "denied" ? "Redirigiendo al inicio de sesión..." : "Verificando permisos..."}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
