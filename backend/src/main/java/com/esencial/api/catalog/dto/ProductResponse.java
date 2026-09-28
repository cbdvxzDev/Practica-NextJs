package com.esencial.api.catalog.dto;

import java.time.Instant;
import java.util.List;

import com.esencial.api.catalog.domain.CategoryRef;
import com.esencial.api.catalog.domain.Product;

public record ProductResponse(
        String id,
        String sku,
        String slug,
        String title,
        String description,
        long price,
        Long compareAtPrice,
        List<String> images,
        CategoryRef category,
        List<String> sizes,
        long stock,
        boolean isActive,
        Instant createdAt,
        Instant updatedAt
) {
    public static ProductResponse from(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getSku(),
                product.getSlug(),
                product.getTitle(),
                product.getDescription(),
                product.getPrice(),
                product.getCompareAtPrice(),
                product.getImages(),
                product.getCategory(),
                product.getSizes(),
                product.getStock(),
                product.isActive(),
                product.getCreatedAt(),
                product.getUpdatedAt());
    }
}
