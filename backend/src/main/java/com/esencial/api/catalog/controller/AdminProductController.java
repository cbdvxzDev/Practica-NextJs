package com.esencial.api.catalog.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.esencial.api.catalog.dto.ProductResponse;
import com.esencial.api.catalog.service.ProductService;
import com.esencial.api.common.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Vista de gestion del catalogo para el panel.
 *
 * <p>No cuelga de {@link ProductController} a proposito. Las reglas de
 * seguridad hacen publico {@code GET /api/products/*}, y cualquier ruta de
 * gestion colocada ahi queda captada por ese comodin: el panel llegaria al
 * endpoint, pero como peticion anonima, y responderia 403 en lugar del 401 que
 * corresponde a "falta el token". Separarla en {@code /api/admin} deja cada
 * familia de rutas con una regla propia y sin solapamientos.
 */
@RestController
@RequestMapping("/api/admin/products")
@Tag(name = "Panel · Productos", description = "Gestion del catalogo con productos dados de baja")
public class AdminProductController {

    private final ProductService productService;

    public AdminProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    @Operation(summary = "Lista todos los productos, incluidos los dados de baja (admin)")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> list() {
        List<ProductResponse> data = productService.listAll().stream()
                .map(ProductResponse::from)
                .toList();

        return ResponseEntity.ok(ApiResponse.ofList(data));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalle de cualquier producto, activo o no (admin)")
    public ResponseEntity<ApiResponse<ProductResponse>> get(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.of(ProductResponse.from(productService.get(id))));
    }
}
