import { Skeleton } from "@/components/ui/Skeletons";

/** Checkout: resumen del pedido junto al formulario de envío y pago. */
export default function CheckoutLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-48" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-10 w-full rounded-button" />
              <Skeleton className="h-10 w-full rounded-button" />
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-full rounded-button" />
            <Skeleton className="h-10 w-full rounded-button" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-24 w-full rounded-button" />
          </div>
          <Skeleton className="h-12 w-full rounded-button" />
        </div>

        <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-border pt-6 lg:pl-8 lg:pt-0">
          <Skeleton className="h-4 w-28" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-16 w-14 rounded-card" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
          <div className="border-t border-border pt-4 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-5 w-1/3" />
          </div>
        </div>
      </div>
    </div>
  );
}
