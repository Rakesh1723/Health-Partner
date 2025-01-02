package com.healthpartner.goal.controller;

import com.healthpartner.goal.dto.GoalLogDto;
import com.healthpartner.goal.model.FWDGoalLog;
import com.healthpartner.goal.service.FWDGoalLogService;
import com.healthpartner.goal.service.GoalLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/v1/goalLogs")
//@CrossOrigin
public class GoalLogController {

    @Autowired
    GoalLogService goalLogService;

    @Autowired
    FWDGoalLogService fwdGoalLogService;

    @PostMapping("/users/{userId}")
    public ResponseEntity<GoalLogDto> saveGoalLog(@RequestBody GoalLogDto goalLogDto, @PathVariable("userId") int userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(goalLogService.saveGoalLog(goalLogDto,userId));
    }


    @GetMapping("/{logId}")
    public ResponseEntity<GoalLogDto> getGoalLogById(@PathVariable("logId") int logId) {
        return ResponseEntity.status(HttpStatus.OK).body(goalLogService.getGoalLogById(logId));
    }

    @PutMapping("/users/{userId}/Goal-logs")
    public ResponseEntity<GoalLogDto> updateGoalLog(@RequestBody GoalLogDto goalLogDto,@PathVariable("userId") int userId) {
        return ResponseEntity.status(HttpStatus.OK).body(goalLogService.updateGoalLog(goalLogDto,userId));
    }

    @DeleteMapping("/users/{userId}/Goal-logs/{logId}")
    public ResponseEntity<Void> deleteGoalLog(@PathVariable("logId") int logId,@PathVariable("userId") int userId) {
        goalLogService.deleteGoalLog(logId,userId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping
    public ResponseEntity<List<GoalLogDto>> getAllGoalLogs() {
        return ResponseEntity.status(HttpStatus.OK).body(goalLogService.getAllGoalLogs());
    }

    @GetMapping("/{userId}/Goal-logs")
    public ResponseEntity<GoalLogDto> getAllGoalLogsByUserId(@PathVariable("userId") int userId) {
        return ResponseEntity.status(HttpStatus.OK).body(goalLogService.getAllGoalLogsByUserId(userId));
    }

    @DeleteMapping("/{userId}/delete-logs")
    public ResponseEntity<Void> deleteAllGoalLogByUserId(@PathVariable("userId") int userId){
        goalLogService.deleteAllGoalLogByUserId(userId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    /* FWD GoalLog Controller */

    @GetMapping("/FWD/{userId}")
    public ResponseEntity<FWDGoalLog> getFWDGoalLogs(@PathVariable("userId") int userId){
        return ResponseEntity.status(HttpStatus.OK).body(fwdGoalLogService.getGoalLog(userId));
    }

    @PutMapping("/FWD/{userId}")
    public ResponseEntity<FWDGoalLog> updateFWDGoalLogs(@PathVariable("userId") int userId, @RequestBody FWDGoalLog goalLog){
        return ResponseEntity.status(HttpStatus.OK).body(fwdGoalLogService.updateGoalLog(userId,goalLog));
    }


}
