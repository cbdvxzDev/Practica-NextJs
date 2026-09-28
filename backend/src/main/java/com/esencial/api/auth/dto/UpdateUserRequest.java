package com.esencial.api.auth.dto;

import com.esencial.api.auth.domain.Role;

import jakarta.validation.constraints.Size;

/**
 * Edicion de una cuenta desde el panel. Todos los campos son opcionales: el
 * servicio solo toca los que llegan, para no borrar el resto con un PUT parcial.
 */
public record UpdateUserRequest(

        @Size(max = 80, message = "El nombre no puede pasar de 80 caracteres")
        String name,

        Role role,

        Boolean isActive
) {
}
