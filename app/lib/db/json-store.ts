// app/lib/db/json-store.ts
// Motor por defecto: archivos JSON dentro de /data.
//
// Portabilidad a hosting:
// En plataformas como Vercel o Netlify el filesystem es de solo lectura durante
// el runtime, por lo que las escrituras se mantienen en un caché en memoria que
// permite que la aplicación funcione correctamente durante la sesión activa.

import fs from "fs";
import path from "path";
import type { CollectionName, DataStore } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

function filePath(collection: CollectionName): string {
  return path.join(DATA_DIR, `${collection}.json`);
}

// Caché en memoria: es la fuente de verdad durante el runtime.
const memoryCache = new Map<CollectionName, unknown[]>();

function loadCollection<T>(collection: CollectionName): T[] {
  const cached = memoryCache.get(collection);
  if (cached !== undefined) {
    return [...(cached as T[])];
  }

  const file = filePath(collection);
  let data: T[] = [];
  if (fs.existsSync(file)) {
    try {
      const raw = fs.readFileSync(file, "utf-8");
      data = JSON.parse(raw) as T[];
    } catch (error) {
      console.error(`[db] Error leyendo "${collection}.json":`, error);
    }
  }

  memoryCache.set(collection, data);
  return [...data];
}

/**
 * Lee el contenido completo de una colección. Si el archivo no existe, devuelve [].
 */
export function readCollection<T>(collection: CollectionName): T[] {
  return loadCollection<T>(collection);
}

/**
 * Sobrescribe una colección completa (en disco y en la caché en memoria).
 * Si el filesystem no permite escritura, los cambios persisten en memoria.
 */
export function writeCollection<T>(collection: CollectionName, data: T[]): void {
  memoryCache.set(collection, data);

  try {
    fs.writeFileSync(filePath(collection), JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.warn(
      `[db] No se pudo escribir "${collection}.json"; los cambios se mantienen en memoria.`
    );
    void error;
  }
}

/**
 * Inserta un nuevo registro y devuelve el elemento insertado.
 */
export function insertRecord<T extends { id: string }>(collection: CollectionName, record: T): T {
  const records = readCollection<T>(collection);
  records.push(record);
  writeCollection(collection, records);
  return record;
}

/**
 * Actualiza un registro por id y devuelve el registro actualizado (o undefined si no existe).
 */
export function updateRecord<T extends { id: string }>(
  collection: CollectionName,
  id: string,
  updates: Partial<T>
): T | undefined {
  const records = readCollection<T>(collection);
  const index = records.findIndex((r) => r.id === id);
  if (index === -1) return undefined;

  records[index] = { ...records[index], ...updates };
  writeCollection(collection, records);
  return records[index];
}

/**
 * Elimina un registro por id y devuelve true si existía.
 */
export function deleteRecord<T extends { id: string }>(collection: CollectionName, id: string): boolean {
  const records = readCollection<T>(collection);
  const nextRecords = records.filter((r) => r.id !== id);
  const removed = nextRecords.length !== records.length;
  if (removed) writeCollection(collection, nextRecords);
  return removed;
}

export function findById<T extends { id: string }>(collection: CollectionName, id: string): T | undefined {
  return readCollection<T>(collection).find((r) => r.id === id);
}

export const jsonStore: DataStore = {
  name: "json",
  readCollection,
  writeCollection,
  insertRecord,
  updateRecord,
  deleteRecord,
  findById,
  async connect() {
    /* No hay nada que conectar: el filesystem ya esta disponible. */
  },
  async disconnect() {},
};
