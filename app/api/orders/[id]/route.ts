// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { findById } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { isOrderOwnedBy } from "@/utils/orderOwnership";
import type { DbOrder } from "@/types/db";

export async function GET(request: NextRequest, ctx: RouteContext<"/api/orders/[id]">) {
  const user = getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const order = findById<DbOrder>("orders", id);

  if (!order) {
    return NextResponse.json({ message: "Orden no encontrada." }, { status: 404 });
  }

  const isOwner = isOrderOwnedBy(order, user);
  if (!isOwner && user.role !== "admin" && user.role !== "support") {
    return NextResponse.json({ message: "No autorizado." }, { status: 403 });
  }

  return NextResponse.json({ data: order });
}