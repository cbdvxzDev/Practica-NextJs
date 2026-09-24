// app/lib/auth.ts
// Mini autenticación para el backend local: tokens firmados + hash de contraseñas.

import crypto from "crypto";
import type { NextRequest } from "next/server";
import { findById } from "./db";
import type { DbUser } from "@/types/db";

const SECRET = process.env.AUTH_SECRET || "giborsec-dev-secret-2026";
const TOKEN_TTL_SECONDS = 60 * 60 * 24; // 24 horas

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

function b64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

/**
 * Firma un payload y produce un token: base64url(payload).hmacHex
 */
export function signToken(payload: TokenPayload): string {
  const encoded = b64url(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(encoded)
    .digest("hex");
  return `${encoded}.${signature}`;
}

/**
 * Verifica un token y devuelve su payload. null si es inválido o expiró.
 */
export function verifyToken(token: string | null | undefined): TokenPayload | null {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = crypto.createHmac("sha256", SECRET).update(encoded).digest("hex");
  const a = Buffer.from(signature, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf-8")) as TokenPayload;
    if (!payload.sub || payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

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
 * Crea un token para un usuario.
 */
export function createSessionToken(user: DbUser): string {
  const now = Math.floor(Date.now() / 1000);
  return signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  });
}
