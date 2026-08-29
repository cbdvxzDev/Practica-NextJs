import { ProductGrid } from "../compents/product/ProductGrid";
import { Button } from "../compents/ui/Button";
import { NewsletterForm } from "../compents/common/NewsletterForm";
import Link from "next/link";
import { CATEGORIES, FEATURED_PRODUCTS, PRODUCTS } from "../data/catalog";

export default async function HomePage() {
  // Más vendidos: ordenados por número de reseñas (mayor volumen de compra histórico).
  const bestSellers = [...PRODUCTS].sort((a, b) => b.reviews - a.reviews).slice(0, 8);
  // Recién llegados: los últimos productos agregados al catálogo (mayor id).
  const newArrivals = [...PRODUCTS].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 8);

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-card bg-brand-dark px-6 py-16 text-white sm:px-10 md:py-24">
        <div className="relative z-10 max-w-2xl space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-accent">
            Todo lo que buscas, en un solo lugar
          </p>
          <h1 className="text-4xl font-normal tracking-tight sm:text-5xl md:text-6xl">
            Descubre tus marcas favoritas.
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-white/70 sm:text-base">
            Moda, belleza, accesorios y tecnología con ofertas especiales y entregas rápidas a todo Colombia.
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
        <p>Envíos gratis desde $150.000</p>
        <p>Compra segura y protegida</p>
        <p>Devoluciones fáciles</p>
      </section>

      <section className="space-y-7">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-muted">Compra por categoría</p>
          <h2 className="text-2xl font-medium tracking-tight">Encuentra tu próximo favorito</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {CATEGORIES.map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`} className="group relative aspect-[4/5] overflow-hidden rounded-card bg-neutral-200">
              <img src={category.image} alt={category.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
              <span className="absolute bottom-4 left-4 text-sm font-semibold text-white sm:text-base">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="space-y-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-muted">Selección editorial</p>
            <h2 className="text-2xl font-medium tracking-tight">Ofertas para ti</h2>
          </div>
          <Link href="/products" className="text-xs font-semibold uppercase tracking-wider underline underline-offset-4">
            Ver catálogo
          </Link>
        </div>
        {/* Asegúrate de pasar la prop 'products' correctamente */}
        <ProductGrid products={FEATURED_PRODUCTS} />
      </section>

      {/* Más vendidos */}
      <section className="space-y-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-muted">Lo más popular</p>
            <h2 className="text-2xl font-medium tracking-tight">Más vendidos</h2>
          </div>
          <Link href="/products?sort=popular" className="text-xs font-semibold uppercase tracking-wider underline underline-offset-4">
            Ver todos
          </Link>
        </div>
        <ProductGrid products={bestSellers} />
      </section>

      {/* Recién llegados */}
      <section className="space-y-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-muted">Novedades</p>
            <h2 className="text-2xl font-medium tracking-tight">Recién llegados</h2>
          </div>
          <Link href="/products?sort=newest" className="text-xs font-semibold uppercase tracking-wider underline underline-offset-4">
            Ver todos
          </Link>
        </div>
        <ProductGrid products={newArrivals} />
      </section>

      {/* Newsletter */}
      <section className="rounded-card border border-border/60 bg-neutral-50 px-6 py-12 text-center sm:px-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-muted">Mantente al día</p>
        <h2 className="text-2xl font-medium tracking-tight">Suscríbete y recibe ofertas exclusivas</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-brand-muted">
          Sé el primero en enterarte de nuevos lanzamientos, descuentos especiales y contenido solo para suscriptores.
        </p>
        <NewsletterForm />
      </section>
    </div>
  );
}