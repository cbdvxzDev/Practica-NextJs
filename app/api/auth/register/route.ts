// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { insertRecord, readCollection, generateId } from "@/lib/db";
import { createSessionToken, hashPassword, toPublicUser } from "@/lib/auth";
import type { DbUser } from "@/types/db";


export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");

  if (!name || !email || !password) {
    return NextResponse.json(
      { message: "Nombre, correo electrónico y contraseña son obligatorios." },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ message: "El correo electrónico no es válido." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ message: "La contraseña debe tener al menos 8 caracteres." }, { status: 400 });
  }

  const existing = readCollection<DbUser>("users").find((u) => u.email.toLowerCase() === email);
  if (existing) {
    return NextResponse.json(
      { message: "Ya existe una cuenta registrada con este correo electrónico." },
      { status: 409 }
    );
  }

  const user: DbUser = {
    id: generateId("usr"),
    email,
    name,
    role: "customer",
    isActive: true,
    avatarUrl: "",
    createdAt: new Date().toISOString(),
    passwordHash: hashPassword(password),
  };

  insertRecord("users", user);
  const token = createSessionToken(user);

  return NextResponse.json(
    {
      token,
      user: toPublicUser(user),
    },
    { status: 201 }
  );
}
