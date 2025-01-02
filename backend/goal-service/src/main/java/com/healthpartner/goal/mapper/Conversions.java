package com.healthpartner.goal.mapper;


import com.healthpartner.goal.dto.GoalLogDto;
import com.healthpartner.goal.model.GoalLog;

public class Conversions {

    public static GoalLog GoalLogDtoToGoalLog(GoalLogDto goalLogDto){
        return new GoalLog(goalLogDto.getId(),
                goalLogDto.getUserId(),
                goalLogDto.getGoalType(),
                goalLogDto.getDescription(),
                goalLogDto.getCurrentWeight(),
                goalLogDto.getTargetWeight(),
                goalLogDto.getStartDate(),
                goalLogDto.getTargetEndDate()
        );
    }

    public static GoalLogDto GoalLogToGoalLogDto(GoalLog goalLog){
        return new GoalLogDto(
                goalLog.getId(),
                goalLog.getUserId(),
                goalLog.getGoalType(),
                goalLog.getDescription(),
                goalLog.getCurrentWeight(),
                goalLog.getTargetWeight(),
                goalLog.getStartDate(),
                goalLog.getTargetEndDate(),
               0.0,
                null
        );
    }
}
