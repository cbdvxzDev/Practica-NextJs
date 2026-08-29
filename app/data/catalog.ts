export type Department = "Moda" | "Belleza" | "Accesorios" | "Tecnología";

export interface StoreCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

export interface StoreProduct {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: { id: string; name: string; slug: string };
  department: Department;
  stock: number;
  isActive: boolean;
  rating: number;
  reviews: number;
}

const image = (id: string, width = 1200, height = 1500) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&h=${height}&q=90`;

export const CATEGORIES: StoreCategory[] = [
  { id: "moda", name: "Moda", slug: "moda", description: "Prendas, calzado y básicos para cada estilo.", image: image("photo-1490481651871-ab68de25d43d") },
  { id: "belleza", name: "Belleza", slug: "belleza", description: "Fragancias y cuidado personal para tu rutina.", image: image("photo-1596462502278-27bfdc403348") },
  { id: "accesorios", name: "Accesorios", slug: "accesorios", description: "Detalles que completan tus looks y espacios.", image: image("photo-1523779917675-b6ed3a42a561") },
  { id: "tecnologia", name: "Tecnología", slug: "tecnologia", description: "Innovación útil para trabajar, crear y disfrutar.", image: image("photo-1468495244123-6c6c332eeece") },
];

export const PRODUCTS: StoreProduct[] = [
  // ---------- MODA ----------
  {
    id: "1", slug: "chaqueta-minimalista-lana", title: "Chaqueta Minimalista en Lana",
    description: "Corte estructurado, tacto suave y una silueta atemporal para acompañarte durante años.",
    price: 189000, images: [image("photo-1551028719-00167b16eac5"), image("photo-1544022613-e87ca75a784a")],
    category: { id: "moda", name: "Moda", slug: "moda" }, department: "Moda", stock: 5, isActive: true, rating: 4.8, reviews: 26,
  },
  {
    id: "2", slug: "camiseta-algodon-organico", title: "Camiseta Esencial de Algodón",
    description: "Algodón premium de tacto ligero, fit relajado y acabados limpios para todos los días.",
    price: 45000, compareAtPrice: 60000, images: [image("photo-1521572163474-6864f9cf17ab")],
    category: { id: "moda", name: "Moda", slug: "moda" }, department: "Moda", stock: 12, isActive: true, rating: 4.7, reviews: 41,
  },
  {
    id: "9", slug: "jean-recto-clasico", title: "Jean Recto Clásico",
    description: "Denim resistente de lavado medio con corte recto y comodidad para el uso diario.",
    price: 129000, images: [image("photo-1541099649105-f69ad21f3246")],
    category: { id: "moda", name: "Moda", slug: "moda" }, department: "Moda", stock: 18, isActive: true, rating: 4.5, reviews: 64,
  },
  {
    id: "10", slug: "vestido-lino-verano", title: "Vestido de Lino de Verano",
    description: "Tejido fresco y transpirable, ideal para días cálidos con una caída elegante y ligera.",
    price: 159000, compareAtPrice: 199000, images: [image("photo-1595777457583-95e059d581b8")],
    category: { id: "moda", name: "Moda", slug: "moda" }, department: "Moda", stock: 9, isActive: true, rating: 4.8, reviews: 37,
  },
  {
    id: "11", slug: "sueter-cuello-alto", title: "Suéter de Cuello Alto",
    description: "Punto grueso y cálido con cuello alto, perfecto para combinar en temporada fría.",
    price: 109000, images: [image("photo-1576871337622-98d48d1cf531")],
    category: { id: "moda", name: "Moda", slug: "moda" }, department: "Moda", stock: 14, isActive: true, rating: 4.6, reviews: 22,
  },
  {
    id: "12", slug: "zapatillas-urbanas-blancas", title: "Zapatillas Urbanas Blancas",
    description: "Diseño limpio en cuero sintético con suela ligera, cómodas para uso diario intenso.",
    price: 219000, compareAtPrice: 259000, images: [image("photo-1595950653106-6c9ebd614d3a")],
    category: { id: "moda", name: "Moda", slug: "moda" }, department: "Moda", stock: 11, isActive: true, rating: 4.7, reviews: 78,
  },
  {
    id: "13", slug: "falda-plisada-midi", title: "Falda Plisada Midi",
    description: "Plisado fino con caída fluida y cintura elástica, versátil para looks casuales o formales.",
    price: 99000, images: [image("photo-1583744946564-b2ba63f13724")],
    category: { id: "moda", name: "Moda", slug: "moda" }, department: "Moda", stock: 10, isActive: true, rating: 4.4, reviews: 15,
  },

  // ---------- BELLEZA ----------
  {
    id: "3", slug: "perfume-eau-de-parfum", title: "Eau de Parfum Signature",
    description: "Una fragancia cálida con notas amaderadas, vainilla y un fondo de ámbar elegante.",
    price: 249000, compareAtPrice: 289000, images: [image("photo-1541643600914-78b084683601")],
    category: { id: "belleza", name: "Belleza", slug: "belleza" }, department: "Belleza", stock: 8, isActive: true, rating: 4.9, reviews: 18,
  },
  {
    id: "4", slug: "kit-cuidado-facial", title: "Kit Esencial de Cuidado Facial",
    description: "Limpieza, hidratación y protección en una rutina simple para una piel luminosa.",
    price: 139000, images: [image("photo-1556228720-195a672e8a03")],
    category: { id: "belleza", name: "Belleza", slug: "belleza" }, department: "Belleza", stock: 15, isActive: true, rating: 4.6, reviews: 12,
  },
  {
    id: "14", slug: "serum-vitamina-c", title: "Sérum de Vitamina C",
    description: "Fórmula antioxidante que ilumina el tono de la piel y reduce la apariencia de manchas.",
    price: 89000, compareAtPrice: 109000, images: [image("photo-1620916566398-39f1143ab7be")],
    category: { id: "belleza", name: "Belleza", slug: "belleza" }, department: "Belleza", stock: 20, isActive: true, rating: 4.8, reviews: 52,
  },
  {
    id: "15", slug: "paleta-sombras-nude", title: "Paleta de Sombras Nude",
    description: "12 tonos mate y perlados en una gama neutra, fáciles de combinar para cualquier look.",
    price: 79000, images: [image("photo-1512496015851-a90fb38ba796")],
    category: { id: "belleza", name: "Belleza", slug: "belleza" }, department: "Belleza", stock: 17, isActive: true, rating: 4.5, reviews: 29,
  },
  {
    id: "16", slug: "labial-mate-larga-duracion", title: "Labial Mate Larga Duración",
    description: "Color intenso de acabado mate que resiste hasta 12 horas sin resecar los labios.",
    price: 39000, compareAtPrice: 49000, images: [image("photo-1586495777744-4413f21062fa")],
    category: { id: "belleza", name: "Belleza", slug: "belleza" }, department: "Belleza", stock: 25, isActive: true, rating: 4.7, reviews: 66,
  },
  {
    id: "17", slug: "crema-hidratante-corporal", title: "Crema Hidratante Corporal",
    description: "Textura ligera de rápida absorción con manteca de karité para una piel suave todo el día.",
    price: 59000, images: [image("photo-1571781926291-c477ebfd024b")],
    category: { id: "belleza", name: "Belleza", slug: "belleza" }, department: "Belleza", stock: 22, isActive: true, rating: 4.5, reviews: 34,
  },
  {
    id: "18", slug: "set-brochas-maquillaje", title: "Set de Brochas de Maquillaje",
    description: "8 brochas profesionales con cerdas suaves y mango ergonómico, incluye estuche de viaje.",
    price: 69000, images: [image("photo-1522337360788-8b13dee7a37e")],
    category: { id: "belleza", name: "Belleza", slug: "belleza" }, department: "Belleza", stock: 13, isActive: true, rating: 4.6, reviews: 19,
  },

  // ---------- ACCESORIOS ----------
  {
    id: "5", slug: "gafas-sol-acetato", title: "Gafas de Sol en Acetato",
    description: "Montura ligera con protección UV400 y una forma clásica que funciona en cualquier ocasión.",
    price: 119000, images: [image("photo-1511499767150-a48a237f0083")],
    category: { id: "accesorios", name: "Accesorios", slug: "accesorios" }, department: "Accesorios", stock: 7, isActive: true, rating: 4.8, reviews: 33,
  },
  {
    id: "6", slug: "reloj-acero-minimal", title: "Reloj Minimal de Acero",
    description: "Diseño limpio, correa ajustable y movimiento confiable para elevar tu estilo diario.",
    price: 279000, images: [image("photo-1524805444758-089113d48a6d")],
    category: { id: "accesorios", name: "Accesorios", slug: "accesorios" }, department: "Accesorios", stock: 4, isActive: true, rating: 4.7, reviews: 9,
  },
  {
    id: "19", slug: "bolso-cuero-tote", title: "Bolso Tote en Cuero",
    description: "Cuero genuino con acabados reforzados, amplio compartimento interno y correa acolchada.",
    price: 249000, compareAtPrice: 299000, images: [image("photo-1584917865442-de89df76afd3")],
    category: { id: "accesorios", name: "Accesorios", slug: "accesorios" }, department: "Accesorios", stock: 6, isActive: true, rating: 4.9, reviews: 47,
  },
  {
    id: "20", slug: "cinturon-cuero-clasico", title: "Cinturón de Cuero Clásico",
    description: "Cuero de alta calidad con hebilla metálica minimalista, disponible en varios largos.",
    price: 69000, images: [image("photo-1624222247344-550fb60583dc")],
    category: { id: "accesorios", name: "Accesorios", slug: "accesorios" }, department: "Accesorios", stock: 16, isActive: true, rating: 4.6, reviews: 24,
  },
  {
    id: "21", slug: "collar-plata-minimalista", title: "Collar de Plata Minimalista",
    description: "Cadena fina en plata 925 con dije geométrico, ideal para uso diario o combinar en capas.",
    price: 99000, compareAtPrice: 129000, images: [image("photo-1599643477877-530eb83abc8e")],
    category: { id: "accesorios", name: "Accesorios", slug: "accesorios" }, department: "Accesorios", stock: 12, isActive: true, rating: 4.7, reviews: 31,
  },
  {
    id: "22", slug: "mochila-urbana-resistente", title: "Mochila Urbana Resistente",
    description: "Material impermeable, compartimento acolchado para portátil y diseño ergonómico.",
    price: 189000, images: [image("photo-1553062407-98eeb64c6a62")],
    category: { id: "accesorios", name: "Accesorios", slug: "accesorios" }, department: "Accesorios", stock: 9, isActive: true, rating: 4.8, reviews: 58,
  },
  {
    id: "23", slug: "gorra-algodon-bordada", title: "Gorra de Algodón Bordada",
    description: "Ajuste regulable, visera curva y bordado discreto para un look casual y versátil.",
    price: 49000, images: [image("photo-1521369909029-2afed882baee")],
    category: { id: "accesorios", name: "Accesorios", slug: "accesorios" }, department: "Accesorios", stock: 19, isActive: true, rating: 4.4, reviews: 16,
  },

  // ---------- TECNOLOGÍA ----------
  {
    id: "7", slug: "audifonos-wireless-pro", title: "Audífonos Wireless Pro",
    description: "Cancelación activa de ruido, audio inmersivo y hasta 30 horas de batería.",
    price: 399000, compareAtPrice: 459000, images: [image("photo-1505740420928-5e560c06d30e")],
    category: { id: "tecnologia", name: "Tecnología", slug: "tecnologia" }, department: "Tecnología", stock: 10, isActive: true, rating: 4.9, reviews: 57,
  },
  {
    id: "8", slug: "smartwatch-active", title: "Smartwatch Active",
    description: "Salud, notificaciones y entrenamiento en tu muñeca con una pantalla brillante y ligera.",
    price: 329000, images: [image("photo-1523275335684-37898b6baf30")],
    category: { id: "tecnologia", name: "Tecnología", slug: "tecnologia" }, department: "Tecnología", stock: 6, isActive: true, rating: 4.6, reviews: 21,
  },
  {
    id: "24", slug: "parlante-bluetooth-portatil", title: "Parlante Bluetooth Portátil",
    description: "Sonido envolvente 360°, resistente al agua IPX7 y hasta 20 horas de reproducción continua.",
    price: 179000, compareAtPrice: 219000, images: [image("photo-1608043152269-423dbba4e7e1")],
    category: { id: "tecnologia", name: "Tecnología", slug: "tecnologia" }, department: "Tecnología", stock: 14, isActive: true, rating: 4.7, reviews: 63,
  },
  {
    id: "25", slug: "cargador-inalambrico-rapido", title: "Cargador Inalámbrico Rápido",
    description: "Carga hasta 15W compatible con la mayoría de smartphones, base antideslizante incluida.",
    price: 89000, images: [image("photo-1591290619762-c4e63cd0aa4c")],
    category: { id: "tecnologia", name: "Tecnología", slug: "tecnologia" }, department: "Tecnología", stock: 23, isActive: true, rating: 4.5, reviews: 40,
  },
  {
    id: "26", slug: "teclado-mecanico-rgb", title: "Teclado Mecánico RGB",
    description: "Switches táctiles de alta durabilidad con retroiluminación personalizable y estructura en aluminio.",
    price: 259000, images: [image("photo-1587829741301-dc798b83add3")],
    category: { id: "tecnologia", name: "Tecnología", slug: "tecnologia" }, department: "Tecnología", stock: 8, isActive: true, rating: 4.8, reviews: 45,
  },
  {
    id: "27", slug: "camara-instantanea-retro", title: "Cámara Instantánea Retro",
    description: "Captura y revela tus fotos al instante con un diseño vintage y lente de enfoque nítido.",
    price: 349000, compareAtPrice: 399000, images: [image("photo-1516035069371-29a1b244cc32")],
    category: { id: "tecnologia", name: "Tecnología", slug: "tecnologia" }, department: "Tecnología", stock: 5, isActive: true, rating: 4.9, reviews: 27,
  },
  {
    id: "28", slug: "tablet-10-pulgadas", title: "Tablet 10 Pulgadas",
    description: "Pantalla de alta resolución, batería de larga duración y rendimiento fluido para trabajo y ocio.",
    price: 899000, compareAtPrice: 999000, images: [image("photo-1544244015-0df4b3ffc6b0")],
    category: { id: "tecnologia", name: "Tecnología", slug: "tecnologia" }, department: "Tecnología", stock: 7, isActive: true, rating: 4.7, reviews: 39,
  },
];

export const FEATURED_PRODUCTS = PRODUCTS.filter((product) => product.compareAtPrice || product.rating >= 4.8).slice(0, 8);

