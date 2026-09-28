package com.esencial.api.catalog.domain;

/**
 * Categoria embebida dentro del producto.
 *
 * Se guarda desnormalizada a proposito: el catalogo se lee mucho mas de lo que
 * se escribe, y asi listar productos no necesita un JOIN por categoria.
 * Si el nombre de una categoria cambia, hay que refrescar los productos.
 */
public class CategoryRef {

    private String id;

    private String name;

    private String slug;

    public CategoryRef() {
    }

    public CategoryRef(String id, String name, String slug) {
        this.id = id;
        this.name = name;
        this.slug = slug;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }
}
