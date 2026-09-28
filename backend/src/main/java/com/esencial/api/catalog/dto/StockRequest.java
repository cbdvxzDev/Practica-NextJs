package com.esencial.api.catalog.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

/** Ajuste puntual de stock desde el panel de inventario. */
public record StockRequest(

        // Envoltorio por el mismo motivo que en ProductRequest: un long primitivo
        // no admite null y un cuerpo vacio fallaria al leerse en vez de devolver
        // un 400 que dijera que falta el stock.
        @NotNull(message = "El nuevo stock es obligatorio")
        @PositiveOrZero(message = "El nuevo stock debe ser un número mayor o igual a 0")
        Long stock
) {
}
