"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";
import { useCartTotalItems, useCartStore } from "../../store/cart.store";
import { useAuthStore } from "../../store/auth.store";
import { useWishlistStore } from "../../store/wishlist.store";
import { useCategoryStore } from "../../store/category.store";
import { CartDrawer } from "../cart/CartDrawer";

/** Enlaces del menú móvil: catálogo completo + todas las categorías. */
const FALLBACK_CATEGORY_LINKS = [
  { slug: "abrigo", label: "Abrigos" },
  { slug: "vestidos", label: "Vestidos" },
  { slug: "tejidos", label: "Tejidos" },
  { slug: "denim", label: "Denim" },
  { slug: "camisas", label: "Camisas" },
  { slug: "pantalones", label: "Pantalones" },
  { slug: "calzado", label: "Calzado" },
  { slug: "accesorios", label: "Accesorios" },
  { slug: "basicos", label: "Básicos" },
];

/** Subconjunto que cabe en la barra superior de escritorio. */
const HIGHLIGHTED_CATEGORY_SLUGS = ["vestidos", "tejidos", "denim", "calzado", "accesorios"];

/** Etiquetas cortas para la barra superior (los nombres largos van al menú móvil). */
const CATEGORY_SHORT_LABELS: Record<string, string> = {
  abrigo: "Abrigos",
  basicos: "Básicos",
  camisas: "Camisas",
  pantalones: "Pantalones",
  vestidos: "Vestidos",
  tejidos: "Tejidos",
  denim: "Denim",
  calzado: "Calzado",
  accesorios: "Accesorios",
};

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const totalItems = useCartTotalItems();
  const cartItems = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const { isAuthenticated, user, logout } = useAuthStore();
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const categories = useCategoryStore((state) => state.categories);

  const navLinks = React.useMemo(() => {
    const allCategories =
      categories.length > 0
        ? categories.map((cat) => ({ href: `/categories/${cat.slug}`, label: cat.name }))
        : FALLBACK_CATEGORY_LINKS.map((cat) => ({
            href: `/categories/${cat.slug}`,
            label: cat.label,
          }))

    const highlighted = HIGHLIGHTED_CATEGORY_SLUGS.map((slug) => {
      const match = allCategories.find((link) => link.href.endsWith(`/${slug}`));
      return (
        match ?? {
          href: `/categories/${slug}`,
          label: CATEGORY_SHORT_LABELS[slug] ?? slug,
        }
      );
    });

    return {
      // Escritorio: catálogo + colecciones destacadas + acceso a todas.
      desktop: [
        { href: "/products", label: "Catálogo" },
        ...highlighted,
        { href: "/categories", label: "Categorías" },
      ],
      // Móvil: catálogo + cada categoría, para no esconder ninguna.
      mobile: [{ href: "/products", label: "Catálogo" }, ...allCategories, { href: "/categories", label: "Ver todas las categorías" }],
    };
  }, [categories]);

  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Cierra los paneles al navegar. Se ajusta durante el render en vez de en un
  // efecto para no provocar un segundo ciclo de render en cada cambio de ruta.
  const [lastPathname, setLastPathname] = React.useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setIsMenuOpen(false);
    setIsCartOpen(false);
  }

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // El bloqueo de scroll del carrito lo gestiona CartDrawer, que es quien
  // renderiza su propio overlay. Aquí solo se controla el menú móvil.
  React.useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (isMenuOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
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

            <nav className="hidden md:flex items-center space-x-5 xl:space-x-6 text-sm font-medium">
              {navLinks.desktop.map((link) => {
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

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-brand-dark hover:text-brand-muted transition-colors"
              aria-label="Abrir bolsa de compra"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-dark text-[10px] font-bold text-white tracking-tighter">
                {isMounted ? totalItems : 0}
              </span>
            </button>

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
          isMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        )}>
          <nav className="flex flex-col px-4 py-4 space-y-1 max-h-[70vh] overflow-y-auto">
            {navLinks.mobile.map((link) => {
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

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onQuantityChange={updateQuantity}
        onRemoveItem={removeItem}
        onCheckout={() => {
          setIsCartOpen(false);
          router.push("/checkout");
        }}
      />
    </>
  );
}