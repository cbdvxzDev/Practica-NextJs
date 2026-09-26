import Image from "next/image";
import Link from "next/link";
import { CONFIG } from "@/constants/config";

export interface CategoryCardProps {
  slug: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  count: number;
}

export function CategoryCard({ slug, name, description, imageUrl, count }: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${slug}`}
      className="group block relative overflow-hidden bg-neutral-100 rounded-card border border-border/40 transition-all duration-300 hover:shadow-subtle"
    >
      <div className="aspect-[4/5] w-full relative bg-neutral-200 overflow-hidden">
        <Image
          src={imageUrl || CONFIG.images.placeholder}
          alt={name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60" />
      </div>

      <div className="p-5 sm:p-6 bg-white border-t border-border/40">
        <div className="flex items-center justify-between mb-1 gap-2">
          <h3 className="text-base sm:text-lg font-medium text-brand-dark group-hover:text-brand-accent transition-colors">
            {name}
          </h3>
          <span className="text-xs font-medium text-brand-muted bg-brand-light px-2 py-1 rounded">
            {count} piezas
          </span>
        </div>
        {description && (
          <p className="text-sm text-brand-muted line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </Link>
  );
}