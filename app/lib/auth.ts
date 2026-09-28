// app/lib/auth.ts
// Mini autenticación para el backend local: tokens firmados + hash de contraseñas.

import crypto from "crypto";
import type { NextRequest, NextResponse } from "next/server";
import { findById } from "./db";
import {
  SESSION_COOKIE,
  TOKEN_TTL_SECONDS,
  createSessionToken,
  signToken,
  verifyToken,
} from "./session-token";
import type { TokenPayload } from "./session-token";
import type { DbUser, PublicUser } from "@/types/db";

// La firma del token vive en ./session-token para que proxy.ts pueda verificarla
// sin importar la capa de datos. Se reexporta aquí para no romper los imports.
export { SESSION_COOKIE, TOKEN_TTL_SECONDS, createSessionToken, signToken, verifyToken };
export type { TokenPayload };

/**
 * Extrae y valida el Bearer token del request. Devuelve el payload o null.
 */
export function getTokenPayload(request: NextRequest): TokenPayload | null {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  return verifyToken(token);
}

/**
 * Devuelve la sesión actual (usuario) basándose en el token del request, o null.
 */
export function getCurrentUser(request: NextRequest): DbUser | null {
  const payload = getTokenPayload(request);
  if (!payload) return null;
  const user = findById<DbUser>("users", payload.sub);
  if (!user || !user.isActive) return null;
  return user;
}

/**
 * Requiere sesión. Devuelve el usuario o dispara un error tipado.
 * Uso: const DbUser = requireUser(request) dentro de un handler.
 */
export function requireUser(request: NextRequest): DbUser {
  const user = getCurrentUser(request);
  if (!user) {
    throw new UnauthorizedError();
  }
  return user;
}

export class UnauthorizedError extends Error {
  constructor(message = "No autorizado. Inicia sesión para continuar.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "No tienes permisos para realizar esta acción.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Elimina el hash de contraseña antes de devolver un usuario al cliente.
 */
export function toPublicUser(user: DbUser): PublicUser {
  const { passwordHash, ...rest } = user;
  void passwordHash;
  return rest;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  try {
    const candidate = crypto.scryptSync(password, salt, 64).toString("hex");
    const a = Buffer.from(candidate, "hex");
    const b = Buffer.from(hash, "hex");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Escribe la cookie de sesión en una respuesta.
 *
 * La cookie es httpOnly a propósito: el token sigue en localStorage para que
 * el cliente lo mande como `Authorization: Bearer` en sus llamadas a la API,
 * pero la cookie es la que le permite a `proxy.ts` decidir en el servidor si
 * /admin debe servirse o redirigir. `sameSite: lax` evita que un sitio de
 * terceros pueda navegar usando la sesión del usuario.
 */
export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TOKEN_TTL_SECONDS,
  });
}

/** Borra la cookie de sesión (logout). */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
