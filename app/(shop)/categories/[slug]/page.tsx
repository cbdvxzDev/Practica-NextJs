import { notFound } from "next/navigation";
import { ProductGrid } from "../../../compents/product/ProductGrid";
import { SortSelect } from "../../../compents/filters/SortSelect";
import { PageTitle } from "../../../compents/common/PageTitle";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    sort?: string;
  }>;
}

// Mock de categorías para validación de rutas y datos (Reemplazar por tu service)
const MOCK_CATEGORIES_DB: Record<string, any> = {
  "abrigo": {
    id: "cat-1",
    name: "Prendas de Abrigo",
    description: "Diseños estructurados y materiales térmicos de alta calidad para el día a día.",
  },
  "basicos": {
    id: "cat-2",
    name: "Básicos Esenciales",
    description: "Prendas atemporales de algodón premium cortadas para un ajuste perfecto.",
  },
};

// Mock de productos filtrados por categoría
const MOCK_PRODUCTS_BY_CATEGORY = [
  {
    id: "1",
    slug: "chaqueta-minimalista-lana",
    title: "Chaqueta Minimalista en Lana",
    price: 189000,
    images: ["/images/products/chaqueta-1.jpg"],
    category: { id: "cat-1", name: "Prendas de Abrigo", slug: "abrigo" },
    stock: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { sort } = await searchParams;
  
  const category = MOCK_CATEGORIES_DB[slug];

  // Si la categoría solicitada no existe en la base de datos, disparamos 404 nativo
  if (!category) {
    notFound();
  }

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
          Mostrando <span className="font-medium text-brand-dark">{MOCK_PRODUCTS_BY_CATEGORY.length}</span> piezas
        </p>
        <div className="flex items-center space-x-4">
          <span className="text-xs text-brand-muted">Ordenar por</span>
          <SortSelect />
        </div>
      </div>

      {/* GRID DE PRODUCTOS DE LA CATEGORÍA */}
      <section className="pt-2">
        <ProductGrid products={MOCK_PRODUCTS_BY_CATEGORY} />
      </section>
    </div>
  );
}