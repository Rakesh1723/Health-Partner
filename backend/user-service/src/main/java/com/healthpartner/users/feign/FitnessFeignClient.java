package com.healthpartner.users.feign;

import com.healthpartner.users.dto.FitnessLogDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;
import java.util.List;


@FeignClient("FITNESS-SERVICE")
public interface FitnessFeignClient {

    @GetMapping("/api/v1/fitnessLogs/{userId}/fitness-logs")
    List<FitnessLogDto> getAllFitnessLogsByUserId(@PathVariable("userId") int userId);

    @DeleteMapping("/api/v1/fitnessLogs/{userId}/delete-logs")
    void deleteAllFitnessLogByUserId(@PathVariable("userId") int userId);

    //leaderboard
    //if return value is null => no fitness entry present for that day
    @GetMapping("/api/v1/fitnessLogs/calories/{userId}/day")
    ResponseEntity<Double> getUserCaloriesForDay(
            @PathVariable int userId,
            @RequestParam("day") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate day);

    //if return value is null => no fitness entry present for that day
    @GetMapping("/api/v1/fitnessLogs/calories/day")
    public ResponseEntity<Double> getMaxCaloriesForDay(
            @RequestParam("day") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate day);

}
