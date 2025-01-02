package com.healthpartner.diets.service;


import com.healthpartner.diets.dto.DietLogDto;
import com.healthpartner.diets.dto.MicroDto;
import com.healthpartner.diets.exceptions.DietLogNotFoundException;
import com.healthpartner.diets.exceptions.UserNotFoundException;
import com.healthpartner.diets.fiegn.UserFeignClient;
import com.healthpartner.diets.mapper.Conversions;
import com.healthpartner.diets.model.DietLog;
import com.healthpartner.diets.repository.DietLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;


@Service
public class DietLogServiceImpl implements DietLogService{
    
    @Autowired
    DietLogRepository dietLogRepo;

    @Autowired
    UserFeignClient userFeignClient;


    @Override
    public DietLogDto saveDietLog(DietLogDto dietLogDto, int userId) {
        if(userFeignClient.getUserStatus(userId))
        { DietLog dietLog= Conversions.DietLogDtoToDietLog(dietLogDto);
          dietLog.setUserId(userId);
          dietLog= dietLogRepo.save(dietLog);
           return Conversions.DietLogToDietLogDto(dietLog);
        }
         else
             throw new UserNotFoundException("Users with id "+userId+" not found or access denied");


}

    @Override
    public DietLogDto getDietLogById(int logId) {
        DietLog savedDietLog = dietLogRepo.findById(logId).orElseThrow(()->new DietLogNotFoundException("DietLog with id "+logId+" not found"));
        return Conversions.DietLogToDietLogDto(savedDietLog);
    }

    @Override
    public DietLogDto updateDietLog(int logId,DietLogDto dietLogDto,int userId) {
        DietLog savedDietLog = dietLogRepo.findById(logId).orElseThrow(()->new DietLogNotFoundException("DietLog with id "+logId+" not found"));

        if(!userFeignClient.getUserStatus(userId) || savedDietLog.getUserId()!=userId){
            throw new UserNotFoundException("Users with id "+userId+" not found or access denied");
        }

        if (dietLogDto.getFoodItems() != null) {
            savedDietLog.setFoodItems(dietLogDto.getFoodItems());
        }

        if (dietLogDto.getMealType()!= null) {
            savedDietLog.setMealType(dietLogDto.getMealType());
        }

        if (dietLogDto.getProtein() > 0) {
            savedDietLog.setProtein(dietLogDto.getProtein());
        }

        if (dietLogDto.getCarbs() > 0) {
            savedDietLog.setCarbs(dietLogDto.getCarbs());
        }

        if (dietLogDto.getFat() > 0) {
            savedDietLog.setFat(dietLogDto.getFat());
        }

        if (dietLogDto.getCaloriesConsumed() > 0) {
            savedDietLog.setCaloriesConsumed(dietLogDto.getCaloriesConsumed()); //api
        }

        if (dietLogDto.getUpdatedAt() != null) {
            savedDietLog.setUpdatedAt(dietLogDto.getUpdatedAt());
        }

        savedDietLog.setNotes(dietLogDto.getNotes());

        return Conversions.DietLogToDietLogDto(dietLogRepo.save(savedDietLog));
    }

    @Override
    public void deleteDietLog(int logId,int userId) {
        DietLog savedDietLog = dietLogRepo.findById(logId).orElseThrow(()->new DietLogNotFoundException("DietLog with id "+logId+" not found"));
        if(userFeignClient.getUserStatus(userId) && savedDietLog.getUserId()==userId)
            dietLogRepo.deleteById(logId);
        else
            throw new UserNotFoundException("Users with id "+userId+" not found or access denied");
    }

    @Override
    public List<DietLog> getAllDietLogs() {
        return dietLogRepo.findAll();
    }

    @Override
    public List<DietLog> getAllDietLogsByUserId(int userId) {
        if(userFeignClient.getUserStatus(userId))
            return dietLogRepo.findAllByUserId(userId).stream().toList();
        else
            throw new UserNotFoundException("Users with id "+userId+" not found");
    }

    @Override
    @Transactional
    public void deleteAllDietLogByUserId(int userId) {
        if(userFeignClient.getUserStatus(userId))
            dietLogRepo.deleteAllByUserId(userId);
        else
            throw new UserNotFoundException("Users with id "+userId+" not found");
    }

    @Override
    public List<DietLog> getFilterdLogsByDietLogs(int userId, LocalDate startDate, LocalDate endDate) {
        if(userFeignClient.getUserStatus(userId)) {
            return dietLogRepo.getFilteredLogsByDietLogs(userId,startDate, endDate);
        }
        else
            throw new UserNotFoundException("Users with id "+userId+" not found");
    }

    @Override
    public List<MicroDto> getWeeklyCaloriesReportForMonth(int userId, LocalDate startDate, LocalDate endDate) {
        if(userFeignClient.getUserStatus(userId)) {
            return dietLogRepo.getWeeklyNutritionReportForMonth(userId, startDate, endDate);
        }
        else
            throw new UserNotFoundException("Users with id "+userId+" not found");
    }

    @Override
    public List<MicroDto> getMonthlyCaloriesReportForYear(int userId, LocalDate startDate, LocalDate endDate) {
        if(userFeignClient.getUserStatus(userId)) {
            return dietLogRepo.getMonthlyNutritionReportForYear(userId, startDate, endDate);
        }
        else
            throw new UserNotFoundException("Users with id "+userId+" not found");
    }

    //leaderboard
    @Override
    public Double getTotalCaloriesConsumed(int userId, LocalDate day) {
        if(userFeignClient.getUserStatus(userId)) {
            return dietLogRepo.getTotalCaloriesConsumedByUserAndDate(userId, day);
        }
        else
            throw new UserNotFoundException("Users with id "+userId+" not found");
    }

    @Override
    public Double getMaxCalorieConsumption(LocalDate day) {
        return dietLogRepo.getMaxCaloriesConsumedByDate(day);
    }


}
