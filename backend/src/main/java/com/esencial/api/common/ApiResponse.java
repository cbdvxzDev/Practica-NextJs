package com.esencial.api.common;

import java.util.List;

/**
 * Envoltorio de las respuestas de lectura. El cliente de Next.js ya consume
 * esta forma, asi que el backend entrega exactamente el mismo contrato.
 */
public record ApiResponse<T>(T data, Meta meta) {

    public static <T> ApiResponse<T> of(T data) {
        return new ApiResponse<>(data, null);
    }

    public static <T> ApiResponse<List<T>> ofList(List<T> items) {
        return new ApiResponse<List<T>>(items, new Meta(items.size()));
    }
}
