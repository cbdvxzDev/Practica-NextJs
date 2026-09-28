// app/lib/validation.ts
// Validación compartida por los Route Handlers.
//
// Antes cada ruta repetía su propio regex de correo y sus propios `if`. Aquí se
// centraliza para que el cliente y el servidor apliquen exactamente la misma
// regla, y para poder devolver todos los errores de un golpe en vez de obligar
// al usuario a corregir un campo cada vez.

/**
 * Regex de correo deliberadamente simple: `algo@dominio.tld`.
 * Los controles reales de entregabilidad (MX, disposable, typos) son de otro
 * orden; para una tienda esto es suficiente y evita falsos negativos.
 */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: unknown): boolean {
  return typeof value === "string" && EMAIL_PATTERN.test(value.trim());
}

/** Normaliza a minúsculas y sin espacios: así "  Ana@Correo.COM " no duplica registros. */
export function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

/** Lee un campo de texto como string limpio. */
export function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Colapsa espacios y saltos de línea redundantes, y corta de largo. */
export function normalizeMessage(value: string, maxLength: number): string {
  const collapsed = value.replace(/\r\n/g, "\n").replace(/[ \t]{2,}/g, " ").trim();
  return collapsed.length > maxLength ? collapsed.slice(0, maxLength) : collapsed;
}

export type FieldErrors = Record<string, string[]>;

export interface ErrorBag {
  /** Añade un error a un campo. Varios errores en el mismo campo se acumulan. */
  add(field: string, message: string): void;
  /** Comprueba y normaliza un campo de texto obligatorio. Devuelve "" si está mal. */
  text(field: string, value: unknown, label: string, max: number): string;
  /** Igual que `text`, pero opcional: si viene vacío no hay error. */
  optionalText(field: string, value: unknown, label: string, max: number): string;
  /** Comprueba un correo y lo devuelve normalizado. */
  email(field: string, value: unknown, label?: string): string;
  /** Comprueba que el valor esté en la lista permitida. */
  oneOf<T extends string>(field: string, value: unknown, allowed: readonly T[], label: string): T | null;
  /** Número de campos con error. */
  readonly count: number;
  /** `true` si no hay ningún error. */
  readonly ok: boolean;
  /** Los errores en el formato que espera `ApiError`. */
  toJSON(): FieldErrors;
}

/**
 * Acumula los errores de un formulario para devolverlos todos de una vez.
 *
 * Es una clase y no un objeto literal porque `oneOf` es genérico: el tipado
 * contextual de un literal no pone el parámetro genérico en el alcance del
 * cuerpo del método, y ahí solo quedaría un `any` silencioso.
 */
class Bag implements ErrorBag {
  private readonly errors: FieldErrors = {};

  add(field: string, message: string): void {
    (this.errors[field] ??= []).push(message);
  }

  get count(): number {
    return Object.keys(this.errors).length;
  }

  get ok(): boolean {
    return this.count === 0;
  }

  toJSON(): FieldErrors {
    return this.errors;
  }

  text(field: string, value: unknown, label: string, max: number): string {
    const clean = cleanText(value);
    if (!clean) {
      this.add(field, `${label} es obligatorio.`);
      return "";
    }
    if (clean.length > max) {
      this.add(field, `${label} no puede superar los ${max} caracteres.`);
      return "";
    }
    return clean;
  }

  optionalText(field: string, value: unknown, label: string, max: number): string {
    const clean = cleanText(value);
    if (!clean) return "";
    if (clean.length > max) {
      this.add(field, `${label} no puede superar los ${max} caracteres.`);
      return "";
    }
    return clean;
  }

  email(field: string, value: unknown, label = "El correo electrónico"): string {
    const clean = normalizeEmail(value);
    if (!clean) {
      this.add(field, `${label} es obligatorio.`);
      return "";
    }
    if (!EMAIL_PATTERN.test(clean)) {
      this.add(field, `${label} no es válido.`);
      return "";
    }
    return clean;
  }

  oneOf<T extends string>(field: string, value: unknown, allowed: readonly T[], label: string): T | null {
    const clean = cleanText(value);
    if (!(allowed as readonly string[]).includes(clean)) {
      this.add(field, `${label} no es una opción válida.`);
      return null;
    }
    return clean as T;
  }
}

export function errorBag(): ErrorBag {
  return new Bag();
}
