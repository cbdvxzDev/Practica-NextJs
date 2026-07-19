// app/lib/fetcher.ts

/**
 * Fetcher universal para peticiones HTTP.
 * Facilita el uso de SWR o peticiones manuales con tipado.
 */
export async function fetcher<T>(
    url: string,
    options?: RequestInit
  ): Promise<T> {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });
  
    if (!response.ok) {
      // Intenta extraer el mensaje de error del servidor
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
  
    return response.json();
  }