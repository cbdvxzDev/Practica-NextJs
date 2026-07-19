"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";
import { useCartTotalItems } from "../../store/cart.store";

const NAV_LINKS = [
  { href: "/products", label: "Catálogo" },
  { href: "/categories/abrigo", label: "Abrigos" },
  { href: "/categories/basicos", label: "Básicos" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const totalItems = useCartTotalItems();

  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => setIsMounted(true), []);

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
        "fixed top-0 inset-x-0 z-40 w-full transition-all duration-300 border-b border-transparent bg-transparent",
        isScrolled && "bg-white/80 backdrop-blur-md border-border/40 shadow-sm"
      )}
    >
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        <div className="flex items-center gap-8">
          <Link 
            href="/" 
            className="text-lg font-semibold tracking-wider uppercase text-brand-dark transition-opacity hover:opacity-80"
          >
            Esencial
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
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
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-xs text-brand-muted hover:text-brand-dark">
              Admin
            </Button>
          </Link>

          <Link href="/cart" className="relative p-2 text-brand-dark hover:text-brand-muted transition-colors" aria-label="Ver carrito">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-dark text-[10px] font-bold text-white tracking-tighter">
              {isMounted ? totalItems : 0}
            </span>
          </Link>
        </div>

      </div>
    </header>
  );
}