package com.healthpartner.fitness.repository;

import com.healthpartner.fitness.dto.CaloriesDto;
import com.healthpartner.fitness.model.FitnessLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

public interface FitnessLogRepository extends JpaRepository<FitnessLog,Integer> {

    List<FitnessLog> findAllByUserId(int userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM FitnessLog f WHERE f.userId = :userId")
    void deleteAllByUserId(@Param("userId") int userId);

    @Query("SELECT f FROM FitnessLog f WHERE f.userId = :userId " +
            "AND f.createdAt BETWEEN :startDate AND :endDate")
    List<FitnessLog> getFilteredLogsByFitness(
            @Param("userId") int userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);


    @Query("SELECT new com.healthpartner.fitness.dto.CaloriesDto(" +
            "EXTRACT(WEEK FROM f.createdAt), SUM(f.caloriesBurned)) " +
            "FROM FitnessLog f " +
            "WHERE f.userId = :userId " +
            "AND f.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY EXTRACT(WEEK FROM f.createdAt) " +
            "ORDER BY EXTRACT(WEEK FROM f.createdAt)")
    List<CaloriesDto> getWeeklyCaloriesReportForMonth(
            @Param("userId") int userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT new com.healthpartner.fitness.dto.CaloriesDto(" +
            "EXTRACT(MONTH FROM f.createdAt), SUM(f.caloriesBurned)) " +
            "FROM FitnessLog f " +
            "WHERE f.userId = :userId " +
            "AND f.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY EXTRACT(MONTH FROM f.createdAt) " +
            "ORDER BY EXTRACT(MONTH FROM f.createdAt)")
    List<CaloriesDto> getMonthlyCaloriesReportForYear(
            @Param("userId") int userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    //leaderboard
    @Query("SELECT SUM(f.caloriesBurned) FROM FitnessLog f WHERE f.userId = :userId AND f.createdAt = :date")
    Double getTotalCaloriesBurnedByDate(
            @Param("userId") int userId,
            @Param("date") LocalDate date);

    @Query("SELECT MAX(f.caloriesBurned) FROM FitnessLog f WHERE f.createdAt = :date")
    Double getMaxCaloriesBurnedByDate(@Param("date") LocalDate date);


}
