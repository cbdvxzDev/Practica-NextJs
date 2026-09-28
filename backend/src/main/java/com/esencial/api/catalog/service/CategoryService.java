package com.esencial.api.catalog.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.esencial.api.catalog.domain.Category;
import com.esencial.api.catalog.dto.CategoryRequest;
import com.esencial.api.catalog.repository.CategoryRepository;
import com.esencial.api.common.ConflictException;
import com.esencial.api.common.NotFoundException;
import com.esencial.api.common.Slugs;
import com.esencial.api.common.Values;

@Service
public class CategoryService {

    private final CategoryRepository categories;

    public CategoryService(CategoryRepository categories) {
        this.categories = categories;
    }

    public List<Category> list() {
        return categories.findAll();
    }

    public Category get(String id) {
        return categories.findById(id)
                .orElseThrow(() -> new NotFoundException("Categoría no encontrada."));
    }

    public Category create(CategoryRequest request) {
        Category category = new Category();
        apply(category, request);
        assertSlugAvailable(category);

        return categories.save(category);
    }

    /**
     * Aplica una edicion parcial: cada campo ausente conserva su valor actual.
     * El slug solo se regenera si el cliente no lo manda y el nombre cambio, para
     * que corregir una descripcion no rompa los enlaces ya publicados.
     */
    public Category update(String id, CategoryRequest request) {
        Category category = get(id);

        boolean nameChanged = request.name() != null && !request.name().isBlank()
                && !request.name().trim().equalsIgnoreCase(category.getName());
        boolean slugMissing = request.slug() == null || request.slug().isBlank();

        apply(category, request);

        if (slugMissing && nameChanged) {
            category.setSlug(Slugs.toSlug(category.getName()));
        }
        assertSlugAvailable(category);

        return categories.save(category);
    }

    public void delete(String id) {
        if (!categories.existsById(id)) {
            throw new NotFoundException("Categoría no encontrada.");
        }
        categories.deleteById(id);
    }

    /** Resuelve la categoria por slug, que es como la referencia el frontend. */
    public Category requireBySlug(String slug) {
        return categories.findBySlugIgnoreCase(slug)
                .orElseThrow(() -> new NotFoundException("La categoría «" + slug + "» no existe."));
    }

    private void assertSlugAvailable(Category category) {
        // El indice unico de slug revienta con una DuplicateKeyException sin
        // contexto; esta comprobacion la convierte en un 409 legible. Se ignora
        // el documento con el mismo id, para que editar sin tocar el slug no
        // choque consigo mismo.
        categories.findBySlugIgnoreCase(category.getSlug())
                .filter(found -> !found.getId().equals(category.getId()))
                .ifPresent(found -> {
                    throw new ConflictException(
                            "Ya existe otra categoría con el slug «" + category.getSlug() + "».");
                });
    }

    private void apply(Category category, CategoryRequest request) {
        if (request.name() != null && !request.name().isBlank()) {
            category.setName(request.name().trim());
        }

        if (request.slug() != null && !request.slug().isBlank()) {
            category.setSlug(Slugs.toSlug(request.slug()));
        } else if (category.getSlug() == null || category.getSlug().isBlank()) {
            category.setSlug(Slugs.toSlug(category.getName()));
        }

        category.setDescription(Values.trimToNull(request.description()));
        category.setImageUrl(Values.trimToNull(request.imageUrl()));
    }
}
