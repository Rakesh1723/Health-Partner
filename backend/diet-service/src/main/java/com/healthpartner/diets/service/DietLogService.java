package com.healthpartner.diets.service;


import com.healthpartner.diets.dto.DietLogDto;
import com.healthpartner.diets.dto.MicroDto;
import com.healthpartner.diets.model.DietLog;

import java.time.LocalDate;
import java.util.List;

public interface DietLogService {

    DietLogDto saveDietLog(DietLogDto DietLogDto, int userId);
    DietLogDto getDietLogById(int logId);
    DietLogDto updateDietLog(int id,DietLogDto DietLogDto,int userId);
    void deleteDietLog(int id,int userId);
    List<DietLog> getAllDietLogs();
    List<DietLog> getAllDietLogsByUserId(int userId);
    void deleteAllDietLogByUserId(int userId);
    List<DietLog> getFilterdLogsByDietLogs(int userId, LocalDate startDate, LocalDate endDate);
    List<MicroDto> getWeeklyCaloriesReportForMonth(int userId, LocalDate startDate, LocalDate endDate);
    List<MicroDto> getMonthlyCaloriesReportForYear(int userId, LocalDate startDate, LocalDate endDate);
    Double getTotalCaloriesConsumed(int userId, LocalDate day);
    Double getMaxCalorieConsumption(LocalDate day);
}
