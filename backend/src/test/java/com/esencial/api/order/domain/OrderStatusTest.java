package com.esencial.api.order.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class OrderStatusTest {

    @Test
    @DisplayName("acepta los valores en minusculas que manda el frontend")
    void aceptaMinusculas() {
        assertThat(OrderStatus.from("pending")).isEqualTo(OrderStatus.PENDING);
        assertThat(OrderStatus.from("SHIPPED")).isEqualTo(OrderStatus.SHIPPED);
        assertThat(OrderStatus.from("  Delivered  ")).isEqualTo(OrderStatus.DELIVERED);
    }

    @Test
    @DisplayName("rechaza un estado que no existe")
    void rechazaDesconocido() {
        assertThatThrownBy(() -> OrderStatus.from("recibido"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("inválido");
    }

    @Test
    @DisplayName("rechaza un estado vacio")
    void rechazaVacio() {
        assertThatThrownBy(() -> OrderStatus.from(null))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> OrderStatus.from("  "))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("sigue el ciclo normal: pending -> processing -> shipped -> delivered")
    void cicloNormal() {
        assertThat(OrderStatus.PENDING.canTransitionTo(OrderStatus.PROCESSING)).isTrue();
        assertThat(OrderStatus.PROCESSING.canTransitionTo(OrderStatus.SHIPPED)).isTrue();
        assertThat(OrderStatus.SHIPPED.canTransitionTo(OrderStatus.DELIVERED)).isTrue();
    }

    @Test
    @DisplayName("no permite saltarse la preparacion ni retroceder desde entregado")
    void noPermiteSaltosNiRetrocesos() {
        assertThat(OrderStatus.PENDING.canTransitionTo(OrderStatus.SHIPPED)).isFalse();
        assertThat(OrderStatus.DELIVERED.canTransitionTo(OrderStatus.SHIPPED)).isFalse();
        assertThat(OrderStatus.SHIPPED.canTransitionTo(OrderStatus.PENDING)).isFalse();
    }

    @Test
    @DisplayName("cancela desde pendiente o en preparacion, pero no despues de enviado")
    void reglasDeCancelacion() {
        assertThat(OrderStatus.PENDING.canTransitionTo(OrderStatus.CANCELLED)).isTrue();
        assertThat(OrderStatus.PROCESSING.canTransitionTo(OrderStatus.CANCELLED)).isTrue();
        assertThat(OrderStatus.SHIPPED.canTransitionTo(OrderStatus.CANCELLED)).isFalse();
        assertThat(OrderStatus.DELIVERED.allowedNext()).isEmpty();
    }

    @Test
    @DisplayName("los destinos de cada estado son datos reales, no nulos")
    void destinosResueltos() {
        // El constructor de cada constante no puede listar las siguientes: en el
        // momento de construirse todavia no existen. Este test es el que
        // comprueba que la tabla de transiciones se resolvio de verdad.
        assertThat(OrderStatus.PENDING.allowedNext())
                .containsExactly(OrderStatus.PROCESSING, OrderStatus.CANCELLED);
        assertThat(OrderStatus.PROCESSING.allowedNext())
                .containsExactly(OrderStatus.SHIPPED, OrderStatus.CANCELLED);
        assertThat(OrderStatus.SHIPPED.allowedNext()).containsExactly(OrderStatus.DELIVERED);
        assertThat(OrderStatus.CANCELLED.allowedNext()).isEmpty();
    }

    @Test
    @DisplayName("expone el valor en minusculas que consume el frontend")
    void valorSerializado() {
        assertThat(OrderStatus.PENDING.value()).isEqualTo("pending");
        assertThat(OrderStatus.PROCESSING.value()).isEqualTo("processing");
        assertThat(OrderStatus.SHIPPED.value()).isEqualTo("shipped");
        assertThat(OrderStatus.DELIVERED.value()).isEqualTo("delivered");
        assertThat(OrderStatus.CANCELLED.value()).isEqualTo("cancelled");
    }
}
