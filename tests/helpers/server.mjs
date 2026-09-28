// tests/helpers/server.mjs
// Devuelve una URL base con el servidor de la app levantada.
//
// Si BASE_URL apunta a algo que ya responde, lo reutiliza (así se prueba
// contra el `npm run dev` que tengas abierto). Si no, arranca su propio
// `next dev` en un puerto aparte, usando un .next propio: Next bloquea dos
// servidores de desarrollo que comparten la misma carpeta de compilación.

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Nombre fijo: si cambiara por pid, Next añadiría una entrada nueva al include
// de tsconfig.json en cada ejecución y ensuciaría el repo.
const DIST_DIR = ".next-test";
const NEXT_BIN = join(process.cwd(), "node_modules", "next", "dist", "bin", "next");

async function ping(url, timeoutMs = 1500) {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    return res.status > 0;
  } catch {
    return false;
  }
}

/**
 * @param {object} [opts]
 * @param {string} [opts.baseUrl] URL a reutilizar si ya está levantada.
 * @param {number} [opts.port]    Puerto del servidor propio.
 * @param {number} [opts.timeoutMs] Margen para el primer arranque en frío.
 * @returns {Promise<{baseUrl: string, stop: () => Promise<void>, reused: boolean}>}
 */
export async function ensureServer({ baseUrl, port = 3111, timeoutMs = 180_000 } = {}) {
  const external = baseUrl || process.env.BASE_URL;
  if (external) {
    if (await ping(external)) {
      return { baseUrl: external, reused: true, stop: async () => {} };
    }
    if (baseUrl) throw new Error(`No hay servidor en ${baseUrl}. Levántalo o quita BASE_URL.`);
  }

  const target = `http://127.0.0.1:${port}`;
  if (await ping(target)) {
    return { baseUrl: target, reused: true, stop: async () => {} };
  }

  if (!existsSync(NEXT_BIN)) {
    throw new Error(`No encuentro el binario de Next en ${NEXT_BIN}. Ejecuta npm install.`);
  }

  // Se invoca con node directamente en vez de con npx: en Windows, npx es un
  // .cmd y necesita shell:true, que además dispara DEP0190.
  const child = spawn(process.execPath, [NEXT_BIN, "dev", "--port", String(port)], {
    env: { ...process.env, NEXT_DIST_DIR: DIST_DIR, BROWSER: "none" },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let log = "";
  child.stdout.on("data", (b) => (log += b));
  child.stderr.on("data", (b) => (log += b));
  child.on("error", (e) => (log += `\n${e.message}`));

  let exited = false;
  child.on("exit", () => (exited = true));

  // El arranque en frío compila toda la app: hay que darle margen.
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await ping(`${target}/api/health`)) {
      return {
        baseUrl: target,
        reused: false,
        stop: async () => {
          child.kill();
          await sleep(500);
          // Sin borrar: la carpeta es gitignored y conservarla hace que las
          // siguientes ejecuciones arranquen en caliente.
        },
      };
    }
    if (exited) {
      throw new Error(`El servidor de tests se cerró antes de responder:\n${log.slice(-2000)}`);
    }
    await sleep(1000);
  }

  child.kill();
  throw new Error(
    `El servidor de tests no respondió en ${target} en ${timeoutMs / 1000} s:\n${log.slice(-2000)}`
  );
}
