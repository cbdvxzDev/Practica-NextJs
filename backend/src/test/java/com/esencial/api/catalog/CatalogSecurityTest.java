package com.esencial.api.catalog;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.esencial.api.catalog.controller.AdminProductController;
import com.esencial.api.catalog.controller.CategoryController;
import com.esencial.api.catalog.controller.ProductController;
import com.esencial.api.catalog.domain.Category;
import com.esencial.api.catalog.domain.CategoryRef;
import com.esencial.api.catalog.domain.Product;
import com.esencial.api.catalog.dto.ProductRequest;
import com.esencial.api.catalog.service.CategoryService;
import com.esencial.api.catalog.service.ProductService;
import com.esencial.api.common.GlobalExceptionHandler;
import com.esencial.api.config.SecurityConfig;

/**
 * Comprueba la frontera publica/privada del catalogo contra la cadena de
 * seguridad real: los mismos beans, el mismo {@code SecurityFilterChain} y el
 * mismo validador de token que en produccion, con los servicios del catalogo
 * sustituidos.
 *
 * <p>No necesita MongoDB: lo que se prueba es quien puede entrar, no el
 * contenido de las colecciones.
 */
@WebMvcTest(controllers = { ProductController.class, CategoryController.class, AdminProductController.class })
@Import({ SecurityConfig.class, GlobalExceptionHandler.class })
class CatalogSecurityTest {

    private static final String ADMIN_BODY = """
            {
              "sku": "ESK-001",
              "title": "Vestido Midi Lino",
              "price": 189000,
              "category": "vestidos",
              "stock": 5,
              "sizes": ["S", "M", "L"]
            }
            """;

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private ProductService productService;

    @MockitoBean
    private CategoryService categoryService;

    @Test
    @DisplayName("el catalogo se lee sin token")
    void listarProductosEsPublico() throws Exception {
        when(productService.listPublic(null, null)).thenReturn(List.of(sampleProduct()));

        mvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].sku").value("ESK-001"))
                .andExpect(jsonPath("$.meta.total").value(1));
    }

    @Test
    @DisplayName("la ficha por slug y la categoria son publicas")
    void consultarPorSlugYCategoriaEsPublico() throws Exception {
        when(productService.getActiveBySlug("vestido-midi-lino")).thenReturn(sampleProduct());
        when(categoryService.list()).thenReturn(List.of(sampleCategory()));

        mvc.perform(get("/api/products/slug/vestido-midi-lino")).andExpect(status().isOk());
        mvc.perform(get("/api/categories")).andExpect(status().isOk());
    }

    @Test
    @DisplayName("crear un producto exige rol de administrador")
    void crearProductoExigeAdmin() throws Exception {
        mvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ADMIN_BODY)
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_CUSTOMER"))))
                .andExpect(status().isForbidden());

        verifyNoInteractions(productService);
    }

    @Test
    @DisplayName("soporte tampoco puede crear productos")
    void soporteNoPuedeCrearProductos() throws Exception {
        mvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ADMIN_BODY)
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_SUPPORT"))))
                .andExpect(status().isForbidden());

        verifyNoInteractions(productService);
    }

    @Test
    @DisplayName("un administrador si puede crear productos")
    void adminPuedeCrearProductos() throws Exception {
        when(productService.create(org.mockito.ArgumentMatchers.any(ProductRequest.class)))
                .thenReturn(sampleProduct());

        mvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ADMIN_BODY)
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("sin token, escribir devuelve 401 y no toca el servicio")
    void escribirSinTokenDevuelve401() throws Exception {
        mvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ADMIN_BODY))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(productService);
    }

    @Test
    @DisplayName("un token con firma inventada devuelve 401")
    void tokenFalsoDevuelve401() throws Exception {
        // Este caso no se puede simular con el postprocessor jwt(): ese inyecta
        // la autenticacion ya resuelta y se saltaria la validacion de la firma.
        // Aqui el token llega al JwtDecoder de verdad, que es lo que tiene que
        // rechazarlo.
        mvc.perform(get("/api/categories")
                        .header("Authorization", "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c3ItMSJ9.firma-inventada"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("un JSON ilegible devuelve 400 y no 500")
    void jsonIlegibleDevuelve400() throws Exception {
        mvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ esto no es json ")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("un campo obligatorio ausente devuelve 400 con el detalle del campo")
    void campoObligatorioAusenteDevuelve400() throws Exception {
        mvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"sku\": \"ESK-001\" }")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.title").exists())
                .andExpect(jsonPath("$.details.category").exists());
    }

    @Test
    @DisplayName("un producto dado de baja no se encuentra por la ruta publica")
    void productoInactivoDa404() throws Exception {
        when(productService.getActiveById(anyString()))
                .thenThrow(new com.esencial.api.common.NotFoundException("Producto no encontrado."));

        mvc.perform(get("/api/products/prd-1"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Producto no encontrado."));
    }

    @Test
    @DisplayName("la vista de gestion exige administrador y si incluye los dados de baja")
    void vistaDeGestionExigeAdmin() throws Exception {
        // Sin token tiene que ser 401, no 403: no es que se le niegue el paso,
        // es que todavia no ha dicho quien es.
        mvc.perform(get("/api/admin/products"))
                .andExpect(status().isUnauthorized());

        mvc.perform(get("/api/admin/products")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_CUSTOMER"))))
                .andExpect(status().isForbidden());

        when(productService.listAll()).thenReturn(List.of(sampleProduct()));

        mvc.perform(get("/api/admin/products")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].id").value("prd-1"));
    }

    @Test
    @DisplayName("soporte lee la vista de gestion de productos (el panel de inventario es de solo lectura para el)")
    void soportePuedeLeerLaVistaDeGestion() throws Exception {
        when(productService.listAll()).thenReturn(List.of(sampleProduct()));
        when(productService.get("prd-1")).thenReturn(sampleProduct());

        mvc.perform(get("/api/admin/products")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_SUPPORT"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].id").value("prd-1"));

        mvc.perform(get("/api/admin/products/prd-1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_SUPPORT"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value("prd-1"));
    }

    @Test
    @DisplayName("soporte no escribe en la vista de gestion: crear y editar siguen siendo de admin")
    void laEscrituraDelPanelSigueSiendoDeAdmin() throws Exception {
        mvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ADMIN_BODY)
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_SUPPORT"))))
                .andExpect(status().isForbidden());

        verifyNoInteractions(productService);
    }

    @Test
    @DisplayName("el panel puede leer un producto dado de baja, la tienda no")
    void elPanelAlcanzaLosDadosDeBajaYLaTiendaNo() throws Exception {
        Product inactivo = sampleProduct();
        inactivo.setActive(false);

        when(productService.getActiveById("prd-9"))
                .thenThrow(new com.esencial.api.common.NotFoundException("Producto no encontrado."));
        when(productService.get("prd-9")).thenReturn(inactivo);

        mvc.perform(get("/api/products/prd-9")).andExpect(status().isNotFound());

        mvc.perform(get("/api/admin/products/prd-9")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isActive").value(false));
    }

    private Product sampleProduct() {
        Product product = new Product();
        product.setId("prd-1");
        product.setSku("ESK-001");
        product.setSlug("vestido-midi-lino");
        product.setTitle("Vestido Midi Lino");
        product.setPrice(189000L);
        product.setStock(5L);
        product.setActive(true);
        product.setCategory(new CategoryRef("cat-1", "Vestidos", "vestidos"));
        return product;
    }

    private Category sampleCategory() {
        Category category = new Category();
        category.setId("cat-1");
        category.setSlug("vestidos");
        category.setName("Vestidos");
        return category;
    }
}
