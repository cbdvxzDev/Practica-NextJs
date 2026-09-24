// app/types/cart.ts


/**
 * Representa un artículo dentro del carrito de compras.
 * Extiende la información base del producto con la cantidad seleccionada.
 */
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  // Opcional: puedes añadir subtotal calculado si el backend no lo provee
  subtotal: number;
}

/**
 * Representa el estado actual del carrito de compras.
 */
export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  currency: 'COP' | 'USD'; // Ajustable a la moneda de GiborSec
}

/**
 * Payload necesario para procesar el pago del carrito.
 */
export interface CartCheckoutPayload {
  items: { productId: string; quantity: number }[];
  shippingAddressId: string;
  paymentMethodId: string;
}