import * as React from "react";
import { cn } from "../../lib/utils"; // Tu función utilitaria para fusionar clases de Tailwind

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    
    // 1. ESTILOS BASE (Comunes para cualquier variante)
    const baseStyles = "inline-flex items-center justify-center rounded-button font-medium tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-dark disabled:pointer-events-none disabled:opacity-40";

    // 2. VARIANTES DE DISEÑO (Alineadas a tu estética limpia)
    const variants = {
      primary: "bg-brand-dark text-white hover:bg-brand-dark/90 active:scale-[0.98]",
      secondary: "bg-brand-light text-brand-dark hover:bg-neutral-200/70 active:scale-[0.98]",
      outline: "border border-border bg-transparent text-brand-dark hover:bg-brand-light active:scale-[0.98]",
      ghost: "bg-transparent text-brand-dark hover:bg-brand-light",
      danger: "bg-red-50 text-red-700 hover:bg-red-100/80 active:scale-[0.98]"
    };

    // 3. ESCALAS DE TAMAÑO
    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base"
    };

    return (
      <button
        type={props.type || "button"}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2 animate-fadeIn">
            {/* Spinner minimalista */}
            <svg 
              className="animate-spin h-4 w-4 text-current" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {variant !== "ghost" && <span>Cargando...</span>}
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };