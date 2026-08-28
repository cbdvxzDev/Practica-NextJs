import { notFound } from "next/navigation";
import { ProductGallery } from "../../../compents/product/ProductGallery";
import { ProductBuyBox } from "../../../compents/product/ProductBuyBox";
import { ProductPrice } from "../../../compents/product/ProductPrice";
import { PRODUCTS } from "../../../data/catalog";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = PRODUCTS.find((item) => item.slug === slug);

  if (!product || !product.isActive) {
    notFound();
  }

  return (
    <article className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-10 items-start">
      
      <section className="lg:col-span-7 w-full">
        <ProductGallery images={product.images} name={product.title} />
      </section>

      <section className="lg:col-span-5 flex flex-col space-y-8 sticky top-24">
        
        <div className="space-y-4 border-b border-border pb-6">
          <span className="text-xs font-semibold tracking-widest uppercase text-brand-muted">
            {product.category.name}
          </span>
          <h1 className="text-3xl font-normal tracking-tight text-brand-dark sm:text-4xl">
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
          />
        </div>

      </section>

    </article>
  );
}