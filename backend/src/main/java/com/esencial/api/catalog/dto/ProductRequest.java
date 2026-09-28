package com.esencial.api.catalog.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record ProductRequest(

        @NotBlank(message = "El SKU es obligatorio")
        @Size(max = 40, message = "El SKU no puede pasar de 40 caracteres")
        String sku,

        @NotBlank(message = "El título es obligatorio")
        @Size(max = 140, message = "El título no puede pasar de 140 caracteres")
        String title,

        @Size(max = 2000, message = "La descripción no puede pasar de 2000 caracteres")
        String description,

        // Envoltorio y no primitivo: un long no admite null, asi que un cuerpo
        // que omitiera el precio fallaba al leer el JSON y el cliente recibia un
        // "cuerpo no valido" sin saber que faltaba. Con Long, la validacion
        // senala el campo concreto.
        @NotNull(message = "El precio es obligatorio")
        @PositiveOrZero(message = "El precio no puede ser negativo")
        Long price,

        /** Precio tachado. Si se envia, tiene que ser mayor que el precio actual. */
        @PositiveOrZero(message = "El precio comparativo no puede ser negativo")
        Long compareAtPrice,

        List<String> images,

        /** Slug de la categoria. Es lo que el formulario del panel ya tiene a mano. */
        @NotBlank(message = "La categoría es obligatoria")
        String category,

        List<String> sizes,

        @NotNull(message = "El stock es obligatorio")
        @PositiveOrZero(message = "El stock no puede ser negativo")
        Long stock,

        Boolean isActive
) {
}
