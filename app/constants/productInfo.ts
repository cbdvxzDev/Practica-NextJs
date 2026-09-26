// app/constants/productInfo.ts
// Ficha ampliada de producto: composición, cuidados y especificaciones.
// El modelo de datos (data/products.json) no guarda estas columnas, así que se
// derivan del título y la descripción de cada referencia. Al añadir un material
// nuevo basta con incluirlo en MATERIALS y la ficha lo cubre automáticamente.

interface MaterialRule {
  /** Palabras clave que identifican el material en el texto del producto. */
  match: RegExp;
  /** Composición mostrada en la ficha. */
  fabric: string;
  /** Instrucciones de cuidado. */
  care: string[];
}

const MATERIALS: MaterialRule[] = [
  {
    match: /algod[oó]n/i,
    fabric: "100% algodón orgánico certificado",
    care: [
      "Lavar en máquina con agua fría y ciclo delicado.",
      "No usar blanqueador: el color natural del tejido se conserva con el tiempo.",
      "Secar al aire libre a la sombra, lejos de la luz directa.",
    ],
  },
  {
    match: /punto|jersey|su[eé]ter|cardigan/i,
    fabric: "Mezcla de algodón, lana merina y viscosa reciclada",
    care: [
      "Lavar a mano o en ciclo delicado a 30 °C.",
      "Secar siempre en horizontal para que el punto no se deforme.",
      "Guardar plegado, nunca en percha, para conservar la forma.",
    ],
  },
  {
    match: /lana|merino|alpaca/i,
    fabric: "Lana merina rastreable",
    care: [
      "Lavar a mano en agua fría con jabón neutro.",
      "No wringir: exprimir suavemente y secar en horizontal.",
      "Pesar la prenda cada tres meses para evitar la abrasión.",
    ],
  },
  {
    match: /denim|mezclilla|jean/i,
    fabric: "98% algodón y 2% elastano",
    care: [
      "Lavar del revés en agua fría para proteger el color.",
      "Evitar el secador: el denim se encoge con el calor.",
      "Colgar húmedo para que la prenda marque su propia silueta.",
    ],
  },
  {
    match: /lino/i,
    fabric: "100% lino europeo",
    care: [
      "Lavar en máquina a 30 °C con ciclo delicado.",
      "El lino se arruga con facilidad: esa es su textura, no un defecto.",
      "Planchar en húmedo y a temperatura media.",
    ],
  },
  {
    match: /cuero|botin|botas|chelsea|sandalia/i,
    fabric: "Cuero de curtido vegetal",
    care: [
      "Limpiar con un paño seco; usar crema de cuero dos veces al año.",
      "No mojar la suela ni exponerla al sol directo.",
      "Guardar con papel de seda dentro de la caja para mantener la forma.",
    ],
  },
  {
    match: /gabardina|trench|parca|parka|abrigo|blazer/i,
    fabric: "Mezcla de algodón, poliéster reciclado y forro de viscosa",
    care: [
      "Lavar en ciclo delicado a 30 °C o limpieza en seco.",
      "Cerrar botones y cremalleras antes de lavar.",
      "Cepillar en seco entre lavado y lavado para recuperar la forma.",
    ],
  },
  {
    match: /bikini|playera|t[- ]?shirt|camiseta|camisa|blusa/i,
    fabric: "Algodón peinado de fibra larga",
    care: [
      "Lavar en máquina a 30 °C con colores similares.",
      "Planchar por el reverso para no marcar el estampado.",
      "Secar en sombra para que la fibra no se endurezca.",
    ],
  },
  {
    match: /satin|sat[eé]n/i,
    fabric: "Satén de seda vegetal",
    care: [
      "Lavar a mano en agua fría; el satén se daña con la fricción.",
      "No retorcer: enrollar en una toalla y presionar con cuidado.",
      "Guardar en percha con funda para evitar marcas.",
    ],
  },
];

const DEFAULT_MATERIAL: MaterialRule = {
  match: /.*/,
  fabric: "Mezcla de algodón y fibras naturales",
  care: [
    "Lavar a 30 °C con ciclo delicado.",
    "Secar en sombra y a temperatura ambiente.",
    "Consultar siempre la etiqueta de la prenda antes de limpiarla.",
  ],
};

/** Resuelve composición y cuidados a partir del texto del producto. */
export function getProductDetails(product: { title: string; description: string }) {
  const text = `${product.title} ${product.description}`;
  const rule = MATERIALS.find((material) => material.match.test(text)) ?? DEFAULT_MATERIAL;

  return {
    fabric: rule.fabric,
    care: rule.care,
  };
}
