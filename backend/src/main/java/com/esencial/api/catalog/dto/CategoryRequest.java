package com.esencial.api.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryRequest(

        @NotBlank(message = "El nombre de la categoría es obligatorio")
        @Size(max = 80, message = "El nombre no puede pasar de 80 caracteres")
        String name,

        /** Si no se envia, se deriva del nombre con {@code Slugs.toSlug}. */
        @Size(max = 80, message = "El slug no puede pasar de 80 caracteres")
        String slug,

        @Size(max = 400, message = "La descripción no puede pasar de 400 caracteres")
        String description,

        String imageUrl
) {
}
