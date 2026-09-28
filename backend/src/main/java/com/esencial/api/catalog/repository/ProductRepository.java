package com.esencial.api.catalog.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.esencial.api.catalog.domain.Product;

public interface ProductRepository extends MongoRepository<Product, String> {

    /**
     * Ficha de producto por slug y solo si esta activo.
     * La ficha publica no debe revelar productos dados de baja.
     */
    Optional<Product> findBySlugAndIsActiveTrue(String slug);

    List<Product> findByIsActiveTrue();

    Optional<Product> findBySlugIgnoreCase(String slug);

    Optional<Product> findBySkuIgnoreCase(String sku);

    boolean existsBySlugIgnoreCase(String slug);

    boolean existsBySkuIgnoreCase(String sku);
}
