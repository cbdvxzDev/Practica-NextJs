import Link from "next/link";
import { PageTitle } from "../../compents/common/PageTitle";
import { ProductGrid } from "../../compents/product/ProductGrid";
import { Button } from "../../compents/ui/Button";

// Datos mockeados de la lista de deseos (Zustand mediante useWishlist proveerá esto en el cliente)
const MOCK_WISHLIST_PRODUCTS = [
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

export default async function WishlistPage() {
  const isWishlistEmpty = MOCK_WISHLIST_PRODUCTS.length === 0;

  // ESTADO DE LISTA DE DESEOS VACÍA
  if (isWishlistEmpty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6 animate-fadeIn">
        <div className="space-y-2">
          <h1 className="text-2xl font-medium tracking-tight">Tu lista de deseos está vacía</h1>
          <p className="text-sm text-brand-muted max-w-sm mx-auto">
            Guarda los artículos que te encantan para revisarlos más tarde o compartirlos con tus amigos.
          </p>
        </div>
        <Link href="/products">
          <Button variant="outline" className="h-11 px-6">
            Explorar productos
          </Button>
        </Link>
      </div>
    );
  }

  // ESTADO CON ARTÍCULOS GUARDADOS
  return (
    <div className="space-y-10">
      {/* Encabezado limpio */}
      <div className="border-b border-border pb-5">
        <PageTitle 
          title="Tu Lista de Deseos" 
          subtitle={`Tienes ${MOCK_WISHLIST_PRODUCTS.length} piezas guardadas en tu colección personal.`} 
        />
      </div>

      {/* Grid de Productos Reutilizable */}
      <section className="pt-2">
        {/* Pasamos una propiedad condicional o bandera si necesitas que ProductGrid cambie el comportamiento del botón de acción en modo wishlist */}
        <ProductGrid products={MOCK_WISHLIST_PRODUCTS} isWishlistView={true} />
      </section>
    </div>
  );
}