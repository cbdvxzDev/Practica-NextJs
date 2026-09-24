// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { deleteRecord, findById, updateRecord } from "@/lib/db";
import { ForbiddenError, getTokenPayload } from "@/lib/auth";
import { apiHandler } from "@/lib/api";
import type { DbProduct } from "@/types/db";

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/products/[id]">) {
  const { id } = await ctx.params;
  const product = findById<DbProduct>("products", id);

  if (!product) {
    return NextResponse.json({ message: "Producto no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ data: product });
}

export const PUT = apiHandler(async (request: NextRequest, ctx: RouteContext<"/api/products/[id]">) => {
  const payload = getTokenPayload(request);
  if (!payload || payload.role !== "admin") {
    throw new ForbiddenError("Solo los administradores pueden editar productos.");
  }

  const { id } = await ctx.params;
  const existing = findById<DbProduct>("products", id);
  if (!existing) {
    return NextResponse.json({ message: "Producto no encontrado." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const updates: Partial<DbProduct> = {
    sku: body.sku !== undefined ? String(body.sku) : existing.sku,
    title: body.title !== undefined ? String(body.title) : existing.title,
    description: body.description !== undefined ? String(body.description) : existing.description,
    price: body.price !== undefined ? Number(body.price) : existing.price,
    compareAtPrice: body.compareAtPrice !== undefined ? Number(body.compareAtPrice) : existing.compareAtPrice,
    images: body.images !== undefined ? body.images : existing.images,
    category: body.category !== undefined ? body.category : existing.category,
    stock: body.stock !== undefined ? Number(body.stock) : existing.stock,
    isActive: body.isActive !== undefined ? Boolean(body.isActive) : existing.isActive,
    updatedAt: new Date().toISOString(),
  };

  const updated = updateRecord<DbProduct>("products", id, updates);

  return NextResponse.json({ data: updated });
});

export const DELETE = apiHandler(async (request: NextRequest, ctx: RouteContext<"/api/products/[id]">) => {
  const payload = getTokenPayload(request);
  if (!payload || payload.role !== "admin") {
    throw new ForbiddenError("Solo los administradores pueden eliminar productos.");
  }

  const { id } = await ctx.params;
  const removed = deleteRecord("products", id);

  if (!removed) {
    return NextResponse.json({ message: "Producto no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
});