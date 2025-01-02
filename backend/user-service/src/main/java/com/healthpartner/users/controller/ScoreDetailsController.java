package com.healthpartner.users.controller;

import com.healthpartner.users.dto.UserNameScoreDto;
import com.healthpartner.users.model.Score;
import com.healthpartner.users.service.ScoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/users/score")
//@CrossOrigin
public class ScoreDetailsController {

    @Autowired
    private ScoreService scoreService;

    @PostMapping("/create/{userId}")
    public ResponseEntity<Score> createUserScoreForDay(
            @PathVariable int userId,
            @RequestParam("day") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate day){
        return ResponseEntity.ok(scoreService.createScore(userId,day));
    }

    @GetMapping
    public ResponseEntity<List<Score>> getAllScore(){
        return ResponseEntity.ok(scoreService.getAllScore());
    }

    @GetMapping("/list/day")
    public ResponseEntity<List<UserNameScoreDto>> getScoreList(
            @RequestParam("day") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate day){
        return ResponseEntity.status(HttpStatus.OK).body(scoreService.getUserNameAndScoreForDay(day));
    }

    @GetMapping("/allTime")
    public ResponseEntity<List<UserNameScoreDto>> getAllTimeScoreList(
            @RequestParam("day") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate day){
        return ResponseEntity.status(HttpStatus.OK).body(scoreService.getAllTimeUserNameAndScore(day));
    }


}
