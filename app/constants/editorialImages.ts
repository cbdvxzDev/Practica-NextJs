// app/constants/editorialImages.ts
//
// GENERADO por `npm run images` (scripts/catalog-images.mjs). No editar a mano:
// los próximos `npm run images` sobrescriben este archivo. Cada foto está
// verificada por el mismo filtro que el catálogo (prenda concreta, sin paisaje,
// sin marca de terceros) y vive en /public, así que no depende de ningún CDN.

export const EDITORIAL_IMAGES = {
  "hero-main": "/images/editorial/hero-main.webp",
  "hero-top": "/images/editorial/hero-top.webp",
  "hero-bottom": "/images/editorial/hero-bottom.webp",
  "lookbook-01": "/images/editorial/lookbook-01.webp",
  "lookbook-02": "/images/editorial/lookbook-02.webp",
  "lookbook-03": "/images/editorial/lookbook-03.webp",
  "lookbook-04": "/images/editorial/lookbook-04.webp",
  "lookbook-05": "/images/editorial/lookbook-05.webp",
  "lookbook-06": "/images/editorial/lookbook-06.webp",
  "lookbook-07": "/images/editorial/lookbook-07.webp",
  "lookbook-08": "/images/editorial/lookbook-08.webp",
  "lookbook-09": "/images/editorial/lookbook-09.webp",
  "lookbook-10": "/images/editorial/lookbook-10.webp",
  "lookbook-11": "/images/editorial/lookbook-11.webp",
  "lookbook-12": "/images/editorial/lookbook-12.webp",
  "about-01": "/images/editorial/about-01.webp",
  "about-02": "/images/editorial/about-02.webp",
  "about-03": "/images/editorial/about-03.webp",
  "about-04": "/images/editorial/about-04.webp",
  "editorial-01": "/images/editorial/editorial-01.webp",
} as const;

export type EditorialImageKey = keyof typeof EDITORIAL_IMAGES;
