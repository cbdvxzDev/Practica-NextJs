package com.esencial.api.seed;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.esencial.api.auth.domain.Role;
import com.esencial.api.auth.domain.User;
import com.esencial.api.catalog.domain.Category;
import com.esencial.api.catalog.domain.CategoryRef;
import com.esencial.api.catalog.domain.Product;
import com.esencial.api.catalog.repository.CategoryRepository;
import com.esencial.api.catalog.repository.ProductRepository;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.json.JsonMapper;

/**
 * Importa el catalogo y las cuentas de la app de Next.js la primera vez que se
 * levanta la API contra una base vacia.
 *
 * <p>Lee los mismos JSON de {@code data/} que usa el frontend, de modo que las
 * dos partes del proyecto muestren el mismo catalogo y los ids coincidan al
 * cambiar el cliente de una API a la otra.
 *
 * <p>Solo siembra si la coleccion esta vacia. Si se hiciera siempre, cada
 * reinicio de la API pisaria los productos y las cuentas editados desde el
 * panel, que es justo lo que el panel existe para cambiar.
 *
 * <p>Va apagado salvo que se pida con {@code APP_SEED=1}, porque en los tests de
 * integracion las cuentasvigentes interfieren con las de cada prueba.
 */
@Component
public class CatalogSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(CatalogSeeder.class);

    /** Contrasena de las cuentas sembradas, para poder entrar al panel. */
    static final String SEED_PASSWORD = "esencial2026";

    private final MongoTemplate mongoTemplate;
    private final CategoryRepository categories;
    private final ProductRepository products;
    private final PasswordEncoder passwordEncoder;
    private final ResourceLoader resourceLoader;
    private final JsonMapper jsonMapper;
    private final String dataDir;
    private final boolean seedEnabled;

    public CatalogSeeder(
            MongoTemplate mongoTemplate,
            CategoryRepository categories,
            ProductRepository products,
            PasswordEncoder passwordEncoder,
            ResourceLoader resourceLoader,
            JsonMapper jsonMapper,
            @Value("${app.seed.data-dir:../data}") String dataDir,
            @Value("${app.seed.enabled:false}") boolean seedEnabled) {
        this.mongoTemplate = mongoTemplate;
        this.categories = categories;
        this.products = products;
        this.passwordEncoder = passwordEncoder;
        this.resourceLoader = resourceLoader;
        this.jsonMapper = jsonMapper;
        this.dataDir = dataDir;
        this.seedEnabled = seedEnabled;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!seedEnabled) {
            return;
        }

        int created = seedCategories() + seedProducts() + seedUsers();
        log.info("Sembrado inicial: {} registros nuevos. Contrasena de las cuentas: {}",
                created, SEED_PASSWORD);
    }

    private int seedCategories() {
        if (categories.count() > 0) {
            return 0;
        }

        List<CategoryRecord> records = read("categories.json", new TypeReference<List<CategoryRecord>>() {
        });
        records.forEach(record -> categories.save(toCategory(record)));

        return records.size();
    }

    private int seedProducts() {
        if (products.count() > 0) {
            return 0;
        }

        List<ProductRecord> records = read("products.json", new TypeReference<List<ProductRecord>>() {
        });
        records.forEach(record -> products.save(toProduct(record)));

        return records.size();
    }

    private int seedUsers() {
        if (mongoTemplate.getCollection("users").countDocuments() > 0) {
            return 0;
        }

        List<UserRecord> records = read("users.json", new TypeReference<List<UserRecord>>() {
        });
        for (UserRecord record : records) {
            User user = new User();
            user.setId(record.id());
            user.setName(record.name());
            user.setEmail(record.email().trim().toLowerCase());
            user.setRole(Role.from(record.role()));
            user.setActive(record.isActive());
            user.setAvatarUrl(record.avatarUrl());
            user.setPasswordHash(passwordEncoder.encode(SEED_PASSWORD));
            user.setCreatedAt(record.createdAt());
            mongoTemplate.save(user);
        }

        return records.size();
    }

    private Category toCategory(CategoryRecord record) {
        Category category = new Category();
        category.setId(record.id());
        category.setSlug(record.slug());
        category.setName(record.name());
        category.setDescription(record.description());
        category.setImageUrl(record.imageUrl());

        return category;
    }

    private Product toProduct(ProductRecord record) {
        Product product = new Product();
        product.setId(record.id());
        product.setSku(record.sku());
        product.setSlug(record.slug());
        product.setTitle(record.title());
        product.setDescription(record.description());
        product.setPrice(record.price());
        product.setCompareAtPrice(record.compareAtPrice());
        product.setImages(record.images());
        product.setCategory(new CategoryRef(
                record.category().id(),
                record.category().name(),
                record.category().slug()));
        product.setSizes(record.sizes());
        product.setStock(record.stock());
        product.setActive(record.isActive());
        product.setCreatedAt(record.createdAt());
        product.setUpdatedAt(record.updatedAt());

        return product;
    }

    private <T> T read(String fileName, TypeReference<T> type) {
        Path path = Path.of(dataDir, fileName);
        if (!Files.isReadable(path)) {
            log.warn("No se encontro «{}». La API arranca con la base vacia.", path.toAbsolutePath());
            return jsonMapper.convertValue(List.of(), type);
        }

        Resource resource = resourceLoader.getResource("file:" + path.toAbsolutePath());
        try (InputStream in = resource.getInputStream()) {
            return jsonMapper.readValue(in, type);
        } catch (IOException ex) {
            throw new IllegalStateException("No se pudo leer «" + path + "».", ex);
        }
    }

    /**
     * Formato de {@code data/categories.json}.
     */
    record CategoryRecord(
            String id,
            String slug,
            String name,
            String description,
            String imageUrl
    ) {
    }

    /**
     * Formato de {@code data/products.json}.
     */
    record ProductRecord(
            String id,
            String sku,
            String slug,
            String title,
            String description,
            long price,
            Long compareAtPrice,
            List<String> images,
            CategoryRefRecord category,
            List<String> sizes,
            long stock,
            boolean isActive,
            Instant createdAt,
            Instant updatedAt
    ) {
    }

    record CategoryRefRecord(String id, String name, String slug) {
    }

    /**
     * Formato de {@code data/users.json}. El hash de la app de Next.js es
     * scrypt y aqui se espera BCrypt, asi que se descarta.
     */
    record UserRecord(
            String id,
            String email,
            String name,
            String role,
            boolean isActive,
            String avatarUrl,
            String passwordHash,
            Instant createdAt
    ) {
    }
}
