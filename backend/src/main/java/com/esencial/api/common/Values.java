package com.esencial.api.common;

import java.time.Instant;

/**
 * Utilidades de uso general que estaban duplicadas en varios servicios.
 *
 * <p>Que dos clases copien la misma comprobacion no falla hoy, pero hace que
 * arreglarla exija recordar las dos: por eso viven aqui.
 */
public final class Values {

    private Values() {
    }

    /**
     * Devuelve el texto recortado o {@code null} si venia vacio.
     *
     * <p>Sirve para no guardar cadenas en blanco: con la inclusion de nulos
     * configurada en Jackson, guardar {@code ""} en un campo opcional hace que
     * la API lo devuelva siempre, mientras que {@code null} lo omite.
     */
    public static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    /**
     * Compara dos instantes tratando {@code null} como "sin fecha", que se
     * ordena al final.
     *
     * <p>Los documentos de MongoDB pueden no tener {@code createdAt} si se
     * importaron a mano, y {@code Instant.compareTo} no tolera nulos.
     */
    public static int compareNullable(Instant left, Instant right) {
        if (left == null && right == null) {
            return 0;
        }
        if (left == null) {
            return 1;
        }
        if (right == null) {
            return -1;
        }
        return left.compareTo(right);
    }
}
