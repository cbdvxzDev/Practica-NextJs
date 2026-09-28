import { Skeleton, SkeletonText } from "@/components/ui/Skeletons";

/** Ficha de producto: galería a la izquierda, ficha a la derecha. */
export default function ProductDetailLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-4 w-64" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
        <div className="space-y-3">
          <Skeleton className="aspect-[4/5] w-full rounded-card" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-card" />
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-4/5" />
          <Skeleton className="h-6 w-32" />
          <SkeletonText lines={4} />
          <div className="space-y-3 pt-2">
            <Skeleton className="h-4 w-16" />
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-12 rounded-button" />
              ))}
            </div>
          </div>
          <Skeleton className="h-12 w-full rounded-button" />
        </div>
      </div>
    </div>
  );
}
