package com.esencial.api.order.dto;

import com.esencial.api.order.domain.Order;
import com.esencial.api.order.domain.OrderItem;

import java.time.Instant;
import java.util.List;

public record OrderResponse(
        String id,
        String userId,
        String customer,
        String email,
        String date,
        long subtotal,
        long shipping,
        long total,
        String status,
        String paymentStatus,
        List<OrderItem> items,
        String shippingAddress,
        Instant createdAt,
        Instant updatedAt
) {
    public static OrderResponse from(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getUserId(),
                order.getCustomer(),
                order.getEmail(),
                order.getDate(),
                order.getSubtotal(),
                order.getShipping(),
                order.getTotal(),
                order.getStatus().value(),
                order.getPaymentStatus().value(),
                order.getItems(),
                order.getShippingAddress(),
                order.getCreatedAt(),
                order.getUpdatedAt());
    }
}
