package com.healthpartner.fitness.service;


import com.healthpartner.fitness.dto.FitnessLogDto;
import com.healthpartner.fitness.dto.CaloriesDto;
import com.healthpartner.fitness.exceptions.FitnessLogNotFoundException;
import com.healthpartner.fitness.exceptions.UserNotFoundException;
import com.healthpartner.fitness.fiegn.UserFeignClient;
import com.healthpartner.fitness.mapper.Conversions;
import com.healthpartner.fitness.model.FitnessLog;
import com.healthpartner.fitness.repository.FitnessLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;


@Service
public class FitnessLogServiceImpl implements FitnessLogService{

    @Autowired
    FitnessLogRepository fitnessLogRepo;

    @Autowired
    UserFeignClient userFeignClient;


    @Override
    public FitnessLogDto saveFitnessLog(FitnessLogDto fitnessLogDto, int userId) {
        if(userFeignClient.getUserStatus(userId)) {
            FitnessLog fitnessLog = Conversions.FitnessLogDtoToFitnessLog(fitnessLogDto);
            fitnessLog.setUserId(userId);
            fitnessLog = fitnessLogRepo.save(fitnessLog);
            return Conversions.FitnessLogToFitnessLogDto(fitnessLog);
        } else
            throw new UserNotFoundException("Users with id "+userId+" not found");

    }

    @Override
    public FitnessLogDto getFitnessLogById(int logId) {
        FitnessLog savedfitnessLog = fitnessLogRepo.findById(logId).orElseThrow(()->new FitnessLogNotFoundException("FitnessLog with id "+logId+" not found"));
        return Conversions.FitnessLogToFitnessLogDto(savedfitnessLog);
    }

    @Override
    public FitnessLogDto updateFitnessLog(int logId, FitnessLogDto fitnessLogDto, int userId) {
        FitnessLog savedFitnessLog = fitnessLogRepo.findById(logId).orElseThrow(()->new FitnessLogNotFoundException("FitnessLog with id "+logId+" not found"));

        if(!userFeignClient.getUserStatus(userId) || savedFitnessLog.getUserId()!=userId){
            throw new UserNotFoundException("Users with id "+userId+" not found or access denied");
        }

        if (fitnessLogDto.workoutType() != null) {
            savedFitnessLog.setWorkoutType(fitnessLogDto.workoutType());
        }
        if (fitnessLogDto.duration() > 0) {
            savedFitnessLog.setDuration(fitnessLogDto.duration());
        }
        if (fitnessLogDto.workoutIntensity() != null) {
            savedFitnessLog.setWorkoutIntensity(fitnessLogDto.workoutIntensity());
        }
        if (fitnessLogDto.caloriesBurned() > 0) {
            savedFitnessLog.setCaloriesBurned(fitnessLogDto.caloriesBurned());
        }
        if (fitnessLogDto.updatedAt() != null) {
            savedFitnessLog.setUpdatedAt(fitnessLogDto.updatedAt());
        }
        savedFitnessLog.setNotes(fitnessLogDto.notes());

        return Conversions.FitnessLogToFitnessLogDto(fitnessLogRepo.save(savedFitnessLog));
    }

    @Override
    public void deleteFitnessLog(int logId,int userId) {
        FitnessLog savedFitnesslog = fitnessLogRepo.findById(logId).orElseThrow(()->new FitnessLogNotFoundException("FitnessLog with id "+logId+" not found"));
        if(userFeignClient.getUserStatus(userId) && savedFitnesslog.getUserId()==userId)
              fitnessLogRepo.deleteById(logId);
        else
            throw new UserNotFoundException("Users with id "+userId+" not found or access denied");
    }

    @Override
    public List<FitnessLog> getAllFitnessLogs() {
        return fitnessLogRepo.findAll();
    }

    @Override
    public List<FitnessLog> getAllFitnessLogsByUserId(int userId) {
          if(userFeignClient.getUserStatus(userId))
             return fitnessLogRepo.findAllByUserId(userId).stream().toList();
          else
              throw new UserNotFoundException("Users with id "+userId+" not found");
    }

    @Override
    @Transactional
    public void deleteAllFitnessLogByUserId(int userId) {
        if(userFeignClient.getUserStatus(userId))
            fitnessLogRepo.deleteAllByUserId(userId);
        else
            throw new UserNotFoundException("Users with id "+userId+" not found");
    }

    @Override
    public List<FitnessLog> getFilterdLogsByFitness(int userId,LocalDate startDate, LocalDate endDate) {
        if(userFeignClient.getUserStatus(userId)) {
            return fitnessLogRepo.getFilteredLogsByFitness(userId,startDate, endDate);
        }
        else
            throw new UserNotFoundException("Users with id "+userId+" not found");
    }


    @Override
    public List<CaloriesDto> getWeeklyCaloriesReportForMonth(int userId, LocalDate startDate, LocalDate endDate) {
        if(userFeignClient.getUserStatus(userId)) {
        return fitnessLogRepo.getWeeklyCaloriesReportForMonth(userId, startDate, endDate);
        }
        else
            throw new UserNotFoundException("Users with id "+userId+" not found");
    }

    @Override
    public List<CaloriesDto> getMonthlyCaloriesReportForYear(int userId, LocalDate startDate, LocalDate endDate) {
        if(userFeignClient.getUserStatus(userId)) {
          return fitnessLogRepo.getMonthlyCaloriesReportForYear(userId, startDate, endDate);
        }
        else
            throw new UserNotFoundException("Users with id "+userId+" not found");
    }

    //leaderboard

    @Override
    public Double getCaloriesForDay(int userId, LocalDate day) {
        if(userFeignClient.getUserStatus(userId)) {
            return fitnessLogRepo.getTotalCaloriesBurnedByDate(userId, day);
        }
        else
            throw new UserNotFoundException("Users with id "+userId+" not found");
    }

    @Override
    public Double getMaxCalorieBurnedForDay(LocalDate day) {
        return fitnessLogRepo.getMaxCaloriesBurnedByDate(day);
    }

}
