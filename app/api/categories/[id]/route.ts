// app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { deleteRecord, findById, updateRecord } from "@/lib/db";
import { ForbiddenError, getTokenPayload } from "@/lib/auth";
import { apiHandler } from "@/lib/api";
import type { DbCategory } from "@/types/db";

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/categories/[id]">) {
  const { id } = await ctx.params;
  const category = findById<DbCategory>("categories", id);

  if (!category) {
    return NextResponse.json({ message: "Categoría no encontrada." }, { status: 404 });
  }

  return NextResponse.json({ data: category });
}

export const PUT = apiHandler(async (request: NextRequest, ctx: RouteContext<"/api/categories/[id]">) => {
  const payload = getTokenPayload(request);
  if (!payload || payload.role !== "admin") {
    throw new ForbiddenError("Solo los administradores pueden editar categorías.");
  }

  const { id } = await ctx.params;
  const existing = findById<DbCategory>("categories", id);
  if (!existing) {
    return NextResponse.json({ message: "Categoría no encontrada." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const updated = updateRecord<DbCategory>("categories", id, {
    name: body.name !== undefined ? String(body.name) : existing.name,
    slug: body.slug !== undefined ? String(body.slug) : existing.slug,
    description: body.description !== undefined ? String(body.description) : existing.description,
    imageUrl: body.imageUrl !== undefined ? String(body.imageUrl) : existing.imageUrl,
  });

  return NextResponse.json({ data: updated });
});

export const DELETE = apiHandler(async (request: NextRequest, ctx: RouteContext<"/api/categories/[id]">) => {
  const payload = getTokenPayload(request);
  if (!payload || payload.role !== "admin") {
    throw new ForbiddenError("Solo los administradores pueden eliminar categorías.");
  }

  const { id } = await ctx.params;
  const removed = deleteRecord("categories", id);

  if (!removed) {
    return NextResponse.json({ message: "Categoría no encontrada." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
});