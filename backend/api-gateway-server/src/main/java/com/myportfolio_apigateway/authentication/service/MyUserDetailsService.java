package com.myportfolio_apigateway.authentication.service;


import com.myportfolio_apigateway.authentication.model.Users;
import com.myportfolio_apigateway.authentication.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


@Service
public class MyUserDetailsService implements UserDetailsService {

    @Autowired
    UserRepository userRepo;

    @Override
    public UserDetails loadUserByUsername(String userEmail) throws UsernameNotFoundException {

        Users user= userRepo.findByUserEmail(userEmail);

        if (user==null) {
            throw new UsernameNotFoundException("User email not found 404");
        }
        return new UserPrincipal(user);
    }
}
