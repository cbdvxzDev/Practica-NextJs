import { ProductCard } from "./ProductCard";

interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
  category: { name: string };
}

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((item) => (
        <ProductCard
          key={item.id}
          id={item.id}
          name={item.title}
          price={item.price}
          image={item.images[0]}
          category={item.category.name} // Pasamos solo el nombre (string)
        />
      ))}
    </div>
  );
}