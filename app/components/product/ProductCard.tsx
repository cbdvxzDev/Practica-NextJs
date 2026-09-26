import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CONFIG } from "@/constants/config";

interface ProductCardProps {
  slug: string;
  name: string;
  price: number;
  image: string;
  category: string;
  className?: string;
}

export function ProductCard({ slug, name, price, image, category, className }: ProductCardProps) {
  return (
    <article className={cn("group relative flex flex-col overflow-hidden bg-white", className)}>
      <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-neutral-100 border border-neutral-200">
        <Image
          src={image || CONFIG.images.placeholder}
          alt={name}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="mt-3 flex flex-col space-y-1 px-1">
        <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
          {category}
        </span>
        <h3 className="text-sm font-medium text-neutral-900">
          <Link href={`/products/${slug}`}>
            <span className="absolute inset-0 z-10" />
            {name}
          </Link>
        </h3>
        <p className="text-sm font-semibold text-neutral-900 pt-0.5">
          ${price.toLocaleString("es-CO")}
        </p>
      </div>
    </article>
  );
}
