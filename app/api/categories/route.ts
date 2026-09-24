// app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { insertRecord, readCollection, generateId } from "@/lib/db";
import { ForbiddenError, getTokenPayload } from "@/lib/auth";
import { apiHandler } from "@/lib/api";
import type { DbCategory } from "@/types/db";

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

export async function GET() {
  const categories = readCollection<DbCategory>("categories");
  return NextResponse.json({ data: categories, meta: { total: categories.length } });
}

export const POST = apiHandler(async (request: NextRequest) => {
  const payload = getTokenPayload(request);
  if (!payload || payload.role !== "admin") {
    throw new ForbiddenError("Solo los administradores pueden crear categorías.");
  }

  const body = await request.json().catch(() => ({}));
  const name = String(body?.name ?? "").trim();

  if (!name) {
    return NextResponse.json({ message: "El nombre de la categoría es obligatorio." }, { status: 400 });
  }

  const category: DbCategory = {
    id: generateId("cat"),
    slug: body?.slug ? toSlug(String(body.slug)) : toSlug(name),
    name,
    description: body?.description ? String(body.description) : undefined,
    imageUrl: body?.imageUrl ? String(body.imageUrl) : undefined,
  };

  insertRecord("categories", category);

  return NextResponse.json({ data: category }, { status: 201 });
});