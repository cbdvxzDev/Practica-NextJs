package com.esencial.api.common;

/** Respuesta de las operaciones que solo necesitan confirmar que se aplicaron. */
public record SuccessResponse(boolean success) {

    public static SuccessResponse ok() {
        return new SuccessResponse(true);
    }
}
