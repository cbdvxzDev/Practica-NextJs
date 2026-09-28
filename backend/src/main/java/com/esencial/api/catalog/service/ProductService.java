package com.esencial.api.catalog.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import com.esencial.api.catalog.domain.Category;
import com.esencial.api.catalog.domain.CategoryRef;
import com.esencial.api.catalog.domain.Product;
import com.esencial.api.catalog.dto.ProductRequest;
import com.esencial.api.catalog.repository.ProductRepository;
import com.esencial.api.common.ConflictException;
import com.esencial.api.common.NotFoundException;
import com.esencial.api.common.Slugs;

@Service
public class ProductService {

    /** Tallas por defecto cuando un producto se crea sin especificar tallas. */
    private static final List<String> DEFAULT_SIZES = List.of("S", "M", "L");

    private static final String PLACEHOLDER_IMAGE = "/images/products/placeholder.webp";

    private final ProductRepository products;
    private final CategoryService categoryService;
    private final MongoTemplate mongoTemplate;

    public ProductService(
            ProductRepository products,
            CategoryService categoryService,
            MongoTemplate mongoTemplate) {
        this.products = products;
        this.categoryService = categoryService;
        this.mongoTemplate = mongoTemplate;
    }

    /**
     * Catalogo publico: solo productos activos, con filtro opcional por
     * categoria y busqueda libre sobre titulo, descripcion y SKU.
     */
    public List<Product> listPublic(String category, String search) {
        List<Criteria> filters = new ArrayList<>();
        filters.add(Criteria.where("isActive").is(true));
        addIfPresent(filters, categoryFilter(category));
        addIfPresent(filters, searchFilter(search));

        // Un criterio vacio dentro de $and produce un documento {} que MongoDB
        // rechaza, asi que los filtros sin valor no se anaden a la lista.
        Query query = new Query(join(filters))
                .with(Sort.by(Sort.Direction.DESC, "createdAt"));

        return mongoTemplate.find(query, Product.class);
    }

    /** Vista del panel: aqui si aparecen los productos dados de baja. */
    public List<Product> listAll() {
        return products.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public Product getActiveBySlug(String slug) {
        return products.findBySlugAndIsActiveTrue(slug)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado."));
    }

    /**
     * Ficha publica por id. Filtra los dados de baja igual que
     * {@link #getActiveBySlug(String)}: si no, un producto retirado seguiria
     * siendo localizable por id aunque desapareciera del listado y de la ficha
     * por slug, que es justo lo que el panel-admin usa para darlo de baja.
     */
    public Product getActiveById(String id) {
        Product product = get(id);
        if (!product.isActive()) {
            throw new NotFoundException("Producto no encontrado.");
        }
        return product;
    }

    /** Lectura sin filtrar: la usa el panel para ver tambien lo dado de baja. */
    public Product get(String id) {
        return products.findById(id)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado."));
    }

    public Product requireById(String id) {
        return products.findById(id)
                .orElseThrow(() -> new NotFoundException(
                        "El producto con id «" + id + "» no existe."));
    }

    public Product create(ProductRequest request) {
        Product product = new Product();
        product.setSku(request.sku().trim().toUpperCase(Locale.ROOT));
        product.setSlug(slugFor(request.title(), null));
        apply(product, request);
        product.setActive(request.isActive() == null || request.isActive());

        assertUnique(product);
        validatePrice(product);

        return products.save(product);
    }

    /**
     * Sustitucion completa del producto. El DTO exige sku, titulo, precio,
     * categoria y stock, asi que el panel de edicion debe reenviarlos todos; lo
     * que si falta (descripcion, imagenes, tallas, precio comparativo) se
     * guarda vacio en lugar de conservar el valor anterior, para que quitar una
     * foto del formulario tambien la borre del producto.
     *
     * <p>El slug es la excepcion: solo se recalcula si el titulo cambio, para
     * que corregir la descripcion no rompa los enlaces ya publicados.
     */
    public Product update(String id, ProductRequest request) {
        Product product = get(id);

        if (!request.title().trim().equalsIgnoreCase(product.getTitle())) {
            product.setSlug(slugFor(request.title(), product.getId()));
        }

        apply(product, request);

        assertUnique(product);
        validatePrice(product);

        return products.save(product);
    }

    public Product updateStock(String id, long stock) {
        Product product = get(id);
        product.setStock(stock);

        return products.save(product);
    }

    public void delete(String id) {
        if (!products.existsById(id)) {
            throw new NotFoundException("Producto no encontrado.");
        }
        products.deleteById(id);
    }

    private void apply(Product product, ProductRequest request) {
        product.setSku(request.sku().trim().toUpperCase(Locale.ROOT));
        product.setTitle(request.title().trim());
        product.setDescription(text(request.description()));
        product.setPrice(request.price().longValue());
        product.setCompareAtPrice(request.compareAtPrice());
        product.setImages(normalizeImages(request.images()));
        product.setCategory(categoryRef(request.category()));
        product.setSizes(normalizeSizes(request.sizes()));
        product.setStock(request.stock().longValue());
        if (request.isActive() != null) {
            product.setActive(request.isActive());
        }
    }

    /**
     * Deriva el slug del titulo y, si ya esta ocupado, anade un sufijo hasta
     * encontrar uno libre. Sin esto, dos productos con el mismo titulo (variantes
     * de color, por ejemplo) harian fallar el guardado contra el indice unico.
     *
     * @param ownId id del producto que se esta editando, para no chocar consigo mismo
     */
    private String slugFor(String title, String ownId) {
        String base = Slugs.toSlug(title);
        if (base.isEmpty()) {
            base = "producto";
        }
        if (isSlugFree(base, ownId)) {
            return base;
        }

        int suffix = 2;
        while (!isSlugFree(base + "-" + suffix, ownId)) {
            suffix++;
        }
        return base + "-" + suffix;
    }

    private boolean isSlugFree(String slug, String ownId) {
        return products.findBySlugIgnoreCase(slug)
                .map(found -> ownId != null && found.getId().equals(ownId))
                .orElse(true);
    }

    private void validatePrice(Product product) {
        Long compareAt = product.getCompareAtPrice();
        if (compareAt != null && compareAt <= product.getPrice()) {
            throw new IllegalArgumentException(
                    "El precio comparativo debe ser mayor que el precio actual.");
        }
    }

    private void assertUnique(Product product) {
        products.findBySkuIgnoreCase(product.getSku())
                .filter(found -> !found.getId().equals(product.getId()))
                .ifPresent(found -> {
                    throw new ConflictException(
                            "Ya existe un producto con el SKU «" + product.getSku() + "».");
                });

        products.findBySlugIgnoreCase(product.getSlug())
                .filter(found -> !found.getId().equals(product.getId()))
                .ifPresent(found -> {
                    throw new ConflictException(
                            "Ya existe un producto con el slug «" + product.getSlug() + "».");
                });
    }

    private CategoryRef categoryRef(String slug) {
        Category category = categoryService.requireBySlug(slug);
        return new CategoryRef(category.getId(), category.getName(), category.getSlug());
    }

    private List<String> normalizeImages(List<String> images) {
        List<String> clean = sanitize(images);
        if (clean.isEmpty()) {
            return new ArrayList<>(List.of(PLACEHOLDER_IMAGE));
        }
        return clean;
    }

    private List<String> normalizeSizes(List<String> sizes) {
        List<String> clean = sanitize(sizes);
        if (clean.isEmpty()) {
            return new ArrayList<>(DEFAULT_SIZES);
        }
        return clean;
    }

    private List<String> sanitize(List<String> values) {
        if (values == null) {
            return new ArrayList<>();
        }
        return values.stream()
                .filter(value -> value != null && !value.isBlank())
                .map(value -> value.trim())
                .distinct()
                .collect(Collectors.toCollection(ArrayList::new));
    }

    private String text(String value) {
        return value == null ? "" : value.trim();
    }

    /**
     * La categoria se acepta por slug, id o nombre, que es como el panel la
     * tiene disponible. Comparar solo por un campo devolveria productos
     * filtrados de mas cuando el cliente envie otro.
     */
    private Criteria categoryFilter(String category) {
        if (category == null || category.isBlank()) {
            return null;
        }

        String value = category.trim();
        return new Criteria().orOperator(
                Criteria.where("category.slug").is(value.toLowerCase(Locale.ROOT)),
                Criteria.where("category.id").is(value),
                Criteria.where("category.name").is(value));
    }

    private Criteria searchFilter(String search) {
        if (search == null || search.isBlank()) {
            return null;
        }

        // Se escapa el texto: sin escape, un termino como "c(" se interpretaria
        // como regex y el usuario veria un error en vez de cero resultados.
        Pattern pattern = Pattern.compile(Pattern.quote(search.trim()), Pattern.CASE_INSENSITIVE);

        return new Criteria().orOperator(
                Criteria.where("title").regex(pattern),
                Criteria.where("description").regex(pattern),
                Criteria.where("sku").regex(pattern));
    }

    private void addIfPresent(List<Criteria> filters, Criteria criteria) {
        if (criteria != null) {
            filters.add(criteria);
        }
    }

    private Criteria join(List<Criteria> filters) {
        if (filters.size() == 1) {
            return filters.get(0);
        }
        return new Criteria().andOperator(filters.toArray(new Criteria[0]));
    }
}
