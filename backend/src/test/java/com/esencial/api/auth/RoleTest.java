package com.esencial.api.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;

import com.esencial.api.auth.domain.Role;

class RoleTest {

    @Test
    @DisplayName("acepta el valor en cualquier capitalizacion")
    void aceptaCapitalizaciones() {
        assertThat(Role.from("admin")).isEqualTo(Role.ADMIN);
        assertThat(Role.from("ADMIN")).isEqualTo(Role.ADMIN);
        assertThat(Role.from("  Support  ")).isEqualTo(Role.SUPPORT);
        assertThat(Role.from("customer")).isEqualTo(Role.CUSTOMER);
    }

    @Test
    @DisplayName("un rol desconocido es un 400, no un null silencioso")
    void rolDesconocidoLanza() {
        assertThatThrownBy(() -> Role.from("superusuario"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("superusuario");
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = { "", "   " })
    @DisplayName("un rol ausente se rechaza en vez de guardarse como null")
    void rolAusenteLanza(String value) {
        // Devolver null dejaba usuarios guardados sin rol y, como la respuesta
        // omite los nulos, el campo desaparecia de la respuesta en lugar de
        // delatar el problema.
        assertThatThrownBy(() -> Role.from(value))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("el rol se serializa en minusculas, que es lo que espera el frontend")
    void serializaEnMinusculas() {
        assertThat(Role.ADMIN.value()).isEqualTo("admin");
        assertThat(Role.SUPPORT.value()).isEqualTo("support");
        assertThat(Role.CUSTOMER.value()).isEqualTo("customer");
    }
}
