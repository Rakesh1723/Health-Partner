package com.myportfolio_apigateway.authentication.controller;


import com.myportfolio_apigateway.authentication.dto.JwtToken;
import com.myportfolio_apigateway.authentication.dto.UserRegistrationDto;
import com.myportfolio_apigateway.authentication.feign.UserFeignClient;
import com.myportfolio_apigateway.authentication.model.Users;
import com.myportfolio_apigateway.authentication.repository.UserRepository;
import com.myportfolio_apigateway.authentication.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin("http://localhost:4200")
public class UserController {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    JwtService jwtService;

   @Autowired
    UserFeignClient userFeignClient;

    private BCryptPasswordEncoder encoder=new BCryptPasswordEncoder(12);

    @PostMapping("/signup")
    public Users saveUser(@RequestBody UserRegistrationDto user) {
        user.setPassword(encoder.encode(user.getPassword()));
        userFeignClient.saveUser(user);
        Users users=new Users(0,user.getEmailId(),user.getPassword());
        return userRepo.save(users);
    }

    @PostMapping("/login")
    public JwtToken login(@RequestBody Users user)
    {
        Authentication  authentication= authenticationManager
                .authenticate(new UsernamePasswordAuthenticationToken(user.getUserEmail(),user.getPassword()));

        if(authentication.isAuthenticated())
            return new JwtToken(jwtService.generateToken(user.getUserEmail()));
        else
            return null;

    }

    @GetMapping("/jwtToken/{jwt}")
    public String getToken(@PathVariable("jwt") String jwt){
        return jwtService.extractUserEmail(jwt);
    }

    @PutMapping("/updatePassword/{email}/{password}")
    public void updatePassword(@PathVariable("email") String email,@PathVariable("password") String password){
        userFeignClient.updatePassword(email,password);
        Users user=userRepo.findByUserEmail(email);
        user.setPassword(encoder.encode(password));
        userRepo.save(user);
    }

}
