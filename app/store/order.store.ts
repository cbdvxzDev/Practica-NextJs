"use client";

import { create } from "zustand";
import { OrderService, type Order, type OrderItem, type OrderStatus, type PaymentStatus } from "@/services/order.service";

export type { Order, OrderStatus, PaymentStatus, OrderItem };

export interface NewOrder {
  customer: string;
  email: string;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  shippingAddress: string;
}

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;

  /** Reemplaza las órdenes con datos de la mini API (clientes solo ven las propias). */
  setOrders: (orders: Order[]) => void;

  /** Carga las órdenes desde la mini API. */
  fetchOrders: () => Promise<void>;

  /** Crea una orden real vía API y la agrega al store local. */
  createOrder: (input: { items: { productId: string; quantity: number }[]; shippingAddress: string }) => Promise<Order>;

  /** Actualiza el estado de una orden vía API. */
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  loading: false,
  error: null,

  setOrders: (orders) => set({ orders }),

  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const orders = await OrderService.getAll();
      set({ orders, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Error al cargar las órdenes.",
        loading: false,
      });
    }
  },

  createOrder: async (input) => {
    const order = await OrderService.create(input);
    set((state) => ({ orders: [order, ...state.orders] }));
    return order;
  },

  updateOrderStatus: async (id, status) => {
    const updated = await OrderService.updateStatus(id, status);
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? updated : o)),
    }));
  },
}));

export default useOrderStore;