package com.esencial.api.order.service;

import java.time.Year;

import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import org.bson.Document;

/**
 * Consecutivo de pedidos por ano: ORD-2026-001, ORD-2026-002, ...
 *
 * <p>Se apoya en {@code findAndModify} con {@code $inc} y {@code upsert} sobre
 * una coleccion contadora. MongoDB ejecuta eso como una operacion atomica, de
 * modo que dos pedidos simultaneos reciben numeros distintos. La alternativa
 * habitual, leer el ultimo id y sumar uno, entrega el mismo numero a dos
 * peticiones y el segundo falla al insertar.
 */
@Service
public class OrderSequenceService {

    private static final String COLLECTION = "counters";

    private final MongoTemplate mongoTemplate;

    public OrderSequenceService(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    /** Reserva el siguiente numero del ano en curso y devuelve el id completo. */
    public String nextId() {
        int year = Year.now().getValue();
        String counterId = "orders-" + year;

        Document counter = mongoTemplate.findAndModify(
                Query.query(Criteria.where("_id").is(counterId)),
                new Update().inc("seq", 1),
                FindAndModifyOptions.options().upsert(true).returnNew(true),
                Document.class);

        if (counter == null) {
            // Con upsert y returnNew el documento siempre existe; si aun asi no
            // llega, preferimos fallar antes que devolver un id repetido.
            throw new IllegalStateException("No se pudo generar el consecutivo de pedidos.");
        }

        int sequence = counter.getInteger("seq", 1);
        return String.format("ORD-%d-%03d", year, sequence);
    }
}
