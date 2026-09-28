package com.esencial.api.catalog.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.esencial.api.catalog.dto.CategoryRequest;
import com.esencial.api.catalog.dto.CategoryResponse;
import com.esencial.api.catalog.service.CategoryService;
import com.esencial.api.common.ApiResponse;
import com.esencial.api.common.SuccessResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/categories")
@Tag(name = "Categorías", description = "Categorías del catálogo")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    @Operation(summary = "Lista las categorías del catálogo")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> list() {
        List<CategoryResponse> data = categoryService.list().stream()
                .map(CategoryResponse::from)
                .toList();

        return ResponseEntity.ok(ApiResponse.ofList(data));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalle de una categoría")
    public ResponseEntity<ApiResponse<CategoryResponse>> get(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.of(CategoryResponse.from(categoryService.get(id))));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crea una categoría (admin)")
    public ResponseEntity<ApiResponse<CategoryResponse>> create(@Valid @RequestBody CategoryRequest request) {
        CategoryResponse created = CategoryResponse.from(categoryService.create(request));

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of(created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Edita una categoría (admin)")
    public ResponseEntity<ApiResponse<CategoryResponse>> update(
            @PathVariable String id,
            @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.of(CategoryResponse.from(categoryService.update(id, request))));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Elimina una categoría (admin)")
    public ResponseEntity<SuccessResponse> delete(@PathVariable String id) {
        categoryService.delete(id);

        return ResponseEntity.ok(SuccessResponse.ok());
    }
}
