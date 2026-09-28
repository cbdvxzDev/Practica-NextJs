package com.esencial.api.common;

import org.springframework.core.MethodParameter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import com.esencial.api.auth.domain.Role;

/**
 * Convierte el {@code Jwt} del token en un {@link JwtUser}.
 *
 * El claim {@code role} lo firma el propio backend, asi que se puede usar para
 * autorizar sin volver a leer el documento de usuario en MongoDB.
 */
public class CurrentUserArgumentResolver implements HandlerMethodArgumentResolver {

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(CurrentUser.class)
                && parameter.getParameterType().equals(JwtUser.class);
    }

    @Override
    public Object resolveArgument(
            MethodParameter parameter,
            ModelAndViewContainer mavContainer,
            NativeWebRequest webRequest,
            WebDataBinderFactory binderFactory) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication instanceof JwtAuthenticationToken token)) {
            // Las rutas que usan @CurrentUser ya exigen token, asi que llegar aqui
            // significa que el token no llego: 401 y no un null silencioso. Antes
            // se lanzaba IllegalStateException y el manejador generico lo
            // convertia en 500, que hacia pasar un fallo de sesion por un fallo
            // del servidor.
            throw new UnauthorizedException("Se esperaba un JWT en la peticion.");
        }

        return new JwtUser(
                token.getToken().getSubject(),
                token.getToken().getClaimAsString("name"),
                token.getToken().getClaimAsString("email"),
                toRole(token.getToken().getClaimAsString("role")));
    }

    private Role toRole(String claim) {
        if (claim == null) {
            return Role.CUSTOMER;
        }
        try {
            return Role.valueOf(claim.toUpperCase());
        } catch (IllegalArgumentException ex) {
            // Un rol desconocido no debe tumbar la peticion: se degrada al
            // menos privilegiado, que es lo unico que puede hacer sin riesgo.
            return Role.CUSTOMER;
        }
    }
}
