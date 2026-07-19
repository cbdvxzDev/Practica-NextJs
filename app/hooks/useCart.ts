"use client";

import * as React from "react";

// Estructura de los items en el carrito
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

// Este hook actuará como intermediario hacia el contexto global
// Asegúrate de tener un CartProvider envolviendo tu layout principal
export const useCart = () => {
  // Nota: Aquí se consumiría el Contexto. 
  // Por ahora, definimos la lógica de negocio que este hook expondrá.
  
  const [items, setItems] = React.useState<CartItem[]>([]);

  const addItem = (product: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) return removeItem(id);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setItems([]);

  // Cálculos derivados (memorizados para rendimiento)
  const totalItems = React.useMemo(() => 
    items.reduce((acc, item) => acc + item.quantity, 0), 
  [items]);

  const totalPrice = React.useMemo(() => 
    items.reduce((acc, item) => acc + item.price * item.quantity, 0), 
  [items]);

  return {
    items,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
};