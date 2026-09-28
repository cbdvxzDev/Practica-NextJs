package com.esencial.api.order.domain;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

/**
 * Ciclo de vida de un pedido.
 *
 * El valor guardado es en minusculas porque es el que entiende el frontend
 * (tipos de la app: "pending" | "processing" | ...). MongoDB guardaria el
 * nombre de la constante en mayusculas, asi que la conversion se hace en el
 * borde de la API y no dentro del dominio.
 *
 * Las transiciones van en un {@code switch} y no en el constructor a proposito:
 * al construir una constante, las siguientes todavia no existen, asi que una
 * lista de destinos en el constructor se llenaria de nulos.
 */
public enum OrderStatus {

    PENDING("pending"),
    PROCESSING("processing"),
    SHIPPED("shipped"),
    DELIVERED("delivered"),
    CANCELLED("cancelled");

    private final String value;

    OrderStatus(String value) {
        this.value = value;
    }

    public String value() {
        return value;
    }

    /** Estados a los que se puede pasar desde este. */
    public List<OrderStatus> allowedNext() {
        return switch (this) {
            case PENDING -> List.of(PROCESSING, CANCELLED);
            case PROCESSING -> List.of(SHIPPED, CANCELLED);
            case SHIPPED -> List.of(DELIVERED);
            case DELIVERED, CANCELLED -> List.of();
        };
    }

    public boolean canTransitionTo(OrderStatus target) {
        return allowedNext().contains(target);
    }

    public static OrderStatus from(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("El estado del pedido es obligatorio.");
        }

        String normalized = value.trim().toLowerCase(Locale.ROOT);
        return Arrays.stream(values())
                .filter(status -> status.value.equals(normalized))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Estado de pedido inválido."));
    }
}
