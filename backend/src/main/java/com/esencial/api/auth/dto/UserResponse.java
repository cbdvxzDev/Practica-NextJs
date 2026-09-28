package com.esencial.api.auth.dto;

import com.esencial.api.auth.domain.Role;
import com.esencial.api.auth.domain.User;

/** Vista publica de una cuenta: nunca incluye el hash de la contrasena. */
public record UserResponse(
        String id,
        String name,
        String email,
        Role role,
        boolean isActive,
        String avatarUrl,
        java.time.Instant createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.isActive(),
                user.getAvatarUrl(),
                user.getCreatedAt());
    }
}
