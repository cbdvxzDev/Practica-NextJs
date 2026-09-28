package com.esencial.api.auth.domain;

import java.util.Arrays;
import java.util.Locale;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Rol de una cuenta.
 *
 * <p>Se serializa en minusculas porque es lo que espera el frontend (tipos de
 * la app: "admin" | "customer" | "support"). MongoDB guarda el nombre de la
 * constante en mayusculas, que es lo correcto para el indice y para las
 * consultas; la conversion a minusculas ocurre solo al serializar.
 */
public enum Role {

    ADMIN("admin"),
    SUPPORT("support"),
    CUSTOMER("customer");

    private final String value;

    Role(String value) {
        this.value = value;
    }

    @JsonValue
    public String value() {
        return value;
    }

    /**
     * Acepta el valor en cualquier capitalizacion porque el dato puede venir
     * del seed ({@code data/users.json}) o del cliente.
     *
     * <p>Un valor ausente o desconocido lanza {@link IllegalArgumentException},
     * que el manejador global traduce a 400. Devolver {@code null} en su lugar
     * dejaria usuarios guardados sin rol, y como la respuesta se serializa
     * omitiendo nulos el campo desapareceria de la respuesta en vez de
     * delatar el problema.
     */
    @JsonCreator
    public static Role from(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("El rol es obligatorio.");
        }

        String normalized = value.trim().toLowerCase(Locale.ROOT);
        return Arrays.stream(values())
                .filter(role -> role.value.equals(normalized))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Rol desconocido: «" + value + "»."));
    }
}
