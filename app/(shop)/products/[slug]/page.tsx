import { notFound } from "next/navigation";
import { ProductGallery } from "../../../compents/product/ProductGallery";
import { ProductBuyBox } from "../../../compents/product/ProductBuyBox";
import { ProductPrice } from "../../../compents/product/ProductPrice";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface ProductDetail {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: { id: string; name: string; slug: string };
  stock: number;
  isActive: boolean;
}

const MOCK_PRODUCTS_DB: Record<string, ProductDetail> = {
  "chaqueta-minimalista-lana": {
    id: "1",
    slug: "chaqueta-minimalista-lana",
    title: "Chaqueta Minimalista en Lana",
    description: "Confeccionada con lana de origen responsable, esta chaqueta presenta un corte estructurado contemporáneo, cierre frontal oculto y bolsillos laterales discretos. Una pieza de transición ideal diseñada para durar temporadas completas.",
    price: 189000,
    images: [
      "/images/products/chaqueta-1.jpg",
      "/images/products/chaqueta-1-back.jpg",
      "/images/products/chaqueta-1-detail.jpg"
    ],
    category: { id: "cat-1", name: "Prendas de Abrigo", slug: "abrigo" },
    stock: 5,
    isActive: true,
  },
  "camiseta-algodon-organico": {
    id: "2",
    slug: "camiseta-algodon-organico",
    title: "Camiseta Esencial Algodón Orgánico",
    description: "Una base versátil confeccionada en algodón orgánico suave y resistente. Su silueta relajada y acabados limpios la convierten en una pieza esencial para combinar todos los días.",
    price: 45000,
    compareAtPrice: 60000,
    images: ["/images/products/camiseta-1.jpg"],
    category: { id: "cat-2", name: "Básicos", slug: "basicos" },
    stock: 12,
    isActive: true,
  },
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = MOCK_PRODUCTS_DB[slug];

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