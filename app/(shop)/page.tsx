import type { Metadata } from "next";
import { ProductGrid } from "@/components/product/ProductGrid";
import { CategoryCard } from "@/components/common/CategoryCard";
import { SectionHeading } from "@/components/common/SectionHeading";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustBar } from "@/components/home/TrustBar";
import { EditorialSection } from "@/components/home/EditorialSection";
import { LookbookStrip } from "@/components/home/LookbookStrip";
import { Testimonials } from "@/components/home/Testimonials";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { getShopCategories, getShopProducts } from "@/lib/server-api";

export const metadata: Metadata = {
  // El template de app/layout.tsx antepone la marca: "Esencial - Ropa
  // atemporal para el día a día". Aquí va solo la parte propia.
  title: "Ropa atemporal para el día a día",
  description:
    "48 piezas de ropa, denim, calzado y accesorios: algodón orgánico, lana merina, lino y cuero curtido. Envíos a toda Colombia.",
};

// ISR: sin esto la portada queda congelada con los datos del build y un
// producto dado de alta desde el panel no aparece hasta el siguiente deploy.
// En paralelo, las mutaciones de la API llaman a revalidateShop().
export const revalidate = 60;

export default async function HomePage() {
  // Catálogo vía capa server-side: con backend Spring remoto hace fetch con
  // ISR; sin él, lee la mini base local (mismo comportamiento que siempre).
  const [allProducts, categories] = await Promise.all([
    getShopProducts(),
    getShopCategories(),
  ]);
  const products = allProducts.filter((p) => p.isActive);

  const newest = [...products]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);

  const onSale = products
    .filter((p) => p.compareAtPrice && p.stock > 0)
    .sort(
      (a, b) =>
        (b.compareAtPrice ?? b.price) / b.price - (a.compareAtPrice ?? a.price) / a.price
    )
    .slice(0, 4);

  return (
    <div className="space-y-16 md:space-y-24">
      <HeroSection productCount={products.length} />

      <TrustBar />

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Colecciones"
          title="Explora por categoría"
          description="Nueve colecciones pensadas para combinarse entre sí y no depender de una sola prenda."
          action={{ href: "/categories", label: "Ver todas" }}
        />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((category) => {
            const count = products.filter((p) => p.category.id === category.id).length;
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
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Recién llegado"
          title="Novedades de la temporada"
          description="Las últimas piezas que entraron al catálogo, recién salidas del taller."
          action={{ href: "/products?sort=newest", label: "Ver novedades" }}
        />
        <ProductGrid products={newest} />
      </section>

      {onSale.length > 0 && (
        <section className="space-y-8">
          <SectionHeading
            eyebrow="Precio especial"
            title="Piezas en descuento"
            description="Descuentos reales sobre prendas que ya llevan dos o tres temporadas y siguen disponibles."
            action={{ href: "/products", label: "Ir al catálogo" }}
          />
          <ProductGrid products={onSale} />
        </section>
      )}

      <EditorialSection />

      <LookbookStrip />

      <Testimonials />

      <NewsletterForm />
    </div>
  );
}
