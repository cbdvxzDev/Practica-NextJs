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
    // Puedes añadir más elementos aquí
  ];

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {adminNavigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg",
              isActive 
                ? "bg-blue-50 text-blue-700" 
                : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}