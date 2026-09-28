// app/lib/db.ts
// Fachada de la capa de datos.
//
// Hay dos motores con la misma interfaz (`app/lib/db/types.ts`):
//   - json  (por defecto): archivos en /data, sin dependencias ni configuracion.
//   - mongo: se activa solo con MONGODB_URI en el entorno.
//
// El resto de la app importa siempre desde "@/lib/db", asi que migrar a Mongo
// no obliga a tocar ninguna ruta API, pagina ni servicio.

import type { CollectionName, DataStore } from "./db/types";
import { jsonStore } from "./db/json-store";

export type { CollectionName, DataStore } from "./db/types";

/**
 * Decide el motor segun el entorno.
 *
 * `NEXT_PHASE` se usa para no arrastrar el driver de Mongo al build: `next
 * build` prerenderiza paginas y ahi no hay ninguna conexion que valga.
 */
function pickStore(): DataStore {
  const isBuild = process.env.NEXT_PHASE === "phase-production-build" || process.env.NEXT_PHASE === "phase-export";
  if (isBuild || !process.env.MONGODB_URI) return jsonStore;

  // Import diferido: si MONGODB_URI no esta, `mongodb` ni se carga.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { mongoStore } = require("./db/mongo-store") as typeof import("./db/mongo-store");
  return mongoStore;
}

let store: DataStore | undefined;

function active(): DataStore {
  if (!store) store = pickStore();
  return store;
}

/**
 * Abre la conexion del motor. La invoca `app/instrumentation.ts` al arrancar el
 * servidor, de modo que la cache de Mongo este lista antes de la primera
 * peticion y las llamadas sincronas devuelvan datos de verdad.
 */
export async function connectDataStore(): Promise<void> {
  const selected = active();
  if (selected.name === "mongo") {
    try {
      await selected.connect();
      console.log("[db] Motor activo: mongo");
    } catch (error) {
      /* Si Atlas no responde se cae al motor de JSON en vez de dejar la tienda
         sin datos, que es peor para una demo. */
      console.error("[db] No se pudo conectar a Mongo, se usa el motor json:", error);
      store = jsonStore;
    }
  }
}

export function dataStoreName(): DataStore["name"] {
  return active().name;
}

/**
 * Lee el contenido completo de una colección. Si el archivo no existe, devuelve [].
 */
export function readCollection<T>(collection: CollectionName): T[] {
  return active().readCollection<T>(collection);
}

/**
 * Sobrescribe una colección completa.
 */
export function writeCollection<T>(collection: CollectionName, data: T[]): void {
  active().writeCollection<T>(collection, data);
}

/**
 * Inserta un nuevo registro y devuelve el elemento insertado.
 */
export function insertRecord<T extends { id: string }>(collection: CollectionName, record: T): T {
  return active().insertRecord<T>(collection, record);
}

/**
 * Actualiza un registro por id y devuelve el registro actualizado (o undefined si no existe).
 */
export function updateRecord<T extends { id: string }>(
  collection: CollectionName,
  id: string,
  updates: Partial<T>
): T | undefined {
  return active().updateRecord<T>(collection, id, updates);
}

/**
 * Elimina un registro por id y devuelve true si existía.
 */
export function deleteRecord(collection: CollectionName, id: string): boolean {
  return active().deleteRecord(collection, id);
}

export function findById<T extends { id: string }>(collection: CollectionName, id: string): T | undefined {
  return active().findById<T>(collection, id);
}

/**
 * Genera un id simple y único con prefijo.
 */
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
