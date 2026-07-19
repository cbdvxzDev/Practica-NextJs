// app/constants/roles.ts

/**
 * Roles definidos para el sistema de control de acceso (RBAC).
 * Usamos un objeto congelado para evitar mutaciones durante la ejecución.
 */
export const ROLES = {
    ADMIN: 'admin',
    SUPPORT: 'support',
    CUSTOMER: 'customer',
  } as const;
  
  /**
   * Permisos asociados a cada rol para facilitar la validación en el frontend.
   */
  export const ROLE_PERMISSIONS = {
    [ROLES.ADMIN]: ['view_dashboard', 'manage_users', 'manage_products', 'process_orders'],
    [ROLES.SUPPORT]: ['view_dashboard', 'view_orders', 'update_order_status'],
    [ROLES.CUSTOMER]: ['view_profile', 'view_orders', 'place_orders'],
  } as const;
  
  export type RoleKey = keyof typeof ROLES;
  export type RoleValue = typeof ROLES[RoleKey];