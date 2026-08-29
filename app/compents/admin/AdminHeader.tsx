"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

const ADMIN_NAV = [
  { label: "Consola de Control", href: "/admin/dashboard", icon: "▣" },
  { label: "Inventario", href: "/admin/inventory", icon: "▦" },
  { label: "Productos", href: "/admin/products", icon: "◇" },
  { label: "Categorías", href: "/admin/categories", icon: "◫" },
  { label: "Órdenes", href: "/admin/orders", icon: "↗" },
  { label: "Usuarios", href: "/admin/users", icon: "◎" },
];

// Enlaces reales de la tienda para que el administrador pueda revisar redacción,
// precios e imágenes tal como las ve un cliente, sin salir del contexto de gestión.
const STOREFRONT_LINKS = [
  { label: "Inicio", href: "/" },
  { label: "Catálogo completo", href: "/products" },
  { label: "Moda", href: "/categories/moda" },
  { label: "Belleza", href: "/categories/belleza" },
  { label: "Accesorios", href: "/categories/accesorios" },
  { label: "Tecnología", href: "/categories/tecnologia" },
  { label: "Carrito", href: "/cart" },
  { label: "Preguntas frecuentes", href: "/faq" },
  { label: "Envíos y devoluciones", href: "/shipping" },
  { label: "Contacto", href: "/contact" },
];

export function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.logout);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isStoreMenuOpen, setIsStoreMenuOpen] = React.useState(false);
  const storeMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => setIsMenuOpen(false), [pathname]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (storeMenuRef.current && !storeMenuRef.current.contains(event.target as Node)) {
        setIsStoreMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAuth();
    AuthService.logout();
    router.replace("/login");
  };

  return (
    <header className="border-b border-border bg-white">
      <div className="flex min-h-16 items-center justify-between gap-3 px-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          {/* MENÚ HAMBURGUESA — solo visible en móvil/tablet, replica la navegación de la sidebar */}
          <button
            type="button"
            className="rounded-button p-2 text-brand-dark transition-colors hover:bg-brand-light md:hidden"
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span className="block h-0.5 w-5 bg-current" />
            <span className="mt-1.5 block h-0.5 w-5 bg-current" />
            <span className="mt-1.5 block h-0.5 w-5 bg-current" />
          </button>

          <div className="min-w-0">
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-muted sm:text-xs">Área de gestión</p>
            <p className="hidden truncate text-xs text-brand-muted sm:block">{user?.name ?? "Administrador"}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 text-xs font-medium text-brand-dark sm:gap-4">
          {/* REVISAR TIENDA — permite al admin auditar redacción, precios e imágenes reales */}
          <div className="relative" ref={storeMenuRef}>
            <button
              type="button"
              onClick={() => setIsStoreMenuOpen((open) => !open)}
              aria-expanded={isStoreMenuOpen}
              className="flex items-center gap-1.5 rounded-button border border-border px-2.5 py-2 transition-colors hover:bg-brand-light sm:px-3"
            >
              <span aria-hidden="true">↗</span>
              <span className="hidden sm:inline">Revisar tienda</span>
            </button>
            {isStoreMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-card border border-border/60 bg-white py-2 shadow-lg">
                <p className="border-b border-border/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
                  Vista de cliente
                </p>
                {STOREFRONT_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    onClick={() => setIsStoreMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-2 text-sm text-brand-muted transition-colors hover:bg-brand-light hover:text-brand-dark"
                  >
                    {link.label}
                    <span aria-hidden="true" className="text-[10px] text-brand-muted/60">↗</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <span className="hidden items-center gap-2 lg:flex"><span className="h-2 w-2 rounded-full bg-emerald-500" />Sesión activa</span>
          <button type="button" onClick={handleLogout} className="rounded-button border border-border px-2.5 py-2 text-xs transition-colors hover:bg-brand-light sm:px-3">
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* PANEL DE NAVEGACIÓN MÓVIL — muestra las mismas secciones que la sidebar de escritorio */}
      {isMenuOpen && (
        <nav className="border-t border-border/40 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1 text-sm font-medium">
            {ADMIN_NAV.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                    isActive ? "bg-blue-50 text-blue-700" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  )}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
