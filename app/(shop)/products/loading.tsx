import { Skeleton } from "../../compents/ui/Skeleton";

export default function ProductsLoading() {
  return (
    <div className="space-y-8 w-full">
      {/* 1. Skeleton del Encabezado de Página */}
      <div className="border-b border-border pb-5 space-y-2">
        <div className="h-8 w-64 bg-neutral-200/60 animate-pulse rounded" />
        <div className="h-4 w-96 bg-neutral-200/40 animate-pulse rounded" />
      </div>

      {/* 2. Estructura de Esqueleto del Catálogo */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* BARRA LATERAL DE FILTROS EN ESPERA */}
        <aside className="hidden lg:flex flex-col space-y-8 p-1">
          {/* Bloque de Búsqueda */}
          <div className="space-y-2">
            <div className="h-4 w-16 bg-neutral-200/60 animate-pulse rounded" />
            <div className="h-10 w-full bg-neutral-200/40 animate-pulse rounded-button" />
          </div>
          <hr className="border-border/60" />
          {/* Bloque de Categorías */}
          <div className="space-y-3">
            <div className="h-4 w-24 bg-neutral-200/60 animate-pulse rounded" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-4 w-4 bg-neutral-200/40 animate-pulse rounded-sm" />
                <div className="h-4 w-28 bg-neutral-200/40 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL: BARRA SUPERIOR Y GRID DE TARJETAS */}
        <div className="lg:col-span-3 space-y-10">
          
          {/* Barra de utilidades superior simulada */}
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <div className="h-4 w-36 bg-neutral-200/40 animate-pulse rounded" />
            <div className="h-8 w-32 bg-neutral-200/40 animate-pulse rounded-button" />
          </div>

          {/* Grid de Productos Simulado (6 Tarjetas para dar peso visual) */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-4">
                {/* Contenedor de Imagen de Producto */}
                <div className="aspect-square w-full bg-neutral-200/50 animate-pulse rounded-card" />
                
                {/* Info: Título, Categoría y Precio */}
                <div className="space-y-2">
                  <div className="h-3 w-1/3 bg-neutral-200/40 animate-pulse rounded" />
                  <div className="h-4 w-5/6 bg-neutral-200/60 animate-pulse rounded" />
                  <div className="h-4 w-1/4 bg-neutral-200/60 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}