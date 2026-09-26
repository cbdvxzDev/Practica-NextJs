// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { insertRecord, readCollection, updateRecord } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { isOrderOwnedBy } from "@/utils/orderOwnership";
import type { DbOrder, DbProduct } from "@/types/db";

const FREE_SHIPPING_THRESHOLD = 200000;
const SHIPPING_COST = 12000;

export async function GET(request: NextRequest) {
  const user = getCurrentUser(request);

  // Público: devuelve solo tus propias órdenes (requiere sesión)
  if (!user) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  // Del pedido más reciente al más antiguo.
  let orders = readCollection<DbOrder>("orders").sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );

  if (user.role !== "admin" && user.role !== "support") {
    // Por id de usuario, no por email: el cliente puede cambiar su correo y
    // aun así debe conservar el historial.
    orders = orders.filter((o) => isOrderOwnedBy(o, user));
  }

  return NextResponse.json({ data: orders, meta: { total: orders.length } });
}

export async function POST(request: NextRequest) {
  const user = getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ message: "Debes iniciar sesión para completar tu compra." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const items = body?.items as { productId: string; quantity: number; size?: string }[] | undefined;
  const shippingAddress = String(body?.shippingAddress ?? "").trim();

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ message: "El pedido debe incluir al menos un producto." }, { status: 400 });
  }

  if (!shippingAddress) {
    return NextResponse.json({ message: "La dirección de envío es obligatoria." }, { status: 400 });
  }

  const products = readCollection<DbProduct>("products");
  const orderItems: DbOrder["items"] = [];
  let subtotal = 0;

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      return NextResponse.json(
        { message: `El producto con id "${item.productId}" no existe.` },
        { status: 400 }
      );
    }

    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
    if (product.stock < quantity) {
      return NextResponse.json(
        { message: `Stock insuficiente para "${product.title}". Disponibles: ${product.stock}.` },
        { status: 409 }
      );
    }

    const size = typeof item.size === "string" && item.size.trim() ? item.size.trim() : undefined;
    if (size && !product.sizes.includes(size)) {
      return NextResponse.json(
        { message: `La talla "${size}" no está disponible para "${product.title}".` },
        { status: 400 }
      );
    }

    subtotal += product.price * quantity;

    // Dos tallas del mismo producto son líneas distintas del pedido.
    const existingLine = orderItems.find(
      (line) => line.name === product.title && (line.size ?? undefined) === size
    );
    if (existingLine) {
      existingLine.quantity += quantity;
    } else {
      orderItems.push({
        name: product.title,
        quantity,
        price: product.price,
        image: product.images[0],
        slug: product.slug,
        size,
      });
    }

    updateRecord<DbProduct>("products", product.id, {
      stock: product.stock - quantity,
      updatedAt: new Date().toISOString(),
    });
  }

  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const now = new Date();
  const date = now.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });

  // El consecutivo se deriva del mayor ID existente, no del tamaño del arreglo:
  // contar elementos reutilizaba el ID de un pedido eliminado.
  const existingOrders = readCollection<DbOrder>("orders");
  const lastSequence = existingOrders.reduce((max, order) => {
    const match = /(\d+)$/.exec(order.id);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  const orderSequence = lastSequence + 1;

  const order: DbOrder = {
    id: `ORD-${now.getFullYear()}-${String(orderSequence).padStart(3, "0")}`,
    customer: user.name,
    email: user.email,
    userId: user.id,
    date,
    total: subtotal + shippingCost,
    status: "pending",
    paymentStatus: "paid",
    items: orderItems,
    shippingAddress,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  insertRecord("orders", order);

  return NextResponse.json({ data: order }, { status: 201 });
}