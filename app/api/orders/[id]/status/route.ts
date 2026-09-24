// app/api/orders/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { findById, updateRecord } from "@/lib/db";
import { ForbiddenError, getTokenPayload } from "@/lib/auth";
import { apiHandler } from "@/lib/api";
import type { DbOrder, DbOrderStatus } from "@/types/db";

const VALID_STATUSES: DbOrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

export const PATCH = apiHandler(async (request: NextRequest, ctx: RouteContext<"/api/orders/[id]/status">) => {
  const payload = getTokenPayload(request);
  if (!payload || payload.role !== "admin") {
    throw new ForbiddenError("Solo los administradores pueden actualizar el estado de una orden.");
  }

  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));
  const status = body?.status;

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ message: "Estado de orden inválido." }, { status: 400 });
  }

  const existing = findById<DbOrder>("orders", id);
  if (!existing) {
    return NextResponse.json({ message: "Orden no encontrada." }, { status: 404 });
  }

  const updated = updateRecord<DbOrder>("orders", id, {
    status,
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json({ data: updated });
});