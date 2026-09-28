package com.esencial.api.common;

/**
 * El pedido choca con el estado actual del sistema: stock insuficiente,
 * correo ya registrado, slug repetido. Se traduce a 409.
 */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
