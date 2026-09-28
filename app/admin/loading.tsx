import {
  Skeleton,
  SkeletonPageHeader,
  SkeletonTable,
} from "@/components/ui/Skeletons";

/**
 * Esqueleto del panel. Sin este archivo, navegar dentro de /admin no mostraba
 * ninguna señal de carga: el layout se quedaba vacío hasta que la página
 * llegaba.
 */
export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <SkeletonPageHeader />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-border/60 rounded-card p-4 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-16" />
          </div>
        ))}
      </div>

      <SkeletonTable />
    </div>
  );
}
