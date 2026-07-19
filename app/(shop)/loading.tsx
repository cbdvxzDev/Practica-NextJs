import { Skeleton } from "../compents/ui/Skeleton";

export default function ShopLoading() {
  return (
    <div className="space-y-12 w-full">
      {/* 1. Skeleton del Hero / Banner Principal */}
      <div className="w-full h-[300px] md:h-[400px] bg-neutral-200/60 animate-pulse rounded-card" />

      {/* 2. Sección de Productos en Carga */}
      <div className="space-y-6">
        {/* Título de la sección simulado */}
        <div className="h-7 w-48 bg-neutral-200/80 animate-pulse rounded" />

        {/* Grid de productos simulando el ProductGrid */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-4">
              {/* Contenedor de la imagen del producto */}
              <div className="aspect-square w-full bg-neutral-200/60 animate-pulse rounded-card" />
              
              {/* Info del producto: Título y Precio */}
              <div className="space-y-2">
                <div className="h-4 w-3/4 bg-neutral-200/80 animate-pulse rounded" />
                <div className="h-4 w-1/4 bg-neutral-200/80 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}