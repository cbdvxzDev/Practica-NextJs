package com.esencial.api.common;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class SlugsTest {

    @Test
    @DisplayName("quita tildes y pasa a minusculas")
    void normalizaAcentos() {
        assertThat(Slugs.toSlug("Camisa de Lino")).isEqualTo("camisa-de-lino");
        assertThat(Slugs.toSlug("Básicos Esenciales")).isEqualTo("basicos-esenciales");
        assertThat(Slugs.toSlug("Denim")).isEqualTo("denim");
    }

    @Test
    @DisplayName("colapsa espacios y guiones repetidos en uno solo")
    void colapsaSeparadores() {
        assertThat(Slugs.toSlug("  Camisa   de   lino  ")).isEqualTo("camisa-de-lino");
        assertThat(Slugs.toSlug("camisa - de - lino")).isEqualTo("camisa-de-lino");
    }

    @Test
    @DisplayName("deja el slug sin guiones sueltos en los extremos")
    void recortaGuionesDeLosExtremos() {
        // Sin este recorte, "  Camisa de Lino  " generaria "-camisa-de-lino" y
        // chocaria con el indice unico de slug del documento anterior.
        assertThat(Slugs.toSlug("---Camisa de Lino---")).isEqualTo("camisa-de-lino");
    }

    @Test
    @DisplayName("descarta los simbolos que no son de una URL")
    void descartaSimbolos() {
        assertThat(Slugs.toSlug("Bolso de mano (cuero) 100%")).isEqualTo("bolso-de-mano-cuero-100");
    }

    @Test
    @DisplayName("devuelve cadena vacia si no hay texto utilizable")
    void vacio() {
        assertThat(Slugs.toSlug("")).isEmpty();
        assertThat(Slugs.toSlug("   ")).isEmpty();
        assertThat(Slugs.toSlug(null)).isEmpty();
        assertThat(Slugs.toSlug("!!!")).isEmpty();
    }
}
