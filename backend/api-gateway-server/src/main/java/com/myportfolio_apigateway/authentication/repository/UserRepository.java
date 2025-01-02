package com.myportfolio_apigateway.authentication.repository;


import com.myportfolio_apigateway.authentication.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<Users,Integer> {
    Users findByUserEmail(String userEmail);
}
