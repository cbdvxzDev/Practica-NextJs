import { Skeleton, SkeletonTable } from "@/components/ui/Skeletons";

/** Detalle de un pedido en el perfil del cliente. */
export default function OrderDetailLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-56" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border border-border/60 rounded-card p-4 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>

      <SkeletonTable rows={3} />
    </div>
  );
}
