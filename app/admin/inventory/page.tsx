"use client";

import * as React from "react";
import { PageTitle } from "@/compents/common/PageTitle";
import { InventoryTable } from "@/compents/admin/InventoryTable";
import { Button } from "@/compents/ui/Button";

// Datos mockeados enfocados puramente en control de stock (Alineado con tu data/products.json)
const MOCK_INVENTORY_DATA = [
  {
    id: "1",
    name: "Chaqueta Minimalista en Lana",
    sku: "JKT-LAN-001",
    minStockThreshold: 5,
    stock: 5,
    lastUpdated: "Hoy, 09:30",
  },
  {
    id: "2",
    name: "Camiseta Esencial Algodón Orgánico",
    sku: "TSH-ORG-002",
    minStockThreshold: 5,
    stock: 12,
    lastUpdated: "Ayer, 16:20",
  },
  {
    id: "3",
    name: "Pantalón Sastrero Moderno",
    sku: "PNT-SAS-003",
    minStockThreshold: 5,
    stock: 0,
    lastUpdated: "27 Jun, 2026",
  }
];

export default function AdminInventoryPage() {
  const [inventory, setInventory] = React.useState(MOCK_INVENTORY_DATA);
  const updateStock = (id: string, newStock: number) => {
    setInventory((items) => items.map((item) => item.id === id ? { ...item, stock: newStock, lastUpdated: "Ahora" } : item));
  };

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
          <span className="text-xl font-semibold text-brand-dark">{inventory.length}</span>
        </div>
        <div className="bg-white border border-border/60 rounded-card p-4 flex items-center justify-between shadow-subtle">
          <span className="text-xs font-medium text-brand-muted uppercase">Bajo Stock (&lt; 6)</span>
          <span className="text-xl font-semibold text-neutral-700">{inventory.filter((item) => item.stock > 0 && item.stock <= item.minStockThreshold).length}</span>
        </div>
        <div className="bg-white border border-border/60 rounded-card p-4 flex items-center justify-between shadow-subtle">
          <span className="text-xs font-medium text-brand-muted uppercase">Agotados</span>
          <span className="text-xl font-semibold text-brand-dark">{inventory.filter((item) => item.stock === 0).length}</span>
        </div>
      </section>

      {/* CONTENEDOR DE LA TABLA OPERATIVA */}
      <section className="bg-white border border-border/60 rounded-card shadow-subtle overflow-hidden">
        {/* Delegamos el renderizado interactivo a tu componente atómico InventoryTable */}
        <InventoryTable
          items={inventory}
          onUpdateStock={updateStock}
        />
      </section>
    </div>
  );
}