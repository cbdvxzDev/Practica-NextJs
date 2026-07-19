import Link from "next/link";
import { cn } from "../../lib/utils";

export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  className?: string;
}

export function ProductCard({ id, name, price, image, category, className }: ProductCardProps) {
  return (
    <article className={cn("group relative flex flex-col overflow-hidden bg-white", className)}>
      <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-neutral-100 border border-border/30">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="mt-3 flex flex-col space-y-1 px-1">
        <span className="text-[11px] font-medium uppercase tracking-wider text-brand-muted">
          {category}
        </span>
        <h3 className="text-sm font-medium text-brand-dark tracking-tight">
          <Link href={`/product/${id}`}>
            <span className="absolute inset-0 z-10" />
            {name}
          </Link>
        </h3>
        <p className="text-sm font-semibold text-brand-dark pt-0.5">
          ${price.toLocaleString("es-CO")}
        </p>
      </div>
    </article>
  );
}