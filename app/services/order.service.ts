// app/services/order.service.ts

export interface Order {
    id: string;
    customerName: string;
    total: number;
    status: 'pendiente' | 'procesando' | 'enviado' | 'entregado' | 'cancelado';
    createdAt: string;
  }
  
  export const OrderService = {
    /**
     * Obtiene todos los pedidos (para el panel administrativo)
     */
    async getAll(): Promise<Order[]> {
      const response = await fetch("/api/orders", {
        headers: { "Content-Type": "application/json" }
      });
      
      if (!response.ok) throw new Error("Error al recuperar los pedidos.");
      return response.json();
    },
  
    /**
     * Crea un nuevo pedido desde el carrito
     */
    async create(orderData: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
  
      if (!response.ok) throw new Error("Error al procesar el pedido.");
      return response.json();
    },
  
    /**
     * Actualiza el estado de un pedido (ej: marcado como 'enviado')
     */
    async updateStatus(id: string, status: Order['status']): Promise<void> {
      const response = await fetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
  
      if (!response.ok) throw new Error(`No se pudo actualizar el estado del pedido ${id}.`);
    }
  };