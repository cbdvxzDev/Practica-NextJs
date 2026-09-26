"use client";

import * as React from "react";

/**
 * `false` durante el render del servidor y el primer render del cliente, `true`
 * después. Sustituye al patrón `useState(false)` + `useEffect(() => setState(true))`,
 * que provoca un render extra y dispara el aviso
 * `react-hooks/set-state-in-effect` de ESLint.
 *
 * Se usa para no renderizar datos que solo existen en `localStorage`
 * (los stores persistidos de Zustand) durante la hidratación de React.
 */
export function useIsMounted(): boolean {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}
