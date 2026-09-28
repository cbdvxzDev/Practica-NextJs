package com.esencial.api.auth.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.esencial.api.auth.dto.UpdateUserRequest;
import com.esencial.api.auth.dto.UserDetailResponse;
import com.esencial.api.auth.dto.UserResponse;
import com.esencial.api.auth.service.UserService;
import com.esencial.api.common.ApiResponse;
import com.esencial.api.common.CurrentUser;
import com.esencial.api.common.JwtUser;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Usuarios", description = "Gestión de cuentas desde el panel")
public class UserAdminController {

    private final UserService userService;

    public UserAdminController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lista las cuentas (admin)")
    public ResponseEntity<ApiResponse<List<UserResponse>>> list() {
        List<UserResponse> data = userService.listAll().stream()
                .map(UserResponse::from)
                .toList();

        return ResponseEntity.ok(ApiResponse.ofList(data));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Detalle de una cuenta con su historial de pedidos (admin)")
    public ResponseEntity<ApiResponse<UserDetailResponse>> get(@PathVariable String id) {
        UserDetailResponse detail = UserDetailResponse.from(userService.get(id), userService.ordersOf(id));

        return ResponseEntity.ok(ApiResponse.of(detail));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cambia nombre, rol o estado de una cuenta (admin)")
    public ResponseEntity<ApiResponse<UserResponse>> update(
            @CurrentUser JwtUser actor,
            @PathVariable String id,
            @Valid @RequestBody UpdateUserRequest request) {

        return ResponseEntity.ok(ApiResponse.of(UserResponse.from(userService.updateByAdmin(actor, id, request))));
    }
}
