// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { readCollection } from "@/lib/db";
import { ForbiddenError, getCurrentUser } from "@/lib/auth";
import { apiHandler } from "@/lib/api";
import type { DbUser } from "@/types/db";

export const GET = apiHandler(async (request: NextRequest) => {
  const user = getCurrentUser(request);
  if (!user || user.role !== "admin") {
    throw new ForbiddenError("Solo los administradores pueden ver la lista de usuarios.");
  }

  const users = readCollection<DbUser>("users")
    .map((u) => ({ ...u, passwordHash: undefined as unknown }))
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

  return NextResponse.json({ data: users, meta: { total: users.length } });
});