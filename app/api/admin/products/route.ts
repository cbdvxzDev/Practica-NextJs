// app/api/admin/products/route.ts
// Lista de gestión para el panel: activos y dados de baja.
//
// En local esta ruta existe para que el panel funcione igual que contra el
// backend Spring, donde GET /api/admin/products es la única que devuelve los
// productos inactivos (la pública solo los activos).

import { NextRequest, NextResponse } from "next/server";
import { getTokenPayload } from "@/lib/auth";
import { readCollection } from "@/lib/db";
import type { DbProduct } from "@/types/db";

export async function GET(request: NextRequest) {
  const payload = getTokenPayload(request);

  // 401 sin sesión y 403 con sesión de cliente: la misma distinción que hace
  // el backend entre "todavía no ha dicho quién es" y "no tiene permiso".
  if (!payload) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }
  if (payload.role !== "admin" && payload.role !== "support") {
    return NextResponse.json(
      { message: "No tienes permisos para ver la gestión de productos." },
      { status: 403 }
    );
  }

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
