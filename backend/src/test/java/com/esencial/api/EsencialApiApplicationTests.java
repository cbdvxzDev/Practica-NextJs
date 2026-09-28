package com.esencial.api;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.web.SecurityFilterChain;

import com.esencial.api.auth.repository.UserRepository;
import com.esencial.api.catalog.repository.ProductRepository;
import com.esencial.api.order.repository.OrderRepository;

/**
 * Comprueba que el contexto de Spring arranca entero: configuracion de
 * seguridad, repositorios de Mongo y servicios de catalogo y pedidos.
 *
 * <p>Requiere Docker: sin el, {@link IntegrationTest} lo salta.
 */
@IntegrationTest
class EsencialApiApplicationTests {

    @Autowired
    private SecurityFilterChain securityFilterChain;

    @Autowired
    private UserRepository users;

    @Autowired
    private ProductRepository products;

    @Autowired
    private OrderRepository orders;

    @Test
    void contextLoads() {
        assertThat(securityFilterChain).isNotNull();
        assertThat(users).isNotNull();
        assertThat(products).isNotNull();
        assertThat(orders).isNotNull();
    }

    @Test
    void mongoAceptaEscriturasYLecturas() {
        // Comprobar que las colecciones responden de verdad, no solo que los
        // repositorios existen: un bean puede construirse y fallar al usarse.
        assertThat(products.count()).isZero();
        assertThat(orders.count()).isZero();
    }
}
