package com.esencial.api.order.service;

import java.util.List;

import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import com.esencial.api.catalog.domain.Product;
import com.esencial.api.catalog.repository.ProductRepository;
import com.esencial.api.common.ConflictException;
import com.esencial.api.common.NotFoundException;

/**
 * Reserva y devolucion de stock.
 *
 * Vive aparte del servicio de pedidos porque el unico modo en que el stock
 * puede sobre venderse es la reserva, y asi esa logica queda en un solo sitio.
 */
@Service
public class InventoryService {

    private final ProductRepository products;
    private final MongoTemplate mongoTemplate;

    public InventoryService(ProductRepository products, MongoTemplate mongoTemplate) {
        this.products = products;
        this.mongoTemplate = mongoTemplate;
    }

    /**
     * Descuenta {@code quantity} unidades del producto, o lanza excepcion.
     *
     * <p>El filtro lleva {@code stock >= quantity} dentro de la propia consulta
     * y el descuento se aplica con {@code $inc}. MongoDB evalua el filtro y
     * aplica la escritura sobre el mismo documento de forma atomica, asi que
     * dos carritos simultaneos no pueden leer el mismo stock: el segundo ve el
     * valor ya descontado y falla. Leer el stock, comprobar en Java y luego
     * guardar permitiria sobrevender con el stock que quedara entre ambos pasos.
     *
     * @throws NotFoundException si el producto no existe o esta dado de baja
     * @throws ConflictException si no queda stock suficiente
     */
    public void reserve(String productId, String productName, int quantity) {
        Query query = Query.query(Criteria.where("_id").is(productId)
                .and("isActive").is(true)
                .and("stock").gte(quantity));

        Update update = new Update().inc("stock", -quantity);

        Product reserved = mongoTemplate.findAndModify(
                query,
                update,
                FindAndModifyOptions.options().returnNew(true),
                Product.class);

        if (reserved != null) {
            return;
        }

        // No se puede distinguir "no existe" de "no hay stock" sin volver a
        // leer, asi que se averigua para que el mensaje sea util.
        Product current = products.findById(productId)
                .orElseThrow(() -> new NotFoundException(
                        "El producto con id «" + productId + "» no existe."));

        if (!current.isActive()) {
            throw new ConflictException("«" + productName + "» ya no está disponible.");
        }
        throw new ConflictException(
                "Stock insuficiente para «" + productName + "». Disponibles: " + current.getStock() + ".");
    }

    /**
     * Devuelve el stock de un pedido que no llego a crearse.
     *
     * <p>No es una transaccion: MongoDB standalone no la ofrece y un cluster
     * con replica si. Se compensa linea a linea, y por eso el llamador tiene
     * que avisar de todo lo que ya habia descontado.
     */
    public void release(List<StockChange> changes) {
        for (StockChange change : changes) {
            mongoTemplate.updateFirst(
                    Query.query(Criteria.where("_id").is(change.productId())),
                    new Update().inc("stock", change.quantity()),
                    Product.class);
        }
    }

    /** Una reserva ya aplicada, para poder revertirla si el pedido falla. */
    public record StockChange(String productId, int quantity) {
    }
}
