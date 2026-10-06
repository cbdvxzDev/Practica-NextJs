// app/lib/category-input.ts
// Normaliza la categoría que llega en un producto antes de guardarla.
//
// El formulario del panel manda el objeto { id, name, slug } (mini API) y el
// backend Spring solo acepta el slug de la categoría. Aquí se aceptan las dos
// formas: el objeto se guarda tal cual, y una cadena (slug, id o nombre) se
// resuelve contra la colección de categorías para no perder el nombre en la
// mini base de datos.

import { readCollection } from "@/lib/db";
import type { DbCategory } from "@/types/db";

export interface ProductCategoryRef {
  id: string;
  name: string;
  slug: string;
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Devuelve la referencia de categoría completa, o null si no hay ninguna.
 * Una cadena desconocida se conserva como slug para que el producto no se
 * guarde sin categoría.
 */
export function resolveCategoryInput(input: unknown): ProductCategoryRef | null {
  if (input && typeof input === "object" && !Array.isArray(input)) {
    const raw = input as Record<string, unknown>;
    const name = typeof raw.name === "string" ? raw.name : "";
    const slug =
      (typeof raw.slug === "string" ? raw.slug : "") || (name ? toSlug(name) : "");
    const id = (typeof raw.id === "string" ? raw.id : "") || slug;
    if (!id && !slug) return null;
    return { id, name, slug };
  }

  const key = String(input ?? "").trim();
  if (!key) return null;

  const found = readCollection<DbCategory>("categories").find(
    (c) =>
      c.slug === key ||
      c.id === key ||
      c.name.toLowerCase() === key.toLowerCase()
  );
  if (found) return { id: found.id, name: found.name, slug: found.slug };

  return { id: key, name: "", slug: toSlug(key) };
}
