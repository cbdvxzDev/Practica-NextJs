package com.esencial.api.common;

/**
 * La peticion llego sin una sesion utilizable: no habia token, estaba caducado o
 * no se pudo traducir a un usuario. Se traduce a 401 en el
 * GlobalExceptionHandler.
 *
 * <p>Existe para que un fallo de autenticacion en el resolutor de argumentos
 * no acabe en el manejador generico como 500: un 500 dice "el servidor se
 * rompio" cuando en realidad lo unico que fallo es que falto el token.
 */
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }
}
