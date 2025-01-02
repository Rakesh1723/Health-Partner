package com.healthpartner.fitness.service;

import com.healthpartner.fitness.dto.FitnessLogDto;
import com.healthpartner.fitness.dto.CaloriesDto;
import com.healthpartner.fitness.model.FitnessLog;

import java.time.LocalDate;
import java.util.List;

public interface FitnessLogService {

    FitnessLogDto saveFitnessLog(FitnessLogDto fitnessLogDto, int userId);
    FitnessLogDto getFitnessLogById(int logId);
    FitnessLogDto updateFitnessLog(int id, FitnessLogDto fitnessLogDto, int userId);
    void deleteFitnessLog(int id,int userId);
    List<FitnessLog> getAllFitnessLogs();
    List<FitnessLog> getAllFitnessLogsByUserId(int userId);
    void deleteAllFitnessLogByUserId(int userId);
    List<FitnessLog> getFilterdLogsByFitness(int userId,LocalDate startDate, LocalDate endDate);
    List<CaloriesDto> getWeeklyCaloriesReportForMonth(int userId, LocalDate startDate, LocalDate endDate);
    List<CaloriesDto> getMonthlyCaloriesReportForYear(int userId, LocalDate startDate, LocalDate endDate);
    //leaderboard
    Double getCaloriesForDay(int userId, LocalDate day);
    Double getMaxCalorieBurnedForDay(LocalDate day);
}
