// app/constants/sizeGuide.ts
// Tablas de medidas en centímetros usadas por el modal de la ficha de producto
// y por la página /size-guide. Se mantienen aquí para que ambas vistas digan
// exactamente lo mismo.

export interface SizeRow {
  size: string;
  chest: string;
  waist: string;
  hip: string;
}

export const CLOTHING_SIZES: SizeRow[] = [
  { size: "XS", chest: "80 - 86", waist: "62 - 68", hip: "86 - 92" },
  { size: "S", chest: "86 - 92", waist: "68 - 74", hip: "92 - 98" },
  { size: "M", chest: "92 - 98", waist: "74 - 80", hip: "98 - 104" },
  { size: "L", chest: "98 - 104", waist: "80 - 86", hip: "104 - 110" },
  { size: "XL", chest: "104 - 110", waist: "86 - 92", hip: "110 - 116" },
  { size: "XXL", chest: "110 - 116", waist: "92 - 98", hip: "116 - 122" },
];

export interface ShoeRow {
  size: string;
  foot: string;
  insole: string;
}

/** Tallas en centímetros de pie y de plantilla (suela interior). */
export const SHOE_SIZES: ShoeRow[] = [
  { size: "38", foot: "24.0", insole: "24.6" },
  { size: "39", foot: "24.7", insole: "25.3" },
  { size: "40", foot: "25.4", insole: "26.0" },
  { size: "41", foot: "26.0", insole: "26.6" },
  { size: "42", foot: "26.7", insole: "27.3" },
  { size: "43", foot: "27.3", insole: "27.9" },
];

export const MEASURING_TIPS = [
  {
    title: "Pecho",
    description:
      "Rodea la parte más ancha del pecho, por debajo de las axilas, manteniendo la cinta horizontal y sin apretar.",
  },
  {
    title: "Cintura",
    description:
      "Mide en la parte más estrecha del torso, justo por encima del ombligo. La cinta debe quedar sin tensión.",
  },
  {
    title: "Cadera",
    description:
      "Rodea la parte más ancha de la cadera, unos 20 cm por debajo de la cintura, con los pies juntos.",
  },
  {
    title: "Pie",
    description:
      "Ponte de pie sobre una hoja de papel, marca talón y punta del dedo más largo y mide esa distancia en centímetros.",
  },
];

export const FIT_NOTES = [
  "Si estás entre dos tallas, elige la mayor para un ajuste relajado o la menor para un ajuste ajustado.",
  "Las prendas de punto (jerseyes y cardigans) estiran: si prefieres un ajuste ceñido, baja una talla.",
  "Los abrigos estructurados se piden con la talla habitual, no una más grande.",
  "El denim se afloja con el uso: mide con la prenda seca y extendida, no encogida.",
];
