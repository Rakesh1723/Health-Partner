package com.healthpartner.wellness.controller;

import com.healthpartner.wellness.dto.SleepDto;
import com.healthpartner.wellness.dto.WellnessLogDto;
import com.healthpartner.wellness.model.WellnessLog;
import com.healthpartner.wellness.service.WellnessLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/wellnessLogs")
//@CrossOrigin
public class WellnessLogController {

    @Autowired
    WellnessLogService wellnessLogService;

    @PostMapping("/users/{userId}")
    public ResponseEntity<WellnessLogDto> saveWellnessLog(@RequestBody WellnessLogDto wellnessLogDto, @PathVariable("userId") int userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(wellnessLogService.saveWellnessLog(wellnessLogDto,userId));
    }

    @GetMapping("/{logId}")
    public ResponseEntity<WellnessLogDto> getWellnessLogById(@PathVariable("logId") int logId) {
        return ResponseEntity.status(HttpStatus.OK).body(wellnessLogService.getWellnessLogById(logId));
    }

    @PutMapping("/users/{userId}/wellness-logs/{logId}")
    public ResponseEntity<WellnessLogDto> updateWellnessLog(@PathVariable("logId") int logId, @RequestBody WellnessLogDto wellnessLogDto,@PathVariable("userId") int userId) {
        return ResponseEntity.status(HttpStatus.OK).body(wellnessLogService.updateWellnessLog(logId,wellnessLogDto,userId));
    }

    @DeleteMapping("/users/{userId}/wellness-logs/{logId}")
    public ResponseEntity<Void> deleteWellnessLog(@PathVariable("logId") int logId,@PathVariable("userId") int userId) {
       wellnessLogService.deleteWellnessLog(logId,userId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping
    public ResponseEntity<List<WellnessLog>> getAllWellnessLogs() {
        return ResponseEntity.status(HttpStatus.OK).body(wellnessLogService.getAllWellnessLogs());
    }

    @GetMapping("/{userId}/Wellness-logs")
    public ResponseEntity<List<WellnessLog>> getAllWellnessLogsByUserId(@PathVariable("userId") int userId) {
        return ResponseEntity.status(HttpStatus.OK).body(wellnessLogService.getAllWellnessLogsByUserId(userId));
    }

    @DeleteMapping("/{userId}/delete-logs")
    public ResponseEntity<Void> deleteAllWellnessLogByUserId(@PathVariable("userId") int userId){
       wellnessLogService.deleteAllWellnessLogByUserId(userId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("search/WellnessLogs/{userId}/")
    public ResponseEntity<List<WellnessLog>> getUserLogsByDateRange(
            @PathVariable int userId,
            @RequestParam("startDate") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate endDate) {

        return ResponseEntity.status(HttpStatus.OK).body(wellnessLogService.getFilterdLogsByWellness(userId, startDate, endDate));
    }

    @GetMapping("{userId}/WellnessLogs/weekly-report")
    public List<SleepDto> getWeeklySleepReport(
            @PathVariable int userId,
            @RequestParam("startDate") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate endDate) {
        return wellnessLogService.getWeeklySleepReportForMonth(userId, startDate, endDate);
    }

    @GetMapping("/{userId}/WellnessLogs/monthly-report")
    public List<SleepDto> getMonthlySleepReport(
            @PathVariable int userId,
            @RequestParam("startDate") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate endDate) {

        return wellnessLogService.getMonthlySleepReportForYear(userId, startDate, endDate);
    }

    // leaderboard

    @GetMapping("search/WellnessLogs/{userId}/day")
    public ResponseEntity<List<WellnessLog>> getUserLogsForDay(
            @PathVariable int userId,
            @RequestParam("day") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate day) {

        return ResponseEntity.status(HttpStatus.OK).body(wellnessLogService.getFilterdLogsByWellness(userId, day, day));
    }

    @GetMapping("hydration/{userId}/day")
    public ResponseEntity<Double> getHydrationForDay(
            @PathVariable int userId,
            @RequestParam("day") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate day) {

        return ResponseEntity.status(HttpStatus.OK).body(wellnessLogService.getTotalHydration(userId, day));
    }

    @GetMapping("sleepDuration/{userId}/day")
    public ResponseEntity<Double> getSleepDurationForDay(
            @PathVariable int userId,
            @RequestParam("day") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate day) {

        return ResponseEntity.status(HttpStatus.OK).body(wellnessLogService.getTotalSleepDuration(userId, day));
    }

}
