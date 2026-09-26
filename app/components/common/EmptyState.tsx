"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 py-16 space-y-4",
        className
      )}
    >
      {/* ICONO CONTENEDOR */}
      {icon && (
        <div className="h-12 w-12 flex items-center justify-center rounded-full bg-neutral-50 text-brand-muted/60 mb-2">
          {icon}
        </div>
      )}

      {/* TEXTO DE ESTADO */}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-brand-dark uppercase tracking-wide">
          {title}
        </h3>
        <p className="text-xs text-brand-muted max-w-[240px] leading-relaxed">
          {description}
        </p>
      </div>

      {/* ACCIÓN OPCIONAL */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 text-xs font-semibold text-brand-dark underline underline-offset-4 hover:opacity-70 transition-opacity"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}