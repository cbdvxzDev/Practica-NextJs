package com.esencial.api.common;

/** Recurso que no existe. Se traduce a 404 en el GlobalExceptionHandler. */
public class NotFoundException extends RuntimeException {

    public NotFoundException(String message) {
        super(message);
    }
}
