// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { insertRecord, readCollection, generateId } from "@/lib/db";
import { ForbiddenError, getTokenPayload } from "@/lib/auth";
import { apiHandler } from "@/lib/api";
import type { DbProduct } from "@/types/db";

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category")?.toLowerCase();
  const search = searchParams.get("search")?.toLowerCase();

  let products = readCollection<DbProduct>("products");

  if (category) {
    products = products.filter(
      (p) =>
        p.category.slug.toLowerCase() === category ||
        p.category.id.toLowerCase() === category ||
        p.category.name.toLowerCase() === category
    );
  }

  if (search) {
    products = products.filter(
      (p) =>
        p.title.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search) ||
        p.sku.toLowerCase().includes(search)
    );
  }

  return NextResponse.json({ data: products, meta: { total: products.length } });
}

export const POST = apiHandler(async (request: NextRequest) => {
  const payload = getTokenPayload(request);
  if (!payload || payload.role !== "admin") {
    throw new ForbiddenError("Solo los administradores pueden crear productos.");
  }

  const body = await request.json().catch(() => ({}));
  const { sku, title, description, price, compareAtPrice, images, category, stock, isActive } = body;

  if (!sku || !title || !price || !category) {
    return NextResponse.json(
      { message: "SKU, título, precio y categoría son obligatorios." },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const product: DbProduct = {
    id: generateId("prod"),
    sku: String(sku),
    slug: toSlug(String(title)),
    title: String(title),
    description: String(description ?? ""),
    price: Number(price),
    compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
    images: Array.isArray(images) && images.length > 0
      ? images
      : ["https://placehold.co/600x800/e8e4df/6B7280?text=Producto"],
    category: {
      id: category?.id ?? String(category),
      name: category?.name ?? "",
      slug: category?.slug ?? toSlug(category?.name ?? String(category)),
    },
    stock: Number(stock ?? 0),
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    createdAt: now,
    updatedAt: now,
  };

  insertRecord("products", product);

  return NextResponse.json({ data: product }, { status: 201 });
});