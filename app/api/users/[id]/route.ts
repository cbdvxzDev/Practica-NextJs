// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { findById, readCollection, updateRecord } from "@/lib/db";
import { ForbiddenError, getCurrentUser } from "@/lib/auth";
import { isOrderOwnedBy } from "@/utils/orderOwnership";
import { apiHandler } from "@/lib/api";
import type { DbOrder, DbUser } from "@/types/db";

export const GET = apiHandler(async (request: NextRequest, ctx: RouteContext<"/api/users/[id]">) => {
  const user = getCurrentUser(request);
  if (!user || user.role !== "admin") {
    throw new ForbiddenError("Solo los administradores pueden ver el detalle de un usuario.");
  }

  const { id } = await ctx.params;
  const target = findById<DbUser>("users", id);
  if (!target) {
    return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
  }

  const orders = readCollection<DbOrder>("orders").filter((o) => isOrderOwnedBy(o, target));

  return NextResponse.json({
    data: {
      ...target,
      passwordHash: undefined as unknown,
      orders,
    },
  });
});

export const PATCH = apiHandler(async (request: NextRequest, ctx: RouteContext<"/api/users/[id]">) => {
  const user = getCurrentUser(request);
  if (!user || user.role !== "admin") {
    throw new ForbiddenError("Solo los administradores pueden editar usuarios.");
  }

  const { id } = await ctx.params;
  const existing = findById<DbUser>("users", id);
  if (!existing) {
    return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const updates: Partial<DbUser> = {};

  if (body.name !== undefined) updates.name = String(body.name);
  if (body.isActive !== undefined) updates.isActive = Boolean(body.isActive);
  if (body.role !== undefined && ["admin", "customer", "support"].includes(body.role)) {
    updates.role = body.role;
  }

  const updated = updateRecord<DbUser>("users", id, updates);

  return NextResponse.json({
    data: { ...updated, passwordHash: undefined as unknown },
  });
});