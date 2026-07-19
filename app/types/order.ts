// app/types/order.ts

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
  };
  createdAt: string; // ISO String
  updatedAt: string;
}

/**
 * Representa la solicitud para crear un pedido nuevo.
 * Excluimos campos generados por el sistema como id o fechas.
 */
export type CreateOrderInput = Pick<Order, 'items' | 'shippingAddress'> & {
  paymentMethodId: string;
};