"use client";

import * as React from "react";
import { PageTitle } from "@/compents/common/PageTitle";
import { InventoryTable, type InventoryItem } from "@/compents/admin/InventoryTable";
import { Button } from "@/compents/ui/Button";
import { PRODUCTS } from "@/data/catalog";
import { useInventoryStore } from "@/store/inventory.store";

const MIN_STOCK_THRESHOLD = 5;

export default function AdminInventoryPage() {
  const stockOverrides = useInventoryStore((state) => state.stockOverrides);
  const setStock = useInventoryStore((state) => state.setStock);
  const [hydrated, setHydrated] = React.useState(false);
  const [lastUpdatedMap, setLastUpdatedMap] = React.useState<Record<string, string>>({});

  React.useEffect(() => setHydrated(true), []);

  const inventory: InventoryItem[] = React.useMemo(
    () =>
      PRODUCTS.map((product) => ({
        id: product.id,
        name: product.title,
        sku: `SKU-${product.id.padStart(3, "0")}`,
        stock: stockOverrides[product.id] ?? product.stock,
        minStockThreshold: MIN_STOCK_THRESHOLD,
        lastUpdated: lastUpdatedMap[product.id] ?? "—",
      })),
    [stockOverrides, lastUpdatedMap]
  );

  const updateStock = (id: string, newStock: number) => {
    setStock(id, newStock);
    setLastUpdatedMap((prev) => ({ ...prev, [id]: "Ahora" }));
  };

  const lowStockCount = inventory.filter((item) => item.stock > 0 && item.stock <= item.minStockThreshold).length;
  const outOfStockCount = inventory.filter((item) => item.stock === 0).length;

  return (
    <div className="space-y-8">
      {/* ENCABEZADO CON ACCIONES OPERATIVAS */}
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

      {/* TARJETAS DE RESUMEN DE INVENTARIO RÁPIDO */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-white border border-border/60 rounded-card p-4 flex items-center justify-between shadow-subtle">
          <span className="text-xs font-medium text-brand-muted uppercase">Total Ítems Únicos</span>
          <span className="text-xl font-semibold text-brand-dark">{hydrated ? inventory.length : "—"}</span>
        </div>
        <div className="bg-white border border-border/60 rounded-card p-4 flex items-center justify-between shadow-subtle">
          <span className="text-xs font-medium text-brand-muted uppercase">Bajo Stock (&lt; 6)</span>
          <span className="text-xl font-semibold text-neutral-700">{hydrated ? lowStockCount : "—"}</span>
        </div>
        <div className="bg-white border border-border/60 rounded-card p-4 flex items-center justify-between shadow-subtle">
          <span className="text-xs font-medium text-brand-muted uppercase">Agotados</span>
          <span className="text-xl font-semibold text-brand-dark">{hydrated ? outOfStockCount : "—"}</span>
        </div>
      </section>

      {/* CONTENEDOR DE LA TABLA OPERATIVA */}
      <section className="bg-white border border-border/60 rounded-card shadow-subtle overflow-hidden">
        {/* Delegamos el renderizado interactivo a tu componente atómico InventoryTable */}
        <InventoryTable
          items={hydrated ? inventory : []}
          onUpdateStock={updateStock}
        />
      </section>
    </div>
  );
}
