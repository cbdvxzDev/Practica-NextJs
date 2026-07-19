"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
  className?: string;
}

export function SearchBar({
  onSearch,
  placeholder = "Buscar piezas o colecciones...",
  initialValue = "",
  className,
}: SearchBarProps) {
  const [query, setQuery] = React.useState(initialValue);

  // Efecto para sincronizar cambios si el valor inicial muta de forma externa
  React.useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value); // Búsqueda en tiempo real (puedes añadir un debounce externamente)
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      {/* ÍCONO DE BÚSQUEDA SUTIL (IZQUIERDA) */}
      <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-brand-muted/70">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </span>

      {/* CAMPO DE ENTRADA */}
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="h-10 w-full pl-9 pr-9 text-xs border border-border/60 rounded-button bg-white focus:outline-none focus:ring-1 focus:ring-brand-dark text-brand-dark placeholder-brand-muted/50 tracking-wide transition-all"
      />

      {/* BOTÓN DISCRETO PARA LIMPIAR (DERECHA - SOLO SI HAY TEXTO) */}
      {query.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-brand-dark transition-colors focus:outline-none"
          aria-label="Limpiar búsqueda"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}