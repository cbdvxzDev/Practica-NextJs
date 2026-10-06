package com.esencial.api.auth.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.esencial.api.auth.domain.User;

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    /** Busca por el hash del token de recuperación, nunca por el token en claro. */
    Optional<User> findByPasswordResetToken(String passwordResetToken);
}
