"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Estructura de navegación para el módulo administrativo
const ADMIN_NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/products", label: "Productos", icon: "📦" },
  { href: "/admin/categories", label: "Categorías", icon: "📁" },
  { href: "/admin/orders", label: "Órdenes", icon: "🧾" },
  { href: "/admin/users", label: "Usuarios", icon: "👥" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 w-64 bg-white border-r border-border/60 flex flex-col justify-between hidden lg:flex">
      <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
        
        {/* ENCABEZADO / IDENTIDAD DE CONTROL */}
        <div className="flex items-center flex-shrink-0 px-6 pb-5 border-b border-border/30">
          <Link 
            href="/admin/dashboard" 
            className="text-sm font-semibold tracking-wider uppercase text-brand-dark"
          >
            Esencial <span className="text-[10px] text-brand-muted font-mono lowercase bg-brand-light px-1.5 py-0.5 rounded ml-1">v2.0</span>
          </Link>
        </div>

        {/* MENÚ DE ENLACES OPERATIVOS */}
        <nav className="mt-6 flex-1 px-4 space-y-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            // Verificar si la ruta actual coincide de forma exacta o parcial con el enlace
            const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center h-10 px-3 text-xs font-medium rounded-button transition-colors",
                  isActive
                    ? "bg-brand-dark text-white font-semibold"
                    : "text-brand-muted hover:bg-brand-light hover:text-brand-dark"
                )}
              >
                <span className="mr-3 text-sm flex items-center justify-center filter grayscale group-hover:grayscale-0 transition-all">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* PIE DE PÁGINA DEL SIDEBAR */}
      <div className="flex-shrink-0 flex border-t border-border/30 p-4 bg-neutral-50/50">
        <Link
          href="/"
          className="flex items-center w-full px-3 py-2 text-xs font-medium text-brand-muted hover:text-brand-dark rounded-button transition-colors"
        >
          <span className="mr-3 text-sm">←</span>
          Volver a la tienda
        </Link>
      </div>
    </aside>
  );
}