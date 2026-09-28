package com.esencial.api.order.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateOrderStatusRequest(

        @NotBlank(message = "El estado del pedido es obligatorio")
        String status
) {
}
