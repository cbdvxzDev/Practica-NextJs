"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "activo" | "agotado";
}

export interface ProductTableProps {
  products: Product[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export function ProductTable({ products, onEdit, onDelete, className }: ProductTableProps) {
  return (
    <div className={cn("w-full border border-border/40 rounded-card overflow-hidden bg-white", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-[680px] w-full text-left text-xs">
          <thead className="bg-neutral-50/50 text-brand-muted uppercase border-b border-border/30">
            <tr>
              <th className="px-6 py-4 font-semibold tracking-wider">Producto</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Categoría</th>
              <th className="px-6 py-4 font-semibold tracking-wider text-right">Precio</th>
              <th className="px-6 py-4 font-semibold tracking-wider text-center">Stock</th>
              <th className="px-6 py-4 font-semibold tracking-wider text-center">Estado</th>
              <th className="px-6 py-4 font-semibold tracking-wider text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-neutral-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-brand-dark">{product.name}</td>
                <td className="px-6 py-4 text-brand-muted">{product.category}</td>
                <td className="px-6 py-4 text-right font-medium text-brand-dark">
                  ${product.price.toLocaleString("es-CO")}
                </td>
                <td className="px-6 py-4 text-center">{product.stock}</td>
                <td className="px-6 py-4 text-center">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase",
                    product.status === "activo" 
                      ? "bg-emerald-50 text-emerald-700" 
                      : "bg-red-50 text-red-600"
                  )}>
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex items-center justify-center gap-3">
                  <button 
                    onClick={() => onEdit(product.id)}
                    className="text-brand-muted hover:text-brand-dark transition-colors"
                    aria-label="Editar"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => onDelete(product.id)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                    aria-label="Eliminar"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}