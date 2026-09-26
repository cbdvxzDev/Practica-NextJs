"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  products: "Productos",
  categories: "Categorías",
  orders: "Órdenes",
  users: "Usuarios",
  inventory: "Inventario",
  create: "Crear",
  edit: "Editar",
  panel: "Panel",
};

function findLabel(segment: string): string | undefined {
  if (ADMIN_LABELS[segment]) return ADMIN_LABELS[segment];
  // Segmentos dinámicos (IDs tipo ORD-2026-001, o el id interno) se muestran como "Detalle"
  const looksLikeId = segment.includes("-") || /^\d+$/.test(segment) || segment.length > 20;
  return looksLikeId ? "Detalle" : undefined;
}

function capitalize(segment: string): string {
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

/**
 * Construye el array de migas (label + href) de forma inmutable.
 * No muta variables durante el render.
 */
function buildBreadcrumbs(segments: string[]): Array<{ label: string; href: string }> {
  let path = "/admin";
  return segments
    .map((segment) => {
      path += `/${segment}`;
      const label = findLabel(segment) ?? capitalize(segment);
      return { label, href: path };
    })
    .filter((crumb) => crumb.label !== "Panel" && crumb.href !== "/admin/panel");
}

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  const breadcrumbs = React.useMemo(() => {
    const segments = (pathname ?? "").split("/").filter(Boolean).filter((s) => s !== "admin");
    return buildBreadcrumbs(segments);
  }, [pathname]);

  if (breadcrumbs.length === 0) return null;

  return (
    <nav aria-label="Ruta de navegación" className={cn("flex items-center gap-1.5 text-xs text-brand-muted overflow-x-auto", className)}>
      <Link href="/admin/dashboard" className="font-medium text-brand-muted hover:text-brand-dark transition-colors whitespace-nowrap">
        Panel
      </Link>
      {breadcrumbs.map((crumb) => (
        <React.Fragment key={crumb.href}>
          <ChevronRight className="h-3 w-3 text-brand-muted/50 flex-shrink-0" aria-hidden="true" />
          <Link href={crumb.href} className="font-medium text-brand-muted hover:text-brand-dark transition-colors whitespace-nowrap">
            {crumb.label}
          </Link>
        </React.Fragment>
      ))}
    </nav>
  );
}

export default Breadcrumbs;
