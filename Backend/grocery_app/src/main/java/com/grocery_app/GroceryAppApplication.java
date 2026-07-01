package com.grocery_app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class GroceryAppApplication {

	public static void main(String[] args) {
		SpringApplication.run(GroceryAppApplication.class, args);
	}

}
