import { ProductGrid } from "../../compents/product/ProductGrid";
import { ProductFilters } from "../../compents/filters/ProductFilters";
import { ProductSort } from "../../compents/filters/ProductSort";
import { ProductPagination } from "../../compents/filters/ProductPagination";
import { PageTitle } from "../../compents/common/PageTitle";

const CATEGORIES = [
  { id: "abrigo", label: "Prendas de Abrigo" },
  { id: "basicos", label: "Básicos" },
];

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
    q?: string;
  }>;
}

const MOCK_PRODUCTS = [
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
  {
    id: "2",
    slug: "camiseta-algodon-organico",
    title: "Camiseta Esencial Algodón Orgánico",
    price: 45000,
    compareAtPrice: 60000,
    images: ["/images/products/camiseta-1.jpg"],
    category: { id: "cat-2", name: "Básicos", slug: "basicos" },
    stock: 12,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const filters = await searchParams;

  const currentPage = Number(filters.page) || 1;
  const totalPages = 5;

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-5">
        <PageTitle
          title="Catálogo Completo"
          subtitle="Explora nuestra colección de piezas atemporales y esenciales."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <aside className="hidden lg:flex flex-col space-y-8 sticky top-24 p-1">
          <ProductFilters categories={CATEGORIES} />
        </aside>

        <div className="lg:col-span-3 space-y-10">
          <div className="flex items-center justify-between text-sm text-brand-muted border-b border-border/40 pb-4">
            <p>Mostrando {MOCK_PRODUCTS.length} productos</p>
            <ProductSort />
          </div>

          <ProductGrid products={MOCK_PRODUCTS} />

          <div className="pt-6 border-t border-border/60 flex justify-center">
            <ProductPagination currentPage={currentPage} totalPages={totalPages} />
          </div>
        </div>
      </div>
    </div>
  );
}