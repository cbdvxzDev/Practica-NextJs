"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const changePage = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };
  // Generar el rango de páginas a mostrar de manera limpia
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  // No renderizar nada si solo existe una página
  if (totalPages <= 1) return null;

  return (
    <nav
      role="navigation"
      aria-label="Navegación de páginas"
      className={cn("flex items-center justify-center space-x-1.5 pt-4", className)}
    >
      {/* BOTÓN ANTERIOR */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => changePage(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 px-2 text-brand-muted hover:text-brand-dark disabled:opacity-30"
        aria-label="Ir a la página anterior"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="sr-only">Anterior</span>
      </Button>

      {/* NÚMEROS DE PÁGINA */}
      {pages.map((page) => {
        const isActive = page === currentPage;
        return (
          <button
            key={page}
            onClick={() => changePage(page)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "h-8 min-w-[32px] px-2 text-xs font-medium rounded-button transition-colors focus:outline-none focus:ring-1 focus:ring-brand-dark",
              isActive
                ? "bg-brand-dark text-white font-semibold"
                : "text-brand-muted hover:bg-brand-light hover:text-brand-dark"
            )}
          >
            {page}
          </button>
        );
      })}

      {/* BOTÓN SIGUIENTE */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => changePage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 px-2 text-brand-muted hover:text-brand-dark disabled:opacity-30"
        aria-label="Ir a la página siguiente"
      >
        <span className="sr-only">Siguiente</span>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Button>
    </nav>
  );
}   