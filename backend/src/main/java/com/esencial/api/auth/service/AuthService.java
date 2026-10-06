package com.esencial.api.auth.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.esencial.api.auth.domain.Role;
import com.esencial.api.auth.domain.User;
import com.esencial.api.auth.dto.AuthResponse;
import com.esencial.api.auth.dto.LoginRequest;
import com.esencial.api.auth.dto.RegisterRequest;
import com.esencial.api.auth.dto.UserResponse;
import com.esencial.api.auth.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse login(LoginRequest request) {
        User user = users.findByEmailIgnoreCase(normalize(request.email()))
                .orElseThrow(() -> new BadCredentialsException("Credenciales incorrectas."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Credenciales incorrectas.");
        }
        if (!user.isActive()) {
            throw new DisabledException("La cuenta está desactivada.");
        }

        return toResponse(user);
    }

    public AuthResponse register(RegisterRequest request) {
        String email = normalize(request.email());
        if (users.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Ya existe una cuenta con ese correo.");
        }

        User user = new User();
        user.setEmail(email);
        user.setName(request.name().trim());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.CUSTOMER);
        user.setActive(true);

        return toResponse(users.save(user));
    }

    /** Respuesta identica exista o no la cuenta: no se filtra que correos estan registrados. */
    public static final String GENERIC_RESET_MESSAGE =
            "Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.";

    public static final String INVALID_LINK_MESSAGE =
            "El enlace de recuperación no es válido o ha caducado. Solicita uno nuevo.";

    /** Cuanto vale el enlace de recuperacion desde su emision. */
    private static final Duration RESET_TTL = Duration.ofMinutes(15);

    /**
     * Pide un enlace para restablecer la contraseña.
     *
     * <p>El token viaja en claro solo en la respuesta de demostracion (esta API
     * no tiene SMTP): en la base se guarda su hash SHA-256 con caducidad, igual
     * que hace la mini API de Next, de modo que un volcado de MongoDB no
     * permite cambiar contraseñas.
     *
     * @param frontBaseUrl origen de la tienda para armar el enlace de demo.
     */
    public Map<String, String> forgotPassword(String email, String frontBaseUrl) {
        Optional<User> found = users.findByEmailIgnoreCase(normalize(email));
        if (found.isEmpty() || !found.get().isActive()) {
            return Map.of("message", GENERIC_RESET_MESSAGE);
        }

        User user = found.get();
        byte[] raw = new byte[32];
        new SecureRandom().nextBytes(raw);
        String token = HexFormat.of().formatHex(raw);

        user.setPasswordResetToken(sha256(token));
        user.setPasswordResetExpiresAt(Instant.now().plus(RESET_TTL));
        users.save(user);

        // Demo sin SMTP: si hay cuenta, se devuelve el enlace para poder
        // completar el flujo. El mensaje de respuesta es el mismo en los dos
        // caminos, asi que el formulario no distingue correos registrados.
        Map<String, String> body = new LinkedHashMap<>();
        body.put("message", GENERIC_RESET_MESSAGE);
        body.put("resetUrl", frontBaseUrl + "/reset-password?token=" + token);
        return body;
    }

    /**
     * Cambia la contraseña con el token del enlace. Un token desconocido,
     * caducado o ya consumido produce el mismo 400, y ademas se limpia el
     * hash caducado para que no se pueda reutilizar.
     */
    public void resetPassword(String token, String password) {
        User user = users.findByPasswordResetToken(sha256(token.trim()))
                .orElseThrow(() -> new IllegalArgumentException(INVALID_LINK_MESSAGE));

        Instant expiresAt = user.getPasswordResetExpiresAt();
        if (expiresAt == null || expiresAt.isBefore(Instant.now())) {
            user.setPasswordResetToken(null);
            user.setPasswordResetExpiresAt(null);
            users.save(user);
            throw new IllegalArgumentException(INVALID_LINK_MESSAGE);
        }

        user.setPasswordHash(passwordEncoder.encode(password));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiresAt(null);
        users.save(user);
    }

    private static String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            // SHA-256 es obligatorio en toda JVM; si no esta, el problema es otro.
            throw new IllegalStateException("No se pudo calcular el hash del token.", ex);
        }
    }

    private AuthResponse toResponse(User user) {
        return new AuthResponse(
                jwtService.issue(user),
                "Bearer",
                jwtService.ttlSeconds(),
                UserResponse.from(user));
    }

    private String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
