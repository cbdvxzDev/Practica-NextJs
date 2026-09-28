package com.esencial.api.order.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.esencial.api.common.ApiResponse;
import com.esencial.api.common.CurrentUser;
import com.esencial.api.common.JwtUser;
import com.esencial.api.order.dto.CreateOrderRequest;
import com.esencial.api.order.dto.OrderResponse;
import com.esencial.api.order.dto.UpdateOrderStatusRequest;
import com.esencial.api.order.service.OrderService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Pedidos", description = "Pedidos del cliente y gestión desde el panel")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    @Operation(summary = "Lista los pedidos (el cliente solo ve los suyos)")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> list(@CurrentUser JwtUser user) {
        List<OrderResponse> data = orderService.list(user).stream()
                .map(OrderResponse::from)
                .toList();

        return ResponseEntity.ok(ApiResponse.ofList(data));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalle de un pedido")
    public ResponseEntity<ApiResponse<OrderResponse>> get(@CurrentUser JwtUser user, @PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.of(OrderResponse.from(orderService.get(user, id))));
    }

    @PostMapping
    @Operation(summary = "Crea un pedido desde el carrito")
    public ResponseEntity<ApiResponse<OrderResponse>> create(
            @CurrentUser JwtUser user,
            @Valid @RequestBody CreateOrderRequest request) {

        OrderResponse created = OrderResponse.from(orderService.create(user, request));

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of(created));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cambia el estado de un pedido (admin)")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {

        return ResponseEntity.ok(
                ApiResponse.of(OrderResponse.from(orderService.updateStatus(id, request.status()))));
    }
}
