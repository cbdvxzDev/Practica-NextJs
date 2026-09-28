package com.esencial.api.catalog.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.esencial.api.catalog.domain.Category;

public interface CategoryRepository extends MongoRepository<Category, String> {

    Optional<Category> findBySlugIgnoreCase(String slug);

    boolean existsBySlugIgnoreCase(String slug);
}
