import * as React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "danger";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  
  // 1. ESTILOS BASE (Geometría y tipografía uniformes)
  const baseStyles = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-tight transition-colors focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2";

  // 2. VARIANTES CROMÁTICAS SOBRIAS
  const variants = {
    default: "border-transparent bg-brand-dark text-white shadow-subtle",
    secondary: "border-transparent bg-brand-light text-brand-dark hover:bg-neutral-200/60",
    outline: "border-border bg-transparent text-brand-dark",
    success: "border-transparent bg-neutral-100 text-neutral-800", // Enfoque monocromático para estados completados/entregados
    warning: "border-amber-100 bg-amber-50/60 text-amber-800/90", // Alertas sutiles de inventario bajo sin saturar
    danger: "border-red-100 bg-red-50 text-red-700/90", // Estados críticos o cancelados
  };

  return (
    <div
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    />
  );
}

export { Badge };