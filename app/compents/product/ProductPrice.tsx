import { cn } from "@/lib/utils";

export interface ProductPriceProps {
  price: number;
  originalPrice?: number;
  className?: string;
  size?: "sm" | "base" | "lg" | "xl";
}

export function ProductPrice({
  price,
  originalPrice,
  className,
  size = "base",
}: ProductPriceProps) {
  // Verificar si el producto se encuentra actualmente en descuento activo
  const hasDiscount = originalPrice ? originalPrice > price : false;

  // Formatear los valores numéricos bajo el estándar regional colombiano
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString("es-CO")}`;
  };

  // Escalas de tamaño tipográfico simétricas y compactas
  const sizeClasses = {
    sm: "text-xs",
    base: "text-sm",
    lg: "text-base md:text-lg",
    xl: "text-lg md:text-xl font-bold tracking-tight",
  };

  return (
    <div className={cn("flex items-center gap-2 text-brand-dark", className)}>
      {/* 1. PRECIO ACTUAL O PRECIO CON DESCUENTO */}
      <span className={cn("font-semibold", sizeClasses[size], hasDiscount && "text-brand-dark")}>
        {formatCurrency(price)}
      </span>

      {/* 2. PRECIO ORIGINAL TACHADO (SOLO SI APLICA) */}
      {hasDiscount && originalPrice && (
        <>
          <span className="text-xs text-brand-muted line-through opacity-70 font-normal">
            {formatCurrency(originalPrice)}
          </span>
          
          {/* Pequeño indicador de porcentaje de descuento */}
          <span className="text-[10px] font-medium uppercase tracking-wider text-red-600 bg-red-50 px-1.5 py-0.5 rounded-button">
            -{Math.round(((originalPrice - price) / originalPrice) * 100)}%
          </span>
        </>
      )}
    </div>
  );
}