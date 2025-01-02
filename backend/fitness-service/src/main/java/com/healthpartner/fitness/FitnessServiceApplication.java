package com.healthpartner.fitness;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;


@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class FitnessServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(FitnessServiceApplication.class, args);
	}

}
