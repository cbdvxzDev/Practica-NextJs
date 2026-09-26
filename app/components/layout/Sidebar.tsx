"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, FolderKanban, Receipt, Users, Boxes, ArrowLeft } from "lucide-react";

const ADMIN_NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Productos", icon: Package },
  { href: "/admin/categories", label: "Categorías", icon: FolderKanban },
  { href: "/admin/inventory", label: "Inventario", icon: Boxes },
  { href: "/admin/orders", label: "Órdenes", icon: Receipt },
  { href: "/admin/users", label: "Usuarios", icon: Users },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-20 w-64 bg-white border-r border-border/60 flex-col justify-between hidden lg:flex",
      className
    )}>
      <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-6 pb-5 border-b border-border/30">
          <Link href="/admin/dashboard" className="text-sm font-semibold tracking-wider uppercase text-brand-dark">
            Esencial <span className="text-[10px] text-brand-muted font-mono lowercase bg-brand-light px-1.5 py-0.5 rounded ml-1">v2.0</span>
          </Link>
        </div>

        <nav className="mt-6 flex-1 px-4 space-y-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center h-10 px-3 text-xs font-medium rounded-button transition-colors",
                  isActive ? "bg-brand-dark text-white font-semibold" : "text-brand-muted hover:bg-brand-light hover:text-brand-dark"
                )}
              >
                <Icon className="mr-3 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex-shrink-0 flex border-t border-border/30 p-4 bg-neutral-50/50">
        <Link href="/" className="flex items-center w-full px-3 py-2 text-xs font-medium text-brand-muted hover:text-brand-dark rounded-button transition-colors">
          <ArrowLeft className="mr-3 h-4 w-4" aria-hidden="true" />
          Volver a la tienda
        </Link>
      </div>
    </aside>
  );
}