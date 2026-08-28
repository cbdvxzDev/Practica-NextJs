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
];

export const FEATURED_PRODUCTS = PRODUCTS.filter((product) => product.compareAtPrice || product.rating >= 4.8).slice(0, 4);
