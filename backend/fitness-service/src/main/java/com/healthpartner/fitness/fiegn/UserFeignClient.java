package com.healthpartner.fitness.fiegn;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient("USER-SERVICE")
public interface UserFeignClient {
    @GetMapping("/api/v1/users/status/{id}")
    public boolean getUserStatus(@PathVariable("id") int userId);
}
