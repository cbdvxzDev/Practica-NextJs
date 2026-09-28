// app/components/ui/Skeletons.tsx
// Piezas de esqueleto para los `loading.tsx`.
//
// Antes cada loading.tsx traía su propio bloque de `div` con `animate-pulse`,
// repetido con clases distintas cada vez. Aquí se centraliza para que todos los
// esqueletos compartan la misma animación y el mismo tono, y para que añadir una
// ruta nueva sea escribir cinco líneas.

import { cn } from "@/lib/utils";

/** Barra genérica. `w` acepta cualquier clase de ancho de Tailwind. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("bg-neutral-200/60 animate-pulse rounded", className)}
    />
  );
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          // La última línea más corta: imita un párrafo y no una tabla.
          className={cn("h-3", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      <Skeleton className="aspect-square w-full rounded-card" />
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-1/4" />
    </div>
  );
}

export function SkeletonProductGrid({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonPageHeader() {
  return (
    <div className="border-b border-border pb-5 space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96 max-w-full" />
    </div>
  );
}

/** Filas de tabla para los listados del panel. */
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-9 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid grid-cols-12 gap-3">
          <Skeleton className="h-10 col-span-4" />
          <Skeleton className="h-10 col-span-2" />
          <Skeleton className="h-10 col-span-2" />
          <Skeleton className="h-10 col-span-4" />
        </div>
      ))}
    </div>
  );
}
