// app/constants/routes.ts

/**
 * Rutas centralizadas de la aplicación GiborSec.
 */
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: {
      MAIN: '/dashboard',
      PRODUCTS: '/dashboard/products',
      ORDERS: '/dashboard/orders',
      USERS: '/dashboard/users',
    },
    SHOP: {
      PRODUCTS: '/products',
      CART: '/cart',
      CHECKOUT: '/checkout',
    },
    PROFILE: '/profile',
  } as const;
  
  /**
   * Lista de rutas que requieren autenticación.
   */
  export const PROTECTED_ROUTES = [
    ROUTES.DASHBOARD.MAIN,
    ROUTES.DASHBOARD.PRODUCTS,
    ROUTES.DASHBOARD.ORDERS,
    ROUTES.DASHBOARD.USERS,
    ROUTES.PROFILE,
  ];
  
  /**
   * Lista de rutas exclusivas para administradores.
   */
  export const ADMIN_ONLY_ROUTES = [
    ROUTES.DASHBOARD.USERS,
  ];