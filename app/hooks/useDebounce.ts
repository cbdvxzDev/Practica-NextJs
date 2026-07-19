"use client";

import * as React from "react";

/**
 * Hook para retrasar la actualización de un valor.
 * Ideal para búsquedas o filtros que dependen de entradas de texto.
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    // Establece un temporizador para actualizar el valor después del delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Si el valor cambia antes de que pase el delay, se limpia el temporizador anterior
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}