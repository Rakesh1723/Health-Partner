package com.healthpartner.diets.repository;

import com.healthpartner.diets.dto.CaloriesDto;
import com.healthpartner.diets.dto.MicroDto;
import com.healthpartner.diets.model.DietLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;


public interface DietLogRepository extends JpaRepository<DietLog,Integer> {
    
    List<DietLog> findAllByUserId(int userId);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM DietLog d WHERE d.userId = :userId")
    void deleteAllByUserId(@Param("userId") int userId);

    @Query("SELECT d FROM DietLog d WHERE d.userId = :userId " +
            "AND d.createdAt BETWEEN :startDate AND :endDate")
    List<DietLog> getFilteredLogsByDietLogs(
            @Param("userId") int userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT new com.healthpartner.diets.dto.MicroDto(" +
            "EXTRACT(WEEK FROM f.createdAt), " +
            "SUM(f.caloriesConsumed), " +
            "SUM(f.protein), " +
            "SUM(f.carbs), " +
            "SUM(f.fat)) " +
            "FROM DietLog f " +
            "WHERE f.userId = :userId " +
            "AND f.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY EXTRACT(WEEK FROM f.createdAt) " +
            "ORDER BY EXTRACT(WEEK FROM f.createdAt)")
    List<MicroDto> getWeeklyNutritionReportForMonth(
            @Param("userId") int userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT new com.healthpartner.diets.dto.MicroDto(" +
            "EXTRACT(MONTH FROM f.createdAt), " +
            "SUM(f.caloriesConsumed), " +
            "SUM(f.protein), " +
            "SUM(f.carbs), " +
            "SUM(f.fat)) " +
            "FROM DietLog f " +
            "WHERE f.userId = :userId " +
            "AND f.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY EXTRACT(MONTH FROM f.createdAt) " +
            "ORDER BY EXTRACT(MONTH FROM f.createdAt)")
    List<MicroDto> getMonthlyNutritionReportForYear(
            @Param("userId") int userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

     //leaderboard
     @Query("SELECT SUM(d.caloriesConsumed) FROM DietLog d WHERE d.userId = :userId AND d.createdAt = :date")
     Double getTotalCaloriesConsumedByUserAndDate(
             @Param("userId") int userId,
             @Param("date") LocalDate date);

    @Query("SELECT MAX(d.caloriesConsumed) FROM DietLog d WHERE d.createdAt = :date")
    Double getMaxCaloriesConsumedByDate(@Param("date") LocalDate date);



}