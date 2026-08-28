"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils"; // Asegúrate de usar el alias @/

export interface SidebarAdminProps {
  className?: string;
}

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export function SidebarAdmin({ className }: SidebarAdminProps) {
  const pathname = usePathname();

  const adminNavigation: NavigationItem[] = [
    {
      label: "Consola de Control",
      href: "/admin/dashboard",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      ),
    },
    { label: "Inventario", href: "/admin/inventory", icon: <span aria-hidden="true">▦</span> },
    { label: "Productos", href: "/admin/products", icon: <span aria-hidden="true">◇</span> },
    { label: "Categorías", href: "/admin/categories", icon: <span aria-hidden="true">◫</span> },
    { label: "Órdenes", href: "/admin/orders", icon: <span aria-hidden="true">↗</span> },
    { label: "Usuarios", href: "/admin/users", icon: <span aria-hidden="true">◎</span> },
  ];

  return (
    <nav className={cn("w-[4.25rem] shrink-0 border-r border-border bg-white p-2 sm:w-20 md:w-60 md:p-4", className)}>
      <div className="mb-6 hidden px-3 text-xs font-bold uppercase tracking-widest text-brand-dark md:block">
        Gestión
      </div>
      <div className="flex flex-col gap-1">
      {adminNavigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center justify-center gap-3 rounded-lg px-2 py-3 text-sm font-medium transition-colors md:justify-start md:px-4",
              isActive 
                ? "bg-blue-50 text-blue-700" 
                : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
            )}
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span className="hidden md:inline">{item.label}</span>
          </Link>
        );
      })}
      </div>
    </nav>
  );
}