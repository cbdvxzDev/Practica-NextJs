"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const FOOTER_SECTIONS = [
  {
    title: "Colecciones",
    links: [
      { href: "/shop", label: "Ver todo el catálogo" },
      { href: "/categories/moda", label: "Moda" },
      { href: "/categories/tecnologia", label: "Tecnología" },
    ],
  },
  {
    title: "Soporte",
    links: [
      { href: "/faq", label: "Preguntas frecuentes" },
      { href: "/shipping", label: "Envíos y devoluciones" },
      { href: "/track-order", label: "Rastrear mi pedido" },
      { href: "/contact", label: "Contacto" },
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-border/30">
          
          {/* BLOQUE MARCA */}
          <div className="col-span-2 space-y-3">
            <Link 
              href="/" 
              className="text-base font-semibold tracking-wider uppercase text-brand-dark transition-opacity hover:opacity-80"
            >
              NOVA
            </Link>
            <p className="text-xs text-brand-muted max-w-xs leading-relaxed">
              Moda, belleza, accesorios y tecnología seleccionados para hacer tu día más fácil.
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