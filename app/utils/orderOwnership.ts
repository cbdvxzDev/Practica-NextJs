// app/utils/orderOwnership.ts

/**
 * Identidad mínima necesaria para decidir la autoría de un pedido.
 *
 * Es deliberadamente estructural (y no `DbUser`): la misma función la usan las
 * Route Handlers, donde hay un `DbUser`, y los Client Components, donde el
 * store de Zustand maneja un `AuthUser` distinto.
 */
export interface OrderOwner {
  id: string;
  email: string;
}

/**
 * ¿Este pedido pertenece a este usuario?
 *
 * Se decide por `userId` y no por `email` a propósito: el cliente puede cambiar
 * su correo desde el perfil, y si autorizáramos por email perdería el acceso a
 * su propio historial en el momento de cambiarlo. El email queda como respaldo
 * para pedidos antiguos que todavía no tengan `userId`.
 *
 * La comparación por email es case-insensitive porque el login normaliza el
 * correo antes de guardarlo.
 *
 * Este módulo no importa nada de Node a propósito: se usa también desde
 * Client Components, y `app/lib/auth.ts` arrastra `fs` a través de `lib/db`.
 * Los tipos se importan con `import type`, que desaparece al compilar.
 */
export function isOrderOwnedBy(
  order: { userId?: string; email: string },
  user: OrderOwner
): boolean {
  if (order.userId) return order.userId === user.id;
  return order.email.toLowerCase() === user.email.toLowerCase();
}
