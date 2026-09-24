"use client";

import * as React from "react";
import { notFound, useParams } from "next/navigation";
import { ProductGallery } from "../../../compents/product/ProductGallery";
import { ProductBuyBox } from "../../../compents/product/ProductBuyBox";
import { ProductPrice } from "../../../compents/product/ProductPrice";
import { ProductService } from "../../../services/product.service";
import { useProductStore } from "../../../store/product.store";
import type { Product } from "../../../services/product.service";

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;

  const storeProduct = useProductStore((state) => state.products.find((p) => p.slug === slug));
  const fetchProducts = useProductStore((state) => state.fetchProducts);

  const [product, setProduct] = React.useState<Product | null>(storeProduct ?? null);
  const [missing, setMissing] = React.useState(false);

  React.useEffect(() => {
    if (storeProduct) return;

    let cancelled = false;
    const load = async () => {
      try {
        const fetched = await ProductService.getBySlug(slug);
        if (!cancelled) setProduct(fetched);
      } catch {
        if (!cancelled) {
          setProduct(null);
          setMissing(true);
        }
      }
    };

    load();
    // Por si el hidratado global aún no termina, reintentamos refrescar el catálogo.
    fetchProducts().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [slug, storeProduct, fetchProducts]);

  const current = storeProduct ?? product;

  if (!current) {
    if (missing) notFound();

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-10 animate-pulse">
        <div className="lg:col-span-7 h-[420px] bg-neutral-100 rounded-2xl" />
        <div className="lg:col-span-5 space-y-4">
          <div className="h-4 bg-neutral-100 rounded w-40" />
          <div className="h-8 bg-neutral-100 rounded w-64" />
          <div className="h-4 bg-neutral-100 rounded w-full" />
          <div className="h-4 bg-neutral-100 rounded w-3/4" />
          <div className="h-12 bg-neutral-100 rounded-xl mt-6" />
        </div>
      </div>
    );
  }

  if (!current.isActive) {
    notFound();
  }

  return (
    <article className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-10 items-start">
      <section className="lg:col-span-7 w-full">
        <ProductGallery images={current.images} name={current.title} />
      </section>

      <section className="lg:col-span-5 flex flex-col space-y-8 sticky top-24">
        <div className="space-y-4 border-b border-border pb-6">
          <span className="text-xs font-semibold tracking-widest uppercase text-brand-muted">
            {current.category.name}
          </span>
          <h1 className="text-3xl font-normal tracking-tight text-brand-dark sm:text-4xl">
            {current.title}
          </h1>
          <ProductPrice price={current.price} originalPrice={current.compareAtPrice} />
        </div>

        <p className="text-sm text-brand-muted leading-relaxed">
          {current.description}
        </p>

        <div className="pt-2">
          <ProductBuyBox
            id={current.id}
            slug={current.slug}
            name={current.title}
            price={current.price}
            image={current.images[0]}
            stock={current.stock}
          />
        </div>
      </section>
    </article>
  );
}