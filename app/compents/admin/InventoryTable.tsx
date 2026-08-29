"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  minStockThreshold: number; // Nivel mínimo para alerta
  lastUpdated: string;
}

export interface InventoryTableProps {
  items: InventoryItem[];
  onUpdateStock: (id: string, newStock: number) => void;
  className?: string;
}

export function InventoryTable({ items, onUpdateStock, className }: InventoryTableProps) {
  return (
    <div className={cn("w-full rounded-card border border-border/40 bg-white", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-[680px] w-full table-fixed text-left text-xs">
          <thead className="bg-neutral-50/50 text-brand-muted uppercase border-b border-border/30">
            <tr>
              <th className="w-[34%] px-4 py-4 font-semibold tracking-wider sm:px-6">Producto / SKU</th>
              <th className="w-[15%] px-4 py-4 font-semibold tracking-wider text-center sm:px-6">Nivel actual</th>
              <th className="w-[18%] px-4 py-4 font-semibold tracking-wider text-center sm:px-6">Alerta</th>
              <th className="w-[20%] px-4 py-4 font-semibold tracking-wider sm:px-6">Actualización</th>
              <th className="w-[13%] px-4 py-4 font-semibold tracking-wider text-right sm:px-6">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {items.map((item) => {
              const isLowStock = item.stock <= item.minStockThreshold;

              return (
                <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-brand-dark">{item.name}</div>
                    <div className="text-[10px] text-brand-muted font-mono uppercase">{item.sku}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn("font-bold", isLowStock ? "text-red-600" : "text-brand-dark")}>
                      {item.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {isLowStock ? (
                      <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase">
                        Bajo stock
                      </span>
                    ) : (
                      <span className="text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase">
                        Óptimo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-brand-muted">{item.lastUpdated}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onUpdateStock(item.id, item.stock + 1)}
                      className="text-brand-dark font-medium underline underline-offset-4 hover:opacity-70 transition-opacity"
                    >
                      Ajustar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}