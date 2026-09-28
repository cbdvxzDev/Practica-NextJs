package com.esencial.api.auth.service;

import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;

import com.esencial.api.auth.domain.Role;
import com.esencial.api.auth.domain.User;
import com.esencial.api.auth.dto.UpdateProfileRequest;
import com.esencial.api.auth.dto.UpdateUserRequest;
import com.esencial.api.auth.repository.UserRepository;
import com.esencial.api.common.ConflictException;
import com.esencial.api.common.JwtUser;
import com.esencial.api.common.NotFoundException;
import com.esencial.api.common.Values;
import com.esencial.api.order.domain.Order;
import com.esencial.api.order.repository.OrderRepository;

@Service
public class UserService {

    private final UserRepository users;
    private final OrderRepository orders;

    public UserService(UserRepository users, OrderRepository orders) {
        this.users = users;
        this.orders = orders;
    }

    /**
     * Perfil del cliente.
     *
     * <p>Se relee el documento en vez de confiar en los claims del token: si
     * una cuenta se desactiva, su token sigue siendo criptograficamente
     * valido hasta que caduca, y el perfil no deberia seguir respondiendo.
     */
    public User profile(String userId) {
        return users.findById(userId)
                .filter(User::isActive)
                .orElseThrow(() -> new NotFoundException("Sesión inválida o cuenta desactivada."));
    }

    public User updateProfile(JwtUser current, UpdateProfileRequest request) {
        User user = profile(current.id());

        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (!email.equals(user.getEmail())) {
            // El correo es la clave de acceso: no puede repetir el de otra cuenta.
            boolean taken = users.findByEmailIgnoreCase(email)
                    .map(other -> !other.getId().equals(user.getId()))
                    .orElse(false);
            if (taken) {
                throw new ConflictException("Ese correo ya está registrado en otra cuenta.");
            }
        }

        user.setName(request.name().trim());
        user.setEmail(email);
        user.setAvatarUrl(Values.trimToNull(request.avatarUrl()));

        // `role` e `isActive` no se tocan aqui: un cliente no se convierte en
        // admin a si mismo aunque la peticion los incluya.
        return users.save(user);
    }

    /** Listado del panel, del alta mas reciente a la mas antigua. */
    public List<User> listAll() {
        return users.findAll().stream()
                .sorted((a, b) -> Values.compareNullable(b.getCreatedAt(), a.getCreatedAt()))
                .toList();
    }

    public User get(String id) {
        return users.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado."));
    }

    public List<Order> ordersOf(String userId) {
        return orders.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public User updateByAdmin(JwtUser actor, String id, UpdateUserRequest request) {
        User user = get(id);

        boolean demotesSelf = id.equals(actor.id()) && request.role() != null && request.role() != Role.ADMIN;
        boolean deactivatesSelf = id.equals(actor.id())
                && request.isActive() != null && !request.isActive();

        if (demotesSelf || deactivatesSelf) {
            // Sin esta guarda, un admin puede degradarse o desactivarse a si
            // mismo y dejar el panel sin ningun administrador que pueda deshacerlo.
            throw new ConflictException("No puedes quitarte a ti mismo el acceso de administrador.");
        }

        if (request.name() != null && !request.name().isBlank()) {
            user.setName(request.name().trim());
        }
        if (request.role() != null) {
            user.setRole(request.role());
        }
        if (request.isActive() != null) {
            user.setActive(request.isActive());
        }

        return users.save(user);
    }
}
