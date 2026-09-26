import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "../../../components/product/ProductGallery";
import { ProductBuyBox } from "../../../components/product/ProductBuyBox";
import { ProductPrice } from "../../../components/product/ProductPrice";
import { ProductDetails } from "../../../components/product/ProductDetails";
import { ProductGrid } from "../../../components/product/ProductGrid";
import { SectionHeading } from "../../../components/common/SectionHeading";
import { readCollection } from "@/lib/db";
import { CONFIG } from "@/constants/config";
import type { DbProduct } from "@/types/db";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const products = readCollection<DbProduct>("products");
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return { title: "Producto no encontrado" };
  }

  return {
    title: product.title,
    description: product.description,
    openGraph: {
      title: `${product.title} · ${CONFIG.appName}`,
      description: product.description,
      images: product.images.slice(0, 1),
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const products = readCollection<DbProduct>("products");
  const product = products.find((p) => p.slug === slug);

  if (!product || !product.isActive) {
    notFound();
  }

  // Relacionados: primero los de la misma categoría y, si faltan, los más recientes.
  const related = products
    .filter((p) => p.isActive && p.id !== product.id && p.stock > 0)
    .sort((a, b) => {
      const sameCategoryA = a.category.id === product.category.id ? 0 : 1;
      const sameCategoryB = b.category.id === product.category.id ? 0 : 1;
      if (sameCategoryA !== sameCategoryB) return sameCategoryA - sameCategoryB;
      return b.createdAt.localeCompare(a.createdAt);
    })
    .slice(0, 4);

  return (
    <>
      <article className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 lg:gap-x-12 gap-y-10 lg:gap-y-0 items-start">
        <section className="lg:col-span-7 w-full">
          <ProductGallery images={product.images} name={product.title} />
        </section>

        <section className="lg:col-span-5 flex flex-col space-y-8 lg:sticky lg:top-24">
          <div className="space-y-4 border-b border-border pb-6">
            <Link
              href={`/categories/${product.category.slug}`}
              className="inline-block text-xs font-semibold tracking-widest uppercase text-brand-muted transition-colors hover:text-brand-accent"
            >
              {product.category.name}
            </Link>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-brand-dark">
              {product.title}
            </h1>
            <ProductPrice price={product.price} originalPrice={product.compareAtPrice} />
          </div>

          <p className="text-sm text-brand-muted leading-relaxed">
            {product.description}
          </p>

          <div className="pt-2">
            <ProductBuyBox
              id={product.id}
              slug={product.slug}
              name={product.title}
              price={product.price}
              image={product.images[0]}
              stock={product.stock}
              sizes={product.sizes}
            />
          </div>
        </section>
      </article>

      <section className="mt-14 border-t border-border pt-10">
        <ProductDetails product={product} />
      </section>

      {related.length > 0 && (
        <section className="mt-16 space-y-6">
          <SectionHeading
            title="También te puede gustar"
            description="Piezas de la misma colección que combinan bien con esta referencia."
            action={{ href: `/categories/${product.category.slug}`, label: "Ver la categoría" }}
          />
          <ProductGrid products={related} />
        </section>
      )}
    </>
  );
}
