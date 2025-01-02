package com.myportfolio_apigateway.authentication.feign;

import com.myportfolio_apigateway.authentication.dto.UserDto;
import com.myportfolio_apigateway.authentication.dto.UserRegistrationDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient("USER-SERVICE")
public interface UserFeignClient {
    @PostMapping("/api/v1/users")
    public UserDto saveUser(@RequestBody UserRegistrationDto user);

    @PutMapping("/api/v1/users/updatePassword/{email}/{password}")
    public void updatePassword(@PathVariable("email") String email, @PathVariable("password") String password);

}