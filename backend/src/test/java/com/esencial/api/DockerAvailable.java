package com.esencial.api;

/**
 * Detecta si hay un demonio Docker accesible.
 *
 * <p>Los tests que levantan MongoDB con Testcontainers no pueden ejecutarse sin
 * Docker. Sin esta comprobacion fallan con un error de bean, que parece un
 * problema del codigo cuando en realidad es del entorno, y esconde los fallos
 * reales del resto de la suite.
 */
public final class DockerAvailable {

    private DockerAvailable() {
    }

    public static boolean isDockerAvailable() {
        try {
            return org.testcontainers.DockerClientFactory.instance().isDockerAvailable();
        } catch (RuntimeException ex) {
            // Sin cliente de Docker, o con el demonio parado, no hay motor.
            return false;
        }
    }
}
