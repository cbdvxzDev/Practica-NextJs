// app/api/user/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { readCollection, updateRecord } from "@/lib/db";
import { getCurrentUser, toPublicUser } from "@/lib/auth";
import type { DbUser } from "@/types/db";

export async function GET(request: NextRequest) {
  const user = getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  return NextResponse.json({ user: toPublicUser(user) });
}

export async function PUT(request: NextRequest) {
  const user = getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const name = body.name !== undefined ? String(body.name).trim() : user.name;
  const email = body.email !== undefined ? String(body.email).trim().toLowerCase() : user.email;

  if (!name) {
    return NextResponse.json({ message: "El nombre no puede quedar vacío." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ message: "El correo electrónico no es válido." }, { status: 400 });
  }

  // El correo es la clave de acceso: no puede repetir el de otra cuenta.
  if (email !== user.email) {
    const taken = readCollection<DbUser>("users").some(
      (u) => u.id !== user.id && u.email.toLowerCase() === email
    );
    if (taken) {
      return NextResponse.json(
        { message: "Ese correo ya está registrado en otra cuenta." },
        { status: 409 }
      );
    }
  }

  // `role` e `isActive` nunca se tocan desde el perfil del cliente.
  const updated = updateRecord<DbUser>("users", user.id, {
    name,
    email,
    avatarUrl: body.avatarUrl !== undefined ? String(body.avatarUrl) : user.avatarUrl,
  });

  if (!updated) {
    return NextResponse.json({ message: "No se pudo actualizar el perfil." }, { status: 500 });
  }

  return NextResponse.json({ user: toPublicUser(updated) });
}