// app/api/products/slug/[slug]/route.ts
import { NextResponse } from "next/server";
import { readCollection } from "@/lib/db";
import type { DbProduct } from "@/types/db";

export async function GET(_request: Request, ctx: RouteContext<"/api/products/slug/[slug]">) {
  const { slug } = await ctx.params;
  const product = readCollection<DbProduct>("products").find((p) => p.slug === slug && p.isActive);

  if (!product) {
    return NextResponse.json({ message: "Producto no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ data: product });
}