// scripts/seed-mongo.mjs
// Sembra MongoDB (Atlas o local) con las colecciones de /data.
//
// Uso (idempotente: hace upsert por `id`, se puede repetir sin duplicar):
//   MONGODB_URI="mongodb+srv://..." node scripts/seed-mongo.mjs
//
// Es la parte que no hace la app: al conectar con MONGODB_URI vacia, el
// motor de Mongo arranca con colecciones vacias y la tienda se veria en
// blanco. Este script carga productos, categorias y usuarios de ejemplo.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Falta MONGODB_URI en el entorno.");
  process.exit(1);
}

const collections = [
  "products",
  "categories",
  "users",
  "orders",
  "subscribers",
  "contactMessages",
];

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });

try {
  await client.connect();
  // db() sin argumento usa la base del path de la URI (igual que app/lib/db.ts).
  const db = client.db();

  for (const name of collections) {
    const file = path.join(process.cwd(), "data", `${name}.json`);
    if (!existsSync(file)) continue;

    const docs = JSON.parse(readFileSync(file, "utf8"));
    const operations = docs
      .filter((doc) => doc && typeof doc.id === "string")
      .map((doc) => ({
        replaceOne: { filter: { id: doc.id }, replacement: doc, upsert: true },
      }));

    if (operations.length > 0) {
      await db.collection(name).bulkWrite(operations, { ordered: false });
    }
    console.log(`${name}: ${operations.length} documentos`);
  }

  console.log("Seed completado.");
} finally {
  await client.close();
}
