package com.healthpartner.users.service;

import com.healthpartner.users.dto.UserNameScoreDto;
import com.healthpartner.users.model.Score;

import java.time.LocalDate;
import java.util.List;

public interface ScoreService {

    Score createScore(int userId, LocalDate date);
    List<Score> getAllScore();
    List<UserNameScoreDto> getUserNameAndScoreForDay(LocalDate day);
    List<UserNameScoreDto> getAllTimeUserNameAndScore(LocalDate day);
}
