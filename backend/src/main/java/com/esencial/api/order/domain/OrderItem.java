package com.esencial.api.order.domain;

/**
 * Linea de pedido. Se guarda una copia del nombre, la foto, el slug y el precio
 * del producto en el momento de la compra, no una referencia: si mañana sube el
 * precio o se retira el producto, el historial tiene que seguir siendo el que
 * el cliente pago.
 */
public class OrderItem {

    private String productId;

    private String name;

    private int quantity;

    private long price;

    private String image;

    private String slug;

    private String size;

    public OrderItem() {
    }

    public OrderItem(String productId, String name, int quantity, long price, String image, String slug, String size) {
        this.productId = productId;
        this.name = name;
        this.quantity = quantity;
        this.price = price;
        this.image = image;
        this.slug = slug;
        this.size = size;
    }

    public long lineTotal() {
        return price * quantity;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public long getPrice() {
        return price;
    }

    public void setPrice(long price) {
        this.price = price;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }
}
