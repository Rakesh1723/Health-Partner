package com.healthpartner.diets.controller;

import com.healthpartner.diets.dto.DietLogDto;
import com.healthpartner.diets.dto.MicroDto;
import com.healthpartner.diets.model.DietLog;
import com.healthpartner.diets.service.DietLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;


@RestController
@RequestMapping("/api/v1/dietLogs")
//@CrossOrigin
public class DietLogController {

    @Autowired
    DietLogService dietLogService;

    @PostMapping("/users/{userId}")
    public ResponseEntity<DietLogDto> saveDietLog(@RequestBody DietLogDto dietLogDto, @PathVariable("userId") int userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(dietLogService.saveDietLog(dietLogDto,userId));
    }

    @GetMapping("/{logId}")
    public ResponseEntity<DietLogDto> getDietLogById(@PathVariable("logId") int logId) {
        return ResponseEntity.status(HttpStatus.OK).body(dietLogService.getDietLogById(logId));
    }

    @PutMapping("/users/{userId}/diet-logs/{logId}")
    public ResponseEntity<DietLogDto> updateDietLog(@PathVariable("logId") int logId, @RequestBody DietLogDto dietLogDto,@PathVariable("userId") int userId) {
        return ResponseEntity.status(HttpStatus.OK).body(dietLogService.updateDietLog(logId,dietLogDto,userId));
    }

    @DeleteMapping("/users/{userId}/diet-logs/{logId}")
    public ResponseEntity<Void> deleteDietLog(@PathVariable("logId") int logId,@PathVariable("userId") int userId) {
        dietLogService.deleteDietLog(logId,userId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping
    public ResponseEntity<List<DietLog>> getAllDietLogs() {
        return ResponseEntity.status(HttpStatus.OK).body(dietLogService.getAllDietLogs());
    }

    @GetMapping("/{userId}/diet-logs")
    public ResponseEntity<List<DietLog>> getAllDietLogsByUserId(@PathVariable("userId") int userId) {
        return ResponseEntity.status(HttpStatus.OK).body(dietLogService.getAllDietLogsByUserId(userId));
    }

    @DeleteMapping("/{userId}/delete-logs")
    public ResponseEntity<Void> deleteAllDietLogByUserId(@PathVariable("userId") int userId){
        dietLogService.deleteAllDietLogByUserId(userId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("search/DietLogs/{userId}")
    public ResponseEntity<List<DietLog>> getUserLogsByDateRange(
            @PathVariable int userId,
            @RequestParam("startDate") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate endDate) {

        return ResponseEntity.status(HttpStatus.OK).body(dietLogService.getFilterdLogsByDietLogs(userId, startDate, endDate));
    }

    @GetMapping("{userId}/DietLogs/weekly-report")
    public List<MicroDto> getWeeklyCaloriesReport(
            @PathVariable int userId,
            @RequestParam("startDate") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate endDate) {
        return dietLogService.getWeeklyCaloriesReportForMonth(userId, startDate, endDate);
    }

    @GetMapping("/{userId}/DietLogs/monthly-report")
    public List<MicroDto> getMonthlyCaloriesReport(
            @PathVariable int userId,
            @RequestParam("startDate") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate endDate) {

        return dietLogService.getMonthlyCaloriesReportForYear(userId, startDate, endDate);
    }

    // leaderboard
    @GetMapping("search/DietLogs/{userId}/day")
    public ResponseEntity<List<DietLog>> getUserLogsForDay(
            @PathVariable int userId,
            @RequestParam("day") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate day) {

        return ResponseEntity.status(HttpStatus.OK).body(dietLogService.getFilterdLogsByDietLogs(userId, day, day));
    }

    @GetMapping("search/CaloriesConsumed/{userId}/day")
    public ResponseEntity<Double> getUserCaloriesConsumedForDay(
            @PathVariable int userId,
            @RequestParam("day") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate day) {

        return ResponseEntity.status(HttpStatus.OK).body(dietLogService.getTotalCaloriesConsumed(userId,day));
    }

    @GetMapping("search/MaxCalorieConsumption/day")
    public ResponseEntity<Double> getMaxCalorieConsumptionForDay(
            @RequestParam("day") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate day) {

        return ResponseEntity.status(HttpStatus.OK).body(dietLogService.getMaxCalorieConsumption(day));
    }

}
