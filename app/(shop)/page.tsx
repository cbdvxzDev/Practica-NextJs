import { ProductGrid } from "../compents/product/ProductGrid";
import { Button } from "../compents/ui/Button";
import Link from "next/link";

const FEATURED_PRODUCTS = [
  {
    id: "1",
    title: "Chaqueta Minimalista en Lana",
    price: 189000,
    images: ["/images/products/chaqueta-1.jpg"],
    category: { name: "Prendas de Abrigo" },
  },
  {
    id: "2",
    title: "Camiseta Esencial Algodón Orgánico",
    price: 45000,
    images: ["/images/products/camiseta-1.jpg"],
    category: { name: "Básicos" },
  },
];

export default async function HomePage() {
  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 border-b border-border">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-4xl md:text-6xl font-normal tracking-tight text-brand-dark">
            Diseño consciente.
          </h1>
          <Link href="/products">
            <Button variant="primary" className="px-6 h-11 text-black">
              Explorar catálogo
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="space-y-8">
        <h2 className="text-2xl font-medium tracking-tight">Productos Destacados</h2>
        {/* Asegúrate de pasar la prop 'products' correctamente */}
        <ProductGrid products={FEATURED_PRODUCTS} />
      </section>
    </div>
  );
}