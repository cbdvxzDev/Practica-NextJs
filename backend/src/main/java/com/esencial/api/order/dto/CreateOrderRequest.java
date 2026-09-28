package com.esencial.api.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateOrderRequest(

        @NotEmpty(message = "El pedido debe incluir al menos un producto")
        @Valid
        List<OrderLineRequest> items,

        @NotBlank(message = "La dirección de envío es obligatoria")
        @Size(max = 300, message = "La dirección es demasiado larga")
        String shippingAddress
) {
    /**
     * Linea del carrito. Solo viaja el id, la cantidad y la talla: el precio se
     * resuelve en el servidor contra MongoDB, porque un cliente podria manipular
     * el cuerpo de la peticion y pedir por 1 peso.
     */
    public record OrderLineRequest(

            @NotBlank(message = "Cada línea necesita el id del producto")
            String productId,

            @NotNull(message = "La cantidad es obligatoria")
            @Positive(message = "La cantidad debe ser mayor que 0")
            int quantity,

            @Size(max = 10, message = "La talla es demasiado larga")
            String size
    ) {
    }
}
