package com.healthpartner.wellness.repository;

import com.healthpartner.wellness.dto.SleepDto;
import com.healthpartner.wellness.model.WellnessLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;


public interface WellnessLogRepository extends JpaRepository<WellnessLog,Integer> {
    List<WellnessLog> findAllByUserId(int userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM WellnessLog w WHERE w.userId = :userId")
    void deleteAllByUserId(@Param("userId") int userId);

    @Query("SELECT w FROM WellnessLog w WHERE w.userId = :userId " +
            "AND w.createdAt BETWEEN :startDate AND :endDate")
    List<WellnessLog> getFilteredLogsByWellness(
            @Param("userId") int userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);


    @Query("SELECT new com.healthpartner.wellness.dto.SleepDto(" +
            "EXTRACT(WEEK FROM w.createdAt), SUM(w.sleepDuration)) " +
            "FROM WellnessLog w " +
            "WHERE w.userId = :userId " +
            "AND w.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY EXTRACT(WEEK FROM w.createdAt) " +
            "ORDER BY EXTRACT(WEEK FROM w.createdAt)")
    List<SleepDto> getWeeklySleepReportForMonth(
            @Param("userId") int userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT new com.healthpartner.wellness.dto.SleepDto(" +
            "EXTRACT(MONTH FROM w.createdAt), SUM(w.sleepDuration)) " +
            "FROM WellnessLog w " +
            "WHERE w.userId = :userId " +
            "AND w.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY EXTRACT(MONTH FROM w.createdAt) " +
            "ORDER BY EXTRACT(MONTH FROM w.createdAt)")
    List<SleepDto> getMonthlySleepReportForYear(
            @Param("userId") int userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // leaderboard

    @Query("SELECT SUM(w.hydration) FROM WellnessLog w WHERE w.userId = :userId AND w.createdAt = :date")
    Double getTotalHydrationByUserAndDate(
            @Param("userId") int userId,
            @Param("date") LocalDate date);

    @Query("SELECT SUM(w.sleepDuration) FROM WellnessLog w WHERE w.userId = :userId AND w.createdAt = :date")
    Double getTotalSleepDurationByUserAndDate(
            @Param("userId") int userId,
            @Param("date") LocalDate date);


}

