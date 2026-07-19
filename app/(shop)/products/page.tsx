import { ProductGrid } from "../../compents/product/ProductGrid";
import { SearchBar } from "../../compents/filters/SearchBar";
import { CategoryFilters } from "../../compents/filters/CategoryFilter";
import { PriceFilter } from "../../compents/filters/PriceFilter";
import { SortSelect } from "../../compents/filters/SortSelect";
import { Pagination } from "../../compents/ui/Pagination";
import { PageTitle } from "../../compents/common/PageTitle";

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

// Datos mockeados respetando el tipado estricto (reemplazar por llamadas a tu service)
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
  // En Next.js 15+, searchParams es una Promesa que debe ser resuelta
  const filters = await searchParams;
  
  const currentPage = Number(filters.page) || 1;
  const totalPages = 5; // Simulado para la paginación

  return (
    <div className="space-y-8">
      {/* Encabezado de Página Limpio */}
      <div className="border-b border-border pb-5">
        <PageTitle 
          title="Catálogo Completo" 
          subtitle="Explora nuestra colección de piezas atemporales y esenciales." 
        />
      </div>

      {/* Layout de Catálogo: Filtros + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* BARRA LATERAL DE FILTROS (Visible en desktop) */}
        <aside className="hidden lg:flex flex-col space-y-8 sticky top-24 p-1">
          <SearchBar />
          <hr className="border-border/60" />
          <CategoryFilters />
          <hr className="border-border/60" />
          <PriceFilter />
        </aside>

        {/* CONTENIDO PRINCIPAL: ORDENAMIENTO Y GRID */}
        <div className="lg:col-span-3 space-y-10">
          
          {/* Barra de utilidades superior (Conteo de productos y selector de orden) */}
          <div className="flex items-center justify-between text-sm text-brand-muted border-b border-border/40 pb-4">
            <p>Mostrando {MOCK_PRODUCTS.length} productos</p>
            <SortSelect />
          </div>

          {/* Grid de Productos Reutilizable */}
          <ProductGrid products={MOCK_PRODUCTS} />

          {/* Componente de Paginación UI */}
          <div className="pt-6 border-t border-border/60 flex justify-center">
            <Pagination currentPage={currentPage} totalPages={totalPages} />
          </div>
        </div>

      </div>
    </div>
  );
}