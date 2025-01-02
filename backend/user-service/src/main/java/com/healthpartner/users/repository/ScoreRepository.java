package com.healthpartner.users.repository;

import com.healthpartner.users.model.Score;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ScoreRepository extends JpaRepository<Score,Integer> {

//    Score findByUserId(int userId);

    @Query("SELECT s FROM Score s WHERE s.userId = :userId AND s.day = :day")
    Score findScoreByUserIdAndDay(@Param("userId") int userId, @Param("day") LocalDate day);

    @Query("SELECT s.userId, s.overallScore FROM Score s WHERE s.day = :day ORDER BY s.overallScore DESC")
    List<Object[]> findUserIdsAndOverallScoresByDaySorted(@Param("day") LocalDate day);

    @Query("""
    SELECT s.userId, AVG(s.overallScore) AS avgScore 
    FROM Score s 
    GROUP BY s.userId 
    ORDER BY avgScore DESC
    """)
    List<Object[]> findUserIdsAndAverageScoresSorted();

}
