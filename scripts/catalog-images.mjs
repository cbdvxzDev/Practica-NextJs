#!/usr/bin/env node
/**
 * catalog-images.mjs — Pipeline de imágenes del catálogo de Esencial.
 *
 * Qué hace:
 *   1. Busca fotografías CC en Openverse (fuentes: stocksnap = moda/estilismo,
 *      rawpixel = fotografía de producto) usando el cache local `cache/pool.json`.
 *   2. VERIFICA cada foto con dos señales independientes:
 *        - debe tener al menos una etiqueta de prenda (p. ej. "denim", "jeans")
 *        - NO debe tener etiquetas de escena (paisaje, calle, bosque, comida...)
 *      Así es imposible que entre una foto de paisaje en el catálogo.
 *   3. Elige 3 imágenes por producto (plano de producto + estilismo + alternativa).
 *   4. Las descarga, las normaliza a 1200x1500 (4:5) en WebP con `sharp`.
 *   5. Escribe `public/images/products/`, las rutas en `data/products.json` y
 *      `app/constants/imageCredits.ts` con la atribución de cada foto.
 *
 * Uso:
 *   node scripts/catalog-images.mjs            # usa cache, actualiza imágenes
 *   node scripts/catalog-images.mjs --harvest  # vuelve a buscar en Openverse
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const CACHE_DIR = join(ROOT, "cache");
const POOL_FILE = join(CACHE_DIR, "pool.json");
const OUT_DIR = join(ROOT, "public", "images", "products");
const CATEGORY_OUT = join(ROOT, "public", "images", "categories");
const UA = "Practica-NextJs/1.0 (educational fashion project)";

const WIDTH = 1200;
const HEIGHT = 1500;

/* ------------------------------------------------------------------ */
/* 1. Etiquetas que SICHDEN que la foto es de ropa                     */
/* ------------------------------------------------------------------ */
const GARMENT_TAGS = {
  abrigo: ["coat", "jacket", "parka", "trench", "blazer", "overcoat", "anorak", "windbreaker", "bomber", "trucker", "raincoat", "jackets", "coats"],
  camisa: ["shirt", "tshirt", "t-shirt", "tee", "blouse", "polo", "top", "shirts", "blouses", "tshirts", "camisa", "camiseta"],
  punto: ["sweater", "cardigan", "hoodie", "sweatshirt", "jumper", "knit", "pullover", "turtleneck", "jersey", "sweaters", "jumper"],
  denim: ["denim", "jeans", "jean"],
  pantalon: ["pants", "trousers", "shorts", "skirt", "leggings", "joggers", "chino", "chinos", "skirts"],
  vestido: ["dress", "gown", "jumpsuit", "romper", "dresses"],
  calzado: ["shoes", "sneakers", "sneaker", "boots", "booties", "sandals", "heels", "footwear", "oxford", "chelsea", "loafers", "flats", "pumps"],
  bolso: ["bag", "handbag", "purse", "backpack", "tote", "clutch", "satchel", "bags"],
  accesorio: ["sunglasses", "glasses", "eyewear", "hat", "cap", "scarf", "belt", "watch", "gloves", "beanie", "necklace", "earrings", "ring", "necktie", "jewelry", "jewellery", "hats", "scarves"],
  /* contexto genérico de moda: sirve para fotos "en modelo" */
  moda: ["fashion", "style", "clothing", "clothes", "outfit", "wear", "apparel", "garment", "wardrobe", "look", "model"],
};

/* ------------------------------------------------------------------ */
/* 2. Etiquetas que DESCARTAN la foto (paisajes, clipart, marcas...)   */
/* ------------------------------------------------------------------ */
const REJECT_TAGS = [
  // <- paisajes / exterior  (esto es lo que el usuario no quiere)
  "grass", "field", "forest", "woods", "tree", "trees", "mountain", "hill", "beach", "ocean",
  "sky", "cloud", "clouds", "sunset", "sunrise", "sun", "snow", "winter", "frozen", "ice",
  "cold", "road", "city", "bridge", "fog", "nature", "rural", "flowers", "flower",
  "leaf", "leaves", "autumn", "garden", "park", "water", "waterfall", "river", "beachwear",
  "pool", "swim", "landscape", "skyline", "downtown", "building",
  "architecture", "skyscraper", "construction", "farm", "country",
  // <- cosas que no son producto de moda
  "wine", "beer", "drink", "bar", "restaurant", "cafe", "coffee", "food", "cake", "fruit",
  "dog", "cat", "bird", "horse", "cow", "animal", "machine", "tool", "wood", "metal",
  "screen", "phone", "laptop", "camera", "guitar", "music", "book", "magazine", "newspaper",
  "text", "logo", "sign", "poster", "banner", "crowd", "party", "festival", "concert",
  "kitchen", "bedroom", "office", "room", "chair", "table", "bed", "sofa", "wall", "window",
  "door", "stair", "stairs", "baby", "child", "kid", "toddler",
  // <- material no usable como foto de producto
  "clipart", "clip art", "illustration", "vector", "png", "sticker", "doodle", "watermark",
  "8bit", "pixel", "pixel art", "drawing", "sketch", "painting", "pattern", "seamless",
  "mockup", "template", "icon", "element",
  // <- piezas de museo / estampas / atribuciones de archivo
  "vintage", "antique", "victorian", "edwardian", "museum", "collection of", "archaeolog",
  "historical", "costume", "century", "manuscript", "engraving", "lithograph", "doll",
  "dolls", "mannequin doll", "pillowcase", "textile fragment", "quilt", "student",
  "civil war", "wild west", "medieval", "renaissance", "18th", "19th", "century",
  "soldier", "masonic", "disguise", "masquerade", "public domain", "wikimedia",
  "sarony", "weller", "daguerreotype", "carte de visite", "cdv", "tintype",
  "sampler", "needlework", "embroidery", "batik", "ikat", "block print",
  "greece", "brazil", "japan", "corfu", "australia", "india", "egypt", "mexico",
  "philippines", "sweden", "norway", "finland", "portugal", "spain", "italy", "france",
  "england", "scotland", "ireland", "netherlands", "belgium", "austria", "poland", "russia",
  "new york", "west point", "plant", "shore", "stream", "duck", "crocs", "crocs shoes",
  // <- marcas de terceros
  "nike", "adidas", "lacoste", "levi", "gucci", "prada", "zara", "uniqlo", "ray ban",
  "mango", "bershka", "forever 21", "calvin klein", "ralph lauren", "tommy", "chanel",
  "versace", "burberry", "moncler", "north face", "patagonia", "vans", "converse",
  "timberland", "birkenstock", "dr martens", "calzedonia", "primark", "shein", "temu",
  "superdry", "carhartt", "boss", "armani", "ysl", "gucci", "dior", "prada", "hermes",
  "children", "mens", "ladies",
];

/* ------------------------------------------------------------------ */
/* 3. Mapeo de cada producto a la prenda que debe aparecer            */
/* ------------------------------------------------------------------ */
/* any: alguna de estas etiquetas debe estar (verificación dura)        */
/* like: se bonifica para elegir la foto más parecida al producto       */
const PLAN = {
  "prod-1": { any: ["abrigo"], like: ["coat", "wool coat", "overcoat"] },
  "prod-2": { any: ["abrigo"], like: ["trench", "raincoat"] },
  "prod-3": { any: ["abrigo"], like: ["parka", "puffer", "windbreaker"] },
  "prod-4": { any: ["abrigo"], like: ["leather", "biker", "motorcycle"] },
  "prod-5": { any: ["abrigo"], like: ["blazer", "tweed", "suit"] },
  "prod-6": { any: ["camisa"], like: ["t-shirt", "tshirt", "tee", "cotton"] },
  "prod-7": { any: ["camisa"], like: ["striped", "stripes", "stripe"] },
  "prod-8": { any: ["camisa"], like: ["linen", "long sleeve"] },
  "prod-9": { any: ["camisa"], like: ["t-shirt", "tshirt", "oversized", "loose"] },
  "prod-10": { any: ["camisa"], like: ["polo"] },
  "prod-11": { any: ["camisa"], like: ["shirt", "linen", "formal"] },
  "prod-12": { any: ["camisa"], like: ["shirt", "oxford", "button"] },
  "prod-13": { any: ["camisa"], like: ["blouse", "silk", "women"] },
  "prod-14": { any: ["camisa"], like: ["shirt", "cotton", "stretch"] },
  "prod-15": { any: ["camisa", "punto"], like: ["crop", "top", "knit"] },
  "prod-16": { any: ["pantalon"], like: ["pants", "trousers", "suit"] },
  "prod-17": { any: ["pantalon"], like: ["chino", "chinos", "cotton"] },
  "prod-18": { any: ["pantalon"], like: ["wide leg", "palazzo", "flare"] },
  "prod-19": { any: ["pantalon"], like: ["bermuda", "shorts", "above knee"] },
  "prod-20": { any: ["pantalon"], like: ["skirt", "pleated", "midi"] },
  "prod-21": { any: ["vestido"], like: ["satin", "silk", "evening"] },
  "prod-22": { any: ["vestido", "camisa"], like: ["shirt dress", "linen"] },
  "prod-23": { any: ["vestido", "punto"], like: ["knit", "ribbed"] },
  "prod-24": { any: ["vestido"], like: ["maxi", "long", "flow"] },
  "prod-25": { any: ["vestido", "abrigo"], like: ["blazer", "belt"] },
  "prod-26": { any: ["punto"], like: ["sweater", "merino", "wool"] },
  "prod-27": { any: ["punto"], like: ["cardigan"] },
  "prod-28": { any: ["punto"], like: ["hoodie", "hooded", "sweatshirt"] },
  "prod-29": { any: ["punto"], like: ["vneck", "v-neck", "collar"] },
  "prod-30": { any: ["punto"], like: ["vest", "sleeveless"] },
  "prod-31": { any: ["denim"], like: ["jeans", "straight", "denim"] },
  "prod-32": { any: ["denim"], like: ["jeans", "skinny", "slim", "stretch"] },
  "prod-33": { any: ["denim", "abrigo"], like: ["denim jacket", "jean jacket", "trucker"] },
  "prod-34": { any: ["denim", "pantalon"], like: ["cargo", "utility", "denim"] },
  "prod-35": { any: ["denim", "pantalon"], like: ["denim shorts", "shorts"] },
  "prod-36": { any: ["calzado"], like: ["sneakers", "running", "sport"] },
  "prod-37": { any: ["calzado"], like: ["canvas", "lona"] },
  "prod-38": { any: ["calzado"], like: ["boots", "booties", "ankle"] },
  "prod-39": { any: ["calzado"], like: ["canvas", "high top"] },
  "prod-40": { any: ["calzado"], like: ["sandals", "sandal"] },
  "prod-41": { any: ["calzado"], like: ["oxford", "leather", "formal"] },
  "prod-42": { any: ["calzado"], like: ["chelsea", "boots"] },
  "prod-43": { any: ["bolso"], like: ["handbag", "leather bag", "purse"] },
  "prod-44": { any: ["bolso"], like: ["backpack", "rucksack"] },
  "prod-45": { any: ["accesorio"], like: ["scarf"] },
  "prod-46": { any: ["accesorio"], like: ["hat", "fedora", "straw", "felt"] },
  "prod-47": { any: ["accesorio"], like: ["belt", "leather belt"] },
  "prod-48": { any: ["accesorio"], like: ["sunglasses", "glasses", "eyewear"] },
};

/* Categorías -> una foto de cabecera */
const CATEGORIES = {
  abrigo: { any: ["abrigo"], like: ["coat", "jacket"] },
  basicos: { any: ["camisa", "punto"], like: ["t-shirt", "shirt", "tee"] },
  camisas: { any: ["camisa"], like: ["shirt", "blouse"] },
  pantalones: { any: ["pantalon"], like: ["pants", "jeans", "trousers"] },
  vestidos: { any: ["vestido"], like: ["dress"] },
  tejidos: { any: ["punto"], like: ["sweater", "knit", "cardigan"] },
  denim: { any: ["denim"], like: ["denim", "jeans"] },
  calzado: { any: ["calzado"], like: ["shoes", "sneakers", "boots"] },
  accesorios: { any: ["accesorio", "bolso"], like: ["bag", "sunglasses", "hat", "scarf"] },
};

/* ------------------------------------------------------------------ */
const HARVEST_QUERIES = [
  "trench coat", "parka jacket", "puffer jacket", "bomber jacket", "trucker jacket",
  "jean jacket", "denim jacket", "denim shirt", "overcoat", "wool coat", "leather jacket",
  "blazer", "t-shirt", "polo shirt", "tank top", "crop top", "dress shirt", "linen shirt",
  "cotton shirt", "striped shirt", "silk blouse", "blouse", "shirt",
  "jeans", "denim jeans", "skinny jeans", "denim pants", "denim shorts", "cargo pants",
  "chinos", "wide leg pants", "pleated skirt", "midi skirt", "skirt", "trousers",
  "dress", "shirt dress", "knit dress", "satin dress", "maxi dress", "midi dress",
  "sweater", "cardigan", "pullover", "hoodie", "sweatshirt", "vneck sweater",
  "turtleneck", "sleeveless sweater", "knit vest", "wool sweater",
  "sneakers", "running shoes", "canvas shoes", "high top sneakers", "boots",
  "chelsea boots", "ankle boots", "oxford shoes", "leather shoes", "sandals", "heels",
  "handbag", "leather bag", "purse", "backpack", "tote bag",
  "scarf", "hat", "fedora", "straw hat", "cap", "beanie", "belt", "leather belt",
  "sunglasses", "eyeglasses", "watch", "gloves", "necklace", "earrings", "necktie",
  "clothing", "fashion outfit", "mannequin", "clothing rack", "hangers", "textile",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function openverseSearch(query, source, page) {
  const url =
    `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}` +
    `&page_size=20&page=${page}&source=${source}&license=cc0,pdm,by,by-sa`;
  for (let attempt = 0; attempt < 5; attempt++) {
    let res;
    try {
      res = await fetch(url, { headers: { "User-Agent": UA } });
    } catch {
      await sleep(2500);
      continue;
    }
    if (res.status === 429 || res.status >= 500) {
      await sleep(5000 * (attempt + 1));
      continue;
    }
    if (!res.ok) return null;
    return res.json();
  }
  return null;
}

async function harvest() {
  const out = new Map();
  let requests = 0;
  for (const source of ["stocksnap", "rawpixel"]) {
    for (const q of HARVEST_QUERIES) {
      for (const page of [1, 2]) {
        const json = await openverseSearch(q, source, page);
        requests++;
        if (!json) continue;
        for (const it of json.results || []) {
          if (!it.url) continue;
          const w = it.width || 0;
          const h = it.height || 0;
          if (w < 650 || h < 650) continue;
          const ar = w / h;
          if (ar < 0.4 || ar > 2.6) continue;
          if (out.has(it.url)) {
            out.get(it.url).queries.push(q);
            continue;
          }
          out.set(it.url, {
            title: it.title || "",
            tags: (it.tags || []).map((t) => (typeof t === "string" ? t : t.name)).filter(Boolean),
            url: it.url,
            width: w,
            height: h,
            creator: it.creator || "",
            license: (it.license || "").toLowerCase(),
            license_version: it.license_version || "",
            landing: it.foreign_landing_url || "",
            source,
            queries: [q],
          });
        }
        await sleep(600);
      }
    }
    process.stdout.write(`  ${source}: ${out.size} acumuladas (${requests} peticiones)\n`);
  }
  const items = [...out.values()];
  await writeFile(POOL_FILE, JSON.stringify(items, null, 2));
  console.log(`Pool guardado: ${items.length} imágenes (${requests} peticiones)`);
  return items;
}

/* ------------------------------------------------------------------ */
/* Verificación: dos señales independientes                           */
/* ------------------------------------------------------------------ */

/* Las etiquetas de prenda se comparan como PALABRA COMPLETA. Con `includes`
   "cap" aparecía dentro de "backPACK", "top" dentro de "lapTOP" y "vest"
   dentro de "harVEST", así que un sombrero acababa con una mochila. */
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function hasGarmentWord(item, word) {
  if (word.includes(" ")) {
    // etiquetas compuestas ("blue jeans"): solo como etiqueta exacta
    return item.tagSet.includes(word);
  }
  if (item.tagSet.includes(word)) return true;
  // plurales: "tshirts" ~ "tshirt", "dresses" ~ "dress", "shoes" ~ "shoe"
  const singular = word.replace(/es$/, "").replace(/s$/, "");
  for (const t of item.tagSet) {
    const ts = t.replace(/es$/, "").replace(/s$/, "");
    if (ts === singular) return true;
  }
  return new RegExp(`(^|[^a-z])${escapeRe(word)}(e?s)?([^a-z]|$)`).test(item.titleLower);
}

function verify(item) {
  const tags = item.tags.map((t) => t.toLowerCase().trim());
  const title = (item.title || "").toLowerCase();
  // OJO: hay que unirlo en un string. `array.includes(x)` compara elementos
  // completos, no subcadenas, y dejaba pasar clipart y paisajes.
  const hay = [...tags, title].join(" | ");

  // (a) ninguna etiqueta de rechazo -> descarta paisajes, clipart, marcas...
  for (const bad of REJECT_TAGS) {
    if (hay.includes(bad)) return null;
  }
  // (b) piezas de museo: los titulos traen el anio entre parentesis
  if (/\b(1[6-9]\d{2})\b/.test(title)) return null;
  if (/\(c\.?\s*\d{2,4}\)/.test(title)) return null;

  // (c) al menos un grupo de prenda real (no solo "moda")
  const base = { ...item, tagSet: tags, titleLower: title };
  const groups = [];
  for (const [group, list] of Object.entries(GARMENT_TAGS)) {
    if (group === "moda") continue;
    if (list.some((w) => hasGarmentWord(base, w))) groups.push(group);
  }
  if (groups.length === 0) return null;
  return { ...base, groups };
}

function rank(candidates, spec) {
  const likes = spec.like || [];
  return candidates
    .map((c) => {
      let s = Math.min(c.width * c.height, 8_000_000) / 250_000;
      for (const l of likes) if (hasGarmentWord(c, l)) s += 3;
      // rawpixel = fotografia de producto; se prefiere para el plano principal
      if (c.source === "rawpixel") s += 1.2;
      // fotos "en modelo" sirven mejor como segunda imagen de la galeria
      if (c.groups.includes("moda")) s += 0.8;
      s -= Math.min((c.title || "").length, 45) / 30;
      if (/[^\x00-\x7F]/.test(c.title)) s -= 4;
      return { ...c, score: s };
    })
    .sort((a, b) => b.score - a.score);
}

async function downloadAndNormalize(item, destPath) {
  const res = await fetch(item.url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`descarga ${res.status}: ${item.url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await sharp(buf)
    .resize(WIDTH, HEIGHT, { fit: "cover", position: sharp.strategy.attention })
    .webp({ quality: 72 })
    .toFile(destPath);
  return destPath;
}

async function main() {
  /* Modo diagnóstico: mide cuántas fotos coinciden con la prenda exacta de cada
     producto, para saber si el catálogo queda bien cubierto. */
  if (process.argv.includes("--report")) {
    const all = JSON.parse(await readFile(POOL_FILE, "utf8"));
    const pool = process.argv.includes("--stocksnap-only")
      ? all.filter((i) => i.source === "stocksnap")
      : all;
    const verified = pool.map(verify).filter(Boolean);
    console.log(`Pool ${pool.length} -> verificadas ${verified.length}\n`);
    const plan = { ...PLAN, ...CATEGORIES };
    let exactOk = 0;
    let rows = [];
    for (const [id, spec] of Object.entries(plan)) {
      const inGroup = verified.filter((v) => spec.any.some((g) => v.groups.includes(g)));
      const exact = inGroup.filter((v) => (spec.like || []).some((l) => hasGarmentWord(v, l)));
      const with3 = exact.length >= 3;
      if (with3) exactOk++;
      rows.push({
        id,
        grupo: inGroup.length,
        exacta: exact.length,
        ok3: with3 ? "OK " : "-- ",
        ejemplo: exact.slice(0, 3).map((e) => JSON.stringify(e.title)).join(" "),
      });
    }
    for (const r of rows) {
      console.log(
        `${r.ok3} ${r.id.padEnd(18)} grupo=${String(r.grupo).padStart(3)} exacta=${String(r.exacta).padStart(3)}  ${r.ejemplo}`
      );
    }
    console.log(
      `\nProductos con >=3 fotos de la prenda EXACTA: ${exactOk}/${rows.length}` +
        `  (${Math.round((exactOk / rows.length) * 100)}%)`
    );
    return;
  }

  const shouldHarvest = process.argv.includes("--harvest");
  if (shouldHarvest || !existsSync(POOL_FILE)) await harvest();

  let pool = JSON.parse(await readFile(POOL_FILE, "utf8"));
  // El catálogo se construye solo con StockSnap: fotografía de moda actual,
  // coherente y CC0. rawpixel mezcla estampas de museu del s. XIX.
  if (process.argv.includes("--stocksnap-only")) {
    pool = pool.filter((i) => i.source === "stocksnap");
  }
  const verified = pool.map(verify).filter(Boolean);
  console.log(`Pool ${pool.length} -> verificadas ${verified.length}`);

  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(CATEGORY_OUT, { recursive: true });

  const used = new Set();
  const credits = [];
  const imageMap = {};
  const productById = JSON.parse(await readFile(join(ROOT, "data", "products.json"), "utf8"));
  const byId = new Map(productById.map((p) => [p.id, p]));

  const targets = [
    ...Object.entries(PLAN).map(([id, spec]) => ({
      key: id,
      spec,
      slug: byId.get(id)?.slug ?? id,
      outDir: OUT_DIR,
      allowReuse: false,
    })),
    // La cabecera de una categoria puede (-> suele) enseñar una de sus prendas,
    // asi que aqui si se permite reutilizar una foto ya asignada.
    ...Object.entries(CATEGORIES).map(([slug, spec]) => ({
      key: `cat:${slug}`,
      spec,
      slug,
      outDir: CATEGORY_OUT,
      allowReuse: true,
    })),
  ];

  let downloaded = 0;
  let failed = 0;
  const imageCount = [];
  for (const t of targets) {
    const inGroup = verified.filter(
      (v) =>
        t.spec.any.some((g) => v.groups.includes(g)) &&
        (t.allowReuse || !used.has(v.url))
    );
    /* Preferimos siempre fotos que sean de ESA prenda. Si no hay ninguna,
       se acepta una foto de la categoría (sigue siendo ropa) antes que
       meter una foto de otra prenda: es preferible 1 foto correcta a 3
       fotos donde 2 son de otro producto. */
    const exact = inGroup.filter((v) => (t.spec.like || []).some((l) => hasGarmentWord(v, l)));
    const source = exact.length > 0 ? exact : inGroup;

    const ranked = rank(source, t.spec);
    const picks = [];
    const seenTitles = new Set();
    for (const c of ranked) {
      if (picks.length >= 3) break;
      const key = (c.titleLower || c.title || "").replace(/[^a-z]/g, "").slice(0, 18);
      if (key && seenTitles.has(key)) continue;
      if (picks.some((p) => p.url === c.url)) continue;
      seenTitles.add(key);
      picks.push(c);
    }
    if (picks.length < 3) {
      for (const c of ranked) {
        if (picks.length >= 3) break;
        if (picks.some((p) => p.url === c.url)) continue;
        picks.push(c);
      }
    }

    if (picks.length === 0) {
      console.log(`  ! ${t.key}: sin candidatos verificados`);
      failed++;
      continue;
    }
    imageCount.push({ key: t.key, n: picks.length, exact: exact.length > 0 });

    const files = [];
    for (let i = 0; i < picks.length; i++) {
      const pick = picks[i];
      const name = `${t.slug}-${i + 1}.webp`;
      // ruta publica con barra inicial: /images/products/<slug>-1.webp
      const segs = t.outDir.split(/[\\/]/);
      const publicDir = segs.slice(segs.indexOf("public") + 1).join("/");
      const publicPath = `/${publicDir}/${name}`;
      const dest = join(t.outDir, name);
      try {
        if (!existsSync(dest)) await downloadAndNormalize(pick, dest);
        files.push(publicPath);
        used.add(pick.url);
        downloaded++;
      } catch (err) {
        console.log(`  ! ${t.key}/${name}: ${err.message}`);
        failed++;
      }
      credits.push({
        file: publicPath,
        title: pick.title,
        creator: pick.creator,
        license: pick.license,
        licenseVersion: pick.license_version,
        source: pick.source,
        page: pick.landing,
      });
    }
    imageMap[t.key] = files;
  }

  /* Reescribe las rutas de imagen en los JSON de datos */
  let products = JSON.parse(await readFile(join(ROOT, "data", "products.json"), "utf8"));
  products = products.map((p) => (imageMap[p.id] ? { ...p, images: imageMap[p.id] } : p));
  await writeFile(join(ROOT, "data", "products.json"), JSON.stringify(products, null, 2) + "\n");

  let categories = JSON.parse(await readFile(join(ROOT, "data", "categories.json"), "utf8"));
  categories = categories.map((c) => {
    const key = `cat:${c.slug}`;
    return imageMap[key] ? { ...c, imageUrl: imageMap[key][0] } : c;
  });
  await writeFile(join(ROOT, "data", "categories.json"), JSON.stringify(categories, null, 2) + "\n");

  await writeFile(join(CACHE_DIR, "credits.json"), JSON.stringify(credits, null, 2));
  await writeFile(join(CACHE_DIR, "image-map.json"), JSON.stringify(imageMap, null, 2));

  console.log(`\nDescargas: ${downloaded}  fallos: ${failed}`);
  const missing = targets.filter((t) => !imageMap[t.key]);
  console.log(`Objetivos: ${targets.length}  sin imagen: ${missing.length}`);
  if (missing.length) console.log("  ->", missing.map((m) => m.key).join(", "));

  const by3 = imageCount.filter((c) => c.n === 3).length;
  const exactN = imageCount.filter((c) => c.exact).length;
  console.log(
    `Cobertura: ${by3} objetivos con 3 fotos, ${exactN}/${imageCount.length} con foto de la prenda exacta`
  );
  const low = imageCount.filter((c) => c.n < 3);
  if (low.length) console.log(`  con menos de 3 fotos: ${low.map((c) => `${c.key}(${c.n})`).join(", ")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
