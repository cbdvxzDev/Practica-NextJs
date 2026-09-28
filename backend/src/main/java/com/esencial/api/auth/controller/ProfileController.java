package com.esencial.api.auth.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.esencial.api.auth.dto.UpdateProfileRequest;
import com.esencial.api.auth.dto.UserResponse;
import com.esencial.api.auth.service.UserService;
import com.esencial.api.common.CurrentUser;
import com.esencial.api.common.JwtUser;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/user/profile")
@Tag(name = "Perfil", description = "Datos de la cuenta del cliente")
public class ProfileController {

    private final UserService userService;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @Operation(summary = "Perfil del usuario autenticado")
    public ResponseEntity<Map<String, UserResponse>> get(@CurrentUser JwtUser current) {
        return ResponseEntity.ok(Map.of("user", UserResponse.from(userService.profile(current.id()))));
    }

    @PutMapping
    @Operation(summary = "Actualiza nombre, correo y avatar")
    public ResponseEntity<Map<String, UserResponse>> update(
            @CurrentUser JwtUser current,
            @Valid @RequestBody UpdateProfileRequest request) {

        return ResponseEntity.ok(Map.of("user", UserResponse.from(userService.updateProfile(current, request))));
    }
}
