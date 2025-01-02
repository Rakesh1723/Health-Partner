package com.healthpartner.goal.service;


import com.healthpartner.goal.dto.GoalLogDto;
import com.healthpartner.goal.exception.GoalLogNotFoundException;
import com.healthpartner.goal.exception.UserNotFoundException;
import com.healthpartner.goal.fiegn.UserFeignClient;
import com.healthpartner.goal.mapper.Conversions;
import com.healthpartner.goal.model.GoalLog;
import com.healthpartner.goal.repository.GoalLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
public class GoalLogServiceImpl implements GoalLogService{
    
    @Autowired
    GoalLogRepository goalLogRepo;

    @Autowired
    UserFeignClient userFeignClient;


    @Override
    public GoalLogDto saveGoalLog(GoalLogDto goalLogDto, int userId) {
        if(userFeignClient.getUserStatus(userId))
        { GoalLog goalLog= Conversions.GoalLogDtoToGoalLog(goalLogDto);
          goalLog.setUserId(userId);
          goalLog= goalLogRepo.save(goalLog);
           return Conversions.GoalLogToGoalLogDto(goalLog);
        }
         else
             throw new UserNotFoundException("Users with id "+userId+" not found or access denied");
}

    @Override
    public GoalLogDto getGoalLogById(int logId) {
        GoalLog savedGoalLog = goalLogRepo.findById(logId).orElseThrow(()->new GoalLogNotFoundException("GoalLog with id "+logId+" not found"));
        return Conversions.GoalLogToGoalLogDto(savedGoalLog);
    }

    @Override
    public GoalLogDto updateGoalLog(GoalLogDto goalLogDto,int userId) {

       if(!userFeignClient.getUserStatus(userId))
            throw new UserNotFoundException("Users with id "+userId+" not found");

         GoalLog savedGoalLog = goalLogRepo.findByUserId(userId).orElse(null);
         if(savedGoalLog==null) {
             savedGoalLog=Conversions.GoalLogDtoToGoalLog(goalLogDto);
             savedGoalLog.setUserId(userId);
             return Conversions.GoalLogToGoalLogDto(goalLogRepo.save(savedGoalLog));
         }
         savedGoalLog.setGoalType(goalLogDto.getGoalType());
         savedGoalLog.setDescription(goalLogDto.getDescription());
         savedGoalLog.setCurrentWeight(goalLogDto.getCurrentWeight());
         savedGoalLog.setTargetWeight(goalLogDto.getTargetWeight());
         savedGoalLog.setStartDate(goalLogDto.getStartDate());
         savedGoalLog.setTargetEndDate(goalLogDto.getTargetEndDate());
        return Conversions.GoalLogToGoalLogDto(goalLogRepo.save(savedGoalLog));
    }

    @Override
    public void deleteGoalLog(int logId,int userId) {
        GoalLog savedGoalLog = goalLogRepo.findById(logId).orElseThrow(()->new GoalLogNotFoundException("GoalLog with id "+logId+" not found"));
        if(userFeignClient.getUserStatus(userId) && savedGoalLog.getUserId()==userId)
            goalLogRepo.deleteById(logId);
        else
            throw new UserNotFoundException("Users with id "+userId+" not found or access denied");
    }

    @Override
    public List<GoalLogDto> getAllGoalLogs() {
        return goalLogRepo.findAll().stream().map(Conversions::GoalLogToGoalLogDto).toList();
    }

    @Override
    public GoalLogDto getAllGoalLogsByUserId(int userId) {
        if(userFeignClient.getUserStatus(userId)) {
            GoalLog goal = goalLogRepo.findByUserId(userId).orElseThrow(() -> new GoalLogNotFoundException("Set up Goal to proceed with this feature"));
            return Conversions.GoalLogToGoalLogDto(goal);
        }
        else
            throw new UserNotFoundException("Users with id "+userId+" not found");
    }

    @Override
    @Transactional
    public void deleteAllGoalLogByUserId(int userId) {
        if(userFeignClient.getUserStatus(userId))
             goalLogRepo.deleteAllByUserId(userId);
        else
            throw new UserNotFoundException("Users with id "+userId+" not found");
    }

}
