import { PageTitle } from "../../components/common/PageTitle";
import { CategoryCard } from "../../components/common/CategoryCard";
import { readCollection } from "@/lib/db";
import type { DbCategory, DbProduct } from "@/types/db";

export default function CategoriesPage() {
  const categories = readCollection<DbCategory>("categories");
  const products = readCollection<DbProduct>("products");
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