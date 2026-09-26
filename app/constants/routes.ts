// app/constants/routes.ts

/**
 * Rutas centralizadas de la aplicación.
 */
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    /** Panel administrativo. Todas cuelgan de /admin (ver app/admin). */
    ADMIN: {
      MAIN: '/admin',
      DASHBOARD: '/admin/dashboard',
      PRODUCTS: '/admin/products',
      CATEGORIES: '/admin/categories',
      INVENTORY: '/admin/inventory',
      ORDERS: '/admin/orders',
      USERS: '/admin/users',
    },
    SHOP: {
      PRODUCTS: '/products',
      CATEGORIES: '/categories',
      CART: '/cart',
      CHECKOUT: '/checkout',
      WISHLIST: '/wishlist',
    },
    PROFILE: '/profile',
  } as const;

  /**
   * Lista de rutas que requieren autenticación.
   */
  export const PROTECTED_ROUTES = [
    ROUTES.ADMIN.MAIN,
    ROUTES.ADMIN.DASHBOARD,
    ROUTES.ADMIN.PRODUCTS,
    ROUTES.ADMIN.CATEGORIES,
    ROUTES.ADMIN.INVENTORY,
    ROUTES.ADMIN.ORDERS,
    ROUTES.ADMIN.USERS,
    ROUTES.PROFILE,
    ROUTES.SHOP.CHECKOUT,
  ];

  /**
   * Lista de rutas exclusivas para administradores.
   */
  export const ADMIN_ONLY_ROUTES = [
    ROUTES.ADMIN.USERS,
  ];
