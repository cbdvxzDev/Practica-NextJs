package com.esencial.api.order.domain;

import java.util.Arrays;
import java.util.Locale;

public enum PaymentStatus {

    PAID("paid"),
    PENDING("pending"),
    FAILED("failed");

    private final String value;

    PaymentStatus(String value) {
        this.value = value;
    }

    public String value() {
        return value;
    }

    public static PaymentStatus from(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("El estado del pago es obligatorio.");
        }

        String normalized = value.trim().toLowerCase(Locale.ROOT);
        return Arrays.stream(values())
                .filter(status -> status.value.equals(normalized))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Estado de pago inválido."));
    }
}
