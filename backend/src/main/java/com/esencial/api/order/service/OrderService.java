package com.esencial.api.order.service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.esencial.api.catalog.domain.Product;
import com.esencial.api.catalog.repository.ProductRepository;
import com.esencial.api.common.ConflictException;
import com.esencial.api.common.JwtUser;
import com.esencial.api.common.NotFoundException;
import com.esencial.api.common.Values;
import com.esencial.api.order.domain.Order;
import com.esencial.api.order.domain.OrderItem;
import com.esencial.api.order.domain.OrderStatus;
import com.esencial.api.order.domain.PaymentStatus;
import com.esencial.api.order.dto.CreateOrderRequest;
import com.esencial.api.order.dto.CreateOrderRequest.OrderLineRequest;
import com.esencial.api.order.repository.OrderRepository;
import com.esencial.api.order.service.InventoryService.StockChange;

@Service
public class OrderService {

    /** Envio gratis a partir de este monto. */
    static final long FREE_SHIPPING_THRESHOLD = 200_000L;

    static final long SHIPPING_COST = 12_000L;

    /** "2 de abr. de 2026", el formato que ya entendia el cliente. */
    private static final DateTimeFormatter DISPLAY_DATE = DateTimeFormatter
            .ofPattern("d 'de' MMM 'de' yyyy", Locale.forLanguageTag("es-CO"));

    private final OrderRepository orders;
    private final ProductRepository products;
    private final InventoryService inventory;
    private final OrderSequenceService sequence;

    public OrderService(
            OrderRepository orders,
            ProductRepository products,
            InventoryService inventory,
            OrderSequenceService sequence) {
        this.orders = orders;
        this.products = products;
        this.inventory = inventory;
        this.sequence = sequence;
    }

    /** El staff ve todas las ordenes; un cliente, solo las suyas. */
    public List<Order> list(JwtUser user) {
        if (user.isStaff()) {
            List<Order> all = orders.findAll();
            all.sort((a, b) -> Values.compareNullable(b.getCreatedAt(), a.getCreatedAt()));
            return all;
        }
        return orders.findByUserIdOrderByCreatedAtDesc(user.id());
    }

    public Order get(JwtUser user, String id) {
        Order order = orders.findById(id)
                .orElseThrow(() -> new NotFoundException("Orden no encontrada."));

        if (!user.isStaff() && !order.getUserId().equals(user.id())) {
            // 403 y no 404: el cliente ya sabe que ese id existe, porque es el
            // formato de los pedidos que el mismo ve. Ocultarlo seria mentir.
            throw new AccessDeniedException("No autorizado.");
        }

        return order;
    }

    /**
     * Crea un pedido desde el carrito.
     *
     * <p>El precio se resuelve aqui contra MongoDB, nunca desde el cuerpo de la
     * peticion: si el total llegara del cliente, bastaria con editar la peticion
     * para comprar el catalogo entero por un peso.
     */
    public Order create(JwtUser user, CreateOrderRequest request) {
        List<OrderItem> lines = new ArrayList<>();
        List<StockChange> reserved = new ArrayList<>();
        long subtotal = 0;

        try {
            for (OrderLineRequest line : request.items()) {
                Product product = resolveProduct(line.productId());
                String size = normalizeSize(line, product);

                inventory.reserve(product.getId(), product.getTitle(), line.quantity());
                reserved.add(new StockChange(product.getId(), line.quantity()));

                subtotal += product.getPrice() * line.quantity();
                mergeLine(lines, product, line.quantity(), size);
            }
        } catch (RuntimeException ex) {
            // Si una linea falla, las anteriores ya descontaron stock de verdad.
            // Sin esta devolucion, un pedido con la tercera linea sin stock
            // dejaria los dos primeros productos fuera del inventario.
            inventory.release(reserved);
            throw ex;
        }

        long shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
        Instant now = Instant.now();

        Order order = new Order();
        order.setId(sequence.nextId());
        order.setUserId(user.id());
        order.setCustomer(user.name());
        order.setEmail(user.email());
        order.setDate(DISPLAY_DATE.format(now.atZone(ZoneId.of("America/Bogota"))));
        order.setSubtotal(subtotal);
        order.setShipping(shipping);
        order.setTotal(subtotal + shipping);
        order.setStatus(OrderStatus.PENDING);
        // "paid" (tarjeta) o "pending" (contra entrega) segun lo elegido en el
        // checkout; sin el campo, se asume pagado como hasta ahora.
        order.setPaymentStatus(request.paymentStatus() == null
                ? PaymentStatus.PAID
                : PaymentStatus.from(request.paymentStatus()));
        order.setItems(lines);
        order.setShippingAddress(request.shippingAddress().trim());
        order.setCreatedAt(now);
        order.setUpdatedAt(now);

        try {
            return orders.insert(order);
        } catch (RuntimeException ex) {
            // El pedido no se pudo guardar: el stock que se reservo para el
            // tampoco puede quedarse retenido.
            inventory.release(reserved);
            throw ex;
        }
    }

    /**
     * Cambia el estado de un pedido validando la transicion. Cancelar devuelve
     * el stock, porque el cliente ya no se lleva la mercancia.
     */
    public Order updateStatus(String id, String rawStatus) {
        Order order = orders.findById(id)
                .orElseThrow(() -> new NotFoundException("Orden no encontrada."));

        OrderStatus target = OrderStatus.from(rawStatus);
        OrderStatus current = order.getStatus();

        if (current == target) {
            return order;
        }
        if (!current.canTransitionTo(target)) {
            throw new ConflictException(
                    "Un pedido en «" + current.value() + "» no puede pasar a «" + target.value() + "».");
        }

        order.setStatus(target);
        order.setUpdatedAt(Instant.now());
        Order saved = orders.save(order);

        if (target == OrderStatus.CANCELLED) {
            List<StockChange> changes = saved.getItems().stream()
                    .filter(item -> item.getProductId() != null)
                    .map(item -> new StockChange(item.getProductId(), item.getQuantity()))
                    .toList();
            inventory.release(changes);
        }

        return saved;
    }

    private Product resolveProduct(String productId) {
        return products.findById(productId)
                .orElseThrow(() -> new NotFoundException(
                        "El producto con id «" + productId + "» no existe."));
    }

    private String normalizeSize(OrderLineRequest line, Product product) {
        if (line.size() == null || line.size().isBlank()) {
            return null;
        }

        String size = line.size().trim();
        if (!product.getSizes().contains(size)) {
            throw new IllegalArgumentException(
                    "La talla «" + size + "» no está disponible para «" + product.getTitle() + "».");
        }
        return size;
    }

    /** Dos tallas del mismo producto son lineas distintas del pedido. */
    private void mergeLine(List<OrderItem> lines, Product product, int quantity, String size) {
        for (OrderItem line : lines) {
            boolean sameProduct = product.getId().equals(line.getProductId());
            boolean sameSize = java.util.Objects.equals(size, line.getSize());
            if (sameProduct && sameSize) {
                line.setQuantity(line.getQuantity() + quantity);
                return;
            }
        }

        lines.add(new OrderItem(
                product.getId(),
                product.getTitle(),
                quantity,
                product.getPrice(),
                product.getImages().isEmpty() ? null : product.getImages().get(0),
                product.getSlug(),
                size));
    }
}
