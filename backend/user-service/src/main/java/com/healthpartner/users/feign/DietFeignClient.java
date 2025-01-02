package com.healthpartner.users.feign;

import com.healthpartner.users.dto.DietLogDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;
import java.util.List;

@FeignClient("DIET-SERVICE")
public interface DietFeignClient {

    @GetMapping("/api/v1/dietLogs/{userId}/diet-logs")
    List<DietLogDto> getAllDietLogsByUserId(@PathVariable("userId") int userId);

    @DeleteMapping("/api/v1/dietLogs/{userId}/delete-logs")
    void deleteAllDietLogsByUserId(@PathVariable("userId") int userId);

    //leaderboard
    @GetMapping("/api/v1/dietLogs/search/CaloriesConsumed/{userId}/day")
    ResponseEntity<Double> getUserCaloriesConsumedForDay(
            @PathVariable int userId,
            @RequestParam("day") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate day);

    @GetMapping("/api/v1/dietLogs/search/MaxCalorieConsumption/day")
    ResponseEntity<Double> getMaxCalorieConsumptionForDay(
            @RequestParam("day") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate day);

}
