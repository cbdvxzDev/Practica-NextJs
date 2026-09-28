package com.esencial.api.common;

/**
 * Metadatos de las listas. El frontend ya espera esta forma
 * ({@code { data: [...], meta: { total } }}), asi que se mantiene igual.
 */
public record Meta(long total) {
}
