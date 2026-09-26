// app/services/order.service.ts
// Cliente para los endpoints de órdenes de la mini API (/api/orders).

import { fetcher } from "@/lib/fetcher";

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "paid" | "pending" | "failed";

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  /** Fotografía, slug y talla capturados al momento de la compra (opcionales). */
  image?: string;
  slug?: string;
  size?: string;
}

export interface Order {
  id: string;
  customer: string;
  email: string;
  date: string;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
}

interface ListResponse {
  data: Order[];
  meta?: { total: number };
}

export const OrderService = {
  /**
   * Obtiene las órdenes. Para clientes devuelve solo las propias.
   */
  async getAll(): Promise<Order[]> {
    const res = await fetcher<ListResponse>("/api/orders");
    return res.data;
  },

  /**
   * Obtiene una orden por id.
   */
  async getById(id: string): Promise<Order> {
    const res = await fetcher<{ data: Order }>(`/api/orders/${id}`);
    return res.data;
  },

  /**
   * Crea una orden desde el carrito. El precio total se calcula en el servidor.
   */
  async create(input: {
    items: { productId: string; quantity: number; size?: string }[];
    shippingAddress: string;
  }): Promise<Order> {
    const res = await fetcher<{ data: Order }>("/api/orders", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return res.data;
  },

  /**
   * Actualiza el estado de una orden (solo admin).
   */
  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const res = await fetcher<{ data: Order }>(`/api/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return res.data;
  },
};