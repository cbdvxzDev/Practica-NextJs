package com.esencial.api.common;

import com.esencial.api.auth.domain.Role;

/**
 * El usuario autenticado tal y como lo ven los servicios.
 *
 * Se extrae del JWT una sola vez, en el borde web, para que los servicios no
 * dependan de {@code Jwt} ni de nada de Spring Security.
 */
public record JwtUser(String id, String name, String email, Role role) {

    public boolean isStaff() {
        return role == Role.ADMIN || role == Role.SUPPORT;
    }
}
