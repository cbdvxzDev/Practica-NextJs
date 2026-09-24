import { ProductCard } from "./ProductCard";

interface Product {
  id: string;
  slug: string;
  title: string;
  price: number;
  images: string[];
  category: { name: string };
}

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="border border-dashed border-border rounded-card p-12 text-center text-sm text-brand-muted">
        No hay productos disponibles en este momento.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((item) => (
        <ProductCard
          key={item.id}
          slug={item.slug}
          name={item.title}
          price={item.price}
          image={item.images[0]}
          category={item.category.name}
        />
      ))}
    </div>
  );
}