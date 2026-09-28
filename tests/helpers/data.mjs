// tests/helpers/data.mjs
// Los tests de integración escriben en data/*.json (crean pedidos, restan
// stock, registran usuarios). Para no dejar el repositorio sucio, se saca una
// copia antes de la suite y se restaura al terminar, pase lo que pase.

import { existsSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DATA_DIR = join(process.cwd(), "data");

/** Copia en memoria de todas las colecciones. */
export function snapshotData() {
  const snapshot = {};
  for (const file of readdirSync(DATA_DIR)) {
    if (!file.endsWith(".json")) continue;
    snapshot[file] = readFileSync(join(DATA_DIR, file), "utf-8");
  }
  return snapshot;
}

/** Vuelve a dejar los archivos como estaban. */
export function restoreData(snapshot) {
  for (const [file, contents] of Object.entries(snapshot)) {
    writeFileSync(join(DATA_DIR, file), contents, "utf-8");
  }
}

export function readData(name) {
  const path = join(DATA_DIR, `${name}.json`);
  return existsSync(path) ? JSON.parse(readFileSync(path, "utf-8")) : [];
}
