package com.esencial.api;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

/**
 * Test de integracion que necesita el contexto completo de Spring y un MongoDB
 * real de Testcontainers.
 *
 * <p>Se salta solo cuando no hay Docker, de modo que {@code mvn test} sigue
 * siendo ejecutable en un portatil sin Docker y los tests que si lo necesitan
 * se ejecutan enteros en CI, donde si lo hay.
 */
@Documented
@Inherited
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@SpringBootTest
@Import(TestcontainersConfiguration.class)
@Tag("integration")
@EnabledIf("com.esencial.api.DockerAvailable#isDockerAvailable")
public @interface IntegrationTest {
}
