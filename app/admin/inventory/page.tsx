"use client";

import { useIsMounted } from "@/hooks/useIsMounted";
import * as React from "react";
import { PageTitle } from "@/components/common/PageTitle";
import { InventoryTable, type InventoryItem } from "@/components/admin/InventoryTable";
import { Button } from "@/components/ui/Button";
import { useProductStore } from "@/store/product.store";

const LOW_STOCK_THRESHOLD = 6;

/**
 * Escapa texto antes de inyectarlo con `document.write`: el título y el SKU son
 * editables por un administrador, así que no se puede confiar en ellos.
 */
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export default function AdminInventoryPage() {
  const isMounted = useIsMounted();
  const products = useProductStore((state) => state.products);
  const loading = useProductStore((state) => state.loading);
  const updateStock = useProductStore((state) => state.updateStock);

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

  /**
   * Abre una ventana de impresión con una etiqueta por producto (código SKU,
   * nombre y existencias). Se cierra sola si el usuario cancela el diálogo.
   */
  const handlePrintLabels = () => {
    const win = window.open("", "_blank", "width=800,height=600");
    if (!win) return;

    const labels = products
      .map(
        (p) => `
        <div class="label">
          <p class="sku">${escapeHtml(p.sku)}</p>
          <p class="name">${escapeHtml(p.title)}</p>
          <p class="stock">Stock: ${escapeHtml(String(p.stock))}</p>
        </div>`
      )
      .join("");

    win.document.write(`<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Etiquetas SKU — Esencial</title>
    <style>
      body { font-family: system-ui, sans-serif; padding: 24px; }
      h1 { font-size: 14px; text-transform: uppercase; letter-spacing: .1em; }
      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
      .label { border: 1px solid #d6d3d1; border-radius: 8px; padding: 12px; text-align: center; }
      .sku { font-family: ui-monospace, monospace; font-size: 14px; font-weight: 700; margin: 0; }
      .name { font-size: 11px; color: #57534e; margin: 4px 0 0; }
      .stock { font-size: 10px; color: #a8a29e; margin: 2px 0 0; }
      @media print { h1 { display: none; } .grid { gap: 8px; } }
    </style>
  </head>
  <body>
    <h1>Etiquetas SKU</h1>
    <div class="grid">${labels}</div>
  </body>
</html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <PageTitle
          title="Control de Inventario"
          description="Monitoreo físico de existencias, códigos SKU y alertas de reabastecimiento crítico."
        />
        <div className="flex items-center space-x-3">
          <Button variant="secondary" className="h-9 text-xs" onClick={handlePrintLabels} disabled={products.length === 0}>
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
