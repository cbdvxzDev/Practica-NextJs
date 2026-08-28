"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

export interface PageTitleProps {
  title: string;
  description?: string;
  /** Backwards-compatible alias used by existing storefront pages. */
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageTitle({
  title,
  description,
  subtitle,
  actions,
  className,
}: PageTitleProps) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/40", className)}>
      <div className="space-y-0.5">
        <h1 className="text-lg font-bold text-brand-dark tracking-tight">
          {title}
        </h1>
        {(description || subtitle) && (
          <p className="text-xs text-brand-muted">
            {description || subtitle}
          </p>
        )}
      </div>

      {/* Área reservada para botones o filtros de página */}
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}