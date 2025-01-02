package com.healthpartner.users.controller;

import com.healthpartner.users.dto.*;
import com.healthpartner.users.service.UserDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/users/dashboard")
//@CrossOrigin
public class UserDashboard {

    @Autowired
    UserDashboardService userDashboardService;

    @GetMapping("/userDetails/{id}")
    public ResponseEntity<UserDetailsDto> getUserDetailsByUserId(@PathVariable("id") int userId){
        return ResponseEntity.status(HttpStatus.OK).body(userDashboardService.getUserDetailsByUserId(userId));
    }

    @GetMapping("/fitnessLogs/{id}")
    public ResponseEntity<List<FitnessLogDto>> getAllFitnessLogsByUserId(@PathVariable("id") int userId){
        return ResponseEntity.status(HttpStatus.OK).body(userDashboardService.getAllFitnessLogsByUserId(userId));
    }

    @GetMapping("/DietLogs/{id}")
    public ResponseEntity<List<DietLogDto>> getAllDietLogsByUserId(@PathVariable("id") int userId){
        return ResponseEntity.status(HttpStatus.OK).body(userDashboardService.getAllDietLogsByUserId(userId));
    }

    @GetMapping("/wellnessLogs/{id}")
    public ResponseEntity<List<WellnessLogDto>> getAllWellnessLogsByUserId(@PathVariable("id") int userId){
        return ResponseEntity.status(HttpStatus.OK).body(userDashboardService.getAllWellnessLogsByUserId(userId));
    }

    @GetMapping("/GoalLogs/{id}")
    public ResponseEntity<GoalLogDto> getAllGoalLogsByUserId(@PathVariable("id") int userId,
         @RequestParam("currentDate") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate currentDate){
        return ResponseEntity.status(HttpStatus.OK).body(userDashboardService.getAllGoalLogsByUserId(userId,currentDate));
    }

    @GetMapping("/userDetails")
    public ResponseEntity<List<UserDetailsDto>> getUserDetails(){
        return ResponseEntity.status(HttpStatus.OK).body(userDashboardService.getUserDetails());
    }

}
