package com.esencial.api;

import org.springframework.boot.SpringApplication;

public class TestEsencialApiApplication {

	public static void main(String[] args) {
		SpringApplication.from(EsencialApiApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
