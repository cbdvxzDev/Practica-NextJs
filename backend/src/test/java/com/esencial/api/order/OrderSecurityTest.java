package com.esencial.api.order;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.ArrayList;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.esencial.api.auth.controller.AuthController;
import com.esencial.api.auth.controller.UserAdminController;
import com.esencial.api.auth.domain.Role;
import com.esencial.api.auth.domain.User;
import com.esencial.api.auth.dto.UserResponse;
import com.esencial.api.auth.service.AuthService;
import com.esencial.api.auth.service.UserService;
import com.esencial.api.common.GlobalExceptionHandler;
import com.esencial.api.common.JwtUser;
import com.esencial.api.config.SecurityConfig;
import com.esencial.api.config.WebMvcConfig;
import com.esencial.api.order.controller.OrderController;
import com.esencial.api.order.domain.Order;
import com.esencial.api.order.domain.OrderStatus;
import com.esencial.api.order.domain.PaymentStatus;
import com.esencial.api.order.service.OrderService;

/**
 * Comprueba el circuito de pedidos y usuarios: que el rol se resuelva desde el
 * token, que un cliente no pueda tocar lo que es de otro y que los errores de
 * entrada se traduzcan a 400 en vez de colgarse como 500.
 *
 * <p>No necesita MongoDB.
 */
@WebMvcTest(controllers = { OrderController.class, UserAdminController.class, AuthController.class })
@Import({ SecurityConfig.class, WebMvcConfig.class, GlobalExceptionHandler.class })
class OrderSecurityTest {

    private static final SimpleGrantedAuthority ADMIN = new SimpleGrantedAuthority("ROLE_ADMIN");
    private static final SimpleGrantedAuthority CUSTOMER = new SimpleGrantedAuthority("ROLE_CUSTOMER");
    private static final SimpleGrantedAuthority SUPPORT = new SimpleGrantedAuthority("ROLE_SUPPORT");

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private OrderService orderService;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private AuthService authService;

    @Test
    @DisplayName("sin token, la lista de pedidos devuelve 401 y no toca el servicio")
    void listaPedidosSinTokenDevuelve401() throws Exception {
        mvc.perform(get("/api/orders"))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(orderService);
    }

    @Test
    @DisplayName("el rol del claim se traslada al servicio, no al claim de Spring")
    void elRolSeLeeDelClaimRole() throws Exception {
        // authorities() solo deforma authorities(); el claim "role" es el que
        // lee el JwtAuthenticationConverter, asi que se fija a mano para no
        // probar un atajo que el cliente real no tiene.
        when(orderService.list(any(JwtUser.class))).thenReturn(java.util.List.of(sampleOrder()));

        mvc.perform(get("/api/orders")
                        .with(jwt()
                                .jwt(token -> token.subject("usr-9")
                                        .claim("email", "carlos@example.com")
                                        .claim("name", "Carlos")
                                        .claim("role", "customer"))
                                .authorities(CUSTOMER)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].id").value("ORD-2026-001"));

        org.mockito.ArgumentCaptor<JwtUser> captor = org.mockito.ArgumentCaptor.forClass(JwtUser.class);
        org.mockito.Mockito.verify(orderService).list(captor.capture());

        JwtUser passed = captor.getValue();
        org.assertj.core.api.Assertions.assertThat(passed.id()).isEqualTo("usr-9");
        org.assertj.core.api.Assertions.assertThat(passed.email()).isEqualTo("carlos@example.com");
        org.assertj.core.api.Assertions.assertThat(passed.role()).isEqualTo(Role.CUSTOMER);
        org.assertj.core.api.Assertions.assertThat(passed.isStaff()).isFalse();
    }

    @Test
    @DisplayName("un rol desconocido en el claim degrada a cliente, nunca a administrador")
    void rolDesconocidoDegradaACliente() throws Exception {
        when(orderService.list(any(JwtUser.class))).thenReturn(java.util.List.of());

        mvc.perform(get("/api/orders")
                        .with(jwt()
                                .jwt(token -> token.subject("usr-x").claim("role", "superusuario"))
                                .authorities(CUSTOMER)))
                .andExpect(status().isOk());

        org.mockito.ArgumentCaptor<JwtUser> captor = org.mockito.ArgumentCaptor.forClass(JwtUser.class);
        org.mockito.Mockito.verify(orderService).list(captor.capture());
        org.assertj.core.api.Assertions.assertThat(captor.getValue().role()).isEqualTo(Role.CUSTOMER);
    }

    @Test
    @DisplayName("cambiar el estado de un pedido es solo de administrador")
    void cambiarEstadoExigeAdmin() throws Exception {
        String body = "{ \"status\": \"shipped\" }";

        mvc.perform(patch("/api/orders/ORD-2026-001/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .with(jwt().authorities(CUSTOMER)))
                .andExpect(status().isForbidden());

        mvc.perform(patch("/api/orders/ORD-2026-001/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .with(jwt().authorities(SUPPORT)))
                .andExpect(status().isForbidden());

        verifyNoInteractions(orderService);
    }

    @Test
    @DisplayName("un estado vacio devuelve 400 con el detalle del campo")
    void estadoVacioDevuelve400() throws Exception {
        mvc.perform(patch("/api/orders/ORD-2026-001/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"status\": \"\" }")
                        .with(jwt().authorities(ADMIN)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.status").exists());

        verifyNoInteractions(orderService);
    }

    @Test
    @DisplayName("un estado de pedido que no existe vuelve como 400 desde el servicio")
    void estadoDesconocidoDevuelve400() throws Exception {
        // El servicio es quien conoce los estados validos, asi que el 400 lo
        // produce OrderStatus.from(). Lo que se comprueba aqui es que ese error
        // de negocio viaje como 400 y no se esconda detras del 500 generico.
        when(orderService.updateStatus(eq("ORD-2026-001"), eq("inventado")))
                .thenThrow(new IllegalArgumentException("Estado de pedido desconocido: «inventado»."));

        mvc.perform(patch("/api/orders/ORD-2026-001/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"status\": \"inventado\" }")
                        .with(jwt().authorities(ADMIN)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Estado de pedido desconocido: «inventado»."));
    }

    @Test
    @DisplayName("gestionar usuarios es solo de administrador")
    void gestionDeUsuariosExigeAdmin() throws Exception {
        when(userService.listAll()).thenReturn(java.util.List.of());

        mvc.perform(get("/api/users").with(jwt().authorities(CUSTOMER)))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/users").with(jwt().authorities(SUPPORT)))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/users")).andExpect(status().isUnauthorized());

        mvc.perform(get("/api/users").with(jwt().authorities(ADMIN)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("un rol desconocido en el cuerpo de un usuario devuelve 400 y no 500")
    void rolDesconocidoEnCuerpoDevuelve400() throws Exception {
        // Un enum que Jackson no sabe leer debe ser un error del cliente. Sin el
        // manejador de HttpMessageNotReadableException caia en el generico y
        // devolvia 500, haciendo pasar un fallo de escritura por una caida.
        mvc.perform(patch("/api/users/usr-3")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"role\": \"superusuario\" }")
                        .with(jwt().authorities(ADMIN)))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(userService);
    }

    @Test
    @DisplayName("un entero donde va un booleano se rechaza en vez de convertirse en true")
    void enteroEnCampoBooleanoSeRechaza() throws Exception {
        // Con la coercion activada, {"isActive": 42} desactivaba cualquier
        // cuenta. El tipo equivocado tiene que ser un 400, no un true.
        mvc.perform(patch("/api/users/usr-3")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"isActive\": 42 }")
                        .with(jwt().authorities(ADMIN)))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(userService);
    }

    @Test
    @DisplayName("el perfil propio se abre con cualquier rol")
    void perfilPropioPermitidoATodos() throws Exception {
        when(userService.profile(any(String.class))).thenReturn(sampleUserEntity());

        mvc.perform(get("/api/auth/me")
                        .with(jwt().jwt(token -> token.subject("usr-3").claim("role", "customer"))
                                .authorities(CUSTOMER)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.email").value("carlos@example.com"));
    }

    @Test
    @DisplayName("el servicio recibe el id del token, no uno del cuerpo")
    void elPerfilUsaElIdDelToken() throws Exception {
        when(userService.profile(any(String.class))).thenReturn(sampleUserEntity());

        mvc.perform(get("/api/auth/me")
                        .with(jwt().jwt(token -> token.subject("usr-3")).authorities(CUSTOMER)))
                .andExpect(status().isOk());

        org.mockito.Mockito.verify(userService).profile(eq("usr-3"));
    }

    private UserResponse sampleUser() {
        return UserResponse.from(sampleUserEntity());
    }

    private User sampleUserEntity() {
        User user = new User();
        user.setId("usr-3");
        user.setName("Carlos Ruiz");
        user.setEmail("carlos@example.com");
        user.setRole(Role.CUSTOMER);
        user.setActive(true);
        user.setCreatedAt(Instant.parse("2026-01-05T12:00:00Z"));
        return user;
    }

    private Order sampleOrder() {
        Order order = new Order();
        order.setId("ORD-2026-001");
        order.setUserId("usr-9");
        order.setCustomer("Carlos Ruiz");
        order.setEmail("carlos@example.com");
        order.setDate("05/01/2026");
        order.setSubtotal(189000L);
        order.setShipping(0L);
        order.setTotal(189000L);
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setItems(new ArrayList<>());
        order.setShippingAddress("Calle 100 #10-20, Bogota");
        order.setCreatedAt(Instant.parse("2026-01-05T12:00:00Z"));
        return order;
    }
}
