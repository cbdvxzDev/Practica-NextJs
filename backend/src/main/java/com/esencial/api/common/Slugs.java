package com.esencial.api.common;

import java.text.Normalizer;
import java.util.Locale;

/** Utilidades para las URLs amigables del catalogo. */
public final class Slugs {

    private Slugs() {
    }

    /**
     * Convierte un titulo en un slug: sin tildes, sin mayusculas, separado por guiones.
     *
     * <p>Replica la funcion {@code toSlug} del frontend para que un producto
     * creado desde el panel tenga la misma URL que tendria si lo creara el cliente.
     * Sin {@code ^-+|-+$} el trim final, "Camisa de Lino" y " Camisa de Lino "
     * producirian slugs distintos y el segundo chocaria con el indice unico.
     */
    public static String toSlug(String text) {
        if (text == null || text.isBlank()) {
            return "";
        }

        return Normalizer.normalize(text, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-+|-+$", "");
    }
}
