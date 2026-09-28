package com.esencial.api.auth.dto;

/**
 * Respuesta de login y registro.
 *
 * <p>Los datos del usuario van anidados bajo {@code user} porque asi los
 * entrega el cliente de Next.js ({@code { token, user }}). Aplanarlos
 * obligaria a cambiar el tipo {@code AuthUser} del frontend.
 */
public record AuthResponse(
        String token,
        String tokenType,
        long expiresIn,
        UserResponse user
) {
}
