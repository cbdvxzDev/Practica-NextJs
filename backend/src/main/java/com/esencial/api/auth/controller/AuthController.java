package com.esencial.api.auth.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.esencial.api.auth.dto.AuthResponse;
import com.esencial.api.auth.dto.LoginRequest;
import com.esencial.api.auth.dto.RegisterRequest;
import com.esencial.api.auth.dto.UserResponse;
import com.esencial.api.auth.service.AuthService;
import com.esencial.api.auth.service.UserService;
import com.esencial.api.common.CurrentUser;
import com.esencial.api.common.JwtUser;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth", description = "Registro e inicio de sesión")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping("/login")
    @Operation(summary = "Inicia sesión y devuelve un JWT")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    @Operation(summary = "Crea una cuenta de cliente y devuelve un JWT")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @GetMapping("/me")
    @Operation(summary = "Usuario del token actual")
    public ResponseEntity<Map<String, UserResponse>> me(@CurrentUser JwtUser current) {
        // Revalida contra MongoDB: si la cuenta se desactivo despues de emitir
        // el token, /me debe dejar de devolver una sesion aparentemente valida.
        return ResponseEntity.ok(Map.of("user", UserResponse.from(userService.profile(current.id()))));
    }
}
