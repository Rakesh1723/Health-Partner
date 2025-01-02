package com.healthpartner.wellness.service;


import com.healthpartner.wellness.dto.SleepDto;
import com.healthpartner.wellness.dto.WellnessLogDto;
import com.healthpartner.wellness.model.WellnessLog;

import java.time.LocalDate;
import java.util.List;

public interface WellnessLogService {

    WellnessLogDto saveWellnessLog(WellnessLogDto wellnessLogDto, int userId);
    WellnessLogDto getWellnessLogById(int logId);
    WellnessLogDto updateWellnessLog(int id,WellnessLogDto WellnessLogDto,int userId);
    void deleteWellnessLog(int id,int userId);
    List<WellnessLog> getAllWellnessLogs();
    List<WellnessLog> getAllWellnessLogsByUserId(int userId);
    void deleteAllWellnessLogByUserId(int userId);
    List<WellnessLog> getFilterdLogsByWellness(int userId, LocalDate startDate, LocalDate endDate);
    List<SleepDto> getWeeklySleepReportForMonth(int userId, LocalDate startDate, LocalDate endDate);
    List<SleepDto> getMonthlySleepReportForYear(int userId, LocalDate startDate, LocalDate endDate);
    // leaderboard
    Double getTotalHydration(int userId, LocalDate day);
    Double getTotalSleepDuration(int userId, LocalDate day);
}
