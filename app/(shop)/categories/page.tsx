import Link from "next/link";
import { PageTitle } from "../../compents/common/PageTitle";
import { readCollection } from "@/lib/db";
import type { DbCategory, DbProduct } from "@/types/db";

export default function CategoriesPage() {
  const categories = readCollection<DbCategory>("categories");
  const products = readCollection<DbProduct>("products");

  return (
    <div className="space-y-10">
      <div className="border-b border-border pb-5">
        <PageTitle
          title="Categorías"
          description="Explora nuestras colecciones organizadas por su propósito y materialidad."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category) => {
          const count = products.filter((p) => p.isActive && p.category.id === category.id).length;
          return (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group block relative overflow-hidden bg-neutral-100 rounded-card border border-border/40 transition-all duration-300 hover:shadow-subtle"
            >
              <div className="aspect-[4/5] w-full relative bg-neutral-200 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={category.imageUrl ?? "https://placehold.co/600x800/e8e4df/6B7280?text=Categoria"}
                  alt={category.name}
                  className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60" />
              </div>

              <div className="p-6 bg-white border-t border-border/40">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-medium text-brand-dark group-hover:text-brand-accent transition-colors">
                    {category.name}
                  </h3>
                  <span className="text-xs font-medium text-brand-muted bg-brand-light px-2 py-1 rounded">
                    {count} piezas
                  </span>
                </div>
                {category.description && (
                  <p className="text-sm text-brand-muted line-clamp-2 leading-relaxed">
                    {category.description}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}