package com.esencial.api.catalog.dto;

import com.esencial.api.catalog.domain.Category;

public record CategoryResponse(
        String id,
        String slug,
        String name,
        String description,
        String imageUrl
) {
    public static CategoryResponse from(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getSlug(),
                category.getName(),
                category.getDescription(),
                category.getImageUrl());
    }
}
