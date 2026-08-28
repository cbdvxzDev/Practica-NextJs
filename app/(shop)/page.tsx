import { ProductGrid } from "../compents/product/ProductGrid";
import { Button } from "../compents/ui/Button";
import Link from "next/link";

const FEATURED_PRODUCTS = [
  {
    id: "1",
    slug: "chaqueta-minimalista-lana",
    title: "Chaqueta Minimalista en Lana",
    price: 189000,
    images: ["/images/products/chaqueta-1.jpg"],
    category: { name: "Prendas de Abrigo" },
  },
  {
    id: "2",
    slug: "camiseta-algodon-organico",
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
      <section className="relative overflow-hidden rounded-card bg-brand-dark px-6 py-16 text-white sm:px-10 md:py-24">
        <div className="relative z-10 max-w-2xl space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-accent">
            Nueva colección · 2025
          </p>
          <h1 className="text-4xl font-normal tracking-tight sm:text-5xl md:text-6xl">
            Diseño consciente para todos los días.
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-white/70 sm:text-base">
            Piezas esenciales, materiales responsables y una estética que permanece más allá de la temporada.
          </p>
          <Link href="/products" className="inline-flex">
            <Button variant="secondary" size="lg" className="bg-white text-brand-dark hover:bg-brand-light">
              Explorar catálogo
            </Button>
          </Link>
        </div>
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10 sm:h-96 sm:w-96" aria-hidden="true" />
        <div className="absolute -bottom-40 right-12 h-80 w-80 rounded-full border border-brand-accent/20" aria-hidden="true" />
      </section>

      <section className="grid grid-cols-1 gap-4 border-y border-border py-6 text-center text-xs uppercase tracking-wider text-brand-muted sm:grid-cols-3">
        <p>Envíos a todo Colombia</p>
        <p>Compra segura y protegida</p>
        <p>Materiales seleccionados</p>
      </section>

      {/* Featured Products */}
      <section className="space-y-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-muted">Selección editorial</p>
            <h2 className="text-2xl font-medium tracking-tight">Productos destacados</h2>
          </div>
          <Link href="/products" className="text-xs font-semibold uppercase tracking-wider underline underline-offset-4">
            Ver catálogo
          </Link>
        </div>
        {/* Asegúrate de pasar la prop 'products' correctamente */}
        <ProductGrid products={FEATURED_PRODUCTS} />
      </section>
    </div>
  );
}