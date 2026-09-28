"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { ROUTES } from "@/constants/routes";

/**
 * Frontera de error de la tienda.
 *
 * Antes solo existía `app/error.tsx`, que sustituye la pantalla completa. Con
 * esa única frontera, un fallo al cargar un producto te echaba a una pantalla
 * negra con la navbar desaparece. Al declararla aquí, el error se queda dentro
 * del layout: se conserva la navegación y `reset()` reintenta solo este
 * segmento.
 */
export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // En producción esto es el punto de enganche para Sentry o similar.
    console.error("[shop] Error en la página:", error);
  }, [error]);

  return (
    <div
      role="alert"
      className="rounded-card border border-red-100 bg-red-50/50 p-8 sm:p-10 text-center space-y-4"
    >
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white">
        <AlertTriangle className="h-5 w-5" />
      </span>

      <div className="space-y-1.5">
        <h2 className="text-lg font-medium text-brand-dark">
          No pudimos cargar esta página
        </h2>
        <p className="text-sm text-brand-muted max-w-md mx-auto">
          Puede ser un problema puntual de conexión. Vuelve a intentarlo y, si
          sigue igual, escríbenos y lo revisamos.
        </p>
      </div>

      {/* El digest identifica el error en los logs del servidor. */}
      {error.digest && (
        <p className="font-mono text-[11px] text-brand-muted/70">ref: {error.digest}</p>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-button bg-brand-dark text-white text-sm font-medium transition-colors hover:bg-brand-dark/90"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reintentar
        </button>
        <Link
          href={ROUTES.HOME}
          className="inline-flex items-center h-10 px-5 rounded-button border border-border text-sm text-brand-dark transition-colors hover:bg-brand-light"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
