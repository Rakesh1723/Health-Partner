package com.healthpartner.goal.service;


import com.healthpartner.goal.dto.GoalLogDto;

import java.util.List;

public interface GoalLogService {

    GoalLogDto saveGoalLog(GoalLogDto goalLogDto, int userId);
    GoalLogDto getGoalLogById(int logId);
    GoalLogDto updateGoalLog(GoalLogDto goalLogDto,int userId);
    void deleteGoalLog(int id,int userId);
    List<GoalLogDto> getAllGoalLogs();
    GoalLogDto getAllGoalLogsByUserId(int userId);
    void deleteAllGoalLogByUserId(int userId);

}
