import { notFound } from "next/navigation";
import { ProductGrid } from "../../../compents/product/ProductGrid";
import { SortSelect } from "../../../compents/filters/SortSelect";
import { PageTitle } from "../../../compents/common/PageTitle";
import { CATEGORIES, PRODUCTS } from "../../../data/catalog";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    sort?: string;
  }>;
}

// Mock de categorías para validación de rutas y datos (Reemplazar por tu service)
export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { sort } = await searchParams;
  
  const category = CATEGORIES.find((item) => item.slug === slug);

  // Si la categoría solicitada no existe en la base de datos, disparamos 404 nativo
  if (!category) {
    notFound();
  }

  const categoryProducts = PRODUCTS
    .filter((product) => product.category.slug === slug)
    .sort((a, b) => sort === "price_asc" ? a.price - b.price : sort === "price_desc" ? b.price - a.price : 0);

  return (
    <div className="space-y-10">
      {/* CABECERA EDITORIAL DE LA CATEGORÍA */}
      <div className="border-b border-border pb-6 max-w-3xl space-y-2">
        <span className="text-xs font-semibold tracking-widest uppercase text-brand-muted">
          Colección
        </span>
        <PageTitle 
          title={category.name} 
          subtitle={category.description} 
        />
      </div>

      {/* CONTROL DE FILTROS COMPACTO HORIZONTAL */}
      <div className="flex items-center justify-between text-sm text-brand-muted bg-white border border-border/60 rounded-card px-6 py-3 shadow-subtle">
        <p>
          Mostrando <span className="font-medium text-brand-dark">{categoryProducts.length}</span> productos
        </p>
        <div className="flex items-center space-x-4">
          <span className="text-xs text-brand-muted">Ordenar por</span>
          <SortSelect currentSort={sort || "featured"} />
        </div>
      </div>

      {/* GRID DE PRODUCTOS DE LA CATEGORÍA */}
      <section className="pt-2">
        <ProductGrid products={categoryProducts} />
      </section>
    </div>
  );
}