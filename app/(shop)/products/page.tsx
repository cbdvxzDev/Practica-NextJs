"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductGrid } from "../../compents/product/ProductGrid";
import { ProductFilters } from "../../compents/filters/ProductFilters";
import { ProductSort } from "../../compents/filters/ProductSort";
import { ProductPagination } from "../../compents/filters/ProductPagination";
import { PageTitle } from "../../compents/common/PageTitle";
import { useProductStore } from "../../store/product.store";
import { useCategoryStore } from "../../store/category.store";
import { CONFIG } from "../../constants/config";

const FALLBACK_CATEGORIES = [
  { id: "abrigo", label: "Prendas de Abrigo" },
  { id: "basicos", label: "Básicos" },
  { id: "camisas", label: "Camisas" },
  { id: "pantalones", label: "Pantalones" },
];

function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
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

    let products = allProducts.filter((p) => p.isActive && p.stock > 0);

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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <aside className="hidden lg:flex flex-col space-y-8 sticky top-24 p-1">
          <ProductFilters categories={categoryItems} />
        </aside>

        <div className="lg:col-span-3 space-y-10">
          <div className="flex items-center justify-between text-sm text-brand-muted border-b border-border/40 pb-4">
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