// app/store/orders.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OrderStatus = 'pendiente' | 'procesando' | 'enviado' | 'entregado' | 'cancelado';
export type PaymentStatus = 'pagado' | 'pendiente';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export type NewOrderInput = Omit<Order, 'id' | 'createdAt' | 'status' | 'paymentStatus'>;

interface OrdersState {
  orders: Order[];
  addOrder: (order: NewOrderInput) => Order;
  updateStatus: (id: string, status: OrderStatus) => void;
  getOrdersByEmail: (email: string) => Order[];
}

let orderSequence = 0;

const generateOrderId = () => {
  orderSequence += 1;
  const year = new Date().getFullYear();
  const sequencePart = String(orderSequence).padStart(4, '0');
  return `ORD-${year}-${sequencePart}`;
};

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],

      addOrder: (orderInput) => {
        const newOrder: Order = {
          ...orderInput,
          id: generateOrderId(),
          status: 'pendiente',
          paymentStatus: 'pagado',
          createdAt: new Date().toISOString(),
        };

        set((state) => ({ orders: [newOrder, ...state.orders] }));
        return newOrder;
      },

      updateStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id ? { ...order, status } : order
          ),
        })),

      getOrdersByEmail: (email) =>
        get().orders.filter(
          (order) => order.customerEmail.toLowerCase() === email.trim().toLowerCase()
        ),
    }),
    {
      name: 'orders-storage',
      partialize: (state) => ({ orders: state.orders }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          orderSequence = state.orders.length;
        }
      },
    }
  )
);
