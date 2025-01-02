package com.healthpartner.fitness.controller;


import com.healthpartner.fitness.dto.FitnessLogDto;
import com.healthpartner.fitness.dto.CaloriesDto;
import com.healthpartner.fitness.model.FitnessLog;
import com.healthpartner.fitness.service.FitnessLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;


@RestController
@RequestMapping("/api/v1/fitnessLogs")
//@CrossOrigin
public class FitnessLogController {

    @Autowired
    FitnessLogService fitnessLogService;

    @PostMapping("/users/{userId}")
    public ResponseEntity<FitnessLogDto> saveFitnessLog(@RequestBody FitnessLogDto fitnessLogDto, @PathVariable("userId") int userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(fitnessLogService.saveFitnessLog(fitnessLogDto,userId));
    }

    @GetMapping("/{logId}")
    public ResponseEntity<FitnessLogDto> getFitnessLogById(@PathVariable("logId") int logId) {
        return ResponseEntity.status(HttpStatus.OK).body(fitnessLogService.getFitnessLogById(logId));
    }

    @PutMapping("/users/{userId}/fitness-logs/{logId}")
    public ResponseEntity<FitnessLogDto> updateFitnessLog(@PathVariable("logId") int logId, @RequestBody FitnessLogDto fitnessLogDto, @PathVariable("userId") int userId) {
        return ResponseEntity.status(HttpStatus.OK).body(fitnessLogService.updateFitnessLog(logId,fitnessLogDto,userId));
    }

    @DeleteMapping("/users/{userId}/fitness-logs/{logId}")
    public ResponseEntity<Void> deleteFitnessLog(@PathVariable("logId") int logId,@PathVariable("userId") int userId) {
        fitnessLogService.deleteFitnessLog(logId,userId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping
    public ResponseEntity<List<FitnessLog>> getAllFitnessLogs() {
        return ResponseEntity.status(HttpStatus.OK).body(fitnessLogService.getAllFitnessLogs());
    }

    @GetMapping("/{userId}/fitness-logs")
    public ResponseEntity<List<FitnessLog>> getAllFitnessLogsByUserId(@PathVariable("userId") int userId) {
        return ResponseEntity.status(HttpStatus.OK).body(fitnessLogService.getAllFitnessLogsByUserId(userId));
    }

    @DeleteMapping("/{userId}/delete-logs")
    public ResponseEntity<Void> deleteAllFitnessLogByUserId(@PathVariable("userId") int userId){
        fitnessLogService.deleteAllFitnessLogByUserId(userId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("search/fitnessLogs/{userId}/")
    public ResponseEntity<List<FitnessLog>> getUserLogsByDateRange(
            @PathVariable int userId,
            @RequestParam("startDate") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate endDate) {

        return ResponseEntity.status(HttpStatus.OK).body(fitnessLogService.getFilterdLogsByFitness(userId, startDate, endDate));
    }

    @GetMapping("{userId}/fitness/weekly-report")
    public List<CaloriesDto> getWeeklyCaloriesReport(
            @PathVariable int userId,
            @RequestParam("startDate") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate endDate) {
        return fitnessLogService.getWeeklyCaloriesReportForMonth(userId, startDate, endDate);
    }

    @GetMapping("/{userId}/fitness/monthly-report")
    public List<CaloriesDto> getMonthlyCaloriesReport(
            @PathVariable int userId,
            @RequestParam("startDate") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate endDate) {

        return fitnessLogService.getMonthlyCaloriesReportForYear(userId, startDate, endDate);
    }

    // leaderboard
    @GetMapping("search/fitnessLogs/{userId}/day")
    public ResponseEntity<List<FitnessLog>> getUserLogsForDay(
            @PathVariable int userId,
            @RequestParam("day") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate day) {

        return ResponseEntity.status(HttpStatus.OK).body(fitnessLogService.getFilterdLogsByFitness(userId, day, day));
    }

    //if return value is null => no fitness entry present
    @GetMapping("calories/{userId}/day")
    public ResponseEntity<Double> getUserCaloriesForDay(
            @PathVariable int userId,
            @RequestParam("day") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate day) {
        return ResponseEntity.status(HttpStatus.OK).body(fitnessLogService.getCaloriesForDay(userId, day));
    }

    //if return value is null => no fitness entry present
    @GetMapping("calories/day")
    public ResponseEntity<Double> getMaxCaloriesForDay(
            @RequestParam("day") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate day) {
        return ResponseEntity.status(HttpStatus.OK).body(fitnessLogService.getMaxCalorieBurnedForDay(day));
    }


}
