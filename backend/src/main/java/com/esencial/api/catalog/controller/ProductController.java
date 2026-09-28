package com.esencial.api.catalog.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.esencial.api.catalog.dto.ProductRequest;
import com.esencial.api.catalog.dto.ProductResponse;
import com.esencial.api.catalog.dto.StockRequest;
import com.esencial.api.catalog.service.ProductService;
import com.esencial.api.common.ApiResponse;
import com.esencial.api.common.SuccessResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Productos", description = "Catálogo de productos e inventario")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    @Operation(summary = "Lista el catálogo con filtros por categoría y búsqueda")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {

        List<ProductResponse> data = productService.listPublic(category, search).stream()
                .map(ProductResponse::from)
                .toList();

        return ResponseEntity.ok(ApiResponse.ofList(data));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Ficha pública de un producto por slug")
    public ResponseEntity<ApiResponse<ProductResponse>> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.of(ProductResponse.from(productService.getActiveBySlug(slug))));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalle de un producto activo")
    public ResponseEntity<ApiResponse<ProductResponse>> get(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.of(ProductResponse.from(productService.getActiveById(id))));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crea un producto (admin)")
    public ResponseEntity<ApiResponse<ProductResponse>> create(@Valid @RequestBody ProductRequest request) {
        ProductResponse created = ProductResponse.from(productService.create(request));

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of(created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Edita un producto (admin)")
    public ResponseEntity<ApiResponse<ProductResponse>> update(
            @PathVariable String id,
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(ApiResponse.of(ProductResponse.from(productService.update(id, request))));
    }

    @PatchMapping("/{id}/stock")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Ajusta el stock de un producto (admin)")
    public ResponseEntity<ApiResponse<ProductResponse>> updateStock(
            @PathVariable String id,
            @Valid @RequestBody StockRequest request) {
        return ResponseEntity.ok(ApiResponse.of(
                ProductResponse.from(productService.updateStock(id, request.stock().longValue()))));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Elimina un producto (admin)")
    public ResponseEntity<SuccessResponse> delete(@PathVariable String id) {
        productService.delete(id);

        return ResponseEntity.ok(SuccessResponse.ok());
    }
}
