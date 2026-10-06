package com.esencial.api.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.esencial.api.auth.domain.Role;
import com.esencial.api.auth.domain.User;
import com.esencial.api.auth.repository.UserRepository;

/**
 * Prueba la logica real de recuperacion de contraseña sin MongoDB: que el token
 * nunca se guarde en claro, que caduque en 15 minutos, que el enlace malo o
 * vencido devuelva el mismo error y que un token no sirva dos veces.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    private static final String FRONT = "http://localhost:3000";

    @Mock
    private UserRepository users;

    @Mock
    private JwtService jwtService;

    private PasswordEncoder passwordEncoder;
    private AuthService service;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder(4);
        service = new AuthService(users, passwordEncoder, jwtService);
    }

    @Test
    @DisplayName("el token de recuperacion se guarda hasheado, con caducidad de 15 minutos")
    void tokenSeGuardaHasheadoConCaducidad() throws Exception {
        User user = activeUser();
        when(users.findByEmailIgnoreCase("carlos@example.com")).thenReturn(Optional.of(user));

        Map<String, String> body = service.forgotPassword("carlos@example.com", FRONT);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(users).save(captor.capture());
        User saved = captor.getValue();

        // El hash tiene que ser SHA-256 del token que viaja en la URL, y nunca
        // el token en claro: si la base se filtrara, los enlaces no servirian.
        String url = body.get("resetUrl");
        assertThat(url).startsWith(FRONT + "/reset-password?token=");
        String token = url.substring(url.indexOf("token=") + "token=".length());
        assertThat(saved.getPasswordResetToken()).isNotEqualTo(token);
        assertThat(saved.getPasswordResetToken()).isEqualTo(sha256(token));

        assertThat(saved.getPasswordResetExpiresAt()).isAfter(Instant.now().plusSeconds(14 * 60));
        assertThat(saved.getPasswordResetExpiresAt()).isBefore(Instant.now().plusSeconds(16 * 60));
    }

    @Test
    @DisplayName("la respuesta es identica exista o no la cuenta: no se filtra correos")
    void cuentaInexistenteNoRevelaNada() {
        when(users.findByEmailIgnoreCase("nadie@example.com")).thenReturn(Optional.empty());

        Map<String, String> body = service.forgotPassword("nadie@example.com", FRONT);

        assertThat(body.get("message")).isEqualTo(AuthService.GENERIC_RESET_MESSAGE);
        assertThat(body).doesNotContainKey("resetUrl");
        verify(users, never()).save(any());
    }

    @Test
    @DisplayName("una cuenta desactivada no puede recibir enlace")
    void cuentaDesactivadaNoRecibeEnlace() {
        User user = activeUser();
        user.setActive(false);
        when(users.findByEmailIgnoreCase("carlos@example.com")).thenReturn(Optional.of(user));

        Map<String, String> body = service.forgotPassword("carlos@example.com", FRONT);

        assertThat(body).doesNotContainKey("resetUrl");
        verify(users, never()).save(any());
    }

    @Test
    @DisplayName("reset valido: cambia la contraseña con BCrypt y consume el token")
    void resetValidoCambiaLaContrasena() throws Exception {
        String token = "token-de-demostracion";
        User user = activeUser();
        user.setPasswordResetToken(sha256(token));
        user.setPasswordResetExpiresAt(Instant.now().plusSeconds(600));
        when(users.findByPasswordResetToken(sha256(token))).thenReturn(Optional.of(user));

        service.resetPassword(token, "clave-nueva-123");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(users).save(captor.capture());
        User saved = captor.getValue();

        assertThat(passwordEncoder.matches("clave-nueva-123", saved.getPasswordHash())).isTrue();
        assertThat(saved.getPasswordResetToken()).isNull();
        assertThat(saved.getPasswordResetExpiresAt()).isNull();
    }

    @Test
    @DisplayName("un token inventado da el mismo 400, sin decir si existio")
    void tokenInventadoDa400() {
        when(users.findByPasswordResetToken(any(String.class))).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.resetPassword("inventado", "clave-nueva-123"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage(AuthService.INVALID_LINK_MESSAGE);
    }

    @Test
    @DisplayName("un token caducado da 400 y se limpia para que no se reutilice")
    void tokenCaducadoDa400YSeLimpia() throws Exception {
        String token = "token-vencido";
        User user = activeUser();
        user.setPasswordResetToken(sha256(token));
        user.setPasswordResetExpiresAt(Instant.now().minusSeconds(60));
        when(users.findByPasswordResetToken(sha256(token))).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> service.resetPassword(token, "clave-nueva-123"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage(AuthService.INVALID_LINK_MESSAGE);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(users).save(captor.capture());
        assertThat(captor.getValue().getPasswordResetToken()).isNull();
    }

    private User activeUser() {
        User user = new User();
        user.setId("usr-3");
        user.setEmail("carlos@example.com");
        user.setName("Carlos Ruiz");
        user.setRole(Role.CUSTOMER);
        user.setActive(true);
        user.setPasswordHash(passwordEncoder.encode("clave-anterior-123"));
        return user;
    }

    private static String sha256(String value) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
    }
}
