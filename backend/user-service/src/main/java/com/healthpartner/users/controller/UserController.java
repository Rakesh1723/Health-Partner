package com.healthpartner.users.controller;

import com.healthpartner.users.dto.*;
import com.healthpartner.users.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/v1/users")
//@CrossOrigin
public class UserController {

    @Autowired
    UserService userService;

    @PostMapping
    public ResponseEntity<UserDto> saveUser(@RequestBody UserRegistrationDto user){
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.saveUser(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable("id") int id){
        return ResponseEntity.status(HttpStatus.OK).body(userService.getUserByEmail(id));
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers(){
      return ResponseEntity.status(HttpStatus.OK).body(userService.getAllUsers());
    }

    @PutMapping("/updateProfile/{id}")
    public ResponseEntity<UserProfileDto> updateUserProfile(@PathVariable("id") int id, @RequestBody UserProfileDto userProfileDto){
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(userService.updateUserProfile(id,userProfileDto));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable("id") int id){
        userService.deleteUser(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PutMapping("/updatePassword/{email}/{password}")
    public ResponseEntity<Void> updatePassword(@PathVariable("email") String email, @PathVariable("password") String password){
        userService.updatePassword(email,password);
       return ResponseEntity.status(HttpStatus.ACCEPTED).build();
    }

    @GetMapping("/password/{id}")
    public ResponseEntity<String> getPasswordByID(@PathVariable("id") int id){
        return ResponseEntity.status(HttpStatus.OK).body(userService.getPasswordById(id));
    }

    @GetMapping("/status/{id}")
    public ResponseEntity<Boolean> getUserStatus(@PathVariable("id") int userId){
        return ResponseEntity.status(HttpStatus.OK).body(userService.getUserStatus(userId));
    }

    @GetMapping("/userId/{email}")
    public ResponseEntity<Integer> getUserId(@PathVariable("email") String email){
        return ResponseEntity.status(HttpStatus.OK).body(userService.getUserIdByEmail(email));
    }

    //leaderboard
    @GetMapping("/uniqueUserName/{userName}")
    public ResponseEntity<Boolean> isUniqueUserName(@PathVariable("userName") String userName){
        return ResponseEntity.status(HttpStatus.OK).body(userService.isUniqueUserName(userName));
    }

}
