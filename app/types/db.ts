// app/types/db.ts
// Tipos de las entidades que se persisten en la mini base de datos JSON (/data).

export type DbUserRole = "admin" | "customer" | "support";

export interface DbUser {
  id: string;
  email: string;
  name: string;
  role: DbUserRole;
  isActive: boolean;
  avatarUrl?: string;
  createdAt: string;
  passwordHash: string;
}

export type PublicUser = Omit<DbUser, "passwordHash">;

export interface DbCategory {
  id: string;
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface DbProduct {
  id: string;
  sku: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: { id: string; name: string; slug: string };
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DbOrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type DbPaymentStatus = "paid" | "pending" | "failed";

export interface DbOrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface DbOrder {
  id: string;
  customer: string;
  email: string;
  date: string;
  total: number;
  status: DbOrderStatus;
  paymentStatus: DbPaymentStatus;
  items: DbOrderItem[];
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
}