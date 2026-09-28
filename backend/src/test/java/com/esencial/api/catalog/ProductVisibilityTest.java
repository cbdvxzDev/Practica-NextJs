package com.esencial.api.catalog;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.mongodb.core.MongoTemplate;

import com.esencial.api.catalog.domain.Product;
import com.esencial.api.catalog.repository.ProductRepository;
import com.esencial.api.catalog.service.CategoryService;
import com.esencial.api.catalog.service.ProductService;
import com.esencial.api.common.NotFoundException;

/**
 * El filtro de productos dados de baja. Sin el, un producto retirado del
 * catalogo seguia siendo localizable por id desde una ruta publica.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ProductVisibilityTest {

    @Mock
    private ProductRepository products;

    @Mock
    private CategoryService categoryService;

    @Mock
    private MongoTemplate mongoTemplate;

    @InjectMocks
    private ProductService service;

    @Test
    @DisplayName("un producto dado de baja responde 404 en la lectura publica por id")
    void productoInactivoNoSeEncuentraPorId() {
        when(products.findById("prd-1")).thenReturn(Optional.of(inactiveProduct()));

        // Se responde 404 y no 403: para el visitante no puede distinguirse de
        // un producto que nunca existio, que es justo lo que se quiere evitar.
        assertThatThrownBy(() -> service.getActiveById("prd-1"))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Producto no encontrado.");
    }

    @Test
    @DisplayName("un producto dado de baja sigue disponible para el panel")
    void productoInactivoSigueVisibleParaElPanel() {
        Product product = inactiveProduct();
        when(products.findById("prd-1")).thenReturn(Optional.of(product));

        // El panel tiene que poder editar y reactivar lo que dio de baja; por eso
        // get() no filtra y el filtrado vive en getActiveById().
        assertThat(service.get("prd-1")).isSameAs(product);
    }

    @Test
    @DisplayName("un producto activo se sirve sin problema")
    void productoActivoSeSirve() {
        Product product = inactiveProduct();
        product.setActive(true);
        when(products.findById("prd-1")).thenReturn(Optional.of(product));

        assertThat(service.getActiveById("prd-1")).isSameAs(product);
    }

    @Test
    @DisplayName("un id inexistente responde 404")
    void idInexistenteDa404() {
        when(products.findById("prd-404")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getActiveById("prd-404"))
                .isInstanceOf(NotFoundException.class);
    }

    private Product inactiveProduct() {
        Product product = new Product();
        product.setId("prd-1");
        product.setSku("ESK-001");
        product.setSlug("vestido-midi-lino");
        product.setTitle("Vestido Midi Lino");
        product.setActive(false);
        return product;
    }
}
