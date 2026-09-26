import * as React from "react";
import { cn } from "../../lib/utils";

// 1. CONTENEDOR PRINCIPAL (CARD)
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-white border border-border/60 rounded-card shadow-subtle overflow-hidden",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

// 2. ENCABEZADO DE LA TARJETA
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-6 flex flex-col space-y-1.5 border-b border-border/40", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

// 3. TÍTULO INTERNO
const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-base font-medium tracking-tight text-brand-dark", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

// 4. SUBTÍTULO O DESCRIPCIÓN SUTIL
const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-xs text-brand-muted", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

// 5. CUERPO DE CONTENIDO
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-4", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

// 6. PIE DE TARJETA (Para acciones fijas o botones)
const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-6 pt-0 flex items-center border-t border-border/30 mt-4", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };