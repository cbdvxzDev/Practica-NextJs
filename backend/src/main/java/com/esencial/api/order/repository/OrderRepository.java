package com.esencial.api.order.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.esencial.api.order.domain.Order;

public interface OrderRepository extends MongoRepository<Order, String> {

    /** Historial del cliente, del pedido mas reciente al mas antiguo. */
    List<Order> findByUserIdOrderByCreatedAtDesc(String userId);
}
