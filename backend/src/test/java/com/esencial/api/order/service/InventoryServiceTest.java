package com.esencial.api.order.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.bson.Document;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

import com.esencial.api.catalog.domain.Product;
import com.esencial.api.catalog.repository.ProductRepository;
import com.esencial.api.common.ConflictException;
import com.esencial.api.common.NotFoundException;
import com.esencial.api.order.service.InventoryService.StockChange;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class InventoryServiceTest {

    @Mock
    private ProductRepository products;

    @Mock
    private MongoTemplate mongoTemplate;

    @InjectMocks
    private InventoryService inventory;

    @Test
    @DisplayName("el descuento se condiciona en la propia consulta, no despues de leer")
    void elFiltroLleveLaCondicionDeStock() {
        when(mongoTemplate.findAndModify(any(Query.class), any(Update.class),
                any(FindAndModifyOptions.class), ArgumentMatchers.<Class<Product>>any())).thenReturn(new Product());

        inventory.reserve("prod-1", "Chaqueta", 2);

        // Esta es la invariante que evita sobrevender: si el filtro no trajera
        // "stock >= 2", dos carritos simultaneos podrian descontar sobre el
        // mismo stock leido. Se lee el filtro construido, no el codigo.
        ArgumentCaptor<Query> query = ArgumentCaptor.forClass(Query.class);
        ArgumentCaptor<Update> update = ArgumentCaptor.forClass(Update.class);
        verify(mongoTemplate).findAndModify(query.capture(), update.capture(),
                any(FindAndModifyOptions.class), ArgumentMatchers.<Class<Product>>any());

        String rendered = query.getValue().getQueryObject().toJson();
        assertThat(rendered).contains("\"stock\": {\"$gte\": 2}");
        assertThat(rendered).contains("\"_id\": \"prod-1\"");
        assertThat(rendered).contains("\"isActive\": true");
        assertThat(update.getValue().getUpdateObject()).containsEntry("$inc", new Document("stock", -2));
    }

    @Test
    @DisplayName("avisa cuanto stock queda cuando no hay unidades suficientes")
    void errorDeStockInformativo() {
        when(mongoTemplate.findAndModify(any(Query.class), any(Update.class),
                any(FindAndModifyOptions.class), ArgumentMatchers.<Class<Product>>any())).thenReturn(null);
        when(products.findById("prod-1")).thenReturn(Optional.of(product("prod-1", "Chaqueta", 1)));

        assertThatThrownBy(() -> inventory.reserve("prod-1", "Chaqueta", 3))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Chaqueta")
                .hasMessageContaining("Disponibles: 1");
    }

    @Test
    @DisplayName("no se puede reservar un producto dado de baja")
    void productoInactivo() {
        when(mongoTemplate.findAndModify(any(Query.class), any(Update.class),
                any(FindAndModifyOptions.class), ArgumentMatchers.<Class<Product>>any())).thenReturn(null);
        Product inactive = product("prod-1", "Chaqueta", 10);
        inactive.setActive(false);
        when(products.findById("prod-1")).thenReturn(Optional.of(inactive));

        assertThatThrownBy(() -> inventory.reserve("prod-1", "Chaqueta", 1))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("ya no está disponible");
    }

    @Test
    @DisplayName("un id inexistente es 404, no un conflicto de stock")
    void productoInexistente() {
        when(mongoTemplate.findAndModify(any(Query.class), any(Update.class),
                any(FindAndModifyOptions.class), ArgumentMatchers.<Class<Product>>any())).thenReturn(null);
        when(products.findById(anyString())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> inventory.reserve("prod-99", "Algo", 1))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("devolver stock lo suma con $inc, sin leer antes")
    void devolucionSuma() {
        inventory.release(List.of(new StockChange("prod-1", 2), new StockChange("prod-2", 1)));

        ArgumentCaptor<Query> query = ArgumentCaptor.forClass(Query.class);
        ArgumentCaptor<Update> update = ArgumentCaptor.forClass(Update.class);
        verify(mongoTemplate, org.mockito.Mockito.times(2))
                .updateFirst(query.capture(), update.capture(), ArgumentMatchers.<Class<Product>>any());

        assertThat(update.getAllValues().get(0).getUpdateObject())
                .containsEntry("$inc", new Document("stock", 2));
        assertThat(update.getAllValues().get(1).getUpdateObject())
                .containsEntry("$inc", new Document("stock", 1));
    }

    @Test
    @DisplayName("no toca nada cuando no hay reservas que devolver")
    void devolucionVacia() {
        inventory.release(List.of());

        verify(mongoTemplate, never()).updateFirst(any(Query.class), any(Update.class),
                ArgumentMatchers.<Class<Product>>any());
    }

    private Product product(String id, String title, long stock) {
        Product product = new Product();
        product.setId(id);
        product.setTitle(title);
        product.setStock(stock);
        product.setActive(true);
        return product;
    }
}
