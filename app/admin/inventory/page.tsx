"use client";

import * as React from "react";
import { PageTitle } from "@/components/common/PageTitle";
import { InventoryTable, type InventoryItem } from "@/components/admin/InventoryTable";
import { Button } from "@/components/ui/Button";
import { useProductStore } from "@/store/product.store";

const LOW_STOCK_THRESHOLD = 6;

export default function AdminInventoryPage() {
  const products = useProductStore((state) => state.products);
  const loading = useProductStore((state) => state.loading);
  const updateStock = useProductStore((state) => state.updateStock);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => setIsMounted(true), []);

  const items: InventoryItem[] = React.useMemo(
    () =>
      products.map((p) => ({
        id: p.id,
        name: p.title,
        sku: p.sku,
        stock: p.stock,
        minStockThreshold: LOW_STOCK_THRESHOLD,
        lastUpdated: new Date(p.updatedAt).toLocaleDateString("es-CO", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      })),
    [products]
  );

  const outOfStock = products.filter((p) => p.stock === 0).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD).length;

  const handleUpdateStock = async (id: string, newStock: number) => {
    try {
      await updateStock(id, newStock);
    } catch {
      // El store ya captura errores; aquí simplemente no mutamos el estado.
    }
  };

  const summary = [
    { label: "Total Ítems Únicos", value: products.length },
    { label: `Bajo Stock (< ${LOW_STOCK_THRESHOLD})`, value: lowStock },
    { label: "Agotados", value: outOfStock },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <PageTitle
          title="Control de Inventario"
          description="Monitoreo físico de existencias, códigos SKU y alertas de reabastecimiento crítico."
        />
        <div className="flex items-center space-x-3">
          <Button variant="secondary" className="h-9 text-xs">
            Imprimir etiquetas SKU
          </Button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {summary.map((s) => (
          <div key={s.label} className="bg-white border border-border/60 rounded-card p-4 flex items-center justify-between shadow-subtle">
            <span className="text-xs font-medium text-brand-muted uppercase">{s.label}</span>
            <span className="text-xl font-semibold text-brand-dark">{s.value}</span>
          </div>
        ))}
      </section>

      <section className="bg-white border border-border/60 rounded-card shadow-subtle overflow-hidden">
        {!isMounted || (loading && items.length === 0) ? (
          <div className="p-10 space-y-3 animate-pulse">
            <div className="h-3 bg-neutral-100 rounded w-40" />
            <div className="h-8 bg-neutral-100 rounded w-full" />
            <div className="h-8 bg-neutral-100 rounded w-full" />
            <div className="h-8 bg-neutral-100 rounded w-full" />
          </div>
        ) : (
          <InventoryTable items={items} onUpdateStock={handleUpdateStock} />
        )}
      </section>
    </div>
  );
}