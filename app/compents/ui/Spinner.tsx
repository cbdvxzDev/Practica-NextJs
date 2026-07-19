import * as React from "react";
import { cn } from "@/lib/utils";

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "light";
}

function Spinner({ className, size = "md", variant = "default", ...props }: SpinnerProps) {
  
  // 1. ESCALAS DE TAMAÑO SIMÉTRICAS
  const sizes = {
    sm: "h-4 w-4 stroke-[3px]",
    md: "h-6 w-6 stroke-[2.5px]",
    lg: "h-10 w-10 stroke-[2px]",
  };

  // 2. VARIANTES DE COLOR SOBRIAS
  const variants = {
    default: "text-brand-dark",
    light: "text-white/80",
  };

  return (
    <svg
      className={cn(
        "animate-spin", 
        sizes[size], 
        variants[variant], 
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      {/* Círculo de fondo tenue (pista de rotación) */}
      <circle
        className="opacity-12"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
      />
      {/* Arco activo que genera el efecto visual de giro */}
      <path
        className="opacity-85"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export { Spinner };