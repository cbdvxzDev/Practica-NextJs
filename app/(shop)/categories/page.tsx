import type { Metadata } from "next";
import { PageTitle } from "../../components/common/PageTitle";
import { CategoryCard } from "../../components/common/CategoryCard";
import { getShopCategories, getShopProducts } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Categorías",
  description: "Todas las categorías de Esencial: ABRIGOS, denim, vestidos, camisetas y más.",
};

// ISR: el índice de categorías se sirve prerenderizado (ver app/(shop)/page.tsx).
export const revalidate = 60;

export default async function CategoriesPage() {
  const [categories, products] = await Promise.all([
    getShopCategories(),
    getShopProducts(),
  ]);
  const activeProducts = products.filter((p) => p.isActive);

  return (
    <div className="space-y-10">
      <div className="border-b border-border pb-5">
        <PageTitle
          title="Categorías"
          description="Explora nuestras colecciones organizadas por su propósito y materialidad."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {categories.map((category) => {
          const count = activeProducts.filter((p) => p.category.id === category.id).length;
          return (
            <CategoryCard
              key={category.id}
              slug={category.slug}
              name={category.name}
              description={category.description}
              imageUrl={category.imageUrl}
              count={count}
            />
          );
        })}
      </div>
    </div>
  );
}