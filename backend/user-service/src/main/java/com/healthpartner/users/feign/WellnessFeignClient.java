package com.healthpartner.users.feign;

import com.healthpartner.users.dto.WellnessLogDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;
import java.util.List;

@FeignClient("WELLNESS-SERVICE")
public interface WellnessFeignClient {

    @GetMapping("/api/v1/wellnessLogs/{userId}/Wellness-logs")
    List<WellnessLogDto> getAllWellnessLogsByUserId(@PathVariable("userId") int userId);

    @DeleteMapping("/api/v1/wellnessLogs/{userId}/delete-logs")
    void deleteAllWellnessLogsByUserId(@PathVariable("userId") int userId);

    // leaderboard
    @GetMapping("/api/v1/wellnessLogs/hydration/{userId}/day")
    public ResponseEntity<Double> getHydrationForDay(
            @PathVariable int userId,
            @RequestParam("day") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate day);

    @GetMapping("/api/v1/wellnessLogs/sleepDuration/{userId}/day")
    public ResponseEntity<Double> getSleepDurationForDay(
            @PathVariable int userId,
            @RequestParam("day") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate day);

}
