"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";
import { useCartTotalItems } from "../../store/cart.store";

const NAV_LINKS = [
  { href: "/products", label: "Ofertas" },
  { href: "/categories/moda", label: "Moda" },
  { href: "/categories/belleza", label: "Belleza" },
  { href: "/categories/tecnologia", label: "Tecnología" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const totalItems = useCartTotalItems();

  const isMounted = React.useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-40 w-full border-b border-border/40 bg-white transition-all duration-300",
        isScrolled && "shadow-sm"
      )}
    >
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        <div className="flex items-center gap-8">
          <Link 
            href="/" 
            className="text-lg font-semibold tracking-wider uppercase text-brand-dark transition-opacity hover:opacity-80"
          >
            NOVA
          </Link>

          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
            {NAV_LINKS.map((link) => {
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
          <Link href="/track-order" className="hidden text-sm text-brand-muted transition-colors hover:text-brand-dark sm:inline-flex">
            Rastrear pedido
          </Link>
          <Link href="/login" className="hidden text-sm text-brand-muted transition-colors hover:text-brand-dark sm:inline-flex">
            Ingresar
          </Link>

          <Link href="/cart" className="relative p-2 text-brand-dark transition-colors hover:text-brand-muted" aria-label="Ver carrito">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-dark text-[10px] font-bold text-white tracking-tighter">
              {isMounted ? totalItems : 0}
            </span>
          </Link>
          <button
            type="button"
            className="p-2 text-brand-dark md:hidden"
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span className="block h-0.5 w-5 bg-current" />
            <span className="mt-1.5 block h-0.5 w-5 bg-current" />
          </button>
        </div>

      </div>
      {isMenuOpen && (
        <nav className="border-t border-border/40 bg-white px-4 py-4 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm font-medium">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-brand-muted hover:text-brand-dark">
                {link.label}
              </Link>
            ))}
            <Link href="/track-order" className="border-t border-border/40 pt-4 text-brand-muted">
              Rastrear pedido
            </Link>
            <Link href="/login" className="text-brand-muted">
              Mi cuenta
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}