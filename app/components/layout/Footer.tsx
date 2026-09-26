"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CONFIG } from "../../constants/config";

const FOOTER_SECTIONS = [
  {
    title: "Colecciones",
    links: [
      { href: "/products", label: "Ver todo el catálogo" },
      { href: "/categories/abrigo", label: "Prendas de Abrigo" },
      { href: "/categories/basicos", label: "Básicos Esenciales" },
      { href: "/categories/camisas", label: "Camisas y Blusas" },
      { href: "/categories/pantalones", label: "Pantalones" },
      { href: "/categories/vestidos", label: "Vestidos" },
      { href: "/categories/tejidos", label: "Tejidos de Punto" },
      { href: "/categories/denim", label: "Denim" },
      { href: "/categories/calzado", label: "Calzado" },
      { href: "/categories/accesorios", label: "Accesorios" },
    ],
  },
  {
    title: "La casa",
    links: [
      { href: "/about", label: "Quiénes somos" },
      { href: "/lookbook", label: "Lookbook" },
      { href: "/size-guide", label: "Guía de tallas" },
      { href: "/contact", label: "Contacto" },
    ],
  },
  {
    title: "Ayuda",
    links: [
      { href: "/faq", label: "Preguntas frecuentes" },
      { href: "/shipping", label: "Envíos y devoluciones" },
      { href: "/contact", label: "Escríbenos" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Políticas de privacidad" },
      { href: "/terms", label: "Términos del servicio" },
    ],
  },
];

export function Footer() {
  const pathname = usePathname();

  // Ocultar el footer público de manera automática si nos encontramos en el panel de control administrativo
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="w-full bg-neutral-50 border-t border-border/50 text-sm">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        
        {/* ENLACES E IDENTIDAD */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 pb-10 border-b border-border/30">
          
          {/* BLOQUE MARCA */}
          <div className="col-span-2 space-y-3">
            <Link 
              href="/" 
              className="text-base font-semibold tracking-wider uppercase text-brand-dark transition-opacity hover:opacity-80"
            >
              Esencial
            </Link>
            <p className="text-xs text-brand-muted max-w-xs leading-relaxed">
              Diseño atemporal, minimalismo funcional y piezas confeccionadas de forma consciente y responsable.
            </p>
            <p className="text-[11px] text-brand-muted">
              Envíos a toda Colombia · {CONFIG.site.contactEmail}
            </p>
          </div>

          {/* COLUMNAS DINÁMICAS */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-3">
              <h3 className="text-xs font-semibold text-brand-dark uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-2 text-xs">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-brand-muted hover:text-brand-dark transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* RECUADRO DE CIERRE / COPYRIGHT */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-brand-muted tracking-tight">
            &copy; {new Date().getFullYear()} Esencial. Todos los derechos reservados.
          </p>
          <div className="text-[11px] text-brand-muted/70 font-mono">
            Hecho bajo una estética funcional.
          </div>
        </div>

      </div>
    </footer>
  );
}