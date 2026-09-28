"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductGrid } from "../../components/product/ProductGrid";
import { ProductFilters } from "../../components/filters/ProductFilters";
import { ProductSort } from "../../components/filters/ProductSort";
import { ProductPagination } from "../../components/filters/ProductPagination";
import { PageTitle } from "../../components/common/PageTitle";
import { cn } from "../../lib/utils";
import { useProductStore } from "../../store/product.store";
import { useCategoryStore } from "../../store/category.store";
import { CONFIG } from "../../constants/config";

const FALLBACK_CATEGORIES = [
  { id: "abrigo", label: "Prendas de Abrigo" },
  { id: "vestidos", label: "Vestidos" },
  { id: "tejidos", label: "Tejidos de Punto" },
  { id: "denim", label: "Denim" },
  { id: "camisas", label: "Camisas y Blusas" },
  { id: "pantalones", label: "Pantalones" },
  { id: "calzado", label: "Calzado" },
  { id: "accesorios", label: "Accesorios" },
  { id: "basicos", label: "Básicos Esenciales" },
];

function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="aspect-[3/4] rounded-lg bg-neutral-100" />
          <div className="h-3 bg-neutral-100 rounded w-24" />
          <div className="h-3 bg-neutral-100 rounded w-32" />
        </div>
      ))}
    </div>
  );
}

function ProductCatalogPage() {
  const searchParams = useSearchParams();
  const allProducts = useProductStore((state) => state.products);
  const loading = useProductStore((state) => state.loading);
  const categories = useCategoryStore((state) => state.categories);
  const [showFilters, setShowFilters] = React.useState(false);

  // Las categorías se cargan desde la API; mientras tanto usamos las conocidas.
  const categoryItems = React.useMemo(() => {
    if (categories.length > 0) {
      return categories.map((c) => ({ id: c.slug, label: c.name }));
    }
    return FALLBACK_CATEGORIES;
  }, [categories]);

  const filtered = React.useMemo(() => {
    const category = searchParams.get("category")?.toLowerCase();
    const q = searchParams.get("q")?.toLowerCase();
    const min = Number(searchParams.get("minPrice")) || 0;
    const max = Number(searchParams.get("maxPrice")) || Number.MAX_SAFE_INTEGER;
    const sort = searchParams.get("sort") || "featured";
    const sizes = (searchParams.get("size") || "").split(",").filter(Boolean);
    const inStockOnly = searchParams.get("inStock") === "1";
    const onSaleOnly = searchParams.get("sale") === "1";

    // Se listan también las piezas agotadas (el carrito las marca como no
    // comprables) para que el catálogo coincida con el contador de categorías.
    let products = allProducts.filter((p) => p.isActive);

    if (category) {
      products = products.filter(
        (p) =>
          p.category.slug.toLowerCase() === category ||
          p.category.id.toLowerCase() === category
      );
    }

    if (q) {
      products = products.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    if (sizes.length > 0) {
      products = products.filter((p) => sizes.some((s) => p.sizes.includes(s)));
    }

    if (inStockOnly) {
      products = products.filter((p) => p.stock > 0);
    }

    if (onSaleOnly) {
      products = products.filter(
        (p) => p.compareAtPrice != null && p.compareAtPrice > p.price
      );
    }

    products = products.filter((p) => p.price >= min && p.price <= max);

    switch (sort) {
      case "price-asc":
        products = [...products].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        products = [...products].sort((a, b) => b.price - a.price);
        break;
      case "newest":
        products = [...products].sort((a, b) =>
          b.createdAt.localeCompare(a.createdAt)
        );
        break;
      default:
        products = [...products];
    }

    return products;
  }, [allProducts, searchParams]);

  /* La faceta de tallas se calcula sobre el catálogo completo, no sobre el
     resultado ya filtrado: si se calculara después, al elegir "S" desaparecería
     el resto de tallas y no se podría cambiar de opinión. */
  const availableSizes = React.useMemo(() => {
    const set = new Set<string>();
    allProducts.filter((p) => p.isActive).forEach((p) => p.sizes.forEach((s) => set.add(s)));
    return Array.from(set);
  }, [allProducts]);

  /* Cuenta de filtros activos: alimenta el badge del botón "Filtros" en móvil. */
  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (searchParams.get("q")) count++;
    if (searchParams.get("category")) count++;
    if (searchParams.get("size")) count++;
    if (searchParams.get("minPrice") || searchParams.get("maxPrice")) count++;
    if (searchParams.get("inStock") === "1") count++;
    if (searchParams.get("sale") === "1") count++;
    return count;
  }, [searchParams]);

  const pageSize = CONFIG.pagination.defaultLimit;
  const rawPage = Number(searchParams.get("page")) || 1;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(1, rawPage), totalPages);

  const visibleProducts = React.useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize]
  );

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-5">
        <PageTitle
          title="Catálogo Completo"
          description="Explora nuestra colección de piezas atemporales y esenciales."
        />
      </div>

      <div className="flex items-center justify-between lg:hidden">
        <button
          type="button"
          onClick={() => setShowFilters((prev) => !prev)}
          aria-expanded={showFilters}
          className="inline-flex items-center gap-2 px-4 h-10 rounded-button border border-border/70 bg-white text-sm font-medium text-brand-dark hover:bg-brand-light transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M6 12h12M10 20h4" />
          </svg>
          Filtros
          {activeFilterCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-dark px-1.5 text-[10px] font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
          {showFilters && (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button>
        <ProductSort />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/*
          En escritorio el panel es una columna normal del grid. En móvil se
          convierte en un drawer superpuesto: antes el `hidden`/`flex` inline
          empujaba la rejilla de productos hacia abajo y obligaba a hacer scroll
          para volver a ver los productos.
        */}
        <aside
          className={cn(
            "lg:flex lg:sticky lg:top-24 space-y-6",
            showFilters
              ? "fixed inset-0 z-50 flex flex-col bg-white lg:static lg:z-auto"
              : "hidden"
          )}
        >
          {showFilters && (
            <button
              type="button"
              aria-label="Cerrar filtros"
              onClick={() => setShowFilters(false)}
              className="absolute inset-0 -z-10 bg-neutral-900/40 lg:hidden"
            />
          )}

          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-4 h-14 border-b border-border/60 lg:hidden">
              <span className="text-sm font-semibold text-brand-dark">Filtros</span>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="p-2 -mr-2 text-brand-muted hover:text-brand-dark"
                aria-label="Cerrar filtros"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain p-4 pb-24 lg:static lg:overflow-visible lg:p-1 lg:pb-0">
              <ProductFilters categories={categoryItems} sizes={availableSizes} />
            </div>

            {showFilters && (
              <div className="absolute bottom-0 inset-x-0 p-3 border-t border-border/60 bg-white/95 backdrop-blur lg:hidden">
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="w-full h-11 rounded-button bg-brand-dark text-white text-sm font-semibold hover:bg-neutral-800 transition-colors"
                >
                  Ver {filtered.length} {filtered.length === 1 ? "prenda" : "prendas"}
                </button>
              </div>
            )}
          </div>
        </aside>

        <div className="lg:col-span-3 space-y-10">
          <div className="hidden lg:flex items-center justify-between text-sm text-brand-muted border-b border-border/40 pb-4">
            <p>
              Mostrando {filtered.length} {filtered.length === 1 ? "producto" : "productos"}
            </p>
            <ProductSort />
          </div>

          {loading && filtered.length === 0 ? (
            <CatalogSkeleton />
          ) : (
            <ProductGrid products={visibleProducts} />
          )}

          {totalPages > 1 && (
            <div className="pt-6 border-t border-border/60 flex justify-center">
              <ProductPagination currentPage={safePage} totalPages={totalPages} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <ProductCatalogPage />
    </Suspense>
  );
}