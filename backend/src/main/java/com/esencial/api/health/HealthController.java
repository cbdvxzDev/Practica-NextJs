package com.esencial.api.health;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/health")
@Tag(name = "Health", description = "Estado del servicio")
public class HealthController {

    private static final Logger log = LoggerFactory.getLogger(HealthController.class);

    private final MongoTemplate mongoTemplate;

    public HealthController(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    /**
     * Sondea la base de datos de verdad. Antes devolvia siempre
     * {@code status: ok} sin tocar Mongo, de modo que un despliegue caido se
     * anunciaba como sano y la plataforma no reiniciaba ni sacaba el servicio de
     * rotacion. Un fallo de conexion responde 503 para que el orquestrador lo
     * detecte, no 200 con un campo de adorno.
     */
    @GetMapping
    @Operation(summary = "Comprueba que la API responde y que MongoDB esta accesible")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("engine", "mongo");
        body.put("timestamp", Instant.now().toString());

        try {
            String database = mongoTemplate.getDb().getName();
            // getName() solo lee la configuracion: no abre socket. El ping si.
            mongoTemplate.getDb().runCommand(new org.bson.Document("ping", 1));

            body.put("status", "ok");
            body.put("database", database);
            return ResponseEntity.ok(body);
        } catch (DataAccessException | com.mongodb.MongoException ex) {
            log.warn("Health check fallo: MongoDB no responde. {}", ex.getMessage());
            body.put("status", "down");
            body.put("error", "MongoDB no responde.");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(body);
        }
    }
}
