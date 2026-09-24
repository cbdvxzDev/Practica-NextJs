// app/api/products/[id]/stock/route.ts
import { NextRequest, NextResponse } from "next/server";
import { findById, updateRecord } from "@/lib/db";
import { ForbiddenError, getTokenPayload } from "@/lib/auth";
import { apiHandler } from "@/lib/api";
import type { DbProduct } from "@/types/db";

export const PATCH = apiHandler(async (request: NextRequest, ctx: RouteContext<"/api/products/[id]/stock">) => {
  const payload = getTokenPayload(request);
  if (!payload || payload.role !== "admin") {
    throw new ForbiddenError("Solo los administradores pueden actualizar el stock.");
  }

  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));

  if (body.stock === undefined || Number.isNaN(Number(body.stock)) || Number(body.stock) < 0) {
    return NextResponse.json({ message: "El nuevo stock debe ser un número mayor o igual a 0." }, { status: 400 });
  }

  const existing = findById<DbProduct>("products", id);
  if (!existing) {
    return NextResponse.json({ message: "Producto no encontrado." }, { status: 404 });
  }

  const updated = updateRecord<DbProduct>("products", id, {
    stock: Number(body.stock),
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json({ data: updated });
});