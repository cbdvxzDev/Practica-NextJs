import { ProductGrid } from "../../compents/product/ProductGrid";
import { ProductFilters } from "../../compents/filters/ProductFilters";
import { SortSelect } from "../../compents/filters/SortSelect";
import { Pagination } from "../../compents/ui/Pagination";
import { PageTitle } from "../../compents/common/PageTitle";
import { PRODUCTS, CATEGORIES } from "../../data/catalog";

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
export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // En Next.js 15+, searchParams es una Promesa que debe ser resuelta
  const filters = await searchParams;
  
  const currentPage = Number(filters.page) || 1;
  const filteredProducts = PRODUCTS.filter((product) => {
    const query = filters.q?.toLowerCase().trim();
    const matchesQuery = !query || `${product.title} ${product.department}`.toLowerCase().includes(query);
    const matchesCategory = !filters.category || product.category.slug === filters.category;
    const matchesMin = !filters.minPrice || product.price >= Number(filters.minPrice);
    const matchesMax = !filters.maxPrice || product.price <= Number(filters.maxPrice);
    return matchesQuery && matchesCategory && matchesMin && matchesMax;
  });
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (filters.sort === "price-asc") return a.price - b.price;
    if (filters.sort === "price-desc") return b.price - a.price;
    if (filters.sort === "popular") return b.reviews - a.reviews;
    if (filters.sort === "newest") return Number(b.id) - Number(a.id);
    return 0;
  });
  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / 12));

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
        <details className="group rounded-card border border-border/60 bg-white p-4 lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
            Filtros y búsqueda
            <span className="text-brand-muted transition-transform group-open:rotate-180">⌄</span>
          </summary>
          <div className="mt-5 space-y-6">
            <ProductFilters categories={CATEGORIES.map((category) => ({ id: category.slug, label: category.name }))} />
          </div>
        </details>
        
        {/* BARRA LATERAL DE FILTROS (Visible en desktop) */}
        <aside className="hidden lg:flex flex-col space-y-8 sticky top-24 p-1">
          <ProductFilters categories={CATEGORIES.map((category) => ({ id: category.slug, label: category.name }))} />
        </aside>

        {/* CONTENIDO PRINCIPAL: ORDENAMIENTO Y GRID */}
        <div className="lg:col-span-3 space-y-10">
          
          {/* Barra de utilidades superior (Conteo de productos y selector de orden) */}
          <div className="flex items-center justify-between text-sm text-brand-muted border-b border-border/40 pb-4">
            <p>{sortedProducts.length} productos encontrados</p>
            <SortSelect currentSort={filters.sort || "featured"} />
          </div>

          {/* Grid de Productos Reutilizable */}
          <ProductGrid products={sortedProducts} />

          {/* Componente de Paginación UI */}
          <div className="pt-6 border-t border-border/60 flex justify-center">
            <Pagination currentPage={currentPage} totalPages={totalPages} />
          </div>
        </div>

      </div>
    </div>
  );
}