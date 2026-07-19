// app/types/api.ts

/**
 * Interfaz base para respuestas paginadas de la API.
 */
export interface PaginatedResponse<T> {
    data: T[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }
  
  /**
   * Interfaz para errores estándar de la API.
   */
  export interface ApiError {
    message: string;
    code: string;
    details?: Record<string, string[]>;
  }
  
  /**
   * Interfaz genérica para envolver respuestas de éxito.
   */
  export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
  }
  
  /**
   * Tipos de estado global para operaciones asíncronas.
   */
  export type LoadingState = 'idle' | 'loading' | 'success' | 'error';