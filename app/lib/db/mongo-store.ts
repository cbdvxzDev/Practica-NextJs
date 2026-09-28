// app/lib/db/mongo-store.ts
// Motor sobre MongoDB (Atlas o local). Se activa solo si existe MONGODB_URI.
//
// Cómo funciona y por qué:
// El resto de la app llama a readCollection/writeCollection de forma SINCRONA
// (miles de llamadas en rutas, páginas y servicios). El driver de Mongo es
// asíncrono, así que este motor mantiene la misma caché en memoria que el
// store de JSON y la llena una vez en `connect()`, que se invoca desde
// app/instrumentation.ts antes de servir la primera peticion.
//
// Las escrituras actualizan la cache al instante y se envian a Mongo sin
// bloquear la respuesta. Para un portafolio es mas que suficiente; en un sistema
// con concurrencia real habria que esperar el write antes de responder.

import type { Collection, Db, Document, MongoClient } from "mongodb";
import type { CollectionName, DataStore } from "./types";

const CLIENT_KEY = Symbol.for("practica-nextjs.mongo.client");
const CACHE_KEY = Symbol.for("practica-nextjs.mongo.cache");

type GlobalWithMongo = typeof globalThis & {
  [CLIENT_KEY]?: MongoClient;
  [CACHE_KEY]?: Map<CollectionName, unknown[]>;
};

/* El _id de Mongo no puede ser un string arbitrario como "prod-1" sin mapear,
   asi que se guarda el id de negocio en el campo `id` y se deja que Mongo
   gestione el _id propio. */
const client = globalThis as GlobalWithMongo;

function cache(): Map<CollectionName, unknown[]> {
  if (!client[CACHE_KEY]) client[CACHE_KEY] = new Map();
  return client[CACHE_KEY]!;
}

function db(): Db | null {
  return client[CLIENT_KEY]?.db() ?? null;
}

function col(collection: CollectionName): Collection | null {
  return db()?.collection(collection) ?? null;
}

function readCollection<T>(collection: CollectionName): T[] {
  const hit = cache().get(collection);
  return hit ? ([...hit] as T[]) : [];
}

/* Las escrituras se encadenan en una sola cola.
   Antes cada escritura lanzaba su propia promesa sin esperar: dos peticiones
   simultaneas se pisaban, porque una insertaba sobre un borrado que la otra
   todavia no habia ejecutado, y un fallo a mitad dejaba la coleccion vacia.
   La cola las ejecuta de una en una y en orden. */
let writeQueue: Promise<unknown> = Promise.resolve();

function enqueueWrite(task: () => Promise<unknown>): void {
  writeQueue = writeQueue.then(task).catch((error) => {
    console.error("[db] Escritura en Mongo falló:", error);
  });
}

function writeCollection<T>(collection: CollectionName, data: T[]): void {
  cache().set(collection, data);

  const target = col(collection);
  if (!target) return;

  /* Sin await a proposito: la cache ya refleja el cambio para esta peticion y
     el resto de la app es sincrono. `void` deja claro que es intencionado. */
  void enqueueWrite(async () => {
    /* Reemplazar documento a documento en vez de borrar la coleccion entera e
       insertarla de nuevo. Con deleteMany + insertMany, un fallo a mitad dejaba
       la coleccion vacia, y dos escrituras simultaneas se pisaban: la segunda
       insertaba sobre un borrado que todavia no habia ocurrido. Con bulkWrite
       cada operacion es idempotente y solo se toca lo que cambio. */
    const ids = data
      .map((record) => (record as { id?: unknown }).id)
      .filter((id): id is string => typeof id === "string");

    const operations = data.map((record) => ({
      replaceOne: {
        filter: { id: (record as { id: string }).id },
        // T no esta restringido a Document, pero en la practica las colecciones
        // guardan objetos planos que Mongo acepta tal cual.
        replacement: record as unknown as Document,
        upsert: true,
      },
    }));

    if (operations.length > 0) {
      await target.bulkWrite(operations, { ordered: false });
    }

    /* Borra solo lo que ya no esta en la cache. Con la lista vacia, $nin: []
       coincide con todos los documentos, que es justo lo que hay que hacer. */
    await target.deleteMany({ id: { $nin: ids } });
  });
}

function insertRecord<T extends { id: string }>(collection: CollectionName, record: T): T {
  const records = readCollection<T>(collection);
  records.push(record);
  writeCollection(collection, records);
  return record;
}

function updateRecord<T extends { id: string }>(
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

function deleteRecord<T extends { id: string }>(collection: CollectionName, id: string): boolean {
  const records = readCollection<T>(collection);
  const nextRecords = records.filter((r) => r.id !== id);
  const removed = nextRecords.length !== records.length;
  if (removed) writeCollection(collection, nextRecords);
  return removed;
}

function findById<T extends { id: string }>(collection: CollectionName, id: string): T | undefined {
  return readCollection<T>(collection).find((r) => r.id === id);
}

async function connect(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("[db] MONGODB_URI no esta definida pero se pidio el motor de Mongo.");
  }

  if (!client[CLIENT_KEY]) {
    const { MongoClient } = await import("mongodb");
    const instance = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
    await instance.connect();
    client[CLIENT_KEY] = instance;
  }

  /* Se llena la cache una vez: a partir de aqui todo es sincrono. */
  const database = client[CLIENT_KEY]!.db();
  for (const name of ["products", "categories", "users", "orders", "subscribers", "contactMessages"] as CollectionName[]) {
    const docs = await database.collection(name).find({}).toArray();
    // Se quita el _id que agrega Mongo: el resto de la app no lo espera.
    const clean = docs.map((doc) => {
      const { _id, ...rest } = doc as Record<string, unknown>;
      void _id;
      return rest;
    });
    cache().set(name, clean);
  }
}

async function disconnect(): Promise<void> {
  // Sin esta espera, cerrar el cliente con escrituras encoladas las aborta.
  await writeQueue.catch(() => undefined);
  await client[CLIENT_KEY]?.close();
  delete client[CLIENT_KEY];
  delete client[CACHE_KEY];
  writeQueue = Promise.resolve();
}

export const mongoStore: DataStore = {
  name: "mongo",
  readCollection,
  writeCollection,
  insertRecord,
  updateRecord,
  deleteRecord,
  findById,
  connect,
  disconnect,
};
