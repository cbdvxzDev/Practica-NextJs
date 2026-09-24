"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";
import { useCartTotalItems } from "../../store/cart.store";
import { useAuthStore } from "../../store/auth.store";
import { useWishlistStore } from "../../store/wishlist.store";
import { useCategoryStore } from "../../store/category.store";

const FALLBACK_CATEGORY_LINKS = [
  { href: "/categories/abrigo", label: "Abrigos" },
  { href: "/categories/basicos", label: "Básicos" },
  { href: "/categories/camisas", label: "Camisas" },
  { href: "/categories/pantalones", label: "Pantalones" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const totalItems = useCartTotalItems();
  const { isAuthenticated, user, logout } = useAuthStore();
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const categories = useCategoryStore((state) => state.categories);

  const navLinks = React.useMemo(() => {
    const categoryLinks =
      categories.length > 0
        ? categories.map((cat) => ({
            href: `/categories/${cat.slug}`,
            label: cat.name,
          }))
        : FALLBACK_CATEGORY_LINKS;

    return [{ href: "/products", label: "Catálogo" }, ...categoryLinks];
  }, [categories]);

  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => setIsMounted(true), []);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isMenuOpen]);

  if (pathname?.startsWith("/admin")) return null;

  const isAdmin = isMounted && isAuthenticated && user?.role === "admin";

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-40 w-full transition-all duration-300 border-b border-transparent bg-transparent",
          (isScrolled || isMenuOpen) && "bg-white/95 backdrop-blur-md border-border/40 shadow-sm"
        )}
      >
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-lg font-semibold tracking-wider uppercase text-brand-dark transition-opacity hover:opacity-80">
              Shop Esencial
            </Link>

            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "transition-colors hover:text-brand-dark underline-offset-4 hover:underline",
                      isActive ? "text-brand-dark font-semibold" : "text-brand-muted"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            {isAdmin && (
              <Link href="/admin/dashboard" className="hidden md:block">
                <Button variant="ghost" size="sm" className="text-xs text-brand-muted hover:text-brand-dark">
                  Admin
                </Button>
              </Link>
            )}

            {isMounted && isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="text-xs text-brand-dark hover:underline">
                    {user?.name ?? "Mi cuenta"}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="text-xs text-brand-muted hover:text-red-600" onClick={logout}>
                  Salir
                </Button>
              </div>
            ) : (
              <Link href="/login" className="hidden md:block">
                <Button variant="ghost" size="sm" className="text-xs text-brand-muted hover:text-brand-dark">
                  Iniciar sesión
                </Button>
              </Link>
            )}

            <Link href="/wishlist" className="relative p-2 text-brand-dark hover:text-brand-muted transition-colors" aria-label="Ver lista de deseos">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {isMounted && wishlistCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white tracking-tighter">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link href="/cart" className="relative p-2 text-brand-dark hover:text-brand-muted transition-colors" aria-label="Ver carrito">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-dark text-[10px] font-bold text-white tracking-tighter">
                {isMounted ? totalItems : 0}
              </span>
            </Link>

            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="p-2 text-brand-dark md:hidden"
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-out bg-white border-t border-border/40",
          isMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}>
          <nav className="flex flex-col px-4 py-4 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-2.5 rounded-button text-sm font-medium transition-colors",
                    isActive ? "bg-brand-dark text-white" : "text-brand-dark hover:bg-brand-light"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-3 mt-2 border-t border-border/30 space-y-1">
              {isAdmin && (
                <Link href="/admin/dashboard" className="block px-3 py-2.5 rounded-button text-sm font-medium text-brand-muted hover:bg-brand-light hover:text-brand-dark transition-colors">
                  Panel de Administración
                </Link>
              )}

              {isMounted && isAuthenticated ? (
                <>
                  <Link href="/profile" className="block px-3 py-2.5 rounded-button text-sm font-medium text-brand-dark hover:bg-brand-light transition-colors">
                    {user?.name ?? "Mi cuenta"}
                  </Link>
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 rounded-button text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <Link href="/login" className="block px-3 py-2.5 rounded-button text-sm font-medium text-brand-dark hover:bg-brand-light transition-colors">
                  Iniciar sesión
                </Link>
              )}
            </div>
          </nav>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black/20 md:hidden" onClick={() => setIsMenuOpen(false)} aria-hidden="true" />
      )}
    </>
  );
}