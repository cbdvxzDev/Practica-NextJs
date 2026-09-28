#!/usr/bin/env node
/**
 * catalog-images.mjs — Pipeline de imágenes del catálogo de Esencial.
 *
 * Qué hace:
 *   1. Busca fotografías CC en Openverse usando el pool local `cache/pool.json`.
 *   2. VERIFICA cada foto con un sistema de puntuación por etiquetas:
 *        + PRENDA concreta (denim, vestido, Wearing, etc.)  -> requisito duro
 *        + contexto de moda (mujer,|style, estudio, primer plano)
 *        - ESCENA (paisaje, ciudad, comida, tecnología, gimnasio...)
 *      Una foto solo entra si tiene prenda Y la escena no dominates el metadato.
 *   3. Elige 3 imágenes por producto, preferring la prenda EXACTA y sin repetir
 *      ninguna foto en todo el catálogo.
 *   4. Las normaliza a 1200x1500 (4:5) en WebP con `sharp`.
 *   5. Escribe `public/images/products/`, `public/images/categories/`, las rutas
 *      en `data/products.json` / `data/categories.json` y `cache/credits.json`.
 *
 * Uso:
 *   node scripts/catalog-images.mjs            # usa el pool, descarga lo que falte
 *   node scripts/catalog-images.mjs --harvest  # vuelve a buscar en Openverse
 *   node scripts/catalog-images.mjs --force    # re-descarga todo
 *   node scripts/catalog-images.mjs --report   # diagnóstico de cobertura
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const CACHE_DIR = join(ROOT, "cache");
const POOL_FILE = join(CACHE_DIR, "pool.json");
const OUT_DIR = join(ROOT, "public", "images", "products");
const CATEGORY_OUT = join(ROOT, "public", "images", "categories");
const EDITORIAL_OUT = join(ROOT, "public", "images", "editorial");
const EDITORIAL_CONST = join(ROOT, "app", "constants", "editorialImages.ts");
const UA = "Practica-NextJs/1.0 (educational fashion project)";

/* Tope de tiempo del harvest. La API de Openverse limita por IP y con cientos
   de peticiones las esperas por 429 se comían el rato; mejor cortar y trabajar
   con lo ya recogido que quedarse colgado. */
const HARVEST_BUDGET_MS = 8 * 60 * 1000;

/* ------------------------------------------------------------------ */
/* Credenciales de Openverse (opcionales pero muy recomendables)       */
/*                                                                      */
/* Sin key, la API anónima tiene dos topes que rompían el harvest:      */
/*   - page_size=200 responde 401 (el máximo sin autenticar es 20)     */
/*   - se satura rápido y devuelve 429                                 */
/*                                                                      */
/* Para el key: https://api.openverse.org/v1/auth_tokens/register/       */
/*   -> { "client_id": "...", "client_secret": "..." }                  */
/* Se leen de OPENVERSE_CLIENT_ID / OPENVERSE_CLIENT_SECRET.            */
/* ------------------------------------------------------------------ */
const OV_CLIENT_ID = process.env.OPENVERSE_CLIENT_ID || "";
const OV_CLIENT_SECRET = process.env.OPENVERSE_CLIENT_SECRET || "";
const OV_PAGE_SIZE = Number(process.env.OPENVERSE_PAGE_SIZE) || (OV_CLIENT_ID ? 200 : 20);

let ovToken = null;

/** Registra la app y pide un token Bearer, que habilita page_size alto. */
async function openverseToken() {
  if (ovToken) return ovToken;
  if (!OV_CLIENT_ID || !OV_CLIENT_SECRET) return null;

  const res = await fetch("https://api.openverse.org/v1/auth_tokens/token/", {
    method: "POST",
    headers: { "User-Agent": UA, "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: OV_CLIENT_ID,
      client_secret: OV_CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) {
    throw new Error(`no se pudo obtener el token de Openverse (${res.status})`);
  }
  const json = await res.json();
  ovToken = json.access_token;
  return ovToken;
}

const WIDTH = 1200;
const HEIGHT = 1500;

/* ------------------------------------------------------------------ */
/* 1. Etiquetas que SÍ CONFIRMAN que la foto es de ropa                */
/* ------------------------------------------------------------------ */
/* Solo prendas CONCRETAS. No hay grupo "moda": una foto sin prenda
   reconocible (p. ej. "mujer con maquillaje contra un muro") no sirve. */
const GARMENT_TAGS = {
  abrigo: ["coat", "jacket", "parka", "trench", "blazer", "overcoat", "anorak", "windbreaker", "bomber", "trucker", "raincoat", "jackets", "coats", "parka", "hooded jacket", "winter jacket"],
  camisa: ["shirt", "tshirt", "tee", "blouse", "polo", "top", "shirts", "blouses", "tshirts", "camisa", "camiseta", "tank top", "crop top", "turtleneck", "sweatshirt", "hoodie", "sweatshirt", "dress shirt", "button up"],
  punto: ["sweater", "cardigan", "hoodie", "sweatshirt", "jumper", "knit", "pullover", "turtleneck", "jersey", "sweaters", "knitwear", "wool", "sweatpants", "vest", "waistcoat", "sleeveless"],
  denim: ["denim", "jeans", "jean", "jeanswear", "denim jacket", "denim shirt", "denim shorts"],
  pantalon: ["pants", "trousers", "shorts", "skirt", "leggings", "joggers", "chino", "chinos", "skirts", "trouser", "wide leg", "flare", "cargo", "bermuda", "pleated", "midi"],
  vestido: ["dress", "gown", "jumpsuit", "romper", "dresses", "shirt dress", "maxi dress", "midi dress", "sundress", "wedding"],
  calzado: ["shoes", "sneakers", "sneaker", "boots", "booties", "sandals", "heels", "footwear", "oxford", "chelsea", "loafers", "flats", "pumps", "shoes", "heels", "slippers", "heels boot"],
  bolso: ["bag", "handbag", "purse", "backpack", "tote", "clutch", "satchel", "bags", "rucksack", "shoulder bag", "wallet"],
  accesorio: ["sunglasses", "glasses", "eyewear", "eyeglasses", "hat", "cap", "scarf", "belt", "watch", "gloves", "beanie", "necklace", "earrings", "ring", "necktie", "jewelry", "jewellery", "hats", "scarves", "fashion accessory", "watches", "sunglass"],
};

/* ------------------------------------------------------------------ */
/* 2. Contexto de moda: no prueba prenda, pero suma                    */
/* ------------------------------------------------------------------ */
/* Suman puntos: si la foto es de moda, el metadato también lo dirá.     */
const FASHION_TAGS = [
  // <- sujeto
  "people", "person", "woman", "women", "female", "girl", "girlfriend", "lady", "model",
  "mannequin", "crowd", "hands", "body", "skin",
  // <- moda
  "fashion", "clothing", "clothes", "cloth", "clothe", "apparel", "wear", "wearing",
  "outfit", "wardrobe", "style", "stylish", "elegant", "casual", "minimal", "modern",
  "classic", "vintage style", "streetwear", "boutique", "retail", "shop", "store",
  "brand", "collection", "season", "spring", "summer", "fall", "winter style",
  // <- material / detalle
  "fabric", "textile", "material", "cotton", "linen", "wool", "leather", "suede", "denim",
  "silk", "satin", "lace", "knit", "jersey", "canvas", "tweed", "corduroy", "velvet",
  "color", "colour", "colors", "detail", "details", "closeup", "background",
  "design", "lifestyle", "portrait", "pose", "posing", "look", "photo", "photography",
  "image", "shot", "studio", "product", "packshot", "wearable", "accessories", "accessory",
  "seam", "button", "buttons", "zip", "zipper", "pocket", "pockets", "collar", "sleeve",
  "sleeves", "hood", "hem", "waist", "belt loop", "solid color", "print", "printed",
  "striped", "stripe", "plain", "loose", "slim", "oversized", "cropped", "long", "short",
  "back", "front", "side", "view", "product shot", "fashion photography", "clothing rack",
  "hanger", "hangers", "rail", "rack", "closet", "shelf", "peg", "hooks", "display",
  "still life", "objects", "object", "elegance", "fresh", "cute", "nice", "beautiful",
  "feminine", "girl style", "lookbook", "shoot", "candid",
];

/* ------------------------------------------------------------------ */
/* 3. Etiquetas de ESCENA: restan puntos                               */
/* ------------------------------------------------------------------ */
/* Paisajes, exteriores y temas que NO son de moda. Con la puntuación      */
/* solo rechazamos si dominan; así una foto de abrigo en la nieve          */
/* ("winter", "snow") sigue sirviendo si la prenda manda.                 */
const SCENE_TAGS = {
  // <- paisaje / exterior (esto es lo que el usuario no quiere)
  landscape: ["landscape", "scenery", "view", "vista", "panorama", "horizon", "countryside", "rural", "wilderness"],
  naturaleza: ["nature", "natural", "outdoors", "outdoor", "outside", "field", "meadow", "grass", "lawn", "forest", "woods", "wood", "tree", "trees", "mountain", "mountains", "hill", "hills", "valley", "canyon", "desert", "beach", "seashore", "shore", "coast", "ocean", "sea", "lake", "river", "stream", "waterfall", "water", "sky", "clouds", "cloud", "sunset", "sunrise", "snow", "ice", "fog", "mist", "rain", "autumn", "fall leaves", "garden", "park", "plants", "plant", "flower", "flowers", "leaf", "leaves", "branch", "moss", "sand", "rock", "stone", "cliff"],
  ciudad: ["city", "urban", "downtown", "street", "streets", "road", "traffic", "bridge", "building", "buildings", "architecture", "skyscraper", "construction", "house", "town", "village", "skyline", "crosswalk", "sidewalk", "parking"],
  comida: ["food", "drink", "coffee", "tea", "wine", "beer", "cocktail", "restaurant", "cafe", "kitchen", "cake", "bread", "fruit", "vegetable", "meal", "dining", "plate", "cup"],
  tecnologia: ["technology", "phone", "smartphone", "laptop", "computer", "tablet", "screen", "monitor", "keyboard", "mouse", "camera", "lens", "tv", "console", "gadget", "code", "programming", "software", "app", "data", "circuit", "robot", "drone"],
  objetos: ["furniture", "chair", "chairs", "table", "desk", "bed", "sofa", "couch", "lamp", "book", "books", "magazine", "newspaper", "paper", "papers", "document", "pen", "pencil", "poster", "sign", "logo", "text", "letter", "card", "box", "bottle", "glass", "cup", "plate", "toy", "toys", "ball", "bike", "bicycle", "car", "cars", "vehicle", "train", "boat", "plane", "bus", "motorcycle"],
  interiores: ["room", "bedroom", "office", "interior", "indoors", "indoor", "window", "windows", "door", "stairs", "stair", "wall", "floor", "flooring", "tile", "tiles", "carpet", "curtain", "mirror", "shelf"],
  animales: ["dog", "cat", "bird", "horse", "cow", "animal", "animals", "pet", "pets", "fish", "butterfly", "insect", "puppy", "kitten"],
  deporte: ["fitness", "sport", "sports", "gym", "workout", "exercise", "yoga", "run", "running", "running shoes", "jogging", "marathon", "training", "athlete", "sporty", "basketball", "football", "soccer", "tennis", "golf", "skateboard", "surf", "surfing", "swim", "swimming", "swimwear", "beachwear", "pool", "yoga mat", "climbing", "hiking", "camping", "tent"],
  viajes: ["travel", "traveling", "travelling", "trip", "tour", "tourist", "tourism", "holiday", "vacation", "airport", "flight", "suitcase", "luggage", "passport", "hotel", "adventure", "camping", "map", "passport"],
  gente_no_moda: ["business", "businessman", "businesswoman", "meeting", "presentation", "team", "company", "corporate", "work", "working", "desk", "student", "study", "school", "university", "class", "money", "dollar", "cash", "coin", "invest", "finance", "shopping cart", "sale"],
  belleza: ["makeup", "cosmetics", "lipstick", "perfume", "hair", "hairstyle", "hairdresser", "beard", "skin care", "nail", "nails", "massage", "spa", "salon", "beauty", "glamour", "glam", "blonde", "brunette", "redhead", "curly hair", "selfie"],
  infantil: ["baby", "babies", "child", "children", "kid", "kids", "toddler", "toy", "pregnant", "wedding", "bride", "bridegroom", "family", "couple", "romance", "love", "kiss", "hug", "wedding dress"],
  archivo: ["vintage", "antique", "victorian", "edwardian", "museum", "archaeolog", "historical", "century", "manuscript", "engraving", "lithograph", "doll", "dolls", "poster art", "public domain", "wikimedia", "sampler", "needlework", "embroidery", "batik", "ikat", "block print", "old", "retro", "nostalgic"],
  marcas: ["nike", "adidas", "lacoste", "levi", "gucci", "prada", "zara", "uniqlo", "ray ban", "mango", "bershka", "forever 21", "calvin klein", "ralph lauren", "tommy", "chanel", "versace", "burberry", "moncler", "north face", "patagonia", "vans", "converse", "timberland", "birkenstock", "dr martens", "calzedonia", "primark", "shein", "temu", "superdry", "carhartt", "boss", "armani", "ysl", "dior", "hermes", "hollister", "abercrombie", "gap"],
};

/* Etiquetas que nunca deben aparecer, aunque la foto tenga prenda: son
   Grounds tajantes de que la foto es de otra cosa. */
const HARD_REJECT = [
  // <- Patrones de fondo: el "camuflaje" y el "wallpaper" que el usuario
  //   reportó en la ficha de Vestido Fluido a la Pierna. Una foto de
  //   estampado repetido no sirve como foto de producto: la prenda se
  //   pierde dentro del patrón y encima tapa el precio.
  "camouflage", "camo", "wallpaper", "seamless", "pattern", "patterns", "wall", "wallpapered",
  "graffiti", "brick", "concrete", "abstract", "texture", "textured", "motif", "damask", "marble",
  "tie dye", "tie-dye", "camouflage jacket", "herringbone", "houndstooth",
  "geometric", "psychedelic", "kaleidoscope", "stained glass", "mural", "graffiti wall",
  // <- temas que no son de moda
  "food", "drink", "coffee", "wine", "beer", "cocktail", "cake", "bread", "fruit", "vegetable", "meal", "restaurant", "cafe",
  "laptop", "computer", "keyboard", "mouse", "phone", "smartphone", "tablet computer", "monitor", "software", "code", "programming",
  "guitar", "piano", "violin", "drum", "microphone", "headphones", "speaker",
  "dog", "cat", "bird", "horse", "cow", "animal", "puppy", "kitten", "fish",
  "landscape", "sunset", "sunrise", "mountain", "mountains", "valley", "canyon", "waterfall", "beach", "seashore", "ocean", "lake",
  "forest", "woods", "tree", "trees", "field", "meadow", "grass", "lawn", "sky", "clouds", "cloud", "fog", "bridge", "skyline", "skyscraper",
  "bicycle", "bike", "car", "cars", "vehicle", "motorcycle", "train", "boat", "airplane", "plane", "bus",
  "baby", "babies", "child", "children", "toddler", "pregnant",
  "wedding", "bride", "bridegroom", "couple", "love", "kiss", "hug", "romance", "relationship",
  "swimwear", "beachwear", "swimsuit", "bikini", "flipflops", "flip flop", "bathing suit", "lingerie", "bra", "underwear",
  "money", "dollar", "cash", "coin", "invest", "stock",
  "perfume", "cigarette", "smoking",
  "book", "books", "magazine", "newspaper", "reading", "library",
  "sparkler", "fireworks", "candle", "christmas", "halloween",
  "photographer", "camera", "shooting", "tripod", "lighting",
  "kit", "sheriff", "cowboy hat", "punk", "skateboard", "snowboard", "surfboard",
  "laundromat", "laundry", "gear", "equipment",
  "clipart", "clip art", "illustration", "vector", "sticker", "doodle", "watermark", "8bit", "pixel art", "sketch", "painting", "mockup", "icon", "collage",
  "8k", "4k render", "render", "3d render", "cgi",
  "mannequin doll", "dolls", "doll",
  "museum", "manuscript", "engraving", "lithograph", "antiquarian",
];

/* Marcas: se rechazan tanto por etiqueta como por título. Una foto con el
   logotipo de otra marca en un catálogo de portafolio queda mal. */
const BRAND_REJECT = [
  "nike", "adidas", "lacoste", "levi", "levis", "gucci", "prada", "zara", "uniqlo", "ray ban", "mango", "bershka",
  "forever 21", "calvin klein", "ralph lauren", "tommy", "chanel", "versace", "burberry", "moncler", "north face",
  "patagonia", "vans", "converse", "timberland", "birkenstock", "dr martens", "calzedonia", "primark", "shein", "temu",
  "superdry", "carhartt", "boss", "armani", "ysl", "dior", "hermes", "hollister", "abercrombie", "gap", "supreme",
  "new balance", "reebok", "puma", "asics", "salomon", "hugo boss", "sandro", "oysho", "massaimo dutti",
];

/* Servidores de archivo y museo. El harvest de Openverse devuelve también
   estas fotos porque su índice no está filtrado por origen, y son Material
   de dominio público: daguerreotipos, estampas del s. XIX y fotos de museo.
   Además `upload.wikimedia.org` devuelve 429 casi siempre, así que además de
   no servir, rompen las descargas. */
const HOST_REJECT = [
  "upload.wikimedia.org",
  "commons.wikimedia.org",
  "wikimedia.org",
  "pd.w.org",
  "images.rawpixel.com",
  "rawpixel.com",
  "collections.museumsvictoria.com.au",
  "repos.fashionheritage.eu",
  "media35a.dimu.no",
  "openaccess-cdn.clevelandart.org",
  "clevelandart.org",
  "metmuseum.org",
  "rijksmuseum.nl",
  "loc.gov",
  "si.edu",
  "archive.org",
  "nypl.org",
  "gettyimages.com",
  "alamy.com",
  "shutterstock.com",
  "istockphoto.com",
  "dreamstime.com",
  "123rf.com",
];

/** Dominio de la URL de la foto, o cadena vacía si no es parseable. */
function hostOf(url) {
  try {
    return new URL(url).host.toLowerCase();
  } catch {
    return "";
  }
}

/* Hospedadores de fotografía de moda actual y con licencia libre. Todo lo que
   no esté aquí (archivos, museos, agencias de stock con marca de agua) queda
   fuera del catálogo. */
const MODERN_HOSTS = [
  "live.staticflickr.com",
  "farm*.staticflickr.com",
  "cdn.stocksnap.io",
  "images.pexels.com",
  "images.unsplash.com",
];

/** ¿La foto viene de un hospedador de fotografía moderna? */
function isModernHost(url) {
  const host = hostOf(url);
  if (!host) return false;
  return MODERN_HOSTS.some((h) => {
    if (h.includes("*")) {
      const re = new RegExp(`^${h.replace(/\./g, "\\.").replace(/\*/g, "[^.]+")}$`, "i");
      return re.test(host);
    }
    return host === h || host.endsWith(`.${h}`);
  });
}

/* Palabras de "prenda" aplanadas, para reusar. */
const ALL_FASHION_WORDS = [...new Set(FASHION_TAGS)];
const ALL_SCENE_WORDS = [...new Set(Object.values(SCENE_TAGS).flat())];

/* Etiquetas multi palabra: se comparan como subcadena. */
const SCENE_PHRASES = [
  "city skyline", "city street", "old town", "sun set", "sun rise", "food and", "food photography",
  "computer monitor", "car engine", "mountain range", "sea side", "sun light",
];

/* ------------------------------------------------------------------ */
/* 4. Plan: qué prenda busca cada producto y qué categoría              */
/* ------------------------------------------------------------------ */
/* any:  grupo de prenda obligatorio                                    */
/* like: se bonifica para elegir la foto más parecida al producto       */
const PLAN = {
  "prod-1": { any: ["abrigo"], like: ["coat", "wool coat", "overcoat", "jacket"] },
  "prod-2": { any: ["abrigo"], like: ["trench", "raincoat", "coat"] },
  "prod-3": { any: ["abrigo"], like: ["parka", "puffer", "windbreaker", "coat"] },
  "prod-4": { any: ["abrigo"], like: ["leather", "biker", "motorcycle", "jacket"] },
  "prod-5": { any: ["abrigo"], like: ["blazer", "tweed", "suit"] },
  "prod-6": { any: ["camisa"], like: ["tshirt", "tshirt", "tee", "cotton", "tank top"] },
  "prod-7": { any: ["camisa"], like: ["striped", "stripes", "stripe", "shirt"] },
  "prod-8": { any: ["camisa"], like: ["linen", "long sleeve", "shirt"] },
  "prod-9": { any: ["camisa"], like: ["tshirt", "oversized", "loose", "shirt"] },
  "prod-10": { any: ["camisa"], like: ["polo"] },
  "prod-11": { any: ["camisa"], like: ["shirt", "linen", "formal"] },
  "prod-12": { any: ["camisa"], like: ["shirt", "oxford", "button"] },
  "prod-13": { any: ["camisa"], like: ["blouse", "silk", "women"] },
  "prod-14": { any: ["camisa"], like: ["shirt", "cotton", "stretch"] },
  "prod-15": { any: ["camisa", "punto"], like: ["crop", "top", "knit"] },
  "prod-16": { any: ["pantalon"], like: ["pants", "trousers", "suit"] },
  "prod-17": { any: ["pantalon"], like: ["chino", "chinos", "cotton"] },
  "prod-18": { any: ["pantalon"], like: ["wide leg", "flared", "flare", "pants"] },
  "prod-19": { any: ["pantalon"], like: ["bermuda", "shorts", "above knee"] },
  "prod-20": { any: ["pantalon"], like: ["skirt", "pleated", "midi"] },
  "prod-21": { any: ["vestido"], like: ["satin", "silk", "evening"] },
  "prod-22": { any: ["vestido", "camisa"], like: ["shirt dress", "linen", "dress"] },
  "prod-23": { any: ["vestido", "punto"], like: ["knit", "ribbed", "dress"] },
  "prod-24": { any: ["vestido"], like: ["maxi", "long", "flow", "dress"] },
  "prod-25": { any: ["vestido", "abrigo"], like: ["blazer", "belt", "dress"] },
  "prod-26": { any: ["punto"], like: ["sweater", "merino", "wool"] },
  "prod-27": { any: ["punto"], like: ["cardigan"] },
  "prod-28": { any: ["punto"], like: ["hoodie", "hooded", "sweatshirt"] },
  "prod-29": { any: ["punto"], like: ["vneck", "v neck", "collar", "sweater"] },
  "prod-30": { any: ["punto"], like: ["vest", "sleeveless"] },
  "prod-31": { any: ["denim"], like: ["jeans", "straight", "denim"] },
  "prod-32": { any: ["denim"], like: ["jeans", "skinny", "slim", "stretch"] },
  "prod-33": { any: ["denim", "abrigo"], like: ["denim jacket", "jean jacket", "trucker", "jacket"] },
  "prod-34": { any: ["denim", "pantalon"], like: ["cargo", "utility", "denim"] },
  "prod-35": { any: ["denim", "pantalon"], like: ["denim shorts", "shorts"] },
  "prod-36": { any: ["calzado"], like: ["sneakers", "running", "sport", "shoes"] },
  "prod-37": { any: ["calzado"], like: ["canvas", "shoes"] },
  "prod-38": { any: ["calzado"], like: ["boots", "booties", "ankle"] },
  "prod-39": { any: ["calzado"], like: ["canvas", "high top", "sneakers"] },
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
  abrigo: { any: ["abrigo"], like: ["coat", "jacket", "wool coat"] },
  basicos: { any: ["camisa", "punto"], like: ["tshirt", "shirt", "tee", "tank top"] },
  camisas: { any: ["camisa"], like: ["shirt", "blouse"] },
  pantalones: { any: ["pantalon"], like: ["pants", "jeans", "trousers", "skirt"] },
  vestidos: { any: ["vestido"], like: ["dress"] },
  tejidos: { any: ["punto"], like: ["sweater", "knit", "cardigan"] },
  denim: { any: ["denim"], like: ["denim", "jeans"] },
  calzado: { any: ["calzado"], like: ["shoes", "sneakers", "boots"] },
  accesorios: { any: ["accesorio", "bolso"], like: ["bag", "sunglasses", "hat", "scarf", "backpack"] },
};

/* Etiquetas de mujer: el catálogo es de ropa de mujer, así que se bonifican. */
const FEMALE_TAGS = ["woman", "women", "female", "girl", "girlfriend", "lady", "feminine", "blouse", "dress", "skirt"];
const MALE_TAGS = ["man", "men", "male", "guy", "boyfriend", "gentleman", "suit", "menswear"];

/* ------------------------------------------------------------------ */
/* Imágenes editoriales (home, lookbook, about)                        */
/* ------------------------------------------------------------------ */
/* Antes estas fotos eran URLs fijas a cdn.stocksnap.io pegadas en los        */
/* componentes. Eso rompía en cuanto StockSnap movía una foto, no pasaban   */
/* por ninguna verificación (podían ser un paisaje) y obligaban al navegador */
/* a pedir a un tercero. Ahora se descargan y verifican igual que el          */
/* catálogo, y `app/constants/editorialImages.ts` queda como fuente única.   */
const EDITORIAL_SLOTS = [
  // Home: mosaico de 3 fotos (portada vertical + dos apaisadas).
  "hero-main",
  "hero-top",
  "hero-bottom",
  // Lookbook: retícula editorial.
  ...Array.from({ length: 12 }, (_, i) => `lookbook-${String(i + 1).padStart(2, "0")}`),
  // About: historia del taller.
  "about-01",
  "about-02",
  "about-03",
  "about-04",
  // Bloque de manifiesto en el home.
  "editorial-01",
];

/* Todas las fotos editoriales comparten perfil: prendas colgadas, percheros,
   siluetas o primeros planos de tela. Nada de escenas de paisaje. */
const EDITORIAL_SPEC = {
  any: ["abrigo", "camisa", "vestido", "punto", "denim", "pantalon", "accesorio", "bolso"],
  like: ["hanger", "hangers", "rack", "rail", "closet", "coat", "dress", "sweater", "shirt", "jeans", "clothing rack", "wardrobe"],
};

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
  /* Sin filtro de `source` en la URL: la API devuelve 0 resultados para
     `stocksnap` porque esa fuente ya no está en su índice, y eso vaciaba el
     pool entero en el harvest anterior. `source` solo se usa para atribuir
     créditos. La licencia sí se filtra, porque esa sigue funcionando. */
  void source;
  const url =
    `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}` +
    `&page_size=${OV_PAGE_SIZE}&page=${page}&license=cc0,pdm,by,by-sa`;

  const token = await openverseToken();
  const headers = { "User-Agent": UA };
  if (token) headers.Authorization = `Bearer ${token}`;
  else if (OV_CLIENT_ID) headers["User-Agent"] = `${UA} (${OV_CLIENT_ID})`;

  for (let attempt = 0; attempt < 3; attempt++) {
    let res;
    try {
      res = await fetch(url, { headers, signal: AbortSignal.timeout(25_000) });
    } catch {
      await sleep(1500);
      continue;
    }
    if (res.status === 401 && !token && !OV_CLIENT_ID) {
      /* page_size por encima del máximo anónimo: se reintenta con el tope. */
      return null;
    }
    if (res.status === 429 || res.status >= 500) {
      await sleep(2000 * (attempt + 1));
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
  const started = Date.now();
  /* La búsqueda NO se acota por origen: el índice de Openverse devuelve
     resultados de muchos sitios y, como se vio, filtrar por `source` dejaba el
     pool vacío. Lo que decide qué entra al catálogo es `verify()`, que rechaza
     los servidores de archivo y de museo y exige una prenda concreta. */
  const sources = ["flickr", "stocksnap", "nappy", "rawpixel", "sketchfab", "wikimedia"];
  for (const source of sources) {
    for (const q of HARVEST_QUERIES) {
      if (Date.now() - started > HARVEST_BUDGET_MS) {
        console.log(`  presupuesto agotado en "${q}", se corta con ${out.size} acumuladas`);
        break;
      }
      for (const page of [1, 2, 3, 4, 5]) {
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
            /* `it.source` es el origen REAL que devuelve la API. Guardar el
               nombre del bucle metía todas las fotos en la misma bolsa
               ("stocksnap"), y por eso el filtro por fuente no filtraba nada
               y entraban daguerreotipos de Wikimedia. */
            source: it.source || source,
            queries: [q],
          });
        }
        await sleep(600);
      }
      /* Progreso por consulta: sin esto el log salía vacío porque Node
         bufferiza stdout cuando no es una TTY, y parecía que estaba colgado. */
      process.stdout.write(`  ${out.size} acumuladas | ${requests} peticiones | ${q}\n`);
    }
    process.stdout.write(`  ${source}: ${out.size} acumuladas (${requests} peticiones)\n`);
  }
  const items = [...out.values()];
  await writeFile(POOL_FILE, JSON.stringify(items, null, 2));
  console.log(`Pool guardado: ${items.length} imágenes (${requests} peticiones)`);
  return items;
}

/* ------------------------------------------------------------------ */
/* Verificación por puntuación                                          */
/* ------------------------------------------------------------------ */

/* Las palabras de prenda se comparan como PALABRA COMPLETA. Con `includes`
   "cap" aparecía dentro de "backPACK", "top" dentro de "lapTOP" y "vest"
   dentro de "harVEST", así que un sombrero acababa con una mochila. */
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Normaliza un sustantivo a su forma singular: dresses -> dress, jeans -> jean. */
function singularize(word) {
  if (word.endsWith("ies")) return word.slice(0, -3) + "y";
  if (word.endsWith("es")) return word.slice(0, -2);
  if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

/**
 * ¿La etiqueta es exactamente esta palabra (o su plural)?
 *
 * Importante: se compara palabra COMPLETA, no por subcadena. Buscar "men" con
 * `includes` descartaría "women", y "top" dentro de "laptop". Ese error fue
 * exactamente lo que dejó pasar fotos de personas en lugar de prendas.
 */
function tagIs(tag, word) {
  const t = singularize(tag);
  const w = singularize(word.toLowerCase());
  if (t === w) return true;
  // etiquetas compuestas: "blue jeans" contiene "jeans"
  return t.split(/[\s-]+/).some((part) => singularize(part) === w);
}

function hasGarmentWord(item, word) {
  if (item.tagSet.some((t) => tagIs(t, word))) return true;
  // último recurso: el título, también con límites de palabra
  return new RegExp(`(^|[^a-z])${escapeRe(word)}(e?s)?([^a-z]|$)`, "i").test(item.titleLower);
}

/** Normaliza una etiqueta a un token comparable. */
function normalizeTag(tag) {
  return tag.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "");
}

/**
 * Puntúa una foto y decide si sirve para el catálogo.
 *
 * El filtro anterior exigía que TODAS las etiquetas estuvieran en un
 * diccionario blanca. Con los metadatos reales de StockSnap eso descartaba el
 * 99% del pool (8 de 1002) y el catálogo se quedaba sin fotos. Ahora la
 * decisión es por puntuación:
 *
 *   - HARD_REJECT: si aparece una de estas, fuera (es otra cosa).
 *   - Sin prenda concreta: fuera. Es la única condición realmente dura.
 *   - Si la escena suma más que la prenda + moda, fuera: eso es un paisaje
 *     con una persona, no una foto de producto.
 *   - En otro caso, dentro, y el resto de metadatos no importa.
 *
 * @returns {{groups: string[], score: number, female: number, male: number}|null}
 */
function verify(item) {
  const tags = item.tags.map((t) => String(t).toLowerCase().trim());
  const title = (item.title || "").toLowerCase();
  const tagSet = tags.map((t) => t.replace(/[^a-z0-9\s-]/g, ""));
  const tagList = tags.map(normalizeTag).filter(Boolean);
  const hay = [...tags, title].join(" | ");
  const base = { ...item, tagSet, titleLower: title };

  // (a) rechazo sin discusión. Las palabras sueltas también se buscan en el
  //     TÍTULO con límites de palabra: si no, se colaban "Adidas Execution"
  //     o "Nike Sneakers", donde la marca solo está en el nombre de la foto.
  const host = hostOf(item.url);
  if (host && HOST_REJECT.some((h) => host === h || host.endsWith(`.${h}`))) return null;

  for (const bad of [...HARD_REJECT, ...BRAND_REJECT]) {
    if (bad.includes(" ")) {
      if (hay.includes(bad)) return null;
    } else if (
      tagList.some((t) => tagIs(t, bad)) ||
      new RegExp(`(^|[^a-z])${escapeRe(bad)}([^a-z]|$)`, "i").test(title)
    ) {
      return null;
    }
  }

  // (b) piezas de archivo: los títulos traen el año o el id de la foto
  if (/\b(1[6-9]\d{2})\b/.test(title)) return null;
  if (/\(c\.?\s*\d{2,4}\)/.test(title)) return null;
  // id numérico de catálogo entre paréntesis: "Dress Shirt (3161023616)"
  if (/\(\s*\d{6,}\s*\)/.test(title)) return null;

  // (c) prenda concreta, la única condición dura
  const groups = [];
  let garmentHits = 0;
  for (const [group, list] of Object.entries(GARMENT_TAGS)) {
    let hits = 0;
    for (const w of list) if (hasGarmentWord(base, w)) hits++;
    if (hits > 0) groups.push(group);
    garmentHits += hits;
  }
  if (groups.length === 0 || garmentHits === 0) return null;

  // (d) contexto de moda
  let fashionHits = 0;
  for (const w of ALL_FASHION_WORDS) {
    if (tagSet.some((t) => tagIs(t, w))) fashionHits++;
  }
  // el título también cuenta como contexto de moda
  if (/\b(fashion|clothing|clothes|apparel|outfit|wear|style|wardrobe)\b/.test(title)) fashionHits++;

  // (e) escena
  let sceneHits = 0;
  for (const w of ALL_SCENE_WORDS) {
    if (tagSet.some((t) => tagIs(t, w))) sceneHits++;
  }
  for (const p of SCENE_PHRASES) if (hay.includes(p)) sceneHits++;

  /* Una foto de abrigo en la nieve lleva "winter" y "snow" y sigue siendo
     una foto de abrigo. Solo cae cuando la escena DOMINA el metadato. */
  const positive = garmentHits * 3 + fashionHits;
  const negative = sceneHits * 2;
  if (negative > positive) return null;

  // (f) género: el catálogo es de ropa de mujer
  let female = 0;
  for (const w of FEMALE_TAGS) if (tagSet.some((t) => tagIs(t, w)) || title.includes(w)) female++;
  let male = 0;
  for (const w of MALE_TAGS) if (tagSet.some((t) => tagIs(t, w)) || title.includes(w)) male++;
  if (male > 0 && female === 0) return null;

  return { ...base, groups, score: positive - negative, female, male };
}

function rank(candidates, spec) {
  const likes = spec.like || [];
  return candidates
    .map((c) => {
      let s = Math.min(c.width * c.height, 8_000_000) / 250_000;
      for (const l of likes) {
        if (hasGarmentWord(c, l)) s += 6;
        /* Si además el TÍTULO nombra la prenda que buscamos, la foto es
           probablemente de ese producto. StockSnap usa títulos genéricos
           ("Jeans Denim", "People Girl"), así que esto separa mucho. */
        if (new RegExp(`(^|[^a-z])${escapeRe(l)}([^a-z]|$)`, "i").test(c.titleLower)) s += 4;
      }
      // Fotos de modelo encuadran la prenda entera; los títulos largos ganan.
      s -= Math.min((c.title || "").length, 45) / 30;
      if (/[^\x00-\x7F]/.test(c.title)) s -= 4;
      // Preferencia por foto de mujer y por encuadre vertical.
      s += c.female * 1.5 - c.male * 1.5;
      const ar = c.width / c.height;
      if (ar >= 0.6 && ar <= 1.15) s += 3;
      else if (ar < 0.6) s += 1;
      return { ...c, score: s };
    })
    .sort((a, b) => b.score - a.score);
}

async function downloadAndNormalize(item, destPath) {
  const res = await fetch(item.url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(45_000) });
  if (!res.ok) throw new Error(`descarga ${res.status}: ${item.url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  /* `attention` recorta por donde está el contenido, así la prenda no se
     pierde aunque la foto original sea apaisada. */
  await sharp(buf)
    .resize(WIDTH, HEIGHT, { fit: "cover", position: sharp.strategy.attention })
    .webp({ quality: 76 })
    .toFile(destPath);
  return destPath;
}

/** ¿Existe el archivo de destino y pesa lo que debe? Un .webp de 0 bytes
 *  deja la página con una imagen rota, así que se comprueba el tamaño. */
function isUsable(dest) {
  if (!existsSync(dest)) return false;
  try {
    return statSync(dest).size > 2048;
  } catch {
    return false;
  }
}

async function main() {
  /* Modo diagnóstico: mide cuántas fotos coinciden con la prenda exacta de cada
     producto, para saber si el catálogo queda bien cubierto. */
  if (process.argv.includes("--report")) {
    const all = JSON.parse(await readFile(POOL_FILE, "utf8"));
    // Ojo: `filter(isModernHost)` pasaría el objeto entero, no la URL.
    const pool = all.filter((i) => isModernHost(i.url));
    const verified = pool.map(verify).filter(Boolean);
    console.log(`Pool ${all.length} (modernos ${pool.length}) -> verificadas ${verified.length}\n`);
    const plan = { ...PLAN, ...CATEGORIES };
    let exactOk = 0;
    const rows = [];
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
      `\nObjetivos con >=3 fotos de la prenda EXACTA: ${exactOk}/${rows.length}` +
        `  (${Math.round((exactOk / rows.length) * 100)}%)`
    );
    return;
  }

  const shouldHarvest = process.argv.includes("--harvest");
  const force = process.argv.includes("--force");
  if (force) console.log("Modo --force: se re-descargan todas las imágenes.");
  if (shouldHarvest || !existsSync(POOL_FILE)) await harvest();

  const all = JSON.parse(await readFile(POOL_FILE, "utf8"));
  /* Solo fotografía moderna: el pool también contiene daguerreotipos y estampas
     de museo, que `verify()` rechaza y que además dan 429 al descargar. */
  // Ojo: `filter(isModernHost)` pasaría el objeto entero, no la URL.
  const pool = all.filter((i) => isModernHost(i.url));
  const verified = pool.map(verify).filter(Boolean);
  console.log(`Pool ${all.length} (modernos ${pool.length}) -> verificadas ${verified.length}`);

  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(CATEGORY_OUT, { recursive: true });
  await mkdir(EDITORIAL_OUT, { recursive: true });

  /* `used` es global: ninguna foto se repite en todo el catálogo, ni entre
     productos ni entre cabeceras de categoría. Es lo que pidió el usuario. */
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
      // Galeria de producto: 3 fotos (principal, estilo, alternativa).
      count: 3,
    })),
    // La cabecera de categoría también exige foto propia: el usuario pidió que
    // no se repita ninguna fotografía en todo el catálogo.
    ...Object.entries(CATEGORIES).map(([slug, spec]) => ({
      key: `cat:${slug}`,
      spec,
      slug,
      outDir: CATEGORY_OUT,
      // Solo se usa la primera: descargar tres sería tirar dos.
      count: 1,
    })),
    // Fotos editoriales del home, lookbook y about.
    ...EDITORIAL_SLOTS.map((slot) => ({
      key: `ed:${slot}`,
      spec: EDITORIAL_SPEC,
      slug: slot,
      outDir: EDITORIAL_OUT,
      count: 1,
    })),
  ];

  /* Se resuelven PRIMERO las cabeceras de categoría y las fotos editoriales:
     si se dejan para el final, los 48 productos se quedan sin candidatas
     propias de buena calidad. */
  const priority = (t) => (t.key.startsWith("cat:") ? 0 : t.key.startsWith("ed:") ? 1 : 2);
  const ordered = [...targets].sort((a, b) => priority(a) - priority(b));

  let downloaded = 0;
  let failed = 0;
  const imageCount = [];
  for (const t of ordered) {
    const inGroup = verified.filter(
      (v) => t.spec.any.some((g) => v.groups.includes(g)) && !used.has(v.url)
    );
    /* Preferimos siempre fotos que sean de ESA prenda. Si no hay ninguna,
       se acepta una foto de la categoría (sigue siendo ropa) antes que
       meter una foto de otra prenda: es preferible 1 foto correcta a 3
       fotos donde 2 son de otro producto. */
    const exact = inGroup.filter((v) => (t.spec.like || []).some((l) => hasGarmentWord(v, l)));
    const source = exact.length > 0 ? exact : inGroup;

    const ranked = rank(source, t.spec);
    const want = t.count ?? 3;
    const picks = [];
    const seenTitles = new Set();
    for (const c of ranked) {
      if (picks.length >= want) break;
      const key = (c.titleLower || c.title || "").replace(/[^a-z]/g, "").slice(0, 18);
      if (key && seenTitles.has(key)) continue;
      if (picks.some((p) => p.url === c.url)) continue;
      seenTitles.add(key);
      picks.push(c);
    }
    if (picks.length < want) {
      for (const c of ranked) {
        if (picks.length >= want) break;
        if (picks.some((p) => p.url === c.url)) continue;
        picks.push(c);
      }
    }

    if (picks.length === 0) {
      console.log(`  ! ${t.key}: sin candidatos verificados`);
      failed++;
      continue;
    }
    imageCount.push({ key: t.key, n: picks.length, want: t.count ?? 3, exact: exact.length > 0 });

    const files = [];
    for (let i = 0; i < picks.length; i++) {
      const pick = picks[i];
      /* Con una sola foto no hace falta el sufijo -1: "hero-main-1.webp"
         queda redundante en una ruta pública. Las galerías de producto sí lo
         necesitan porque ahí la foto principal es la -1. */
      const name = t.count === 1 ? `${t.slug}.webp` : `${t.slug}-${i + 1}.webp`;
      // ruta publica con barra inicial: /images/products/<slug>-1.webp
      const segs = t.outDir.split(/[\\/]/);
      const publicDir = segs.slice(segs.indexOf("public") + 1).join("/");
      const publicPath = `/${publicDir}/${name}`;
      const dest = join(t.outDir, name);
      try {
        /* Con --force se re-descarga siempre. Sin él, el script respeta el
           archivo que ya estaba en disco, y por eso al ENDURECER los filtros
           las fotos malas seguían ahí: el JSON apuntaba a los mismos archivos
           viejos. Endurecer una regla sin --force no cambiaba nada. */
        if (force || !isUsable(dest)) await downloadAndNormalize(pick, dest);
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

  /* Fuente única de verdad para las fotos editoriales. Se genera aquí para que
     ninguna ruta se escriba a mano en un componente: si el pool cambia, el
     `npm run images` actualiza también este archivo. */
  const editorialEntries = EDITORIAL_SLOTS.filter((slot) => imageMap[`ed:${slot}`]).map(
    (slot) => `  "${slot}": "${imageMap[`ed:${slot}`][0]}",`
  );
  await writeFile(
    EDITORIAL_CONST,
    [
      "// app/constants/editorialImages.ts",
      "//",
      "// GENERADO por `npm run images` (scripts/catalog-images.mjs). No editar a mano:",
      "// los próximos `npm run images` sobrescriben este archivo. Cada foto está",
      "// verificada por el mismo filtro que el catálogo (prenda concreta, sin paisaje,",
      "// sin marca de terceros) y vive en /public, así que no depende de ningún CDN.",
      "",
      "export const EDITORIAL_IMAGES = {",
      ...editorialEntries,
      "} as const;",
      "",
      "export type EditorialImageKey = keyof typeof EDITORIAL_IMAGES;",
      "",
    ].join("\n")
  );

  await writeFile(join(CACHE_DIR, "credits.json"), JSON.stringify(credits, null, 2));
  await writeFile(join(CACHE_DIR, "image-map.json"), JSON.stringify(imageMap, null, 2));

  console.log(`\nDescargas: ${downloaded}  fallos: ${failed}`);
  const missing = targets.filter((t) => !imageMap[t.key]);
  console.log(`Objetivos: ${targets.length}  sin imagen: ${missing.length}`);
  if (missing.length) console.log("  ->", missing.map((m) => m.key).join(", "));

  const complete = imageCount.filter((c) => c.n >= c.want).length;
  const exactN = imageCount.filter((c) => c.exact).length;
  console.log(
    `Cobertura: ${complete}/${imageCount.length} objetivos con todas sus fotos, ` +
      `${exactN} con foto de la prenda exacta`
  );
  const low = imageCount.filter((c) => c.n < c.want);
  if (low.length) console.log(`  incompletos: ${low.map((c) => `${c.key}(${c.n}/${c.want})`).join(", ")}`);
  console.log(`Constante editorial escrita: ${editorialEntries.length} entradas`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
