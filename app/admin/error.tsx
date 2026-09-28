"use client";

import * as React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";

/**
 * Frontera de error del panel.
 *
 * Las pantallas de administración son las que más fallan (listas largas, ids
 * dinámicos, escrituras), así que atrapar aquí evita que un fallo en
 * /admin/orders tire la aplicación entera y deje al usuario sin salida.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[admin] Error en el panel:", error);
  }, [error]);

  return (
    <div
      role="alert"
      className="rounded-card border border-red-100 bg-red-50/50 p-8 text-center space-y-4"
    >
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white">
        <AlertTriangle className="h-5 w-5" />
      </span>

      <div className="space-y-1.5">
        <h2 className="text-base font-medium text-brand-dark">
          Algo falló en el panel
        </h2>
        <p className="text-sm text-brand-muted max-w-sm mx-auto">
          No se ha guardado ningún cambio a medias. Puedes reintentar la
          operación o volver al dashboard.
        </p>
      </div>

      {error.digest && (
        <p className="font-mono text-[11px] text-brand-muted/70">ref: {error.digest}</p>
      )}

      <div className="flex items-center justify-center gap-3 pt-1">
        <Button type="button" onClick={reset} size="sm">
          <RotateCcw className="h-3.5 w-3.5 mr-2" />
          Reintentar
        </Button>
        <a
          href={ROUTES.ADMIN.DASHBOARD}
          className="inline-flex items-center h-8 px-3 rounded-button border border-border text-xs text-brand-dark transition-colors hover:bg-brand-light"
        >
          Ir al dashboard
        </a>
      </div>
    </div>
  );
}
