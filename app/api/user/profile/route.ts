// app/api/user/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { updateRecord } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { DbUser } from "@/types/db";

export async function GET(request: NextRequest) {
  const user = getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  return NextResponse.json({ user });
}

export async function PUT(request: NextRequest) {
  const user = getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const updates: Partial<DbUser> = {
    name: body.name !== undefined ? String(body.name).trim() : user.name,
    email: body.email !== undefined ? String(body.email).trim().toLowerCase() : user.email,
    avatarUrl: body.avatarUrl !== undefined ? String(body.avatarUrl) : user.avatarUrl,
    isActive: user.isActive,
    role: user.role,
  };

  const updated = updateRecord<DbUser>("users", user.id, updates);

  return NextResponse.json({
    user: { ...(updated as DbUser), passwordHash: undefined as unknown },
  });
}