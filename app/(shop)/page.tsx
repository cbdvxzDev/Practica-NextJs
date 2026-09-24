"use client";

import * as React from "react";
import { ProductGrid } from "@/compents/product/ProductGrid";
import { Button } from "@/compents/ui/Button";
import Link from "next/link";
import { useProductStore } from "@/store/product.store";

export default function HomePage() {
  const allProducts = useProductStore((state) => state.products);
  const loading = useProductStore((state) => state.loading);

  const products = React.useMemo(
    () => allProducts.filter((p) => p.isActive && p.stock > 0).slice(0, 4),
    [allProducts]
  );

  return (
    <div className="space-y-16 md:space-y-24">
      <section className="relative py-12 md:py-20 border-b border-border">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-4xl md:text-6xl font-normal tracking-tight text-brand-dark">
            Diseño consciente.
          </h1>
          <Link href="/products">
            <Button variant="primary" className="px-6 h-11 text-white">
              Explorar catálogo
            </Button>
          </Link>
        </div>
      </section>

      <section className="space-y-8">
        <h2 className="text-2xl font-medium tracking-tight">Productos Destacados</h2>
        {loading && products.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[3/4] rounded-lg bg-neutral-100" />
                <div className="h-3 bg-neutral-100 rounded w-24" />
                <div className="h-3 bg-neutral-100 rounded w-32" />
              </div>
            ))}
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </section>
    </div>
  );
}