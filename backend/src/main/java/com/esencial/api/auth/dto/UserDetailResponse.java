package com.esencial.api.auth.dto;

import java.time.Instant;
import java.util.List;

import com.esencial.api.auth.domain.Role;
import com.esencial.api.auth.domain.User;
import com.esencial.api.order.domain.Order;
import com.esencial.api.order.dto.OrderResponse;

/**
 * Ficha de un usuario en el panel: sus datos publicos y su historial.
 * Los campos van planos, y no anidados bajo "user", porque asi los espera el
 * cliente de Next.js ({ data: { ...usuario, orders } }).
 */
public record UserDetailResponse(
        String id,
        String name,
        String email,
        Role role,
        boolean isActive,
        String avatarUrl,
        Instant createdAt,
        List<OrderResponse> orders
) {
    public static UserDetailResponse from(User user, List<Order> orders) {
        return new UserDetailResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.isActive(),
                user.getAvatarUrl(),
                user.getCreatedAt(),
                orders.stream().map(OrderResponse::from).toList());
    }
}
