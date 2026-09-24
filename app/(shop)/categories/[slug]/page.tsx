import { notFound } from "next/navigation";
import { ProductGrid } from "../../../compents/product/ProductGrid";
import { ProductSort } from "../../../compents/filters/ProductSort";
import { PageTitle } from "../../../compents/common/PageTitle";
import { readCollection } from "@/lib/db";
import type { DbCategory, DbProduct } from "@/types/db";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    sort?: string;
  }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { sort } = await searchParams;

  const categories = readCollection<DbCategory>("categories");
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  let products = readCollection<DbProduct>("products").filter(
    (p) => p.isActive && p.category.slug === category.slug
  );

  if (sort === "price-asc") products = [...products].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") products = [...products].sort((a, b) => b.price - a.price);
  if (sort === "newest") products = [...products].sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));

  return (
    <div className="space-y-10">
      <div className="border-b border-border pb-6 max-w-3xl space-y-2">
        <span className="text-xs font-semibold tracking-widest uppercase text-brand-muted">
          Colección
        </span>
        <PageTitle title={category.name} description={category.description ?? "Explora esta colección."} />
      </div>

      <div className="flex items-center justify-between text-sm text-brand-muted bg-white border border-border/60 rounded-card px-6 py-3 shadow-subtle">
        <p>
          Mostrando <span className="font-medium text-brand-dark">{products.length}</span> piezas
        </p>
        <div className="flex items-center space-x-4">
          <span className="text-xs text-brand-muted">Ordenar por</span>
          <ProductSort />
        </div>
      </div>

      <section className="pt-2">
        <ProductGrid products={products} />
      </section>
    </div>
  );
}