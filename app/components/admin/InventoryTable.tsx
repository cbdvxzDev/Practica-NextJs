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
  /** Oculta la edición de stock (rol sin permiso de escritura). */
  readOnly?: boolean;
  className?: string;
}

export function InventoryTable({ items, onUpdateStock, readOnly = false, className }: InventoryTableProps) {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState("");
  const [stockError, setStockError] = React.useState("");

  const startEditing = (item: InventoryItem) => {
    setEditingId(item.id);
    setDraft(String(item.stock));
    setStockError("");
  };

  const commit = (item: InventoryItem) => {
    const value = Number(draft);
    if (!Number.isInteger(value) || value < 0) {
      setStockError("Ingresa un número entero igual o mayor a 0.");
      return;
    }
    if (value !== item.stock) onUpdateStock(item.id, value);
    setEditingId(null);
    setStockError("");
  };

  return (
    <div className={cn("w-full border border-border/40 rounded-card overflow-hidden bg-white", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50/50 text-brand-muted uppercase border-b border-border/30">
            <tr>
              <th className="px-6 py-4 font-semibold tracking-wider">Producto / SKU</th>
              <th className="px-6 py-4 font-semibold tracking-wider text-center">Nivel Actual</th>
              <th className="px-6 py-4 font-semibold tracking-wider text-center">Estado de Alerta</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Última Actualización</th>
              <th className="px-6 py-4 font-semibold tracking-wider text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {items.map((item) => {
              const isLowStock = item.stock <= item.minStockThreshold;
              const isEditing = editingId === item.id;

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
                    {readOnly ? (
                      <span className="text-brand-muted">—</span>
                    ) : isEditing ? (
                      <div className="flex items-center justify-end gap-2">
                        <input
                          type="number"
                          min={0}
                          step={1}
                          autoFocus
                          value={draft}
                          onChange={(e) => {
                            setDraft(e.target.value);
                            setStockError("");
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commit(item);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          aria-label={`Nueva cantidad de ${item.name}`}
                          className="h-8 w-20 px-2 text-center text-xs font-bold border border-border/60 rounded-button bg-white focus:outline-none focus:ring-1 focus:ring-brand-dark text-brand-dark"
                        />
                        <button
                          onClick={() => commit(item)}
                          className="text-emerald-700 font-semibold underline underline-offset-4 hover:opacity-70 transition-opacity"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-brand-muted font-medium underline underline-offset-4 hover:opacity-70 transition-opacity"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditing(item)}
                        className="text-brand-dark font-medium underline underline-offset-4 hover:opacity-70 transition-opacity"
                      >
                        Ajustar
                      </button>
                    )}
                    {isEditing && stockError && (
                      <p className="mt-1 text-[10px] text-red-600 text-right">{stockError}</p>
                    )}
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