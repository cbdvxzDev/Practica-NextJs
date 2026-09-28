package com.esencial.api.auth.service;

import java.util.Locale;

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
